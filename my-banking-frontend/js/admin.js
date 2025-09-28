// ====== Config & Auth ======
const apiBase = "http://localhost:8080"; // backend base URL [web:104]
const token = localStorage.getItem("token"); // JWT stored after login [web:104]
if (!token) window.location.replace("index.html"); // redirect if not logged in [web:104]

// ====== DOM Elements ======
// Sections
const usersSection = document.getElementById("usersSection"); // Users list section [web:96]
const accountsSection = document.getElementById("accountsSection"); // Accounts for a user [web:96]
const transactionsSection = document.getElementById("transactionsSection"); // Transactions for an account [web:96]
const allAccountsSection = document.getElementById("allAccountsSection"); // Global accounts [web:96]
const allTransactionsSection = document.getElementById("allTransactionsSection"); // Global transactions [web:96]
const sectionTitle = document.getElementById("sectionTitle"); // Title heading [web:96]

// Tables
const usersTableBody = document.querySelector("#usersTable tbody"); // users tbody [web:96]
const accountsTableBody = document.querySelector("#accountsTable tbody"); // accounts tbody [web:96]
const transactionsTableBody = document.querySelector("#transactionsTable tbody"); // transactions tbody [web:96]
const allAccountsTableBody = document.querySelector("#allAccountsTable tbody"); // all accounts tbody [web:96]
const allTransactionsTableBody = document.querySelector("#allTransactionsTable tbody"); // all transactions tbody [web:96]

// Sidebar nav
const viewUsersBtn = document.getElementById("viewUsersBtn"); // Users nav [web:96]
const viewAllAccountsBtn = document.getElementById("viewAllAccountsBtn"); // Accounts nav [web:96]
const viewAllTransactionsBtn = document.getElementById("viewAllTransactionsBtn"); // Transactions nav [web:96]

// Back buttons
const backToUsersBtn = document.getElementById("backToUsers"); // back from accounts to users [web:96]
const backToAccountsBtn = document.getElementById("backToAccounts"); // back from transactions to accounts [web:96]

// ====== Utilities ======
// Show only one section and set title
function showSection(el) {
  [usersSection, accountsSection, transactionsSection, allAccountsSection, allTransactionsSection]
    .forEach(s => s && s.classList.add("d-none")); // hide all [web:80]
  if (el) el.classList.remove("d-none"); // show selected [web:80]
  if (sectionTitle) {
    sectionTitle.textContent =
      el === usersSection ? "Users" :
      el === accountsSection ? "User Accounts" :
      el === transactionsSection ? "Account Transactions" :
      el === allAccountsSection ? "All Accounts" :
      el === allTransactionsSection ? "All Transactions" : "Dashboard"; // update title [web:96]
  }
}

// Set sidebar active state
function setActive(link) {
  [viewUsersBtn, viewAllAccountsBtn, viewAllTransactionsBtn]
    .forEach(a => a && a.classList.remove("active")); // clear active [web:39]
  if (link) link.classList.add("active"); // set active [web:39]
}

// Centralized fetch with robust error handling
async function fetchJson(url, options = {}) {
  const headers = { ...(options.headers || {}), "Authorization": `Bearer ${token}` }; // attach token [web:104]
  const res = await fetch(url, { ...options, headers }); // do request [web:74]

  let bodyText = "";
  try { bodyText = await res.text(); } catch {} // read text safely [web:74]

  if (!res.ok) {
    // Surface HTTP error statuses (fetch doesn't throw for 4xx/5xx) [web:72]
    let parsed;
    try { parsed = bodyText ? JSON.parse(bodyText) : null; } catch {}
    const detail = parsed?.message || parsed?.error || bodyText || "Unknown error"; // parse error body if JSON [web:72]
    console.error("Request failed", { url, status: res.status, statusText: res.statusText, detail }); // dev log [web:104]
    if (res.status === 401) alert("Session expired or invalid token."); // auth error [web:72]
    else if (res.status === 403) alert("Not authorized to access this resource."); // forbidden [web:72]
    else if (res.status === 404) alert("Resource not found."); // not found [web:72]
    else if (res.status >= 500) alert("Server error. Try again later."); // server error [web:72]
    throw new Error(`HTTP ${res.status} ${res.statusText}: ${detail}`); // throw to caller [web:72]
  }

  // Parse JSON if present
  if (!bodyText) return null; // no content [web:74]
  try { return JSON.parse(bodyText); } catch (e) {
    console.error("Failed to parse JSON", e, { url, bodyText }); // parsing error [web:72]
    throw e; // bubble up [web:72]
  }
}

// ====== Data Loaders ======
// 1) Users
async function fetchUsers() {
  try {
    const users = await fetchJson(`${apiBase}/api/admin/users`); // GET users [web:33]
    usersTableBody.innerHTML = ""; // clear [web:96]
    (users || []).forEach(user => {
      const tr = document.createElement("tr"); // row [web:96]
      tr.innerHTML = `
        <td>${user.id}</td>
        <td>${user.username}</td>
        <td>${user.role}</td>
        <td>${user.provider || "-"}</td>
        <td><button class="btn btn-sm btn-primary" onclick="viewAccounts('${user.id}')">View Accounts</button></td>
      `; // row cells [web:64]
      usersTableBody.appendChild(tr); // add row [web:96]
    });
    showSection(usersSection); // show users [web:80]
    setActive(viewUsersBtn); // highlight Users [web:39]
  } catch (err) {
    alert("Error fetching users"); // user notice [web:72]
    console.error(err); // dev log [web:104]
  }
}

// 2) Accounts for a specific user
async function viewAccounts(userId) {
  showSection(accountsSection); // switch section [web:80]
  try {
    // Endpoint pattern: /api/admin/accounts/{userId} (controller maps accounts by user) [web:33]
    const accounts = await fetchJson(`${apiBase}/api/admin/accounts/${userId}`); // load accounts [web:33]
    accountsTableBody.innerHTML = ""; // clear [web:96]
    (accounts || []).forEach(acc => {
      const tr = document.createElement("tr"); // row [web:96]
      tr.innerHTML = `
        <td>${acc.id}</td>
        <td>${acc.owner || acc.user?.username || "-"}</td>
        <td>${acc.currency}</td>
        <td>${acc.balance}</td>
        <td>${acc.status}</td>
        <td><button class="btn btn-sm btn-info" onclick="viewTransactions('${acc.id}')">View Transactions</button></td>
      `; // account cells with optional chaining [web:84]
      accountsTableBody.appendChild(tr); // add row [web:96]
    });
  } catch (err) {
    alert("Error fetching accounts"); // user notice [web:72]
    console.error(err); // dev log [web:104]
  }
}

// 3) Transactions for a specific account
async function viewTransactions(accountId) {
  showSection(transactionsSection); // switch section [web:80]
  try {
    // Endpoint pattern: /api/admin/transactions/{accountId} (controller maps transactions by account) [web:33]
    const txns = await fetchJson(`${apiBase}/api/admin/transactions/${accountId}`); // load txns [web:33]
    transactionsTableBody.innerHTML = ""; // clear [web:96]
    (txns || []).forEach(txn => {
      const tr = document.createElement("tr"); // row [web:96]
      tr.innerHTML = `
        <td>${txn.id}</td>
        <td>${txn.account?.owner || txn.account?.user?.username || "-"}</td>
        <td>${txn.destinationAccount?.owner || txn.destinationAccount?.user?.username || "-"}</td>
        <td>${txn.type}</td>
        <td>${txn.amount}</td>
        <td>${txn.status}</td>
        <td>${txn.narration || "-"}</td>
        <td>${txn.createdAt ? new Date(txn.createdAt).toLocaleString() : "-"}</td>
      `; // cells with safe optional chaining [web:84]
      transactionsTableBody.appendChild(tr); // add row [web:96]
    });
  } catch (err) {
    alert("Error fetching transactions"); // user notice [web:72]
    console.error(err); // dev log [web:104]
  }
}

// 4) All Accounts (global)
async function fetchAllAccounts() {
  showSection(allAccountsSection); // switch section [web:80]
  try {
    const accounts = await fetchJson(`${apiBase}/api/admin/accounts`); // GET all accounts [web:33]
    allAccountsTableBody.innerHTML = ""; // clear [web:96]
    (accounts || []).forEach(acc => {
      const tr = document.createElement("tr"); // row [web:96]
      tr.innerHTML = `
        <td>${acc.id}</td>
        <td>${acc.owner || acc.user?.username || "-"}</td>
        <td>${acc.currency}</td>
        <td>${acc.balance}</td>
        <td>${acc.status}</td>
        <td><button class="btn btn-sm btn-info" onclick="viewTransactions('${acc.id}')">View Transactions</button></td>
      `; // cells with optional chaining [web:84]
      allAccountsTableBody.appendChild(tr); // add row [web:96]
    });
    setActive(viewAllAccountsBtn); // highlight Accounts [web:39]
  } catch (e) {
    console.error(e); // dev log [web:104]
    alert("Error fetching all accounts"); // user notice [web:72]
  }
}

// 5) All Transactions (global)
async function fetchAllTransactions() {
  showSection(allTransactionsSection); // switch section [web:80]
  try {
    const txns = await fetchJson(`${apiBase}/api/admin/transactions`); // GET all transactions [web:33]
    allTransactionsTableBody.innerHTML = ""; // clear [web:96]
    (txns || []).forEach(txn => {
      const tr = document.createElement("tr"); // row [web:96]
      tr.innerHTML = `
        <td>${txn.id}</td>
        <td>${txn.account?.owner || txn.account?.user?.username || "-"}</td>
        <td>${txn.destinationAccount?.owner || txn.destinationAccount?.user?.username || "-"}</td>
        <td>${txn.type}</td>
        <td>${txn.amount}</td>
        <td>${txn.status}</td>
        <td>${txn.narration || "-"}</td>
        <td>${txn.createdAt ? new Date(txn.createdAt).toLocaleString() : "-"}</td>
      `; // cells with optional chaining [web:84]
      allTransactionsTableBody.appendChild(tr); // add row [web:96]
    });
    setActive(viewAllTransactionsBtn); // highlight Transactions [web:39]
  } catch (e) {
    console.error(e); // dev log [web:104]
    alert("Error fetching all transactions"); // user notice [web:72]
  }
}

// ====== Navigation & Events ======
// Back buttons
if (backToUsersBtn) {
  backToUsersBtn.addEventListener("click", () => {
    showSection(usersSection); // go back to users [web:80]
  });
}
if (backToAccountsBtn) {
  backToAccountsBtn.addEventListener("click", () => {
    showSection(accountsSection); // go back to accounts [web:80]
  });
}

// Sidebar links
if (viewUsersBtn) {
  viewUsersBtn.addEventListener("click", (e) => {
    e.preventDefault(); // avoid page jump [web:100]
    setActive(viewUsersBtn); // set active [web:39]
    fetchUsers(); // load users [web:96]
  });
}
if (viewAllAccountsBtn) {
  viewAllAccountsBtn.addEventListener("click", (e) => {
    e.preventDefault(); // avoid page jump [web:100]
    setActive(viewAllAccountsBtn); // set active [web:39]
    fetchAllAccounts(); // load all accounts [web:96]
  });
}
if (viewAllTransactionsBtn) {
  viewAllTransactionsBtn.addEventListener("click", (e) => {
    e.preventDefault(); // avoid page jump [web:100]
    setActive(viewAllTransactionsBtn); // set active [web:39]
    fetchAllTransactions(); // load all transactions [web:96]
  });
}

// Logout
const logoutBtn = document.getElementById("logoutBtn"); // logout button [web:96]
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("token"); // clear token [web:104]
    window.location.replace("index.html"); // redirect [web:104]
  });
}

// ====== Init ======
window.addEventListener("DOMContentLoaded", fetchUsers); // initial load after DOM ready [web:105]
