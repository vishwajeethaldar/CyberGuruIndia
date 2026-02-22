const express = require('express');
const adminController = require('../controllers/adminController');
const { ensureAuthenticated, ensureAdmin } = require('../middleware/auth');
const { csrfProtection } = require('../middleware/csrf');
const { upload, validateImageFile } = require('../middleware/upload');
const { validateVideo, validateCategory, validateBlog } = require('../middleware/validators');

const router = express.Router();

router.use(ensureAuthenticated, ensureAdmin);

router.get('/dashboard', adminController.dashboard);

router.get('/videos/new', adminController.renderVideoCreate);
router.post('/videos', upload.single('thumbnail'), validateImageFile, csrfProtection, validateVideo, adminController.createVideo);
router.get('/videos/:id/edit', adminController.renderVideoEdit);
router.put('/videos/:id', upload.single('thumbnail'), validateImageFile, csrfProtection, validateVideo, adminController.updateVideo);
router.delete('/videos/:id', csrfProtection, adminController.deleteVideo);
router.delete('/videos/:id/thumbnail', csrfProtection, adminController.removeVideoThumbnail);

router.get('/blogs', adminController.listBlogsAdmin);
router.get('/blogs/new', adminController.renderBlogCreate);
router.post('/blogs', upload.single('thumbnail'), validateImageFile, csrfProtection, validateBlog, adminController.createBlog);
router.get('/blogs/:id/edit', adminController.renderBlogEdit);
router.put('/blogs/:id', upload.single('thumbnail'), validateImageFile, csrfProtection, validateBlog, adminController.updateBlog);
router.delete('/blogs/:id', csrfProtection, adminController.deleteBlog);
router.delete('/blogs/:id/thumbnail', csrfProtection, adminController.removeBlogThumbnail);

router.get('/menu-settings', adminController.renderMenuSettings);
router.put('/menu-settings', csrfProtection, adminController.updateMenuSettings);

router.get('/categories', adminController.listCategories);
router.post('/categories', csrfProtection, validateCategory, adminController.createCategory);
router.put('/categories/:id', csrfProtection, validateCategory, adminController.updateCategory);
router.delete('/categories/:id', csrfProtection, adminController.deleteCategory);

router.get('/comments', adminController.listComments);
router.put('/comments/:id/approve', csrfProtection, adminController.approveComment);
router.put('/comments/:id/block', csrfProtection, adminController.blockComment);
router.delete('/comments/:id', csrfProtection, adminController.deleteComment);

module.exports = router;
