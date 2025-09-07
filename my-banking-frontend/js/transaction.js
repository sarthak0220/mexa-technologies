const apiBase = "http://localhost:8080/api";

// Show/hide destination account when type changes
document.getElementById('type').addEventListener('change', (e) => {
  const destDiv = document.getElementById('destinationDiv');
  destDiv.style.display = e.target.value === 'DEBIT' ? 'block' : 'none';
});

// Load user's accounts
async function loadAccounts() {
  const token = localStorage.getItem('token');
  if (!token) return window.location.href = "login.html";

  const res = await fetch(`${apiBase}/accounts`, {
    headers: { 'Authorization': 'Bearer ' + token }
  });

  if (!res.ok) return alert("Failed to load accounts");

  const accounts = await res.json();
  const sourceSelect = document.getElementById('sourceAccount');
  const destSelect = document.getElementById('destinationAccount');

  accounts.forEach(acc => {
    const option1 = document.createElement('option');
    option1.value = acc.id;
    option1.textContent = `${acc.owner} - ${acc.currency} ${acc.balance}`;
    sourceSelect.appendChild(option1);

    const option2 = document.createElement('option');
    option2.value = acc.id;
    option2.textContent = `${acc.owner} - ${acc.currency} ${acc.balance}`;
    destSelect.appendChild(option2);
  });
}

// Load transactions for selected source account
async function loadTransactions(accountId) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${apiBase}/transactions/${accountId}`, {
    headers: { 'Authorization': 'Bearer ' + token }
  });

  if (!res.ok) {
    alert("Failed to fetch transactions");
    return;
  }

  const transactions = await res.json();
  const tbody = document.getElementById('transactionsTable').querySelector('tbody');
  tbody.innerHTML = '';

  transactions.forEach(txn => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${txn.id}</td>
      <td>${txn.type}</td>
      <td>${txn.amount}</td>
      <td>${txn.status}</td>
      <td>${txn.narration || '-'}</td>
      <td>${new Date(txn.createdAt).toLocaleString()}</td>
    `;
    tbody.appendChild(tr);
  });
}

// Submit transaction
document.getElementById('transactionForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const sourceAccount = document.getElementById('sourceAccount').value;
  const destinationAccount = document.getElementById('destinationAccount').value;
  const type = document.getElementById('type').value;
  const amount = document.getElementById('amount').value;
  const narration = document.getElementById('narration').value;
  const cashWithdraw = document.getElementById('cashWithdraw').checked;

  const token = localStorage.getItem('token');

  const body = { type, amount, narration };
  if (type === 'DEBIT' && !cashWithdraw) body.destinationAccount = destinationAccount;

  const res = await fetch(`${apiBase}/transactions/${sourceAccount}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) return alert("Transaction failed");

  const txn = await res.json();
  alert(`Transaction ${txn.status}: ${txn.type} ${txn.amount}`);
  loadTransactions(sourceAccount);
});

// Reload transactions when source account changes
document.getElementById('sourceAccount').addEventListener('change', (e) => {
  loadTransactions(e.target.value);
});

// Initialize
loadAccounts();