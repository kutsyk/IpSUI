let express = require('express')
    , elasticsearch = require('elasticsearch')
    , mongodb = require('./../../config/database.js');

module.exports = function (app) {

    app.get('/search', function (req, res) {
        let Elastic = new elasticsearch.Client({
            host: 'localhost:9200',
            log: 'trace'
        });

        let page = req.query.page ? req.query.page : 1;
        let query = req.query.query;
        let start = page * 10 - 10;
        let size = 10;
        Elastic.search({
            index: 'ipstats',
            type: 'banner',
            from: start,
            q: query
            // body: {
                // query: {
                //     term: {
                //         _all: query
                //     }
                // },
                // sort: [{ "ports" : "asc" }]
                // ,
                // highlight: {
                //     require_field_match: false,
                //     fields: {
                //         _all: {
                //             "pre_tags": [
                //                 "<b>"
                //             ],
                //             "post_tags": [
                //                 "</b>"
                //             ]
                //         }
                //     }
                // }
            // }
        }).then(function (body) {
            let hits = body.hits.hits;
            let total = body.hits.total;
            let pageCount = Math.floor(total / size);
            pageCount = total % 10 == 0 ? pageCount : pageCount + 1;
            res.render('search.ejs', {
                user: req.user,
                query: query,
                total: total,
                hits: hits,
                pageCount: pageCount,
                currentPage: page
            });
        }, function (error) {
            console.trace(error.message);
            res.render('search.ejs', {
                user: req.user,
                query: query,
                total: 0,
                hits: {},
                pageCount: 0,
                currentPage: 0
            });
        });

    });
};