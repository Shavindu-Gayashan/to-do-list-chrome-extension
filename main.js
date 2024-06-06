document.addEventListener('DOMContentLoaded', function () {
  const addTaskButton = document.getElementById('add-task');
  const taskInput = document.getElementById('new-task');
  const taskList = document.getElementById('task-list');
  let date = document.getElementById('date');

  // Get current time
  let time = new Date().toLocaleDateString();
  date.textContent = time;

  // Load tasks from storage
  chrome.storage.sync.get(['tasks'], function (result) {
    if (result.tasks) {
      result.tasks.forEach(task => {
        addTaskToDOM(task.text, task.date);
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

  function addTask() {
    const taskText = taskInput.value.trim();
    if (taskText !== '') {
      const taskDate = new Date().toLocaleDateString();
      addTaskToDOM(taskText, taskDate);
      saveTask(taskText, taskDate);
      taskInput.value = '';
    }
  }

  function addTaskToDOM(taskText, taskDate) {
    const li = document.createElement('li');
    const taskSpan = document.createElement('span');
    taskSpan.textContent = taskText;
    taskSpan.dataset.taskText = taskText; // Store the task text
    taskSpan.dataset.taskDate = `Added date: ${taskDate}`; // Store the task date with the desired format

    // Add hover event listeners to the li element
    li.addEventListener('mouseover', function () {
      taskSpan.textContent = taskSpan.dataset.taskDate;
    });

    li.addEventListener('mouseout', function () {
      taskSpan.textContent = taskSpan.dataset.taskText;
    });

    const removeButton = document.createElement('button');
    removeButton.textContent = 'Remove';
    removeButton.addEventListener('click', function () {
      removeTask(taskText);
      li.remove();
    });

    li.appendChild(taskSpan);
    li.appendChild(removeButton);
    taskList.appendChild(li);
  }

  function saveTask(taskText, taskDate) {
    chrome.storage.sync.get(['tasks'], function (result) {
      const tasks = result.tasks || [];
      tasks.push({ text: taskText, date: taskDate });
      chrome.storage.sync.set({ tasks });
    });
  }

  function removeTask(taskText) {
    chrome.storage.sync.get(['tasks'], function (result) {
      let tasks = result.tasks || [];
      tasks = tasks.filter(task => task.text !== taskText);
      chrome.storage.sync.set({ tasks });
    });
  }

  // Change theme
  document.getElementById('light').addEventListener('click', function () {
    document.body.classList.remove('dark-theme');
    document.body.classList.add('light-theme');
    chrome.storage.sync.set({ theme: 'light' });
  });

  document.getElementById('dark').addEventListener('click', function () {
    document.body.classList.remove('light-theme');
    document.body.classList.add('dark-theme');
    chrome.storage.sync.set({ theme: 'dark' });
  });

  // Set default theme
  chrome.storage.sync.get('theme', function (data) {
    if (data.theme === 'dark') {
      document.body.classList.remove('light-theme');
      document.body.classList.add('dark-theme');
    } else if (data.theme === 'light') {
      document.body.classList.remove('dark-theme');
      document.body.classList.add('light-theme');
    } else {
      let isDarkTheme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (isDarkTheme) {
        document.body.classList.remove('light-theme');
        document.body.classList.add('dark-theme');
        chrome.storage.sync.set({ theme: 'dark' });
      } else {
        document.body.classList.remove('dark-theme');
        document.body.classList.add('light-theme');
        chrome.storage.sync.set({ theme: 'light' });
      }
    }
  });
});
