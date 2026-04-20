// src/routes/jobs.js — REST API for job management
const express = require("express");
const router = express.Router();
const { jobQueue } = require("../queue");

// ─── POST /api/jobs — Add a new job ───────────────────────────────────────────
router.post("/", async (req, res) => {
  try {
    const { type, data = {}, priority = "normal", delay = 0 } = req.body;

    const validTypes = ["send-email", "generate-report", "resize-image", "push-notification", "export-data"];
    if (!type || !validTypes.includes(type)) {
      return res.status(400).json({ error: `Invalid job type. Must be one of: ${validTypes.join(", ")}` });
    }

    const priorityMap = { critical: 1, high: 2, normal: 3, low: 4 };

    const job = await jobQueue.add(type, data, {
      priority: priorityMap[priority] ?? 3,
      delay: parseInt(delay) || 0,
      jobId: `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    });

    res.status(201).json({
      success: true,
      job: {
        id: job.id,
        name: job.name,
        priority,
        delay,
        createdAt: new Date().toISOString(),
      },
    });
  } catch (err) {
    console.error("Add job error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/jobs — List jobs with optional status filter ────────────────────
router.get("/", async (req, res) => {
  try {
    const { status = "all", limit = 20 } = req.query;

    const statusMap = {
      all: ["active", "waiting", "completed", "failed", "delayed"],
      active: ["active"],
      waiting: ["waiting"],
      completed: ["completed"],
      failed: ["failed"],
      delayed: ["delayed"],
    };

    const statuses = statusMap[status] || statusMap.all;
    const jobs = await jobQueue.getJobs(statuses, 0, parseInt(limit) - 1);

    const jobList = await Promise.all(
      jobs.map(async (job) => {
        const state = await job.getState();
        return {
          id: job.id,
          name: job.name,
          status: state,
          progress: job.progress,
          data: job.data,
          opts: {
            priority: job.opts.priority,
            attempts: job.opts.attempts,
            delay: job.opts.delay,
          },
          attemptsMade: job.attemptsMade,
          failedReason: job.failedReason,
          returnvalue: job.returnvalue,
          processedOn: job.processedOn ? new Date(job.processedOn).toISOString() : null,
          finishedOn: job.finishedOn ? new Date(job.finishedOn).toISOString() : null,
          timestamp: new Date(job.timestamp).toISOString(),
        };
      })
    );

    res.json({ jobs: jobList, total: jobList.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/jobs/stats — Queue statistics ───────────────────────────────────
router.get("/stats", async (req, res) => {
  try {
    const [active, waiting, completed, failed, delayed, paused] = await Promise.all([
      jobQueue.getActiveCount(),
      jobQueue.getWaitingCount(),
      jobQueue.getCompletedCount(),
      jobQueue.getFailedCount(),
      jobQueue.getDelayedCount(),
      jobQueue.getPausedCount(),
    ]);

    res.json({ active, waiting, completed, failed, delayed, paused, total: active + waiting + completed + failed + delayed });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/jobs/:id — Get a single job ─────────────────────────────────────
router.get("/:id", async (req, res) => {
  try {
    const job = await jobQueue.getJob(req.params.id);
    if (!job) return res.status(404).json({ error: "Job not found" });

    const state = await job.getState();
    res.json({
      id: job.id,
      name: job.name,
      status: state,
      progress: job.progress,
      data: job.data,
      opts: job.opts,
      attemptsMade: job.attemptsMade,
      failedReason: job.failedReason,
      stacktrace: job.stacktrace,
      returnvalue: job.returnvalue,
      processedOn: job.processedOn ? new Date(job.processedOn).toISOString() : null,
      finishedOn: job.finishedOn ? new Date(job.finishedOn).toISOString() : null,
      timestamp: new Date(job.timestamp).toISOString(),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── POST /api/jobs/:id/retry — Retry a failed job ───────────────────────────
router.post("/:id/retry", async (req, res) => {
  try {
    const job = await jobQueue.getJob(req.params.id);
    if (!job) return res.status(404).json({ error: "Job not found" });

    await job.retry();
    res.json({ success: true, message: `Job #${req.params.id} queued for retry` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── DELETE /api/jobs/:id — Remove a job ─────────────────────────────────────
router.delete("/:id", async (req, res) => {
  try {
    const job = await jobQueue.getJob(req.params.id);
    if (!job) return res.status(404).json({ error: "Job not found" });

    await job.remove();
    res.json({ success: true, message: `Job #${req.params.id} removed` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── POST /api/jobs/queue/pause — Pause/resume queue ─────────────────────────
router.post("/queue/pause", async (req, res) => {
  await jobQueue.pause();
  res.json({ success: true, message: "Queue paused" });
});

router.post("/queue/resume", async (req, res) => {
  await jobQueue.resume();
  res.json({ success: true, message: "Queue resumed" });
});

module.exports = router;
