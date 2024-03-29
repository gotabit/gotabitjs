import { LedgerSigner } from "@cosmjs/ledger-amino";
import { HdPath } from "@gotabit/cosmjs-crypto";
import { DirectSecp256k1HdWallet, OfflineDirectSigner, OfflineSigner } from "@gotabit/cosmjs-proto-signing";
import { GasPrice } from "@gotabit/cosmjs-stargate";
import { SessionTypes, SignClientTypes } from "@walletconnect/types";

import { IQRCodeModalOptions } from "./walletconnect";

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
 * Declare the GotaBitWalletOptions interface
 */
export interface GotaBitWalletOptions {
  bip39Password: string;
  hdPaths: HdPath[];
  prefix: string;
}

/**
 * Declare the GotaBitInitWalletOptoions interface
 */
export interface GotaBitInitWalletOptoions {
  bip39Password: string;
  hdPaths: string;
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
  key?: string;
  data?: string;
  transport?: any;
  walletconnectParams?: {
    signOpts: SignClientTypes.Options;
    settings?: {
      qrcodeModal?: {
        onClosed?: (...args: any[]) => void;
        options?: IQRCodeModalOptions;
      };
      onConnected?: (session: SessionTypes.Struct) => void;
    };
  };
}

/**
 * The number of words in the mnemonic (12, 15, 18, 21 or 24).
 */
export type WalletGenerateLength = 12 | 15 | 18 | 21 | 24;

/**
 * Union type for different possible wallet.
 */
export type WalletType = "password" | "keplr" | "ledger" | "walletconnect";

/**
 * Different environment ClientTypeEnum enumerations
 */
export enum ClientTypeEnum {
  ClientPassword = "password",
  ClientKeplr = "keplr",
  ClientLedger = "ledger",
  ClientWalletconnect = "walletconnect",
}
