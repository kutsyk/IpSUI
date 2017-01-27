var request = require('request');
let sessionHelper = require('./../middleware/SessionMiddleware');

module.exports = function (app, passport) {

    app.get('/profile', sessionHelper.isLoggedIn, function (req, res) {
        res.render('profile/profile.ejs', {
            user: req.user
        });
    });
}