module.exports = function setCurrentUser(req, res, next) {
    if (req.session && req.session.appUser && req.session.token) {
        req.user = req.session.appUser;
    } else {
        req.user = null;
    }
    next();
};
