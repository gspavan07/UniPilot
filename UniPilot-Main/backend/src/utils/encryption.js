const crypto = require("crypto");

const ALGORITHM = "aes-256-cbc";
// Ensure key is 32 bytes (256 bits)
// In production, use process.env.ENCRYPTION_KEY
const SECRET_KEY =
  process.env.ENCRYPTION_KEY || "12345678901234567890123456789012";
const IV_LENGTH = 16;

exports.encrypt = (text) => {
  if (!text) return text;
  try {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(
      ALGORITHM,
      Buffer.from(SECRET_KEY),
      iv
    );
    let encrypted = cipher.update(String(text));
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString("hex") + ":" + encrypted.toString("hex");
  } catch (err) {
    console.error("Encryption error:", err);
    return text;
  }
};

exports.decrypt = (text) => {
  if (!text || typeof text !== "string" || !text.includes(":")) return text;
  try {
    const textParts = text.split(":");
    const iv = Buffer.from(textParts.shift(), "hex");
    const encryptedText = Buffer.from(textParts.join(":"), "hex");
    const decipher = crypto.createDecipheriv(
      ALGORITHM,
      Buffer.from(SECRET_KEY),
      iv
    );
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  } catch (e) {
    // Return original text if decryption fails (handling legacy unencrypted data)
    return text;
  }
};
