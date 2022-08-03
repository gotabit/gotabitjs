// Send token transaction
import { GotaBit, coins } from "gotabit";
import { TxRaw } from "cosmjs-types/cosmos/tx/v1beta1/tx.js";

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
const fee = {
  amount: [
    {
      amount: "2500",
      denom: "ugtb",
    },
  ],
  gas: "100000",
  granter: "gio1fx8794synuvp9y8ft2w9rjdefpkj406ak8utpg",
  payer: "",
};
const client = await gotabit.client(true, true);
const response = await client.signAndBroadcast(address, [txMsgs], fee, "tx_memo_native_send_token");
// const response = await client.sign(address, [txMsgs], fee, "tx_memo_native_send_token");


console.info("fromAddress: ", address);
console.info("toAddress: ", txMsgs.value.toAddress);
console.info("amount: ", txMsgs.value.amount);

if (response.code === 0) console.log("Hash:", response.transactionHash);

console.log("Result: ", response);
/*
 */
