#!/usr/bin/env node

import { GotaBit } from "gotabit";

const gotabit = await GotaBit.init('test', 12);

console.log(gotabit);

const [{ address }] = await gotabit.wallet.getAccounts();

console.log(gotabit.wallet);


/*
 */
