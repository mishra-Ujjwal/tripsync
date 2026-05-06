import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

export const protect = async (req, res, next) => {
  try {
    const token = req.cookies?.auth_token;

    if (!token) {
      res.status(401);
      throw new Error('Authentication required');
    }

    if (!process.env.JWT_SECRET) {
      res.status(500);
      throw new Error('JWT_SECRET is not configured');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('_id name email createdAt');

    if (!user) {
      res.status(401);
      throw new Error('Your session is no longer valid');
    }

    req.user = user;
    next();
  } catch (error) {
    if (!res.statusCode || res.statusCode === 200) {
      res.status(error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError' ? 401 : 500);
    }

    next(error);
  }
};
