function notFoundHandler(req, res) {
  return res.status(404).render('errors/404', { title: 'Not Found' });
}

function errorHandler(err, req, res, next) {
  const errorId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`.toUpperCase();
  console.error(`[${errorId}]`, err);
  res.locals.siteName = res.locals.siteName || 'CyberGuruIndia';
  res.locals.csrfToken = res.locals.csrfToken || '';
  res.locals.currentUser = res.locals.currentUser || null;
  if (err.code === 'EBADCSRFTOKEN' || err.name === 'CSRFError') {
    if (req.xhr || req.headers.accept === 'application/json') {
      return res.status(403).json({ message: 'Invalid CSRF token.', errorId });
    }
    return res.status(403).render('errors/403', {
      title: 'Forbidden',
      message: 'Invalid CSRF token. Please refresh the page and try again.',
      errorId,
    });
  }

  const statusCode = err.status || 500;

  if (res.headersSent) return next(err);

  return res.status(statusCode).render('errors/500', {
    title: 'Server Error',
    message: process.env.NODE_ENV === 'production' ? 'Something went wrong.' : err.message,
    errorId,
  });
}

module.exports = {
  notFoundHandler,
  errorHandler,
};
