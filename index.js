import app from "./src/app.js";
import { connectDB } from "./src/config/db.js";
import { startBetSyncScheduler } from "./src/jobs/betSyncScheduler.js";

// Connect to MongoDB
connectDB();

// Start HTTP server
app.listen(process.env.PORT || 3000, () => {
  console.log("🚀Server is running on port", process.env.PORT || 3000);

  // Start the automatic bet-record sync (every 5 minutes)
  // Called here so the DB connection is already established before first sync
  startBetSyncScheduler();
});
