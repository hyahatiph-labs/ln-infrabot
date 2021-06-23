import {
  DISK,
  InfrabotConfig,
  InfrabotRequest,
  QuoteResponse,
  RENT,
  SUPPORTED_APPS,
  TTL,
  Command,
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
  tier: TierLevel
) => {
  setTimeout(() => {
    const CHILD_RUN = spawn(`${command.cmd}`, [...command.args], { cwd });
    CHILD_RUN.stdout.pipe(process.stdout);
    janitor(CHILD_RUN, tier);
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
  tier: TierLevel
): Promise<void> => {
  // check if app is supported and no apps running
  log(`Request: ${JSON.stringify(request)}`, LogLevel.DEBUG, false);
  if (isSupportedApp(request.app)) {
    // install and run app, next avail with ttl
    if (request.isNew && nextAvail < Date.now()) {
      nextAvail = Date.now() + tier * 60000;
      await goRepo(request.repo);
      if (request.install) {
        await runInstall(request.install, request.cwd);
      }
      if (request.compile) {
        await runCompile(request.compile, request.cwd);
      }
      // use tti so that dependencies have time to resolve
      await runInfrabot(request.run, request.cwd, request.tti, tier);
      // kill aperature while infrabot is in use
      // TODO: multi-app deployments
      const KILL_APERTURE = spawn("pkill", ["aperture"]);
      if (KILL_APERTURE.exitCode) {
        log(
          "Aperture killed successfully. Infrabot no longer accepting requests.",
          LogLevel.DEBUG,
          true
        );
      }
    }
    log(`next avail: ${nextAvail}`, LogLevel.DEBUG, false);
  }
};

/**
 * Return quote for the infrabot
 * If infrabot is free it will assist
 * @param res Response manipulation
 */
export const fetchQuote = async (res: any): Promise<void> => {
  if (nextAvail === 0) {
    nextAvail = Date.now();
  }
  const quote: QuoteResponse = {
    cpus: os.cpus(),
    disk: DISK,
    mem: os.freemem(),
    next_avail: nextAvail,
    rent: RENT,
    ttl: TTL,
    supported_apps: SUPPORTED_APPS,
    // TODO: read from package.json
    version: process.env.npm_package_version,
  };
  return res.status(InfrabotConfig.HTTP_OK).json({ quote });
};
