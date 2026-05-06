import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { clearAuthCookie, setAuthCookie } from '../utils/generateToken.js';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const normalizeAuthPayload = (payload) => ({
  name: String(payload.name || '').trim(),
  email: String(payload.email || '')
    .trim()
    .toLowerCase(),
  password: String(payload.password || ''),
});

const validateRegisterPayload = ({ name, email, password }) => {
  if (!name) {
    const error = new Error('Name is required');
    error.statusCode = 400;
    throw error;
  }

  if (!email || !emailRegex.test(email)) {
    const error = new Error('A valid email is required');
    error.statusCode = 400;
    throw error;
  }

  if (!password || password.length < 8) {
    const error = new Error('Password must be at least 8 characters');
    error.statusCode = 400;
    throw error;
  }
};

const validateLoginPayload = ({ email, password }) => {
  if (!email || !password) {
    const error = new Error('Email and password are required');
    error.statusCode = 400;
    throw error;
  }
};

const sanitizeUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  createdAt: user.createdAt,
});

export const registerUser = asyncHandler(async (req, res) => {
  const payload = normalizeAuthPayload(req.body);
  validateRegisterPayload(payload);

  const existingUser = await User.findOne({ email: payload.email });
  if (existingUser) {
    res.status(409);
    throw new Error('An account with this email already exists');
  }

  const hashedPassword = await bcrypt.hash(payload.password, 10);
  const user = await User.create({
    name: payload.name,
    email: payload.email,
    password: hashedPassword,
  });

  setAuthCookie(res, user._id.toString());

  res.status(201).json({
    success: true,
    data: sanitizeUser(user),
  });
});

export const loginUser = asyncHandler(async (req, res) => {
  const payload = normalizeAuthPayload(req.body);
  validateLoginPayload(payload);

  const user = await User.findOne({ email: payload.email }).select('+password');
  if (!user) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  const isMatch = await bcrypt.compare(payload.password, user.password);
  if (!isMatch) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  setAuthCookie(res, user._id.toString());

  res.status(200).json({
    success: true,
    data: sanitizeUser(user),
  });
});

export const logoutUser = asyncHandler(async (req, res) => {
  clearAuthCookie(res);

  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
});

export const getCurrentUser = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    data: sanitizeUser(req.user),
  });
});
