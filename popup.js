document.addEventListener('DOMContentLoaded', function () {
  const addTaskButton = document.getElementById('add-task');
  const taskInput = document.getElementById('new-task');
  const taskList = document.getElementById('task-list');
  const clearAllButton = document.getElementById('clear-all');
  const lightThemeBtn = document.getElementById('light');
  const darkThemeBtn = document.getElementById('dark');
  let date = document.getElementById('date');

  // Get current time
  let time = new Date().toLocaleDateString(undefined, { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
  date.textContent = time;

  // Load tasks from storage
  chrome.storage.sync.get(['tasks'], function (result) {
    if (result.tasks) {
      result.tasks.forEach(task => {
        addTaskToDOM(task.text, task.date, task.completed);
      });
    }
  });

  addTaskButton.addEventListener('click', function () {
    addTask();
  });

  taskInput.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
      addTask();
    }
  });

  clearAllButton.addEventListener('click', clearAllTasks);

  function addTask() {
    const taskText = taskInput.value.trim();
    if (taskText !== '') {
      const taskDate = new Date().toLocaleDateString();
      addTaskToDOM(taskText, taskDate, false);
      saveTask(taskText, taskDate, false);
      taskInput.value = '';
      taskInput.focus();
    }
  }

  function addTaskToDOM(taskText, taskDate, completed) {
    const li = document.createElement('li');
    
    // Task content container
    const taskContent = document.createElement('div');
    taskContent.className = 'task-content';
    
    // Task text
    const taskTextElement = document.createElement('div');
    taskTextElement.textContent = taskText;
    if (completed) {
      taskTextElement.classList.add('completed-task');
    }
    taskContent.appendChild(taskTextElement);
    
    // Task date
    const taskDateElement = document.createElement('div');
    taskDateElement.className = 'task-date';
    taskDateElement.textContent = `Added: ${taskDate}`;
    taskContent.appendChild(taskDateElement);
    
    li.appendChild(taskContent);
    
    // Buttons container
    const buttonsDiv = document.createElement('div');
    buttonsDiv.className = 'task-buttons';
    
    // Complete button
    const completeButton = document.createElement('button');
    completeButton.className = 'complete-btn';
    completeButton.innerHTML = '<i class="fas fa-check"></i>';
    completeButton.title = completed ? "Mark as incomplete" : "Mark as complete";
    completeButton.addEventListener('click', function () {
      taskTextElement.classList.toggle('completed-task');
      const isCompleted = taskTextElement.classList.contains('completed-task');
      updateTaskStatus(taskText, taskDate, isCompleted);
      completeButton.title = isCompleted ? "Mark as incomplete" : "Mark as complete";
    });
    buttonsDiv.appendChild(completeButton);
    
    // Remove button
    const removeButton = document.createElement('button');
    removeButton.className = 'remove-btn';
    removeButton.innerHTML = '<i class="fas fa-trash"></i>';
    removeButton.title = "Remove task";
    removeButton.addEventListener('click', function () {
      removeTask(taskText);
      li.remove();
    });
    buttonsDiv.appendChild(removeButton);
    
    li.appendChild(buttonsDiv);
    taskList.appendChild(li);
  }

  function saveTask(taskText, taskDate, completed) {
    chrome.storage.sync.get(['tasks'], function (result) {
      const tasks = result.tasks || [];
      tasks.push({ text: taskText, date: taskDate, completed: completed });
      chrome.storage.sync.set({ tasks });
    });
  }

  function updateTaskStatus(taskText, taskDate, completed) {
    chrome.storage.sync.get(['tasks'], function (result) {
      let tasks = result.tasks || [];
      const taskIndex = tasks.findIndex(task => task.text === taskText);
      if (taskIndex !== -1) {
        tasks[taskIndex].completed = completed;
        chrome.storage.sync.set({ tasks });
      }
    });
  }

  function removeTask(taskText) {
    chrome.storage.sync.get(['tasks'], function (result) {
      let tasks = result.tasks || [];
      tasks = tasks.filter(task => task.text !== taskText);
      chrome.storage.sync.set({ tasks });
    });
  }

  function clearAllTasks() {
    if (confirm('Are you sure you want to clear all tasks?')) {
      chrome.storage.sync.set({ tasks: [] });
      taskList.innerHTML = '';
    }
  }

  // Theme management
  function setTheme(theme) {
    if (theme === 'dark') {
      document.body.classList.remove('light-theme');
      document.body.classList.add('dark-theme');
      darkThemeBtn.classList.add('active');
      lightThemeBtn.classList.remove('active');
    } else {
      document.body.classList.remove('dark-theme');
      document.body.classList.add('light-theme');
      lightThemeBtn.classList.add('active');
      darkThemeBtn.classList.remove('active');
    }
    chrome.storage.sync.set({theme: theme});
  }

  lightThemeBtn.addEventListener('click', function() {
    setTheme('light');
  });

  darkThemeBtn.addEventListener('click', function() {
    setTheme('dark');
  });

  // Set initial theme
  chrome.storage.sync.get('theme', function(data) {
    if (data.theme === 'dark') {
      setTheme('dark');
    } else if (data.theme === 'light') {
      setTheme('light');
    } else {
      // First time use - detect system preference
      let isDarkTheme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(isDarkTheme ? 'dark' : 'light');
    }
  });
});

