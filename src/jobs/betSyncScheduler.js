/**
 * betSyncScheduler.js
 *
 * Automatically fetches bet records from the game provider API
 * every 5 minutes using Node's built-in setInterval.
 *
 * Usage (call once after DB is connected):
 *   import { startBetSyncScheduler } from "./src/jobs/betSyncScheduler.js";
 *   startBetSyncScheduler();
 */

import { syncBetRecords } from "../services/betSync.service.js";
import logger from "../utils/logger.js";

const INTERVAL_MS =  1* 60 * 1000; // 1mint

let isRunning = false; // guard against overlapping runs

async function runSync() {
  if (isRunning) {
    logger.info("[betSyncScheduler] Previous sync still running – skipping this tick");
    return;
  }

  isRunning = true;
  const startedAt = new Date().toISOString();
  logger.info(`[betSyncScheduler] Starting scheduled bet sync at ${startedAt}`);

  try {
    const result = await syncBetRecords({ versionKey: 0 });
    logger.info(
      `[betSyncScheduler] Sync complete – fetched: ${result.fetched}, inserted: ${result.inserted}, updated: ${result.updated}, skipped: ${result.skipped}, marked: ${result.marked}`,
      result,
    );
  } catch (err) {
    logger.error(err, { job: "betSyncScheduler", startedAt });
    console.error("[betSyncScheduler] Error during sync:", err.message);
  } finally {
    isRunning = false;
  }
}

/**
 * Start the scheduler.
 * - Runs an immediate first sync right away so you don't wait 5 min on startup.
 * - Then repeats every 5 minutes.
 *
 * @returns {{ stop: Function }} – call stop() to cancel the interval
 */
export function startBetSyncScheduler() {
  console.log(
    `[betSyncScheduler] 🕐 Bet sync scheduler started – will run every ${INTERVAL_MS / 1000}s (5 min)`,
  );

  // Run immediately on startup
  runSync();

  // Then repeat every 5 minutes
  const timer = setInterval(runSync, INTERVAL_MS);

  // Allow Node to exit even if the interval is still active
  if (timer.unref) timer.unref();

  return {
    stop() {
      clearInterval(timer);
      console.log("[betSyncScheduler] Scheduler stopped.");
    },
  };
}
