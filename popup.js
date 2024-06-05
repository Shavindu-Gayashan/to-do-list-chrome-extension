document.addEventListener('DOMContentLoaded', function () {
  const addTaskButton = document.getElementById('add-task');
  const taskInput = document.getElementById('new-task');
  const taskList = document.getElementById('task-list');

  // Load tasks from storage
  chrome.storage.sync.get(['tasks'], function (result) {
    if (result.tasks) {
      result.tasks.forEach(task => {
        addTaskToDOM(task);
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
      addTaskToDOM(taskText);
      saveTask(taskText);
      taskInput.value = '';
    }
  }

  function addTaskToDOM(taskText) {
    const li = document.createElement('li');
    li.textContent = taskText;
    const removeButton = document.createElement('button');
    removeButton.textContent = 'Remove';
    removeButton.addEventListener('click', function () {
      removeTask(taskText);
      li.remove();
    });
    li.appendChild(removeButton);
    taskList.appendChild(li);
  }

  function saveTask(taskText) {
    chrome.storage.sync.get(['tasks'], function (result) {
      const tasks = result.tasks || [];
      tasks.push(taskText);
      chrome.storage.sync.set({ tasks });
    });
  }

  function removeTask(taskText) {
    chrome.storage.sync.get(['tasks'], function (result) {
      let tasks = result.tasks || [];
      tasks = tasks.filter(task => task !== taskText);
      chrome.storage.sync.set({ tasks });
    });
  }
});
