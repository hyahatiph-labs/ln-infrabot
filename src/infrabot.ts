#!/usr/bin/env node
import express from "express";
import log, { LogLevel } from "./logging";
import https from "https";
import http from "http";
import fs from "fs";
import {
  CONFIG_PATH,
  InfrabotConfig,
  KEY_PATH,
  CERT_PATH,
  CA_PATH,
  ROOT_PATH,
  PORT,
  HOST,
  DEV_PORT,
  SSL_SCHEMA,
  InfrabotMode,
  INFRABOT_ENV,
} from "./config";
import prompt from "prompt";
import { fetchQuote, runNoOps } from "./noops";
import { logStartup } from "./util";
import setup from "./setup";

let passphrase: string;
let isConfigured: boolean;

const APP = express();
const START_TIME: number = new Date().getMilliseconds();

// health check for infrabot
APP.get("/infrabot/health", (req, res) => {
  log(`${req.ip} connected to infrabot/health`, LogLevel.INFO, true);
  res.status(InfrabotConfig.HTTP_OK).json({ msg: "infrabot is UP" });
});

// quote for infrabot
APP.get("/infrabot/quote", (req, res) => {
  log(`${req.ip} connected to infrabot/quote`, LogLevel.INFO, true);
  fetchQuote(res)
  .then(quote => quote)
  .catch(e => {
    log(`${e}`, LogLevel.DEBUG, false);
    log(`An error occurred during NoOps`, LogLevel.ERROR, true);
  });
});

// NoOps for infrabot
APP.post("/infrabot/noops", (req, res) => {
  log(`${req.ip} connected to infrabot/noops`, LogLevel.INFO, true);
  runNoOps(req.body).catch(() => {
    log(`An error occurred during NoOps`, LogLevel.ERROR, true);
  });
  res.status(InfrabotConfig.HTTP_OK).json({ msg: `NoOps Completed` });
});

/**
 * Attempts to start the server in DEV mode
 * INFRABOT_ENV=DEV must be set
 */
const startHttp = (): void => {
  // set the dev server to run if environment variable is set
  if (INFRABOT_ENV === InfrabotConfig.DEV) {
    // check for lnd node
    if (!isConfigured) {
      setup().catch((e) => {
        log(`${e}`, LogLevel.DEBUG, true);
        log(`setup failed, check ${CONFIG_PATH}`, LogLevel.ERROR, true);
      });
    }
    const HTTP_SERVER = http.createServer(APP);
    HTTP_SERVER.listen(DEV_PORT, HOST);
    log("warning: infrabot development server is running", LogLevel.INFO, true);
  }
  log(
    "https is not configured, check ssl certs location or passphrase",
    LogLevel.ERROR,
    true
  );
};

/**
 * Attempts to start the server with SSL info
 * @param input - SSL private key passphrase
 */
const startHttps = (input: string): void => {
  const HTTPS_SERVER = https.createServer(
    {
      key: fs.readFileSync(KEY_PATH),
      passphrase: input,
      cert: fs.readFileSync(CERT_PATH),
      ca: [fs.readFileSync(CA_PATH), fs.readFileSync(ROOT_PATH)],
    },
    APP
  );
  HTTPS_SERVER.listen(PORT, HOST);
  // check for lnd node
  setup().catch(() =>
    log(`setup failed, check ${CONFIG_PATH}`, LogLevel.ERROR, true)
  );
};

/**
 * Drive server initialization with SSL passphrase
 */
async function initialize(): Promise<void> {
  // start the infrabot server
  if (!INFRABOT_ENV) {
    // get ssl passphrase on startup
    prompt.start();
    let { sslpassphrase }: prompt.Properties = await prompt.get(SSL_SCHEMA);
    passphrase = sslpassphrase.toString();
    startHttps(passphrase);
    // clear ssl passphrase
    passphrase = null;
    sslpassphrase = null;
    logStartup(PORT, InfrabotMode.SECURE, START_TIME);
    isConfigured = true;
  } else {
    startHttp();
    logStartup(DEV_PORT, InfrabotMode.UNSECURE, START_TIME);
  }
}

initialize().catch((e) => {
  log(`${e}`, LogLevel.DEBUG, false);
  log("infrabot failed to initialize", LogLevel.ERROR, false);
});
