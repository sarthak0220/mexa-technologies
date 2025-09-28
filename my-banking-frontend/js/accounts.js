// ===== Config & auth =====
const apiBase = "http://localhost:8080/api";
const token = localStorage.getItem("token");
if (!token) window.location.href = "login.html";

// ===== DOM =====
const tbody = document.querySelector("#accountsTable tbody");
const acctSearch = document.getElementById("acctSearch");
const exportCsvBtn = document.getElementById("exportCsvBtn");

// ===== Row renderer with chips and formatted balance =====
function renderAccountRow(acc) {
  const statusChip =
    acc.status === "ACTIVE" ? '<span class="chip chip-success">Active</span>' :
    acc.status === "PENDING" ? '<span class="chip chip-warning">Pending</span>' :
    '<span class="chip chip-danger">Blocked</span>';

  const balance = Number(acc.balance || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  return `
    <tr>
      <td>${acc.id}</td>
      <td>${acc.owner}</td>
      <td class="text-end">${balance}</td>
      <td>${acc.currency}</td>
      <td>${statusChip}</td>
    </tr>
  `;
}

// ===== Data: fetch & render =====
async function loadAccounts() {
  try {
    const res = await fetch(`${apiBase}/accounts`, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    if (!res.ok) throw new Error("Failed to load accounts");

    const accounts = await res.json();
    tbody.innerHTML = accounts.map(renderAccountRow).join("");

    // Re-apply active search after rows update
    if (acctSearch && acctSearch.value) {
      const ev = new Event("input");
      acctSearch.dispatchEvent(ev);
    }
  } catch (err) {
    alert("Error loading accounts: " + err.message);
  }
}

// ===== Create account =====
document.getElementById("createAccountForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const currency = document.getElementById("currency").value.trim();
  const balance = document.getElementById("balance").value;
  const owner = document.getElementById("owner").value.trim();

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
    e.target.reset();
    loadAccounts();
  } catch (err) {
    alert("Error creating account: " + err.message);
  }
});

// ===== Search: live filter across all cells =====
if (acctSearch) {
  acctSearch.addEventListener("input", () => {
    const q = acctSearch.value.trim().toLowerCase();
    const rows = Array.from(tbody.querySelectorAll("tr"));

    if (!q) {
      rows.forEach(r => r.style.display = "");
      return;
    }

    rows.forEach(row => {
      const text = row.innerText.toLowerCase();
      row.style.display = text.includes(q) ? "" : "none";
    });
  });
}

// ===== Export: CSV of visible rows =====
exportCsvBtn?.addEventListener("click", () => {
  const rows = Array.from(document.querySelectorAll("#accountsTable tr"))
    .filter(r => r.style.display !== "none");

  const csv = rows.map(row => {
    return Array.from(row.querySelectorAll("th,td")).map(cell => {
      // Strip HTML (chips) and escape commas/quotes
      const text = cell.textContent.replace(/\s+/g, " ").trim();
      const escaped = `"${text.replace(/"/g, '""')}"`;
      return escaped;
    }).join(",");
  }).join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `accounts_${new Date().toISOString().slice(0,19).replace(/[:T]/g,'-')}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
});

// ===== Init =====
loadAccounts();
