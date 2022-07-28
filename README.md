<h1><p align="center">GotaBit JS</p></h1>

<div align="center">
  <a href="https://www.npmjs.com/package/gotabit"><img alt="npm" src="https://img.shields.io/npm/v/gotabit.svg"/></a>
</div>

## About

GotaBit.js was created to help new developers get started with their first dApps. It is just a wrapper package to easily import needed features from CosmJS.

## Get started

### Installation

**NPM**

```sh
npm install gotabit
```

**Yarn**

```sh
yarn add gotabit
```

## Usage

### Get a read-only cosmwasm client

```ts
import { CosmWasmClient } from "gotabit";

// This is your rpc endpoint
const rpcEndpoint = "https://rpc.test.gotabit.dev:443/";

async function main() {
  const client = await CosmWasmClient.connect(rpcEndpoint);
  console.log(client);
}

main();
```

### Create a wallet and a signing stargate client

```ts
import { SigningCosmWasmClient, Secp256k1HdWallet } from "gotabit";

// This is your rpc endpoint
const rpcEndpoint = "https://rpc.test.gotabit.dev:443/";

// Using a random generated mnemonic
const mnemonic =
  "rifle same bitter control garage duck grab spare mountain doctor rubber cook";

async function main() {
  // Create a wallet
  const wallet = await Secp256k1HdWallet.fromMnemonic(mnemonic);

  // Using
  const client = await SigningCosmWasmClient.connectWithSigner(
    rpcEndpoint,
    wallet,
  );
  console.log(client);
}

main();
```

### Connect with keplr and get a signing starget client

```ts
import { setupWebKeplr } from "gotabit";

const config = {
  chainId: "gotabit-test-1",
  rpcEndpoint: "https://rpc.testnet.gotabit.dev:443/",
  prefix: "gio",
};

async function main() {
  const client = await setupWebKeplr(config);
  console.log(client);
}

main();
```

### Interacting with contracts

```ts
import { CosmWasmClient } from "gotabit";

// This is your rpc endpoint
const rpcEndpoint = "https://rpc.test.gotabit.dev:443/";

// This is your contract address
const contractAddr =
  "gio1pvrwmjuusn9wh34j7y520g8gumuy9xtl3gvprlljfdpwju3x7ucsex5hqy";

async function main() {
  const client = await CosmWasmClient.connect(rpcEndpoint);
  const config = await client.queryContractSmart(contractAddr, { balance: { address: '' } });

  console.log(config);
}

main();
```

## License

This is a fork from [CosmWasmJS](https://github.com/CosmWasm/CosmWasmJS)

This software is licensed under the Apache 2.0 license. 

© 2022 GotaBit Limited
