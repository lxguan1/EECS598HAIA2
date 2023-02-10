// Complete the UI, with the necessary buttons and styling
    // Include instructions on the top of the page
    // Submit button
    // State the compensation
    // 5 questions on the page, each one formatted the same. Only allow submission when all of the questions are answered.
    // Give an unique survey code at the end of the task
// Add the dataset to Google Drive
    // Use the validation dataset since it has less values, and include the question json file
    // Place all of the data in a folder
// Integrate Google Drive into the UI <-
    // Have the results for each question in a csv file, with only questions that have less than 5 responses to be given
    // to the workers.
    // Load in the images and the questions at the start of the session, then append the results to the csv at the end
    // of the session.
    // Only give the survey code if the Google Drive upload of the data results was successful (the promise returned)
// Make the survey code on the MTurk project
// Make the Qualification Test
// Make the video demo
import { svmjs  } from "https://lxguan1.github.io/EECS598HAIA2/public/svm.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.1.1/firebase-firestore.js"
import { getStorage, ref as ref_storage, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.1.1/firebase-storage.js";
import { getDatabase, ref as ref_database, set, onValue, child, get } from "https://www.gstatic.com/firebasejs/9.1.1/firebase-database.js";
//var SVM = require('ml-svm');


const firebaseConfig = {

    apiKey: "AIzaSyDTNdIhP3iTVrIxdgfH_3gxpccex6vkbgk",
  
    authDomain: "eecs598haia2.firebaseapp.com",
  
    projectId: "eecs598haia2",
  
    storageBucket: "eecs598haia2.appspot.com",
  
    messagingSenderId: "693717325356",
  
    appId: "1:693717325356:web:5e4108300e93d914152389",
  
    measurementId: "G-QMGF8ER9GW",

    databaseURL: "https://eecs598haia2-default-rtdb.firebaseio.com/", 
    
    storageBucket: "gs://eecs598haia2.appspot.com", 
  };
  const app = initializeApp(firebaseConfig);

  var jsonRef1 = ref_database(getDatabase()); //ref_storage(getStorage(app), "/questions/");

var currentButtons = {};
var questions;
var question_statistics;
var jsonData1;
var orig_data;
var answered_questions = ["", "", "", "", ""];
var json_indices = [];
var abort = false;
var retval;
var question_list = [];

//Load in two JSON files, one that has the questions and one that stores the data. 
//Randomly select data until you have 5 that have not had 5 people see them yet. 
//Record the user's actions, update the database JSON file if there are any updates
//Have some random survey number generator that appears when submit is pressed. 

$(document).ready(function() {
    document.getElementById("submit").addEventListener("click", submit_items);
    let elements = document.getElementsByClassName("yesno");
    for (var i = 0; i < elements.length; i++) {
        elements[i].addEventListener("click", (evt) => {highlight(evt)});
    }
    get(child(jsonRef1, "questions/")).then((snapshot) => {
        if (snapshot.exists()) {
            orig_data = snapshot.val();
            console.log(orig_data);
        } else {
          console.log("No data available");
        }

        var selectedQuestions = [];
        let counter = 0;
        for (var i = 0; i < orig_data.length; i++) {
            counter = Math.min(orig_data[i].question.length, counter);
        }
        console.log(counter)
        while(selectedQuestions.length < 5) {
            var randomIndex = Math.floor(Math.random() * 3939);
            let skip_element = false;
            if (!("num_annotations" in orig_data[randomIndex])) {
                orig_data[randomIndex].num_annotations = 0;
            }
            else if (orig_data[randomIndex].num_annotations > 5) {
                skip_element = true;
            }
            if (!skip_element) {
                console.log(randomIndex);
                question_list.push(randomIndex);
                selectedQuestions.push(orig_data[randomIndex]);
                orig_data[randomIndex].num_annotations += 1;
                json_indices.push(randomIndex);
            }
        }
        // Use the selectedQuestions array as needed
        for (var i = 0; i < selectedQuestions.length; i++) {
            var questionNumber = i + 1;
            var imageId = selectedQuestions[i].image_id.toString().padStart(12, '0');
            var questionText = selectedQuestions[i].question;
            
            $("#question" + questionNumber + "-img").attr("src", "./imgs/abstract_v002_train2015_" + imageId + ".png");
            $("#question" + questionNumber + " p").text((i + 1).toString() + ". " + questionText);
        }


        svm = new svmjs.SVM();
        data = [[0,0], [0,1], [1,0], [1,1]];
        labels = [-1, 1, 1, -1];
        svm.train(data, labels, { kernel: 'rbf', rbfsigma: 0.5 });
        var json = svm.toJSON();
      }).catch((error) => {
        console.error(error);
      });
    
    // get(child(jsonRef1, "questions/").then(function(url1) {
    //     // Store the first JSON file in a variable
        
    //     $.getJSON(url1, function(data1) {
    //       orig_data = data1.val();
    //       jsonData1 = data1.val().questions;
    //       console.log(orig_data);
    //     });
    //   })).catch(function(error) {
    //     // Handle any errors
    //     console.log(error);
    //   });
    
    //console.log(orig_data);
    

});

function highlight(button) {
    if (abort) {
        return;
    }
    console.log(button);
    button = button.srcElement;
    console.log(button)
    var questionId = button.parentNode.parentNode.id;
    answered_questions[parseInt(questionId.slice(-1)) - 1] = button.textContent;
    console.log(answered_questions)
    if (currentButtons[questionId]) {
        currentButtons[questionId].style.boxShadow = "none";
    }
    currentButtons[questionId] = button;
    button.style.boxShadow = "0 0 30px #00ff00";
}

const zip = (a, b) => a.map((k, i) => [k, b[i]]);

function submit_items(button) {
    if (abort) {
        alert("Thank you for participating in this task. The survey code you should copy to the MTurk Task is: " + retval.toString())
        return;
    }
    for (var i = 0; i < 5; i++) {
        if (answered_questions[i] == "") {
            alert("Please answer all of the questions.");
            return;
        }
    }
    for (var i = 0; i < 5; i++) {
        if ("worker_responses" in orig_data[json_indices[i]]) {
            orig_data[json_indices[i]]['worker_responses'].push(answered_questions[i]);
        }
        else {
            orig_data[json_indices[i]]['worker_responses'] = [answered_questions[i]];
        }
    }
    console.log(answered_questions);

    retval = Math.floor(Math.random() * 1000);

    // get(child(jsonRef1, '/userProfile')).then((snapshot) => {
    //     var jsondataset;
    //     if (snapshot.exists()) {
    //         jsondataset = snapshot.val();
    //         console.log(jsondataset);
            
    //         if ("worker_responses_list" in jsondataset) {
    //             jsondataset["worker_responses_list"].push((retval, zip(question_list, answered_questions)));
                  
    //         }
    //         else {
    //             jsondataset["worker_responses_list"] = (retval, zip(question_list, answered_questions));
    //         }
    //         set(ref_database(getDatabase(), '/userProfile'), jsondataset);
    //     }
        
    // })

    if ("worker_responses_list" in orig_data) {
        orig_data["worker_responses_list"].push({[retval]: zip(question_list, answered_questions)});
          
    }
    else {
        orig_data["worker_responses_list"] = [{[retval]: zip(question_list, answered_questions)}];
        console.log({retval: zip(question_list, answered_questions)});
    }
    
    set(ref_database(getDatabase(), "questions/"), orig_data);
    
    

    

    abort = true;
    alert("Thank you for participating in this task. The survey code you should copy to the MTurk Task is: " + retval.toString())
    // jsonRef1.putString(JSON.stringify(orig_data)).then(function(snapshot) {
    //     console.log("Successfully updated JSON file 1.");
    //   }).catch(function(error) {
    //     console.log("Error updating JSON file 1: " + error);
    //   });
}

export {highlight, submit_items};
