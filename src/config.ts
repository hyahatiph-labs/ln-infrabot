import * as yargs from "yargs";
import os, { CpuInfo } from "os";

// interface for the config file
export interface ConfigFile {
  macaroonPath: string;
  lndHost: string;
  tlsPath: string;
  rpcProtoPath: string;
  aperturePath: string;
}

/**
 * Global settings for the server
 */
export enum InfrabotConfig {
  DEFAULT_PORT = 3636,
  DEFAULT_DEV_PORT = 3637,
  DEV = "DEV",
  DEFAULT_HOST = "127.0.0.1",
  // sats per hour
  // configure via aperature
  DEFAULT_RENT = 10,
  // min. run time in minutes
  DEFAULT_TTL = 60,
  DEFAULT_SUPPORTED_APPS = "node.js",
  // default disk size restriction
  // TODO: add validation
  DEFAULT_DISK = 1,
  HOUR = 60,
  HTTP_OK = 200,
  UNAUTHORIZED = 403,
  SERVER_FAILURE = 500,
}

/**
 * Schema for SSL input
 */
export const SSL_SCHEMA: any = {
  properties: {
    sslpassphrase: {
      message:
        "Enter SSL passphrase or press Enter for DEV mode " +
        "\n\tHint: for DEV mode export INFRABOT_ENV=DEV\n",
      hidden: true,
    },
  },
};

/**
 * User input for the infrabot-cli
 */
const ARGS = yargs
  .option("key-path", {
    string: true,
    alias: "kp",
    description: "Path to SSL private key",
    demand: false,
  })
  .option("cert-path", {
    string: true,
    alias: "cep",
    description: "Path to the server certification",
    demand: false,
  })
  .option("ca-path", {
    string: true,
    alias: "cap",
    description: "Path to the CA intermediate certification",
    demand: false,
  })
  .option("root-path", {
    string: true,
    alias: "rp",
    description: "Path to the root intermediate certification",
    demand: false,
  })
  .option("port", {
    number: true,
    alias: "p",
    description: "port to run the server",
    demand: false,
  })
  .option("dev-port", {
    number: true,
    alias: "dvp",
    description: "dev port to run the server",
    demand: false,
  })
  .option("host", {
    string: true,
    alias: "host",
    description: "ip to run the server",
    demand: false,
  })
  .option("ttl", {
    string: true,
    alias: "t",
    description: "time in minutes to keep the infra active",
    demand: false,
  })
  .option("rent", {
    string: true,
    alias: "r",
    description: "recurring payments",
    demand: false,
  })
  .option("support-apps", {
    string: true,
    alias: "s",
    description: "comma separated list of supported apps",
    demand: false,
  })
  .option("disk", {
    number: true,
    alias: "d",
    description: "disk size (GB) restriction",
    demand: false,
  })
  .option("log-level", {
    string: true,
    alias: "ll",
    description: "comma separated list of log levels to maintain",
    demand: false,
  }).argv;

// set https certs here
export const KEY_PATH: string = ARGS["key-path"];
export const CERT_PATH: string = ARGS["cert-path"];
export const CA_PATH: string = ARGS["ca-path"];
export const ROOT_PATH: string = ARGS["root-path"];
export const PORT: number = !ARGS.port
  ? InfrabotConfig.DEFAULT_PORT
  : ARGS.port;
export const HOST: string = !ARGS.host
  ? InfrabotConfig.DEFAULT_HOST
  : ARGS.host;
export const INFRABOT_ENV: string = process.env.INFRABOT_ENV;
export const DEV_PORT: number = !ARGS["dev-port"]
  ? InfrabotConfig.DEFAULT_DEV_PORT
  : ARGS["dev-port"];

// payment settings
const CUSTOM_RENT: string = ARGS["rent"];
const CUSTOM_TTL: string = ARGS["ttl"];
const CUSTOM_APPS: string = ARGS["support-apps"];
const CUSTOM_DISK: number = ARGS["disk"];
export const RENT: number = !CUSTOM_RENT
  ? InfrabotConfig.DEFAULT_RENT
  : parseInt(CUSTOM_RENT, 10);
export const TTL: number = !CUSTOM_TTL
  ? InfrabotConfig.DEFAULT_TTL
  : parseInt(CUSTOM_TTL, 10);
const APPS: string[] = [];
if (!CUSTOM_APPS) {
  APPS.push(InfrabotConfig.DEFAULT_SUPPORTED_APPS);
}
// set supported apps
export const SUPPORTED_APPS: string[] = APPS.length !== 0
  ? APPS
  : CUSTOM_APPS.split(",");
// set disk size restriction
export const DISK: number = !CUSTOM_DISK
  ? InfrabotConfig.DEFAULT_DISK
  : CUSTOM_DISK;

// global log level
const LOG_LEVEL_ARG: string = ARGS["log-level"];
const IS_MULTI_LOG_LEVEL: boolean =
  LOG_LEVEL_ARG && LOG_LEVEL_ARG.length > 0 && LOG_LEVEL_ARG.indexOf(",") > 0;
const singleLogLevel: string[] = [];
if (!IS_MULTI_LOG_LEVEL && LOG_LEVEL_ARG) {
  singleLogLevel.push(LOG_LEVEL_ARG);
} else {
  // default log level
  singleLogLevel.push("INFO");
  singleLogLevel.push("ERROR");
}
export const LOG_FILTERS: string[] | null = IS_MULTI_LOG_LEVEL
  ? LOG_LEVEL_ARG.split(",")
  : !IS_MULTI_LOG_LEVEL
  ? singleLogLevel
  : null;

// some defaults for linux
export const CONFIG_PATH = `${os.homedir()}/.ln-infrabot/config.json`;
export const DEFAULT_MACAROON = `${os.homedir()}/.lnd/data/chain/bitcoin/regtest/admin.macaroon`;
export const DEFAULT_LND_HOST = "localhost:10009";
export const DEFAULT_TLS_PATH = `${os.homedir()}/.lnd/tls.cert`;
export const DEFAULT_RPC_PROTO_PATH = `${os.homedir()}/lnd/lnrpc/rpc.proto`;
export const DEFAULT_INVOICES_PROTO_PATH = `${os.homedir()}/lnd/lnrpc/invoicesrpc/invoices.proto`;
export const DEFAULT_APERTURE_PATH = `${os.homedir()}.go/bin/aperture`;
export const INDENT = 2;

/**
 * The interface for the configuration file
 */
export const DEFAULT_CONFIG: ConfigFile = {
  macaroonPath: DEFAULT_MACAROON,
  lndHost: DEFAULT_LND_HOST,
  tlsPath: DEFAULT_TLS_PATH,
  rpcProtoPath: DEFAULT_RPC_PROTO_PATH,
  aperturePath: DEFAULT_APERTURE_PATH
};

/**
 * Used in conjunction with api requests in order to reduce
 * cognitive complexity
 */
export enum InfrabotMode {
  SECURE = "secure",
  UNSECURE = "un-secure",
}

/**
 * Interface for grpc errors
 */
export interface Error {
  message: string;
}

/**
 * Interface for node info
 */
export interface NodeInfo {
  version: string;
  identity_pubkey: string;
}

/**
 * Interface for infrabot quote response
 */
export interface QuoteResponse {
  cpus: CpuInfo[];
  mem: number;
  disk: number;
  next_avail: number;
  rent: number | string;
  supported_apps: string[];
  ttl: number | string;
  version: string;
}

/**
 * The interface for the infrabot commands
 */
export interface Command {
  cmd: string;
  args: string[];
}

/**
 * The interface for the infrabot request
 * app - type of language used
 * cwd - name of directory in repo
 * isNew - used for extending TTL
 * repo - full URL of .git repo
 * install - command for installing deps
 * tti - time taken in seconds for install
 * compile - command for compilation
 * run - command for starting app
 */
export interface InfrabotRequest {
  app: string;
  cwd: string;
  isNew: boolean;
  repo: string;
  install: Command | null;
  tti: number;
  compile: Command | null;
  run: Command;
}

/**
 * Interface for controlling tiers in regards
 * to TTL. Higher tier will have longer associated
 * execution duration. The value associated with the
 * tier is the time in minutes. Sats for the LSAT 
 * should be configured accordingly in the aperture.yml
 * (e.g. Tier C - TTL 1 day, cost 240 sats (10 sats per hour))
 */
export enum TierLevelTTL {
  D = 60,
  C = 1440,
  B = 10080,
  A = 40320,
  S = 524160
}

/**
 * Interface for controlling tiers in regards
 * to level. This is received from the quote request
 * and then is used to generate approximated cost.
 */
 export enum TierLevel {
  D = "d",
  C = "c",
  B = "b",
  A = "a",
  S = "s"
}