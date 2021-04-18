import {
  DEFAULT_PAYMENT,
  DEFAULT_MEMO,
  DISK,
  HoldInvoiceRequest,
  HoldInvoiceResponse,
  InfrabotConfig,
  InfrabotRequest,
  NodeInfo,
  QuoteResponse,
  RENT,
  SUPPORTED_APPS,
  TTL,
  SettleInvoiceRequest,
} from "./config";
import log, { LogLevel } from "./logging";
import { invoicerpc, lightning } from "./setup";
import os from "os";
import { spawn } from "child_process";
import { randomBytes } from "crypto";
import { isSupportedApp } from "./util";

let nextAvail = 0;

/**
 * Process the request from the user and 
 * execute NoOps. If there is already an app
 * running the only functionality is extending
 * the ttl. The next availability is reset once
 * no payments are received and the ttl window
 * is over.
 * @param request - request from user
 */
export async function runNoOps(request: InfrabotRequest): Promise<void> {
  // check if app is supported and no apps running
  if (isSupportedApp(request.app)) {
    // install and run app, next avail with ttl
    if (request.isNew && nextAvail < Date.now()) {
      const CHILD_REPO = spawn("git clone", [`${request.repo}`]);
      CHILD_REPO.stdout.pipe(process.stdout);
      const CHILD_RUN = spawn(`${request.run}`);
      CHILD_RUN.stdout.pipe(process.stdout);
    }
    // settle hodl invoice if no errors
    const SETTLE_REQUEST: SettleInvoiceRequest = {
      preimage: Buffer.from(request.preimage),
    };
    invoicerpc.settleInvoice(
      SETTLE_REQUEST,
      (e: Error, r: any) => {
        if (!e) {
          log(`Settled: ${request.preimage}`, LogLevel.INFO, true);
          nextAvail = Date.now() + request.ttl * 60000;
        } else {
          log(`${e}`, LogLevel.ERROR, true);
        }
      }
    );
  }
}

/**
 * Return quote for the infrabot
 * If infrabot is free it will assist
 * @param res Response
 */
export async function fetchQuote(res: any): Promise<void> {
  if (nextAvail === 0) {
    nextAvail = Date.now();
  }
  const REQUEST: HoldInvoiceRequest = {
    hash: randomBytes(32),
    expiry: InfrabotConfig.DEFAULT_TTL * 600,
    memo: DEFAULT_MEMO,
    value: DEFAULT_PAYMENT,
  };
  lightning.getInfo({}, (e: Error, r: NodeInfo) => {
    invoicerpc.addHoldInvoice(REQUEST, (ie: Error, ir: HoldInvoiceResponse) => {
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
      }
      if (ie) {
        log(`${ie}`, LogLevel.ERROR, true);
      }
      quote.version = r.version.split("commit=")[0].trim();
      quote.invoice = ir.payment_request;
      return res.status(InfrabotConfig.HTTP_OK).json({ quote });
    });
  });
}
