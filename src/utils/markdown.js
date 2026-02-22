const sanitizeHtml = require('sanitize-html');
const { marked } = require('marked');
const { stripHtmlTags } = require('./textHelpers');

function markdownToHtml(markdown) {
  if (!markdown) return '';

  const rawHtml = marked.parse(markdown, { breaks: true });

  return sanitizeHtml(rawHtml, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat([
      'img',
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'span',
      'div',
    ]),
    allowedAttributes: {
      a: ['href', 'name', 'target', 'rel'],
      img: ['src', 'alt', 'title'],
      '*': ['class'],
    },
    transformTags: {
      a: sanitizeHtml.simpleTransform('a', { rel: 'noopener noreferrer', target: '_blank' }),
    },
  });
}

function markdownToText(markdown) {
  return stripHtmlTags(markdownToHtml(markdown));
}

module.exports = {
  markdownToHtml,
  markdownToText,
};
