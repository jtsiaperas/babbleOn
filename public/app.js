// Grab the articles as a json
$.getJSON("/articles", function(data) {
  // For each one
  for (var i = 0; i < data.length; i++) {
    // Display the apropos information on the page
    $("#articles").append(`<p><h2 class= "article" data-id=${data[i]._id}>${data[i].title}</h2>
      <a href = 'http://www.bbc.com${data[i].link}' target="_blank">www.bbc.com${data[i].link}</a>
      <br /><br />${data[i].summary}<br />
      </p><div id=${data[i]._id}></div>`);
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
      $(thisId).append("<h3> Comments </h3>");
      if (data.notes) {
        var notes = data.notes;
        notes.forEach(function(note){
          $(thisId).append("<h3>"+ note.title + "</h3>");
          $(thisId).append("<p>"+ note.body + "</p>");
        });
      }
      // An input to enter a new title

      $(thisId).append("<input id='titleinput' name='title' placeholder='New title'></input>");
      // A textarea to add a new note body
      $(thisId).append("<textarea id='bodyinput' name='body' placeholder='New body'></textarea>");
      // A button to submit a new note, with the id of the article saved to it
      $(thisId).append("<button data-id='" + data._id + "' id='savenote'>Save Note</button>");

      
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
      $(thisId).empty();
    });

  // Also, remove the values entered in the input and textarea for note entry
  $("#titleinput").val("");
  $("#bodyinput").val("");
});
