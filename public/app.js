$(document).ready(function(){
  $.ajax({
    method: "GET",
    url: "/scrape"
  }).then(function(){
    console.log("Scraped!")
  }
  );
});
// Grab the articles as a json
$.getJSON("/articles", function(data) {
  // For each one
  for (var i = 0; i < data.length; i++) {
    // Display the apropos information on the page
    $("#articles").append(`<div class= "card mb-3"><div class="card-header article" data-id=${data[i]._id}>${data[i].title}</div>
      <div class= "card-body"> <a href = 'http://www.bbc.com${data[i].link}' target="_blank">www.bbc.com${data[i].link}</a>
      <br /><br />${data[i].summary}<br />
      </div></div><div class= "comments" id=${data[i]._id}></div>`);
  }
});


// Whenever someone clicks a p tag
$(document).on("click", ".article", function() {
  // Empty the notes from the note section
  
  // Save the id from the p tag
  var thisId = $(this).attr("data-id");
  
  // Now make an ajax call for the Article
  $.ajax({
    method: "GET",
    url: "/articles/" + thisId
  })
    // With that done, add the note information to the page
    .then(function(data) {
      thisId = "#" + thisId;
      
      $(thisId).empty();
      // The title of the article
      $(thisId).append(`<div class="card mb-3"><div class="card-header">Comments</div></div>`);
      if (data.notes) {
        var notes = data.notes;
        notes.forEach(function(note){
          $(thisId).append(`<div class="card mb-3"><div class="card-header">${note.title}</div>
          <div class="card-body"> ${note.body} </div></div>`);
        });
      }
      // An input to enter a new title

      $(thisId).append(`<div class="input-group mb-3">
      <div class="input-group-prepend">
        <span class="input-group-text">Title</span>
      </div>
      <input id='titleinput' name='title' type="text" class="form-control" aria-label="Title" aria-describedby="Title">
      </div>`);
      // A textarea to add a new note body
      $(thisId).append(`<div class="input-group mb-3">
      <div class="input-group-prepend">
        <span class="input-group-text">Comment</span>
      </div>
        <textarea class="form-control" id='bodyinput' name='body' aria-label="Comment"></textarea>
      </div>`);
      // A button to submit a new note, with the id of the article saved to it
      $(thisId).append(`<button class = "btn mb-3" data-id=${data._id} id='savenote'>Save Note</button>`);

      
    });
});

// When you click the savenote button
$(document).on("click", "#savenote", function() {
  // Grab the id associated with the article from the submit button
  var thisId = $(this).attr("data-id");

  // Run a POST request to change the note, using what's entered in the inputs
  $.ajax({
    method: "POST",
    url: "/articles/" + thisId,
    data: {
      // Value taken from title input
      title: $("#titleinput").val(),
      // Value taken from note textarea
      body: $("#bodyinput").val()
    }
  })
    // With that done
    .then(function(data) {
      thisId = "#" + thisId;
      // Log the response
      console.log(data);
      // Empty the notes section
      $(thisId).reload();
    });

  // Also, remove the values entered in the input and textarea for note entry
  $("#titleinput").val("");
  $("#bodyinput").val("");
});
