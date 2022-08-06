import {
  Argon2id,
  Argon2idOptions,
  Random,
  sha256,
  xchacha20NonceLength,
  Xchacha20poly1305Ietf,
} from "@cosmjs/crypto";
import { toAscii, toUtf8 } from "@cosmjs/encoding";
import { Buffer } from "buffer";
import { decrypt, encrypt, PrivateKey } from "eciesjs";

const safeBotSalt = toAscii("The SafeBot salt");

const argon2idOptions: Argon2idOptions = {
  outputLength: 32,
  opsLimit: 24,
  memLimitKib: 12,
};

export class SafeBotSecret {
  public static async encrypt(plaintext: Uint8Array, password: string): Promise<Uint8Array> {
    const encryptionKey = await Argon2id.execute(password, safeBotSalt, argon2idOptions);

    const nonce = Random.getBytes(xchacha20NonceLength);
    return new Uint8Array([
      ...nonce,
      ...(await Xchacha20poly1305Ietf.encrypt(plaintext, encryptionKey, nonce)),
    ]);
  }

  public static async decrypt(ciphertext: Uint8Array, password: string): Promise<Uint8Array> {
    const encryptionKey = await Argon2id.execute(password, safeBotSalt, argon2idOptions);

    const nonce = ciphertext.slice(0, xchacha20NonceLength);
    return Xchacha20poly1305Ietf.decrypt(ciphertext.slice(xchacha20NonceLength), encryptionKey, nonce);
  }
}

export function safeBotSha256(plaintext: string | Uint8Array): string {
  const plain = typeof plaintext === "string" ? toUtf8(plaintext) : plaintext;

  return Buffer.from(sha256(plain)).toString("hex");
}

export class SafeBotEcies {
  public static encrypt(plain: Buffer, pubkey: Uint8Array): Buffer {
    const key = Buffer.from(pubkey).toString("hex");
    return encrypt(key, plain);
  }

  public static decrypt(cipher: Buffer, privkey: Uint8Array): Buffer {
    const key = PrivateKey.fromHex(Buffer.from(privkey).toString("hex"));
    return decrypt(key.toHex(), cipher);
  }
}
