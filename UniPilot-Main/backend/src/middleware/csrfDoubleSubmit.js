import crypto from 'crypto';

export const genCsrfToken = () => {
    return crypto.randomBytes(32).toString('hex');
};

export const setCsrfCookie = (res, token, options = {}) => {
    res.cookie('csrf_token', token, options);
};

export const verifyCsrfHeader = (req, res, next) => {
    const cookieToken = req.cookies?.['csrf_token'];
    const headerToken = req.headers['x-csrf-token'];

    if (!cookieToken || !headerToken) {
        return res.status(403).json({ error: 'CSRF token missing' });
    }
    if (cookieToken !== headerToken) {
        return res.status(403).json({ error: 'CSRF token mismatch' });
    }
    next();
};
