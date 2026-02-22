function extractYouTubeId(input) {
  if (!input) return '';

  const plainIdRegex = /^[A-Za-z0-9_-]{6,20}$/;
  if (plainIdRegex.test(input)) return input;

  try {
    const url = new URL(input);

    if (url.hostname.includes('youtube.com')) {
      const id = url.searchParams.get('v');
      if (id && plainIdRegex.test(id)) return id;
    }

    if (url.hostname.includes('youtu.be')) {
      const id = url.pathname.replace('/', '');
      if (id && plainIdRegex.test(id)) return id;
    }
  } catch (error) {
    return '';
  }

  return '';
}

module.exports = {
  extractYouTubeId,
};
