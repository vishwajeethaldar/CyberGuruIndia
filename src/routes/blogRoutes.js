const express = require('express');
const rateLimit = require('express-rate-limit');
const blogController = require('../controllers/blogController');
const { csrfProtection } = require('../middleware/csrf');
const { validateComment, validateBlogSlug, validateBlogSearch } = require('../middleware/validators');

const router = express.Router();

const interactionLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many comments or votes from this IP. Please try later.',
});

router.get('/', validateBlogSearch, blogController.listBlogs);
router.get('/:slug', validateBlogSlug, blogController.blogDetail);
router.post('/:slug/comments', interactionLimiter, csrfProtection, validateBlogSlug, validateComment, blogController.createBlogComment);
router.post('/:id/vote', interactionLimiter, csrfProtection, blogController.voteBlog);

module.exports = router;
