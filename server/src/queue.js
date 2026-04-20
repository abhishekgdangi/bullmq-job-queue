// src/queue.js — BullMQ Queue + Redis connection
const { Queue } = require("bullmq");
const IORedis = require("ioredis");

// ─── Redis Connection ─────────────────────────────────────────────────────────
// On Render: add REDIS_URL env var pointing to Upstash or Redis Cloud free tier
const connection = new IORedis(process.env.REDIS_URL || "redis://localhost:6379", {
  maxRetriesPerRequest: null, // Required by BullMQ
  retryStrategy: (times) => {
    if (times > 10) return null; // Give up after 10 retries
    return Math.min(times * 500, 3000); // Exponential backoff, max 3s
  },
});

connection.on("connect", () => console.log("✅ Redis connected"));
connection.on("error", (err) => console.error("❌ Redis error:", err.message));

// ─── Queue Definition ─────────────────────────────────────────────────────────
// defaultJobOptions apply to ALL jobs added to this queue unless overridden
const jobQueue = new Queue("main-jobs", {
  connection,
  defaultJobOptions: {
    attempts: 3,                        // Retry failed jobs up to 3 times
    backoff: {
      type: "exponential",              // Wait 1s, 2s, 4s between retries
      delay: 1000,
    },
    removeOnComplete: { count: 100 },   // Keep last 100 completed jobs
    removeOnFail: { count: 50 },        // Keep last 50 failed jobs
  },
});

// ─── Queue Event Listeners ────────────────────────────────────────────────────
jobQueue.on("error", (err) => console.error("Queue error:", err.message));

module.exports = { jobQueue, connection };
