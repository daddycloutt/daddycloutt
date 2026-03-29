// =============================================
// STATE (DATA)
// =============================================

const tasks = [];

// Current filter applied to the UI
let currentFilter = 'all';

// Generate unique IDs for tasks
let nextId = 1;

// =============================================
// LOCAL STORAGE FUNCTIONS
// =============================================

function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
    localStorage.setItem('nextId', nextId);
}

function loadTasks() {
    const storedTasks = localStorage.getItem('tasks');
    const storedNextId = localStorage.getItem('nextId');

    if (storedTasks) {
        const parsedTasks = JSON.parse(storedTasks);

        tasks.length = 0; // clear current array
        tasks.push(...parsedTasks);
    }

    if (storedNextId) {
        nextId = parseInt(storedNextId);
    }
}

// =============================================
// DOM ELEMENT REFERENCES
// =============================================

const taskInput = document.getElementById('taskInput');
const addTaskBtn = document.getElementById('addTaskBtn');
const taskList = document.getElementById('taskList');
const emptyState = document.getElementById('emptyState');
const totalCount = document.getElementById('totalCount');
const activeCount = document.getElementById('activeCount');
const completedCount = document.getElementById('completedCount');
const filterBtns = document.querySelectorAll('.filter-btn');
const clearCompletedBtn = document.getElementById('clearCompletedBtn');

// =============================================
// EVENT LISTENERS - INPUT & BUTTONS
// =============================================

addTaskBtn.addEventListener('click', handleAddTask);

taskInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        handleAddTask();
    }
});

// Clear Completed button
clearCompletedBtn.addEventListener('click', () => {
    const filtered = tasks.filter(task => !task.completed);

    tasks.length = 0;
    tasks.push(...filtered);

    saveTasks(); // ✅ SAVE
    render();
});

// =============================================
// EVENT LISTENERS - DELEGATION
// =============================================

taskList.addEventListener('click', (event) => {
    if (event.target.matches('.checkbox')) {
        const taskId = parseInt(event.target.parentElement.dataset.taskId);
        toggleTask(taskId);
    }

    if (event.target.matches('.task-text')) {
        const taskId = parseInt(event.target.parentElement.dataset.taskId);
        toggleTask(taskId);
    }

    if (event.target.matches('.delete-btn')) {
        const taskId = parseInt(event.target.parentElement.dataset.taskId);
        deleteTask(taskId);
    }
});

// Filter buttons
filterBtns.forEach(btn => {
    btn.addEventListener('click', (event) => {
        filterBtns.forEach(b => b.classList.remove('filter-btn-active'));

        event.target.classList.add('filter-btn-active');

        currentFilter = event.target.dataset.filter;
        render();
    });
});

// =============================================
// CORE FUNCTIONS
// =============================================

function handleAddTask() {
    const text = taskInput.value.trim();

    if (!text) {
        alert('Please enter a task');
        return;
    }

    const task = {
        id: nextId++,
        text: text,
        completed: false,
        createdAt: new Date()
    };

    tasks.push(task);

    taskInput.value = '';
    taskInput.focus();

    saveTasks(); // ✅ SAVE
    render();
}

function toggleTask(taskId) {
    const task = tasks.find(t => t.id === taskId);

    if (task) {
        task.completed = !task.completed;
    }

    saveTasks(); // ✅ SAVE
    render();
}

function deleteTask(taskId) {
    const indexToRemove = tasks.findIndex(t => t.id === taskId);

    if (indexToRemove !== -1) {
        tasks.splice(indexToRemove, 1);
    }

    saveTasks(); // ✅ SAVE
    render();
}

// =============================================
// FILTERING & COUNTING
// =============================================

function getFilteredTasks() {
    if (currentFilter === 'active') {
        return tasks.filter(task => !task.completed);
    } else if (currentFilter === 'completed') {
        return tasks.filter(task => task.completed);
    }
    return tasks;
}

function updateStats() {
    const total = tasks.length;
    const completed = tasks.filter(task => task.completed).length;
    const active = total - completed;

    totalCount.textContent = total;
    activeCount.textContent = active;
    completedCount.textContent = completed;
}

// =============================================
// RENDERING
// =============================================

function render() {
    taskList.innerHTML = '';

    const filteredTasks = getFilteredTasks();

    filteredTasks.forEach(task => {
        const li = createTaskElement(task);
        taskList.appendChild(li);
    });

    updateStats();

    if (tasks.length === 0) {
        emptyState.classList.add('show');
    } else {
        emptyState.classList.remove('show');
    }
}

function createTaskElement(task) {
    const li = document.createElement('li');

    li.className = 'task-item';
    if (task.completed) {
        li.classList.add('completed');
    }

    li.dataset.taskId = task.id;

    li.innerHTML = `
        <div class="checkbox"></div>
        <span class="task-text">${task.text}</span>
        <button class="delete-btn">✕</button>
    `;

    return li;
}

// =============================================
// INITIALIZATION
// =============================================

window.addEventListener('load', () => {
    loadTasks();   // ✅ LOAD FROM STORAGE
    taskInput.focus();
    render();
});