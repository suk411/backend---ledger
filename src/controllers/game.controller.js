import crypto from "crypto";
import axios from "axios";
import accountModel from "../models/account.model.js";
import transactionLedgerModel from "../models/transactionLedger.model.js";
import BetRecord from "../models/betRecord.model.js";

const {
  GAME_API_URL,
  GAME_LOG_URL, // reserved for future use (reports, checkTransaction)
  OPERATOR_CODE,
  GAME_SECRET_KEY,
} = process.env;

function ensureGameEnv() {
  if (!GAME_API_URL || !OPERATOR_CODE || !GAME_SECRET_KEY) {
    throw new Error(
      "Missing game provider env vars (GAME_API_URL, OPERATOR_CODE, GAME_SECRET_KEY)",
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

function buildReferenceId(prefix, userId) {
  // Provider requires max length 20, use only A–Z0–9
  const base = `${prefix}${userId}${Date.now()}`;
  const clean = base.replace(/[^A-Za-z0-9]/g, "");
  return clean.slice(0, 20);
}

function resolveProviderCode(raw) {
  const pc = String(raw || "").trim();
  if (!pc) return "JE"; // default provider
  return pc.toUpperCase();
}

async function ensureProviderMember(username, providerCode) {
  const sig = crypto
    .createHash("md5")
    .update(OPERATOR_CODE.toLowerCase() + username.toLowerCase() + GAME_SECRET_KEY)
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

async function makeTransfer({
  username,
  password,
  referenceId,
  type,
  amount,
  providerCode,
}) {
  const amountStr = Number(amount || 0).toFixed(2);
  const pc = resolveProviderCode(providerCode);

  const sigSource =
    amountStr +
    OPERATOR_CODE.toLowerCase() +
    password +
    pc +
    referenceId +
    String(type) +
    username.toLowerCase() +
    GAME_SECRET_KEY;

  const signature = crypto
    .createHash("md5")
    .update(sigSource)
    .digest("hex")
    .toUpperCase();

  const res = await axios.get(`${GAME_API_URL}/makeTransfer.aspx`, {
    params: {
      operatorcode: OPERATOR_CODE.toLowerCase(),
      providercode: pc,
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

async function getGameBalance(username, password, providerCode) {
  const pc = resolveProviderCode(providerCode);

  const sigSource =
    OPERATOR_CODE.toLowerCase() +
    password +
    pc +
    username.toLowerCase() +
    GAME_SECRET_KEY;

  const signature = crypto
    .createHash("md5")
    .update(sigSource)
    .digest("hex")
    .toUpperCase();

  const res = await axios.get(`${GAME_API_URL}/getBalance.aspx`, {
    params: {
      operatorcode: OPERATOR_CODE.toLowerCase(),
      providercode: pc,
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

    // game id: prefer short key g_id, fallback to legacy gameId
    const gameIdRaw = req.query.g_id || req.query.gameId;
    if (!gameIdRaw) {
      return res.status(400).json({
        status: "failed",
        msg: "gameId is required",
      });
    }
    const gameId = String(gameIdRaw);
    const type = String(req.query.type || "SL");
    const lang = String(req.query.lang || "en-US");
    const html5 = String(req.query.html5 || "1");
    // provider: prefer short key p_code, fallback to legacy providerCode/provider
    const providerCode = resolveProviderCode(
      req.query.p_code || req.query.providerCode || req.query.provider,
    );

    const username = buildUsername(userId);
    const password = buildPassword();

    // 1) Ensure member exists in provider
    try {
      await ensureProviderMember(username, providerCode);
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
      const referenceId = buildReferenceId("GMIN", userId);
      try {
        transferResult = await makeTransfer({
          username,
          password,
          referenceId,
          type: 0, // 0 = deposit into game
          amount: moveInAmount,
          providerCode,
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
      providerCode +
      type +
      username.toLowerCase() +
      GAME_SECRET_KEY;

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
          providercode: providerCode,
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
      providerCode,
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

    const providerCode = resolveProviderCode(
      // prefer short keys first: p_code (query/body)
      req.query.p_code ||
        req.body?.p_code ||
        // legacy keys
        req.query.providerCode ||
        req.query.provider ||
        req.body?.providerCode,
    );
    const username = buildUsername(userId);
    const password = buildPassword();

    // 1) Ensure member exists (safety)
    try {
      await ensureProviderMember(username, providerCode);
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
      gameBalance = await getGameBalance(username, password, providerCode);
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
    const referenceId = buildReferenceId("GMOUT", userId);
    let transferResult;
    try {
      transferResult = await makeTransfer({
        username,
        password,
        referenceId,
        type: 1, // 1 = withdraw from game
        amount: gameBalance,
        providerCode,
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

async function getBalances(req, res) {
  try {
    ensureGameEnv();

    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ status: "failed", msg: "Unauthorized" });
    }

    const providerCode = resolveProviderCode(
      req.query.p_code ||
        req.query.providerCode ||
        req.query.provider ||
        req.body?.p_code ||
        req.body?.providerCode,
    );

    const username = buildUsername(userId);
    const password = buildPassword();

    // Ensure member exists (mostly for first-time users)
    try {
      await ensureProviderMember(username, providerCode);
    } catch (err) {
      return res.status(400).json({
        status: "failed",
        step: "createMember",
        providerErrCode: err.code || "UNKNOWN",
        providerErrMsg: err.message,
      });
    }

    const account = await accountModel.findOne({ user: userId });
    if (!account) {
      return res.status(404).json({ status: "failed", msg: "Account not found" });
    }

    let gameBalance = 0;
    try {
      gameBalance = await getGameBalance(username, password, providerCode);
    } catch (err) {
      return res.status(400).json({
        status: "failed",
        step: "getBalance",
        providerErrCode: err.code || "UNKNOWN",
        providerErrMsg: err.message,
      });
    }

    const walletBalance = Number(account.balance || 0);

    res.json({
      status: "success",
      providerCode,
      walletBalance,
      gameBalance,
      totalBalance: walletBalance + gameBalance,
    });
  } catch (error) {
    res.status(500).json({
      status: "failed",
      msg: "Failed to get balances",
      error: error.message,
    });
  }
}

async function syncBetHistory(req, res) {
  try {
    ensureGameEnv();

    // simple admin check on user payload
    if (!req.user || !req.user.admin) {
      return res.status(403).json({ status: "failed", msg: "Admins only" });
    }

    if (!GAME_LOG_URL) {
      return res.status(500).json({
        status: "failed",
        msg: "GAME_LOG_URL is not configured",
      });
    }

    const sigSource = OPERATOR_CODE.toLowerCase() + GAME_SECRET_KEY;
    const signature = crypto
      .createHash("md5")
      .update(sigSource)
      .digest("hex")
      .toUpperCase();

    let apiRes;
    try {
      apiRes = await axios.get(`${GAME_LOG_URL}/fetchbykey.aspx`, {
        params: {
          operatorcode: OPERATOR_CODE.toLowerCase(),
          versionkey: 0,
          signature,
        },
        timeout: 15000,
      });
    } catch (e) {
      return res.status(502).json({
        status: "failed",
        step: "fetchbykey",
        msg: "Error calling fetchbykey on provider",
        error: e.response?.data || e.message,
      });
    }

    const { errCode, result, errMsg } = apiRes.data || {};
    if (errCode !== "0" || !result) {
      return res.status(400).json({
        status: "failed",
        step: "fetchbykey",
        providerErrCode: errCode || "UNKNOWN",
        providerErrMsg: errMsg || "Failed to fetch bet history",
      });
    }

    let records = [];
    try {
      records = JSON.parse(result);
      if (!Array.isArray(records)) records = [];
    } catch (e) {
      return res.status(500).json({
        status: "failed",
        step: "parseResult",
        msg: "Failed to parse provider bet history JSON",
        error: e.message,
      });
    }

    let inserted = 0;
    let updated = 0;

    for (const r of records) {
      if (!r || typeof r !== "object") continue;

      const member = String(r.member || "").trim();
      if (!member) continue;

      // Expect username pattern u<userId>, fallback to 0 if parse fails
      let userId = 0;
      if (member.startsWith("u")) {
        const idNum = Number(member.slice(1));
        if (!Number.isNaN(idNum) && idNum > 0) userId = idNum;
      }
      if (!userId) continue;

      const site = String(r.site || "").trim();
      const refNo = String(r.ref_no || "").trim();
      if (!site || !refNo) continue;

      const betTime = r.start_time ? new Date(r.start_time) : new Date();
      const settleTime = r.end_time ? new Date(r.end_time) : betTime;

      const doc = {
        userId,
        site,
        product: String(r.product || ""),
        member,
        gameId: String(r.game_id || ""),
        refNo,
        betTime,
        settleTime,
        bet: Number(r.bet || 0),
        payout: Number(r.payout || 0),
        turnover: Number(r.turnover || 0),
        commission: Number(r.commission || 0),
        pShare: Number(r.p_share || 0),
        pWin: Number(r.p_win || 0),
        status: Number(r.status || 0),
        remark: String(r.remark_1 || ""),
        raw: r,
      };

      const resUp = await BetRecord.updateOne(
        { site, refNo },
        { $set: doc },
        { upsert: true },
      );

      if (resUp.upsertedCount && resUp.upsertedCount > 0) inserted += 1;
      else if (resUp.modifiedCount && resUp.modifiedCount > 0) updated += 1;
    }

    res.json({
      status: "success",
      fetched: records.length,
      inserted,
      updated,
    });
  } catch (error) {
    res.status(500).json({
      status: "failed",
      msg: "Failed to sync bet history",
      error: error.message,
    });
  }
}

async function getUserBets(req, res) {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ status: "failed", msg: "Unauthorized" });
    }

    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(req.query.limit) || 25));
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      BetRecord.find({ userId })
        .sort({ settleTime: -1 })
        .skip(skip)
        .limit(limit)
        .select("-raw -__v"),
      BetRecord.countDocuments({ userId }),
    ]);

    res.json({
      status: "success",
      userId,
      page,
      limit,
      total,
      items,
    });
  } catch (error) {
    res.status(500).json({
      status: "failed",
      msg: "Failed to get user bets",
      error: error.message,
    });
  }
}

export default { getLaunchUrl, withdrawFromGame, getBalances, syncBetHistory, getUserBets };

