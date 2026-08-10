import crypto from "crypto";

const ENCRYPTION_PREFIX = "enc:v1";
const MESSAGE_SECRET =
  process.env.MESSAGE_ENCRYPTION_SECRET ||
  "stylepins-dev-message-secret";

const getKey = () =>
  crypto
    .createHash("sha256")
    .update(MESSAGE_SECRET)
    .digest();

export const encryptMessageText = (text) => {
  if (typeof text !== "string" || !text.length) {
    return text;
  }

  if (text.startsWith(`${ENCRYPTION_PREFIX}:`)) {
    return text;
  }

  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(
    "aes-256-gcm",
    getKey(),
    iv
  );

  const ciphertext = Buffer.concat([
    cipher.update(text, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  return [
    ENCRYPTION_PREFIX,
    iv.toString("base64"),
    authTag.toString("base64"),
    ciphertext.toString("base64"),
  ].join(":");
};

export const decryptMessageText = (text) => {
  if (typeof text !== "string" || !text.length) {
    return text;
  }

  if (!text.startsWith(`${ENCRYPTION_PREFIX}:`)) {
    return text;
  }

  try {
    const [, ivValue, authTagValue, ciphertextValue] = text.split(":");
    const decipher = crypto.createDecipheriv(
      "aes-256-gcm",
      getKey(),
      Buffer.from(ivValue, "base64")
    );

    decipher.setAuthTag(Buffer.from(authTagValue, "base64"));

    const plaintext = Buffer.concat([
      decipher.update(Buffer.from(ciphertextValue, "base64")),
      decipher.final(),
    ]);

    return plaintext.toString("utf8");
  } catch (error) {
    console.error("Failed to decrypt message:", error);
    return text;
  }
};
