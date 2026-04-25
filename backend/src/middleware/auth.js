const User = require('../models/User');
const { verifyToken } = require('../utils/auth');

const protect = async (req, res, next) => {
  try {
    const authorizationHeader = req.header('authorization');

    if (!authorizationHeader?.startsWith('Bearer ')) {
      res.status(401);
      throw new Error('Authentication required.');
    }

    const token = authorizationHeader.replace('Bearer ', '').trim();
    const payload = verifyToken(token);
    const user = await User.findById(payload.userId).select('-passwordHash -passwordSalt');

    if (!user) {
      res.status(401);
      throw new Error('User not found.');
    }

    req.user = {
      id: user._id.toString(),
      name: user.name,
      email: user.email
    };

    next();
  } catch (error) {
    if (!res.statusCode || res.statusCode === 200) {
      res.status(401);
    }

    next(error);
  }
};

module.exports = protect;
