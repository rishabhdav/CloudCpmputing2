const User = require('../models/User');
const { hashPassword, signToken, verifyPassword } = require('../utils/auth');

const sanitizeUser = (user) => ({
  id: user._id.toString(),
  name: user.name,
  email: user.email
});

const signup = async (req, res, next) => {
  try {
    const name = req.body?.name?.trim();
    const email = req.body?.email?.trim().toLowerCase();
    const password = req.body?.password;

    if (!name || !email || !password) {
      res.status(400);
      throw new Error('Name, email, and password are required.');
    }

    if (password.length < 6) {
      res.status(400);
      throw new Error('Password must be at least 6 characters.');
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      res.status(409);
      throw new Error('User already exists with this email.');
    }

    const { salt, passwordHash } = hashPassword(password);
    const user = await User.create({
      name,
      email,
      passwordHash,
      passwordSalt: salt
    });

    const safeUser = sanitizeUser(user);
    const token = signToken({ userId: safeUser.id });

    res.status(201).json({ user: safeUser, token });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const email = req.body?.email?.trim().toLowerCase();
    const password = req.body?.password;

    if (!email || !password) {
      res.status(400);
      throw new Error('Email and password are required.');
    }

    const user = await User.findOne({ email });

    if (!user || !verifyPassword(password, user.passwordHash, user.passwordSalt)) {
      res.status(401);
      throw new Error('Invalid email or password.');
    }

    const safeUser = sanitizeUser(user);
    const token = signToken({ userId: safeUser.id });

    res.status(200).json({ user: safeUser, token });
  } catch (error) {
    next(error);
  }
};

const getCurrentUser = async (req, res) => {
  res.status(200).json({ user: req.user });
};

module.exports = {
  getCurrentUser,
  login,
  signup
};
