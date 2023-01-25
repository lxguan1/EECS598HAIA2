// Complete the UI, with the necessary buttons and styling
    // Include instructions on the top of the page
    // Submit button
    // State the compensation
    // 5 questions on the page, each one formatted the same. Only allow submission when all of the questions are answered.
    // Give an unique survey code at the end of the task
// Add the dataset to Google Drive
    // Use the validation dataset since it has less values, and include the question json file
    // Place all of the data in a folder
// Integrate Google Drive into the UI
    // Have the results for each question in a csv file, with only questions that have less than 5 responses to be given
    // to the workers.
    // Load in the images and the questions at the start of the session, then append the results to the csv at the end
    // of the session.
    // Only give the survey code if the Google Drive upload of the data results was successful (the promise returned)
// Make the survey code on the MTurk project
// Make the Qualification Test
// Make the video demo

var currentButtons = {};
var questions;
var question_statistics;

$(document).ready(function() {
    $.getJSON("https://drive.google.com/file/d/1BzCd6F_9-UO7yG8WOzp7vZM-zZ1MVZBj/view?usp=sharing", function(data) {
        question_statistics = data;
    });
    $.getJSON("https://drive.google.com/file/d/1BzCd6F_9-UO7yG8WOzp7vZM-zZ1MVZBj/view?usp=sharing", function(data) {
    questions = data.questions;
    var selectedQuestions = [];
    while(selectedQuestions.length < 5) {
        var randomIndex = Math.floor(Math.random() * questions.length);
        if (question_statistics[questions[randomIndex].image_id].num_annotations > 5) {
            continue;
        }
        selectedQuestions.push(questions[randomIndex]);
    }
    // Use the selectedQuestions array as needed
    for (var i = 0; i < selectedQuestions.length; i++) {
        var questionNumber = i + 1;
        var imageId = selectedQuestions[i].image_id.padStart(12, '0');
        var questionText = selectedQuestions[i].question;
        $("#question" + questionNumber + "-img").attr("src", "https://drive.google.com/file/d/" + imageId + "/view?usp=sharing");
        $("#question" + questionNumber + " p").text(questionText);
    }
  });
});

function highlight(button) {
  var questionId = button.parentNode.parentNode.id;
  if (currentButtons[questionId]) {
    currentButtons[questionId].style.boxShadow = "none";
  }
  currentButtons[questionId] = button;
  button.style.boxShadow = "0 0 15px #00ff00";
}


