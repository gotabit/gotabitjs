import { makeCosmoshubPath } from "@cosmjs/amino";
import { CosmWasmClient, SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { HdPath, Random, stringToPath } from "@cosmjs/crypto";
import { toBech32 } from "@cosmjs/encoding";
import { LedgerSigner } from "@cosmjs/ledger-amino";
import { DirectSecp256k1HdWallet } from "@cosmjs/proto-signing";
import { GasPrice, SigningStargateClient, StargateClient } from "@cosmjs/stargate";
import TransportWebUSB from "@ledgerhq/hw-transport-webusb";

/**
 * interface chainConfig
 */
export interface Config {
  rpc: string;
  chainId: string;
  gasPrices: GasPrice | string;
  gasAdjustment: number;
}

/**
 * type chainConfig
 */
export type ConfigType = "local" | "test" | "main";

/**
 * enum chainConfig
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
 * Window has to be re-declared to get keplr working
 */
declare const window: any;

/**
 * interface Wallet
 */
export interface Wallet {
  type: ClientType;
  key: string;
  password: string;
  transport: any;
}

/**
 * The number of words in the mnemonic (12, 15, 18, 21 or 24).
 */
export interface WalletOptoions {
  bip39Password: string;
  hdPaths: HdPath[];
  prefix: string;
}

/**
 * interface option
 */
export interface MainWalletOptoions {
  bip39Password: string;
  hdPaths: HdPath[];
  prefix: string;
}

export type WalletGenerateLength = 12 | 15 | 18 | 21 | 24;

/**
 * client type
 */
export type ClientType = "password" | "keplr" | "ledger" | "ledger-ext";

/**
 * enum chainConfig
 */
export enum ClientTypeEnum {
  ClientPassword = "password",
  ClientKeplr = "keplr",
  ClientLedger = "ledger",
  ClientLedgerExt = "ledger-ext",
}

const localConfig = {
  rpc: "http://localhost:26657",
  chainId: "gotabit-local",
  rest: "http://localhost:1317",
  coinType: 118,
  coinDenom: "GTB",
  coinDecimals: 6,
  coinMinimalDenom: "ugtb",
  coinGeckoId: "gotabit",
  gasPriceStep: { low: 0.01, average: 0.025, high: 0.03 },
};

const testConfig = {
  rpc: "https://rpc.testnet.gotabit.dev:443",
  chainId: "gotabit-test-1",
  rest: "http://rest.testnet.gotabit.dev:1317",
  coinType: 118,
  coinDenom: "GTB",
  coinDecimals: 6,
  coinMinimalDenom: "ugtb",
  coinGeckoId: "gotabit",
  gasPriceStep: { low: 0.01, average: 0.025, high: 0.03 },
};

const mainConfig = {
  rpc: "https://rpc.gotabit.dev:443",
  chainId: "gotabit-alpha",
  rest: "http://rest.gotabit.dev:1317",
  coinType: 118,
  coinDenom: "GTB",
  coinDecimals: 6,
  coinMinimalDenom: "ugtb",
  coinGeckoId: "gotabit",
  gasPriceStep: { low: 0.01, average: 0.025, high: 0.03 },
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
    option?: Partial<MainWalletOptoions> | null,
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
    const getEnvRpc = (env: ConfigType, type: "rpc" | "chainId"): string => {
      let _rpc = testConfig.rpc;
      let _chainId = testConfig.chainId;
      switch (env) {
        case ConfigTypelEnum.ConfigLocal:
          _rpc = localConfig.rpc;
          _chainId = localConfig.chainId;
          break;
        case ConfigTypelEnum.ConfigTest:
          _rpc = testConfig.rpc;
          _chainId = testConfig.chainId;
          break;
        case ConfigTypelEnum.ConfigMain:
          _rpc = mainConfig.rpc;
          _chainId = mainConfig.chainId;
          break;
      }
      return type === "rpc" ? _rpc : _chainId;
    };

    return {
      rpc:
        typeof chainConfig === "string" ? getEnvRpc(chainConfig, "rpc") : chainConfig.rpc || testConfig.rpc,
      chainId:
        typeof chainConfig === "string"
          ? getEnvRpc(chainConfig, "chainId")
          : chainConfig.chainId || testConfig.chainId,
      gasPrices: GasPrice.fromString(((chainConfig as Config)?.gasPrices as string) || defaultGasPrice),
      gasAdjustment: (chainConfig as Config).gasAdjustment || 0,
    };
  }

  /**
   Get Wallet
   * @param config
   * @param option
   * @param wallet
   * @private
   */
  private static async getWallet(
    config: Config,
    option: MainWalletOptoions,
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
  private static getOptions(option?: Partial<MainWalletOptoions> | null): MainWalletOptoions {
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
