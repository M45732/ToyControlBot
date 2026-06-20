import type { Client } from "discord.js";

import { createLogger } from "../../lib/logger.js";
import { renewDueSubscriptions } from "./subscription.service.js";

const log = createLogger("subscriptions");

/** How often the renewal sweep runs. Hourly is ample for a 30-day cadence. */
const SWEEP_INTERVAL_MS = 60 * 60 * 1000;

let timer: ReturnType<typeof setInterval> | null = null;

/**
 * Start the recurring subscription-renewal sweep. Runs once immediately (to
 * catch anything that came due while the bot was offline) and then on a fixed
 * interval. Idempotent — a second call is a no-op.
 */
export function startRenewalScheduler(client: Client): void {
  if (timer) {
    return;
  }

  const runSweep = (): void => {
    void renewDueSubscriptions(client).catch((err: unknown) =>
      log.error({ err }, "Renewal sweep failed"),
    );
  };

  runSweep();
  timer = setInterval(runSweep, SWEEP_INTERVAL_MS);
  // Don't let the sweep timer keep the process alive on its own.
  timer.unref?.();
  log.info({ intervalMs: SWEEP_INTERVAL_MS }, "Renewal scheduler started");
}
