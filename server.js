var express = require('express');
var app = express();
var port = process.env.PORT || 8080;
var mongoose = require('mongoose');
var passport = require('passport');
var flash = require('connect-flash');
var fs = require('fs');

var morgan       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var session      = require('express-session');

mongoose.connect('admin:12345@localhost:27017/ipstats'); // connect to our database

require('./config/passport')(passport); // pass passport for configuration

// set up our express application
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser()); // get information from html forms

app.set('view engine', 'ejs'); // set up ejs for templating

// required for passport
app.use(session({ secret: 'secretforsession' })); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

app.use(function(req, res, next) {
    res.locals.session = req.session;
    next();
});

app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/views'));

// routes ======================================================================
require('./app/routes.js')(app, passport);
require('./app/controllers/MainController')(app);
require('./app/controllers/LoginController')(app, passport);
require('./app/controllers/ProfileController')(app, passport);
// launch ======================================================================

app.listen(port);
console.log('The magic happens on port ' + port);