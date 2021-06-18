import log, { LogLevel } from "./logging";
import os from "os";
import { InfrabotMode, SUPPORTED_APPS, TTL } from "./config";
import { ChildProcessWithoutNullStreams } from "child_process";

/**
 * This janitor runs while an app is active
 * When the first payment is received and the app
 * is extended to first ttl the janitor wakes up.
 * If ttl is reached and no payment has arrived
 * the currently running app is destroyed and
 * janitor goes back to sleep.
 * @param nextAvail - time until expiration of currently running app
 */
export const janitor = (
  nextAvail: number,
  process: ChildProcessWithoutNullStreams
): void => {
  const INTERVAL = setInterval(() => {
    if (nextAvail < Date.now()) {
      process.kill();
      clearInterval(INTERVAL);
    }
  }, TTL * 60000);
};

/**
 * Verify if app type is in the list curated
 * by the operator
 * @param app -incoming app type
 * @returns boolean
 */
export const isSupportedApp = (app: string): boolean => {
  const APP_ARRAY: string[] = [...SUPPORTED_APPS];
  APP_ARRAY.push(app);
  const APP_SET: Set<string> = new Set(APP_ARRAY);
  return APP_SET.size !== APP_ARRAY.length;
};

/**
 * Log the port of server mode
 * @param port - port server started on
 * @param mode - mode server started on
 * @param startTime - server start time
 */
export async function logStartup(
  port: number,
  mode: InfrabotMode,
  startTime: number
): Promise<void> {
  const END_TIME: number = new Date().getMilliseconds() - startTime;
  const REAL_TIME: number = END_TIME < 0 ? END_TIME * -1 : END_TIME;
  await log(
    `gitpayd ${mode} started in ${REAL_TIME}ms on ${os.hostname()}:${port}`,
    LogLevel.INFO,
    true
  );
}
