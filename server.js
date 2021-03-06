var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");

// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
var axios = require("axios");
var cheerio = require("cheerio");

// Require all models
var db = require("./models");

var PORT = process.env.PORT || 3000;
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

// Initialize Express
var app = express();

// Configure middleware

// Use morgan logger for logging requests
app.use(logger("dev"));
// Use body-parser for handling form submissions
app.use(bodyParser.urlencoded({ extended: true }));
// Use express.static to serve the public folder as a static directory
app.use(express.static("public"));

// Connect to the Mongo DB
mongoose.connect(MONGODB_URI);

// Routes

// A GET route for scraping the echoJS website
app.get("/scrape", function(req, res) {
  // First, we grab the body of the html with request
  axios.get("http://www.bbc.com/").then(function(response) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(response.data);

    // Now, we grab every h2 within an article tag, and do the following:
    $(".media-list__item").each(function(i, element) {
      // Save an empty result object
      var result = {};
      
      // Add the text and href of every link, and save them as properties of the result object
      result.title = $(this)
        .find(".media__title")
        .text();
      result.link = $(this)
        .find("a")
        .attr("href");
      result.summary = $(this)
        .find(".media__summary")
        .text();
      
        
      // Create a new Article using the `result` object built from scraping
      db.Article.upsert(result)
        .then(function(dbArticle) {
          // View the added result in the console
          console.log(dbArticle);
        })
        .catch(function(err) {
          // If an error occurred, send it to the client
          console.log(err);
        });
    });

    // If we were able to successfully scrape and save an Article, send a message to the client
    res.send("Scrape Complete");
  });
});

// Route for getting all Articles from the db
app.get("/articles", function(req, res) {
  // TODO: Finish the route so it grabs all of the articles
  db.Article.find({})
  .populate("notes")
  .then(function(dbArticle) {
          // Render the articles on the screen
          res.json(dbArticle);
        })
  .catch(function(err) {
      // If an error occurred, send it to the client
       return res.json(err);
   });
});

// Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function(req, res) {
  // TODO
  // ====
  db.Article.findOne({_id: req.params.id})
  .populate("notes")
  .then(function(dbArticle) {
          // Render the articles on the screen
          res.json(dbArticle);
        })
  .catch(function(err) {
      // If an error occurred, send it to the client
       return res.json(err);
   });
  // Finish the route so it finds one article using the req.params.id,
  // and run the populate method with "note",
  // then responds with the article with the note included
});

// Route for saving/updating an Article's associated Note
app.post("/articles/:id", function(req, res) {
  // TODO
     db.Note.create(req.body)
     .then(function(dbNote){
      return db.Article.findOneAndUpdate({_id: req.params.id}, {$push: {notes: dbNote._id}});
     })
     .then(function(dbArticle)
      {
        res.json(dbArticle);
      })
     .catch(function(err) {
      // If an error occurred, send it to the client
       return res.json(err);
   });  // ====22222
  // save the new note that gets posted to the Notes collection
  // then find an article from the req.params.id
  // and update it's "note" property with the _id of the new note
});

// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});
