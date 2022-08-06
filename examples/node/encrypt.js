#!/usr/bin/env node

import { GotaBit } from "gotabit";
import { toUtf8, fromUtf8 } from "@cosmjs/encoding";
import { SafeBotEcies, SafeBotSecret, safeBotSha256, safeBotSha1, SafeBotSimple } from "gotabit";

const text = toUtf8('id:1,000,000');

/* 
* safeBotSha256 test
*/
console.log("### SafeBot sha256 sha1");
// b4f52dccb3828c29ece216465b8c20372193ce27d248a811a6ddcbc7f249300e
let digest = safeBotSha256(text);
console.log('sha256-digest:', digest);

/* 
* safeBotSha1 test
*/
// 75a81e41adc5e24677b747bf14ff70d642e12149
digest = safeBotSha1(text);
console.log('sha1-digest:', digest);

console.log("\n### SafeBot Secret-key SafeBotSecret SafeBotSimple");
/* 
* SafeBotSecret test
*/
let encrypted =  await SafeBotSecret.encrypt(text, '123456');
let plaintext =  await SafeBotSecret.decrypt(encrypted, '123456');

console.log('secret-encrypted:', Buffer.from(encrypted).toString('base64'));
console.log('secret-plaintext:', fromUtf8(plaintext));

/* 
* SafeBotSimple test
*/
encrypted =  await SafeBotSimple.encrypt(text, '123456');
plaintext =  await SafeBotSimple.decrypt(encrypted, '123456');

console.log('simple-encrypted:', Buffer.from(encrypted).toString('base64'));
console.log('simple-plaintext:', fromUtf8(plaintext));

/* 
* SafeBotEcies test
*/
console.log("\n### SafeBot Public-key ECIES");
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
encrypted =  SafeBotEcies.encrypt(text, pubkey);
plaintext =  SafeBotEcies.decrypt(encrypted, privkey);

console.log('ecies-encrypted:', encrypted.toString('base64'));
console.log('ecies-plaintext:', fromUtf8(plaintext));

/*
*/
