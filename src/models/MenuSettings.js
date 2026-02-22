const mongoose = require('mongoose');

const menuSettingsSchema = new mongoose.Schema(
  {
    showVideosMenu: {
      type: Boolean,
      default: true,
    },
    showBlogsMenu: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('MenuSettings', menuSettingsSchema);
