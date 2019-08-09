//Bring in Scrape Script and makeDate Scripts
var scrape = require('../scripts/scrape');
var makeDate = require('../scripts/date');

//Incorporate the Headline and Note mongoose models
var Headline = require('../models/Headline');

module.exports = {
    fetch: function(cb) {
        scrape(function(data){
            console.log(data);
            var articles = data;
            for (var i = 0; i < articles.length; i++) {
                articles[i].date = makeDate();
                articles[i].saved = false;
            }

            Headline.insertMany(articles, function(err, docs){
                cb(err, docs);
            });
        });
    },
    delete: function(query, cb) {
        Headline.remove(query, cb);
    },
    get: function(query, cb) {
        Headline.find(query)
        .sort({
            _id: -1
        })
        .exec(function (err, doc) {
            cb(doc)
        });
        
    },
    update: function(query, cb) {
        Headline.update({_id: query._id}, {
            $set: query
        }, {}, cb);
    },
    findSaved: function(query, cb) {
        Headline.find(query)
        .exec(function (err, doc) {
            console.log(doc, "headlines.js:44");
            cb(doc)
        });
    }
}