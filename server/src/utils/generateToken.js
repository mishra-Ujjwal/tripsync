import jwt from 'jsonwebtoken';

const isLocalClientUrl = (url) =>
  /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(String(url || '').trim());

const getCookieOptions = () => {
  const clientUrl = String(process.env.CLIENT_URL || '').trim();
  const isProduction = process.env.NODE_ENV === 'production';
  const useSecureCookie = isProduction || clientUrl.startsWith('https://');
  const useCrossSiteCookie = useSecureCookie && clientUrl && !isLocalClientUrl(clientUrl);

  return {
    httpOnly: true,
    secure: useSecureCookie,
    sameSite: useCrossSiteCookie ? 'none' : 'lax',
    partitioned: useCrossSiteCookie ? true : undefined,
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
