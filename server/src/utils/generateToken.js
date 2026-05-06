import jwt from 'jsonwebtoken';

const getCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === 'production';

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
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

export const setAuthCookie = (res, userId) => {
  const token = signAuthToken(userId);
  res.cookie('auth_token', token, getCookieOptions());
};

export const clearAuthCookie = (res) => {
  res.clearCookie('auth_token', {
    ...getCookieOptions(),
    maxAge: undefined,
    expires: new Date(0),
  });
};
