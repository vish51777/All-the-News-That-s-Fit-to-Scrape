//SCRAPE SCRIPT


//These packages make scrapes possible
var request = require('request');
var cheerio = require('cheerio');

var scrape = function (cb) {

    request("https://www.npr.org/", function (err, res, body) {
        // console.log("HI");
        var $ = cheerio.load(body);
        // console.log(body, "body");
        // console.log(res.data,"response")
        var articles = [];

        $(".story-wrap").each(function (i, element) {

            var head = $(this).children(".story-text").text().trim();
            var sum = $(this).children(".thumb-image").children(".bucketwrap").children(".imagewrap").children("a").children(".img").attr("src");

            if (head && sum) {
                var headNeat = head.replace(/(\r\n|\n|\r|\t|\s+)/gm, " ").trim();
                var sumNeat = sum.replace(/(\r\n|\n|\r|\t|\s+)/gm, " ").trim();

                var dataToAdd = {
                    headline: headNeat,
                    summary: sumNeat
                };

                articles.push(dataToAdd);
            }
        });
        cb(articles);
    })
};

module.exports = scrape;