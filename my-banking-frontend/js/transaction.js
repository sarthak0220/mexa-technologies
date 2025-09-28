// ===== Config =====
const apiBase = "http://localhost:8080/api";

// ===== UI: show/hide destination account based on type and cashWithdraw =====
const typeSel = document.getElementById('type');
const destDiv = document.getElementById('destinationDiv');
const destSelect = document.getElementById('destinationAccount');
const cashWithdraw = document.getElementById('cashWithdraw');

function updateDestinationVisibility() {
  const isDebit = typeSel.value === 'DEBIT';
  const showDest = isDebit && !(cashWithdraw && cashWithdraw.checked);
  destDiv.style.display = showDest ? '' : 'none';
  if (destSelect) destSelect.toggleAttribute('required', showDest);
}

typeSel.addEventListener('change', updateDestinationVisibility);
if (cashWithdraw) cashWithdraw.addEventListener('change', updateDestinationVisibility);

// ===== Data: load accounts into selects =====
async function loadAccounts() {
  const token = localStorage.getItem('token');
  if (!token) return (window.location.href = "login.html");

  const res = await fetch(`${apiBase}/accounts`, {
    headers: { 'Authorization': 'Bearer ' + token }
  });
  if (!res.ok) return alert("Failed to load accounts");

  const accounts = await res.json();

  const sourceSelect = document.getElementById('sourceAccount');
  const destSelect = document.getElementById('destinationAccount');
  sourceSelect.innerHTML = '';
  destSelect.innerHTML = '';

  accounts.forEach(acc => {
    const label = `${acc.owner} - ${acc.currency} ${acc.balance}`;
    const opt1 = new Option(label, acc.id);
    sourceSelect.add(opt1);

    const opt2 = new Option(label, acc.id);
    destSelect.add(opt2);
  });

  // Load transactions for initial selection
  if (sourceSelect.value) {
    loadTransactions(sourceSelect.value);
  }

  // Ensure destination visibility matches initial type/cash state
  updateDestinationVisibility();
}

// ===== Data: load transactions for selected source account =====
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
  const tbody = document.querySelector('#transactionsTable tbody');
  tbody.innerHTML = '';

  transactions.forEach(txn => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${txn.id}</td>
      <td>${txn.type}</td>
      <td class="text-end">${Number(txn.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
      <td>${txn.status}</td>
      <td>${txn.narration || '-'}</td>
      <td>${txn.createdAt ? new Date(txn.createdAt).toLocaleString() : '-'}</td>
    `;
    tbody.appendChild(tr);
  });

  // Re-apply active search filter to new rows
  if (txnSearch && txnSearch.value) {
    const ev = new Event('input');
    txnSearch.dispatchEvent(ev);
  }
}

// ===== Client-side search for transactions table =====
const txnSearch = document.getElementById('txnSearch');
if (txnSearch) {
  txnSearch.addEventListener('input', () => {
    const q = txnSearch.value.trim().toLowerCase();
    const rows = document.querySelectorAll('#transactionsTable tbody tr');

    if (!q) {
      rows.forEach(r => (r.style.display = ''));
      return;
    }

    rows.forEach(row => {
      const text = row.innerText.toLowerCase();
      row.style.display = text.includes(q) ? '' : 'none';
    });
  });
}

// ===== Submit transaction =====
document.getElementById('transactionForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const sourceAccount = document.getElementById('sourceAccount').value;
  const destinationAccount = document.getElementById('destinationAccount').value;
  const type = document.getElementById('type').value;
  const amount = document.getElementById('amount').value;
  const narration = document.getElementById('narration').value;
  const cash = document.getElementById('cashWithdraw')?.checked;

  const token = localStorage.getItem('token');

  const body = { type, amount, narration };
  if (type === 'DEBIT' && !cash) body.destinationAccount = destinationAccount;

  const res = await fetch(`${apiBase}/transactions/${sourceAccount}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    alert("Transaction failed");
    return;
  }

  const txn = await res.json();
  alert(`Transaction ${txn.status}: ${txn.type} ${txn.amount}`);
  loadTransactions(sourceAccount);
});

// ===== Events: change source account reloads its transactions =====
document.getElementById('sourceAccount').addEventListener('change', (e) => {
  loadTransactions(e.target.value);
});

// ===== Init =====
loadAccounts();
updateDestinationVisibility();
