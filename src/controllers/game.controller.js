import crypto from "crypto";
import axios from "axios";
import accountModel from "../models/account.model.js";
import transactionLedgerModel from "../models/transactionLedger.model.js";

const {
  GAME_API_URL,
  PROVIDER_CODE,
  OPERATOR_CODE,
  SECRET_KEY,
} = process.env;

function ensureGameEnv() {
  if (!GAME_API_URL || !PROVIDER_CODE || !OPERATOR_CODE || !SECRET_KEY) {
    throw new Error(
      "Missing game provider env vars (GAME_API_URL, PROVIDER_CODE, OPERATOR_CODE, SECRET_KEY)",
    );
  }
}

function buildUsername(userId) {
  return `u${userId}`.toLowerCase();
}

function buildPassword() {
  // Static password that follows provider recommendation; can be changed later
  return "Qwer124";
}

async function ensureProviderMember(username) {
  const sig = crypto
    .createHash("md5")
    .update(OPERATOR_CODE.toLowerCase() + username.toLowerCase() + SECRET_KEY)
    .digest("hex")
    .toUpperCase();

  const res = await axios.get(`${GAME_API_URL}/createMember.aspx`, {
    params: {
      operatorcode: OPERATOR_CODE.toLowerCase(),
      username,
      signature: sig,
    },
    timeout: 10000,
  });

  const { errCode, errMsg } = res.data || {};
  if (errCode !== "0" && errCode !== "82") {
    const error = new Error(errMsg || "Failed to create member at provider");
    error.code = errCode;
    throw error;
  }
}

async function makeTransfer({ username, password, referenceId, type, amount }) {
  const amountStr = Number(amount || 0).toFixed(2);
  const sigSource =
    amountStr +
    OPERATOR_CODE.toLowerCase() +
    password +
    PROVIDER_CODE.toUpperCase() +
    referenceId +
    String(type) +
    username.toLowerCase() +
    SECRET_KEY;

  const signature = crypto
    .createHash("md5")
    .update(sigSource)
    .digest("hex")
    .toUpperCase();

  const res = await axios.get(`${GAME_API_URL}/makeTransfer.aspx`, {
    params: {
      operatorcode: OPERATOR_CODE.toLowerCase(),
      providercode: PROVIDER_CODE.toUpperCase(),
      username,
      password,
      referenceid: referenceId,
      type,
      amount: amountStr,
      signature,
    },
    timeout: 15000,
  });

  return res.data;
}

async function getGameBalance(username, password) {
  const sigSource =
    OPERATOR_CODE.toLowerCase() +
    password +
    PROVIDER_CODE.toUpperCase() +
    username.toLowerCase() +
    SECRET_KEY;

  const signature = crypto
    .createHash("md5")
    .update(sigSource)
    .digest("hex")
    .toUpperCase();

  const res = await axios.get(`${GAME_API_URL}/getBalance.aspx`, {
    params: {
      operatorcode: OPERATOR_CODE.toLowerCase(),
      providercode: PROVIDER_CODE.toUpperCase(),
      username,
      password,
      signature,
    },
    timeout: 10000,
  });

  const { errCode, balance, errMsg } = res.data || {};
  if (errCode !== "0") {
    const error = new Error(errMsg || "Failed to get game balance");
    error.code = errCode;
    throw error;
  }
  return Number(balance || 0);
}

async function getLaunchUrl(req, res) {
  try {
    ensureGameEnv();

    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ status: "failed", msg: "Unauthorized" });
    }

    const gameId = String(req.query.gameId || "302");
    const type = String(req.query.type || "SL");
    const lang = String(req.query.lang || "en-US");
    const html5 = String(req.query.html5 || "1");

    const username = buildUsername(userId);
    const password = buildPassword();

    // 1) Ensure member exists in provider
    try {
      await ensureProviderMember(username);
    } catch (err) {
      return res.status(400).json({
        status: "failed",
        step: "createMember",
        providerErrCode: err.code || "UNKNOWN",
        providerErrMsg: err.message,
      });
    }

    // 2) Move full wallet balance into game (GAME MOVE IN)
    const account = await accountModel.findOne({ user: userId });
    if (!account) {
      return res.status(404).json({ status: "failed", msg: "Account not found" });
    }

    const moveInAmount = Number(account.balance || 0);
    let transferResult = null;

    if (moveInAmount > 0) {
      const referenceId = `GM_IN_${userId}_${Date.now()}`.slice(0, 20);
      try {
        transferResult = await makeTransfer({
          username,
          password,
          referenceId,
          type: 0, // 0 = deposit into game
          amount: moveInAmount,
        });
      } catch (e) {
        return res.status(502).json({
          status: "failed",
          step: "makeTransfer_in",
          msg: "Error calling makeTransfer (game move in)",
          error: e.response?.data || e.message,
        });
      }

      if (transferResult?.errCode !== "0") {
        return res.status(400).json({
          status: "failed",
          step: "makeTransfer_in",
          providerErrCode: transferResult?.errCode,
          providerErrMsg: transferResult?.errMsg || "Game move in failed",
        });
      }

      const newBalance = 0;
      account.balance = newBalance;
      await account.save();

      await transactionLedgerModel.create({
        userId,
        type: "gameIn",
        amount: moveInAmount,
        balanceAfter: newBalance,
        status: "SUCCESS",
        orderId: referenceId,
        remark: "GAME_MOVE_IN",
      });
    }

    // 3) Call launchGames API to get final gameUrl
    const sigSource =
      OPERATOR_CODE.toLowerCase() +
      password +
      PROVIDER_CODE.toUpperCase() +
      type +
      username.toLowerCase() +
      SECRET_KEY;

    const signature = crypto
      .createHash("md5")
      .update(sigSource)
      .digest("hex")
      .toUpperCase();

    let launchRes;
    try {
      launchRes = await axios.get(`${GAME_API_URL}/launchGames.aspx`, {
        params: {
          operatorcode: OPERATOR_CODE.toLowerCase(),
          providercode: PROVIDER_CODE.toUpperCase(),
          username,
          password,
          type,
          gameid: gameId,
          lang,
          html5,
          signature,
        },
        timeout: 10000,
      });
    } catch (e) {
      return res.status(502).json({
        status: "failed",
        step: "launchGames",
        msg: "Error calling launchGames on provider",
        error: e.response?.data || e.message,
      });
    }

    const { errCode, gameUrl, errMsg } = launchRes.data || {};
    if (errCode !== "0" || !gameUrl) {
      return res.status(400).json({
        status: "failed",
        step: "launchGames",
        providerErrCode: errCode || "UNKNOWN",
        providerErrMsg: errMsg || "Failed to get gameUrl from provider",
      });
    }

    res.json({
      status: "success",
      gameId,
      type,
      providerCode: PROVIDER_CODE.toUpperCase(),
      gameUrl,
      moveIn: {
        amount: moveInAmount,
        referenceId: moveInAmount > 0 ? transferResult?.innerCode || null : null,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "failed",
      msg: "Failed to generate launch URL",
      error: error.message,
    });
  }
}

async function withdrawFromGame(req, res) {
  try {
    ensureGameEnv();

    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ status: "failed", msg: "Unauthorized" });
    }

    const username = buildUsername(userId);
    const password = buildPassword();

    // 1) Ensure member exists (safety)
    try {
      await ensureProviderMember(username);
    } catch (err) {
      return res.status(400).json({
        status: "failed",
        step: "createMember",
        providerErrCode: err.code || "UNKNOWN",
        providerErrMsg: err.message,
      });
    }

    // 2) Get game balance
    let gameBalance;
    try {
      gameBalance = await getGameBalance(username, password);
    } catch (err) {
      return res.status(400).json({
        status: "failed",
        step: "getBalance",
        providerErrCode: err.code || "UNKNOWN",
        providerErrMsg: err.message,
      });
    }

    if (gameBalance <= 0) {
      return res.json({
        status: "success",
        msg: "No balance to move out from game",
        moveOut: { amount: 0 },
      });
    }

    const account = await accountModel.findOne({ user: userId });
    if (!account) {
      return res.status(404).json({ status: "failed", msg: "Account not found" });
    }

    // 3) Transfer from game back to wallet (GAME MOVE OUT)
    const referenceId = `GM_OUT_${userId}_${Date.now()}`.slice(0, 20);
    let transferResult;
    try {
      transferResult = await makeTransfer({
        username,
        password,
        referenceId,
        type: 1, // 1 = withdraw from game
        amount: gameBalance,
      });
    } catch (e) {
      return res.status(502).json({
        status: "failed",
        step: "makeTransfer_out",
        msg: "Error calling makeTransfer (game move out)",
        error: e.response?.data || e.message,
      });
    }

    if (transferResult?.errCode !== "0") {
      return res.status(400).json({
        status: "failed",
        step: "makeTransfer_out",
        providerErrCode: transferResult?.errCode,
        providerErrMsg: transferResult?.errMsg || "Game move out failed",
      });
    }

    const newBalance = Number(account.balance || 0) + gameBalance;
    account.balance = newBalance;
    await account.save();

    await transactionLedgerModel.create({
      userId,
      type: "gameOut",
      amount: gameBalance,
      balanceAfter: newBalance,
      status: "SUCCESS",
      orderId: referenceId,
      remark: "GAME_MOVE_OUT",
    });

    res.json({
      status: "success",
      moveOut: {
        amount: gameBalance,
        referenceId: transferResult?.innerCode || null,
      },
      walletBalance: newBalance,
    });
  } catch (error) {
    res.status(500).json({
      status: "failed",
      msg: "Failed to withdraw from game",
      error: error.message,
    });
  }
}

export default { getLaunchUrl, withdrawFromGame };

