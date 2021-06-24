import log, { LogLevel } from "./logging";
import os from "os";
import { InfrabotMode, SUPPORTED_APPS, TierLevelTTL } from "./config";
import { ChildProcessWithoutNullStreams, spawn } from "child_process";
import { aperturePath } from "./setup";

/**
 * This janitor runs while an app is active
 * When the first payment is received and the app
 * is extended to first ttl the janitor wakes up.
 * When TTL is reached (based on tier) then
 * the currently running app is destroyed and
 * janitor goes back to sleep. Aperture is brought back
 * online once the end of Tier Level TTL is reached.
 * @param process - child process of the app
 * @param tier - tier of the currently running app
 * @param cwd - directory to destroy after TTL
 */
export const janitor = (
  process: ChildProcessWithoutNullStreams,
  tier: TierLevelTTL,
  cwd: string
): void => {
  setTimeout(() => {
    // bring aperture back online
    // TODO: multi-app deployments
    spawn(`${aperturePath}`);
      log(
        "Aperture online. Infrabot is accepting requests.",
        LogLevel.DEBUG,
        true
      );
    spawn(`rm`, ['-rf', `${cwd}`]);
    log(
      "Cleaning up local directory...",
      LogLevel.DEBUG,
      true
    );
    process.kill();
  }, tier * 60000);
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
    `infrabot ${mode} started in ${REAL_TIME}ms on ${os.hostname()}:${port}`,
    LogLevel.INFO,
    true
  );
}
