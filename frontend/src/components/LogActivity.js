import React, { useState } from "react";
import "./LogActivity.css";

const ACTIVITY_META = {
  exercise: { label: "ออกกำลังกาย", icon: "🏃", desc: "วิ่ง ว่ายน้ำ ยิม ฯลฯ" },
  drawing:  { label: "วาดรูป",       icon: "🎨", desc: "วาดภาพระบายสี ฯลฯ" },
  movie:    { label: "ดูหนัง",       icon: "🎬", desc: "โรงภาพยนตร์ หรือที่บ้าน" },
};

export default function LogActivity({ members, activities, onSubmit }) {
  const [memberId, setMemberId] = useState("");
  const [activity, setActivity] = useState("");
  const [note, setNote]         = useState("");
  const [loading, setLoading]   = useState(false);
  const [success, setSuccess]   = useState(false);
  const [image, setImage]       = useState(null);
  const [preview, setPreview]   = useState(null);

  const selectedActivity = activities.find((a) => a.key === activity);

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!memberId || !activity) return;
    setLoading(true);
    const formData = new FormData();
    formData.append("memberId", memberId);
    formData.append("activity", activity);
    formData.append("note", note);
    if (image) formData.append("image", image);
    const res = await fetch("https://trip-7lis.vercel.app/api/transactions", {
      method: "POST",
      body: formData,
    });
    setLoading(false);
    if (res.ok) {
      setSuccess(true);
      setMemberId(""); setActivity(""); setNote("");
      setImage(null); setPreview(null);
      setTimeout(() => setSuccess(false), 2500);
    }
  };

  if (success) {
    return (
      <div className="log-success animate-in">
        <div className="success-icon">✅</div>
        <h2>บันทึกเรียบร้อย!</h2>
        <p>เงินถูกสมทบเข้ากองกลางแล้ว</p>
        <button className="btn-primary" onClick={() => setSuccess(false)}>
          บันทึกรายการใหม่
        </button>
      </div>
    );
  }

  return (
    <div className="log-wrap animate-in">
      <div className="card log-card">
        <div className="log-top">
          <h2 className="log-title">✏️ บันทึกกิจกรรม</h2>
          <p className="log-sub">เลือกสมาชิกและกิจกรรมที่ทำเพื่อสมทบเงินเข้ากองกลาง</p>
        </div>

        <div className="field">
          <label className="field-label">สมาชิก</label>
          <div className="member-grid">
            {members.length === 0 ? (
              <p className="hint">ยังไม่มีสมาชิก กรุณาเพิ่มสมาชิกก่อน</p>
            ) : (
              members.map((m) => (
                <button key={m.id}
                  className={`member-chip ${memberId === m.id ? "selected" : ""}`}
                  onClick={() => setMemberId(m.id)}>
                  <span className="chip-avatar">{m.avatar}</span>
                  <span>{m.name}</span>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="field">
          <label className="field-label">กิจกรรม</label>
          <div className="activity-pick">
            {activities.map((act) => {
              const meta = ACTIVITY_META[act.key] || { label: act.key, icon: "📌", desc: "" };
              return (
                <button key={act.key}
                  className={`act-btn ${activity === act.key ? "selected" : ""}`}
                  onClick={() => setActivity(act.key)}>
                  <span className="act-btn-icon">{meta.icon}</span>
                  <span className="act-btn-label">{meta.label}</span>
                  <span className="act-btn-desc">{meta.desc}</span>
                  <span className="act-btn-fine">฿{act.amount}</span>
                </button>
              );
            })}
          </div>
        </div>

        {memberId && activity && selectedActivity && (
          <div className="fine-preview animate-in">
            <span className="preview-icon">💰</span>
            <span className="preview-text">
              <strong>{members.find((m) => m.id === memberId)?.name}</strong>
              {" "}จ่าย <strong>฿{selectedActivity.amount}</strong> เข้ากองกลาง
            </span>
          </div>
        )}

        <div className="field">
          <label className="field-label">หมายเหตุ (ไม่บังคับ)</label>
          <input className="text-input" type="text"
            placeholder="เช่น วิ่ง 5 กม. ที่สวนลุม"
            value={note} onChange={(e) => setNote(e.target.value)} />
        </div>

        <div className="field">
          <label className="field-label">แนบรูปภาพ (ไม่บังคับ)</label>
          <label className="upload-box">
            {preview ? (
              <img src={preview} alt="preview" className="upload-preview" />
            ) : (
              <div className="upload-placeholder">
                <span>📷</span>
                <span>แตะเพื่อเลือกรูป</span>
              </div>
            )}
            <input type="file" accept="image/*" onChange={handleImage} style={{ display: "none" }} />
          </label>
          {preview && (
            <button className="btn-ghost" style={{ marginTop: 8, fontSize: 13 }}
              onClick={() => { setImage(null); setPreview(null); }}>
              ลบรูป
            </button>
          )}
        </div>

        <button className="btn-primary submit-btn"
          disabled={!memberId || !activity || loading}
          onClick={handleSubmit}>
          {loading ? "กำลังบันทึก..." : "💾 บันทึกและสมทบทุน"}
        </button>
      </div>

      <div className="rules-box">
        <h3>📌 กฎกองทุน</h3>
        <ul>
          {activities.map((act) => {
            const meta = ACTIVITY_META[act.key] || { label: act.key, icon: "📌" };
            return (
              <li key={act.key}>
                {meta.icon} {meta.label} → จ่าย <strong>฿{act.amount}</strong> ต่อครั้ง
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
