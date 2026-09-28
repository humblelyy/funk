import { useEffect, useState, FormEvent } from "react";
import { supabase } from "../lib/supabase";
import "./admin.css";

type Project = {
  id: number;
  title: string;
  media_url: string;
  media_type: string;
  width: number;
  height: number;
  created_at: string;
};

const emptyForm = {
  title: "",
  media_url: "",
  media_type: "website",
  width: 1920,
  height: 1080,
};

export default function Admin() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  useEffect(() => {
    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);

      if (newSession) {
        loadProjects();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function checkSession() {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    setSession(session);

    if (session) {
      await loadProjects();
    }

    setLoading(false);
  }

  async function login(e: FormEvent) {
    e.preventDefault();

    setLoginLoading(true);
    setLoginError("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setLoginError(error.message);
    }

    setLoginLoading(false);
  }

  async function logout() {
    await supabase.auth.signOut();

    setProjects([]);
    setForm(emptyForm);
    setEditingId(null);
  }

  async function loadProjects() {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setMessage(error.message);
      return;
    }

    setProjects((data || []) as Project[]);
  }

  function editProject(project: Project) {
    setEditingId(project.id);

    setForm({
      title: project.title || "",
      media_url: project.media_url || "",
      media_type: project.media_type || "website",
      width: project.width || 1920,
      height: project.height || 1080,
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
    setMessage("");
  }

  async function saveProject(e: FormEvent) {
    e.preventDefault();

    if (!form.title.trim()) {
      setMessage("Project title is required.");
      return;
    }

    if (!form.media_url.trim()) {
      setMessage("Media URL is required.");
      return;
    }

    setSaving(true);
    setMessage("");

    const payload = {
      title: form.title.trim(),
      media_url: form.media_url.trim(),
      media_type: form.media_type,
      width: Number(form.width),
      height: Number(form.height),
    };

    if (editingId !== null) {
      const { error } = await supabase
        .from("projects")
        .update(payload)
        .eq("id", editingId);

      if (error) {
        setMessage(error.message);
      } else {
        setMessage("Project updated successfully.");
        resetForm();
        await loadProjects();
      }
    } else {
      const { error } = await supabase
        .from("projects")
        .insert(payload);

      if (error) {
        setMessage(error.message);
      } else {
        setMessage("Project added successfully.");
        resetForm();
        await loadProjects();
      }
    }

    setSaving(false);
  }

  async function deleteProject(id: number) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this project?"
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("projects")
      .delete()
      .eq("id", id);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Project deleted.");
    await loadProjects();
  }

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="admin-spinner" />
        <span>Loading FUNK Admin...</span>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="admin-login-page">
        <div className="admin-login-glow" />

        <form className="admin-login-card" onSubmit={login}>
          <div className="admin-brand">
            <span className="admin-brand-dot" />
            FUNK
          </div>

          <div className="admin-login-label">PRIVATE AREA</div>

          <h1>Admin Login</h1>

          <p>
            Sign in to manage your FUNK portfolio projects.
          </p>

          {loginError && (
            <div className="admin-error">
              {loginError}
            </div>
          )}

          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </label>

          <button
            className="admin-primary-button"
            type="submit"
            disabled={loginLoading}
          >
            {loginLoading ? "SIGNING IN..." : "SIGN IN ↗"}
          </button>

          <a className="back-home" href="/">
            ← Back to portfolio
          </a>
        </form>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <header className="admin-header">
        <div>
          <div className="admin-brand">
            <span className="admin-brand-dot" />
            FUNK
          </div>

          <span className="admin-subtitle">
            PORTFOLIO ADMIN
          </span>
        </div>

        <div className="admin-header-actions">
          <a href="/" className="admin-view-button">
            VIEW SITE ↗
          </a>

          <button
            className="admin-logout-button"
            onClick={logout}
          >
            LOG OUT
          </button>
        </div>
      </header>

      <main className="admin-container">
        <section className="admin-intro">
          <div>
            <span className="admin-kicker">CONTROL CENTER</span>
            <h1>Manage Projects</h1>
            <p>
              Add, edit and remove projects from your public FUNK portfolio.
            </p>
          </div>

          <div className="project-count">
            <strong>{projects.length}</strong>
            <span>PROJECTS</span>
          </div>
        </section>

        <section className="admin-editor">
          <div className="editor-heading">
            <div>
              <span className="admin-kicker">
                {editingId ? "EDIT PROJECT" : "NEW PROJECT"}
              </span>

              <h2>
                {editingId ? "Update project" : "Add a project"}
              </h2>
            </div>

            {editingId && (
              <button
                className="cancel-button"
                onClick={resetForm}
                type="button"
              >
                CANCEL
              </button>
            )}
          </div>

          <form onSubmit={saveProject}>
            <div className="form-grid">
              <label>
                Project title
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      title: e.target.value,
                    })
                  }
                  placeholder="FUNK Portfolio"
                />
              </label>

              <label>
                Media type
                <select
                  value={form.media_type}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      media_type: e.target.value,
                    })
                  }
                >
                  <option value="website">Website</option>
                  <option value="image">Image</option>
                  <option value="video">Video</option>
                  <option value="design">Design</option>
                  <option value="vfx">VFX</option>
                  <option value="reel">Reel</option>
                </select>
              </label>

              <label className="full-field">
                Media URL
                <input
                  type="url"
                  value={form.media_url}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      media_url: e.target.value,
                    })
                  }
                  placeholder="https://..."
                />
              </label>

              <label>
                Width
                <input
                  type="number"
                  min="1"
                  value={form.width}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      width: Number(e.target.value),
                    })
                  }
                />
              </label>

              <label>
                Height
                <input
                  type="number"
                  min="1"
                  value={form.height}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      height: Number(e.target.value),
                    })
                  }
                />
              </label>
            </div>

            {message && (
              <div
                className={
                  message.toLowerCase().includes("success") ||
                  message === "Project deleted."
                    ? "admin-success"
                    : "admin-error"
                }
              >
                {message}
              </div>
            )}

            <button
              className="admin-primary-button save-button"
              type="submit"
              disabled={saving}
            >
              {saving
                ? "SAVING..."
                : editingId
                ? "UPDATE PROJECT ↗"
                : "ADD PROJECT ↗"}
            </button>
          </form>
        </section>

        <section className="admin-projects">
          <div className="projects-heading">
            <div>
              <span className="admin-kicker">DATABASE</span>
              <h2>Projects</h2>
            </div>

            <button
              className="refresh-button"
              onClick={loadProjects}
            >
              ↻ REFRESH
            </button>
          </div>

          {projects.length === 0 ? (
            <div className="empty-projects">
              <span>NO PROJECTS YET</span>
              <p>Add your first project above.</p>
            </div>
          ) : (
            <div className="admin-project-list">
              {projects.map((project) => (
                <article
                  className="admin-project-card"
                  key={project.id}
                >
                  <div className="project-preview">
                    {project.media_type === "image" ||
                    project.media_type === "design" ||
                    project.media_type === "vfx" ? (
                      <img
                        src={project.media_url}
                        alt={project.title}
                      />
                    ) : project.media_type === "video" ||
                      project.media_type === "reel" ? (
                      <video
                        src={project.media_url}
                        muted
                        playsInline
                      />
                    ) : (
                      <div className="website-preview">
                        <span>↗</span>
                        WEBSITE
                      </div>
                    )}
                  </div>

                  <div className="project-info">
                    <div className="project-meta">
                      <span>#{project.id}</span>
                      <span>
                        {project.media_type}
                      </span>
                    </div>

                    <h3>{project.title}</h3>

                    <div className="project-size">
                      {project.width} × {project.height}
                    </div>

                    <div className="project-actions">
                      <button
                        onClick={() => editProject(project)}
                      >
                        EDIT
                      </button>

                      <button
                        className="delete-action"
                        onClick={() =>
                          deleteProject(project.id)
                        }
                      >
                        DELETE
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}