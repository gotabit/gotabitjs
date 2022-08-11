#!/usr/bin/env node
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
