/**
 * Utility function to strip HTML tags from a string
 * @param {string} html - HTML string to strip
 * @returns {string} - Plain text without HTML tags
 */
function stripHtmlTags(html) {
  if (!html) return '';
  return html
    .replace(/<[^>]*>/g, '')  // Remove HTML tags
    .replace(/&nbsp;/g, ' ')   // Replace &nbsp; with space
    .replace(/&amp;/g, '&')    // Replace &amp; with &
    .replace(/&lt;/g, '<')     // Replace &lt; with <
    .replace(/&gt;/g, '>')     // Replace &gt; with >
    .replace(/&quot;/g, '"')   // Replace &quot; with "
    .replace(/&#039;/g, "'")   // Replace &#039; with '
    .replace(/\s+/g, ' ')      // Replace multiple spaces with single space
    .trim();
}

module.exports = { stripHtmlTags };
