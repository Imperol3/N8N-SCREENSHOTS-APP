import crypto from 'crypto';

export function getAuthToken() {
    const pwd = process.env.ADMIN_PASSWORD;
    if (!pwd) return null;

    // Create a stable hash of the password to use as a cookie value
    return crypto.createHash('sha256').update(pwd).digest('hex');
}
