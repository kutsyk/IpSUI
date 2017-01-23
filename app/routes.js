var request = require('request');
var mongodb = require('./../config/database.js');

module.exports = function (app, passport) {

    app.get('/', function (req, res) {
        res.render('index.ejs', {
            user: req.user
        }); // load the index.ejs file
    });

    app.post('/login', passport.authenticate('local-login', {
        successRedirect: '/profile', // redirect to the secure profile section
        failureRedirect: '/', // redirect back to the signup page if there is an error
        failureFlash: true// allow flash messages,

    }));

    app.get('/signup', function (req, res) {
        // render the page and pass in any flash data if it exists
        res.render('signup.ejs', {message: req.flash('signupMessage')});
    });

    // process the signup form
    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect: '/profile', // redirect to the secure profile section
        failureRedirect: '/signup', // redirect back to the signup page if there is an error
        failureFlash: true // allow flash messages
    }));

    app.get('/profile', isLoggedIn, function (req, res) {
        res.render('profile.ejs', {
            user: req.user
        });
    });

    app.get('/search', function (req, res) {
        // Connect to the db
        mongodb.collection('ips_dev', function (err, collection) {
            collection.count(function (err, count) {
                res.render('search.ejs', {
                    count: count
                });
            });
        });
    });

    app.get('/auth/facebook', passport.authenticate('facebook', {scope: 'email'}));
    app.get('/auth/facebook/callback',
        passport.authenticate('facebook', {
            successRedirect: '/profile',
            failureRedirect: '/'
        })
    );

    app.get('/auth/google', passport.authenticate('google', {scope: ['profile', 'email']}));
    app.get('/auth/google/callback',
        passport.authenticate('google', {
            successRedirect: '/profile',
            failureRedirect: '/'
        }));


    app.get('/auth/github', passport.authenticate('github', {scope: ['profile', 'email']}));
    app.get('/auth/github/callback',
        passport.authenticate('github', {
            successRedirect: '/profile',
            failureRedirect: '/'
        }));

    app.get('/auth/twitter', passport.authenticate('twitter', {scope: ['profile', 'email']}));
    app.get('/auth/twitter/callback',
        passport.authenticate('twitter', {
            successRedirect: '/profile',
            failureRedirect: '/'
        }));


    app.get('/connect/local', function (req, res) {
        res.render('connect-local.ejs', {message: req.flash('loginMessage')});
    });
    app.post('/connect/local', passport.authenticate('local-signup', {
        successRedirect: '/profile', // redirect to the secure profile section
        failureRedirect: '/connect/local', // redirect back to the signup page if there is an error
        failureFlash: true // allow flash messages
    }));

    app.get('/connect/facebook', passport.authorize('facebook', {scope: 'email'}));
    app.get('/connect/facebook/callback',
        passport.authorize('facebook', {
            successRedirect: '/profile',
            failureRedirect: '/'
        }));

    app.get('/connect/google', passport.authorize('google', {scope: ['profile', 'email']}));
    app.get('/connect/google/callback',
        passport.authorize('google', {
            successRedirect: '/profile',
            failureRedirect: '/'
        }));

    app.get('/connect/github', passport.authorize('github', {scope: ['profile', 'email']}));
    app.get('/connect/github/callback',
        passport.authorize('github', {
            successRedirect: '/profile',
            failureRedirect: '/'
        }));

    app.get('/connect/twitter', passport.authorize('twitter', {scope: 'email'}));
    app.get('/connect/twitter/callback',
        passport.authorize('twitter', {
            successRedirect: '/profile',
            failureRedirect: '/'
        }));

    app.get('/logout', function (req, res) {
        req.logout();
        res.redirect('/');
    });

    app.get('/show/:ip', function (req, res, next) {
        var options = {
            url: 'https://rest.db.ripe.net/search?source=ripe&query-string=31.131.19.12',
            headers: {
                'Accept': 'application/json'
            }
        };
        request.get(options, function (err, response, body) {
            if (!err && response.statusCode == 200) {
                var infoBody = JSON.parse(body);
                res.render('info.ejs',
                    {
                        //rest.db.ripe.net/search?source=ripe&query-string=31.131.19.12
                        ip: req.params.ip,
                        inetnum: infoBody.objects["object"][0],
                        organization: infoBody.objects["object"][1],
                        person: infoBody.objects["object"][2],
                        route: infoBody.objects["object"][3]
                    });
            }
        });
    });
}
;

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {
    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();
    // if they aren't redirect them to the home page
    res.redirect('/');
}