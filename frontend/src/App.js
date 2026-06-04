import React, { useState, useEffect, useCallback } from "react";
import Dashboard from "./components/Dashboard";
import LogActivity from "./components/LogActivity";
import Members from "./components/Members";
import Transactions from "./components/Transactions";
import "./App.css";

const API = "https://trip-7lis.vercel.app/api";

export default function App() {
  const [tab, setTab] = useState("dashboard");
  const [members, setMembers]           = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats]               = useState(null);
  const [activities, setActivities]     = useState([]);
  const [toast, setToast]               = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchAll = useCallback(async () => {
    try {
      const [m, t, s, a] = await Promise.all([
        fetch(`${API}/members`).then((r) => r.json()),
        fetch(`${API}/transactions`).then((r) => r.json()),
        fetch(`${API}/stats`).then((r) => r.json()),
        fetch(`${API}/activities`).then((r) => r.json()),
      ]);
      setMembers(m);
      setTransactions(t);
      setStats(s);
      setActivities(a);
    } catch {
      showToast("ไม่สามารถเชื่อมต่อ Server ได้", "error");
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const addTransaction = async (data) => {
    const res = await fetch(`${API}/transactions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      showToast(err.error || "เกิดข้อผิดพลาด", "error");
      return false;
    }
    await fetchAll();
    showToast("บันทึกรายการเรียบร้อย ✅");
    return true;
  };

  const deleteTransaction = async (id) => {
    await fetch(`${API}/transactions/${id}`, { method: "DELETE" });
    await fetchAll();
    showToast("ลบรายการเรียบร้อย");
  };

  const addMember = async (name) => {
    const res = await fetch(`${API}/members`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    if (!res.ok) {
      const err = await res.json();
      showToast(err.error || "เกิดข้อผิดพลาด", "error");
      return false;
    }
    await fetchAll();
    showToast("เพิ่มสมาชิกเรียบร้อย 🎉");
    return true;
  };

  const deleteMember = async (id) => {
    await fetch(`${API}/members/${id}`, { method: "DELETE" });
    await fetchAll();
    showToast("ลบสมาชิกเรียบร้อย");
  };

  const TABS = [
    { key: "dashboard",    label: "ภาพรวม",   icon: "🏖️" },
    { key: "log",         label: "บันทึก",    icon: "✏️" },
    { key: "transactions", label: "รายการ",   icon: "📋" },
    { key: "members",      label: "สมาชิก",   icon: "👥" },
  ];

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="header-inner">
          <div className="header-brand">
            <span className="brand-icon">✈️</span>
            <div>
              <h1 className="brand-title">กองทุนทริปประจำปี</h1>
              <p className="brand-sub">ออกกำลังกาย • วาดรูป • ดูหนัง = สมทบทุน</p>
            </div>
          </div>
          {stats && (
            <div className="header-total">
              <span className="total-label">ยอดรวม</span>
              <span className="total-amount">฿{stats.total.toLocaleString()}</span>
            </div>
          )}
        </div>
      </header>

      <nav className="app-nav">
        {TABS.map((t) => (
          <button
            key={t.key}
            className={`nav-tab ${tab === t.key ? "active" : ""}`}
            onClick={() => setTab(t.key)}
          >
            <span className="nav-icon">{t.icon}</span>
            <span className="nav-label">{t.label}</span>
          </button>
        ))}
      </nav>

      <main className="app-main">
        {tab === "dashboard"    && <Dashboard stats={stats} members={members} activities={activities} />}
        {tab === "log"         && <LogActivity members={members} activities={activities} onSubmit={addTransaction} />}
        {tab === "transactions" && <Transactions transactions={transactions} onDelete={deleteTransaction} />}
        {tab === "members"      && <Members members={members} onAdd={addMember} onDelete={deleteMember} />}
      </main>

      {toast && (
        <div className={`toast toast-${toast.type} animate-in`}>{toast.msg}</div>
      )}
    </div>
  );
}
