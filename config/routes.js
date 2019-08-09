//SERVER ROUTES
const express = require('express');
//SET UP AN EXPRESS ROUTER
var router = express.Router();

// //INCORPORATE SCRAPE FUNCTION FROM SCRIPTS DIRECTORY
// var scrape =require('../scripts/scrape');

//INCORPORATE HEADLINES AND NOTES FROM THE CONTROLLER
var headlinesController = require('../controllers/headlines');
var notesController = require('../controllers/notes');


//RENDER HOMEPAGE
router.get("/", function(req, res){
    res.render("home");
});
//RENDER SAVED HANDLEBAR PAGE
router.get("/saved", function(req, res) {
    res.render("saved");
});

//RETREIVING SAVED ARTICLES FOR PLACEMENT IN THE SAVED PANEL
router.get("/api/headlines?saved=true", function(req, res) {
    headlinesController.findSaved(req.query);
})

router.get("/api/fetch", function(req, res) {
    headlinesController.fetch(function(err, docs) {
        console.log('headlines result', docs);
        if (!docs || docs.insertedCount === 0) {
            res.json({
                message: "Nothing New Today, But Tommorrow is a New Day."
            });
        }
        else {
            res.json({
                message: "Added " + docs.length + " new articles!"
            });
        }
    });
});

router.get("/api/headlines", function(req, res) {
    var query = {};
    if(req.query.saved) {
        query = req.query;
    }

    headlinesController.get(query, function(data) {
        res.json(data);
    });
});
router.delete("/api/headlines/:id", function(req, res){
    var query = {};
    query._id = req.params.id;
    headlinesController.delete(query, function(err, data){
        res.json(data);
    });
});
router.patch("/api/headlines", function (req, res) {
    console.log(req.body, "routes:56");
    headlinesController.update(req.body, function(err, data) {
        res.json(data);
    });
});
router.get("/api/notes/:headline_id?", function(req, res){
    var query = {};
    if (req.params.headline_id) {
        query._id = req.params.headline_id;
    }
    
    notesController.get(query, function(err, data){
        res.json(data);
    });
});

router.delete("/api/notes/:id", function(req, res){
    var query = {};
    query._id = req.params.id;
    notesController.delete(query, function(err, data){
        res.json(data);
    });
});
router.post("/api/notes", function(req, res){
    notesController.save(req.body, function(data){
        res.json(data);
    });
});

module.exports = router;