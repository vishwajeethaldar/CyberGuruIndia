const Blog = require('../models/Blog');
const BlogComment = require('../models/BlogComment');
const Category = require('../models/Category');

function buildCommentTree(flatComments) {
  const map = new Map();
  const roots = [];

  flatComments.forEach((comment) => {
    map.set(String(comment._id), { ...comment.toObject(), replies: [] });
  });

  map.forEach((commentNode) => {
    if (commentNode.parentCommentId) {
      const parent = map.get(String(commentNode.parentCommentId));
      if (parent) parent.replies.push(commentNode);
      else roots.push(commentNode);
    } else {
      roots.push(commentNode);
    }
  });

  return roots;
}

async function listBlogs(req, res, next) {
  try {
    const { q = '', category = '' } = req.query;
    const filter = {};
    if (q) filter.$text = { $search: q };
    if (category) filter.category = category;

    const [blogs, categories] = await Promise.all([
      Blog.find(filter).populate('category').sort({ createdAt: -1 }),
      Category.find().sort({ name: 1 }),
    ]);

    return res.render('blogs/index', {
      title: `${res.locals.siteName} Blogs`,
      blogs,
      categories,
      filters: { q, category },
    });
  } catch (error) {
    return next(error);
  }
}

async function blogDetail(req, res, next) {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug }).populate('category');
    if (!blog) return res.status(404).render('errors/404', { title: 'Blog Not Found' });

    const approvedComments = await BlogComment.find({ blogId: blog._id, status: 'approved' }).sort({ createdAt: 1 });
    const commentsTree = buildCommentTree(approvedComments);

    return res.render('blogs/detail', {
      title: blog.title,
      blog,
      commentsTree,
    });
  } catch (error) {
    return next(error);
  }
}

async function createBlogComment(req, res, next) {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug });
    if (!blog) return res.status(404).render('errors/404', { title: 'Blog Not Found' });

    if (!blog.discussionEnabled) {
      req.flash('error', 'Discussion is disabled for this blog.');
      return res.redirect(`/blogs/${blog.slug}`);
    }

    await BlogComment.create({
      blogId: blog._id,
      parentCommentId: req.body.parentCommentId || null,
      authorName: req.body.authorName,
      message: req.body.message,
      status: 'approved',
    });

    req.flash('success', 'Comment posted successfully.');
    return res.redirect(`/blogs/${blog.slug}`);
  } catch (error) {
    return next(error);
  }
}

function getBlogVoteMap(req) {
  if (!req.session.blogVotes) req.session.blogVotes = {};
  return req.session.blogVotes;
}

async function voteBlog(req, res, next) {
  try {
    const { id } = req.params;
    const { type } = req.body;

    if (!['like', 'dislike'].includes(type)) {
      return res.status(400).json({ message: 'Invalid vote type.' });
    }

    const blog = await Blog.findById(id);
    if (!blog) return res.status(404).json({ message: 'Blog not found.' });

    const voteMap = getBlogVoteMap(req);
    const voteKey = `${id}:${req.ip}`;
    const previous = voteMap[voteKey];

    if (previous === type) {
      return res.status(409).json({ message: 'Already voted.', likes: blog.likes, dislikes: blog.dislikes });
    }

    if (previous === 'like' && blog.likes > 0) blog.likes -= 1;
    if (previous === 'dislike' && blog.dislikes > 0) blog.dislikes -= 1;

    if (type === 'like') blog.likes += 1;
    else blog.dislikes += 1;

    voteMap[voteKey] = type;
    req.session.blogVotes = voteMap;

    await blog.save();

    return res.json({ likes: blog.likes, dislikes: blog.dislikes, message: 'Vote recorded.' });
  } catch (error) {
    return next(error);
  }
}

function getBlogCommentVoteMap(req) {
  if (!req.session.blogCommentVotes) req.session.blogCommentVotes = {};
  return req.session.blogCommentVotes;
}

async function voteBlogComment(req, res, next) {
  try {
    const { id } = req.params;
    const { type } = req.body;

    if (!['like', 'dislike'].includes(type)) {
      return res.status(400).json({ message: 'Invalid vote type.' });
    }

    const comment = await BlogComment.findById(id);
    if (!comment) return res.status(404).json({ message: 'Comment not found.' });

    const voteMap = getBlogCommentVoteMap(req);
    const voteKey = `${id}:${req.ip}`;
    const previous = voteMap[voteKey];

    if (previous === type) {
      return res.status(409).json({ message: 'Already voted.', likes: comment.likes, dislikes: comment.dislikes });
    }

    if (previous === 'like' && comment.likes > 0) comment.likes -= 1;
    if (previous === 'dislike' && comment.dislikes > 0) comment.dislikes -= 1;

    if (type === 'like') comment.likes += 1;
    else comment.dislikes += 1;

    voteMap[voteKey] = type;
    req.session.blogCommentVotes = voteMap;

    await comment.save();

    return res.json({ likes: comment.likes, dislikes: comment.dislikes, message: 'Vote recorded.' });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  listBlogs,
  blogDetail,
  createBlogComment,
  voteBlog,
  voteBlogComment,
};
