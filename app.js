document.addEventListener("DOMContentLoaded", function () {

let users = JSON.parse(localStorage.getItem("users")) || [];
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];



const authSection = document.getElementById("authSection");
const dashboard = document.getElementById("dashboard");
const navbar = document.getElementById("navbar");

const loginBox = document.getElementById("loginBox");
const signupBox = document.getElementById("signupBox");

function saveTasks(){
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function showDashboard(){
  authSection.classList.add("d-none");
  dashboard.classList.remove("d-none");
  navbar.classList.remove("d-none");
  renderTasks();
  updateStats();
  updateCategories();
} 

function showAuth(){
  authSection.classList.remove("d-none");
  dashboard.classList.add("d-none");
  navbar.classList.add("d-none");
}




function renderTasks(filteredTasks){
  let currentUser = sessionStorage.getItem("user");
  let userTasks = tasks.filter(t => t.user === currentUser);

  if(filteredTasks) userTasks = filteredTasks;

  

 const priorityMap = new Map([
  ["High",3],
  ["Medium",2],
  ["Low",1]
]);
  userTasks.sort((a,b) => priorityMap.get(b.priority) - priorityMap.get(a.priority));
 



  let container = document.getElementById("taskContainer");
  container.innerHTML = "";

  userTasks.forEach(task=>{
    let badge;
    if(task.priority==="High") badge="danger";
    else if(task.priority==="Medium") badge="warning";
    else badge="success";



    let today = new Date().toISOString().split("T")[0];
    if(task.dueDate < today && task.status !== "Completed") badge="dark";

    container.innerHTML += `
      <div class="col-md-4 mb-3">
        <div class="card shadow task-card">
          <div class="card-body">
            <h5>${task.name}</h5>
            <p>${task.description}</p>
            <p><strong>Category:</strong> ${task.category}</p>
            <p><strong>Status:</strong> ${task.status}</p>
            <p><strong>Due:</strong> ${task.dueDate}</p>
            <span class="badge bg-${badge}">${task.priority}</span>
            <button class="btn btn-danger btn-sm float-end" onclick="deleteTask(${task.id})">Delete</button>
          </div>
        </div>
      </div>
    `;
  });
}







window.deleteTask = function(id){
  tasks = tasks.filter(t => t.id !== id);
  saveTasks();
  renderTasks();
  updateStats();
  updateCategories();
};



function updateCategories(){
  let currentUser = sessionStorage.getItem("user");
  let set = new Set();

  tasks.forEach(t=>{
    if(t.user===currentUser) set.add(t.category);
  });

  categoryFilter.innerHTML = `<option value="All">Filter by Category</option>`;
  set.forEach(cat=>{
    categoryFilter.innerHTML += `<option value="${cat}">${cat}</option>`;
  });
}



function updateStats(){
  let currentUser = sessionStorage.getItem("user");
  let total=0, completed=0, pending=0, progress=0;

  for(let i=0;i<tasks.length;i++){
    if(tasks[i].user===currentUser){
      total++;
      if(tasks[i].status==="Completed") completed++;
      else if(tasks[i].status==="Pending") pending++;
      else if(tasks[i].status==="In Progress") progress++;
    }
  }

  statsSection.innerHTML = `
    <div class="col-md-3"><div class="card bg-dark text-white text-center p-3"><h5>Total</h5><h3>${total}</h3></div></div>
    <div class="col-md-3"><div class="card bg-success text-white text-center p-3"><h5>Completed</h5><h3>${completed}</h3></div></div>
    <div class="col-md-3"><div class="card bg-warning text-dark text-center p-3"><h5>Pending</h5><h3>${pending}</h3></div></div>
    <div class="col-md-3"><div class="card bg-primary text-white text-center p-3"><h5>In Progress</h5><h3>${progress}</h3></div></div>
  `;
}

document.getElementById("showSignup").onclick = e => {
  e.preventDefault();
  loginBox.classList.add("d-none");
  signupBox.classList.remove("d-none");
};

document.getElementById("showLogin").onclick = e => {
  e.preventDefault();
  signupBox.classList.add("d-none");
  loginBox.classList.remove("d-none");
};

document.getElementById("signupForm").onsubmit = function(e){
  e.preventDefault();
  let username = signupUsername.value.trim();
  let password = signupPassword.value.trim();

  if(users.some(u => u.username === username)){
    alert("User already exists");
    return;
  }

  users.push({username,password});
  localStorage.setItem("users", JSON.stringify(users));
  alert("Account created!");
  signupBox.classList.add("d-none");
  loginBox.classList.remove("d-none");
  this.reset();
};

document.getElementById("loginForm").onsubmit = function(e){
  e.preventDefault();
  let username = loginUsername.value.trim();
  let password = loginPassword.value.trim();

  let user = users.find(u => u.username === username && u.password === password);
  if(user){
    sessionStorage.setItem("user", username);
    showDashboard();
  } else {
    alert("Invalid credentials");
  }
};

document.getElementById("logoutBtn").onclick = function(){
  sessionStorage.removeItem("user");
  showAuth();
};

document.getElementById("taskForm").onsubmit = function(e){
  e.preventDefault();

  let currentUser = sessionStorage.getItem("user");

  let task = {
    id: Date.now(),
    name: taskName.value,
    description: taskDescription.value,
    category: taskCategory.value,
    priority: taskPriority.value,
    status: taskStatus.value,
    dueDate: taskDueDate.value,
    user: currentUser
  };

  tasks.push(task);
  saveTasks();
  renderTasks();
  updateStats();
  updateCategories();
  this.reset();
};

searchInput.oninput = function(){
  let value = this.value.toLowerCase();
  let currentUser = sessionStorage.getItem("user");

  let filtered = tasks.filter(t =>
    t.user===currentUser &&
    (t.name.toLowerCase().includes(value) ||
     t.description.toLowerCase().includes(value))
  );
  renderTasks(filtered);
};

statusFilter.onchange = function(){
  let currentUser = sessionStorage.getItem("user");
  let value = this.value;
  let filtered;

  switch(value){
    case "Pending":
      filtered = tasks.filter(t=>t.status==="Pending" && t.user===currentUser);
      break;
    case "In Progress":
      filtered = tasks.filter(t=>t.status==="In Progress" && t.user===currentUser);
      break;
    case "Completed":
      filtered = tasks.filter(t=>t.status==="Completed" && t.user===currentUser);
      break;
    default:
      filtered = tasks.filter(t=>t.user===currentUser);
  }
  renderTasks(filtered);
};



categoryFilter.onchange = function(){
  let currentUser = sessionStorage.getItem("user");
  let value = this.value;
  if(value==="All"){
    renderTasks();
  } else {
    renderTasks(tasks.filter(t=>t.category===value && t.user===currentUser));
  }
};

if (sessionStorage.getItem("user")) {
  showDashboard();
} else {
  showAuth();
}

});