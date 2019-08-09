//REQUIRE DEPENDENCIES
var express = require('express');
var mongoose = require('mongoose');
var expressHandlebars = require('express-handlebars');
var bodyParser = require('body-parser');

//SET UP THE PORT TO BE EITHER THE HOSTS DESIGNATED PORT OR 3000
var PORT = process.env.PORT || 3000;

var app = express();

// //SET UP AN EXPRESS ROUTER
// var router = express.Router();

//REQUIRE ROUTES FILE
const routes = require("./config/routes");

//PUBLIC FOLDER AS STATIC DIRECTORY
app.use(express.static(__dirname + "/public"));

//CONNECT HANDLEBARS
app.engine("handlebars", expressHandlebars({
    defaultLayout: "main"
}));
app.set("view engine", "handlebars");

//USE BODY-PARSER
app.use(bodyParser.urlencoded({
    extended: false
}));

//DESIGNATE ROUTER MIDDLEWARE
app.use(routes);

//IF DEPLOYED, USE THE DEPLOYED DATABASE. OTHERWISE, USE THE LOCAL MONGOHEADLINES DB
var db = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

//CONNECT MONGOOSE TO DB
mongoose.connect(db, function(error){
    //LOG ERRORS CONNECTING WITH MONGOOSE
    if (error) {
        console.log(error);
    }
    //OR SUCCESS MESSAGE
    else {
        console.log("MONGOOSE CONNECTION SUCCESSFUL");
    }
});

//LISTEN ON THE PORT
app.listen(PORT, function() {
    console.log("Listening on port: " + PORT);
});