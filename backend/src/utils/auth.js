const crypto = require('crypto');

const TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

const getTokenSecret = () => process.env.AUTH_TOKEN_SECRET || 'change-this-secret';

const hashPassword = (password, salt = crypto.randomBytes(16).toString('hex')) => {
  const passwordHash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');

  return {
    salt,
    passwordHash
  };
};

const verifyPassword = (password, passwordHash, salt) => {
  const hashedAttempt = hashPassword(password, salt);
  return crypto.timingSafeEqual(Buffer.from(hashedAttempt.passwordHash, 'hex'), Buffer.from(passwordHash, 'hex'));
};

const signToken = (payload) => {
  const tokenPayload = {
    ...payload,
    exp: Date.now() + TOKEN_TTL_MS
  };

  const encodedPayload = Buffer.from(JSON.stringify(tokenPayload)).toString('base64url');
  const signature = crypto.createHmac('sha256', getTokenSecret()).update(encodedPayload).digest('base64url');

  return `${encodedPayload}.${signature}`;
};

const verifyToken = (token) => {
  if (!token || !token.includes('.')) {
    throw new Error('Invalid token.');
  }

  const [encodedPayload, providedSignature] = token.split('.');
  const expectedSignature = crypto.createHmac('sha256', getTokenSecret()).update(encodedPayload).digest('base64url');

  if (providedSignature !== expectedSignature) {
    throw new Error('Invalid token signature.');
  }

  const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8'));

  if (!payload.exp || payload.exp < Date.now()) {
    throw new Error('Token expired.');
  }

  return payload;
};

module.exports = {
  hashPassword,
  signToken,
  verifyPassword,
  verifyToken
};
