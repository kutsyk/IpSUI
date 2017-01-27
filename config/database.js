(function(){
    var client = require('mongodb').MongoClient,
        mongodb;

    module.exports =  {
        connect: function(dburl, callback) {
            client.connect(dburl,
                function(err, db){
                    mongodb = db;
                    if(callback) { callback(); }
                });
        },
        db: function() {
            return mongodb;
        },
        close: function() {
            mongodb.close();
        }
    };
})();
//
// var MongoClient = require('mongodb').MongoClient
//     , assert = require('assert');
//
// let MongoDB = null
//
// MongoClient.connect("mongodb://localhost:27017/ipstats", function (err, db) {
//     assert.equal(null, err);
//     if (err) {
//         return console.log(err);
//     }
//
//     MongoDB = db
// });
//
// module.exports = MongoDB;