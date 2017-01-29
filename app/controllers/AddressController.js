let request = require('request');
var promises = require('promises');
var fs = require('fs');
let MongoDB = require('./../../config/database.js');
let IpHelper = require('./../helpers/IpHelper');
var Bluebird = require("bluebird");
var rp = require('request-promise');

module.exports = function (app) {

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
                res.render('address/info.ejs',
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

    app.post('/search', function (req, res, next) {
        let dec = IpHelper.IpToDec(req.body.query);
        res.redirect('/address/' + dec);
    });

    app.get('/address/:dec', function (req, res, next) {
        let dec = req.params.dec;
        let ip = IpHelper.DecToIp(req.params.dec);
        var options = {
            url: 'https://rest.db.ripe.net/search?source=ripe&query-string=' + ip,
            headers: {
                'Accept': 'application/json'
            }
        };
        var prom = new Promise((resolve, reject) => {
            request.get(options, function (err, response, body) {
                if (!err && response.statusCode == 200) {
                    resolve(body);
                } else
                    reject(response);
            })
        });

        prom.then((ripeInfo) => {
            let ipBanners = MongoDB.db().collection('ips_banners');
            ipBanners.findOne({dec_ip: parseInt(dec)})
                .then((doc) => {
                    return {
                        ripe: ripeInfo,
                        banner: doc,
                        ip: ip
                    };
                }).then((result) => {
                    RenderInfo(res, JSON.parse(result.ripe), result.banner, result.ip);
                }).catch((err) => console.error(err));
        }).catch((err) => console.error(err));
    });

    function RenderInfo(res, ripe, banner, ip) {
        res.render('address/info.ejs', {
            ip: ip,
            inetnum: ripe.objects["object"][0],
            organization: ripe.objects["object"][1],
            person: ripe.objects["object"][2],
            route: ripe.objects["object"][3],
            banner: JSON.stringify(banner)
        });

    }

    app.post('/check', function (req, res, next) {
        let dec = IpHelper.IpToDec(req.body.address);
        res.redirect('/' + dec + '/check');
    });

    app.get('/:dec/check', function (req, res, next) {
        MongoDB.db().collection('ips_banners').count({dec_ip: 528683788}, function (err, count) {
            res.render('address/check.ejs', {
                contains: count > 0,
                ip: IpHelper.DecToIp(req.params.dec)
            });
        });
    });
}