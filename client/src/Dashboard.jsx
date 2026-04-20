import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body { background: #08080a; }

  .qm {
    --bg: #08080a;
    --card: #101012;
    --card2: #161618;
    --border: #1e1e22;
    --border2: #2e2e34;
    --t1: #f4f4f5;
    --t2: #a1a1aa;
    --t3: #52525b;
    --blue: #60a5fa;
    --blue-bg: rgba(96,165,250,0.1);
    --green: #34d399;
    --green-bg: rgba(52,211,153,0.1);
    --amber: #fbbf24;
    --amber-bg: rgba(251,191,36,0.1);
    --red: #f87171;
    --red-bg: rgba(248,113,113,0.1);
    --purple: #a78bfa;
    --purple-bg: rgba(167,139,250,0.1);
    --zinc-bg: rgba(113,113,122,0.08);
    font-family: 'Outfit', sans-serif;
    background: var(--bg);
    color: var(--t1);
    min-height: 100vh;
    padding: 32px 28px;
    max-width: 1100px;
    margin: 0 auto;
    font-size: 14px;
  }

  /* HEADER */
  .qm-hdr { display:flex; align-items:center; justify-content:space-between; margin-bottom:32px; }
  .qm-brand { display:flex; align-items:center; gap:12px; }
  .qm-icon { width:36px; height:36px; background:var(--blue); border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:18px; flex-shrink:0; }
  .qm-brand-text h1 { font-size:18px; font-weight:700; letter-spacing:-0.4px; }
  .qm-brand-text p { font-size:12px; color:var(--t3); margin-top:1px; font-family:'JetBrains Mono',monospace; }
  .qm-hdr-right { display:flex; align-items:center; gap:12px; }
  .qm-live { display:flex; align-items:center; gap:6px; font-size:12px; color:var(--t3); font-family:'JetBrains Mono',monospace; }
  .qm-pulse { width:7px; height:7px; border-radius:50%; background:var(--green); animation:glow 2s ease-in-out infinite; }
  @keyframes glow { 0%,100%{box-shadow:0 0 0 0 rgba(52,211,153,0.5)} 50%{box-shadow:0 0 0 5px rgba(52,211,153,0)} }

  /* STATS */
  .qm-stats { display:grid; grid-template-columns:repeat(5,1fr); gap:10px; margin-bottom:20px; }
  .qm-stat { background:var(--card); border:1px solid var(--border); border-radius:14px; padding:18px 20px; cursor:default; transition:border-color 0.2s,transform 0.15s; }
  .qm-stat:hover { border-color:var(--border2); transform:translateY(-1px); }
  .qm-stat-lbl { font-size:10px; font-weight:600; text-transform:uppercase; letter-spacing:0.08em; color:var(--t3); margin-bottom:10px; }
  .qm-stat-val { font-size:30px; font-weight:700; font-family:'JetBrains Mono',monospace; letter-spacing:-1.5px; line-height:1; }

  /* WORKERS */
  .qm-workers { display:grid; grid-template-columns:repeat(3,1fr); gap:10px; margin-bottom:20px; }
  .qm-worker { background:var(--card); border:1px solid var(--border); border-radius:12px; padding:12px 16px; display:flex; align-items:center; gap:10px; }
  .qm-w-dot { width:8px; height:8px; border-radius:50%; flex-shrink:0; transition:background 0.4s; }
  .qm-w-info { min-width:0; }
  .qm-w-name { font-size:12px; font-weight:600; color:var(--t2); }
  .qm-w-job { font-size:11px; color:var(--t3); font-family:'JetBrains Mono',monospace; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; margin-top:2px; }

  /* ADD JOB FORM */
  .qm-form { background:var(--card); border:1px solid var(--border); border-radius:14px; padding:20px 22px; margin-bottom:20px; }
  .qm-form-lbl { font-size:10px; font-weight:600; text-transform:uppercase; letter-spacing:0.08em; color:var(--t3); margin-bottom:14px; }
  .qm-row { display:flex; gap:10px; align-items:flex-end; flex-wrap:wrap; }
  .qm-field { display:flex; flex-direction:column; gap:5px; }
  .qm-fl { font-size:10px; font-weight:600; text-transform:uppercase; letter-spacing:0.06em; color:var(--t3); }
  .qm-sel {
    background:var(--card2); border:1px solid var(--border); border-radius:9px;
    color:var(--t1); padding:9px 12px; font-size:13px; font-family:'Outfit',sans-serif;
    outline:none; cursor:pointer; transition:border-color 0.15s; appearance:none;
    background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' fill='none'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%2352525b' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
    background-repeat:no-repeat; background-position:right 10px center; padding-right:28px;
  }
  .qm-sel:hover,.qm-sel:focus { border-color:var(--border2); }

  /* BUTTONS */
  .qm-btn { padding:9px 18px; border-radius:9px; font-size:13px; font-weight:600; cursor:pointer; transition:all 0.15s; font-family:'Outfit',sans-serif; border:1px solid var(--border2); background:var(--card2); color:var(--t1); }
  .qm-btn:hover { background:var(--border2); }
  .qm-btn-blue { background:var(--blue); border-color:var(--blue); color:#000; font-weight:700; }
  .qm-btn-blue:hover { background:#93c5fd; border-color:#93c5fd; }
  .qm-btn-blue:disabled { opacity:0.4; cursor:not-allowed; }
  .qm-btn-xs { padding:4px 10px; font-size:11px; border-radius:6px; font-weight:500; }
  .qm-btn-del { color:var(--red); background:transparent; border-color:transparent; }
  .qm-btn-del:hover { background:var(--red-bg); border-color:var(--red); }
  .qm-btn-pause { color:var(--t2); }

  /* FEED */
  .qm-feed { background:var(--card); border:1px solid var(--border); border-radius:14px; overflow:hidden; }
  .qm-feed-hdr { padding:14px 20px; border-bottom:1px solid var(--border); display:flex; align-items:center; justify-content:space-between; gap:12px; flex-wrap:wrap; }
  .qm-feed-title { font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.08em; color:var(--t3); }
  .qm-tabs { display:flex; gap:2px; background:var(--card2); border-radius:8px; padding:3px; }
  .qm-tab { padding:4px 12px; border-radius:6px; font-size:11px; font-weight:600; cursor:pointer; border:none; background:transparent; color:var(--t3); transition:all 0.15s; font-family:'Outfit',sans-serif; }
  .qm-tab:hover { color:var(--t2); }
  .qm-tab.on { background:var(--card); color:var(--t1); box-shadow:0 1px 3px rgba(0,0,0,0.4); }

  /* JOB ROW */
  .qm-job { padding:13px 20px; border-bottom:1px solid var(--border); display:grid; grid-template-columns:88px 1fr auto auto auto; gap:14px; align-items:center; transition:background 0.15s; animation:fadeRow 0.25s ease; }
  @keyframes fadeRow { from{opacity:0;transform:translateY(-3px)} to{opacity:1;transform:translateY(0)} }
  .qm-job:hover { background:rgba(255,255,255,0.018); }
  .qm-job:last-child { border-bottom:none; }
  .qm-jid { font-family:'JetBrains Mono',monospace; font-size:10px; color:var(--t3); }
  .qm-jname { font-size:13px; font-weight:600; letter-spacing:-0.1px; }
  .qm-jmeta { display:flex; align-items:center; gap:8px; margin-top:4px; }
  .qm-retry { font-size:10px; color:var(--amber); font-weight:600; }
  .qm-jerr { font-size:10px; color:var(--red); font-family:'JetBrains Mono',monospace; margin-top:4px; }
  .qm-prog { height:2px; background:var(--border); border-radius:2px; margin-top:7px; overflow:hidden; }
  .qm-prog-bar { height:100%; border-radius:2px; background:var(--blue); transition:width 0.5s ease; }
  .qm-ago { font-size:10px; color:var(--t3); font-family:'JetBrains Mono',monospace; white-space:nowrap; }
  .qm-acts { display:flex; gap:4px; }

  /* BADGES */
  .qm-badge { padding:3px 10px; border-radius:20px; font-size:10px; font-weight:700; white-space:nowrap; letter-spacing:0.03em; }
  .s-active    { background:var(--blue-bg);   color:var(--blue);   }
  .s-waiting   { background:var(--amber-bg);  color:var(--amber);  }
  .s-completed { background:var(--green-bg);  color:var(--green);  }
  .s-failed    { background:var(--red-bg);    color:var(--red);    }
  .s-delayed   { background:var(--zinc-bg);   color:var(--t3);     }

  /* PRIORITY */
  .p-critical { font-size:10px; font-weight:700; color:var(--red); }
  .p-high     { font-size:10px; font-weight:600; color:var(--amber); }
  .p-normal   { font-size:10px; color:var(--t3); }
  .p-low      { font-size:10px; color:var(--t3); opacity:0.5; }

  .qm-empty { padding:60px 20px; text-align:center; }
  .qm-empty-icon { font-size:32px; margin-bottom:12px; opacity:0.3; }
  .qm-empty-text { font-size:13px; color:var(--t3); }

  @media(max-width:700px){
    .qm{padding:16px 14px;}
    .qm-stats{grid-template-columns:repeat(3,1fr);}
    .qm-workers{grid-template-columns:1fr 1fr;}
    .qm-job{grid-template-columns:1fr auto;}
    .qm-jid,.qm-ago{display:none;}
  }
`;

const TYPES = ["send-email","generate-report","resize-image","push-notification","export-data"];
const PAYLOADS = {
  "send-email":        { to:"user@example.com", subject:"Hello", body:"..." },
  "generate-report":   { reportType:"monthly", userId: Math.floor(Math.random()*1000) },
  "resize-image":      { imageUrl:"/uploads/photo.jpg", width:800, height:600 },
  "push-notification": { userId: Math.floor(Math.random()*1000), message:"New update" },
  "export-data":       { format:"csv", filters:{ from:"2024-01-01" } },
};
const STATUS_LABEL = { active:"active", waiting:"waiting", completed:"done", failed:"failed", delayed:"delayed" };

function Badge({ status }) {
  return <span className={`qm-badge s-${status}`}>{STATUS_LABEL[status] || status}</span>;
}

function JobRow({ job, onRetry, onDelete }) {
  const ago = Math.round((Date.now() - new Date(job.timestamp).getTime()) / 1000);
  return (
    <div className="qm-job">
      <span className="qm-jid">#{job.id?.slice(-8)}</span>
      <div>
        <div className="qm-jname">{job.name}</div>
        <div className="qm-jmeta">
          <span className={`p-${job.priorityLabel || "normal"}`}>{job.priorityLabel || "normal"}</span>
          {job.attemptsMade > 0 && <span className="qm-retry">↺ retry {job.attemptsMade}</span>}
        </div>
        {job.failedReason && <div className="qm-jerr">{job.failedReason.slice(0, 60)}</div>}
        {job.status === "active" && (
          <div className="qm-prog"><div className="qm-prog-bar" style={{ width: `${job.progress}%` }} /></div>
        )}
      </div>
      <Badge status={job.status} />
      <span className="qm-ago">{ago}s</span>
      <div className="qm-acts">
        {job.status === "failed" && (
          <button className="qm-btn qm-btn-xs" onClick={() => onRetry(job.id)}>retry</button>
        )}
        <button className="qm-btn qm-btn-xs qm-btn-del" onClick={() => onDelete(job.id)}>✕</button>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [stats,   setStats]   = useState({});
  const [jobs,    setJobs]    = useState([]);
  const [filter,  setFilter]  = useState("all");
  const [paused,  setPaused]  = useState(false);
  const [ts,      setTs]      = useState("");
  const [form,    setForm]    = useState({ type:"send-email", priority:"normal", delay:0 });
  const [adding,  setAdding]  = useState(false);

  // Fake workers state derived from active jobs
  const workers = [
    { id:"w1", label:"Worker 1" },
    { id:"w2", label:"Worker 2" },
    { id:"w3", label:"Worker 3" },
  ].map((w, i) => {
    const active = jobs.filter(j => j.status === "active");
    const assigned = active[i];
    return { ...w, busy: !!assigned, job: assigned?.name };
  });

  const fetchData = useCallback(async () => {
    try {
      const [sr, jr] = await Promise.all([
        axios.get(`${API}/api/jobs/stats`),
        axios.get(`${API}/api/jobs?status=${filter}&limit=30`),
      ]);
      setStats(sr.data);
      setJobs(jr.data.jobs || []);
      setTs(new Date().toLocaleTimeString());
    } catch { /* silent */ }
  }, [filter]);

  useEffect(() => {
    fetchData();
    const id = setInterval(fetchData, 2000);
    return () => clearInterval(id);
  }, [fetchData]);

  const addJob = async () => {
    setAdding(true);
    try {
      const res = await axios.post(`${API}/api/jobs`, {
        type: form.type, priority: form.priority,
        delay: form.delay, data: PAYLOADS[form.type],
      });
      toast.success(`Job #${res.data.job.id} queued`, { style: { background:"#101012", color:"#f4f4f5", border:"1px solid #2e2e34" } });
      fetchData();
    } catch (e) {
      toast.error(e.response?.data?.error || "Failed", { style:{ background:"#101012", color:"#f87171", border:"1px solid #2e2e34" } });
    } finally { setAdding(false); }
  };

  const retryJob = async (id) => {
    try { await axios.post(`${API}/api/jobs/${id}/retry`); toast.success("Retrying..."); fetchData(); }
    catch { toast.error("Retry failed"); }
  };

  const deleteJob = async (id) => {
    try { await axios.delete(`${API}/api/jobs/${id}`); setJobs(j => j.filter(x => x.id !== id)); }
    catch { toast.error("Delete failed"); }
  };

  const togglePause = async () => {
    try {
      await axios.post(`${API}/api/jobs/queue/${paused ? "resume" : "pause"}`);
      setPaused(p => !p);
      toast.success(paused ? "Queue resumed" : "Queue paused");
    } catch { toast.error("Failed"); }
  };

  const STAT_COLORS = { active:"#60a5fa", waiting:"#fbbf24", completed:"#34d399", failed:"#f87171", delayed:"#52525b" };

  return (
    <>
      <style>{CSS}</style>
      <Toaster position="bottom-right" />
      <div className="qm">

        {/* Header */}
        <div className="qm-hdr">
          <div className="qm-brand">
            <div className="qm-icon">⚡</div>
            <div className="qm-brand-text">
              <h1>Queue Monitor</h1>
              <p>bullmq · redis · 3 workers</p>
            </div>
          </div>
          <div className="qm-hdr-right">
            <div className="qm-live">
              <div className="qm-pulse" />
              {ts}
            </div>
            <button className="qm-btn qm-btn-pause" onClick={togglePause}>
              {paused ? "▶ Resume" : "⏸ Pause"}
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="qm-stats">
          {["active","waiting","completed","failed","delayed"].map(k => (
            <div className="qm-stat" key={k}>
              <div className="qm-stat-lbl">{k}</div>
              <div className="qm-stat-val" style={{ color: STAT_COLORS[k] }}>{stats[k] ?? 0}</div>
            </div>
          ))}
        </div>

        {/* Workers */}
        <div className="qm-workers">
          {workers.map(w => (
            <div className="qm-worker" key={w.id}>
              <div className="qm-w-dot" style={{ background: w.busy ? "#fbbf24" : "#34d399", boxShadow: w.busy ? "0 0 6px rgba(251,191,36,0.5)" : "0 0 6px rgba(52,211,153,0.4)" }} />
              <div className="qm-w-info">
                <div className="qm-w-name">{w.label}</div>
                <div className="qm-w-job">{w.busy ? w.job : "idle"}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Add Job */}
        <div className="qm-form">
          <div className="qm-form-lbl">Add Job</div>
          <div className="qm-row">
            <div className="qm-field" style={{ flex:2, minWidth:150 }}>
              <label className="qm-fl">Type</label>
              <select className="qm-sel" value={form.type} onChange={e => setForm(f => ({...f, type:e.target.value}))}>
                {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="qm-field" style={{ minWidth:120 }}>
              <label className="qm-fl">Priority</label>
              <select className="qm-sel" value={form.priority} onChange={e => setForm(f => ({...f, priority:e.target.value}))}>
                {["critical","high","normal","low"].map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div className="qm-field" style={{ minWidth:110 }}>
              <label className="qm-fl">Delay</label>
              <select className="qm-sel" value={form.delay} onChange={e => setForm(f => ({...f, delay:+e.target.value}))}>
                <option value={0}>none</option>
                <option value={5000}>5 s</option>
                <option value={30000}>30 s</option>
                <option value={60000}>1 min</option>
              </select>
            </div>
            <button className="qm-btn qm-btn-blue" onClick={addJob} disabled={adding} style={{ alignSelf:"flex-end" }}>
              {adding ? "Adding..." : "+ Add to queue"}
            </button>
          </div>
        </div>

        {/* Job Feed */}
        <div className="qm-feed">
          <div className="qm-feed-hdr">
            <span className="qm-feed-title">Job Feed — {jobs.length} jobs</span>
            <div className="qm-tabs">
              {["all","active","waiting","completed","failed","delayed"].map(s => (
                <button key={s} className={`qm-tab ${filter===s?"on":""}`} onClick={() => setFilter(s)}>{s}</button>
              ))}
            </div>
          </div>
          {jobs.length === 0 ? (
            <div className="qm-empty">
              <div className="qm-empty-icon">◻</div>
              <div className="qm-empty-text">No jobs — add one above and start the worker</div>
            </div>
          ) : (
            jobs.map(j => <JobRow key={j.id} job={j} onRetry={retryJob} onDelete={deleteJob} />)
          )}
        </div>

      </div>
    </>
  );
}
