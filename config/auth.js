module.exports = {

    'facebookAuth' : {
        'clientID'      : '702934209858551', // your App ID
        'clientSecret'  : '0109332f83e2b0950b938073a43b83ac', // your App Secret
        'callbackURL'   : 'http://localhost:8080/auth/facebook/callback',
    },

    'twitterAuth' : {
        'consumerKey'       : 'your-consumer-key-here',
        'consumerSecret'    : 'your-client-secret-here',
        'callbackURL'       : 'http://localhost:8080/auth/twitter/callback'
    },

    'googleAuth' : {
        'clientID'      : 'your-secret-clientID-here',
        'clientSecret'  : 'your-client-secret-here',
        'callbackURL'   : 'http://localhost:8080/auth/google/callback'
    }

};