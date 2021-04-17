import { DISK, InfrabotConfig, NodeInfo, QuoteResponse, RENT, SUPPORTED_APPS, TTL } from "./config";
import log, { LogLevel } from "./logging";
import { lightning } from "./setup";
import os from "os";

let nextAvail = 0;

export async function runNoOps(r: any): Promise<void> {
    // check if app is supported
    // install and run the app with ttl
    // settle hodl invoice if no errors
}

/**
 * Return quote for the infrabot
 * If infrabot is free it will assist
 * @param res Response
 */
export async function fetchQuote(res: any): Promise<void> {
    if(nextAvail === 0) {
       nextAvail = Date.now();
    }
    lightning.getInfo({}, (e: Error, r: NodeInfo) => {

        const quote: QuoteResponse = {
            cpus: os.cpus(),
            disk: DISK,
            mem: os.freemem(),
            next_avail: nextAvail,
            rent: RENT,
            ttl: TTL,
            supported_apps: SUPPORTED_APPS,
            version: null
        }
        if (e) {
          log(`${e}`, LogLevel.ERROR, true);
        }
        quote.version = r.version.split("commit=")[0].trim();
        return res.status(InfrabotConfig.HTTP_OK).json({ quote });
      });
}