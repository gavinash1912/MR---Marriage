import crypto from 'crypto';

const COOKIE_NAME = 'aa_owner_access';
const TOKEN_TTL_SECONDS = 60 * 60 * 24 * 30;
const DEFAULT_OWNER_ACCESS_CODE = 'AA-Owner-7K9M-2026-QX4P';

function base64Url(input) {
  return Buffer.from(input)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function fromBase64Url(input) {
  const padded = input + '='.repeat((4 - (input.length % 4)) % 4);
  return Buffer.from(padded.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8');
}

function timingSafeStringEqual(a, b) {
  const left = Buffer.from(String(a));
  const right = Buffer.from(String(b));
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

function getOwnerAccessCode() {
  return process.env.OWNER_ACCESS_CODE || DEFAULT_OWNER_ACCESS_CODE;
}

function getSigningSecret() {
  return process.env.SITE_ACCESS_SECRET || getOwnerAccessCode();
}

function signPayload(payload) {
  return base64Url(
    crypto
      .createHmac('sha256', getSigningSecret())
      .update(payload)
      .digest()
  );
}

function parseCookies(cookieHeader = '') {
  return String(cookieHeader)
    .split(';')
    .map(part => part.trim())
    .filter(Boolean)
    .reduce((cookies, part) => {
      const separator = part.indexOf('=');
      if (separator === -1) return cookies;

      const key = decodeURIComponent(part.slice(0, separator).trim());
      const value = decodeURIComponent(part.slice(separator + 1).trim());
      cookies[key] = value;
      return cookies;
    }, {});
}

export function siteIsInactive() {
  const value = process.env.SITE_INACTIVE ?? process.env.VITE_SITE_INACTIVE;
  return value !== 'false';
}

export function isValidOwnerCode(code) {
  return timingSafeStringEqual(String(code || '').trim(), getOwnerAccessCode());
}

export function createOwnerToken() {
  const payload = base64Url(JSON.stringify({
    scope: 'owner',
    exp: Date.now() + TOKEN_TTL_SECONDS * 1000,
  }));

  return `${payload}.${signPayload(payload)}`;
}

export function isValidOwnerToken(token) {
  const [payload, signature] = String(token || '').split('.');
  if (!payload || !signature) return false;

  if (!timingSafeStringEqual(signature, signPayload(payload))) {
    return false;
  }

  try {
    const data = JSON.parse(fromBase64Url(payload));
    return data.scope === 'owner' && Number(data.exp) > Date.now();
  } catch {
    return false;
  }
}

export function isOwnerRequest(req) {
  const cookies = parseCookies(req.headers.cookie);
  return isValidOwnerToken(cookies[COOKIE_NAME]);
}

export function setOwnerAccessCookie(req, res) {
  const token = createOwnerToken();
  const isSecure = req.headers['x-forwarded-proto'] === 'https' || process.env.VERCEL === '1';
  const secureFlag = isSecure ? '; Secure' : '';

  res.setHeader(
    'Set-Cookie',
    `${COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${TOKEN_TTL_SECONDS}${secureFlag}`
  );
}

export function requireOwnerAccess(req, res) {
  if (isOwnerRequest(req)) return true;

  res.status(401).json({ error: 'Owner access required' });
  return false;
}
