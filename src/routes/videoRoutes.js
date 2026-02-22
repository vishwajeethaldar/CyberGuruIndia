const express = require('express');
const rateLimit = require('express-rate-limit');
const videoController = require('../controllers/videoController');
const commentController = require('../controllers/commentController');
const voteController = require('../controllers/voteController');
const { validateComment, validateSearch, validateVideoSlug } = require('../middleware/validators');

const router = express.Router();

const interactionLimiter = rateLimit({
	windowMs: 10 * 60 * 1000,
	limit: 20,
	standardHeaders: true,
	legacyHeaders: false,
	message: 'Too many comments or votes from this IP. Please try later.',
});

router.get('/', validateSearch, videoController.listVideos);
router.get('/:slug', validateVideoSlug, videoController.videoDetail);
router.post('/:slug/comments', interactionLimiter, validateVideoSlug, validateComment, commentController.createComment);
router.post('/:id/vote', interactionLimiter, voteController.voteVideo);

module.exports = router;
