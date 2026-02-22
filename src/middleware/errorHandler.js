function notFoundHandler(req, res) {
  return res.status(404).render('errors/404', { title: 'Not Found' });
}

function errorHandler(err, req, res, next) {
  console.error(err);
  if (err.code === 'EBADCSRFTOKEN' || err.name === 'CSRFError') {
    if (req.xhr || req.headers.accept === 'application/json') {
      return res.status(403).json({ message: 'Invalid CSRF token.' });
    }
    return res.status(403).render('errors/403', {
      title: 'Forbidden',
      message: 'Invalid CSRF token. Please refresh the page and try again.',
    });
  }

  const statusCode = err.status || 500;

  if (res.headersSent) return next(err);

  return res.status(statusCode).render('errors/500', {
    title: 'Server Error',
    message: process.env.NODE_ENV === 'production' ? 'Something went wrong.' : err.message,
  });
}

module.exports = {
  notFoundHandler,
  errorHandler,
};
