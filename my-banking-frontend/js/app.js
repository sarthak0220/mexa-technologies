const apiBase = 'http://localhost:8080/api';

// ----- LOGIN -----
document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();
  if (!username || !password) return alert('Enter both username and password');

  try {
    const res = await fetch(`${apiBase}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (res.ok) {
      localStorage.setItem('token', data.token);
      window.location.href = 'accounts.html';
    } else {
      alert(data.error || 'Invalid credentials');
    }
  } catch (err) {
    console.error(err);
    alert('Login error');
  }
});

// ----- GOOGLE LOGIN -----
document.getElementById('googleLogin')?.addEventListener('click', () => {
  window.location.href = 'http://localhost:8080/oauth2/authorization/google';
});

// ----- REGISTER -----
document.getElementById('registerForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();
  const role = document.getElementById('role').value.trim();

  if (!username || !password || !role) return alert('Fill all fields');

  const res = await fetch(`${apiBase}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password, role })
  });
  if (res.ok) {
    alert('Registered successfully!');
    window.location.href = 'index.html';
  } else {
    const data = await res.json();
    alert(data.error || 'Registration failed');
  }
});

// ----- LOAD ACCOUNTS -----
async function loadAccounts() {
  const token = localStorage.getItem('token');
  if (!token) return window.location.replace('index.html');

  try {
    const res = await fetch(`${apiBase}/accounts`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to load accounts');
    const accounts = await res.json();

    const tbody = document.querySelector('#accountsTable tbody');
    if (tbody) tbody.innerHTML = '';

    const sourceSelect = document.getElementById('sourceAccount');
    const destSelect = document.getElementById('destinationAccount');
    if (sourceSelect) sourceSelect.innerHTML = '';
    if (destSelect) destSelect.innerHTML = '';

    accounts.forEach(acc => {
      // Table row (only if table exists)
      if (tbody) {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${acc.id}</td>
          <td>${acc.owner}</td>
          <td>${acc.balance}</td>
          <td>${acc.currency}</td>
          <td>${acc.status}</td>
        `;
        tbody.appendChild(row);
      }

      // Populate selects (only if they exist on this page)
      if (sourceSelect) {
        const option1 = document.createElement('option');
        option1.value = acc.id;
        option1.textContent = `${acc.owner} - ${acc.currency} ${acc.balance}`;
        sourceSelect.appendChild(option1);
      }
      if (destSelect) {
        const option2 = document.createElement('option');
        option2.value = acc.id;
        option2.textContent = `${acc.owner} - ${acc.currency} ${acc.balance}`;
        destSelect.appendChild(option2);
      }
    });
  } catch (err) {
    console.error(err);
    alert('Error loading accounts');
  }
}

// ----- LOAD TRANSACTIONS -----
async function loadTransactions(accountId) {
  const token = localStorage.getItem('token');
  if (!token) return;

  try {
    const res = await fetch(`${apiBase}/transactions/${accountId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to fetch transactions');
    const transactions = await res.json();

    const tbody = document.querySelector('#transactionsTable tbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    transactions.forEach(txn => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${txn.id}</td>
        <td>${txn.account?.owner || '-'}</td>
        <td>${txn.destinationAccount?.owner || '-'}</td>
        <td>${txn.type}</td>
        <td>${txn.amount}</td>
        <td>${txn.status || 'PENDING'}</td>
        <td>${txn.narration || '-'}</td>
        <td>${new Date(txn.createdAt).toLocaleString()}</td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error(err);
    alert('Error loading transactions');
  }
}

// ----- SUBMIT TRANSACTION -----
document.getElementById('transactionForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const token = localStorage.getItem('token');
  if (!token) return alert('Login required');

  const sourceAccount = document.getElementById('sourceAccount').value;
  const destinationAccount = document.getElementById('destinationAccount').value;
  const type = document.getElementById('type').value;
  const amount = parseFloat(document.getElementById('amount').value);
  const narration = document.getElementById('narration').value.trim();

  try {
    const res = await fetch(`${apiBase}/transactions/${sourceAccount}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ type, amount, narration, destinationAccount })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Transaction failed');

    alert(`Transaction ${data.status}: ${data.type} ${data.amount}`);
    loadTransactions(sourceAccount);
  } catch (err) {
    console.error(err);
    alert(err.message);
  }
});

// ----- LOGOUT -----
document.getElementById('logoutBtn')?.addEventListener('click', () => {
  localStorage.removeItem('token');
  window.location.replace('index.html');
});

// ----- INITIALIZE -----
window.addEventListener('DOMContentLoaded', () => {
  loadAccounts();

  document.getElementById('sourceAccount')?.addEventListener('change', (e) => {
    loadTransactions(e.target.value);
  });
});
