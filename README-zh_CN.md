<div align="center">

<a href="https://github.com/gotabit/gotabitjs"><img alt="GotaBit" src="https://res.gotabit.io/svg/icon.svg" width="150"/></a>

## GotaBit JS

### Javascript SDK for GotaBit Chain

<!-- [![npm beta version](https://img.shields.io/npm/v/gotabit/beta.svg)](https://www.npmjs.com/package/gotabit) -->
[![npm version](https://img.shields.io/npm/v/gotabit.svg)](https://www.npmjs.com/package/gotabit)
[![npm downloads](https://img.shields.io/npm/dm/gotabit.svg)](https://www.npmjs.com/package/gotabit)
[![GitHub license](https://img.shields.io/github/license/gotabit/gotabitjs)](https://github.com/gotabit/gotabitjs/blob/master/LICENSE)

</div>

简体中文 | [English](./README.md)

## ✨ 特性

- **GotaBit.js** 是为了帮助新的开发者开始他们的第一个 **dApps** 而创建的。它只是一个封装包，可以轻松地从 **CosmJS** 导入所需的功能。
- **GotaBit.js** 不仅是对 **CosmJS** 的封装，还带来了一些预配置的功能来简化。
- **GotaBit.js** 提供 **GotaBit** 构造器等属性与方法，更加便捷处理交易等操作。

## ⚡ 快速开始

### 1. 安装

#### 包管理器中使用

```bash
# 选择一个你喜欢的包管理器

# NPM
$ npm install gotabit

# Yarn
$ yarn add gotabit

# pnpm
$ pnpm add gotabit
```

#### 在浏览器中使用

```html
<!-- 任意选择一个 -->
<script crossorigin src="https://unpkg.com/gotabit@latest/dist/bundle.js"></script>

<script crossorigin src="https://res.gotabit.io/jssdk/dist/bundle.js"></script>
```

### 2. 使用

#### 初始化 SDK

> 调用`SDK`初始化方法，第一个参数支持两种类型，
>
> 1. `string`, 目前有三种环境，分别是：本地网、测试网、主网。
> 2. `object`, 详情请查看 `GotaBitConfig` 类型, 支持自定义配置。

```ts
import { GotaBit } from "gotabit";

const gotabit = await GotaBit.init('test', 12);

console.log(gotabit);
// 底层会自动判断类型。
// 从"@gotabit/cosmjs-proto-signing" 包引入 DirectSecp256k1HdWallet.generate 方法得到 wallet
console.log(gotabit.wallet);

const [{ address }] = await gotabit.wallet.getAccounts();

console.log(address);
```

#### 生成钱包说明

- number: 记忆法中的字数 (`12, 15, 18, 21, 24`)

```ts
import { GotaBit } from "gotabit";

const gotabit = await GotaBit.init('test', 12);

console.log(gotabit);
```

- string: 助记词

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

#### 查询账户余额

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

#### SafeBot 加密和解密

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

## 🔍 文档

[官方文档](https://docs.gotabit.io/).

## 🎈 License

This is a fork from [CosmWasmJS](https://github.com/CosmWasm/CosmWasmJS)

This software is licensed under the Apache 2.0 license.

© 2022 GotaBit Limited
