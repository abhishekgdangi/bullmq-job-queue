// src/app.js — Express server entry point
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const jobRoutes = require("./routes/jobs");

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:3000" }));
app.use(express.json());

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use("/api/jobs", jobRoutes);

app.get("/health", (req, res) => {
  res.json({ status: "ok", uptime: Math.round(process.uptime()), timestamp: new Date().toISOString() });
});

// ─── Error Handler ────────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal server error" });
});

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 API server running on http://localhost:${PORT}`);
  console.log(`   Start worker separately: node src/worker.js`);
});

module.exports = app;
