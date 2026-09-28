import { useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabase";
import "./admin.css";

type MediaType = "image" | "video" | "website";

type Project = {
  id: number;
  title: string;
  media_url: string;
  media_type: MediaType;
  destination_url: string | null;
  width?: number | null;
  height?: number | null;
};

function detectMediaType(url: string): MediaType {
  const clean = url.split("?")[0].toLowerCase();

  if (
    clean.endsWith(".jpg") ||
    clean.endsWith(".jpeg") ||
    clean.endsWith(".png") ||
    clean.endsWith(".webp") ||
    clean.endsWith(".gif") ||
    clean.endsWith(".avif")
  ) {
    return "image";
  }

  if (
    clean.endsWith(".mp4") ||
    clean.endsWith(".webm") ||
    clean.endsWith(".mov") ||
    clean.endsWith(".m4v")
  ) {
    return "video";
  }

  return "website";
}

export default function Admin() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dragging, setDragging] = useState(false);

  const [projects, setProjects] = useState<Project[]>([]);

  const [title, setTitle] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [destinationUrl, setDestinationUrl] = useState("");

  const [mediaType, setMediaType] = useState<MediaType>("website");

  const [width, setWidth] = useState<number | null>(null);
  const [height, setHeight] = useState<number | null>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadProjects();
  }, []);

  async function loadProjects() {
    setLoading(true);
    setError("");

    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("id", { ascending: false });

    if (error) {
      console.error(error);
      setError(error.message);
    } else {
      setProjects((data || []) as Project[]);
    }

    setLoading(false);
  }

  function resetForm() {
    setTitle("");
    setMediaUrl("");
    setDestinationUrl("");
    setMediaType("website");
    setWidth(null);
    setHeight(null);
    setSelectedFile(null);
    setPreviewUrl("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function detectImageDimensions(file: File) {
    const url = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      setWidth(image.naturalWidth);
      setHeight(image.naturalHeight);
      URL.revokeObjectURL(url);
    };

    image.src = url;
  }

  function detectVideoDimensions(file: File) {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");

    video.preload = "metadata";

    video.onloadedmetadata = () => {
      setWidth(video.videoWidth);
      setHeight(video.videoHeight);
      URL.revokeObjectURL(url);
    };

    video.onerror = () => {
      URL.revokeObjectURL(url);
    };

    video.src = url;
  }

  function handleFile(file: File) {
    setError("");
    setSuccess("");

    if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
      setError("Only image and video files are supported.");
      return;
    }

    setSelectedFile(file);

    const localPreview = URL.createObjectURL(file);
    setPreviewUrl(localPreview);

    let detected: MediaType = "image";

    if (file.type.startsWith("video/")) {
      detected = "video";
      detectVideoDimensions(file);
    } else {
      detected = "image";
      detectImageDimensions(file);
    }

    setMediaType(detected);

    // We don't know the public URL until upload.
    setMediaUrl("");
  }

  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();

    setDragging(false);

    const file = event.dataTransfer.files?.[0];

    if (file) {
      handleFile(file);
    }
  }

  function handleUrlChange(value: string) {
    setMediaUrl(value);

    if (!value.trim()) {
      setMediaType("website");
      setWidth(null);
      setHeight(null);
      return;
    }

    const detected = detectMediaType(value);

    setMediaType(detected);

    if (detected === "image") {
      const image = new Image();

      image.onload = () => {
        setWidth(image.naturalWidth);
        setHeight(image.naturalHeight);
      };

      image.src = value;
    }

    if (detected === "video") {
      const video = document.createElement("video");

      video.preload = "metadata";

      video.onloadedmetadata = () => {
        setWidth(video.videoWidth);
        setHeight(video.videoHeight);
      };

      video.src = value;
    }

    if (detected === "website") {
      setWidth(null);
      setHeight(null);
    }
  }

  async function uploadFile(file: File) {
    const safeName = file.name
      .replace(/\s+/g, "-")
      .replace(/[^a-zA-Z0-9._-]/g, "");

    const filePath = `${Date.now()}-${crypto.randomUUID()}-${safeName}`;

    const { error: uploadError } = await supabase.storage
      .from("project-media")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      });

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage
      .from("project-media")
      .getPublicUrl(filePath);

    return data.publicUrl;
  }

  async function addProject(event: React.FormEvent) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!title.trim()) {
      setError("Enter a project name.");
      return;
    }

    if (!selectedFile && !mediaUrl.trim()) {
      setError("Drop an image/video or enter a website URL.");
      return;
    }

    setSaving(true);

    try {
      let finalMediaUrl = mediaUrl.trim();

      // Upload dropped/selected file
      if (selectedFile) {
        finalMediaUrl = await uploadFile(selectedFile);
      }

      const finalDestination =
        destinationUrl.trim() || finalMediaUrl;

      const payload = {
        title: title.trim(),
        media_url: finalMediaUrl,
        media_type: mediaType,
        destination_url: finalDestination,
        width,
        height,
      };

      const { error: insertError } = await supabase
        .from("projects")
        .insert(payload);

      if (insertError) {
        throw insertError;
      }

      setSuccess("Project added successfully.");

      resetForm();

      await loadProjects();
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Failed to save project.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteProject(id: number) {
    const confirmed = window.confirm(
      "Delete this project?"
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("projects")
      .delete()
      .eq("id", id);

    if (error) {
      setError(error.message);
      return;
    }

    setSuccess("Project deleted.");
    await loadProjects();
  }

  function aspectRatio(project: Project) {
    if (
      project.width &&
      project.height &&
      project.height !== 0
    ) {
      return project.width / project.height;
    }

    return 16 / 9;
  }

  return (
    <main className="admin-page">
      <div className="admin-background-orb orb-one" />
      <div className="admin-background-orb orb-two" />

      <header className="admin-header">
        <div>
          <div className="admin-breadcrumb">
            FUNK / ADMIN
          </div>

          <h1>PROJECTS</h1>

          <p className="admin-subtitle">
            Manage your portfolio projects
          </p>
        </div>

        <div className="admin-actions">
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="glass-button"
          >
            ↗ View site
          </a>

          <button
            type="button"
            onClick={loadProjects}
            className="glass-button"
          >
            ↻ Refresh
          </button>

          <button
            type="button"
            onClick={async () => {
              await supabase.auth.signOut();
              window.location.reload();
            }}
            className="glass-button logout-button"
          >
            ⇥ Logout
          </button>
        </div>
      </header>

      <section className="glass-panel add-project-panel">
        <div className="panel-heading">
          <div>
            <span className="panel-kicker">
              NEW PROJECT
            </span>

            <h2>Add Project</h2>
          </div>

          <div className="auto-badge">
            AUTO
          </div>
        </div>

        <form onSubmit={addProject}>
          <div className="project-grid">
            <div className="field full-field">
              <label>Project name</label>

              <input
                type="text"
                placeholder="e.g. Cyberpunk Edit"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="upload-area-wrapper full-field">
              <label>Media</label>

              <div
                className={`dropzone ${
                  dragging ? "dropzone-active" : ""
                } ${
                  selectedFile ? "dropzone-filled" : ""
                }`}
                onDragEnter={(e) => {
                  e.preventDefault();
                  setDragging(true);
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  setDragging(false);
                }}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                {previewUrl ? (
                  <div className="drop-preview">
                    {mediaType === "video" ? (
                      <video
                        src={previewUrl}
                        muted
                        autoPlay
                        loop
                        playsInline
                      />
                    ) : (
                      <img
                        src={previewUrl}
                        alt="Preview"
                      />
                    )}

                    <div className="preview-overlay">
                      <strong>
                        {selectedFile?.name}
                      </strong>

                      <span>
                        {mediaType.toUpperCase()} ·{" "}
                        {width || "?"} × {height || "?"}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="drop-content">
                    <div className="upload-icon">
                      ↑
                    </div>

                    <strong>
                      Drop image or video here
                    </strong>

                    <span>
                      or click to browse
                    </span>

                    <small>
                      PNG · JPG · WEBP · MP4 · WEBM · MOV
                    </small>
                  </div>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                hidden
                onChange={(e) => {
                  const file = e.target.files?.[0];

                  if (file) {
                    handleFile(file);
                  }
                }}
              />
            </div>

            <div className="or-divider full-field">
              <span>OR USE A WEBSITE / MEDIA URL</span>
            </div>

            <div className="field full-field">
              <label>Media URL</label>

              <input
                type="url"
                placeholder="https://..."
                value={mediaUrl}
                onChange={(e) =>
                  handleUrlChange(e.target.value)
                }
                disabled={!!selectedFile}
              />

              {selectedFile && (
                <button
                  type="button"
                  className="remove-file"
                  onClick={() => {
                    setSelectedFile(null);
                    setPreviewUrl("");
                    setMediaUrl("");

                    if (fileInputRef.current) {
                      fileInputRef.current.value = "";
                    }
                  }}
                >
                  Remove uploaded file
                </button>
              )}
            </div>

            <div className="detected-row">
              <div className="detected-card">
                <span>TYPE</span>

                <strong>
                  {mediaType === "image" && "IMAGE"}
                  {mediaType === "video" && "VIDEO"}
                  {mediaType === "website" && "WEBSITE"}
                </strong>
              </div>

              <div className="detected-card">
                <span>DIMENSIONS</span>

                <strong>
                  {width && height
                    ? `${width} × ${height}`
                    : "AUTO"}
                </strong>
              </div>

              <div className="detected-card">
                <span>RATIO</span>

                <strong>
                  {width && height
                    ? `${(width / height).toFixed(2)} : 1`
                    : "AUTO"}
                </strong>
              </div>
            </div>

            <div className="field full-field">
              <label>
                Redirect URL
                <span>Optional</span>
              </label>

              <input
                type="url"
                placeholder="https://instagram.com/your-project"
                value={destinationUrl}
                onChange={(e) =>
                  setDestinationUrl(e.target.value)
                }
              />

              <p className="field-help">
                Clicking the project on your portfolio will
                open this URL. Leave empty to use the uploaded
                media URL.
              </p>
            </div>
          </div>

          {error && (
            <div className="message error-message">
              {error}
            </div>
          )}

          {success && (
            <div className="message success-message">
              {success}
            </div>
          )}

          <button
            type="submit"
            className="add-project-button"
            disabled={saving}
          >
            {saving ? (
              <>
                <span className="spinner" />
                Uploading...
              </>
            ) : (
              <>
                ＋ Add Project
              </>
            )}
          </button>
        </form>
      </section>

      <section className="projects-section">
        <div className="projects-heading">
          <div>
            <span className="panel-kicker">
              YOUR WORK
            </span>

            <h2>
              Projects
              <span>{projects.length}</span>
            </h2>
          </div>
        </div>

        {loading ? (
          <div className="glass-panel empty-state">
            <div className="loading-spinner" />
            <p>Loading projects...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="glass-panel empty-state">
            <div className="empty-icon">
              ◇
            </div>

            <h3>No projects yet</h3>

            <p>
              Upload your first project above.
            </p>
          </div>
        ) : (
          <div className="projects-grid">
            {projects.map((project) => (
              <article
                className="project-card"
                key={project.id}
              >
                <div
                  className="project-media"
                  style={{
                    aspectRatio: `${aspectRatio(project)}`,
                  }}
                >
                  {project.media_type === "image" && (
                    <img
                      src={project.media_url}
                      alt={project.title}
                    />
                  )}

                  {project.media_type === "video" && (
                    <video
                      src={project.media_url}
                      muted
                      loop
                      playsInline
                      controls
                    />
                  )}

                  {project.media_type === "website" && (
                    <iframe
                      src={project.media_url}
                      title={project.title}
                    />
                  )}

                  <div className="media-type-badge">
                    {project.media_type}
                  </div>
                </div>

                <div className="project-info">
                  <div>
                    <h3>{project.title}</h3>

                    <p>
                      {project.width && project.height
                        ? `${project.width} × ${project.height}`
                        : "Auto detected"}
                    </p>
                  </div>

                  <div className="project-buttons">
                    <a
                      href={
                        project.destination_url ||
                        project.media_url
                      }
                      target="_blank"
                      rel="noreferrer"
                      className="small-glass-button"
                    >
                      Open ↗
                    </a>

                    <button
                      type="button"
                      onClick={() =>
                        deleteProject(project.id)
                      }
                      className="delete-button"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}