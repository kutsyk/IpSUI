var request = require('request');
let sessionHelper = require('./../middleware/SessionMiddleware');

module.exports = function (app, passport) {

    app.get('/profile', sessionHelper.isLoggedIn, function (req, res) {
        res.render('profile/profile.ejs', {
            user: req.user
        });
    });

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
}