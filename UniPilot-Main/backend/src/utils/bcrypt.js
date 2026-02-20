import argon2 from 'argon2';

/**
 * Hash a password using Argon2id with a server-side pepper
 * @param {string} password - Plain text password
 * @returns {Promise<string>} Hashed password
 */
export const hashPassword = async (password) => {
  const pepper = process.env.PASSWORD_PEPPER || '';
  const peppered = `${password}${pepper}`;
  return argon2.hash(peppered, { type: argon2.argon2id });
};

/**
 * Compare password with hash using Argon2id + pepper
 * @param {string} password - Plain text password
 * @param {string} hash - Hashed password
 * @returns {Promise<boolean>} True if password matches
 */
export const comparePassword = async (password, hash) => {
  const pepper = process.env.PASSWORD_PEPPER || '';
  const peppered = `${password}${pepper}`;
  try {
    return await argon2.verify(hash, peppered);
  } catch (e) {
    return false;
  }
};
