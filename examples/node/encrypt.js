#!/usr/bin/env node

import { stringToPath, GotaBit } from "gotabit";
import { toUtf8, fromUtf8 } from "@cosmjs/encoding";
import { SafeBotEcies, SafeBotSecret, safeBotSha256 } from "gotabit";

const text = toUtf8('This a plain text.');

/* 
* safeBotSha256 test
*/
//8dd5af8c39da483368e796cf0192f4af94b20baf857ffd072336373f240ba151
let digest = safeBotSha256(text);

console.log('sha256-digest:', digest);

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
  hdPaths: [stringToPath('m/199')]
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
