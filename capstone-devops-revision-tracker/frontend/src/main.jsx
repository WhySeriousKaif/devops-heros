import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";


const emptyForm = {
  title: "",
  category: "Kubernetes",
  priority: "MEDIUM",
  notes: "",
};

const statusLabels = {
  NOT_STARTED: "Not started",
  IN_PROGRESS: "In progress",
  COMPLETED: "Completed",
};

const nextStatus = {
  NOT_STARTED: "IN_PROGRESS",
  IN_PROGRESS: "COMPLETED",
  COMPLETED: "NOT_STARTED",
};


function App() {
  const [topics, setTopics] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [filter, setFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function loadTopics() {
    try {
      setError("");
      const response = await fetch("/api/topics");
      if (!response.ok) throw new Error("Backend returned an error");
      setTopics(await response.json());
    } catch (requestError) {
      setError(`Unable to load topics: ${requestError.message}`);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTopics();
  }, []);

  async function createTopic(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const response = await fetch("/api/topics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!response.ok) throw new Error("Topic could not be created");
      setForm(emptyForm);
      await loadTopics();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  async function advanceStatus(topic) {
    const response = await fetch(`/api/topics/${topic.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus[topic.status] }),
    });
    if (response.ok) await loadTopics();
  }

  async function deleteTopic(id) {
    const response = await fetch(`/api/topics/${id}`, { method: "DELETE" });
    if (response.ok) await loadTopics();
  }

  const stats = useMemo(
    () => ({
      total: topics.length,
      notStarted: topics.filter((topic) => topic.status === "NOT_STARTED").length,
      inProgress: topics.filter((topic) => topic.status === "IN_PROGRESS").length,
      completed: topics.filter((topic) => topic.status === "COMPLETED").length,
    }),
    [topics],
  );

  const visibleTopics =
    filter === "ALL" ? topics : topics.filter((topic) => topic.status === filter);

  const completionRate = stats.total
    ? Math.round((stats.completed / stats.total) * 100)
    : 0;

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark" aria-hidden="true">
            <span />
            <span />
          </div>
          <div>
            <strong>RevisionOS</strong>
            <span>DevOps learning lab</span>
          </div>
        </div>

        <nav aria-label="Primary navigation">
          <p className="nav-label">Workspace</p>
          <a className="active" href="#dashboard"><span>01</span>Overview</a>
          <a href="#topics"><span>02</span>Revision queue</a>
          <a href="#new-topic"><span>03</span>Add topic</a>
          <a href="/docs" target="_blank" rel="noreferrer"><span>04</span>API explorer</a>
        </nav>

        <div className="environment-card">
          <div className="environment-heading">
            <span className="online-dot" />
            <strong>System healthy</strong>
          </div>
          <p>API and PostgreSQL are responding normally.</p>
          <a href="/health" target="_blank" rel="noreferrer">View health endpoint <span>↗</span></a>
        </div>

        <div className="sidebar-footer">
          <div className="avatar">MK</div>
          <div>
            <strong>MD Kaif</strong>
            <span>Capstone workspace</span>
          </div>
        </div>
      </aside>

      <main className="workspace">
        <div className="topbar">
          <p><span>Workspace</span> / Revision tracker</p>
          <a className="outline-button" href="/docs" target="_blank" rel="noreferrer">Open API docs <span>↗</span></a>
        </div>

        <header className="hero" id="dashboard">
          <div>
            <p className="eyebrow">DEVOPS REVISION TRACKER</p>
            <h1>Make the hard topics<br />feel manageable.</h1>
            <p className="hero-copy">A focused workspace for revising commands, tracking difficult concepts, and preparing confidently for the exam.</p>
          </div>
          <div className="progress-card">
            <div className="progress-ring" style={{ "--progress": `${completionRate * 3.6}deg` }}>
              <div><strong>{completionRate}%</strong><span>complete</span></div>
            </div>
            <div>
              <span>Current focus</span>
              <strong>Hard topics first</strong>
              <p>{stats.completed} of {stats.total} topics completed</p>
            </div>
          </div>
        </header>

        {error && <div className="error-banner">{error}</div>}

        <section className="stats-grid" aria-label="Revision statistics">
          <StatCard index="01" label="Total topics" value={stats.total} tone="ink" />
          <StatCard index="02" label="Not started" value={stats.notStarted} tone="slate" />
          <StatCard index="03" label="In progress" value={stats.inProgress} tone="amber" />
          <StatCard index="04" label="Completed" value={stats.completed} tone="mint" />
        </section>

        <section className="content-grid">
          <div className="panel topic-panel" id="topics">
            <div className="panel-heading">
              <div>
                <p className="section-number">01 / REVISION QUEUE</p>
                <h2>Topics to master</h2>
                <p>Move each topic forward as your confidence grows.</p>
              </div>
              <select aria-label="Filter topics by status" value={filter} onChange={(event) => setFilter(event.target.value)}>
                <option value="ALL">All statuses</option>
                <option value="NOT_STARTED">Not started</option>
                <option value="IN_PROGRESS">In progress</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>

            {loading ? (
              <div className="empty-state">Loading topics…</div>
            ) : visibleTopics.length === 0 ? (
              <div className="empty-state">No topics here yet. Add your first one.</div>
            ) : (
              <div className="topic-list">
                {visibleTopics.map((topic) => (
                  <article className="topic-row" key={topic.id}>
                    <div className="topic-icon" aria-hidden="true">{topic.category.slice(0, 2).toUpperCase()}</div>
                    <div className="topic-details">
                      <div className="topic-title-line">
                        <h3>{topic.title}</h3>
                        <span className={`badge badge-${topic.priority.toLowerCase()}`}>
                          {topic.priority} PRIORITY
                        </span>
                      </div>
                      <p>{topic.notes || "No notes added"}</p>
                      <div className="topic-meta">
                        <span className="category-label">{topic.category}</span>
                        <span>Topic #{String(topic.id).padStart(2, "0")}</span>
                      </div>
                    </div>
                    <div className="row-actions">
                      <button className={`status status-${topic.status.toLowerCase()}`} onClick={() => advanceStatus(topic)}>
                        <span className="status-dot" />{statusLabels[topic.status]}
                      </button>
                      <button className="delete-button" onClick={() => deleteTopic(topic.id)} aria-label={`Delete ${topic.title}`}>
                        Remove
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>

          <form className="panel create-panel" id="new-topic" onSubmit={createTopic}>
            <div className="create-heading">
              <p className="section-number">02 / QUICK CAPTURE</p>
              <h2>Add a revision topic</h2>
              <p>Capture a concept while it is fresh. You can refine it later.</p>
            </div>
            <label>
              Topic title
              <input required maxLength="200" placeholder="e.g. CrashLoopBackOff" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} />
            </label>
            <label>
              Category
              <select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}>
                <option>Kubernetes</option>
                <option>Docker</option>
                <option>CI/CD</option>
                <option>Terraform</option>
                <option>Monitoring</option>
                <option>Linux</option>
              </select>
            </label>
            <label>
              Priority
              <select value={form.priority} onChange={(event) => setForm({ ...form, priority: event.target.value })}>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </label>
            <label>
              Notes
              <textarea rows="4" placeholder="Commands or concepts to practise" value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} />
            </label>
            <button className="primary-button" disabled={saving}>
              {saving ? "Adding…" : "Add to revision queue"}<span>→</span>
            </button>
          </form>
        </section>

        <footer className="page-footer">
          <span>RevisionOS / DevOps Capstone</span>
          <span>FastAPI · React · PostgreSQL · Kubernetes</span>
        </footer>
      </main>
    </div>
  );
}


function StatCard({ index, label, value, tone }) {
  return (
    <article className={`stat-card tone-${tone}`}>
      <div><span>{index}</span><span>{label}</span></div>
      <strong>{String(value).padStart(2, "0")}</strong>
    </article>
  );
}


createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
