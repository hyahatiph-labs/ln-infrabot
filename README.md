[![Build](https://github.com/hyahatiph-labs/ln-infrabot/actions/workflows/infrabot.yml/badge.svg)](https://github.com/hyahatiph-labs/ln-infrabot/actions/workflows/infrabot.yml)
[![CodeQL](https://github.com/hyahatiph-labs/ln-infrabot/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/hyahatiph-labs/ln-infrabot/actions/workflows/codeql-analysis.yml)
# ln-infrabot

infrabot accepts payments via [LSATs](https://lsat.tech/) to deploy and maintain infrastructure

become part of a global decentralized IaaS network by leveraging micro-payments and existing resources

<img src="./aperture.png">

```bash
[INFO]  2021-06-18T18:00:24.097Z => warning: infrabot development server is running
[ERROR] 2021-06-18T18:00:24.104Z => https is not configured, check ssl certs location or passphrase
[INFO]  2021-06-18T18:00:24.111Z => infrabot un-secure started in 3ms on penguin:3637
[DEBUG] 2021-06-18T18:00:24.121Z => rpc proto path is /home/nigellchristian/lnd/lnrpc/rpc.proto
[DEBUG] 2021-06-18T18:00:24.292Z => found lnd 0.12.1-beta 
[INFO]  2021-06-18T18:00:30.803Z => 127.0.0.1 connected to infrabot/noops
[DEBUG] 2021-06-18T18:00:30.809Z => Request: {"app":"node.js","isNew":true,"repo":"https://github.com/reemuru/headerParse.git","cwd":"headerParse","install":{"cmd":"npm","args":["i"]},"tti":30,"compile":null,"run":{"cmd":"node","args":["index.js"]},"payment_request":"lnbcrt100n1psvesvzpp5l0kz9exaj7nh6h3kzl5tn84v2d3wc6m8m75x5l8wxq3zqkls636sdq6d9hxvunpvfhhggrfdemx76trv5cqzpgsp5g8ctm0ehhjx4ulqy3q6sqc9q996g22urn82nqxd5r2ytr2mjch4s9qyyssqqn37afuch9lqffj9th2f6laj7r6eg2qj35y0l7qejk48jn4ecfvzytt2nxeh90gqsf5glvenexmgqn264j44u2jjwpeu4r7yeypkzdqpvu8ync","ttl":"20"}
[DEBUG] 2021-06-18T18:00:30.866Z => invoices: true
[DEBUG] 2021-06-18T18:00:30.893Z => next avail: 1624040430875
added 109 packages from 98 contributors and audited 109 packages in 3.612s

1 package is looking for funding
  run `npm fund` for details

found 0 vulnerabilities

Started listening on penguin
```

*** Caution: This application is beta and breaking changes may occur. Use mainnet at your own risk!

<img src="./circ-ci-cid-econ.jpg">

## Project Layout

```bash
ln-infrabot/
api.http               # used with VSCode [humao.rest-client] for local testing
├── src                # Directory of source code
   ├── config.ts         # Configuration properties
   ├── infrabot.ts        # Entry point for the app
   ├── noops.ts          # NoOps / DevOps script for processing CI / CD payments
   ├── setup.ts          # Creates configuration, connects to LND, helper functions, etc.
├── test               # Test files
├── util               # Helper functions
   ├── logging.ts        # In house logger, since TS hates console.log()
   ├── util.ts           # General purpose functions and logic for CI / CD
```

## Building

1. `cd ln-infrabot/` and run `npm i` to install modules
2. Run `npm run clean && npm run build`
3. Output is in `/dist`

## Development

1. Set environment variable `export INFRABOT_ENV=DEV` for development if needed
2. Run `node dist/src/infrabot.js` to run server *--help for help
3. Infrabot runs behind [Aperture](https://github.com/lightninglabs/aperture). Sample config at `./aperture.yml`
4. Test health check at `https://hostname:8081/infrabot/health` (*port 3636 is default secure port)
5. Verify configuration files at `~/.ln-infrabot/config.json`
6. quotes can be fetched via https://localhost:8081/infrabot/quote/{tier} (tier - d,c,b,a,s) at 10 sats

## Notes

1. This application runs on the latest Node 12.x+
2. Currently, only battle tested on Fedora 34 Stable
3. Aperture path is set to `$HOME/.go/bin/aperture`, update as needed
4. Sample curl for deployment and config file are below

### Sample curl
* path param - `d` - tiers are (d,c,b,a,s) with ttl of 60,1440,...etc. minutes

* header - `LSAT` - LSAT required or 402 response

* request body
    * `app` - type of app, must be in quote 'supported apps'

    * `isNew` - *future use*. Set to true

    * `repo` - repo of the source code 

    * `cwd` - source code root directory

    * `tti` - time-to-install (seconds needed to pull dependencies)

    * `install` - cmd and arguments comma separated

    * `compile` - same as install but for compile commands

    * `run` - same as compile but for running the app

```bash
curl -ik POST 'https://localhost:8081/infrabot/noops/d' -H "Content-type: application/json" -H "Authorization: LSAT $LSAT_VALUE" -d '{"app": "node.js","isNew": true,"repo": "https://github.com/reemuru/headerParse.git","cwd": "headerParse","install": {"cmd": "npm", "args": ["i"]},"tti": 30,"compile": null,"run": {"cmd": "node", "args": ["index.js"]}}'
```

### Sample .ln-infrabot/config.json

```json 
{
  "macaroonPath": "/home/USER/path/to/macaroon",
  "lndHost": "localhost:10009",
  "tlsPath": "/home/USER/path/to/tls.cert",
  "rpcProtoPath": "/home/USER/path/to/rpc.proto",
  "aperturePath": "path/to/aperture"
}
```

## Releasing

TODO: Automated release management via `npm publish` and workflows
