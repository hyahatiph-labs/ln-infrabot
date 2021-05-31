# ln-infrabot
<p>infrabot accepts streaming payments to deploy and maintain infrastructure so you don't have to
<p>become part of a global decentralized IaaS network by leveraging micro-payments and existing resources



```bash

```
*** <b>Caution</b>: This application is beta and breaking changes may occur. Use mainnet at your own risk!

<img src="./circ-ci-cid-econ.jpg">

## Proposal
   
## Project Layout

```bash
ln-infrabot/
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
2. Run `node dist/src/gitpayd.js` to run server *--help for help 
3. Test health check at `http://hostname:3637/gitpayd/health` (*port 3636 is default secure port)
4. Verify configuration files at `~/.ln-infrabot/config.json`
<br/>


## Notes
1. This application runs on the latest Node 12.x+
2. Currently, only battle tested on Fedora 34 Beta

```json 
{
  "macaroonPath": "/home/USER/path/to/macaroon",
  "lndHost": "localhost:10009",
  "internalApiKey": "xxx",
  "tlsPath": "/home/USER/path/to/tls.cert",
  "rpcProtoPath": "/home/USER/path/to/rpc.proto",
  "routerProtoPath": "/home/USER/path/to/routerrpc/router.proto"
}
```

## Installation

1. Run `npm i -g ln-infrabot`
2. Execute `ln-infrabot` should start up the server
3. [ WIP ] Integration with gitpayd!

## Releasing

TODO: Automated release management via `npm publish` and workflows