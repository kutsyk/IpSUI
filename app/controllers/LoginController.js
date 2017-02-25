var mongodb = require('./../../config/database.js');

module.exports = function (app, passport) {
    app.post('/login', passport.authenticate('local-login', {
        successRedirect: '/profile', // redirect to the secure profile section
        failureRedirect: '/', // redirect back to the signup page if there is an error
        failureFlash: true// allow flash messages,

    }));

    app.get('/signup', function (req, res) {
        // render the page and pass in any flash data if it exists
        res.render('profile/signup.ejs', {message: req.flash('signupMessage')});
    });

    // process the signup form
    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect: '/profile', // redirect to the secure profile section
        failureRedirect: '/signup', // redirect back to the signup page if there is an error
        failureFlash: true // allow flash messages
    }));

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
};