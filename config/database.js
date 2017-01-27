var MongoClient = require('mongodb').MongoClient;
MongoDB = null
MongoClient.connect("mongodb://admin:12345@localhost:27017/ipstats", function (err, db) {
    if (err) {
        return console.dir(err);
    }
    MongoDB = db
});

module.exports  = MongoDB