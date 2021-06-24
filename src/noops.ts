import {
  DISK,
  InfrabotConfig,
  InfrabotRequest,
  QuoteResponse,
  RENT,
  SUPPORTED_APPS,
  Command,
  TierLevelTTL,
  TierLevel,
} from "./config";
import log, { LogLevel } from "./logging";
import os from "os";
import { spawn } from "child_process";
import { isSupportedApp, janitor } from "./util";

/**
 * Used to determine bot availability.
 * If not in the future a new app can be spun
 */
let nextAvail = 0;

/**
 * Async function for cloning the source code
 * @param repo repo from infrabot request
 */
const goRepo = async (repo: string) => {
  const CHILD_REPO = spawn("git", ["clone", `${repo}`]);
  CHILD_REPO.stdout.pipe(process.stdout);
};

/**
 * Async function for installing pacakges
 * @param Command - command from infrabot request for compilation
 * @param cwd - directory to execute compilation commands
 */
const runInstall = async (command: Command, cwd: string) => {
  const CHILD_RUN = spawn(`${command.cmd}`, [...command.args], { cwd });
  CHILD_RUN.stdout.pipe(process.stdout);
};

/**
 * Async function for compiling app
 * @param Command - command from infrabot request for compilation
 * @param cwd - directory to execute compilation commands
 */
const runCompile = async (command: Command, cwd: string) => {
  const CHILD_RUN = spawn(`${command.cmd}`, [...command.args], { cwd });
  CHILD_RUN.stdout.pipe(process.stdout);
};

/**
 * Async function for running app
 * @param Command - command from the request
 * @param cwd - directory to execute commands
 * @param tti - time needed to install dependencies
 * @param tier - Tier level for TTL
 */
const runInfrabot = async (
  command: Command,
  cwd: string,
  tti: number,
  tier: TierLevelTTL
) => {
  setTimeout(() => {
    const CHILD_RUN = spawn(`${command.cmd}`, [...command.args], { cwd });
    CHILD_RUN.stdout.pipe(process.stdout);
    janitor(CHILD_RUN, tier, cwd);
  }, tti * 1000);
};

/**
 * Process the request from the user and
 * execute NoOps. If there is already an app
 * running the server will not execute as Aperture
 * is killed and brought back online programatically.
 * The LSAT generated allows access at a certain tier
 * until the time limit expires (e.g. one-year). This is,
 * however, dependent on availability.
 * @param request - request from user
 * @param tier - Tier level for TTL
 */
export const runNoOps = async (
  request: InfrabotRequest,
  tier: TierLevel | string
): Promise<void> => {
  // check if app is supported and no apps running
  log(`Request: ${JSON.stringify(request)}`, LogLevel.DEBUG, false);
  if (isSupportedApp(request.app)) {
    // set the expected time to live base on tier
    const N_TTL: number =
      tier === TierLevel.D
        ? TierLevelTTL.D
        : tier === TierLevel.C
        ? TierLevelTTL.C
        : tier === TierLevel.B
        ? TierLevelTTL.B
        : tier === TierLevel.A
        ? TierLevelTTL.A
        : TierLevelTTL.S;

    // install and run app, next avail with ttl
    if (request.isNew && nextAvail < Date.now()) {
      nextAvail = Date.now() + N_TTL * 60000;
      await goRepo(request.repo);
      if (request.install) {
        await runInstall(request.install, request.cwd);
      }
      if (request.compile) {
        await runCompile(request.compile, request.cwd);
      }
      // use tti so that dependencies have time to resolve
      await runInfrabot(request.run, request.cwd, request.tti, N_TTL);
      // kill aperature while infrabot is in use
      // TODO: multi-app deployments
      spawn("pkill", ["aperture"]);
    }
    log(`next avail: ${nextAvail}`, LogLevel.DEBUG, false);
  }
};

/**
 * Return quote for the infrabot
 * If infrabot is free it will assist
 * @param res - Response manipulation
 * @param tier - tier level (d,c,b,a,s) 
 */
export const fetchQuote = async (
  res: any,
  tier: TierLevel | string
): Promise<void> => {
  if (nextAvail === 0) {
    nextAvail = Date.now();
  }
  // set the expected time to live based on tier
  const Q_TTL: number =
    tier === TierLevel.D
      ? TierLevelTTL.D
      : tier === TierLevel.C
      ? TierLevelTTL.C
      : tier === TierLevel.B
      ? TierLevelTTL.B
      : tier === TierLevel.A
      ? TierLevelTTL.A
      : TierLevelTTL.S;
  // get the rent based on tier and satoshis per hour
  const Q_RENT: number =
    tier === TierLevel.D
      ? (TierLevelTTL.D / InfrabotConfig.HOUR) * RENT
      : tier === TierLevel.C
      ? (TierLevelTTL.C / InfrabotConfig.HOUR) * RENT
      : tier === TierLevel.B
      ? (TierLevelTTL.B / InfrabotConfig.HOUR) * RENT
      : tier === TierLevel.A
      ? (TierLevelTTL.A / InfrabotConfig.HOUR) * RENT
      : (TierLevelTTL.S / InfrabotConfig.HOUR) * RENT;
  const quote: QuoteResponse = {
    cpus: os.cpus(),
    disk: DISK,
    mem: os.freemem(),
    next_avail: nextAvail,
    rent: Q_RENT,
    ttl: Q_TTL,
    supported_apps: SUPPORTED_APPS,
    // TODO: read from package.json
    version: process.env.INFRABOT_VERSION,
  };
  return res.status(InfrabotConfig.HTTP_OK).json({ quote });
};
