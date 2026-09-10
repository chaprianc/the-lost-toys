const encoder = new TextEncoder();

const PASSWORD_PREFIX = "pbkdf2_sha256";
const PBKDF2_ITERATIONS = 210_000;

const bytesToHex = (bytes: Uint8Array) =>
  Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");

const hexToBytes = (hex: string) => {
  if (!/^[0-9a-f]+$/i.test(hex) || hex.length % 2 !== 0) return null;
  const bytes = new Uint8Array(hex.length / 2);
  for (let index = 0; index < bytes.length; index += 1) {
    bytes[index] = Number.parseInt(hex.slice(index * 2, index * 2 + 2), 16);
  }
  return bytes;
};

const constantTimeEqual = (left: Uint8Array, right: Uint8Array) => {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) {
    difference |= left[index] ^ right[index];
  }
  return difference === 0;
};

const derivePassword = async (password: string, salt: Uint8Array, iterations: number) => {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt, iterations },
    key,
    256,
  );
  return new Uint8Array(bits);
};

export const hashSha256 = async (value: string) => {
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(value));
  return bytesToHex(new Uint8Array(digest));
};

export const createSessionToken = () => {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return bytesToHex(bytes);
};

export const hashPassword = async (password: string) => {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hash = await derivePassword(password, salt, PBKDF2_ITERATIONS);
  return `${PASSWORD_PREFIX}$${PBKDF2_ITERATIONS}$${bytesToHex(salt)}$${bytesToHex(hash)}`;
};

export const verifyPassword = async (password: string, storedValue: string) => {
  const parts = storedValue.split("$");
  if (parts.length === 4 && parts[0] === PASSWORD_PREFIX) {
    const iterations = Number(parts[1]);
    const salt = hexToBytes(parts[2]);
    const expected = hexToBytes(parts[3]);
    if (!Number.isInteger(iterations) || iterations < 100_000 || !salt || !expected) {
      return { valid: false, needsUpgrade: false };
    }
    const actual = await derivePassword(password, salt, iterations);
    return { valid: constantTimeEqual(actual, expected), needsUpgrade: false };
  }

  const [actual, expected] = await Promise.all([
    crypto.subtle.digest("SHA-256", encoder.encode(password)),
    crypto.subtle.digest("SHA-256", encoder.encode(storedValue)),
  ]);
  return {
    valid: constantTimeEqual(new Uint8Array(actual), new Uint8Array(expected)),
    needsUpgrade: true,
  };
};

