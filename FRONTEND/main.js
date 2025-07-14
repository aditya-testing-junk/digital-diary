// === CONFIG ===
const API_BASE_URL = 'https://digital-diary-aditya-testing-junks-projects.vercel.app/api'; // CHANGE THIS to your backend API base URL

// === UI Section Handlers ===
function showLogin() {
  document.getElementById('login-form').style.display = '';
  document.getElementById('signup-form').style.display = 'none';
}
function showSignup() {
  document.getElementById('signup-form').style.display = '';
  document.getElementById('login-form').style.display = 'none';
}

// === State ===
let authToken = localStorage.getItem('token') || null;

// === Auth Section ===
document.getElementById('login-form').onsubmit = async function(e) {
  e.preventDefault();
  const username = document.getElementById('login-username').value;
  const password = document.getElementById('login-password').value;
  document.getElementById('login-error').textContent = '';
  try {
    const res = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (res.ok && data.token) {
      authToken = data.token;
      localStorage.setItem('token', authToken);
      showEditor();
    } else {
      document.getElementById('login-error').textContent = data.error || 'Login failed';
    }
  } catch (err) {
    document.getElementById('login-error').textContent = 'Server error';
  }
};

document.getElementById('signup-form').onsubmit = async function(e) {
  e.preventDefault();
  const username = document.getElementById('signup-username').value;
  const password = document.getElementById('signup-password').value;
  document.getElementById('signup-error').textContent = '';
  try {
    const res = await fetch(`${API_BASE_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (res.ok && data.success) {
      alert('Signup successful! Please log in.');
      showLogin();
    } else {
      document.getElementById('signup-error').textContent = data.error || 'Signup failed';
    }
  } catch (err) {
    document.getElementById('signup-error').textContent = 'Server error';
  }
};

document.getElementById('logout-btn').onclick = function() {
  authToken = null;
  localStorage.removeItem('token');
  document.getElementById('editor-section').style.display = 'none';
  document.getElementById('auth-section').style.display = '';
};

// === Editor Section ===
document.getElementById('save-btn').onclick = async function() {
  const text = document.getElementById('text-editor').value;
  if (!text.trim()) return;
  try {
    const res = await fetch(`${API_BASE_URL}/note`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authToken
      },
      body: JSON.stringify({ content: text })
    });
    if (res.ok) {
      document.getElementById('text-editor').value = '';
      loadNotes();
    } else {
      alert('Save failed');
    }
  } catch (err) {
    alert('Server error');
  }
};

async function loadNotes() {
  const list = document.getElementById('saved-texts');
  list.innerHTML = 'Loading...';
  try {
    const res = await fetch(`${API_BASE_URL}/notes`, {
      headers: { 'Authorization': authToken }
    });
    if (res.ok) {
      const notes = await res.json();
      if (notes.length === 0) {
        list.innerHTML = '<li>No saved texts yet.</li>';
      } else {
        list.innerHTML = '';
        notes.reverse().forEach(note => {
          const li = document.createElement('li');
          li.textContent = note.content;
          list.appendChild(li);
        });
      }
    } else {
      list.innerHTML = '<li>Failed to load texts.</li>';
    }
  } catch (err) {
    list.innerHTML = '<li>Server error.</li>';
  }
}

function showEditor() {
  document.getElementById('auth-section').style.display = 'none';
  document.getElementById('editor-section').style.display = '';
  document.getElementById('text-editor').value = '';
  loadNotes();
}

// === On Page Load ===
if (authToken) {
  showEditor();
} else {
  document.getElementById('editor-section').style.display = 'none';
  document.getElementById('auth-section').style.display = '';
  showLogin();
}
