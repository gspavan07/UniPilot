import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
// Ensure key is 32 bytes (256 bits)
// In production, use process.env.ENCRYPTION_KEY
const SECRET_KEY = process.env.ENCRYPTION_KEY;
const IV_LENGTH = 16;

if (!SECRET_KEY) {
  throw new Error("ENCRYPTION_KEY is not set in environment variables");
}

let secretKeyBuffer;
if (SECRET_KEY.length === 64) {
  secretKeyBuffer = Buffer.from(SECRET_KEY, "hex");
} else {
  secretKeyBuffer = Buffer.from(SECRET_KEY).slice(0, 32);
}

if (!secretKeyBuffer || secretKeyBuffer.length !== 32) {
  throw new Error("Invalid ENCRYPTION_KEY length in .env. Must map to 32 bytes.");
}

export const encrypt = (text) => {
  if (!text) return text;
  try {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(
      ALGORITHM,
      secretKeyBuffer,
      iv
    );
    let encrypted = cipher.update(String(text));
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    const authTag = cipher.getAuthTag();
    return iv.toString("hex") + ":" + authTag.toString("hex") + ":" + encrypted.toString("hex");
  } catch (err) {
    console.error("Encryption error:", err);
    return text;
  }
};

export const decrypt = (text) => {
  if (!text || typeof text !== "string" || !text.includes(":")) return text;
  try {
    const textParts = text.split(":");

    if (textParts.length === 3) {
      // Format: aes-256-gcm (iv:authTag:encryptedText)
      const iv = Buffer.from(textParts[0], "hex");
      const authTag = Buffer.from(textParts[1], "hex");
      const encryptedText = Buffer.from(textParts[2], "hex");

      const decipher = crypto.createDecipheriv(
        ALGORITHM,
        secretKeyBuffer,
        iv
      );
      decipher.setAuthTag(authTag);
      let decrypted = decipher.update(encryptedText);
      decrypted = Buffer.concat([decrypted, decipher.final()]);
      return decrypted.toString();
    }

    return text;
  } catch (e) {
    return text;
  }
};
