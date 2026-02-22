const passport = require('passport');

function renderLogin(req, res) {
  if (req.isAuthenticated()) return res.redirect('/admin/dashboard');
  return res.render('admin/login', { title: 'Admin Login' });
}

function login(req, res, next) {
  return passport.authenticate('local', {
    successRedirect: '/admin/dashboard',
    failureRedirect: '/admin/login',
    failureFlash: true,
  })(req, res, next);
}

function logout(req, res, next) {
  req.logout((err) => {
    if (err) return next(err);
    req.flash('success', 'Logged out successfully.');
    return res.redirect('/admin/login');
  });
}

module.exports = {
  renderLogin,
  login,
  logout,
};
