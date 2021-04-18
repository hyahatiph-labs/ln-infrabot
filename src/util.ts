
import log, { LogLevel } from "./logging";
import os from "os";
import { InfrabotMode, SUPPORTED_APPS } from "./config";

/**
 * Verify if app type is in the list curated
 * by the operator
 * @param app -incoming app type
 * @returns boolean
 */
export const isSupportedApp = (app: string): boolean => {
  const APP_ARRAY: string[] = SUPPORTED_APPS;
  APP_ARRAY.push(app);
  const APP_SET: Set<string> = new Set(APP_ARRAY);
  return APP_SET.values.length === SUPPORTED_APPS.length;
}

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