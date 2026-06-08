const express = require("express");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: ["https://bptripfund.vercel.app", "http://localhost:3000"],
  methods: ["GET", "POST", "DELETE"],
}));
app.use(express.json());

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

let members = [
  { id: uuidv4(), name: "สมชาย", avatar: "ส" },
  { id: uuidv4(), name: "มานี", avatar: "ม" },
  { id: uuidv4(), name: "วิชัย", avatar: "ว" },
];
let transactions = [];

const ACTIVITY_FINES = {
  exercise: 20,
  drawing: 30,
  movie: 50,
};

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

app.get("/api/activities", (req, res) => {
  res.json(Object.entries(ACTIVITY_FINES).map(([key, amount]) => ({ key, amount })));
});

app.get("/api/members", (req, res) => {
  const { memberTotals } = calcStats();
  res.json(members.map((m) => ({ ...m, totalContributed: memberTotals[m.id] || 0 })));
});

app.post("/api/members", (req, res) => {
  const { name } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ error: "ต้องระบุชื่อสมาชิก" });
  const member = { id: uuidv4(), name: name.trim(), avatar: name.trim().charAt(0).toUpperCase() };
  members.push(member);
  res.status(201).json(member);
});

app.delete("/api/members/:id", (req, res) => {
  const idx = members.findIndex((m) => m.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "ไม่พบสมาชิก" });
  members.splice(idx, 1);
  res.json({ success: true });
});

app.get("/api/transactions", (req, res) => {
  const enriched = transactions.map((t) => ({
    ...t,
    memberName: members.find((m) => m.id === t.memberId)?.name || "ไม่ทราบ",
  }));
  res.json(enriched.slice().reverse());
});

app.post("/api/transactions", upload.single("image"), (req, res) => {
  const { memberId, activity, note } = req.body;
  if (!memberId) return res.status(400).json({ error: "ต้องระบุสมาชิก" });
  if (!activity || !ACTIVITY_FINES[activity]) return res.status(400).json({ error: "กิจกรรมไม่ถูกต้อง" });
  const member = members.find((m) => m.id === memberId);
  if (!member) return res.status(404).json({ error: "ไม่พบสมาชิก" });

  let imageUrl = null;
  if (req.file) {
    const base64 = req.file.buffer.toString("base64");
    imageUrl = `data:${req.file.mimetype};base64,${base64}`;
  }

  const tx = {
    id: uuidv4(), memberId, activity,
    amount: ACTIVITY_FINES[activity],
    note: note || "", imageUrl,
    createdAt: new Date().toISOString(),
  };
  transactions.push(tx);
  res.status(201).json({ ...tx, memberName: member.name });
});

app.delete("/api/transactions/:id", (req, res) => {
  const idx = transactions.findIndex((t) => t.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "ไม่พบรายการ" });
  transactions.splice(idx, 1);
  res.json({ success: true });
});

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

app.listen(PORT, () => console.log(`🚀 Running on http://localhost:${PORT}`));
module.exports = app;
