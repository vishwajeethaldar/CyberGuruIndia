function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) return next();
  req.flash('error', 'Please login first.');
  return res.redirect('/admin/login');
}

function ensureAdmin(req, res, next) {
  if (req.user && req.user.role === 'admin') return next();
  return res.status(403).render('errors/403', {
    title: 'Forbidden',
  });
}

module.exports = {
  ensureAuthenticated,
  ensureAdmin,
};
