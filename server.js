var express = require('express')
    , app = express()
    , port = process.env.PORT || 8080
    , mongoose = require('mongoose')
    , passport = require('passport')
    , flash = require('connect-flash')
    , fs = require('fs');

var morgan = require('morgan')
    , cookieParser = require('cookie-parser')
    , bodyParser = require('body-parser')
    , session = require('express-session')
    , favicon = require('serve-favicon');

mongoose.connect('127.0.0.1:27017/ipstats'); // connect to our database
require('./config/passport')(passport); // pass passport for configuration
var mongodb =  require('./config/database');

mongodb.connect('mongodb://127.0.0.1:27017/ipstats', () => {
    console.log('Connected to MongoDB.');
});

// set up our express application
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser()); // get information from html forms

app.set('view engine', 'ejs'); // set up ejs for templating
2
// required for passport
app.use(session({secret: 'secretforsession'})); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

app.use(function (req, res, next) {
    res.locals.session = req.session;
    next();
});

app.use(function(req, res, next){
    res.locals.user = req.session.user;
    next();
});

app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/views'));


// routes ======================================================================
require('./app/routes.js')(app, passport);
require('./app/controllers/MainController')(app);
require('./app/controllers/LoginController')(app, passport);
require('./app/controllers/ProfileController')(app, passport);
require('./app/controllers/SearchController')(app);
require('./app/controllers/AddressController')(app);
// launch ======================================================================

app.listen(port);
console.log('The magic happens on port ' + port);