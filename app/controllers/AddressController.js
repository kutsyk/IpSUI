let MongoDB = require('./../../config/database.js');
let IpHelper = require('./../helpers/IpHelper');

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

    app.post('/check', function (req, res, next) {
        let dec = IpHelper.IpToDec(req.body.address);
        res.redirect('/' + dec + '/check');
    });

    app.get('/:dec/check', function (req, res, next) {
        MongoDB.db().collection('processed_ips').count({_id: 528683788}, function (err, count) {
            res.render('address/check.ejs', {
                contains: count > 0,
                ip: IpHelper.DecToIp(req.params.dec)
            });
        });
    });
}