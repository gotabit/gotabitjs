import { Coin } from "@cosmjs/amino";
import { HdPath, stringToPath } from "@cosmjs/crypto";
import { DirectSecp256k1HdWallet } from "@cosmjs/proto-signing";

export interface WalletOptoions {
  bip39Password: string;
  hdPaths: HdPath[];
  prefix: string;
}

export interface Config {
  rpc: string;
  chainId: string;
  gasPrices: Coin;
  gasAdjustment: number;
  walletOptoions: WalletOptoions;
}

export const walletOptoions = {
  bip39Password: "",
  hdPaths: [stringToPath("m/44'/118'/0'/0/0")],
  prefix: "gio",
};

export const testnetConfig = {
  rpc: "https://rpc.testnet.gotabit.dev:443",
  chainId: "gotabit-test-1",
  gasPrices: {
    denom: "ugio",
    amount: "2500",
  },
  gasAdjustment: 0,
  walletOptoions: walletOptoions,
};

export const localConfig = {
  rpc: "http://localhost:26657",
  chainId: "gotabit-local",
  gasPrices: {
    denom: "ugio",
    amount: "2500",
  },
  gasAdjustment: 0,
  walletOptoions: walletOptoions,
};

export class GotaBit {
  public wallet: DirectSecp256k1HdWallet;
  public mnemonic: string;
  public config: Config;

  private constructor(mnemonic: string, wallet: DirectSecp256k1HdWallet, config: Config) {
    this.mnemonic = mnemonic;
    this.config = config;
    this.wallet = wallet;
  }

  public static async init(mnemonic: string, chainConfig: Config): Promise<GotaBit> {
    const config = chainConfig;
    const wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, config.walletOptoions);
    return new GotaBit(mnemonic, wallet, config);
  }
}

export {};
