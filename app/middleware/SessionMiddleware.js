module.exports = {
    // route middleware to make sure a user is logged in
    isLoggedIn: function(req, res, next) {
        if (req.isAuthenticated())
            return next();
        res.redirect('/');
    }
}