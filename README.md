# ⚡ Queue Monitor — Distributed Job Queue System

A production-grade distributed job queue built with **BullMQ + Redis + React**. Features real-time job tracking, priority queues, automatic retries with exponential backoff, delayed jobs, and a live monitoring dashboard.

![Queue Monitor Dashboard](https://img.shields.io/badge/Status-Live-34d399?style=flat-square)
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)
![BullMQ](https://img.shields.io/badge/BullMQ-5.x-ff4444?style=flat-square)
![Redis](https://img.shields.io/badge/Redis-Upstash-DC382D?style=flat-square&logo=redis)

---

## 🚀 Live Demo

- **Dashboard:** [your-app.vercel.app](https://your-app.vercel.app)
- **API:** [your-api.onrender.com](https://your-api.onrender.com/health)

---

## ✨ Features

- **Priority Queues** — critical, high, normal, low priority levels
- **Retry + Backoff** — failed jobs retry up to 3 times with exponential backoff (1s → 2s → 4s)
- **Delayed Jobs** — schedule jobs to run after a delay (5s, 30s, 1 min)
- **3 Concurrent Workers** — processes multiple jobs simultaneously
- **Live Dashboard** — real-time status updates via polling every 2 seconds
- **5 Job Types** — send-email, generate-report, resize-image, push-notification, export-data
- **Progress Tracking** — per-job progress bars
- **Queue Control** — pause and resume the entire queue

---

## 🏗️ Architecture

```
React Dashboard (Vercel)
        │
        │  REST API (polls every 2s)
        ▼
Express API Server (Render - Web Service)
  └── GET  /api/jobs/stats    → queue statistics
  └── POST /api/jobs          → add job
  └── GET  /api/jobs          → list jobs
  └── POST /api/jobs/:id/retry → retry failed job
        │
        ▼
BullMQ Queue ──── Redis (Upstash)
        │
        ▼
BullMQ Worker (Render - Background Worker)
   concurrency: 3
```

---

## 🛠️ Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Frontend  | React 18, Vite, Axios               |
| Backend   | Node.js, Express                    |
| Queue     | BullMQ 5.x                         |
| Cache/DB  | Redis (Upstash free tier)           |
| Fonts     | Outfit + JetBrains Mono (Google)    |
| Deploy    | Vercel (frontend), Render (backend) |

---

## 📁 Project Structure

```
bullmq-project/
├── server/
│   ├── package.json
│   └── src/
│       ├── app.js          → Express server entry point
│       ├── queue.js        → BullMQ queue + Redis connection
│       ├── worker.js       → Job processor (run as separate process)
│       └── routes/
│           └── jobs.js     → REST API routes
└── client/
    └── src/
        ├── App.jsx
        └── Dashboard.jsx   → Main dashboard UI
```

---

## ⚙️ Local Setup

### Prerequisites
- Node.js 18+
- A free [Upstash](https://upstash.com) Redis database

### 1. Clone the repo
```bash
git clone https://github.com/YOUR_USERNAME/bullmq-job-queue.git
cd bullmq-job-queue
```

### 2. Configure environment
Create `server/.env`:
```env
PORT=5000
REDIS_URL=rediss://default:YOUR_PASSWORD@YOUR_HOST.upstash.io:6379
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

### 3. Run the backend
```bash
# Terminal 1 — API Server
cd server
npm install
node src/app.js

# Terminal 2 — Worker
cd server
node src/worker.js
```

### 4. Run the frontend
```bash
# Terminal 3
cd client
npm install
echo "VITE_API_URL=http://localhost:5000" > .env.local
npm run dev
```

Open **http://localhost:5173**

---

## 🌐 API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Server health check |
| `POST` | `/api/jobs` | Add a new job |
| `GET` | `/api/jobs` | List jobs (filter by status) |
| `GET` | `/api/jobs/stats` | Queue statistics |
| `GET` | `/api/jobs/:id` | Get single job |
| `POST` | `/api/jobs/:id/retry` | Retry a failed job |
| `DELETE` | `/api/jobs/:id` | Remove a job |
| `POST` | `/api/jobs/queue/pause` | Pause the queue |
| `POST` | `/api/jobs/queue/resume` | Resume the queue |

### Example — Add a job
```bash
curl -X POST https://your-api.onrender.com/api/jobs \
  -H "Content-Type: application/json" \
  -d '{
    "type": "send-email",
    "priority": "high",
    "delay": 0,
    "data": {
      "to": "user@example.com",
      "subject": "Welcome!"
    }
  }'
```

---

## 🚢 Deployment

### Redis — Upstash (free)
1. [upstash.com](https://upstash.com) → Create Database → Redis
2. Copy the **TCP** connection URL (`rediss://...`)

### Backend — Render
1. New **Web Service** → connect GitHub repo
2. Root directory: `server`
3. Build: `npm install` | Start: `node src/app.js`
4. Add env vars: `REDIS_URL`, `CLIENT_URL`, `NODE_ENV=production`

### Worker — Render
1. New **Background Worker** → same repo
2. Root directory: `server`
3. Start: `node src/worker.js`
4. Same env vars as the Web Service

### Frontend — Vercel
1. New Project → import GitHub repo
2. Root directory: `client`
3. Add env var: `VITE_API_URL=https://your-api.onrender.com`

---

## 💡 Key Concepts (for interviews)

- **Why BullMQ over a simple setTimeout?** — Redis-backed persistence means jobs survive server restarts. Distributed workers can run on separate machines.
- **Concurrency vs parallelism** — `concurrency: 3` means one worker handles 3 jobs using async/await, not threads.
- **Stalled job detection** — Workers send heartbeats to Redis. If a worker crashes mid-job, BullMQ automatically re-queues it.
- **Priority implementation** — BullMQ uses Redis sorted sets with score = priority value. Lower score = dequeued first.
- **Delayed jobs** — Stored in a separate sorted set with score = `Date.now() + delay`. A scheduler loop promotes them to the waiting set at the right time.

---

## 👤 Author

**Abhishek** — [github.com/abhishekgdangi](https://github.com/abhishekgdangi)

---

## 📄 License

MIT
