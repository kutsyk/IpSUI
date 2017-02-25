let express = require('express')
    , elasticsearch = require('elasticsearch')
    , mongodb = require('./../../config/database.js');

module.exports = function (app) {
    let client = new elasticsearch.Client({
        host: 'localhost:9200',
        log: 'trace'
    });

    app.get('/search', function (req, res) {
        client.search({
            q: req.query.query
        }).then(function (body) {
            let hits = body.hits.hits;
            let total = body.hits.total;
            // mongodb.collection('ips_dev', function (err, collection) {
            //     collection.count(function (err, count) {
            //         res.render('search.ejs', {
            //             count: count
            //         });
            //     });
            // });
            res.render('search.ejs', {
                user: req.user,
                total: total,
                hits: hits
            }); // load the index.ejs file
        }, function (error) {
            console.trace(error.message);
        });

    });
};