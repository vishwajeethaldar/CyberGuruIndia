const Comment = require('../models/Comment');
const Video = require('../models/Video');

async function createComment(req, res, next) {
  try {
    const video = await Video.findOne({ slug: req.params.slug });
    if (!video) return res.status(404).render('errors/404', { title: 'Video Not Found' });

    if (!video.discussionEnabled) {
      req.flash('error', 'Discussion is disabled for this video.');
      return res.redirect(`/videos/${video.slug}`);
    }

    await Comment.create({
      videoId: video._id,
      parentCommentId: req.body.parentCommentId || null,
      authorName: req.body.authorName,
      message: req.body.message,
      status: 'approved',
    });

    req.flash('success', 'Comment posted successfully.');
    return res.redirect(`/videos/${video.slug}`);
  } catch (error) {
    return next(error);
  }
}

function getCommentVoteMap(req) {
  if (!req.session.commentVotes) req.session.commentVotes = {};
  return req.session.commentVotes;
}

async function voteComment(req, res, next) {
  try {
    const { id } = req.params;
    const { type } = req.body;

    if (!['like', 'dislike'].includes(type)) {
      return res.status(400).json({ message: 'Invalid vote type.' });
    }

    const comment = await Comment.findById(id);
    if (!comment) return res.status(404).json({ message: 'Comment not found.' });

    const voteMap = getCommentVoteMap(req);
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
    req.session.commentVotes = voteMap;

    await comment.save();

    return res.json({ likes: comment.likes, dislikes: comment.dislikes, message: 'Vote recorded.' });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  createComment,
  voteComment,
};
