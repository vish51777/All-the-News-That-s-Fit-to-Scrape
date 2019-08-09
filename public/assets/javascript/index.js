$(document).ready(function() {
    //SET ARTICLE CONTAINER WHERE ALL DYNAMIC CONTENT WILL GO
    var articleContainer = $(".article-container");
    //ADD EVENT LISTENERS TO DYNAMICALLY GENERATED "SAVE ARTICLE"
    $(document).on("click", ".btn-save", handleArticleSave);
    //ADD SCRAPE NEW ARTICLE BUTTONS
    $(document).on("click", ".scrape-new", handleArticleScrape);
})

initPage();

function initPage() {
    //EMPTY ARTICLE CONTAINER AND AJAX REQUEST FOR UNSAVED HEADLINES
    $(".article-container").empty();
    $.get("/api/headlines")
    .then(function(data){
        console.log(data);
        
        //IF THERE ARE HEADLINES, RENDER THEM TO THE PAGE
        if (data && data.length) {
            // console.log(data);
            renderArticles(data);
        }
        else{
            //OTHERWISE, DISPLAY MESSAGE EXPLAINING THAT THERE ARE NO ARTICLES
            renderEmpty();
        };
    });
}

function renderArticles(articles){
    //APPEND ARTICLE DATA TO PAGE
    var articlePanels = [];

    //PASS JSON INTO CREATE ARTICLE FUNCTION, BOOTSTRAP CREATES A PANEL WITH OUR INFO INSIDE
    for (var i = 0; i < articles.length; i++) {
        articlePanels.push(createPanel(articles[i]));
    }
    
    //APPEND ARTICLE PANELS ARRAY TO ARTICLE PANELS CONTAINER
    $(".article-container").append(articlePanels);
}

function createPanel(article){
    //TAKE A SINGLE JSON OBJECT AND CREATE A JQUERY ELEMENT CONTAINING ALL OF THE FORMATTED HTML FOR THE ARTICLE PANEL
    var panel = 
    $(["<div class='panel panel-default'>",
    "<div class='panel-heading'>",
    "<h4>",
    article.headline,
    "</h4>",
    
    "<div class='panel-body'>",
    `<img src='${article.summary}'>`,
    "</div>",
    "</div>",
    "<a class='btn-save'>",
    "Save Article",
    "</a>",
    "</div>",
    "<hr>"]
    .join(""));

    // ATTACH ARTICLE ID TO JQUERY ELEMENT
    panel.data("_id", article._id);
    
    return panel;
}

function renderEmpty() {
    var emptyAlert = 
    $(["<div class='alert alert-warning text-center'>",
    "<h4>NO ARTICLES</h4>",
    "</div>",
    "<div class='panel panel-default'>",
    "<div class='panel-heading text-center>",
    "<h4>What Do You Want To Do?</h4>",
    "<div class='panel-body text-center>",
    "<h4><a class='scrape-new>Scrape New Articles</a></h4>",
    "<h4><a href='/saved>Go To Saved Articles</a></h4>",
    "</div>",
    "</div>"]
    .join(""));
    // APPEND THE DATA TO THE PAGE
    $(".article-container").append(emptyAlert);
}

function handleArticleSave() {
    //THIS FUNCTION WHEN A USER SAVES AN ARTICLE
    var articleToSave = $(this).parents(".panel").data();
    console.log("article to save index.js:88", articleToSave);
    articleToSave.saved = true;
    //USE THE PATCH METHOD SINCE THIS IS AN UPDATE TO AN EXISTING RECORD IN OUR COLLECTION
    $.ajax({
        method: "PATCH",
        url: "api/headlines",
        data: articleToSave
    })
    .then(function(data){
        //IF SUCCESSFUL, MONGOOSE RETURNS AN OBJECT CONTAINING A KEY OF 'OK' WITH THE VALUE OF ONE (WHICH SETS IT TO TRUE)
        if(data.ok) {
            //RUN THE INITPAGE FUNCTION AGAIN WHICH WILL RELOAD THE ENTIRE LIST OF ARTICLES
            initPage();
        }
    });
}

function handleArticleScrape() {
    //FUNCTION THAT EXECUTES WHEN USER CLICKS THE SCRAPE NEW ARTICLES BUTTON
    console.log('RUNNING');
    $.get("api/fetch")
    .then(function(data){
        //A SUCCESSFUL SCRAPE OF THE NY TIMES THIS WILL COMPARE THE ARTICLES WITH THOSE ALREADY IN THE COLLECTION AND RE-RENDER THE ARTICLES ON THE PAGE AND GIVE A NUMBER ARTICLES THERE ARE
        initPage();
        bootbox.alert("<h3 class='text-center m-top-80')>" + data.message + "<h3>");
    })
}