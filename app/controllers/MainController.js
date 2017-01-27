let express = require('express')

module.exports = function (app) {
    app.get('/', function (req, res) {
        res.render('index.ejs', {
            user: req.user
        }); // load the index.ejs file
    });
};