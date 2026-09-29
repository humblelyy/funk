import { useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabase";
import "./admin.css";

type MediaType = "image" | "video" | "website";

type Project = {
  id: string;
  title: string;
  media_type: MediaType;
  media_url: string;
  redirect_url: string;
  width: number | null;
  height: number | null;
  created_at?: string;
};

export default function Admin() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [title, setTitle] = useState("");
  const [mediaType, setMediaType] = useState<MediaType>("image");
  const [mediaUrl, setMediaUrl] = useState("");
  const [redirectUrl, setRedirectUrl] = useState("");
  const [width, setWidth] = useState<number | "">("");
  const [height, setHeight] = useState<number | "">("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadProjects();
  }, []);

  async function loadProjects() {
    setLoading(true);

    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      setMessage("Failed to load projects.");
    } else {
      setProjects(data || []);
    }

    setLoading(false);
  }

  function resetForm() {
    setTitle("");
    setMediaType("image");
    setMediaUrl("");
    setRedirectUrl("");
    setWidth("");
    setHeight("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function detectImageDimensions(file: File) {
    return new Promise<{ width: number; height: number }>(
      (resolve, reject) => {
        const img = new Image();

        img.onload = () => {
          resolve({
            width: img.naturalWidth,
            height: img.naturalHeight,
          });

          URL.revokeObjectURL(img.src);
        };

        img.onerror = reject;
        img.src = URL.createObjectURL(file);
      }
    );
  }

  function detectVideoDimensions(file: File) {
    return new Promise<{ width: number; height: number }>(
      (resolve, reject) => {
        const video = document.createElement("video");

        video.onloadedmetadata = () => {
          resolve({
            width: video.videoWidth,
            height: video.videoHeight,
          });

          URL.revokeObjectURL(video.src);
        };

        video.onerror = reject;
        video.preload = "metadata";
        video.src = URL.createObjectURL(file);
      }
    );
  }

  function detectType(file: File): MediaType {
    if (file.type.startsWith("video/")) {
      return "video";
    }

    if (file.type.startsWith("image/")) {
      return "image";
    }

    return "website";
  }

  async function handleFile(file: File) {
    if (!file) return;

    setMessage("");
    setUploading(true);

    try {
      const detectedType = detectType(file);

      setMediaType(detectedType);

      if (detectedType === "image") {
        const dimensions = await detectImageDimensions(file);

        setWidth(dimensions.width);
        setHeight(dimensions.height);
      }

      if (detectedType === "video") {
        const dimensions = await detectVideoDimensions(file);

        setWidth(dimensions.width);
        setHeight(dimensions.height);
      }

      const extension =
        file.name.split(".").pop()?.toLowerCase() || "file";

      const fileName = `${crypto.randomUUID()}.${extension}`;

      const filePath = `projects/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("project-media")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      const {
        data: { publicUrl },
      } = supabase.storage
        .from("project-media")
        .getPublicUrl(filePath);

      setMediaUrl(publicUrl);

      setMessage("File uploaded successfully.");
    } catch (error: any) {
      console.error(error);
      setMessage(error?.message || "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();

    const file = event.dataTransfer.files?.[0];

    if (file) {
      handleFile(file);
    }
  }

  function handleDragOver(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
  }

  function handleMediaUrlChange(value: string) {
    setMediaUrl(value);

    if (!value) return;

    const lower = value.toLowerCase();

    if (
      lower.includes(".mp4") ||
      lower.includes(".webm") ||
      lower.includes(".mov") ||
      lower.includes(".m4v")
    ) {
      setMediaType("video");
    } else if (
      lower.includes(".jpg") ||
      lower.includes(".jpeg") ||
      lower.includes(".png") ||
      lower.includes(".webp") ||
      lower.includes(".gif")
    ) {
      setMediaType("image");
    }
  }

  function autoDetectDimensions(url: string) {
    if (!url) return;

    if (mediaType === "image") {
      const img = new Image();

      img.onload = () => {
        setWidth(img.naturalWidth);
        setHeight(img.naturalHeight);
      };

      img.src = url;
    }

    if (mediaType === "video") {
      const video = document.createElement("video");

      video.onloadedmetadata = () => {
        setWidth(video.videoWidth);
        setHeight(video.videoHeight);
      };

      video.src = url;
    }
  }

  async function addProject() {
    setMessage("");

    if (!title.trim()) {
      setMessage("Please enter a project name.");
      return;
    }

    if (!mediaUrl.trim()) {
      setMessage("Please upload a file.");
      return;
    }

    if (!redirectUrl.trim()) {
      setMessage("Please enter a redirect URL.");
      return;
    }

    setSaving(true);
    
const project = {
  title: title.trim(),
  media_type: mediaType,
  media_url: mediaUrl.trim(),

  // Keep both URL columns populated because the existing
  // Supabase table contains both columns.
  destination_url: redirectUrl.trim(),
  redirect_url: redirectUrl.trim(),

  width: width === "" ? null : Number(width),
  height: height === "" ? null : Number(height),
};

    const { error } = await supabase
      .from("projects")
      .insert(project);

    if (error) {
      console.error(error);
      setMessage(error.message || "Failed to save project.");
    } else {
      setMessage("Project added successfully.");
      resetForm();
      await loadProjects();
    }

    setSaving(false);
  }

  async function deleteProject(id: string) {
    const confirmed = window.confirm(
      "Delete this project?"
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

    await loadProjects();
  }

  async function logout() {
    await supabase.auth.signOut();
    window.location.href = "/admin";
  }

  return (
    <div className="liquid-admin">
      <div className="liquid-orb orb-one" />
      <div className="liquid-orb orb-two" />
      <div className="liquid-orb orb-three" />

      <header className="admin-header">
        <div>
          <div className="admin-kicker">
            FUNK / ADMIN
          </div>

          <h1>PROJECTS</h1>

          <p>
            Manage your portfolio media
          </p>
        </div>

        <div className="admin-actions">
          <button
            className="glass-button"
            onClick={() =>
              (window.location.href = "/")
            }
          >
            ↗ View site
          </button>

          <button
            className="glass-button"
            onClick={loadProjects}
          >
            ↻ Refresh
          </button>

          <button
            className="glass-button logout-button"
            onClick={logout}
          >
            ↪ Logout
          </button>
        </div>
      </header>

      <main className="admin-content">
        <section className="glass-panel add-panel">
          <div className="panel-heading">
            <div>
              <span className="panel-eyebrow">
                NEW PROJECT
              </span>

              <h2>Add Project</h2>
            </div>

            <div className="live-dot">
              <span />
              LIVE
            </div>
          </div>

          <div className="project-form">
            {/* PROJECT NAME */}
            <div className="field field-full">
              <label>Project name</label>

              <input
                type="text"
                value={title}
                onChange={(e) =>
                  setTitle(e.target.value)
                }
                placeholder="My latest edit"
              />
            </div>

            {/* DROPZONE */}
            <div className="field field-full">
              <label>Project media</label>

              <div
                className={`liquid-dropzone ${
                  uploading ? "uploading" : ""
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() =>
                  fileInputRef.current?.click()
                }
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  hidden
                  accept="image/*,video/*"
                  onChange={(e) => {
                    const file =
                      e.target.files?.[0];

                    if (file) {
                      handleFile(file);
                    }
                  }}
                />

                {uploading ? (
                  <>
                    <div className="upload-spinner" />

                    <strong>
                      Uploading...
                    </strong>

                    <span>
                      Please wait
                    </span>
                  </>
                ) : mediaUrl ? (
                  <>
                    <div className="drop-icon success">
                      ✓
                    </div>

                    <strong>
                      Media uploaded
                    </strong>

                    <span>
                      Click or drop another file
                    </span>
                  </>
                ) : (
                  <>
                    <div className="drop-icon">
                      ↑
                    </div>

                    <strong>
                      Drag & drop your media ( ** 50 MB max. ** )
                    </strong>

                    <span>
                      or click to browse
                    </span>

                    <small>
                      Images and videos are supported
                    </small>
                  </>
                )}
              </div>
            </div>

            {/* AUTO DETECTED INFO */}
            <div className="detected-grid">
              <div className="detected-card">
                <span>TYPE</span>

                <strong>
                  {mediaType === "image"
                    ? "IMAGE"
                    : mediaType === "video"
                    ? "VIDEO"
                    : "WEBSITE"}
                </strong>
              </div>

              <div className="detected-card">
                <span>WIDTH</span>

                <strong>
                  {width || "Auto"}
                </strong>
              </div>

              <div className="detected-card">
                <span>HEIGHT</span>

                <strong>
                  {height || "Auto"}
                </strong>
              </div>

              <div className="detected-card">
                <span>RATIO</span>

                <strong>
                  {width && height
                    ? `${(
                        Number(width) /
                        Number(height)
                      ).toFixed(2)}:1`
                    : "Auto"}
                </strong>
              </div>
            </div>

            {/* MEDIA URL */}
            <div className="field field-full">
              <label>
                Uploaded media URL
              </label>

              <input
                type="url"
                value={mediaUrl}
                onChange={(e) =>
                  handleMediaUrlChange(
                    e.target.value
                  )
                }
                onBlur={() =>
                  autoDetectDimensions(mediaUrl)
                }
                placeholder="Automatically generated after upload"
              />
            </div>

            {/* REDIRECT URL */}
            <div className="field field-full">
              <label>
                Project redirect URL
              </label>

              <input
                type="url"
                value={redirectUrl}
                onChange={(e) =>
                  setRedirectUrl(e.target.value)
                }
                placeholder="https://instagram.com/funk.vfx/"
              />

              <span className="field-help">
                Clicking the project on your portfolio
                will open this URL.
              </span>
            </div>

            {/* OPTIONAL MANUAL DIMENSIONS */}
            <div className="manual-dimensions">
              <div className="field">
                <label>Width</label>

                <input
                  type="number"
                  value={width}
                  onChange={(e) =>
                    setWidth(
                      e.target.value === ""
                        ? ""
                        : Number(e.target.value)
                    )
                  }
                  placeholder="Auto detected"
                />
              </div>

              <div className="dimension-symbol">
                ×
              </div>

              <div className="field">
                <label>Height</label>

                <input
                  type="number"
                  value={height}
                  onChange={(e) =>
                    setHeight(
                      e.target.value === ""
                        ? ""
                        : Number(e.target.value)
                    )
                  }
                  placeholder="Auto detected"
                />
              </div>
            </div>

            {message && (
              <div
                className={`form-message ${
                  message
                    .toLowerCase()
                    .includes("success")
                    ? "success"
                    : ""
                }`}
              >
                {message}
              </div>
            )}

            <button
              className="add-project-button"
              onClick={addProject}
              disabled={saving || uploading}
            >
              {saving
                ? "Saving..."
                : "＋ Add Project"}
            </button>
          </div>
        </section>

        {/* PROJECT LIST */}
        <section className="projects-section">
          <div className="section-heading">
            <div>
              <span className="panel-eyebrow">
                PORTFOLIO
              </span>

              <h2>
                Your projects
                <span>
                  {projects.length}
                </span>
              </h2>
            </div>
          </div>

          {loading ? (
            <div className="glass-empty">
              <div className="upload-spinner" />
              <strong>
                Loading projects...
              </strong>
            </div>
          ) : projects.length === 0 ? (
            <div className="glass-empty">
              <div className="empty-icon">
                ◇
              </div>

              <strong>
                No projects yet
              </strong>

              <span>
                Add your first project above.
              </span>
            </div>
          ) : (
            <div className="projects-grid">
              {projects.map((project) => (
                <article
                  className="project-card"
                  key={project.id}
                >
                  <div className="project-preview">
                    {project.media_type ===
                    "video" ? (
                      <video
                        src={project.media_url}
                        muted
                        playsInline
                        preload="metadata"
                        controls
                      />
                    ) : (
                      <img
                        src={project.media_url}
                        alt={project.title}
                      />
                    )}

                    <div className="media-badge">
                      {project.media_type}
                    </div>
                  </div>

                  <div className="project-info">
                    <div>
                      <h3>
                        {project.title}
                      </h3>

                      <p>
                        {project.width || "?"}
                        {" × "}
                        {project.height || "?"}
                      </p>
                    </div>

                    <button
                      className="delete-button"
                      onClick={() =>
                        deleteProject(
                          project.id
                        )
                      }
                    >
                      Delete
                    </button>
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
