const express = require('express');
const rateLimit = require('express-rate-limit');
const authController = require('../controllers/authController');

const router = express.Router();

const loginLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	limit: 10,
	standardHeaders: true,
	legacyHeaders: false,
	message: 'Too many login attempts. Please try again later.',
});

router.get('/login', authController.renderLogin);
router.post('/login', loginLimiter, authController.login);
router.post('/logout', authController.logout);

module.exports = router;
