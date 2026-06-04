const express = require("express");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// ── In-memory data store ──────────────────────────────────────────────────────
let members = [
  { id: uuidv4(), name: "สมชาย", avatar: "ส" },
  { id: uuidv4(), name: "มานี", avatar: "ม" },
  { id: uuidv4(), name: "วิชัย", avatar: "ว" },
];

let transactions = [];

// Activity fine amounts (THB)
const ACTIVITY_FINES = {
  exercise: 20,   // ออกกำลังกาย
  drawing: 30,    // วาดรูป
  movie: 50,      // ดูหนัง
};

// ── Helper ───────────────────────────────────────────────────────────────────
function calcStats() {
  const total = transactions.reduce((sum, t) => sum + t.amount, 0);
  const memberTotals = {};
  members.forEach((m) => (memberTotals[m.id] = 0));
  transactions.forEach((t) => {
    if (memberTotals[t.memberId] !== undefined) {
      memberTotals[t.memberId] += t.amount;
    }
  });
  return { total, memberTotals };
}

// ── Routes ────────────────────────────────────────────────────────────────────

// GET /api/activities — return activity definitions
app.get("/api/activities", (req, res) => {
  res.json(
    Object.entries(ACTIVITY_FINES).map(([key, amount]) => ({ key, amount }))
  );
});

// GET /api/members
app.get("/api/members", (req, res) => {
  const { memberTotals } = calcStats();
  const enriched = members.map((m) => ({
    ...m,
    totalContributed: memberTotals[m.id] || 0,
  }));
  res.json(enriched);
});

// POST /api/members
app.post("/api/members", (req, res) => {
  const { name } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: "ต้องระบุชื่อสมาชิก" });
  }
  const member = {
    id: uuidv4(),
    name: name.trim(),
    avatar: name.trim().charAt(0).toUpperCase(),
  };
  members.push(member);
  res.status(201).json(member);
});

// DELETE /api/members/:id
app.delete("/api/members/:id", (req, res) => {
  const idx = members.findIndex((m) => m.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "ไม่พบสมาชิก" });
  members.splice(idx, 1);
  res.json({ success: true });
});

// GET /api/transactions
app.get("/api/transactions", (req, res) => {
  const enriched = transactions.map((t) => ({
    ...t,
    memberName: members.find((m) => m.id === t.memberId)?.name || "ไม่ทราบ",
  }));
  res.json(enriched.slice().reverse());
});

// POST /api/transactions  — log an activity payment
app.post("/api/transactions", (req, res) => {
  const { memberId, activity, note } = req.body;

  if (!memberId) return res.status(400).json({ error: "ต้องระบุสมาชิก" });
  if (!activity || !ACTIVITY_FINES[activity]) {
    return res.status(400).json({ error: "กิจกรรมไม่ถูกต้อง" });
  }
  const member = members.find((m) => m.id === memberId);
  if (!member) return res.status(404).json({ error: "ไม่พบสมาชิก" });

  const amount = ACTIVITY_FINES[activity];
  const tx = {
    id: uuidv4(),
    memberId,
    activity,
    amount,
    note: note || "",
    createdAt: new Date().toISOString(),
  };
  transactions.push(tx);
  res.status(201).json({ ...tx, memberName: member.name });
});

// DELETE /api/transactions/:id
app.delete("/api/transactions/:id", (req, res) => {
  const idx = transactions.findIndex((t) => t.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "ไม่พบรายการ" });
  transactions.splice(idx, 1);
  res.json({ success: true });
});

// GET /api/stats
app.get("/api/stats", (req, res) => {
  const { total, memberTotals } = calcStats();

  const activityBreakdown = {};
  Object.keys(ACTIVITY_FINES).forEach((k) => (activityBreakdown[k] = 0));
  transactions.forEach((t) => (activityBreakdown[t.activity] += t.amount));

  const leaderboard = members
    .map((m) => ({ id: m.id, name: m.name, avatar: m.avatar, total: memberTotals[m.id] || 0 }))
    .sort((a, b) => b.total - a.total);

  res.json({ total, activityBreakdown, leaderboard, transactionCount: transactions.length });
});

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Trip Fund API running on http://localhost:${PORT}`);
});
