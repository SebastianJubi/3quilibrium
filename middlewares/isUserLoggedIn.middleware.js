module.exports = function isUserLoggedIn(req, res, next) {
    if (!req.user || (req.user.tags && req.user.tags.role !== "user")) {
        return res.redirect(`${process.env.BASE_URL}/`);
    }
    next();
}