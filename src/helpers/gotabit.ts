import { Random, stringToPath } from "@cosmjs/crypto";
import { toBech32 } from "@cosmjs/encoding";
import { LedgerSigner } from "@cosmjs/ledger-amino";
import { makeCosmoshubPath } from "@gotabit/cosmjs-amino";
import { CosmWasmClient, SigningCosmWasmClient } from "@gotabit/cosmjs-cosmwasm-stargate";
import { DirectSecp256k1HdWallet } from "@gotabit/cosmjs-proto-signing";
import { GasPrice, SigningStargateClient, StargateClient } from "@gotabit/cosmjs-stargate";
import { Window as KeplrWindow } from "@keplr-wallet/types";

import {
  ClientTypeEnum,
  ConfigType,
  ConfigTypelEnum,
  GotaBitConfig,
  GotaBitInitWalletOptoions,
  GotaBitWallet,
  GotaBitWalletOptoions,
  WalletGenerateLength,
  WalletObject,
} from "./gotabit.types";

/**
 * Redeclare the window type, inheriting from the KeplrWindow type
 */
declare global {
  interface Window extends KeplrWindow {}
}

const localConfig: GotaBitConfig = {
  rpc: "http://localhost:26657",
  chainId: "gotabit-local",
  chainName: "GotaBit-local",
  rest: "http://localhost:1317",
  coinType: 118,
  coinDenom: "GTB",
  coinDecimals: 6,
  coinMinimalDenom: "ugtb",
  coinGeckoId: "gotabit",
  gasPriceStep: { low: 0.001, average: 0.0025, high: 0.003 },
  gasPrices: "",
  gasAdjustment: 0,
};

const testConfig: GotaBitConfig = {
  rpc: "https://rpc-testnet.gotabit.dev:443",
  chainId: "gotabit-test-1",
  chainName: "GotaBit-test",
  rest: "https://rest-testnet.gotabit.dev:443",
  coinType: 118,
  coinDenom: "GTB",
  coinDecimals: 6,
  coinMinimalDenom: "ugtb",
  coinGeckoId: "gotabit",
  gasPriceStep: { low: 0.001, average: 0.0025, high: 0.003 },
  gasPrices: "",
  gasAdjustment: 0,
};

const mainConfig: GotaBitConfig = {
  rpc: "https://rpc.gotabit.dev:443",
  chainId: "gotabit-alpha",
  chainName: "GotaBit",
  rest: "https://rest.gotabit.dev:443",
  coinType: 118,
  coinDenom: "GTB",
  coinDecimals: 6,
  coinMinimalDenom: "ugtb",
  coinGeckoId: "gotabit",
  gasPriceStep: { low: 0.001, average: 0.0025, high: 0.003 },
  gasPrices: "",
  gasAdjustment: 0,
};

const defaultPrefix = "gio";

const defaultHdPath = "m/44'/118'/0'/0/0";

const defaultGasPrice = "0.0025ugtb";

export class GotaBit {
  public wallet: GotaBitWallet;
  public walletOptoions: GotaBitWalletOptoions;
  public mnemonic: string;
  public config: GotaBitConfig;

  private constructor(
    config: GotaBitConfig,
    wallet: GotaBitWallet,
    mnemonic: string,
    walletOptoions: GotaBitWalletOptoions,
  ) {
    this.mnemonic = mnemonic;
    this.config = config;
    this.wallet = wallet;
    this.walletOptoions = walletOptoions;
  }

  /**
   * GotaBit class make random address methods
   * @param prefix
   */
  public static randomAddress(prefix = defaultPrefix): string {
    return toBech32(prefix, Random.getBytes(20));
  }

  /**
   * GotaBit class init methods
   * @param chainConfig
   * @param wallet
   * @param option
   */
  public static async init(
    chainConfig: ConfigType | GotaBitConfig,
    wallet?: string | WalletGenerateLength | WalletObject | null,
    option?: Partial<GotaBitInitWalletOptoions> | null,
  ): Promise<GotaBit> {
    const config = this.getChainConfig(chainConfig);
    const _options = this.getOptions(option);
    const _wallet = await this.getWallet(config, _options, wallet);

    const mnemonic = typeof wallet === "string" ? wallet : "";

    return new GotaBit(config, _wallet, mnemonic, _options);
  }

  /**
   * Get different environment chainConfig configurations
   * @param chainConfig
   * @returns
   */
  private static getChainConfig(chainConfig: ConfigType | GotaBitConfig): GotaBitConfig {
    /**
     * If the type is "local" | "test" | "main"
     * return the defined environment variable
     * @param type
     * @returns
     */
    const getEnvObject = (type: ConfigType): GotaBitConfig => {
      let currentValue = testConfig;
      switch (type) {
        case ConfigTypelEnum.ConfigLocal:
          currentValue = localConfig;
          break;
        case ConfigTypelEnum.ConfigTest:
          currentValue = testConfig;
          break;
        case ConfigTypelEnum.ConfigMain:
          currentValue = mainConfig;
          break;
      }

      return currentValue;
    };

    const customFormats =
      typeof chainConfig === "string" ? getEnvObject(chainConfig) : Object.assign(testConfig, chainConfig);

    customFormats.gasPrices = GasPrice.fromString(
      ((chainConfig as GotaBitConfig)?.gasPrices as string) || defaultGasPrice,
    );
    return customFormats;
  }

  /**
   * Get Wallet
   * @param config
   * @param option
   * @param wallet
   * @private
   */
  private static async getWallet(
    config: GotaBitConfig,
    option: GotaBitWalletOptoions,
    wallet?: string | WalletGenerateLength | WalletObject | null,
  ): Promise<GotaBitWallet> {
    const { prefix } = option;
    let _wallet: GotaBitWallet = null;

    if (typeof wallet === "number") {
      _wallet = await DirectSecp256k1HdWallet.generate(wallet, option);
    } else if (typeof wallet === "string") {
      _wallet = await DirectSecp256k1HdWallet.fromMnemonic(wallet, option);
    } else if (typeof wallet === "object" && wallet) {
      const { type } = wallet;
      switch (type) {
        case ClientTypeEnum.ClientPassword:
          if (wallet?.key && wallet?.data) {
            _wallet = await DirectSecp256k1HdWallet.deserialize(wallet.data, wallet.key);
          } else {
            throw new Error("Wallet key and wallet password cannot be empty!");
          }

          break;
        case ClientTypeEnum.ClientKeplr:
          if (!window.keplr) {
            throw new Error("Keplr is not supported or installed on this browser!");
          }

          await this.keplrSuggest(config, option);

          // try to enable keplr with given chainId
          await window.keplr.enable(config.chainId).catch(() => {
            throw new Error("Keplr can't connect to this chainId!");
          });

          // Setup signer
          _wallet = await window.keplr.getOfflineSignerAuto(config.chainId);

          break;
        case ClientTypeEnum.ClientLedger:
          // Setup signer
          _wallet = new LedgerSigner(wallet.transport, {
            hdPaths: [makeCosmoshubPath(0)],
            prefix,
          });
          break;

        default:
          break;
      }
    }
    return _wallet;
  }

  /**
   * Get Options
   * @param option
   * @returns
   */
  private static getOptions(option?: Partial<GotaBitInitWalletOptoions> | null): GotaBitWalletOptoions {
    const mainWalletOptoions: GotaBitWalletOptoions = {
      bip39Password: option?.bip39Password || "",
      hdPaths: [stringToPath(option?.hdPaths || defaultHdPath)],
      prefix: option?.prefix || defaultPrefix,
    };
    return mainWalletOptoions;
  }

  private static async keplrSuggest(config: GotaBitConfig, option: GotaBitWalletOptoions): Promise<void> {
    const {
      chainId,
      chainName,
      rpc,
      rest,
      coinType,
      coinDenom,
      coinMinimalDenom,
      coinDecimals,
      coinGeckoId,
      gasPriceStep: { low, average, high },
    } = config;

    const { prefix } = option;

    await window.keplr
      ?.experimentalSuggestChain({
        chainId,
        chainName,
        rpc,
        rest,
        bip44: {
          coinType,
        },
        bech32Config: {
          bech32PrefixAccAddr: prefix,
          bech32PrefixAccPub: prefix + "pub",
          bech32PrefixValAddr: prefix + "valoper",
          bech32PrefixValPub: prefix + "valoperpub",
          bech32PrefixConsAddr: prefix + "valcons",
          bech32PrefixConsPub: prefix + "valconspub",
        },
        currencies: [
          {
            coinDenom,
            coinMinimalDenom,
            coinDecimals,
            coinGeckoId,
          },
        ],
        feeCurrencies: [
          {
            coinDenom,
            coinMinimalDenom,
            coinDecimals,
            coinGeckoId,
          },
        ],
        stakeCurrency: {
          coinDenom,
          coinMinimalDenom,
          coinDecimals,
          coinGeckoId,
        },
        gasPriceStep: {
          low,
          average,
          high,
        },
        features: ["ibc-transfer", "cosmwasm", "ibc-go"],
      })
      .catch(() => {
        throw new Error("Keplr can't experimentalSuggestChain to this chainId!");
      });
  }

  /**
   * Returns the client of the corresponding type
   * @param signing
   * @param wasm
   */
  public async client(signing = false, wasm = false): Promise<any> {
    let client;
    if (wasm) {
      client = await this.wasmClient(signing);
    } else {
      client = await this.stargateClient(signing);
    }
    return client;
  }

  /**
   * Create stargate client method
   * @param signing
   * @returns
   */
  public async stargateClient(signing?: boolean): Promise<any> {
    let client;

    if (signing && this.wallet !== null) {
      client = await (SigningStargateClient.connectWithSigner as unknown as any)(
        this.config.rpc,
        this.wallet,
        {
          prefix: this.walletOptoions.prefix,
          gasPrice: this.config.gasPrices,
        },
      );
    } else {
      client = await StargateClient.connect(this.config.rpc);
    }

    const chainId = await client.getChainId();

    if (chainId !== this.config.chainId) {
      throw Error("Given ChainId doesn't match the clients ChainID!");
    }

    return client;
  }

  /**
   * Create wasm client method
   * @param signing
   * @returns
   */
  public async wasmClient(signing?: boolean): Promise<any> {
    let client;
    if (signing && this.wallet !== null) {
      client = await (SigningCosmWasmClient.connectWithSigner as unknown as any)(
        this.config.rpc,
        this.wallet,
        {
          prefix: this.walletOptoions.prefix,
          gasPrice: this.config.gasPrices,
        },
      );
    } else {
      client = await CosmWasmClient.connect(this.config.rpc);
    }
    const chainId = await client.getChainId();

    if (chainId !== this.config.chainId) {
      throw Error("Given ChainId doesn't match the clients ChainID!");
    }

    return client;
  }
}
