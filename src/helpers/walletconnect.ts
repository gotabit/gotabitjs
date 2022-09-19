/* eslint-disable @typescript-eslint/naming-convention */
import { fromBase64 } from "@cosmjs/encoding";
import { AccountData, DirectSignResponse, OfflineDirectSigner } from "@cosmjs/proto-signing";
import { decodeAminoPubkey } from "@gotabit/cosmjs-amino";
import QRCodeModal from "@walletconnect/qrcode-modal";
import Client from "@walletconnect/sign-client";
import { ProposalTypes, SessionTypes, SignClientTypes } from "@walletconnect/types";
import { AuthInfo, SignDoc } from "cosmjs-types/cosmos/tx/v1beta1/tx";
import { stringifySignDocValues, verifyDirectSignature } from "cosmos-wallet";

const NAMESPACE = "cosmos";
export const COSMOS_METHODS = {
  COSMOS_SIGN_DIRECT: "cosmos_signDirect",
  COSMOS_SIGN_AMINO: "cosmos_signAmino",
  COSMOS_GET_ACCOUNT: "cosmos_getAccount",
  COSMOS_GET_ACCOUNTS: "cosmos_getAccounts",
};

export interface IQRCodeModalOptions {
  registryUrl?: string;
  mobileLinks?: string[];
  desktopLinks?: string[];
}

export function getAddress(cosmosAddress: string): string {
  const [, , address] = cosmosAddress.split(":");
  return address;
}

export class WalletconnectSigner implements OfflineDirectSigner {
  private readonly chainId: string;
  private readonly client: Client;
  private readonly session: SessionTypes.Struct;

  private constructor(chainId: string, client: Client, session: SessionTypes.Struct) {
    this.chainId = chainId;
    this.client = client;
    this.session = session;
  }

  public async getAccounts(): Promise<readonly AccountData[]> {
    const accounts = await this.client.request<Array<{ address: string; pubKey: string }>>({
      topic: this.session.topic,
      chainId: this.chainId,
      request: {
        method: COSMOS_METHODS.COSMOS_GET_ACCOUNTS,
        params: {
          chainId: this.chainId,
        },
      },
    });
    return this.session.namespaces[NAMESPACE].accounts.map((cosmosAddress) => {
      const address = getAddress(cosmosAddress);
      return {
        address,
        algo: "secp256k1",
        pubkey: fromBase64(accounts.find((account) => account.address === address)?.pubKey ?? ""),
      };
    });
  }

  public async signDirect(signerAddress: string, signDoc: SignDoc): Promise<DirectSignResponse> {
    // cosmos_signDirect params
    const params = {
      signerAddress: signerAddress,
      signDoc: stringifySignDocValues(signDoc),
    };
    const result = await this.client.request<{ signature: string }>({
      topic: this.session.topic,
      chainId: this.chainId,
      request: {
        method: COSMOS_METHODS.COSMOS_SIGN_DIRECT,
        params: params,
      },
    });

    const valid = await verifyDirectSignature(signerAddress, result.signature, signDoc);

    if (!valid) throw new Error("Invalid signature");

    const signDocBytes = Uint8Array.from(SignDoc.encode(signDoc).finish());

    const authInfoBytes = SignDoc.decode(signDocBytes).authInfoBytes;

    const pubkey = AuthInfo.decode(authInfoBytes).signerInfos[0].publicKey?.value as Uint8Array;

    return {
      signature: {
        pub_key: {
          type: "/cosmos.crypto.secp256k1.PubKey",
          value: decodeAminoPubkey(pubkey).value,
        },
        signature: result.signature,
      },
      signed: signDoc,
    };
  }

  public static async getOfflineSignerAuto(
    chainId: string,
    signOpts: SignClientTypes.Options,
    settings?: {
      qrcodeModal?: {
        onClosed?: (...args: any[]) => void;
        options?: IQRCodeModalOptions;
      };
      onConnected?: (session: SessionTypes.Struct) => void;
    },
  ): Promise<OfflineDirectSigner> {
    const client = await Client.init(signOpts);

    const requiredNamespaces: ProposalTypes.RequiredNamespaces = {
      cosmos: {
        chains: [`cosmos:${chainId}`],
        methods: Object.values(COSMOS_METHODS),
        events: [],
      },
    };

    const { uri, approval } = await client.connect({
      requiredNamespaces: requiredNamespaces,
    });

    uri &&
      QRCodeModal.open(
        uri,
        (...args: any[]) => {
          settings?.qrcodeModal?.onClosed?.(...args);
        },
        settings?.qrcodeModal?.options,
      );

    const session = await approval();

    settings?.onConnected?.(session);

    QRCodeModal.close();

    return new WalletconnectSigner(chainId, client, session);
  }
}
