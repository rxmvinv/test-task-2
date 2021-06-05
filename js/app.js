const addInput = document.querySelector('#addInput');
const addButton = document.querySelector('#addButton');
const completedTask = document.querySelector('#completedTask');
const incompleteTask = document.querySelector('#incompleteTask');

const local = (action, name, value) => { // getter setter custom function for localStorage
    if (action === 'get') return JSON.parse(window.localStorage.getItem(name));
    if (action === 'set') window.localStorage.setItem(name, JSON.stringify(value));
}

let itemsArr = [];
let fromStorage = local('get', 'todoItems') || [];

const createNewTask = function (taskString) { // create new todo item template
    const listItem = document.createElement('li');

    const checkBox = document.createElement('input');
    const label = document.createElement('label');

    const div = document.createElement('div');
    const editButton = document.createElement('button');
    const deleteButton = document.createElement('button');

    label.innerText = taskString;
    listItem.className = "todoForm";
    checkBox.type = "checkbox";
    editButton.innerText = "Edit";
    editButton.className = "edit";
    deleteButton.innerText = "Delete";
    deleteButton.className = "delete";

    listItem.appendChild(checkBox);
    listItem.appendChild(label);
    div.appendChild(editButton);
    div.appendChild(deleteButton);
    listItem.appendChild(div);

    itemsArr = local('get', 'todoItems') || [];
    itemsArr.push({id: fromStorage.length, text: taskString, completed: false}); // todo data structure in localeStorage

    return listItem;
}

const addTask = function () { // add the created item to the list
    const itemName = addInput.value;
    if (itemName === '') {
        return addInput.placeholder = 'Todo name required!';
    }
    const listItem = createNewTask(itemName);
    local('set', 'todoItems', itemsArr);
    fromStorage = local('get', 'todoItems');
    incompleteTask.appendChild(listItem);
    bindTaskEvents(listItem, taskCompleted);
    addInput.value = "";
}

const editTask = function () {
    const listItem = this.parentNode.parentNode;
    const label = listItem.querySelectorAll("label")[0];
    const button = listItem.getElementsByTagName("button")[0];
    const containsClass = listItem.classList.contains("editMode");

    if (containsClass) { // editable item
        label.setAttribute('contenteditable', 'false');
        label.style.border = 'none';
        label.style.padding = '0';
        button.innerText = "Edit";
        fromStorage[this.id].text = label.innerText;
        button.removeAttribute('id');
        local('set', 'todoItems', fromStorage);
    } else { // not editable item
        label.setAttribute('contenteditable', 'true');
        label.style.border = '1px solid black';
        label.style.borderRadius = '2px';
        label.style.padding = '10px';
        button.innerText = "Save";
        button.id = fromStorage.filter(item => item.text === label.innerText)[0].id;
    }

    listItem.classList.toggle("editMode");
}

const deleteTask = function () {
    const listItem = this.parentNode.parentNode;
    const text = listItem.children[1].innerText;
    fromStorage.forEach((item, i) => {
        if (item.text === text) fromStorage.splice(i, 1);
    });
    local('set', 'todoItems', fromStorage);
    const ul = listItem.parentNode;
    ul.removeChild(listItem);
}

const taskCompleted = function () {
    const listItem = this.parentNode;
    listItem.children[1].className = 'completed';
    const text = listItem.children[1].innerText;
    fromStorage.forEach((item, i) => {
        if (item.text === text) {
            fromStorage[i].completed = true;
        }
    });
    local('set', 'todoItems', fromStorage);
    completedTask.appendChild(listItem);
    bindTaskEvents(listItem, taskIncomplete);
}

const taskIncomplete = function () {
    const listItem = this.parentNode;
    listItem.children[1].classList.remove('completed');
    const text = listItem.children[1].innerText;
    fromStorage.forEach((item, i) => {
        if (item.text === text) {
            fromStorage[i].completed = false;
        }
    });
    local('set', 'todoItems', fromStorage);
    incompleteTask.appendChild(listItem);
    bindTaskEvents(listItem, taskCompleted);
}

const bindTaskEvents = function (taskListItem, checkBoxEventHandler) { // binding edit events
    const checkBox = taskListItem.querySelector("input[type=checkbox]");
    const editButton = taskListItem.querySelector("button.edit");
    const deleteButton = taskListItem.querySelector("button.delete");
    editButton.onclick = editTask;
    deleteButton.onclick = deleteTask;
    checkBox.onchange = checkBoxEventHandler;
}

addButton.addEventListener("click", addTask);
addInput.addEventListener("keyup", (e) => e.key === 'Enter' && addTask()); // when pressed, enter adds a new item

for (let i = 0; i < incompleteTask.children.length; i++) {
    bindTaskEvents(incompleteTask.children[i], taskCompleted);
}

for (let i = 0; i < completedTask.children.length; i++) {
    bindTaskEvents(completedTask.children[i], taskIncomplete);
}

if (fromStorage.length) { // loaded todo data from storage and dispenses in places
    fromStorage.forEach(item => {
        const listItem = createNewTask(item.text);
        listItem.children[0].checked = item.completed;

        if (item.completed) {
            listItem.children[1].className = 'completed';
            completedTask.appendChild(listItem);
            bindTaskEvents(listItem, taskIncomplete);
        } else {
            listItem.children[1].classList.remove('completed');
            incompleteTask.appendChild(listItem);
            bindTaskEvents(listItem, taskCompleted);
        }
    });
}