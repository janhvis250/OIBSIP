/* =========================================
   TODO APP
========================================= */

// DOM Elements
const taskInput = document.getElementById("taskInput");
const addTaskBtn = document.getElementById("addTaskBtn");

const pendingTasks = document.getElementById("pendingTasks");
const completedTasks = document.getElementById("completedTasks");

const pendingEmpty = document.getElementById("pendingEmpty");
const completedEmpty = document.getElementById("completedEmpty");

const pendingCount = document.getElementById("pendingCount");
const completedCount = document.getElementById("completedCount");
const totalCount = document.getElementById("totalCount");

const pendingBadge = document.getElementById("pendingBadge");
const completedBadge = document.getElementById("completedBadge");

const inputError = document.getElementById("inputError");


// =========================================
// LOCAL STORAGE
// =========================================

let tasks = JSON.parse(localStorage.getItem("taskflowTasks")) || [];


// =========================================
// SAVE TASKS
// =========================================

function saveTasks() {
    localStorage.setItem("taskflowTasks", JSON.stringify(tasks));
}


// =========================================
// FORMAT DATE & TIME
// =========================================

function formatDate(date) {
    return new Intl.DateTimeFormat("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    }).format(new Date(date));
}


// =========================================
// CREATE TASK ID
// =========================================

function createTaskId() {
    return Date.now().toString();
}


// =========================================
// ADD TASK
// =========================================

function addTask() {

    const taskText = taskInput.value.trim();

    // Empty task validation
    if (taskText === "") {

        inputError.textContent = "Please enter a task.";

        taskInput.focus();

        return;
    }

    // Clear error
    inputError.textContent = "";

    const newTask = {
        id: createTaskId(),
        text: taskText,
        completed: false,
        createdAt: new Date().toISOString()
    };

    tasks.push(newTask);

    saveTasks();

    taskInput.value = "";

    renderTasks();

    taskInput.focus();
}


// =========================================
// RENDER TASKS
// =========================================

function renderTasks() {

    // Clear existing tasks
    pendingTasks.innerHTML = "";
    completedTasks.innerHTML = "";


    // Separate tasks
    const pending = tasks.filter(task => !task.completed);

    const completed = tasks.filter(task => task.completed);


    // Render pending tasks
    pending.forEach(task => {

        const taskElement = createTaskElement(task);

        pendingTasks.appendChild(taskElement);

    });


    // Render completed tasks
    completed.forEach(task => {

        const taskElement = createTaskElement(task);

        completedTasks.appendChild(taskElement);

    });


    // Update counters
    updateCounters();


    // Update empty states
    updateEmptyStates();
}


// =========================================
// CREATE TASK ELEMENT
// =========================================

function createTaskElement(task) {

    const taskCard = document.createElement("div");

    taskCard.className = "task-card";

    if (task.completed) {
        taskCard.classList.add("completed");
    }

    taskCard.dataset.id = task.id;


    // Complete Button
    const completeButton = document.createElement("button");

    completeButton.className = "complete-btn";

    completeButton.type = "button";

    completeButton.innerHTML = "✓";

    completeButton.title = task.completed
        ? "Mark as pending"
        : "Mark as complete";

    completeButton.addEventListener("click", () => {

        toggleTask(task.id);

    });


    // Task Content
    const taskContent = document.createElement("div");

    taskContent.className = "task-content";


    // Task Text
    const taskText = document.createElement("p");

    taskText.className = "task-text";

    taskText.textContent = task.text;


    // Task Time
    const taskTime = document.createElement("p");

    taskTime.className = "task-time";

    taskTime.textContent = formatDate(task.createdAt);


    taskContent.appendChild(taskText);

    taskContent.appendChild(taskTime);


    // Actions
    const taskActions = document.createElement("div");

    taskActions.className = "task-actions";


    // Edit Button
    const editButton = document.createElement("button");

    editButton.className = "task-action";

    editButton.type = "button";

    editButton.innerHTML = "✎";

    editButton.title = "Edit task";

    editButton.addEventListener("click", () => {

        editTask(task.id, taskContent);

    });


    // Delete Button
    const deleteButton = document.createElement("button");

    deleteButton.className = "task-action delete";

    deleteButton.type = "button";

    deleteButton.innerHTML = "×";

    deleteButton.title = "Delete task";

    deleteButton.addEventListener("click", () => {

        deleteTask(task.id);

    });


    taskActions.appendChild(editButton);

    taskActions.appendChild(deleteButton);


    // Build task card
    taskCard.appendChild(completeButton);

    taskCard.appendChild(taskContent);

    taskCard.appendChild(taskActions);


    return taskCard;
}


// =========================================
// COMPLETE / UNCOMPLETE TASK
// =========================================

function toggleTask(id) {

    tasks = tasks.map(task => {

        if (task.id === id) {

            return {
                ...task,
                completed: !task.completed
            };

        }

        return task;

    });

    saveTasks();

    renderTasks();
}


// =========================================
// DELETE TASK
// =========================================

function deleteTask(id) {

    tasks = tasks.filter(task => task.id !== id);

    saveTasks();

    renderTasks();
}


// =========================================
// EDIT TASK
// =========================================

function editTask(id, taskContent) {

    const task = tasks.find(task => task.id === id);

    if (!task) {
        return;
    }


    // Clear content
    taskContent.innerHTML = "";


    // Create edit input
    const editInput = document.createElement("input");

    editInput.type = "text";

    editInput.className = "edit-input";

    editInput.value = task.text;

    editInput.maxLength = 150;


    taskContent.appendChild(editInput);

    editInput.focus();

    editInput.select();


    // Save edit
    function saveEdit() {

        const updatedText = editInput.value.trim();

        if (updatedText === "") {

            renderTasks();

            return;
        }

        tasks = tasks.map(item => {

            if (item.id === id) {

                return {
                    ...item,
                    text: updatedText
                };

            }

            return item;

        });

        saveTasks();

        renderTasks();
    }


    // Enter = save
    editInput.addEventListener("keydown", event => {

        if (event.key === "Enter") {

            saveEdit();

        }

        if (event.key === "Escape") {

            renderTasks();

        }

    });


    // Click outside = save
    editInput.addEventListener("blur", saveEdit);
}


// =========================================
// UPDATE COUNTERS
// =========================================

function updateCounters() {

    const pending = tasks.filter(
        task => !task.completed
    ).length;

    const completed = tasks.filter(
        task => task.completed
    ).length;

    const total = tasks.length;


    pendingCount.textContent = pending;

    completedCount.textContent = completed;

    totalCount.textContent = total;


    pendingBadge.textContent = pending;

    completedBadge.textContent = completed;
}


// =========================================
// EMPTY STATES
// =========================================

function updateEmptyStates() {

    const pending = tasks.filter(
        task => !task.completed
    ).length;

    const completed = tasks.filter(
        task => task.completed
    ).length;


    if (pending === 0) {

        pendingEmpty.style.display = "flex";

    } else {

        pendingEmpty.style.display = "none";

    }


    if (completed === 0) {

        completedEmpty.style.display = "flex";

    } else {

        completedEmpty.style.display = "none";

    }
}


// =========================================
// ADD BUTTON
// =========================================

addTaskBtn.addEventListener("click", addTask);


// =========================================
// ENTER KEY
// =========================================

taskInput.addEventListener("keydown", event => {

    if (event.key === "Enter") {

        addTask();

    }

});


// =========================================
// CLEAR ERROR WHEN USER TYPES
// =========================================

taskInput.addEventListener("input", () => {

    if (inputError.textContent !== "") {

        inputError.textContent = "";

    }

});


// =========================================
// INITIAL RENDER
// =========================================

renderTasks();