/*global bootbox*/
$(document).ready(function(){
    //REFERENCING THE ARTICLE CONTAINER DIV THAT ARTICLES WILL BE RENDERED INSIDE OF
    var articleContainer = $(".article-container");
    //ADD EVENT LISTENERS FOR DYNAMICALLY GENERATED BUTTONS FOR DELETING ARTICLES, VIEWING ARTICLE NOTES, SAVING ARTICLE NOTES, AND DELETING ARTICLE NOTES
    $(document).on("click", ".btn.delete", handleArticleDelete);
    $(document).on("click", ".btn.notes", handleArticleNotes);
    $(document).on("click", ".btn-save", handleNoteSave);
    $(document).on("click", ".btn.note-delete", handleNoteDelete);

    //STARTS THINGS WHEN PAGE IS LOADED
    initPage();

    function initPage() {
        //EMPTY THE ARTICLE CONTAINER, RUN AN AJAX REQUEST FOR ANY SAVED HEADLINES
        $(".article-container").empty();
        $.get("/api/headlines?saved=true").then(function(data){
            //IF WE HAVE HEADLINES, RENDER THEM TO THE PAGE
            if (data && data.length) {
                renderArticles(data);
            } else {
                //OTHERWISE RENDER A MESSAGE STATING THERE ARE NO ARTICLES
                renderEmpty();
            }
        });
    }

    function renderArticles(articles) {
        console.log(articles, "saved.js:29");
        //THIS FUNCTION HANDLES APPENDING HTML CONTAINING ARTICLE DATA TO THE PAGE; PASSED AN ARRAY OF JSON CONTAINING ALL AVAILABLE ARTICLES IN OUR DB
        var articlePanels = [];
        //PASS EACH ARTICLE JSON OBJECT TO THE CREATEPANEL FUNCTION WHICH RETURNS A BOOTSTRAP PANEL WITH ARTICLE DATA INSIDE
        for (var i = 0; i < articles.length; i++) {
            articlePanels.push(createPanel(articles[i]));
        }
        //ONCE ALL OF THE HTML FOR THE ARTICLES STORED IN THE ARTICLEPANELS ARRAY, APPEND TO THE ARTICLEPANELS CONTAINER
        console.log(articlePanels, "saved.js:36");
        $(".article-container").append(articlePanels);
    }
    
    function createPanel(article){
        // console.log(article, "saved.js:42");
        //THIS FUNCTION TAKES IN A SINGLE JSON OBJECT FOR AN ARTICLE/HEADLINE AND CONSTRUCTS A JQUERY ELEMENT CONTAINING ALL OF THE FORMATTED HTML FOR THE ARTICLE PANEL
        var panel =
            $(["<div class='panel panel-default'>",
            "<div class='panel-heading'>",
            "<h3>",
            article.headline,
            "</h3>",
            "</div>",
            "<div class='panel-body'>",
            `<img src='${article.summary}'>`,
            "<a class='btn btn-danger delete'>",
            "Delete From Saved",
            "</a>",
            "<a class='btn btn-info notes'>Article Notes</a>",
            "</div>",
            "</div>"
        ].join(""));
        console.log('panel ----->', panel);
        //ATTACH THE ARTICLE'S ID TO THE JQUERY ELEMENT TO BE USED WHEN TRYING TO FIGURE OUT WHICH ARTICLE THE USER WANTS TO REMOVE OR OPEN NOTES FOR
        panel.data("_id", article._id);
        //RETURN THE CONSTRUCTED PANEL JQUERY ELEMENT
        return panel;
    }

    function renderEmpty() {
        //RENDER SOME HTML TO THE PAGE EXPLAINING THERE AREN'T ANY ARTICLE TO VIEW- USING A JOINED ARRAY OF HTML STRING DATA BECAUSE IT'S EASIER TO READ/CHANGE THAN A CONCATENATED STRING
        var emptyAlert = $(["<div class='alert alert-warning text-center'>",
        "<h4>There are no saved articles.</h4>",
        "</div>",
        "<div class='panel panel-default'>",
        "<div class='panel-heading text-center'>",
        "<h3>Would you like to browse available articles?</h3>",
        "</div>",
        "<div class='panel-body text-center'>",
        "<h4><a href='/'>Browse Articles</a></h4>",
        "</div>",
        "</div>"
    ].join(""));
    //APPEND THIS DATA TO PAGE
    $(".article-container").append(emptyAlert); 
    }

    function renderNoteList(data) {
        //THIS FUNCTION HANDLES RENDERING NOT LIST ITEMS TO NOTES MODAL- SETTING UP AN ARRAY OF NOTES TO RENDER AFTER FINISHED, AND SETTING UP CURRENTNOTE VARIABLE TO TEMPORARILY STORE EACH NOTE
        var notesToRender = [];
        var currentNote;
        if (!data.notes.length) {
            //IF WE HAVE NO NOTES, JUST DISPLAY THIS MESSAGE
            currentNote = [
                "<li class='list-group-item'>",
                "No notes for this article",
                "</li>"
            ].join("");
            notesToRender.push(currentNote);
        }
        else {
            for (var i = 0; i < data.notes.length; i++) {
                //CONSTRUCTS AN LI ELEMENT TO CONTAIN NOTETEXT AND DELETE BUTTON
                currentNote = $([
                    "<li class='list-group-item note'>",
                    data.notes[i].noteText,
                    "<button class='btn btn-danger note-delete'>x</button>",
                    "</li>"
                ].join(""));
                //STORE THE NOTE ID ON THE DELETE BUTTON FOR EASY ACCESS WHEN TRYING TO DELETE
                currentNote.children("button").data("_id", data.notes[i]._id);
                //ADD CURRENTNOTE TO THE NOTESTORENDER ARRAY
                notesToRender.push(currentNote);
            }
        }
        //NOW APPEND THE NOTESTORENDER TO THE NOTE-CONTAINER INSIDE THE NOTE MODAL
        $(".note-container").append(notesToRender);
    }

    function handleArticleDelete() {
        //THIS FUNCTION HANDLES DELETING ARTICLES/HEADLINES; GRAB THE ID OF THE ARTICLE TO DELETE FROM THE PANEL ELEMENT THE DELETE BUTTON SITS INSIDE
        var articleToDelete = $(this).parents(".panel").data();
        //USING A DELETE METHOD HERE TO BE SEMANTIC SINCE A ARTICLE/HEADLINE IS BEING DELETED
        $.ajax({
            method: "DELETE",
            url: "/api/headlines/" + articleToDelete._id
        }).then(function(data) {
            //IF OKAY, RUN INITPAGE AGAIN WHICH WILL RERENDER LIST OF SAVED ARTICLES
            if (data.ok) {
                initPage();
            }
        });
    }

    function handleArticleNotes() {
        //THIS FUNCTION OPENS THE NOTES MODAL DISPLAYING NOTES- GRAB THE ID OF THE ARTICLE TO GET NOTES FOR FROM THE PANEL ELEMENT THE DELETE BUTTON SITS IN
        var currentArticle = $(this).parents(".panel").data();
        //GRAB ANY NOTES WITH THIS HEADLINE/ARTICLE ID
        $.get("/api/notes/" + currentArticle._id).then(function(data) {
            //CONSTRUCT INITIAL HTML TO ADD TO THE NOTES MODAL
            var modalText = [
                "<div class='container-fluid text-center'>",
                "<h4>Notes for Article: ",
                currentArticle._id,
                "</h4>",
                "<hr />",
                "<ul class='list-group note-container'>",
                "</ul>",
                "<textarea placeholder='New Note' rows='4' cols='60'></textarea>",
                "<button class='btn btn-success'>Save</button>",
                "</div>"
            ].join();
            //ADD THE FORMATTED HTML TO NOTE MODAL
            bootbox.dialog({
                message: modalText,
                closeButton: true
            });
            var noteData = {
                _id: currentArticle._id,
                notes: data || []
            };
            //ADDING INFORMATION ABOUT THE ARTILCE AND ARTICLE NOTES TO THE SAVE BUTTON FOR EASY ACCESS WHEN SAVING A NEW NOTE
            $(".btn.save").data("article", noteData);
            //RENDERNOTESLIST WILL POPULATE THE ACTUAL NOTE HTML INSIDE OF THE MODAL JUST CREATED/OPENED
            renderNoteList(noteData);
        });
    }
    function handleNoteSave() {
        //THIS FUNCTION HANDLES WHAT HAPPENS WHEN A USER TRIES TO SAVE A NEW NOTE FOR AN ARTICLE, SETTING A VARIABLE TO HOLD FORMATTED DATA ABOUT THE NOTE, AND GRABBING THE NOTE TYPED INTO THE INPUT BOX 
        var noteData;
        var newNote = $(".bootbox-body textarea").val().trim();
        //IF DATA HAS BEEN TYPED INTO THE NOTE INPUT FIELD, THIS WILL FORMAT I AND POST IT TO THE "/API/NOTES" ROUTE AND SEND THE FORMATTED NOTEDATA AS WELL
        if (newNote) {
            noteData = {
                _id: $(this).data("article")._id,
                noteText: newNote
            };
            $.post("/api/notes", noteData).then(function() {
                //WHEN COMPLETE, CLOSE MODAL
                bootbox.hideAll();
            });
        }
    }
    function handleNoteDelete() {
        //THIS FUNCTION HANDLES THE DELETION OF NOTES BY FIRST GRABBING THE ID OF THE NOTE WE WANT TO DELETE- WHICH WAS SAVED TO THE DELETE BUTTON WHEN IT WAS CREATED
        var noteToDelete = $(this).data("_id");
        //PERFORM A DELETE REQUEST TO "/API/NOTES/" WITH THE ID OF THE NOTE WE'RE DELETING AS A PARAMETER
        $.ajax({
            url: "/api/notes/" + noteToDelete,
            method: "DELETE"
        }).then(function(){
            //WHEN DONE, HIDE THE MODAL
            bootbox.hideAll();
        });
    }

}); 