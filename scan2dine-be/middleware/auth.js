function isAuthenticated(req, res, next) {
    if (req.session.user) return next();
    res.redirect('/login');
    }
    function isAdmin(req, res, next) {
    if (req.session.user?.role === 'admin') return next();
    res.redirect('/');
    }
    module.exports = { isAuthenticated, isAdmin };