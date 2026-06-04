import React from "react";
import "./Dashboard.css";

const ACTIVITY_META = {
  exercise: { label: "ออกกำลังกาย", icon: "🏃", color: "leaf" },
  drawing:  { label: "วาดรูป",       icon: "🎨", color: "sun" },
  movie:    { label: "ดูหนัง",       icon: "🎬", color: "coral" },
};

export default function Dashboard({ stats, members, activities }) {
  if (!stats) {
    return (
      <div className="loading-state">
        <span className="loading-spin">🌊</span>
        <p>กำลังโหลดข้อมูล...</p>
      </div>
    );
  }

  const tripGoal = 10000;
  const progress = Math.min((stats.total / tripGoal) * 100, 100);

  return (
    <div className="dashboard animate-in">
      {/* Goal progress */}
      <div className="card goal-card">
        <div className="goal-header">
          <div>
            <h2 className="goal-title">🏖️ เป้าหมายกองทุนทริป</h2>
            <p className="goal-sub">เป้า ฿{tripGoal.toLocaleString()}</p>
          </div>
          <div className="goal-amount">
            <span className="goal-current">฿{stats.total.toLocaleString()}</span>
            <span className="goal-pct">{Math.round(progress)}%</span>
          </div>
        </div>
        <div className="progress-track">
          <div className="progress-bar" style={{ width: `${progress}%` }} />
        </div>
        <p className="goal-remaining">
          {stats.total >= tripGoal
            ? "🎉 ถึงเป้าหมายแล้ว! พร้อมไปเที่ยวได้เลย"
            : `เหลืออีก ฿${(tripGoal - stats.total).toLocaleString()} จะถึงเป้า`}
        </p>
      </div>

      {/* Activity breakdown */}
      <h3 className="section-title">ยอดแบ่งตามกิจกรรม</h3>
      <div className="activity-grid">
        {activities.map((act) => {
          const meta = ACTIVITY_META[act.key] || { label: act.key, icon: "📌", color: "gray" };
          const amount = stats.activityBreakdown?.[act.key] || 0;
          return (
            <div key={act.key} className={`activity-card act-${meta.color}`}>
              <div className="act-icon">{meta.icon}</div>
              <div className="act-label">{meta.label}</div>
              <div className="act-fine">ครั้งละ ฿{act.amount}</div>
              <div className="act-total">฿{amount.toLocaleString()}</div>
            </div>
          );
        })}
      </div>

      {/* Leaderboard */}
      <h3 className="section-title">🏆 ตารางผู้ร่วมสมทบ</h3>
      <div className="card leaderboard">
        {stats.leaderboard.length === 0 ? (
          <p className="empty-msg">ยังไม่มีสมาชิก</p>
        ) : (
          stats.leaderboard.map((m, i) => (
            <div key={m.id} className="lb-row">
              <span className={`lb-rank rank-${i + 1}`}>
                {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}
              </span>
              <div className="lb-avatar">{m.avatar}</div>
              <span className="lb-name">{m.name}</span>
              <div className="lb-bar-wrap">
                <div
                  className="lb-bar"
                  style={{
                    width: stats.total > 0 ? `${(m.total / stats.total) * 100}%` : "0%",
                  }}
                />
              </div>
              <span className="lb-amount">฿{m.total.toLocaleString()}</span>
            </div>
          ))
        )}
      </div>

      {/* Summary stats */}
      <div className="stat-row">
        <div className="stat-pill">
          <span className="stat-val">{stats.transactionCount}</span>
          <span className="stat-lbl">รายการทั้งหมด</span>
        </div>
        <div className="stat-pill">
          <span className="stat-val">{members.length}</span>
          <span className="stat-lbl">สมาชิก</span>
        </div>
        <div className="stat-pill">
          <span className="stat-val">
            {members.length > 0 ? `฿${Math.round(stats.total / members.length).toLocaleString()}` : "฿0"}
          </span>
          <span className="stat-lbl">เฉลี่ยต่อคน</span>
        </div>
      </div>
    </div>
  );
}
