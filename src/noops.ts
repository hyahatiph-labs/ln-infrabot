import { InfrabotConfig, NodeInfo, QuoteResponse, RENT, TTL } from "./config";
import log, { LogLevel } from "./logging";
import { lightning } from "./setup";

let nextAvail = 0;

export async function runNoOps(): Promise<void> {
    // WIP
}

export async function fetchQuote(res: any): Promise<void> {
    if(nextAvail === 0) {
       nextAvail = Date.now();
    }
    lightning.getInfo({}, (e: Error, r: NodeInfo) => {
        const quote: QuoteResponse = {
            next_avail: nextAvail,
            pub_key: null,
            rent: RENT,
            ttl: TTL,
            // TODO: will make this configurable in the future
            supported_apps: 'node.js',
            version: null
        }
        if (e) {
          log(`${e}`, LogLevel.ERROR, true);
        }
        quote.version = r.version.split("commit=")[0];
        quote.pub_key = r.identity_pubkey;
        return res.status(InfrabotConfig.HTTP_OK).json({ quote });
      });
}