const Video = require('../models/Video');

function getVideoVoteMap(req) {
  if (!req.session.videoVotes) req.session.videoVotes = {};
  return req.session.videoVotes;
}

async function voteVideo(req, res, next) {
  try {
    const { id } = req.params;
    const { type } = req.body;

    if (!['like', 'dislike'].includes(type)) {
      return res.status(400).json({ message: 'Invalid vote type.' });
    }

    const video = await Video.findById(id);
    if (!video) return res.status(404).json({ message: 'Video not found.' });

    const voteMap = getVideoVoteMap(req);
    const voteKey = `${id}:${req.ip}`;
    const previous = voteMap[voteKey];

    if (previous === type) {
      return res.status(409).json({ message: 'Already voted.', likes: video.likes, dislikes: video.dislikes });
    }

    if (previous === 'like' && video.likes > 0) video.likes -= 1;
    if (previous === 'dislike' && video.dislikes > 0) video.dislikes -= 1;

    if (type === 'like') video.likes += 1;
    else video.dislikes += 1;

    voteMap[voteKey] = type;
    req.session.videoVotes = voteMap;

    await video.save();

    return res.json({ likes: video.likes, dislikes: video.dislikes, message: 'Vote recorded.' });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  voteVideo,
};
