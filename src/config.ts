import * as yargs from "yargs";
import os from "os";

// interface for the config file
export interface ConfigFile {
  macaroonPath: string;
  lndHost: string;
  tlsPath: string;
  rpcProtoPath: string;
  routerProtoPath: string;
}

/**
 * Global settings for the server
 */
export enum InfrabotConfig {
  DEFAULT_PORT = 3636,
  DEFAULT_DEV_PORT = 3637,
  DEV = "DEV",
  DEFAULT_HOST = "127.0.0.1",
  DEFAULT_RENT = 100,
  DEFAULT_TTL = 60,
  HTTP_OK = 200,
  UNAUTHORIZED = 403,
  SERVER_FAILURE = 500
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
 * User input for the gitpayd-cli
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
export const PORT: number =
  !ARGS.port ? InfrabotConfig.DEFAULT_PORT : ARGS.port;
export const HOST: string =
  !ARGS.host ? InfrabotConfig.DEFAULT_HOST : ARGS.host;
export const INFRABOT_ENV: string = process.env.INFRABOT_ENV;
export const DEV_PORT: number =
  !ARGS["dev-port"]
    ? InfrabotConfig.DEFAULT_DEV_PORT
    : ARGS["dev-port"];

// payment settings
const CUSTOM_RENT: string = ARGS["rent"];
const CUSTOM_TTL: string = ARGS["ttl"];
export const RENT: number | string =
  !CUSTOM_RENT
    ? InfrabotConfig.DEFAULT_RENT
    : parseInt(CUSTOM_RENT, 10);
export const TTL: number =
  !CUSTOM_TTL
    ? InfrabotConfig.DEFAULT_TTL
    : parseInt(CUSTOM_TTL, 10);

// global log level
const LOG_LEVEL_ARG: string = ARGS["log-level"];
const IS_MULTI_LOG_LEVEL: boolean =
  LOG_LEVEL_ARG &&
  LOG_LEVEL_ARG.length > 0 &&
  LOG_LEVEL_ARG.indexOf(",") > 0;
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
export const DEFAULT_MACAROON = `${os.homedir()}/.lnd/data/chain/bitcoin/mainnet/admin.macaroon`;
export const DEFAULT_LND_HOST = "localhost:10009";
export const DEFAULT_TLS_PATH = `${os.homedir()}/.lnd/tls.cert`;
export const DEFAULT_RPC_PROTO_PATH = `${os.homedir()}/lnd/lnrpc/rpc.proto`;
export const DEFAULT_ROUTER_PROTO_PATH = `${os.homedir()}/lnd/lnrpc/routerrpc/router.proto`;
export const INDENT = 2;
export const DEFAULT_CONFIG: ConfigFile = {
  macaroonPath: DEFAULT_MACAROON,
  lndHost: DEFAULT_LND_HOST,
  tlsPath: DEFAULT_TLS_PATH,
  rpcProtoPath: DEFAULT_RPC_PROTO_PATH,
  routerProtoPath: DEFAULT_ROUTER_PROTO_PATH
};

/**
 * Used in conjunction with api requests in order to reduce
 * cognitive complexity
 */
 export enum InfrabotMode {
  SECURE = "secure",
  UNSECURE = "un-secure"
}

/**
 * Interface for grpc errors
 */
export interface Error {
  message: string
}

/**
 * Interface for node info
 */
export interface NodeInfo {
  version: string,
  identity_pubkey: string
}

/**
 * Interface for infrabot quote response
 */
export interface QuoteResponse {
  next_avail: number,
  pub_key: string,
  rent: number | string,
  supported_apps: string,
  ttl: number | string,
  version: string
}