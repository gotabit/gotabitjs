// Send token transaction
import { GotaBit, coins } from "gotabit";

const mnemonic = "climb cereal law remember october amount rough indicate trap gate slender moon";

const gotabit = await GotaBit.init("test", mnemonic);

const [{ address }] = await gotabit.wallet.getAccounts();

const txMsgs = {
  typeUrl: "/cosmos.bank.v1beta1.MsgSend",
  value: {
    fromAddress: address,
    toAddress: GotaBit.randomAddress(),
    amount: coins(100000, "ugtb"),
  },
};

// hack for use auto gas fees.
const fee =  {
  amount: coins(1, "ugtb"),
  gas: "1",
  auto: true,
  granter: "gio1fx8794synuvp9y8ft2w9rjdefpkj406ak8utpg",
};

/*
 */

const client = await gotabit.client(true);
const response = await client.signAndBroadcast(address, [txMsgs], fee, "tx_memo_native_send_token");

console.info("fromAddress: ", address);
console.info("toAddress: ", txMsgs.value.toAddress);
console.info("amount: ", txMsgs.value.amount);

if (response.code === 0) console.log("Hash:", response.transactionHash);

console.log("Result: ", response);

/*
 */
