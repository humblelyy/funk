import {
  useEffect,
  useRef,
  useState,
  type DragEvent,
  type FormEvent,
} from "react";

import { supabase } from "../lib/supabase";
import "./admin.css";

type MediaType = "image" | "video" | "website";

type Project = {
  id: number;
  title: string | null;
  media_url: string | null;
  media_type: string | null;
  destination_url: string | null;
  width: number | null;
  height: number | null;
  created_at: string;
};

type ProjectForm = {
  title: string;
  media_url: string;
  media_type: MediaType;
  destination_url: string;
  width: number | null;
  height: number | null;
};

const STORAGE_BUCKET = "project-media";

const EMPTY_FORM: ProjectForm = {
  title: "",
  media_url: "",
  media_type: "image",
  destination_url: "https://www.instagram.com/funk.vfx/",
  width: null,
  height: null,
};

export default function Admin() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [projects, setProjects] = useState<Project[]>([]);

  const [editingId, setEditingId] = useState<number | null>(null);

  const [form, setForm] =
    useState<ProjectForm>(EMPTY_FORM);

  const [saving, setSaving] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [loginLoading, setLoginLoading] =
    useState(false);

  const [loginError, setLoginError] =
    useState("");

  const [dragActive, setDragActive] =
    useState(false);

  const [uploading, setUploading] =
    useState(false);

  const [selectedFile, setSelectedFile] =
    useState<File | null>(null);

  const fileInputRef =
    useRef<HTMLInputElement>(null);

  useEffect(() => {
    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession);

        if (newSession) {
          loadProjects();
        } else {
          setProjects([]);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
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

  async function login(event: FormEvent) {
    event.preventDefault();

    setLoginLoading(true);
    setLoginError("");

    const { error } =
      await supabase.auth.signInWithPassword({
        email: email.trim(),
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
    setEditingId(null);
    setForm(EMPTY_FORM);
    setSelectedFile(null);
  }

  async function loadProjects() {
    const {
      data,
      error,
    } = await supabase
      .from("projects")
      .select(
        "id,title,media_url,media_type,destination_url,width,height,created_at"
      )
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      setMessage(
        `Database error: ${error.message}`
      );
      return;
    }

    setProjects(
      (data || []) as Project[]
    );
  }

  function resetForm() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setSelectedFile(null);
    setMessage("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function editProject(project: Project) {
    setEditingId(project.id);

    setForm({
      title: project.title || "",
      media_url: project.media_url || "",
      media_type:
        (project.media_type as MediaType) ||
        "image",
      destination_url:
        project.destination_url || "",
      width: project.width || null,
      height: project.height || null,
    });

    setSelectedFile(null);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function detectMediaType(
    file: File
  ): MediaType {
    if (file.type.startsWith("video/")) {
      return "video";
    }

    return "image";
  }

  function detectDimensions(
    file: File
  ): Promise<{
    width: number;
    height: number;
  }> {
    return new Promise(
      (resolve, reject) => {
        const objectUrl =
          URL.createObjectURL(file);

        if (file.type.startsWith("image/")) {
          const image =
            new Image();

          image.onload = () => {
            URL.revokeObjectURL(
              objectUrl
            );

            resolve({
              width:
                image.naturalWidth,
              height:
                image.naturalHeight,
            });
          };

          image.onerror = () => {
            URL.revokeObjectURL(
              objectUrl
            );

            reject(
              new Error(
                "Unable to read image dimensions."
              )
            );
          };

          image.src = objectUrl;
          return;
        }

        if (file.type.startsWith("video/")) {
          const video =
            document.createElement(
              "video"
            );

          video.preload = "metadata";

          video.onloadedmetadata =
            () => {
              URL.revokeObjectURL(
                objectUrl
              );

              resolve({
                width:
                  video.videoWidth,
                height:
                  video.videoHeight,
              });
            };

          video.onerror = () => {
            URL.revokeObjectURL(
              objectUrl
            );

            reject(
              new Error(
                "Unable to read video dimensions."
              )
            );
          };

          video.src = objectUrl;
          return;
        }

        URL.revokeObjectURL(
          objectUrl
        );

        reject(
          new Error(
            "Unsupported media type."
          )
        );
      }
    );
  }

  async function handleFile(
    file: File
  ) {
    setMessage("");

    if (
      !file.type.startsWith("image/") &&
      !file.type.startsWith("video/")
    ) {
      setMessage(
        "Please drop an image or video file."
      );
      return;
    }

    const maxSize =
      100 * 1024 * 1024;

    if (file.size > maxSize) {
      setMessage(
        "File is too large. Maximum size is 100 MB."
      );
      return;
    }

    setSelectedFile(file);

    try {
      const mediaType =
        detectMediaType(file);

      const dimensions =
        await detectDimensions(file);

      setForm((current) => ({
        ...current,
        media_type: mediaType,
        width: dimensions.width,
        height: dimensions.height,
      }));

      setMessage(
        `Detected ${dimensions.width} × ${dimensions.height} — ${mediaType}.`
      );
    } catch (error) {
      console.error(error);

      setSelectedFile(null);

      setMessage(
        error instanceof Error
          ? error.message
          : "Could not read the file."
      );
    }
  }

  function handleDragOver(
    event: DragEvent<HTMLDivElement>
  ) {
    event.preventDefault();
    event.stopPropagation();

    setDragActive(true);
  }

  function handleDragLeave(
    event: DragEvent<HTMLDivElement>
  ) {
    event.preventDefault();
    event.stopPropagation();

    setDragActive(false);
  }

  function handleDrop(
    event: DragEvent<HTMLDivElement>
  ) {
    event.preventDefault();
    event.stopPropagation();

    setDragActive(false);

    const file =
      event.dataTransfer.files?.[0];

    if (file) {
      handleFile(file);
    }
  }

  function handleFileInput(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file =
      event.target.files?.[0];

    if (file) {
      handleFile(file);
    }
  }

  async function uploadFile(
    file: File
  ): Promise<string> {
    if (!session?.user?.id) {
      throw new Error(
        "You must be logged in before uploading."
      );
    }

    setUploading(true);

    try {
      const extension =
        file.name.includes(".")
          ? file.name
              .split(".")
              .pop()
              ?.toLowerCase()
          : "bin";

      const safeName =
        file.name
          .replace(
            /[^a-zA-Z0-9._-]/g,
            "-"
          )
          .replace(
            /-+/g,
            "-"
          );

      const filePath =
        `${session.user.id}/${Date.now()}-${safeName || `media.${extension}`}`;

      const {
        error,
      } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(
          filePath,
          file,
          {
            cacheControl: "3600",
            upsert: false,
            contentType: file.type,
          }
        );

      if (error) {
        throw new Error(
          `Storage upload failed: ${error.message}`
        );
      }

      const {
        data,
      } = supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(filePath);

      if (!data.publicUrl) {
        throw new Error(
          "Supabase uploaded the file but did not return a public URL."
        );
      }

      return data.publicUrl;
    } finally {
      setUploading(false);
    }
  }

  async function detectUrlDimensions(
    url: string,
    mediaType: MediaType
  ) {
    if (!url) return;

    if (mediaType === "website") {
      setForm((current) => ({
        ...current,
        width:
          current.width || 1920,
        height:
          current.height || 1080,
      }));

      return;
    }

    try {
      if (mediaType === "image") {
        const image =
          new Image();

        image.onload = () => {
          setForm((current) => ({
            ...current,
            width:
              image.naturalWidth,
            height:
              image.naturalHeight,
          }));

          setMessage(
            `Automatic ratio detected: ${image.naturalWidth} × ${image.naturalHeight}`
          );
        };

        image.onerror = () => {
          setMessage(
            "URL saved, but automatic image dimensions could not be detected."
          );
        };

        image.src = url;
      }

      if (mediaType === "video") {
        const video =
          document.createElement(
            "video"
          );

        video.preload = "metadata";

        video.onloadedmetadata =
          () => {
            setForm((current) => ({
              ...current,
              width:
                video.videoWidth,
              height:
                video.videoHeight,
            }));

            setMessage(
              `Automatic ratio detected: ${video.videoWidth} × ${video.videoHeight}`
            );
          };

        video.onerror = () => {
          setMessage(
            "URL saved, but automatic video dimensions could not be detected."
          );
        };

        video.src = url;
      }
    } catch {
      // URL dimensions are optional.
    }
  }

  async function saveProject(
    event: FormEvent
  ) {
    event.preventDefault();

    if (!form.title.trim()) {
      setMessage(
        "Project title is required."
      );
      return;
    }

    if (
      form.media_type !==
        "website" &&
      !form.media_url.trim() &&
      !selectedFile
    ) {
      setMessage(
        "Drop a media file or enter a media URL."
      );
      return;
    }

    if (
      form.media_type === "website" &&
      !form.media_url.trim()
    ) {
      setMessage(
        "Website URL is required."
      );
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      let mediaUrl =
        form.media_url.trim();

      let width = form.width;
      let height = form.height;
      let mediaType =
        form.media_type;

      // Upload newly selected file.
      if (selectedFile) {
        mediaUrl =
          await uploadFile(
            selectedFile
          );

        mediaType =
          detectMediaType(
            selectedFile
          );

        const dimensions =
          await detectDimensions(
            selectedFile
          );

        width =
          dimensions.width;

        height =
          dimensions.height;
      }

      if (
        !width ||
        !height
      ) {
        width = 1920;
        height = 1080;
      }

      const payload = {
        title:
          form.title.trim(),

        media_url:
          mediaUrl || null,

        media_type:
          mediaType,

        destination_url:
          form.destination_url.trim() ||
          null,

        width: Number(width),

        height: Number(height),
      };

      if (editingId !== null) {
        const {
          error,
        } = await supabase
          .from("projects")
          .update(payload)
          .eq(
            "id",
            editingId
          );

        if (error) {
          throw new Error(
            `Database update failed: ${error.message}`
          );
        }

        setMessage(
          "Project updated successfully."
        );
      } else {
        const {
          error,
        } = await supabase
          .from("projects")
          .insert(payload);

        if (error) {
          throw new Error(
            `Database insert failed: ${error.message}`
          );
        }

        setMessage(
          "Project added successfully."
        );
      }

      await loadProjects();

      setEditingId(null);
      setForm(EMPTY_FORM);
      setSelectedFile(null);

      if (
        fileInputRef.current
      ) {
        fileInputRef.current.value =
          "";
      }
    } catch (error) {
      console.error(
        "FUNK Admin save error:",
        error
      );

      setMessage(
        error instanceof Error
          ? error.message
          : "Failed to save project."
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteProject(
    id: number
  ) {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete this project?"
      );

    if (!confirmed) {
      return;
    }

    setMessage("");

    const {
      error,
    } = await supabase
      .from("projects")
      .delete()
      .eq("id", id);

    if (error) {
      setMessage(
        `Delete failed: ${error.message}`
      );
      return;
    }

    setMessage(
      "Project deleted."
    );

    await loadProjects();
  }

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="admin-spinner" />
        <span>
          Loading FUNK Admin...
        </span>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="admin-login-page">
        <div className="admin-login-glow" />

        <form
          className="admin-login-card"
          onSubmit={login}
        >
          <div className="admin-brand">
            <span className="admin-brand-dot" />
            FUNK
          </div>

          <div className="admin-login-label">
            PRIVATE AREA
          </div>

          <h1>
            Admin Login
          </h1>

          <p>
            Sign in to manage your FUNK
            portfolio projects.
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
              onChange={(event) =>
                setEmail(
                  event.target.value
                )
              }
              placeholder="admin@example.com"
              required
            />
          </label>

          <label>
            Password

            <input
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(
                  event.target.value
                )
              }
              placeholder="••••••••"
              required
            />
          </label>

          <button
            className="admin-primary-button"
            type="submit"
            disabled={loginLoading}
          >
            {loginLoading
              ? "SIGNING IN..."
              : "SIGN IN ↗"}
          </button>

          <a
            className="back-home"
            href="/"
          >
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
          <a
            href="/"
            className="admin-view-button"
          >
            VIEW SITE ↗
          </a>

          <button
            className="admin-logout-button"
            onClick={logout}
            type="button"
          >
            LOG OUT
          </button>
        </div>
      </header>

      <main className="admin-container">
        <section className="admin-intro">
          <div>
            <span className="admin-kicker">
              CONTROL CENTER
            </span>

            <h1>
              Manage Projects
            </h1>

            <p>
              Add, edit and remove projects
              from your public FUNK portfolio.
            </p>
          </div>

          <div className="project-count">
            <strong>
              {projects.length}
            </strong>

            <span>
              PROJECTS
            </span>
          </div>
        </section>

        <section className="admin-editor">
          <div className="editor-heading">
            <div>
              <span className="admin-kicker">
                {editingId
                  ? "EDIT PROJECT"
                  : "NEW PROJECT"}
              </span>

              <h2>
                {editingId
                  ? "Update project"
                  : "Add a project"}
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

          <form
            onSubmit={saveProject}
          >
            <div className="form-grid">
              <label>
                Project title

                <input
                  type="text"
                  value={form.title}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      title:
                        event.target.value,
                    })
                  }
                  placeholder="FUNK Portfolio"
                  required
                />
              </label>

              <label>
                Media type

                <select
                  value={form.media_type}
                  onChange={(event) => {
                    const type =
                      event.target
                        .value as MediaType;

                    setForm({
                      ...form,
                      media_type:
                        type,
                    });

                    if (
                      type ===
                      "website"
                    ) {
                      setSelectedFile(
                        null
                      );
                    }
                  }}
                >
                  <option value="image">
                    Image
                  </option>

                  <option value="video">
                    Video
                  </option>

                  <option value="website">
                    Website
                  </option>
                </select>
              </label>

              {form.media_type !==
                "website" && (
                <div
                  className="full-field"
                  style={{
                    marginTop: 8,
                  }}
                >
                  <div
                    onDragOver={
                      handleDragOver
                    }
                    onDragEnter={
                      handleDragOver
                    }
                    onDragLeave={
                      handleDragLeave
                    }
                    onDrop={
                      handleDrop
                    }
                    onClick={() =>
                      fileInputRef.current?.click()
                    }
                    style={{
                      minHeight:
                        190,
                      border:
                        dragActive
                          ? "2px solid #fff"
                          : "2px dashed rgba(255,255,255,.22)",
                      borderRadius:
                        18,
                      background:
                        dragActive
                          ? "rgba(255,255,255,.09)"
                          : "rgba(255,255,255,.035)",
                      display:
                        "flex",
                      alignItems:
                        "center",
                      justifyContent:
                        "center",
                      textAlign:
                        "center",
                      cursor:
                        "pointer",
                      transition:
                        "all .2s ease",
                      padding:
                        25,
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize:
                            34,
                          marginBottom:
                            10,
                        }}
                      >
                        {selectedFile
                          ? "✓"
                          : "↑"}
                      </div>

                      <strong
                        style={{
                          display:
                            "block",
                          fontSize:
                            16,
                        }}
                      >
                        {selectedFile
                          ? selectedFile.name
                          : "Drag & drop your media here"}
                      </strong>

                      <span
                        style={{
                          display:
                            "block",
                          marginTop:
                            8,
                          opacity:
                            0.55,
                          fontSize:
                            13,
                        }}
                      >
                        {selectedFile
                          ? `${form.width} × ${form.height} • ${form.media_type}`
                          : "or click to choose an image/video"}
                      </span>

                      <span
                        style={{
                          display:
                            "block",
                          marginTop:
                            6,
                          opacity:
                            0.35,
                          fontSize:
                            11,
                        }}
                      >
                        Maximum 100 MB
                      </span>
                    </div>

                    <input
                      ref={
                        fileInputRef
                      }
                      type="file"
                      accept="image/*,video/*"
                      onChange={
                        handleFileInput
                      }
                      style={{
                        display:
                          "none",
                      }}
                    />
                  </div>

                  {selectedFile && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFile(
                          null
                        );

                        setForm(
                          (
                            current
                          ) => ({
                            ...current,
                            width:
                              null,
                            height:
                              null,
                          })
                        );

                        if (
                          fileInputRef.current
                        ) {
                          fileInputRef.current.value =
                            "";
                        }
                      }}
                      style={{
                        marginTop:
                          10,
                        background:
                          "transparent",
                        border:
                          "1px solid rgba(255,255,255,.15)",
                        color:
                          "#fff",
                        borderRadius:
                          10,
                        padding:
                          "8px 12px",
                        cursor:
                          "pointer",
                      }}
                    >
                      Remove selected file
                    </button>
                  )}
                </div>
              )}

              <label className="full-field">
                {form.media_type ===
                "website"
                  ? "Website URL"
                  : "Media URL (optional)"}

                <input
                  type="url"
                  value={
                    form.media_url
                  }
                  onChange={(
                    event
                  ) => {
                    const url =
                      event.target
                        .value;

                    setForm({
                      ...form,
                      media_url:
                        url,
                    });
                  }}
                  onBlur={() => {
                    if (
                      form.media_url.trim()
                    ) {
                      detectUrlDimensions(
                        form.media_url.trim(),
                        form.media_type
                      );
                    }
                  }}
                  placeholder={
                    form.media_type ===
                    "website"
                      ? "https://example.com"
                      : "https://..."
                  }
                />
              </label>

              <label className="full-field">
                Destination URL

                <input
                  type="url"
                  value={
                    form.destination_url
                  }
                  onChange={(
                    event
                  ) =>
                    setForm({
                      ...form,
                      destination_url:
                        event.target
                          .value,
                    })
                  }
                  placeholder="https://instagram.com/..."
                />
              </label>
            </div>

            <div
              style={{
                display:
                  "flex",
                flexWrap:
                  "wrap",
                gap: 10,
                marginTop:
                  16,
              }}
            >
              <div
                style={{
                  padding:
                    "10px 14px",
                  borderRadius:
                    12,
                  background:
                    "rgba(255,255,255,.05)",
                  border:
                    "1px solid rgba(255,255,255,.08)",
                  fontSize:
                    13,
                }}
              >
                Ratio:{" "}
                <strong>
                  {form.width &&
                  form.height
                    ? `${form.width} × ${form.height}`
                    : "Auto"}
                </strong>
              </div>

              {form.width &&
                form.height && (
                  <div
                    style={{
                      padding:
                        "10px 14px",
                      borderRadius:
                        12,
                      background:
                        "rgba(255,255,255,.05)",
                      border:
                        "1px solid rgba(255,255,255,.08)",
                      fontSize:
                        13,
                    }}
                  >
                    Aspect:{" "}
                    <strong>
                      {getAspectRatio(
                        form.width,
                        form.height
                      )}
                    </strong>
                  </div>
                )}
            </div>

            {message && (
              <div
                className={
                  message
                    .toLowerCase()
                    .includes(
                      "success"
                    ) ||
                  message ===
                    "Project deleted."
                    ? "admin-success"
                    : "admin-error"
                }
                style={{
                  marginTop:
                    16,
                  whiteSpace:
                    "pre-wrap",
                }}
              >
                {message}
              </div>
            )}

            <button
              className="admin-primary-button save-button"
              type="submit"
              disabled={
                saving ||
                uploading
              }
            >
              {uploading
                ? "UPLOADING..."
                : saving
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
              <span className="admin-kicker">
                DATABASE
              </span>

              <h2>
                Projects
              </h2>
            </div>

            <button
              className="refresh-button"
              onClick={
                loadProjects
              }
              type="button"
            >
              ↻ REFRESH
            </button>
          </div>

          {projects.length ===
          0 ? (
            <div className="empty-projects">
              <span>
                NO PROJECTS YET
              </span>

              <p>
                Add your first project
                above.
              </p>
            </div>
          ) : (
            <div className="admin-project-list">
              {projects.map(
                (project) => (
                  <article
                    className="admin-project-card"
                    key={
                      project.id
                    }
                  >
                    <div className="project-preview">
                      {project.media_type ===
                        "image" ? (
                        <img
                          src={
                            project.media_url ||
                            ""
                          }
                          alt={
                            project.title ||
                            "FUNK project"
                          }
                        />
                      ) : project.media_type ===
                        "video" ? (
                        <video
                          src={
                            project.media_url ||
                            undefined
                          }
                          muted
                          playsInline
                          controls
                        />
                      ) : (
                        <div className="website-preview">
                          <span>
                            ↗
                          </span>
                          WEBSITE
                        </div>
                      )}
                    </div>

                    <div className="project-info">
                      <div className="project-meta">
                        <span>
                          #
                          {
                            project.id
                          }
                        </span>

                        <span>
                          {
                            project.media_type
                          }
                        </span>
                      </div>

                      <h3>
                        {
                          project.title
                        }
                      </h3>

                      <div className="project-size">
                        {project.width ||
                          "Auto"}{" "}
                        ×{" "}
                        {project.height ||
                          "Auto"}
                      </div>

                      <div className="project-actions">
                        <button
                          type="button"
                          onClick={() =>
                            editProject(
                              project
                            )
                          }
                        >
                          EDIT
                        </button>

                        <button
                          type="button"
                          className="delete-action"
                          onClick={() =>
                            deleteProject(
                              project.id
                            )
                          }
                        >
                          DELETE
                        </button>
                      </div>
                    </div>
                  </article>
                )
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function getAspectRatio(
  width: number,
  height: number
): string {
  if (
    !width ||
    !height
  ) {
    return "Auto";
  }

  const ratio =
    width / height;

  const commonRatios = [
    {
      value: 16 / 9,
      label: "16:9",
    },
    {
      value: 9 / 16,
      label: "9:16",
    },
    {
      value: 1,
      label: "1:1",
    },
    {
      value: 4 / 5,
      label: "4:5",
    },
    {
      value: 5 / 4,
      label: "5:4",
    },
    {
      value: 4 / 3,
      label: "4:3",
    },
    {
      value: 3 / 4,
      label: "3:4",
    },
    {
      value: 3 / 2,
      label: "3:2",
    },
    {
      value: 2 / 3,
      label: "2:3",
    },
  ];

  const match =
    commonRatios.find(
      (item) =>
        Math.abs(
          ratio - item.value
        ) < 0.02
    );

  if (match) {
    return match.label;
  }

  return ratio.toFixed(2);
}