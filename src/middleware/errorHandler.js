function notFoundHandler(req, res) {
  return res.status(404).render('errors/404', { title: 'Not Found' });
}

function errorHandler(err, req, res, next) {
  console.error(err);
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
