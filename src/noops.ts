import { QuoteResponse, RENT, TTL } from "./config";
import { lndVersion } from "./setup";

let nextAvail = 0;

export async function runNoOps(): Promise<void> {
    // WIP
}

export async function fetchQuote(): Promise<QuoteResponse> {
    if(nextAvail === 0) {
       nextAvail = Date.now();
    }
    const quote: QuoteResponse = {
        next_avail: nextAvail,
        rent: RENT,
        ttl: TTL,
        // TODO: will make this configurable in the future
        supportedApps: 'node.js',
        version: lndVersion
    }
    return quote;
}