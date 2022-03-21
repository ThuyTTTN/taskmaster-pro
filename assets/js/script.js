var tasks = {};

var auditTask = function(taskEl) {
  //to ensure element is getting to the function
  var date = $(taskEl)
  .find("span")
  .text()
  //.trim() method ensure no unnecessary empty spaces are in the beginning or end of string
  .trim();
  //ensure it worked
  console.log(date);

  //convert to moment object at 5:00pm
  var time = moment(date, "L").set("hour", 17);

  // remove any old classes from element with .removeClass
  $(taskEl).removeClass("list-group-item-warning list-group-item-danger");

  // apply new class if task is near/over due date
  if (moment().isAfter(time)) {
    $(taskEl).addClass("list-group-item-danger");
  }
  else if (Math.abs(moment().diff(time, "days")) <= 2) {
    $(taskEl).addClass("list-group-item-warning");
  }
};

var createTask = function(taskText, taskDate, taskList) {
  // create elements that make up a task item
  var taskLi = $("<li>").addClass("list-group-item");
  var taskSpan = $("<span>")
    .addClass("badge badge-primary badge-pill")
    .text(taskDate);
  var taskP = $("<p>")
    .addClass("m-1")
    .text(taskText);

  // append span and p element to parent li
  taskLi.append(taskSpan, taskP);

  //check due date
  auditTask(taskLi);

  // append to ul list on the page
  $("#list-" + taskList).append(taskLi);
};

var loadTasks = function() {
  tasks = JSON.parse(localStorage.getItem("tasks"));

  // if nothing in localStorage, create a new object to track all task status arrays
  if (!tasks) {
    tasks = {
      toDo: [],
      inProgress: [],
      inReview: [],
      done: []
    };
  }

  // loop over object properties
  $.each(tasks, function(list, arr) {
    // then loop over sub-array
    arr.forEach(function(task) {
      createTask(task.text, task.date, list);
    });
  });
};

var saveTasks = function() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
};

// sortable() turned every element with class 'list-group' into sort list
$(".card .list-group").sortable({
  //connectWith links the sortable lists with other lists with same class
  connectWith: $(".card .list-group"),
  scroll: false,
  tolerance: "pointer",
  // tells jQuery to create a copy of the dragged element and move the copy instead of the original
  helper: "clone",    
  //event listener; triggers once for all connected lists as soon as dragging starts and stop
  activate: function(event, ui) {
    console.log(ui);
  },
  //event listener; triggers once for all connected lists as soon as dragging starts and stop
  deactivate: function(event, ui) {
    console.log(ui);
  },
  //event listener; triggers when a dragged item enters or leaves a connected list
  over: function(event) {
    console.log(event);
  },
  //event listener; triggers when a dragged item enters or leaves a connected list
  out: function(event) {
    console.log(event);
  }, 
  //triggers when the contents of a list have changed (reordered, removed, added)
  update: function() {
    // array to store the task data in
    var tempArr = [];

    // loop over current set of children in sortable list
    // children() method returns an array of the list element's children <li> elements
    // each() method will run a callback function for every item/element in the array; another form of looping
    $(this)
    .children()
    .each(function() {
      // save values in temp array; add task data to temp array as an object
      tempArr.push({
        text: $(this)
          .find("p")
          .text()
          .trim(),
        date: $(this)
          .find("span")
          .text()
          .trim()
      });
    });  
    
  //trim down list's ID to match object property
    var arrName = $(this)
    .attr("id")
    .replace("list-", "");

  //update array on tasks object and save
    tasks[arrName] = tempArr;
    saveTasks();
  },
  stop: function(event) {
    $(this).removeClass("dropover");
  }   
});

$("#trash").droppable({
  accept: ".car .list-group-item",
  tolerance: "touch",
  drop: function(event, ui) {
    // ui is a variable object that contains 'draggable'; remove() remove element from the DOM entirely
    ui.draggable.remove();
  },
  over: function (event, ui) {
    console.log(ui);
  }, 
  out: function(event, ui) {
    console.log(ui);
  }
});

// modal was triggered
$("#task-form-modal").on("show.bs.modal", function() {
  // clear values
  $("#modalTaskDescription, #modalDueDate").val("");
});

// modal is fully visible
$("#task-form-modal").on("shown.bs.modal", function() {
  // highlight textarea
  $("#modalTaskDescription").trigger("focus");
});

// save button in modal was clicked
$("#task-form-modal .btn-primary").click(function() {
  // get form values
  var taskText = $("#modalTaskDescription").val();
  var taskDate = $("#modalDueDate").val();

  if (taskText && taskDate) {
    createTask(taskText, taskDate, "toDo");

    // close modal
    $("#task-form-modal").modal("hide");

    // save in tasks array
    tasks.toDo.push({
      text: taskText,
      date: taskDate
    });

    saveTasks();
  }
});


$(".list-group").on("click", "p", function() {
  // get current text of p element  
  var text = $(this)          
    .text()
    .trim();

    //tells jQuery to create new <textarea> element; replace p element with a new text area
    var textInput = $("<textarea>")     
    .addClass("form-control")
    .val(text);
    $(this).replaceWith(textInput);

    textInput.trigger("focus");       // text box area is highlighted in blue
});

//blur event
$(".list-group").on("blur", "textarea", function() {    
  // get the textarea's current value/text
  var text = $(this)
    .val()
    .trim();

  // get the parent's ul's id attribute
  var status = $(this)
    .closest(".list-group")
    .attr("id")
    .replace("list-", "");

  //get the task's position in the list of other li elements
  var index = $(this)
    .closest(".list-group-item")
    .index();

  tasks[status][index].text = text;
  saveTasks();

  //recreate p element
  var taskP = $("<p>")      //converting <textarea> back into <p> element
    .addClass("m-1")
    .text(text);

  // replace textarea with p element
  $(this).replaceWith(taskP);
});

// due date was clicked;  ability to edit due date
$(".list-group").on("click", "span", function() {
  //get current text
  var date = $(this)
  .text()
  .trim();

  //create new input element
  var dateInput = $("<input>")
  .attr("type", "text")
  .addClass("form-control")
  .val(date);

  //swap out elements
  $(this).replaceWith(dateInput);

  //enable jquery ui datepicker
  dateInput.datepicker ({
    minDate: 1,
    onClose: function() {
      //when calendar is closed, force a "change" event on the 'dateInput'
      $(this).trigger("change");
    }
  });

  //automatically focus on new element
  dateInput.trigger("focus");
});

//value of due date was changed
$(".list-group").on("change", "input[type='text']", function(){
  //get current text
  var date = $(this)
  .val();

  //get the parent's ul's id attribute
  var status = $(this)
  .closest(".list-group")
  .attr(id)
  .replace("list", "");

  //get the task's position in the list of other li elements
  var index = $(this)
  .closest(".list-group-item")
  .index();

  //update task in array and re-save to localStorage
  tasks[status][index].date = date;
  saveTasks();

  //recreate span element with bootstrap classes
  var taskSpan = $("<span>")
  .addClass("badge badge-primary badge-pill")
  .text(date);

  //pass task's <li> element into auditTask() to check new due date
  auditTask($(taskSpan).closet(".list-group-item"));

  //replace input with span element
  $(this).replaceWith(taskSpan);
})

// add calendar date
$("#modalDueDate").datepicker({
  //prevent users from selecting dates that passed; '1' is 1 day after current date
  minDate: 1              
});
  


// remove all tasks
$("#remove-tasks").on("click", function() {
  for (var key in tasks) {
    tasks[key].length = 0;
    $("#list-" + key).empty();
  }
  saveTasks();
});

// load tasks for the first time
loadTasks();


