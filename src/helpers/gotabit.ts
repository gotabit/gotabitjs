import { CosmWasmClient, SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { HdPath, stringToPath, Random } from "@cosmjs/crypto";
import { DirectSecp256k1HdWallet } from "@cosmjs/proto-signing";
import { GasPrice, SigningStargateClient, StargateClient } from "@cosmjs/stargate";
import { toBech32 } from "@cosmjs/encoding";

/**
 * interface chainConfig
 */
export interface Config {
  rpc: string;
  chainId: string;
  gasPrices: GasPrice | string;
  gasAdjustment: number;
}

const localConfig = {
  rpc: "http://localhost:26657",
  chainId: "gotabit-local",
};

const testConfig = {
  rpc: "https://rpc.testnet.gotabit.dev:443",
  chainId: "gotabit-test-1",
};

const mainConfig = {
  rpc: "https://rpc.gotabit.dev:443",
  chainId: "gotabit-alpha",
};

const defaultPrefix = "gio";

const defaultHdPath = "m/44'/118'/0'/0/0";

const defaultGasPrice = "2500ugtb";

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
 * interface Wallet
 */
export interface Wallet {
  key: string;
  password: string;
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

export class GotaBit {
  public wallet: DirectSecp256k1HdWallet | null;
  public walletOptoions: WalletOptoions;
  public mnemonic: string;
  public config: Config;

  private constructor(
    config: Config,
    wallet: DirectSecp256k1HdWallet | null,
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
    const _wallet = await this.getWallet(wallet, _options);
    
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
   * Get Wallet
   * @param wallet
   * @param option
   * @returns
   */
  private static async getWallet(
    wallet?: string | WalletGenerateLength | Wallet | null,
    option?: any,
  ): Promise<DirectSecp256k1HdWallet | null> {
    let _wallet: DirectSecp256k1HdWallet | null = null;
    if (typeof wallet === "number") {
      _wallet = await DirectSecp256k1HdWallet.generate(wallet, option);
    } else if (typeof wallet === "string") {
      _wallet = await DirectSecp256k1HdWallet.fromMnemonic(wallet, option);
    } else if (typeof wallet === "object") {
      if (wallet?.key && wallet?.password) {
        _wallet = await DirectSecp256k1HdWallet.deserialize(wallet.key, wallet.password);
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

  public async client(signing?: boolean): Promise<any> {
    var client;

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

  public async wasmClient(signing?: boolean): Promise<any> {
    var client;
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
