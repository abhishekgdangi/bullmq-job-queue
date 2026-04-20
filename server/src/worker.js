// src/worker.js — BullMQ Worker
// Run this as a SEPARATE process: `node src/worker.js`
// On Render: set up as a Background Worker service

require("dotenv").config();
const { Worker, QueueEvents } = require("bullmq");
const { connection } = require("./queue");

// ─── Job Processors ───────────────────────────────────────────────────────────
const processors = {
  "send-email": async (job) => {
    const { to, subject, body } = job.data;
    console.log(`📧 Sending email to ${to}...`);

    // Simulate sending: replace with nodemailer/SendGrid/Resend
    await sleep(1500);
    await job.updateProgress(50);

    await sleep(1000);
    await job.updateProgress(100);

    return { sent: true, messageId: `msg_${Date.now()}`, to };
  },

  "generate-report": async (job) => {
    const { reportType, userId } = job.data;
    console.log(`📊 Generating ${reportType} report for user ${userId}...`);

    for (let i = 10; i <= 100; i += 10) {
      await sleep(600);
      await job.updateProgress(i);
    }

    return { reportUrl: `/reports/${userId}_${reportType}_${Date.now()}.pdf` };
  },

  "resize-image": async (job) => {
    const { imageUrl, width, height } = job.data;
    console.log(`🖼️  Resizing image ${imageUrl} to ${width}x${height}...`);

    // Replace with sharp: const sharp = require('sharp')
    await sleep(2000);
    await job.updateProgress(100);

    return { resizedUrl: `${imageUrl}?w=${width}&h=${height}`, width, height };
  },

  "push-notification": async (job) => {
    const { userId, message } = job.data;
    console.log(`🔔 Sending push to user ${userId}...`);

    await sleep(800);
    await job.updateProgress(100);

    return { delivered: true, userId };
  },

  "export-data": async (job) => {
    const { format, filters } = job.data;
    console.log(`📁 Exporting data as ${format}...`);

    for (let i = 20; i <= 100; i += 20) {
      await sleep(1000);
      await job.updateProgress(i);
    }

    return { downloadUrl: `/exports/export_${Date.now()}.${format}`, format };
  },
};

// ─── Worker Instance ──────────────────────────────────────────────────────────
const worker = new Worker(
  "main-jobs",
  async (job) => {
    console.log(`\n⚙️  [Worker] Processing job #${job.id} (${job.name}) — attempt ${job.attemptsMade + 1}`);

    const processor = processors[job.name];
    if (!processor) throw new Error(`Unknown job type: ${job.name}`);

    return processor(job);
  },
  {
    connection,
    concurrency: 3, // Process up to 3 jobs at the same time
    limiter: {
      max: 10,       // Max 10 jobs per duration window
      duration: 1000 // Per 1 second
    },
  }
);

// ─── Worker Event Listeners ───────────────────────────────────────────────────
worker.on("completed", (job, result) => {
  console.log(`✅ Job #${job.id} (${job.name}) completed:`, result);
});

worker.on("failed", (job, err) => {
  console.error(`❌ Job #${job?.id} (${job?.name}) failed (attempt ${job?.attemptsMade}/${job?.opts?.attempts}):`, err.message);
});

worker.on("progress", (job, progress) => {
  console.log(`⏳ Job #${job.id} (${job.name}) progress: ${progress}%`);
});

worker.on("stalled", (jobId) => {
  console.warn(`⚠️  Job #${jobId} stalled — will be re-queued`);
});

worker.on("error", (err) => {
  console.error("Worker error:", err);
});

// ─── Queue Events (optional: for logging all queue activity) ──────────────────
const queueEvents = new QueueEvents("main-jobs", { connection });

queueEvents.on("waiting", ({ jobId }) => console.log(`⏸️  Job #${jobId} waiting`));
queueEvents.on("active", ({ jobId }) => console.log(`▶️  Job #${jobId} started`));
queueEvents.on("delayed", ({ jobId, delay }) => console.log(`⏰ Job #${jobId} delayed by ${delay}ms`));

// ─── Graceful Shutdown ────────────────────────────────────────────────────────
process.on("SIGTERM", async () => {
  console.log("SIGTERM received — draining worker...");
  await worker.close();
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("\nShutting down worker...");
  await worker.close();
  process.exit(0);
});

// ─── Helpers ──────────────────────────────────────────────────────────────────
const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

console.log("🚀 Worker started — listening for jobs on 'main-jobs' queue");
