import {
  Argon2id,
  Argon2idOptions,
  Random,
  xchacha20NonceLength,
  Xchacha20poly1305Ietf,
} from "@cosmjs/crypto";
import { toAscii } from "@cosmjs/encoding";
import { sha1 } from "@noble/hashes/sha1";
import { sha256 } from "@noble/hashes/sha256";
import { Buffer } from "buffer";
import { decrypt, encrypt, PrivateKey } from "eciesjs";
import sodium from "libsodium-wrappers";

const safeBotSalt = toAscii("The SafeBot salt");

const chacha20NonceLength = 12;

const argon2idOptions: Argon2idOptions = {
  outputLength: 32,
  opsLimit: 24,
  memLimitKib: 12,
};

export function safeBotSha256(plaintext: string | Uint8Array): string {
  return Buffer.from(sha256(plaintext)).toString("hex");
}

export function safeBotSha1(plaintext: string | Uint8Array): string {
  return Buffer.from(sha1(plaintext)).toString("hex");
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export class SafeBotXChaCha20 {
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

export class SafeBotChaCha20 {
  public static async encrypt(plaintext: Uint8Array, password: string): Promise<Uint8Array> {
    const encryptionKey = await Argon2id.execute(password, safeBotSalt, argon2idOptions);

    const nonce = Random.getBytes(chacha20NonceLength);

    await sodium.ready;

    const encrypted = sodium.crypto_aead_chacha20poly1305_ietf_encrypt(
      plaintext,
      null,
      null,
      nonce,
      encryptionKey,
    );

    return new Uint8Array([...nonce, ...encrypted]);
  }

  public static async decrypt(ciphertext: Uint8Array, password: string): Promise<Uint8Array> {
    const encryptionKey = await Argon2id.execute(password, safeBotSalt, argon2idOptions);

    const nonce = ciphertext.slice(0, chacha20NonceLength);

    await sodium.ready;

    return sodium.crypto_aead_chacha20poly1305_ietf_decrypt(
      null,
      ciphertext.slice(chacha20NonceLength),
      null,
      nonce,
      encryptionKey,
    );
  }
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
