#!/usr/bin/env node

import { GotaBit } from "gotabit";
import { toUtf8, fromUtf8 } from "@cosmjs/encoding";
import { SafeBotEcies, SafeBotSecret, safeBotSha256, safeBotSha1 } from "gotabit";

const text = toUtf8('This a plain text.');

/* 
* safeBotSha256 test
*/
// 78a70afeb2201b1ccdf0e67ec539e8814ce1125d96522e999c2bda67dde417c2
let digest = safeBotSha256(text);
console.log('sha256-digest:', digest);

/* 
* safeBotSha1 test
*/
// 78a70afeb2201b1ccdf0e67ec539e8814ce1125d96522e999c2bda67dde417c2
digest = safeBotSha1(text);
console.log('sha1-digest:', digest);

/* 
* SafeBotSecret test
*/
let encrypted =  await SafeBotSecret.encrypt(text, '123456');
let plaintext =  await SafeBotSecret.decrypt(encrypted, '123456');

console.log('secret-encrypted:', Buffer.from(encrypted).toString('base64'));
console.log('secret-plaintext:', fromUtf8(plaintext));

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
encrypted =  await SafeBotEcies.encrypt(text, pubkey);
plaintext =  await SafeBotEcies.decrypt(encrypted, privkey);

console.log('ecies-encrypted:', encrypted.toString('base64'));
console.log('ecies-plaintext:', fromUtf8(plaintext));

/*
*/
