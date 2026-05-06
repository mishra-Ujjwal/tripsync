export const notFound = (req, res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  res.status(404);
  next(error);
};

export const errorHandler = (error, req, res, next) => {
  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  const duplicateKeyError = error?.code === 11000;
  const message = duplicateKeyError ? 'A record with this value already exists' : error.message || 'Something went wrong';

  res.status(statusCode).json({
    message,
    stack: process.env.NODE_ENV === 'production' ? undefined : error.stack,
  });
};
