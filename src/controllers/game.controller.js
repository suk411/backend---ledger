import crypto from "crypto";
import axios from "axios";

const {
  GAME_API_URL,
  PROVIDER_CODE,
  OPERATOR_CODE,
  SECRET_KEY,
} = process.env;

function ensureGameEnv() {
  if (!GAME_API_URL || !PROVIDER_CODE || !OPERATOR_CODE || !SECRET_KEY) {
    throw new Error("Missing game provider env vars (GAME_API_URL, PROVIDER_CODE, OPERATOR_CODE, SECRET_KEY)");
  }
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

    // For now we derive a deterministic provider username from userId.
    const username = `u${userId}`.toLowerCase();
    // Static password that follows provider recommendation; you can change this later.
    const password = "Qwer124";

    // 1) Ensure member exists in game provider (createMember API)
    const createMemberSignature = crypto
      .createHash("md5")
      .update(
        OPERATOR_CODE.toLowerCase() + username.toLowerCase() + SECRET_KEY,
      )
      .digest("hex")
      .toUpperCase();

    try {
      const cmRes = await axios.get(
        `${GAME_API_URL}/createMember.aspx`,
        {
          params: {
            operatorcode: OPERATOR_CODE.toLowerCase(),
            username,
            signature: createMemberSignature,
          },
          timeout: 10000,
        },
      );

      const { errCode, errMsg } = cmRes.data || {};
      // 0 = created, 82 = already exists; both are OK for launching.
      if (errCode !== "0" && errCode !== "82") {
        return res.status(400).json({
          status: "failed",
          step: "createMember",
          providerErrCode: errCode,
          providerErrMsg: errMsg || "Failed to create member at provider",
        });
      }
    } catch (e) {
      return res.status(502).json({
        status: "failed",
        step: "createMember",
        msg: "Error calling createMember on provider",
        error: e.response?.data || e.message,
      });
    }

    // 2) Build launchGames signature and URL
    const rawSignature =
      OPERATOR_CODE.toLowerCase() +
      password +
      PROVIDER_CODE.toUpperCase() +
      type +
      username.toLowerCase() +
      SECRET_KEY;

    const signature = crypto
      .createHash("md5")
      .update(rawSignature)
      .digest("hex")
      .toUpperCase();

    const url =
      `${GAME_API_URL}/launchGames.aspx` +
      `?operatorcode=${encodeURIComponent(OPERATOR_CODE.toLowerCase())}` +
      `&providercode=${encodeURIComponent(PROVIDER_CODE.toUpperCase())}` +
      `&username=${encodeURIComponent(username)}` +
      `&password=${encodeURIComponent(password)}` +
      `&type=${encodeURIComponent(type)}` +
      `&gameid=${encodeURIComponent(gameId)}` +
      `&lang=${encodeURIComponent(lang)}` +
      `&html5=${encodeURIComponent(html5)}` +
      `&signature=${encodeURIComponent(signature)}`;

    res.json({
      status: "success",
      gameId,
      type,
      providerCode: PROVIDER_CODE.toUpperCase(),
      url,
    });
  } catch (error) {
    res.status(500).json({
      status: "failed",
      msg: "Failed to generate launch URL",
      error: error.message,
    });
  }
}

export default { getLaunchUrl };

