#!/usr/bin/env node

import { GotaBit } from "gotabit";

const gotabit = await GotaBit.init('test', 12, {
  prefix: 'gid',
  hdPaths: 'm/199',
});

console.log(gotabit);
console.log(gotabit.walletOptoions);

// const [{ address }] = await gotabit.wallet.getAccounts();

// console.log(gotabit.wallet);

