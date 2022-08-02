import { makeCosmoshubPath } from "@cosmjs/amino";
import { CosmWasmClient, SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { Random, stringToPath } from "@cosmjs/crypto";
import { toBech32 } from "@cosmjs/encoding";
import { LedgerSigner } from "@cosmjs/ledger-amino";
import { DirectSecp256k1HdWallet } from "@cosmjs/proto-signing";
import { GasPrice, SigningStargateClient, StargateClient } from "@cosmjs/stargate";
import TransportWebUSB from "@ledgerhq/hw-transport-webusb";

import {
  ClientTypeEnum,
  Config,
  ConfigType,
  ConfigTypelEnum,
  Wallet,
  WalletGenerateLength,
  WalletOptoions,
} from "./gotabit.types";

/**
 * Window has to be re-declared to get keplr working
 */
declare const window: any;

const localConfig: Config = {
  rpc: "http://localhost:26657",
  chainId: "gotabit-local",
  chainName: "GotaBit-local",
  rest: "http://localhost:1317",
  coinType: 118,
  coinDenom: "GTB",
  coinDecimals: 6,
  coinMinimalDenom: "ugtb",
  coinGeckoId: "gotabit",
  gasPriceStep: { low: 0.01, average: 0.025, high: 0.03 },
  gasPrices: "",
  gasAdjustment: 0,
};

const testConfig: Config = {
  rpc: "https://rpc.testnet.gotabit.dev:443",
  chainId: "gotabit-test-1",
  chainName: "GotaBit-test",
  rest: "http://rest.testnet.gotabit.dev:1317",
  coinType: 118,
  coinDenom: "GTB",
  coinDecimals: 6,
  coinMinimalDenom: "ugtb",
  coinGeckoId: "gotabit",
  gasPriceStep: { low: 0.01, average: 0.025, high: 0.03 },
  gasPrices: "",
  gasAdjustment: 0,
};

const mainConfig: Config = {
  rpc: "https://rpc.gotabit.dev:443",
  chainId: "gotabit-alpha",
  chainName: "GotaBit",
  rest: "http://rest.gotabit.dev:1317",
  coinType: 118,
  coinDenom: "GTB",
  coinDecimals: 6,
  coinMinimalDenom: "ugtb",
  coinGeckoId: "gotabit",
  gasPriceStep: { low: 0.01, average: 0.025, high: 0.03 },
  gasPrices: "",
  gasAdjustment: 0,
};

const defaultPrefix = "gio";

const defaultHdPath = "m/44'/118'/0'/0/0";

const defaultGasPrice = "0.0025ugtb";

export class GotaBit {
  public wallet: DirectSecp256k1HdWallet | LedgerSigner | null;
  public walletOptoions: WalletOptoions;
  public mnemonic: string;
  public config: Config;

  private constructor(
    config: Config,
    wallet: DirectSecp256k1HdWallet | LedgerSigner | null,
    mnemonic: string,
    walletOptoions: WalletOptoions,
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
  public static randomAddress(prefix: string = defaultPrefix): string {
    return toBech32(prefix, Random.getBytes(20));
  }

  /**
   * GotaBit class init methods
   * @param chainConfig
   */
  public static async init(chainConfig: ConfigType): Promise<GotaBit>;
  public static async init(chainConfig: Config): Promise<GotaBit>;

  /**
   * GotaBit class init methods
   * @param chainConfig
   * @param wallet
   * @param option
   */
  public static async init(
    chainConfig: ConfigType | Config,
    wallet?: string | WalletGenerateLength | Wallet | null,
    option?: Partial<WalletOptoions> | null,
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
  private static getChainConfig(chainConfig: ConfigType | Config): Config {
    /**
     * If the type is "local" | "test" | "main"
     * return the defined environment variable
     * @param type
     * @returns
     */
    const getEnvObject = (type: ConfigType): Config => {
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
      ((chainConfig as Config)?.gasPrices as string) || defaultGasPrice,
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
    config: Config,
    option: WalletOptoions,
    wallet?: string | WalletGenerateLength | Wallet | null,
  ): Promise<DirectSecp256k1HdWallet | LedgerSigner | null> {
    const interactiveTimeout = 120_000;
    const { prefix } = option;
    let _wallet: DirectSecp256k1HdWallet | LedgerSigner | null = null;

    if (typeof wallet === "number") {
      _wallet = await DirectSecp256k1HdWallet.generate(wallet, option);
    } else if (typeof wallet === "string") {
      _wallet = await DirectSecp256k1HdWallet.fromMnemonic(wallet, option);
    } else if (typeof wallet === "object" && wallet) {
      const { type } = wallet;
      switch (type) {
        case ClientTypeEnum.ClientPassword:
          if (!wallet?.key && !wallet?.password) {
            throw new Error("Wallet key and wallet password cannot be empty!");
          }
          _wallet = await DirectSecp256k1HdWallet.deserialize(wallet.key, wallet.password);

          break;
        case ClientTypeEnum.ClientKeplr:
          if (!window.keplr) {
            throw new Error("Keplr is not supported or installed on this browser!");
          }

          // try to enable keplr with given chainId
          await window.keplr.enable(config.chainId).catch(() => {
            throw new Error("Keplr can't connect to this chainId!");
          });

          // Setup signer
          _wallet = await window.getOfflineSignerAuto(config.chainId);

          break;
        case ClientTypeEnum.ClientLedger:
          // Prepare ledger
          // eslint-disable-next-line no-case-declarations
          const ledgerTransportWeb = await TransportWebUSB.create(interactiveTimeout, interactiveTimeout);

          // Setup signer
          _wallet = new LedgerSigner(ledgerTransportWeb, {
            hdPaths: [makeCosmoshubPath(0)],
            prefix,
          });

          break;
        case ClientTypeEnum.ClientLedgerExt:
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
  private static getOptions(option?: Partial<WalletOptoions> | null): WalletOptoions {
    const mainWalletOptoions = {
      bip39Password: "",
      hdPaths: [stringToPath(defaultHdPath)],
      prefix: defaultPrefix,
    };
    return option === null ? Object.assign(mainWalletOptoions, { option }) : mainWalletOptoions;
  }

  /**
   * Returns the client of the corresponding type
   * @param signing
   * @param wasm
   */
  public async client(signing = false, wasm = false): Promise<any> {
    return (wasm ? this.wasmClient : this.stargateClient)(signing);
  }

  public async keplrSuggest(): Promise<void> {
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
    } = this.config;

    const { prefix } = this.walletOptoions;

    await window.keplr.experimentalSuggestChain({
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
    });
  }

  private async stargateClient(signing?: boolean): Promise<any> {
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

  private async wasmClient(signing?: boolean): Promise<any> {
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
