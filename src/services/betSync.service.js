/**
 * betSync.service.js
 *
 * Core logic to fetch bet records from the game provider API
 * (fetchbykey.aspx) and upsert them into the local BetRecord collection.
 *
 * This service is used by:
 *  - The automatic scheduler (runs every 5 minutes)
 *  - The manual admin endpoint (POST /api/game/sync-bets)
 */

import crypto from "crypto";
import axios from "axios";
import BetRecord from "../models/betRecord.model.js";
import logger from "../utils/logger.js";

/**
 * Fetch bet records from the provider and upsert into DB.
 *
 * @param {object} [opts]
 * @param {number|string} [opts.versionKey=0]  Provider version key (0 = fetch all new records)
 * @returns {Promise<{ fetched: number, inserted: number, updated: number, skipped: number }>}
 */
export async function syncBetRecords({ versionKey = 0 } = {}) {
  const { GAME_LOG_URL, OPERATOR_CODE, GAME_SECRET_KEY } = process.env;

  if (!GAME_LOG_URL || !OPERATOR_CODE || !GAME_SECRET_KEY) {
    throw new Error(
      "Missing game provider env vars (GAME_LOG_URL, OPERATOR_CODE, GAME_SECRET_KEY)",
    );
  }

  // ── 1. Build signature ──────────────────────────────────────────────────────
  const sigSource = OPERATOR_CODE.toLowerCase() + GAME_SECRET_KEY;
  const signature = crypto
    .createHash("md5")
    .update(sigSource)
    .digest("hex")
    .toUpperCase();

  // ── 2. Call provider API ────────────────────────────────────────────────────
  let apiRes;
  try {
    apiRes = await axios.get(`${GAME_LOG_URL}/fetchbykey.aspx`, {
      params: {
        operatorcode: OPERATOR_CODE.toLowerCase(),
        versionkey: versionKey,
        signature,
      },
      timeout: 20000,
    });
  } catch (e) {
    const msg = `[betSync] HTTP error calling fetchbykey: ${e.message}`;
    logger.error(new Error(msg), { step: "fetchbykey" });
    throw new Error(msg);
  }

  const { errCode, result, errMsg } = apiRes.data || {};

  if (errCode !== "0" || !result) {
    const msg = `[betSync] Provider error ${errCode}: ${errMsg || "no result"}`;
    logger.error(new Error(msg), { step: "fetchbykey", errCode });
    throw new Error(msg);
  }

  // ── 3. Parse JSON array ─────────────────────────────────────────────────────
  let records = [];
  try {
    records = JSON.parse(result);
    if (!Array.isArray(records)) records = [];
  } catch (e) {
    const msg = `[betSync] Failed to parse provider JSON: ${e.message}`;
    logger.error(new Error(msg), { step: "parseResult" });
    throw new Error(msg);
  }

  // ── 4. Upsert each record ───────────────────────────────────────────────────
  let inserted = 0;
  let updated = 0;
  let skipped = 0;

  for (const r of records) {
    if (!r || typeof r !== "object") {
      skipped += 1;
      continue;
    }

    const member = String(r.member || "").trim();
    if (!member) {
      skipped += 1;
      continue;
    }

    // Username pattern: u<userId>
    let userId = 0;
    if (member.startsWith("u")) {
      const idNum = Number(member.slice(1));
      if (!Number.isNaN(idNum) && idNum > 0) userId = idNum;
    }
    if (!userId) {
      skipped += 1;
      continue;
    }

    const site = String(r.site || "").trim();
    const refNo = String(r.ref_no || "").trim();
    if (!site || !refNo) {
      skipped += 1;
      continue;
    }

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

    try {
      const resUp = await BetRecord.updateOne(
        { site, refNo },
        { $set: doc },
        { upsert: true },
      );

      if (resUp.upsertedCount > 0) inserted += 1;
      else if (resUp.modifiedCount > 0) updated += 1;
    } catch (dbErr) {
      logger.error(dbErr, { step: "upsert", site, refNo });
      skipped += 1;
    }
  }

  return { fetched: records.length, inserted, updated, skipped };
}
