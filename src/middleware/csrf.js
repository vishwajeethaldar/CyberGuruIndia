const crypto = require('crypto');
const { doubleCsrf } = require('csrf-csrf');

const isProduction = process.env.NODE_ENV === 'production';
const csrfCookieSecure = process.env.CSRF_COOKIE_SECURE === 'true';
const csrfCookieName = csrfCookieSecure ? '__Host-csrf' : 'csrf-token';
const csrfCookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  secure: csrfCookieSecure,
  path: '/',
};

const { doubleCsrfProtection } = doubleCsrf({
  getSecret: () => process.env.SESSION_SECRET || 'change-me',
  cookieName: csrfCookieName,
  cookieOptions: csrfCookieOptions,
  getTokenFromRequest: (req) => req.body?._csrf || req.headers['x-csrf-token'],
});

function setCsrfCookie(res, token) {
  const secret = process.env.SESSION_SECRET || 'change-me';
  const hash = crypto
    .createHash('sha256')
    .update(`${token}${secret}`)
    .digest('hex');
  res.cookie(csrfCookieName, hash, csrfCookieOptions);
}

function ensureCsrfToken(req, res) {
  if (req.session && req.session.csrfToken) {
    setCsrfCookie(res, req.session.csrfToken);
    return req.session.csrfToken;
  }

  const token = crypto.randomBytes(64).toString('hex');
  if (req.session) {
    req.session.csrfToken = token;
  }
  setCsrfCookie(res, token);
  return token;
}

function csrfProtection(req, res, next) {
  return doubleCsrfProtection(req, res, next);
}

module.exports = {
  csrfProtection,
  ensureCsrfToken,
  isProduction,
  csrfCookieSecure,
};
