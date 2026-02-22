const path = require('path');
const mongoose = require('mongoose');
const Video = require('../models/Video');
const Blog = require('../models/Blog');
const BlogComment = require('../models/BlogComment');
const MenuSettings = require('../models/MenuSettings');
const Category = require('../models/Category');
const Comment = require('../models/Comment');
const { extractYouTubeId } = require('../utils/youtube');

async function dashboard(req, res, next) {
  try {
    const [videoCount, blogCount, commentCount, blockedComments] = await Promise.all([
      Video.countDocuments(),
      Blog.countDocuments(),
      Comment.countDocuments(),
      Comment.countDocuments({ status: 'blocked' }),
    ]);

    const videos = await Video.find().populate('category').sort({ createdAt: -1 }).limit(10);

    return res.render('admin/dashboard', {
      title: 'Admin Dashboard',
      stats: { videoCount, blogCount, commentCount, blockedComments },
      videos,
    });
  } catch (error) {
    return next(error);
  }
}

async function renderVideoCreate(req, res, next) {
  try {
    const categories = await Category.find().sort({ name: 1 });
    return res.render('admin/video-form', {
      title: 'Add Video',
      categories,
      video: null,
      action: '/admin/videos',
      method: 'POST',
    });
  } catch (error) {
    return next(error);
  }
}

async function createVideo(req, res, next) {
  try {
    const youtubeId = extractYouTubeId(req.body.youtubeId);
    if (!youtubeId) {
      req.flash('error', 'Invalid YouTube URL or ID.');
      return res.redirect('/admin/videos/new');
    }

    const thumbnailPath = req.file ? path.posix.join('/uploads', path.basename(req.file.path)) : '';

    await Video.create({
      title: req.body.title,
      description: req.body.description,
      youtubeId,
      category: req.body.category,
      thumbnailPath,
      discussionEnabled: req.body.discussionEnabled === true || req.body.discussionEnabled === 'true' || req.body.discussionEnabled === 'on',
    });

    req.flash('success', 'Video added successfully.');
    return res.redirect('/admin/dashboard');
  } catch (error) {
    if (error.code === 11000) {
      req.flash('error', 'A video with this title slug already exists.');
      return res.redirect('/admin/videos/new');
    }
    return next(error);
  }
}

async function renderVideoEdit(req, res, next) {
  try {
    const [video, categories] = await Promise.all([
      Video.findById(req.params.id),
      Category.find().sort({ name: 1 }),
    ]);

    if (!video) return res.status(404).render('errors/404', { title: 'Video Not Found' });

    return res.render('admin/video-form', {
      title: 'Edit Video',
      categories,
      video,
      action: `/admin/videos/${video._id}?_method=PUT`,
      method: 'POST',
    });
  } catch (error) {
    return next(error);
  }
}

async function updateVideo(req, res, next) {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).render('errors/404', { title: 'Video Not Found' });

    const youtubeId = extractYouTubeId(req.body.youtubeId);
    if (!youtubeId) {
      req.flash('error', 'Invalid YouTube URL or ID.');
      return res.redirect(`/admin/videos/${video._id}/edit`);
    }

    video.title = req.body.title;
    video.description = req.body.description;
    video.youtubeId = youtubeId;
    video.category = req.body.category;
    video.discussionEnabled = req.body.discussionEnabled === true || req.body.discussionEnabled === 'true' || req.body.discussionEnabled === 'on';

    if (req.file) {
      video.thumbnailPath = path.posix.join('/uploads', path.basename(req.file.path));
    }

    await video.save();
    req.flash('success', 'Video updated successfully.');
    return res.redirect('/admin/dashboard');
  } catch (error) {
    return next(error);
  }
}

async function deleteVideo(req, res, next) {
  try {
    await Video.findByIdAndDelete(req.params.id);
    await Comment.deleteMany({ videoId: req.params.id });
    req.flash('success', 'Video deleted successfully.');
    return res.redirect('/admin/dashboard');
  } catch (error) {
    return next(error);
  }
}

async function listBlogsAdmin(req, res, next) {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    return res.render('admin/blogs', {
      title: 'Manage Blogs',
      blogs,
    });
  } catch (error) {
    return next(error);
  }
}

function renderBlogCreate(req, res) {
  return res.render('admin/blog-form', {
    title: 'Add Blog',
    blog: null,
    action: '/admin/blogs',
    method: 'POST',
  });
}

async function createBlog(req, res, next) {
  try {
    const thumbnailPath = req.file ? path.posix.join('/uploads', path.basename(req.file.path)) : '';

    await Blog.create({
      title: req.body.title,
      content: req.body.content,
      thumbnailPath,
      discussionEnabled: req.body.discussionEnabled === true || req.body.discussionEnabled === 'true' || req.body.discussionEnabled === 'on',
    });

    req.flash('success', 'Blog added successfully.');
    return res.redirect('/admin/blogs');
  } catch (error) {
    if (error.code === 11000) {
      req.flash('error', 'A blog with this title slug already exists.');
      return res.redirect('/admin/blogs/new');
    }
    return next(error);
  }
}

async function renderBlogEdit(req, res, next) {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).render('errors/404', { title: 'Blog Not Found' });

    return res.render('admin/blog-form', {
      title: 'Edit Blog',
      blog,
      action: `/admin/blogs/${blog._id}?_method=PUT`,
      method: 'POST',
    });
  } catch (error) {
    return next(error);
  }
}

async function updateBlog(req, res, next) {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).render('errors/404', { title: 'Blog Not Found' });

    blog.title = req.body.title;
    blog.content = req.body.content;
    blog.discussionEnabled = req.body.discussionEnabled === true || req.body.discussionEnabled === 'true' || req.body.discussionEnabled === 'on';

    if (req.file) {
      blog.thumbnailPath = path.posix.join('/uploads', path.basename(req.file.path));
    }

    await blog.save();
    req.flash('success', 'Blog updated successfully.');
    return res.redirect('/admin/blogs');
  } catch (error) {
    return next(error);
  }
}

async function deleteBlog(req, res, next) {
  try {
    await Blog.findByIdAndDelete(req.params.id);
    await BlogComment.deleteMany({ blogId: req.params.id });
    req.flash('success', 'Blog deleted successfully.');
    return res.redirect('/admin/blogs');
  } catch (error) {
    return next(error);
  }
}

async function renderMenuSettings(req, res, next) {
  try {
    const menuSettings = await MenuSettings.findOneAndUpdate(
      {},
      { $setOnInsert: { showVideosMenu: true, showBlogsMenu: true } },
      { upsert: true, new: true }
    );
    return res.render('admin/menu-settings', {
      title: 'Menu Settings',
      menuSettings,
    });
  } catch (error) {
    return next(error);
  }
}

async function updateMenuSettings(req, res, next) {
  try {
    await MenuSettings.findOneAndUpdate(
      {},
      {
        showVideosMenu: req.body.showVideosMenu === 'on',
        showBlogsMenu: req.body.showBlogsMenu === 'on',
      },
      { upsert: true }
    );
    req.flash('success', 'Menu settings updated.');
    return res.redirect('/admin/menu-settings');
  } catch (error) {
    return next(error);
  }
}

async function listCategories(req, res, next) {
  try {
    const categories = await Category.find().sort({ name: 1 });
    return res.render('admin/categories', { title: 'Manage Categories', categories });
  } catch (error) {
    return next(error);
  }
}

async function createCategory(req, res, next) {
  try {
    await Category.create({ name: req.body.name });
    req.flash('success', 'Category created.');
    return res.redirect('/admin/categories');
  } catch (error) {
    if (error.code === 11000) {
      req.flash('error', 'Category already exists.');
      return res.redirect('/admin/categories');
    }
    return next(error);
  }
}

async function updateCategory(req, res, next) {
  try {
    await Category.findByIdAndUpdate(req.params.id, { name: req.body.name });
    req.flash('success', 'Category updated.');
    return res.redirect('/admin/categories');
  } catch (error) {
    return next(error);
  }
}

async function deleteCategory(req, res, next) {
  try {
    const linkedVideos = await Video.countDocuments({ category: req.params.id });
    if (linkedVideos > 0) {
      req.flash('error', 'Category cannot be deleted while videos are assigned to it.');
      return res.redirect('/admin/categories');
    }

    await Category.findByIdAndDelete(req.params.id);
    req.flash('success', 'Category deleted.');
    return res.redirect('/admin/categories');
  } catch (error) {
    return next(error);
  }
}

async function listComments(req, res, next) {
  try {
    const videos = await Video.find({}, 'title slug').sort({ createdAt: -1 });
    const selectedVideoId = req.query.videoId || '';

    const filter = {};
    if (selectedVideoId && mongoose.Types.ObjectId.isValid(selectedVideoId)) {
      filter.videoId = selectedVideoId;
    }

    const comments = filter.videoId
      ? await Comment.find(filter)
          .populate('videoId', 'title slug')
          .sort({ createdAt: -1 })
          .limit(300)
      : [];

    return res.render('admin/comments', {
      title: 'Moderate Comments',
      videos,
      comments,
      filters: {
        videoId: selectedVideoId,
      },
    });
  } catch (error) {
    return next(error);
  }
}

async function approveComment(req, res, next) {
  try {
    await Comment.findByIdAndUpdate(req.params.id, { status: 'approved' });
    req.flash('success', 'Comment approved.');
    return res.redirect(req.get('referer') || '/admin/comments');
  } catch (error) {
    return next(error);
  }
}

async function blockComment(req, res, next) {
  try {
    await Comment.findByIdAndUpdate(req.params.id, { status: 'blocked' });
    req.flash('success', 'Comment blocked.');
    return res.redirect(req.get('referer') || '/admin/comments');
  } catch (error) {
    return next(error);
  }
}

async function deleteComment(req, res, next) {
  try {
    await Comment.findByIdAndDelete(req.params.id);
    req.flash('success', 'Comment deleted.');
    return res.redirect(req.get('referer') || '/admin/comments');
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  dashboard,
  renderVideoCreate,
  createVideo,
  renderVideoEdit,
  updateVideo,
  deleteVideo,
  listBlogsAdmin,
  renderBlogCreate,
  createBlog,
  renderBlogEdit,
  updateBlog,
  deleteBlog,
  renderMenuSettings,
  updateMenuSettings,
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  listComments,
  approveComment,
  blockComment,
  deleteComment,
};
