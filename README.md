<div align="center">

<a href="https://github.com/gotabit/gotabitjs"><img alt="GotaBit" src="https://res.gotabit.io/svg/icon.svg" width="150"/></a>

## GotaBit JS

### Javascript SDK for GotaBit Chain

<!-- [![npm beta version](https://img.shields.io/npm/v/gotabit/beta.svg)](https://www.npmjs.com/package/gotabit) -->
[![npm version](https://img.shields.io/npm/v/gotabit.svg)](https://www.npmjs.com/package/gotabit)
[![npm downloads](https://img.shields.io/npm/dm/gotabit.svg)](https://www.npmjs.com/package/gotabit)
[![GitHub license](https://img.shields.io/github/license/gotabit/gotabitjs)](https://github.com/gotabit/gotabitjs/blob/master/LICENSE)

</div>

English | [简体中文](./README-zh_CN.md)

## ✨ Characteristics

- **GotaBit.js** was created to help new developers get started with their first **dApps**. It is just a wrapper package to easily import needed features from **CosmJS**.
- **GotaBit.js** is not only a wrapper around **CosmJS**, but also brings some preconfigured functions to simplify the setup of SigningClient.
- **GotaBit.js** provides properties and methods such as the **GotaBit** constructor to make it easier to handle transactions and other operations.

## ⚡ Get started

### 1. Install

#### Package Manager using

```bash
# Select a package manager you like

# NPM
$ npm install gotabit

# Yarn
$ yarn add gotabit

# pnpm
$ pnpm add gotabit
```

#### in the browser

```html
<!-- Select any one -->
<script crossorigin src="https://unpkg.com/gotabit@latest/dist/bundle.js"></script>

<script crossorigin src="https://res.gotabit.io/jssdk/dist/bundle.js"></script>
```

### 2. Use

#### Initialize SDK

> Calling the SDK initialization method, the first parameter supports two types
>
> 1. `string`, There are currently three environments: "local" | "test" | "main".
> 2. `object`, Please check `GotaBitConfig` type for details, custom configurations are supported.

```ts
import { GotaBit } from "gotabit";

const gotabit = await GotaBit.init('test', 12);

console.log(gotabit);
// The underlying layer will automatically determine the type.
// Introduce the DirectSecp256k1HdWallet.generate method from the "@gotabit/cosmjs-proto-signing" package to get the wallet
console.log(gotabit.wallet);

const [{ address }] = await gotabit.wallet.getAccounts();

console.log(address);
```

#### Generate Wallet Instructions

- number: `The number of words in the mnemonic (12, 15, 18, 21, 24)`.

```ts
import { GotaBit } from "gotabit";

const gotabit = await GotaBit.init('test', 12);

console.log(gotabit);
```

- string: `mnemonic`.

```ts
import { GotaBit } from "gotabit";

const mnemonic =
  "dinner proud piano mention silk plunge forest fold trial duck electric define";

const gotabit = await GotaBit.init('test', mnemonic);

console.log(gotabit)
```

- object: `type("password" | "keplr" | "ledger")`.
  - password

    ```ts
    import { GotaBit } from "gotabit";

    const pwd = {
      type: 'password',
      key: '123456',
      data: '{"type":"directsecp256k1hdwallet-v1","kdf":{"algorithm":"argon2id","params":{"outputLength":32,"opsLimit":24,"memLimitKib":12288}},"encryption":{"algorithm":"xchacha20poly1305-ietf"},"data":"t6K8D6b7ZHG4jD6c2OFfahvO6Tl640LUjxlyx9UIPUnbQnygYPW1KtsWjJzYGmtz1OXiM7pN0VedXk9Q/MwnurQLRcm3Smen5lftD4Wf0pNsJCZ5q3IsyhjWYoYH5sOwuFnnxLCxVJgjHuqKEPHlnqxyCrgOOr5VRyHtsCG2KqNtw+K9HWyVdjrNgMCkRD09xqJWQHejtFgqHXSl0Tfnf05ycu1DPaxkdjD2AYobjgxPDHhLP0lGGS6yj5IN10g="}',
    };

    const gotabit = await GotaBit.init('test', pwd);

    console.log(gotabit.wallet);

    const [{ address }] = await gotabit.wallet.getAccounts();

    console.log(address);
    ```

  - keplr

    ```ts
    import { GotaBit } from "gotabit";

    const gotabit = await GotaBit.init('test', { type: "keplr" });
    ```

  - ledger

    ```ts
    import { GotaBit } from "gotabit";

    const gotabit = await GotaBit.init('test', { type: "ledger" });
    ```

#### Check Account Balance

```ts
import { GotaBit } from "gotabit";

const address = 'gio1tseh0grt8j8klrdunpudflvy9lfn3rl50zdpu8';

const gotabit = await GotaBit.init('test');
const client = await gotabit.client();
const balance = await client.getAllBalances(address);

console.log('balance:', balance);
```

#### Client

- Get a read-only cosmwasm client

```ts
import { GotaBit } from "gotabit";

// Using a random generated mnemonic
const mnemonic =
  "dinner proud piano mention silk plunge forest fold trial duck electric define";

const gotabit = await GotaBit.init('test', mnemonic);

const client = await gotabit.client(false, true);

console.log(client);
```
<!--
- Create a wallet and a signing stargate clien

```ts
import { GotaBit } from "gotabit";

// Using a random generated mnemonic
const mnemonic =
  "dinner proud piano mention silk plunge forest fold trial duck electric define";

const gotabit = await GotaBit.init('test', mnemonic);

const client = await gotabit.client(true, true);

console.log(client);
```

- Connect with keplr and get a signing starget client

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
``` -->

#### Interacting with contracts

```ts
const { GotaBit } = GotaBitJS;

const mnemonic =
  "dinner proud piano mention silk plunge forest fold trial duck electric define";

const cw20_token_address =
  "gio14hj2tavq8fpesdwxxcu44rty3hh90vhujrvcmstl4zr3txmfvw9sl0hu5t";

const gotabit = await GotaBit.init('test', mnemonic);

const [from_wallet] = await gotabit.wallet.getAccounts();

const client = await gotabit.wasmClient(true);
const config = await client.queryContractSmart(cw20_token_address, {
  balance: {
    address: from_wallet.address
  }
});

console.log(config)
```

#### SafeBot Encrypt & decrypt

```ts
import { Buffer, fromUtf8, GotaBit, SafeBotEcies, SafeBotChaCha20, SafeBotXChaCha20, safeBotSha1, safeBotSha256, toUtf8 } from "gotabit";

const text = toUtf8('This a plain text.');

/*
* safeBotSha256 test
*/
const sha256Digest = safeBotSha256(text);
console.log('sha256-digest:', sha256Digest);

/*
* safeBotSha1 test
*/
const sha1Digest = safeBotSha1(text);
console.log('sha1-digest:', sha1Digest);

/*
* SafeBotXChaCha20 test
*/
let encrypted = await SafeBotXChaCha20.encrypt(text, '123456');
let plaintext = await SafeBotXChaCha20.decrypt(encrypted, '123456');

console.log('SafeBotXChaCha20-encrypted:', Buffer.from(encrypted).toString('base64'));
console.log('SafeBotXChaCha20-plaintext:', fromUtf8(plaintext));

/*
* SafeBotChaCha20 test
*/
let safeBotEncrypted = await SafeBotChaCha20.encrypt(text, '123456');
let safeBotPlaintext = await SafeBotChaCha20.decrypt(safeBotEncrypted, '123456');

console.log('SafeBotChaCha20-encrypted:', Buffer.from(safeBotEncrypted).toString('base64'));
console.log('SafeBotChaCha20-plaintext:', fromUtf8(safeBotPlaintext));

/*
* SafeBotEcies test
*/

// generate key pair for ecies
const gotabit = await GotaBit.init('test', 12, {
  prefix: "gid",
  hdPaths: 'm/199'
});

const [{ address, pubkey, privkey }] = await gotabit.wallet.getAccountsWithPrivkeys();
console.log("address: ", address);
console.log("mnemonic: ", gotabit.wallet.mnemonic);
console.log("pubkey: ", Buffer.from(pubkey).toString("hex"));
console.log("privkey: ", Buffer.from(privkey).toString("hex"));

// SafeBotEcies test
encrypted = await SafeBotEcies.encrypt(text, pubkey);
plaintext = await SafeBotEcies.decrypt(encrypted, privkey);

console.log('ecies-encrypted:', encrypted.toString('base64'));
console.log('ecies-plaintext:', fromUtf8(plaintext));

// sha256-digest: 78a70afeb2201b1ccdf0e67ec539e8814ce1125d96522e999c2bda67dde417c2
// sha1-digest: 44d979c869b80069aeed76f3a8c802fff9785211
// SafeBotXChaCha20-encrypted: nHYUjRNT0Am+wTeCbZrc3L39bccJ4oyH9NuW0ZeOkXUD0keLrlOERV/ymKYDlnx/VuPSqZYP4ElaXw==
// SafeBotXChaCha20-plaintext: This a plain text.
// SafeBotChaCha20-encrypted: rrkaPuNDyXCd/kg1+pJNi/1yOv4yV55OhyErqI2tBdAALk3DkOy7HfPmwG/EUg==
// SafeBotChaCha20-plaintext: This a plain text.
// address:  gid18wg73wx05tka5dgf4lcuspnq5m4al9u2n3c879
// mnemonic:  discover price oblige hill basic gather health monitor spray leaf make tell
// pubkey:  031468bdd550aa9eaf654d2134ad47a88ed1c21b6f58dcd434163f83a72af51395
// privkey:  0276c337cc7307db47bfd1eb14d7c9f5bde1ff212f27511d4cd74b08175b1504
// ecies-encrypted: BAKcGkqkPWBSe6173VSf5dWOIz6/94qULaiwuYOGUJcP4AkcY2tFY+2lqGQds6wb9PptiQLmcEyj45TdHgPpnVtMPTE2QJ4patSUDWWr5iNCcT1/QCdbCdXlORQqhw50yOyVEzi/e8Ell5+7LsDr6eWosQ==
// ecies-plaintext: This a plain text.
```

## 🔍 Documentation

[GotaBit Docs](https://docs.gotabit.io/).

## 🎈 License

This is a fork from [CosmWasmJS](https://github.com/CosmWasm/CosmWasmJS)

This software is licensed under the Apache 2.0 license.

© 2022 GotaBit Limited
