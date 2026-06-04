import React, { useState } from "react";
import "./Members.css";

export default function Members({ members, onAdd, onDelete }) {
  const [name, setName]       = useState("");
  const [loading, setLoading] = useState(false);
  const [confirm, setConfirm] = useState(null);

  const handleAdd = async () => {
    if (!name.trim()) return;
    setLoading(true);
    const ok = await onAdd(name.trim());
    setLoading(false);
    if (ok) setName("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleAdd();
  };

  return (
    <div className="members-wrap animate-in">
      {/* Add member */}
      <div className="card add-card">
        <h2 className="add-title">👥 จัดการสมาชิก</h2>
        <div className="add-row">
          <input
            className="text-input"
            type="text"
            placeholder="ชื่อสมาชิกใหม่..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button
            className="btn-primary"
            onClick={handleAdd}
            disabled={!name.trim() || loading}
          >
            {loading ? "..." : "+ เพิ่ม"}
          </button>
        </div>
      </div>

      {/* Member list */}
      <div className="member-list">
        {members.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">🧑‍🤝‍🧑</span>
            <p>ยังไม่มีสมาชิก เพิ่มสมาชิกด้านบนได้เลย</p>
          </div>
        ) : (
          members.map((m, i) => (
            <div key={m.id} className="member-row card animate-in">
              <div className="m-rank">{i + 1}</div>
              <div className="m-avatar">{m.avatar}</div>
              <div className="m-info">
                <p className="m-name">{m.name}</p>
                <p className="m-contrib">
                  สมทบทุนแล้ว{" "}
                  <strong>฿{(m.totalContributed || 0).toLocaleString()}</strong>
                </p>
              </div>
              <div className="m-bar-wrap">
                <div className="m-bar" style={{ width: "100%" }} />
              </div>
              <button className="btn-danger" onClick={() => setConfirm(m.id)}>
                ลบ
              </button>
            </div>
          ))
        )}
      </div>

      {/* Confirm */}
      {confirm && (
        <div className="modal-overlay">
          <div className="modal-box card animate-in">
            <p className="modal-text">
              ลบ <strong>{members.find((m) => m.id === confirm)?.name}</strong> ออกจากกลุ่มหรือไม่?
            </p>
            <div className="modal-actions">
              <button className="btn-ghost" onClick={() => setConfirm(null)}>ยกเลิก</button>
              <button
                className="btn-danger"
                style={{ padding: "8px 20px" }}
                onClick={() => { onDelete(confirm); setConfirm(null); }}
              >
                ยืนยันลบ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
