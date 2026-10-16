import { cronJobs } from "convex/server";
import { api } from "./_generated/api";

const crons = cronJobs();

// Weekly NYS WIC APL snapshot sync every Monday at 10:00 UTC
crons.weekly(
  "weekly-nys-wic-apl-snapshot-sync",
  { dayOfWeek: "monday", hourUTC: 10, minuteUTC: 0 },
  api.sync.syncFromNysApl,
  {},
);

export default crons;
