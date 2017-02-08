let request = require('request')
    , requestPromise = require('request-promise')
    , promises = require('promises')
    , fs = require('fs')
    , ObjectID = require('mongodb').ObjectID
    , MongoDB = require('./../../config/database.js')
    , IpHelper = require('./../helpers/IpHelper');

module.exports = function (app) {

    function GetIpInfoFromDB(dec, ip, ripeInfo) {
        let IpBanners = MongoDB.db().collection('ips_banners');
        return IpBanners.findOne({dec_ip: parseInt(dec)})
            .then((doc) => {
                let bannerRes = JSON.parse(JSON.stringify(doc));
                let addressRes = {};
                if (bannerRes != null) {
                    addressRes = bannerRes.address;
                    return {
                        ripe: ripeInfo == null ? {} : ripeInfo,
                        banner: bannerRes,
                        address: addressRes,
                        ip: ip
                    };
                }
                else {
                    let freeGeoProm = new Promise((resolve, reject) => {
                        request.get('http://freegeoip.net/json/' + ip, function (err, response, body) {
                            if (!err && response.statusCode == 200) {
                                resolve(body);
                            } else {
                                reject(response);
                            }
                        })
                    });
                    return freeGeoProm.then((result) => {
                        return {
                            ripe: ripeInfo,
                            banner: null,
                            address: result,
                            ip: ip
                        };
                    }).catch( (err) => {
                        console.log('freegeoIp promise: ' + err);
                        return {
                            ripe: ripeInfo,
                            banner: null,
                            address: null,
                            ip: ip
                        };
                    });
                }
            }).catch((err) => console.error(err));
    }

    app.post('/search', function (req, res, next) {

        let dec = IpHelper.IpToDec(req.body.query);
        res.redirect('/address/' + dec);
    });

    app.get('/address/:dec', function (req, res, next) {
        let dec = req.params.dec;
        let ip = IpHelper.DecToIp(dec);
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
                } else {
                    reject(response);
                }
            })
        });

        prom.then((ripeInfo) => {
            return GetIpInfoFromDB(dec, ip, ripeInfo);
        }).then((result) => {
            RenderInfo(req, res, JSON.parse(result.ripe), result.banner, result.ip, result.address);
        }).catch((err) => {
            console.error('get/:address ' + err);
            GetIpInfoFromDB(dec, ip, null).then((result) => {
                RenderInfo(req, res, null, result.banner, result.ip, result.address);
            }).catch((err) => {
                console.log('render err: ' + err);
            });
        });
    });

    function RenderInfo(req, res, ripe, banner, ip, address) {
        res.render('address/info.ejs', {
            user: req.user,
            ip: ip,
            address: address,
            inetnum: ripe != null ? ripe.objects["object"][0] : null,
            organization: ripe != null ? ripe.objects["object"][1] : null,
            person: ripe != null ? ripe.objects["object"][2] : null,
            route: ripe != null ? ripe.objects["object"][3] : null,
            banner: banner,
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