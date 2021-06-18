import {
  DEFAULT_PAYMENT,
  DEFAULT_MEMO,
  DISK,
  InfrabotConfig,
  InfrabotRequest,
  NodeInfo,
  QuoteResponse,
  RENT,
  SUPPORTED_APPS,
  TTL,
  AddInvoiceRequest,
  AddInvoiceResponse,
  ListInvoiceResponse,
  Invoice,
  Command,
} from "./config";
import log, { LogLevel } from "./logging";
import { lightning } from "./setup";
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
 * @param repo repo from infrabot request
 */
const runInstall = async (command: Command, cwd: string) => {
  const CHILD_RUN = spawn(`${command.cmd}`, [...command.args], { cwd });
  CHILD_RUN.stdout.pipe(process.stdout);
};

/**
 * Async function for compiling app
 * @param repo repo from infrabot request
 */
const runCompile = async (command: Command, cwd: string) => {
  const CHILD_RUN = spawn(`${command.cmd}`, [...command.args], { cwd });
  CHILD_RUN.stdout.pipe(process.stdout);
};

/**
 * Async function for running app
 * @param repo repo from infrabot request
 */
const runInfrabot = async (command: Command, cwd: string, tti: number) => {
  setTimeout(() => {
    const CHILD_RUN = spawn(`${command.cmd}`, [...command.args], { cwd });
    CHILD_RUN.stdout.pipe(process.stdout);
    janitor(nextAvail, CHILD_RUN);
  }, tti * 1000);
};

/**
 * Process the request from the user and
 * execute NoOps. If there is already an app
 * running the only functionality is extending
 * the ttl. The next availability is reset once
 * no payments are received and the ttl window
 * is over.
 * @param request - request from user
 */
export const runNoOps = async (request: InfrabotRequest): Promise<void> => {
  // check if app is supported and no apps running
  log(`Request: ${JSON.stringify(request)}`, LogLevel.DEBUG, false);
  if (isSupportedApp(request.app)) {
    const INVOICE_REQUEST: any = {};
    lightning.listInvoices(
      INVOICE_REQUEST,
      async (e: Error, r: ListInvoiceResponse) => {
        let settled = false;
        r.invoices.forEach((invoice: Invoice) => {
          if (invoice.payment_request === request.payment_request) {
            log(`invoices: ${invoice.settled}`, LogLevel.DEBUG, false);
            settled = invoice.settled;
          }
        });
        if (!e && settled) {
          // install and run app, next avail with ttl
          if (request.isNew && nextAvail < Date.now()) {
            nextAvail = Date.now() + request.ttl * 60000;
            await goRepo(request.repo);
            if (request.install) {
              await runInstall(request.install, request.cwd);
            }
            if (request.compile) {
              await runCompile(request.compile, request.cwd);
            }
            // use tti so that dependencies have time to resolve
              await runInfrabot(request.run, request.cwd, request.tti);
          }
          log(`next avail: ${nextAvail}`, LogLevel.DEBUG, false);
        } else {
          log(`${e}`, LogLevel.ERROR, true);
        }
      }
    );
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
  const ADD_INVOICE_REQUEST: AddInvoiceRequest = {
    memo: DEFAULT_MEMO,
    value: DEFAULT_PAYMENT,
  };
  lightning.getInfo({}, (e: Error, r: NodeInfo) => {
    lightning.addInvoice(
      ADD_INVOICE_REQUEST,
      (ie: Error, ir: AddInvoiceResponse) => {
        const quote: QuoteResponse = {
          cpus: os.cpus(),
          disk: DISK,
          invoice: null,
          mem: os.freemem(),
          next_avail: nextAvail,
          rent: RENT,
          ttl: TTL,
          supported_apps: SUPPORTED_APPS,
          version: null,
        };
        if (e) {
          log(`${e}`, LogLevel.ERROR, true);
          return res.status(InfrabotConfig.SERVER_FAILURE);
        } else if (ie) {
          log(`${ie}`, LogLevel.ERROR, true);
          return res.status(InfrabotConfig.SERVER_FAILURE);
        } else {
          quote.version = r.version.split("commit=")[0].trim();
          quote.invoice = ir.payment_request;
          return res.status(InfrabotConfig.HTTP_OK).json({ quote });
        }
      }
    );
  });
};
