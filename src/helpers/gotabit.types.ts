import { HdPath } from "@cosmjs/crypto";
import { LedgerSigner } from "@cosmjs/ledger-amino";
import { DirectSecp256k1HdWallet, OfflineDirectSigner, OfflineSigner } from "@gotabit/cosmjs-proto-signing";
import { GasPrice } from "@gotabit/cosmjs-stargate";

/**
 * GotaBit class chainConfig/config supports specific types
 */
export type ConfigType = "local" | "test" | "main";

/**
 * GotaBit class chainConfig/config field detail type
 *
 * For field meanings, please refer to: `https://docs.keplr.app/api/suggest-chain.html`
 */
export interface GotaBitConfig {
  rpc: string;
  chainId: string;
  gasPrices: GasPrice | string;
  gasAdjustment: number;

  rest: string;
  coinType: number;
  chainName: string;
  coinDenom: string;
  coinDecimals: number;
  coinMinimalDenom: string;
  coinGeckoId: string;
  gasPriceStep: {
    low: number;
    average: number;
    high: number;
  };
}

/**
 * GotaBit class Wallet support types
 */
export type GotaBitWallet =
  | DirectSecp256k1HdWallet
  | LedgerSigner
  | OfflineSigner
  | OfflineDirectSigner
  | null;

/**
 * Declare the GotaBitWalletOptoions interface
 */
export interface GotaBitWalletOptoions {
  bip39Password: string;
  hdPaths: HdPath[];
  prefix: string;
}

/**
 * GotaBit class chainConfig/config supports specific type enumeration values
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
 * Interface declaration when initializing Wallet as an object
 */
export interface WalletObject {
  type: WalletType;
  key: string;
  password: string;
  transport: any;
}

/**
 * The number of words in the mnemonic (12, 15, 18, 21 or 24).
 */
export type WalletGenerateLength = 12 | 15 | 18 | 21 | 24;

/**
 * Union type for different possible wallet.
 */
export type WalletType = "password" | "keplr" | "ledger";

/**
 * Different environment ClientTypeEnum enumerations
 */
export enum ClientTypeEnum {
  ClientPassword = "password",
  ClientKeplr = "keplr",
  ClientLedger = "ledger",
}
