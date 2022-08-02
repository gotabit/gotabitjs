import { HdPath } from "@cosmjs/crypto";
import { GasPrice } from "@cosmjs/stargate";

/**
 * Declare the chainConfig interface
 */
export interface Config {
  rpc: string;
  chainId: string;
  gasPrices: GasPrice | string;
  gasAdjustment: number;
}

/**
 * Different environment chainConfig type
 */
export type ConfigType = "local" | "test" | "main";

/**
 * Different environment chainConfig enumerations
 */
export enum ConfigTypelEnum {
  /** Local Environment */
  ConfigLocal = "local",
  /** Test Environment */
  ConfigTest = "test",
  /** Main Environment */
  ConfigMain = "main",
}

/**
 * Declare the Wallet interface
 */
export interface Wallet {
  type: WalletType;
  key: string;
  password: string;
  transport: any;
}

/**
 * Union type for different possible wallet.
 */
export type WalletType = "password" | "keplr" | "ledger" | "ledger-ext";

/**
 * Declare the WalletOptoions interface
 */
export interface WalletOptoions {
  bip39Password: string;
  hdPaths: HdPath[];
  prefix: string;
}

/**
 * The number of words in the mnemonic (12, 15, 18, 21 or 24).
 */
export type WalletGenerateLength = 12 | 15 | 18 | 21 | 24;

/**
 * Different environment ClientTypeEnum enumerations
 */
export enum ClientTypeEnum {
  ClientPassword = "password",
  ClientKeplr = "keplr",
  ClientLedger = "ledger",
  ClientLedgerExt = "ledger-ext",
}