const Video = require('../models/Video');
const Category = require('../models/Category');
const Comment = require('../models/Comment');

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

async function listVideos(req, res, next) {
  try {
    const { q = '', category = '' } = req.query;

    const filter = {};
    if (q) filter.$text = { $search: q };
    if (category) filter.category = category;

    const [videos, categories] = await Promise.all([
      Video.find(filter).populate('category').sort({ createdAt: -1 }),
      Category.find().sort({ name: 1 }),
    ]);

    return res.render('videos/index', {
      title: 'CyberGuruIndia Videos',
      videos,
      categories,
      filters: { q, category },
    });
  } catch (error) {
    return next(error);
  }
}

async function videoDetail(req, res, next) {
  try {
    const video = await Video.findOne({ slug: req.params.slug }).populate('category');
    if (!video) return res.status(404).render('errors/404', { title: 'Video Not Found' });

    const approvedComments = await Comment.find({ videoId: video._id, status: 'approved' }).sort({ createdAt: 1 });
    const commentsTree = buildCommentTree(approvedComments);

    return res.render('videos/detail', {
      title: video.title,
      video,
      commentsTree,
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  listVideos,
  videoDetail,
};
