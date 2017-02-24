let request = require('request')
    , requestPromise = require('request-promise')
    , promises = require('promises')
    , fs = require('fs')
    , ObjectID = require('mongodb').ObjectID
    , MongoDB = require('./../../config/database.js')
    , IpHelper = require('./../helpers/IpHelper')
    , http = require('http')
    , wappalyzer = require('@wappalyzer/wappalyzer');

module.exports = function (app) {

    let PORTS = [];

    function RemoveElFromArray(array, el) {
        for (var i = array.length - 1; i--;) {
            if (array[i] == el) array.splice(i, 1);
        }
        return array;
    }

    function GetHeaders(dec) {
        let promises = [];
        let ip = IpHelper.DecToIp(dec);
        let options = {method: 'HEAD', host: ip, path: '/', agent: false};
        for (let i = 0; i < PORTS.length; i++) {
            let port = PORTS[i];
            options.port = port;
            promises.push(new Promise((resolve, reject) => {
                var httpReq = http.request(options, function (httpRes) {
                    let result = {
                        port: port,
                        header: JSON.stringify(httpRes.headers)
                    };
                    resolve(JSON.stringify(result));
                });
                httpReq.on('error', function (error) {
                    resolve('error');
                });
                httpReq.end();
            }));
        }
        return Promise.all(promises);
    }

    function GetIpInfoFromDB(dec, ip, ripeInfo) {
        let IpBanners = MongoDB.db().collection('ips_banners');
        return IpBanners.findOne({dec_ip: parseInt(dec)})
            .then((doc) => {
                let bannerRes = JSON.parse(JSON.stringify(doc));
                let addressRes = {};
                if (bannerRes != null) {
                    bannerRes.ports = bannerRes.ports.sort(function (a, b) {
                        return parseInt(a) - parseInt(b);
                    });
                    PORTS = bannerRes.ports;
                    addressRes = bannerRes.address;
                    return GetHeaders(dec).then(values => {
                        return values;
                    }, reason => {
                        return null;
                    }).then((headers) => {
                        return {
                            ripe: ripeInfo == null ? {} : ripeInfo,
                            banner: bannerRes,
                            address: addressRes,
                            headers: headers,
                            ip: ip
                        };
                    });
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
                        console.log(`res: ${result}`);
                        return {
                            ripe: ripeInfo,
                            banner: null,
                            address: result,
                            ip: ip
                        };
                    }).catch((err) => {
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

    app.get('/:dec/services', function (req, res, next) {
        let dec = req.params.dec;
        let ip = IpHelper.DecToIp(dec);
        wappalyzer.run(['http://' + ip + '/', '--quiet'], function (result, error) {
            if (result) {
                res.send(result);
            }

            if (error) {
                return res.send(error);
            }
        });

    });

    app.get('/address/:dec', function (req, res, next) {
        let dec = req.params.dec;
        let ip = IpHelper.DecToIp(dec);
        let options = {
            url: 'https://rest.db.ripe.net/search?source=ripe&query-string=' + ip,
            headers: {
                'Accept': 'application/json'
            }
        };
        let prom = new Promise((resolve, reject) => {
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
            RenderInfo(req, res, JSON.parse(result.ripe), result.banner, result.ip, dec, result.address, result.headers);
        }).catch((err) => {
            console.log('render err: ' + err);
        });
    });

    function RenderInfo(req, res, ripe, banner, ip, dec, address, headers) {
        res.render('address/info.ejs', {
            user: req.user,
            ip: ip,
            dec: dec,
            address: address,
            inetnum: ripe != null ? ripe.objects["object"][0] : null,
            organization: ripe != null ? ripe.objects["object"][1] : null,
            person: ripe != null ? ripe.objects["object"][2] : null,
            route: ripe != null ? ripe.objects["object"][3] : null,
            banner: banner,
            headers: headers
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