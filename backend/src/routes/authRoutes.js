const express = require('express');

const { getCurrentUser, login, signup } = require('../controllers/authController');
const protect = require('../middleware/auth');

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/me', protect, getCurrentUser);

module.exports = router;
