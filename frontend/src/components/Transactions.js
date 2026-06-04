import React, { useState } from "react";
import "./Transactions.css";

const ACTIVITY_META = {
  exercise: { label: "ออกกำลังกาย", icon: "🏃" },
  drawing:  { label: "วาดรูป",       icon: "🎨" },
  movie:    { label: "ดูหนัง",       icon: "🎬" },
};

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString("th-TH", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export default function Transactions({ transactions, onDelete }) {
  const [filter, setFilter] = useState("all");
  const [confirm, setConfirm] = useState(null);

  const filtered =
    filter === "all" ? transactions : transactions.filter((t) => t.activity === filter);

  const handleDelete = async (id) => {
    await onDelete(id);
    setConfirm(null);
  };

  return (
    <div className="tx-wrap animate-in">
      {/* Filter bar */}
      <div className="filter-bar">
        {["all", "exercise", "drawing", "movie"].map((f) => {
          const meta = ACTIVITY_META[f];
          return (
            <button
              key={f}
              className={`filter-btn ${filter === f ? "active" : ""}`}
              onClick={() => setFilter(f)}
            >
              {meta ? `${meta.icon} ${meta.label}` : "📋 ทั้งหมด"}
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">📭</span>
          <p>ยังไม่มีรายการ</p>
        </div>
      ) : (
        <div className="tx-list">
          {filtered.map((t) => {
            const meta = ACTIVITY_META[t.activity] || { label: t.activity, icon: "📌" };
            return (
              <div key={t.id} className="tx-row card animate-in">
                <div className="tx-icon">{meta.icon}</div>
                <div className="tx-info">
                  <div className="tx-main">
                    <span className="tx-member">{t.memberName}</span>
                    <span className={`tag tag-${t.activity}`}>{meta.label}</span>
                  </div>
                  {t.note && <p className="tx-note">"{t.note}"</p>}
                  <p className="tx-date">{formatDate(t.createdAt)}</p>
                </div>
                <div className="tx-right">
                  <span className="tx-amount">฿{t.amount}</span>
                  <button
                    className="btn-danger"
                    onClick={() => setConfirm(t.id)}
                  >
                    ลบ
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirm dialog */}
      {confirm && (
        <div className="modal-overlay">
          <div className="modal-box card animate-in">
            <p className="modal-text">ต้องการลบรายการนี้หรือไม่?</p>
            <div className="modal-actions">
              <button className="btn-ghost" onClick={() => setConfirm(null)}>ยกเลิก</button>
              <button className="btn-danger" style={{ padding: "8px 20px" }} onClick={() => handleDelete(confirm)}>
                ยืนยันลบ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
