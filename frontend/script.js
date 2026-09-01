const API = "http://localhost:3000";

let token = null;

const loginScreen = document.querySelector('#login-screen');
const appScreen = document.querySelector('#app');
const emailInput = document.querySelector('#email');
const passwordInput = document.querySelector('#password');
const loginBtn = document.querySelector('#login-btn');
const registerBtn = document.querySelector('#register-btn');
const loginMessage = document.querySelector('#login-message');
const logoutBtn = document.querySelector('#logout-btn');

const newTodoInput = document.querySelector('#new-todo');
const addBtn = document.querySelector('#add-btn');
const themeBtn = document.querySelector('#theme-btn');
const themeIcon = document.querySelector('#theme-icon');

const lists = {
  pending: document.querySelector('#list-pending'),
  in_progress: document.querySelector('#list-in-progress'),
  done: document.querySelector('#list-done'),
};
const counters = {
  pending: document.querySelector('#count-pending'),
  in_progress: document.querySelector('#count-in-progress'),
  done: document.querySelector('#count-done'),
};

const STATUS_ORDER = ['pending', 'in_progress', 'done'];

// Token'ı otomatik ekleyen fetch sarmalayıcısı
async function apiRequest(path, options = {}) {
  const response = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (response.status === 401) {
    logout();
    throw new Error('oturum sona erdi');
  }

  return response;
}

async function login() {
  const email = emailInput.value.trim();
  const password = passwordInput.value;

  const response = await fetch(`${API}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    loginMessage.textContent = data.error;
    loginMessage.className = 'error';
    return;
  }

  token = data.token;
  loginScreen.style.display = 'none';
  appScreen.style.display = 'block';
  loginMessage.textContent = '';
  await loadTodos();
}

async function register() {
  const email = emailInput.value.trim();
  const password = passwordInput.value;

  const response = await fetch(`${API}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    loginMessage.textContent = data.error;
    loginMessage.className = 'error';
    return;
  }

  loginMessage.textContent = 'Kayıt başarılı, şimdi giriş yapabilirsin.';
  loginMessage.className = 'success';
}

function logout() {
  token = null;
  appScreen.style.display = 'none';
  loginScreen.style.display = 'flex';
  emailInput.value = '';
  passwordInput.value = '';
  loginMessage.textContent = '';
}

async function loadTodos() {
  const response = await apiRequest('/api/todos');
  const todos = await response.json();
  renderBoard(todos);
}

async function updateStatus(id, newStatus) {
  await apiRequest(`/api/todos/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ status: newStatus }),
  });
  await loadTodos();
}

function renderBoard(todos) {
  lists.pending.innerHTML = '';
  lists.in_progress.innerHTML = '';
  lists.done.innerHTML = '';

  const counts = { pending: 0, in_progress: 0, done: 0 };

  todos.forEach((todo) => {
    counts[todo.status]++;

    const card = document.createElement('div');
    card.className = 'card';
    card.dataset.status = todo.status;

    const p = document.createElement('p');
    p.textContent = todo.title;
    card.appendChild(p);

    const actions = document.createElement('div');
    actions.className = 'card-actions';

    const currentIndex = STATUS_ORDER.indexOf(todo.status);

    if (currentIndex > 0) {
      const backBtn = document.createElement('button');
      backBtn.textContent = '←';
      backBtn.title = 'Önceki duruma al';
      backBtn.addEventListener('click', () => {
        updateStatus(todo.id, STATUS_ORDER[currentIndex - 1]);
      });
      actions.appendChild(backBtn);
    }

    if (currentIndex < STATUS_ORDER.length - 1) {
      const forwardBtn = document.createElement('button');
      forwardBtn.textContent = '→';
      forwardBtn.title = 'Sonraki duruma al';
      forwardBtn.addEventListener('click', () => {
        updateStatus(todo.id, STATUS_ORDER[currentIndex + 1]);
      });
      actions.appendChild(forwardBtn);
    }

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.textContent = '✕';
    deleteBtn.title = 'Sil';
    deleteBtn.addEventListener('click', async () => {
      await apiRequest(`/api/todos/${todo.id}`, { method: 'DELETE' });
      await loadTodos();
    });
    actions.appendChild(deleteBtn);

    card.appendChild(actions);
    lists[todo.status].appendChild(card);
  });

  counters.pending.textContent = counts.pending;
  counters.in_progress.textContent = counts.in_progress;
  counters.done.textContent = counts.done;
}

async function addTodo() {
  const title = newTodoInput.value.trim();
  if (title === '') return;

  await apiRequest('/api/todos', {
    method: 'POST',
    body: JSON.stringify({ title }),
  });

  newTodoInput.value = '';
  newTodoInput.focus();
  await loadTodos();
}

loginBtn.addEventListener('click', login);
registerBtn.addEventListener('click', register);
logoutBtn.addEventListener('click', logout);

passwordInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') login();
});

addBtn.addEventListener('click', addTodo);
newTodoInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') addTodo();
});

let isDark = false;

function applyTheme() {
  document.body.classList.toggle('dark', isDark);
  themeIcon.innerHTML = isDark
      ? '<path d="M21 12.5A9 9 0 1 1 11.5 3a7 7 0 0 0 9.5 9.5z"></path>'
      : `<circle cx="12" cy="12" r="4"></circle>
       <line x1="12" y1="1.5" x2="12" y2="4"></line>
       <line x1="12" y1="20" x2="12" y2="22.5"></line>
       <line x1="4.2" y1="4.2" x2="6" y2="6"></line>
       <line x1="18" y1="18" x2="19.8" y2="19.8"></line>
       <line x1="1.5" y1="12" x2="4" y2="12"></line>
       <line x1="20" y1="12" x2="22.5" y2="12"></line>
       <line x1="4.2" y1="19.8" x2="6" y2="18"></line>
       <line x1="18" y1="6" x2="19.8" y2="4.2"></line>`;
}

themeBtn.addEventListener('click', () => {
  isDark = !isDark;
  applyTheme();
});