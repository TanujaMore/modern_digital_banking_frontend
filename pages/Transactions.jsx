import { useEffect, useState } from "react";
import API from "../utils/api";
import { formatINR } from "../utils/format";
import { exportCSV, exportPDF } from "../services/exportService";

/* ------------------ CURRENCIES ------------------ */
const CURRENCIES = {
  INR: { symbol: "₹", rate: 1 },
  USD: { symbol: "$", rate: 0.012 },
  EUR: { symbol: "€", rate: 0.011 },
  GBP: { symbol: "£", rate: 0.0095 },
  JPY: { symbol: "¥", rate: 1.8 },
};

export default function Transactions() {
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [currency, setCurrency] = useState("INR");

  /* ------------------ ADD TRANSACTION STATES ------------------ */
  const [showForm, setShowForm] = useState(false);
  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("credit");
  const [txnDate, setTxnDate] = useState("");
  const [merchant, setMerchant] = useState("");

  /* ------------------ FETCH ACCOUNTS ------------------ */
  useEffect(() => {
    API.get("/accounts/")
      .then((res) => {
        setAccounts(res.data);
        if (res.data.length) setSelectedAccount(res.data[0].id);
      })
      .catch(() => alert("Failed to load accounts"));
  }, []);

  /* ------------------ FETCH TRANSACTIONS ------------------ */
  useEffect(() => {
    if (!selectedAccount) return;

    API.get(`/transactions/${selectedAccount}`)
      .then((res) => setTransactions(res.data))
      .catch(() => alert("Failed to load transactions"));
  }, [selectedAccount]);

  /* ------------------ FETCH CATEGORIES ------------------ */
  useEffect(() => {
    API.get("/transactions/categories")
      .then((res) => setCategories(res.data))
      .catch(() => alert("Failed to load categories"));
  }, []);

  /* ------------------ CSV IMPORT ------------------ */
  const handleCSV = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    API.post("/transactions/upload-csv", formData)
      .then(() => API.get(`/transactions/${selectedAccount}`))
      .then((res) => {
        setTransactions(res.data);
        alert("CSV uploaded successfully ✅");
      })
      .catch((err) => {
        console.error(err);
        alert("CSV upload failed ❌");
      });
  };

  /* ------------------ ADD TRANSACTION (FIXED) ------------------ */
  const handleAddTransaction = async () => {
    if (!amount || Number(amount) <= 0) {
      alert("Enter a valid amount");
      return;
    }

    try {
      await API.post("/transactions/", {
        account_id: Number(selectedAccount),
        description: desc || null,
        merchant: merchant || null,
        amount: Number(amount),           // 🔥 ensure number
        txn_type: type.toLowerCase(),     // 🔥 ensure lowercase
        currency,
        txn_date: txnDate || null,
      });

      alert("Transaction added successfully ✅");

      // reset
      setDesc("");
      setAmount("");
      setType("credit");
      setMerchant("");
      setTxnDate("");
      setShowForm(false);

      const res = await API.get(`/transactions/${selectedAccount}`);
      setTransactions(res.data);

    } catch (err) {
      console.error(err?.response?.data || err);
      alert("Failed to add transaction ❌ (check console)");
    }
  };

  /* ------------------ UPDATE CATEGORY ------------------ */
  const handleCategoryChange = (txnId, newCategory) => {
    API.put(`/transactions/${txnId}/category`, null, {
      params: { category: newCategory },
    })
      .then(() => {
        setTransactions((prev) =>
          prev.map((tx) =>
            tx.id === txnId ? { ...tx, category: newCategory } : tx
          )
        );
      })
      .catch(() => alert("Failed to update category ❌"));
  };

  /* ------------------ UI ------------------ */
  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Transactions</h1>
          <p className="text-gray-500">
            View and manage your transaction history
          </p>
        </div>

        <div className="flex gap-3 items-center">
          <select
            value={selectedAccount}
            onChange={(e) => setSelectedAccount(e.target.value)}
            className="border rounded px-3 py-2"
          >
            {accounts.map((acc) => (
              <option key={acc.id} value={acc.id}>
                {acc.bank_name} ({acc.account_type})
              </option>
            ))}
          </select>

          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="border rounded px-3 py-2"
          >
            {Object.keys(CURRENCIES).map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>

          <button onClick={exportCSV} className="bg-blue-600 text-white px-4 py-2 rounded">
            Export CSV
          </button>

          <button onClick={exportPDF} className="bg-red-600 text-white px-4 py-2 rounded">
            Export PDF
          </button>

          <label className="bg-indigo-700 text-white px-4 py-2 rounded cursor-pointer">
            Import CSV
            <input type="file" accept=".csv" hidden onChange={handleCSV} />
          </label>

          <button
            onClick={() => setShowForm(true)}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            + Add
          </button>
        </div>
      </div>

      {/* ADD FORM */}
      {showForm && (
        <div className="bg-white p-4 rounded-xl shadow space-y-3">
          <input
            placeholder="Description"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            className="border p-2 w-full"
          />

          <input
            placeholder="Merchant"
            value={merchant}
            onChange={(e) => setMerchant(e.target.value)}
            className="border p-2 w-full"
          />

          <input
            type="number"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="border p-2 w-full"
          />

          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="border p-2 w-full"
          >
            <option value="credit">Credit</option>
            <option value="debit">Debit</option>
          </select>

          <input
            type="date"
            value={txnDate}
            onChange={(e) => setTxnDate(e.target.value)}
            className="border p-2 w-full"
          />

          <div className="flex gap-3">
            <button onClick={handleAddTransaction} className="bg-green-600 text-white px-4 py-2 rounded">
              Save
            </button>
            <button onClick={() => setShowForm(false)} className="bg-gray-400 px-4 py-2 rounded">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3">ID</th>
              <th className="p-3">Description</th>
              <th className="p-3">Merchant</th>
              <th className="p-3">Category</th>
              <th className="p-3">Amount</th>
              <th className="p-3">Type</th>
              <th className="p-3">Date</th>
            </tr>
          </thead>

          <tbody>
            {transactions.map((tx) => (
              <tr key={tx.id} className="border-t">
                <td className="p-3">{tx.id}</td>
                <td className="p-3">{tx.description || "-"}</td>
                <td className="p-3">{tx.merchant || "-"}</td>

                <td className="p-3">
                  <select
                    value={tx.category || "Others"}
                    onChange={(e) =>
                      handleCategoryChange(tx.id, e.target.value)
                    }
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </td>

                <td className={`p-3 font-semibold ${tx.txn_type === "credit" ? "text-green-600" : "text-red-600"}`}>
                  {tx.txn_type === "credit" ? "+" : "-"}
                  {formatINR(Math.abs(tx.amount))}
                </td>

                <td className="p-3">{tx.txn_type}</td>

                <td className="p-3">
                  {tx.txn_date
                    ? new Date(tx.txn_date).toISOString().split("T")[0]
                    : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
