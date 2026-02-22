const express = require('express');
const adminController = require('../controllers/adminController');
const { ensureAuthenticated, ensureAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { validateVideo, validateCategory, validateBlog } = require('../middleware/validators');

const router = express.Router();

router.use(ensureAuthenticated, ensureAdmin);

router.get('/dashboard', adminController.dashboard);

router.get('/videos/new', adminController.renderVideoCreate);
router.post('/videos', upload.single('thumbnail'), validateVideo, adminController.createVideo);
router.get('/videos/:id/edit', adminController.renderVideoEdit);
router.put('/videos/:id', upload.single('thumbnail'), validateVideo, adminController.updateVideo);
router.delete('/videos/:id', adminController.deleteVideo);
router.delete('/videos/:id/thumbnail', adminController.removeVideoThumbnail);

router.get('/blogs', adminController.listBlogsAdmin);
router.get('/blogs/new', adminController.renderBlogCreate);
router.post('/blogs', upload.single('thumbnail'), validateBlog, adminController.createBlog);
router.get('/blogs/:id/edit', adminController.renderBlogEdit);
router.put('/blogs/:id', upload.single('thumbnail'), validateBlog, adminController.updateBlog);
router.delete('/blogs/:id', adminController.deleteBlog);
router.delete('/blogs/:id/thumbnail', adminController.removeBlogThumbnail);

router.get('/menu-settings', adminController.renderMenuSettings);
router.put('/menu-settings', adminController.updateMenuSettings);

router.get('/categories', adminController.listCategories);
router.post('/categories', validateCategory, adminController.createCategory);
router.put('/categories/:id', validateCategory, adminController.updateCategory);
router.delete('/categories/:id', adminController.deleteCategory);

router.get('/comments', adminController.listComments);
router.put('/comments/:id/approve', adminController.approveComment);
router.put('/comments/:id/block', adminController.blockComment);
router.delete('/comments/:id', adminController.deleteComment);

module.exports = router;
