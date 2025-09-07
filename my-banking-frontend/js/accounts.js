const apiBase = "http://localhost:8080/api"; // adjust if needed
const token = localStorage.getItem("token");

// Redirect to login if no token
if (!token) {
  window.location.href = "login.html";
}

// Fetch accounts
async function loadAccounts() {
  try {
    const res = await fetch(`${apiBase}/accounts`, {
      headers: { "Authorization": `Bearer ${token}` }
    });

    if (!res.ok) throw new Error("Failed to load accounts");

    const accounts = await res.json();
    const tbody = document.querySelector("#accountsTable tbody");
    tbody.innerHTML = "";

    accounts.forEach(acc => {
      tbody.innerHTML += `
        <tr>
          <td>${acc.id}</td>
          <td>${acc.owner}</td>
          <td>${acc.balance}</td>
          <td>${acc.currency}</td>
          <td>${acc.status}</td>
        </tr>`;
    });
  } catch (err) {
    alert("Error loading accounts: " + err.message);
  }
}

// Handle account creation
document.getElementById("createAccountForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const currency = document.getElementById("currency").value;
  const balance = document.getElementById("balance").value;
    const owner = document.getElementById("owner").value;

  try {
    const res = await fetch(`${apiBase}/accounts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ currency, balance, owner })
    });

    if (!res.ok) throw new Error("Failed to create account");

    alert("Account created successfully!");
    loadAccounts(); // reload after creation
  } catch (err) {
    alert("Error creating account: " + err.message);
  }
});

// Initial load
loadAccounts();
