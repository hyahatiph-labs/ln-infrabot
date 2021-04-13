# ln-infrabot
<p>infrabot accepts streaming payments to deploy and maintain infrastructure so you don't have to
<p>become part of a global decentralized IaaS network by leveraging micropayments and existing resources



```bash

```
*** <b>Caution</b>: This application is beta and breaking changes may occur. Use mainnet at your own risk!

<img src="./circ-ci-cid-econ.jpg">

## Proposal
   
## Project Layout

```bash
gitpayd/
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

1. `cd gitpayd/` and run `npm i` to install modules
2. Run `npm run clean && npm run build`
3. Output is in `/dist`

## Development

1. Set environment variable `export GITPAYD_ENV=DEV` for development if needed
2. Run `node dist/src/gitpayd.js` to run server *--help for help 
3. Test health check at `http://hostname:7778/gitpayd/health` (*port 7777 is default secure port)
4. Verify configuration files at `~/.gitpayd/config.json`
<br/>

```bash


```


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

<b>Delimiters</b>
<ul>
<li> Issues should have a line <b>Bounty: amt</b> - where amt is the amount in satoshis
<li> Pull requests should have a line <b>LN: LNxxx</b> - where LNxxx is the invoice 
<li> as well as, <b>Closes #n</b> - where n is the issue number the pull request will close
</ul>

## Installation

1. Run `npm i -g gitpayd`
2. Execute `gitpayd` should start up the server
3. Execute from workflow as curl or create your own action thingy!

```bash
# gitpayd-cli required arguments
gitpayd --cap=/home/USER/path-to-ca-cert/ca.crt --kp=/home/USER/path-to-private-key/PRIVATEKEY.key --cep=/home/USER/path-server-cert/server.crt --rp=/home/USER/path-to-root-cert/root.crt --o=owner -r=repo
# optional arguments -p=PORT, -host=IP_ADDRESS --dvp=DEV_PORT --ll=DEBUG,INFO,ERROR (default is INFO,ERROR)
```

## Releasing

TODO: Automated release management via `npm publish` and workflows

## Testing

`npm test`
<br/>
more tests are encouraged