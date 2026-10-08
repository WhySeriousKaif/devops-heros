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

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-mark">DR</div>
        <div>
          <strong>DevOps Revision</strong>
          <span>Exam command center</span>
        </div>
        <nav>
          <a className="active" href="#dashboard">Dashboard</a>
          <a href="#new-topic">Add topic</a>
          <a href="/docs" target="_blank">API docs</a>
        </nav>
        <div className="sidebar-note">
          <span className="online-dot" /> API monitoring enabled
        </div>
      </aside>

      <main>
        <header id="dashboard">
          <div>
            <p className="eyebrow">CAPSTONE PROJECT</p>
            <h1>Revision dashboard</h1>
            <p>Track difficult topics and move them towards completion.</p>
          </div>
          <div className="deadline-card">
            <span>Focus</span>
            <strong>Hard topics first</strong>
          </div>
        </header>

        {error && <div className="error-banner">{error}</div>}

        <section className="stats-grid" aria-label="Revision statistics">
          <StatCard label="Total topics" value={stats.total} tone="blue" />
          <StatCard label="Not started" value={stats.notStarted} tone="gray" />
          <StatCard label="In progress" value={stats.inProgress} tone="orange" />
          <StatCard label="Completed" value={stats.completed} tone="green" />
        </section>

        <section className="content-grid">
          <div className="panel topic-panel">
            <div className="panel-heading">
              <div>
                <h2>Revision topics</h2>
                <p>Click a status to move a topic to its next stage.</p>
              </div>
              <select value={filter} onChange={(event) => setFilter(event.target.value)}>
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
                    <div className={`priority priority-${topic.priority.toLowerCase()}`} />
                    <div className="topic-details">
                      <h3>{topic.title}</h3>
                      <p>{topic.notes || "No notes added"}</p>
                      <div className="topic-meta">
                        <span>{topic.category}</span>
                        <span className={`badge badge-${topic.priority.toLowerCase()}`}>
                          {topic.priority}
                        </span>
                      </div>
                    </div>
                    <div className="row-actions">
                      <button className={`status status-${topic.status.toLowerCase()}`} onClick={() => advanceStatus(topic)}>
                        {statusLabels[topic.status]}
                      </button>
                      <button className="delete-button" onClick={() => deleteTopic(topic.id)} aria-label={`Delete ${topic.title}`}>
                        Delete
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>

          <form className="panel create-panel" id="new-topic" onSubmit={createTopic}>
            <div>
              <p className="eyebrow">NEW REVISION ITEM</p>
              <h2>Add a topic</h2>
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
              {saving ? "Adding…" : "Add revision topic"}
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}


function StatCard({ label, value, tone }) {
  return (
    <article className={`stat-card tone-${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}


createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

