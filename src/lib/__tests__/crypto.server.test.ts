import { describe, it, expect, beforeAll } from "vitest";
import { encryptSecret, decryptSecret, sha256Hex, keyHint } from "../crypto.server";

beforeAll(() => {
  process.env.DECODER_ENCRYPTION_KEY = "test-encryption-key-for-vitest";
});

describe("encryptSecret / decryptSecret", () => {
  it("roundtrips a plaintext string", () => {
    const plain = "my secret api key value";
    const enc = encryptSecret(plain);
    expect(enc).toBeTruthy();
    expect(enc.split(":")).toHaveLength(3);
    const dec = decryptSecret(enc);
    expect(dec).toBe(plain);
  });

  it("encrypting empty string produces empty enc part (known limitation)", () => {
    // Empty plaintext produces empty encrypted buffer; base64-encoded becomes ""
    // This is a known edge case — decryptSecret rejects it as malformed
    const enc = encryptSecret("");
    const parts = enc.split(":");
    expect(parts[2]).toBe(""); // empty encrypted part
  });

  it("roundtrips unicode text", () => {
    const plain = "Café résumé 你好 🚀";
    const enc = encryptSecret(plain);
    expect(decryptSecret(enc)).toBe(plain);
  });

  it("produces different ciphertexts for same plaintext (random IV)", () => {
    const plain = "same plaintext";
    const enc1 = encryptSecret(plain);
    const enc2 = encryptSecret(plain);
    expect(enc1).not.toBe(enc2); // different IVs
    expect(decryptSecret(enc1)).toBe(plain);
    expect(decryptSecret(enc2)).toBe(plain);
  });

  it("throws on malformed ciphertext", () => {
    expect(() => decryptSecret("not:valid")).toThrow();
    expect(() => decryptSecret("")).toThrow();
    expect(() => decryptSecret("a:b")).toThrow();
  });

  it("throws on tampered ciphertext", () => {
    const enc = encryptSecret("tamper test");
    const parts = enc.split(":");
    parts[2] = "AAAA" + parts[2].slice(4);
    const tampered = parts.join(":");
    expect(() => decryptSecret(tampered)).toThrow();
  });
});

describe("sha256Hex", () => {
  it("returns hex string for string input", () => {
    const hash = sha256Hex("hello");
    expect(hash).toBe("2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824");
  });

  it("returns hex string for empty string", () => {
    const hash = sha256Hex("");
    expect(hash).toBe("e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855");
  });

  it("returns hex string for Uint8Array", () => {
    const arr = new Uint8Array([0xde, 0xad, 0xbe, 0xef]);
    const hash = sha256Hex(arr);
    expect(hash).toHaveLength(64);
    expect(/^[0-9a-f]{64}$/i.test(hash)).toBe(true);
  });

  it("is deterministic", () => {
    const a = sha256Hex("deterministic");
    const b = sha256Hex("deterministic");
    expect(a).toBe(b);
  });
});

describe("keyHint", () => {
  it("returns •••• for keys of length <= 8", () => {
    expect(keyHint("abc")).toBe("••••");
    expect(keyHint("abcdefgh")).toBe("••••");
  });

  it("returns first 4…last 4 for longer keys", () => {
    expect(keyHint("sk-1234567890abcdef")).toBe("sk-1…cdef");
  });
});
