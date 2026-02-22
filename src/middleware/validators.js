const { body, query, param, validationResult } = require('express-validator');
const sanitizeHtml = require('sanitize-html');
const { extractYouTubeId } = require('../utils/youtube');

function handleValidation(req, res, next) {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();

  return res.status(400).render('errors/400', {
    title: 'Validation Error',
    errors: errors.array(),
  });
}

const sanitizeText = (value) => sanitizeHtml(value, { allowedTags: [], allowedAttributes: {} }).trim();

const validateVideo = [
  body('title').isLength({ min: 3, max: 160 }).withMessage('Title must be between 3 and 160 characters.').customSanitizer(sanitizeText),
  body('description').isLength({ min: 10, max: 3000 }).withMessage('Description must be between 10 and 3000 characters.').customSanitizer(sanitizeText),
  body('youtubeId').isLength({ min: 6, max: 200 }).withMessage('Invalid YouTube URL or ID.').trim().custom((value) => {
    if (!extractYouTubeId(value)) {
      throw new Error('Invalid YouTube URL or ID.');
    }
    return true;
  }),
  body('category').isMongoId().withMessage('Invalid category.'),
  body('discussionEnabled').optional().toBoolean(),
  handleValidation,
];

const validateCategory = [
  body('name').isLength({ min: 2, max: 80 }).withMessage('Category name must be between 2 and 80 characters.').customSanitizer(sanitizeText),
  handleValidation,
];

const validateComment = [
  body('authorName').isLength({ min: 2, max: 80 }).withMessage('Name must be between 2 and 80 characters.').customSanitizer(sanitizeText),
  body('message').isLength({ min: 2, max: 1000 }).withMessage('Message must be between 2 and 1000 characters.').customSanitizer(sanitizeText),
  body('parentCommentId').optional({ values: 'falsy' }).isMongoId().withMessage('Invalid parent comment id.'),
  handleValidation,
];

const validateVideoSlug = [
  param('slug').isSlug().withMessage('Invalid video slug.'),
  handleValidation,
];

const validateBlogSlug = [
  param('slug').isSlug().withMessage('Invalid blog slug.'),
  handleValidation,
];

const validateSearch = [
  query('q').optional().isLength({ max: 120 }).withMessage('Search query too long.').customSanitizer(sanitizeText),
  query('category').optional({ values: 'falsy' }).isMongoId().withMessage('Invalid category filter.'),
  handleValidation,
];

const validateBlogSearch = [
  query('q').optional().isLength({ max: 120 }).withMessage('Search query too long.').customSanitizer(sanitizeText),
  handleValidation,
];

const validateBlog = [
  body('title').isLength({ min: 3, max: 160 }).withMessage('Title must be between 3 and 160 characters.').customSanitizer(sanitizeText),
  body('content').isLength({ min: 10, max: 10000 }).withMessage('Content must be between 10 and 10000 characters.').customSanitizer(sanitizeText),
  body('discussionEnabled').optional().toBoolean(),
  handleValidation,
];

module.exports = {
  validateVideo,
  validateCategory,
  validateComment,
  validateVideoSlug,
  validateBlogSlug,
  validateSearch,
  validateBlogSearch,
  validateBlog,
};
