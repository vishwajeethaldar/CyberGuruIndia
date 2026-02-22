const express = require('express');
const rateLimit = require('express-rate-limit');
const commentController = require('../controllers/commentController');

const router = express.Router();

const interactionLimiter = rateLimit({
	windowMs: 10 * 60 * 1000,
	limit: 20,
	standardHeaders: true,
	legacyHeaders: false,
	message: 'Too many comments or votes from this IP. Please try later.',
});

router.post('/:id/vote', interactionLimiter, commentController.voteComment);

module.exports = router;
