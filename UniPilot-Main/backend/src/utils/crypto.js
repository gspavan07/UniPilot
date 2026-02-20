import crypto from 'crypto';

/**
 * Generate a long random string for a refresh token
 */
export const genRefreshToken = () => {
    return crypto.randomBytes(64).toString('hex');
};

/**
 * Hash a plain token for DB storage
 * @param {string} token 
 */
export const hashToken = (token) => {
    return crypto.createHash('sha256').update(token).digest('hex');
};
