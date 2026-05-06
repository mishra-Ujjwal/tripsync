import jwt from 'jsonwebtoken';

const LOCAL_FRONTEND_ORIGIN = 'http://localhost:5173';

const isLocalRequest = (req) => {
  const origin = String(req?.headers?.origin || '').trim();
  return origin === LOCAL_FRONTEND_ORIGIN;
};

const getCookieOptions = (req) => {
  const localRequest = isLocalRequest(req);

  return {
    httpOnly: true,
    secure: !localRequest,
    sameSite: localRequest ? 'lax' : 'none',
    partitioned: localRequest ? undefined : true,
    maxAge: 1000 * 60 * 60 * 24 * 7,
    path: '/',
  };
};

export const signAuthToken = (userId) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }

  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
};

export const setAuthCookie = (req, res, userId) => {
  const token = signAuthToken(userId);
  res.cookie('auth_token', token, getCookieOptions(req));
};

export const clearAuthCookie = (req, res) => {
  res.clearCookie('auth_token', {
    ...getCookieOptions(req),
    maxAge: undefined,
    expires: new Date(0),
  });
};
