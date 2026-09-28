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
  width: number | null;
  height: number | null;
};

function detectMediaType(url: string): MediaType {
  const clean = url.split("?")[0].split("#")[0].toLowerCase();

  const imageExtensions = [
    ".jpg",
    ".jpeg",
    ".png",
    ".webp",
    ".gif",
    ".avif",
    ".svg",
  ];

  const videoExtensions = [
    ".mp4",
    ".webm",
    ".mov",
    ".m4v",
    ".ogg",
  ];

  if (imageExtensions.some((ext) => clean.endsWith(ext))) {
    return "image";
  }

  if (videoExtensions.some((ext) => clean.endsWith(ext))) {
    return "video";
  }

  return "website";
}

export default function Admin() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [destinationUrl, setDestinationUrl] = useState("");

  const [mediaType, setMediaType] = useState<MediaType>("website");

  const [width, setWidth] = useState<number | null>(null);
  const [height, setHeight] = useState<number | null>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");

  const [dragging, setDragging] = useState(false);

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

    setDragging(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function detectImageDimensions(file: File) {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      setWidth(image.naturalWidth);
      setHeight(image.naturalHeight);

      URL.revokeObjectURL(objectUrl);
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      setWidth(null);
      setHeight(null);
    };

    image.src = objectUrl;
  }

  function detectVideoDimensions(file: File) {
    const objectUrl = URL.createObjectURL(file);
    const video = document.createElement("video");

    video.preload = "metadata";

    video.onloadedmetadata = () => {
      setWidth(video.videoWidth || null);
      setHeight(video.videoHeight || null);

      URL.revokeObjectURL(objectUrl);
    };

    video.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      setWidth(null);
      setHeight(null);
    };

    video.src = objectUrl;
  }

  function handleFile(file: File) {
    setError("");
    setSuccess("");

    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");

    if (!isImage && !isVideo) {
      setError("Only image and video files are supported.");
      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    const objectUrl = URL.createObjectURL(file);

    setSelectedFile(file);
    setPreviewUrl(objectUrl);

    if (isVideo) {
      setMediaType("video");
      detectVideoDimensions(file);
    } else {
      setMediaType("image");
      detectImageDimensions(file);
    }

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
    setSelectedFile(null);
    setPreviewUrl("");

    if (!value.trim()) {
      setMediaType("website");
      setWidth(null);
      setHeight(null);
      return;
    }

    const detected = detectMediaType(value);

    setMediaType(detected);

    if (detected === "website") {
      setWidth(null);
      setHeight(null);
      return;
    }

    if (detected === "image") {
      const image = new Image();

      image.onload = () => {
        setWidth(image.naturalWidth);
        setHeight(image.naturalHeight);
      };

      image.onerror = () => {
        setWidth(null);
        setHeight(null);
      };

      image.src = value;

      return;
    }

    if (detected === "video") {
      const video = document.createElement("video");

      video.preload = "metadata";

      video.onloadedmetadata = () => {
        setWidth(video.videoWidth || null);
        setHeight(video.videoHeight || null);
      };

      video.onerror = () => {
        setWidth(null);
        setHeight(null);
      };

      video.src = value;
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

      /*
       * If a file was dragged/dropped,
       * upload it to Supabase Storage.
       */
      if (selectedFile) {
        finalMediaUrl = await uploadFile(selectedFile);
      }

      /*
       * If no redirect URL is entered,
       * clicking the project will open the uploaded media itself.
       */
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

      setError(
        err?.message || "Failed to save project."
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteProject(id: number) {
    const confirmed = window.confirm(
      "Delete this project?"
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");

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

  function getAspectRatio(project: Project) {
    if (
      project.width &&
      project.height &&
      project.height > 0
    ) {
      return project.width / project.height;
    }

    return 16 / 9;
  }

  function getTypeLabel(type: MediaType) {
    if (type === "image") return "IMAGE";
    if (type === "video") return "VIDEO";
    return "WEBSITE";
  }

  return (
    <main className="admin-page">

      {/* Background */}
      <div className="liquid-orb orb-one" />
      <div className="liquid-orb orb-two" />
      <div className="liquid-orb orb-three" />

      {/* HEADER */}
      <header className="admin-header">

        <div className="header-left">

          <div className="admin-breadcrumb">
            FUNK / ADMIN
          </div>

          <h1>PROJECTS</h1>

          <p>
            Manage your portfolio projects
          </p>

        </div>

        <div className="admin-actions">

          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="liquid-button"
          >
            ↗ View site
          </a>

          <button
            type="button"
            onClick={loadProjects}
            className="liquid-button"
          >
            ↻ Refresh
          </button>

          <button
            type="button"
            className="liquid-button logout-button"
            onClick={async () => {
              await supabase.auth.signOut();
              window.location.reload();
            }}
          >
            ⇥ Logout
          </button>

        </div>

      </header>

      {/* ADD PROJECT */}
      <section className="liquid-panel add-project-panel">

        <div className="panel-heading">

          <div>

            <span className="panel-kicker">
              NEW PROJECT
            </span>

            <h2>
              Add Project
            </h2>

          </div>

          <div className="auto-badge">
            AUTO
          </div>

        </div>

        <form onSubmit={addProject}>

          {/* PROJECT NAME */}
          <div className="field full-field">

            <label>
              Project name
            </label>

            <input
              type="text"
              placeholder="e.g. Cyberpunk Edit"
              value={title}
              onChange={(e) =>
                setTitle(e.target.value)
              }
            />

          </div>

          {/* DROPZONE */}
          <div className="field full-field">

            <label>
              Media
            </label>

            <div
              className={`liquid-dropzone ${
                dragging
                  ? "dragging"
                  : ""
              } ${
                selectedFile
                  ? "has-file"
                  : ""
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
              onClick={() =>
                fileInputRef.current?.click()
              }
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

                  <div className="preview-gradient" />

                  <div className="preview-info">

                    <strong>
                      {selectedFile?.name}
                    </strong>

                    <span>
                      {getTypeLabel(mediaType)}
                    </span>

                  </div>

                  <div className="dimension-pill">

                    {width && height
                      ? `${width} × ${height}`
                      : "Detecting..."}

                  </div>

                </div>

              ) : (

                <div className="drop-content">

                  <div className="drop-icon">
                    ↑
                  </div>

                  <strong>
                    Drag & drop your media
                  </strong>

                  <span>
                    or click to browse
                  </span>

                  <small>
                    Images & videos · automatic detection
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
                const file =
                  e.target.files?.[0];

                if (file) {
                  handleFile(file);
                }
              }}
            />

          </div>

          {/* URL */}
          <div className="field full-field">

            <div className="label-row">

              <label>
                Media / Website URL
              </label>

              <span className="auto-label">
                AUTO DETECT
              </span>

            </div>

            <input
              type="url"
              placeholder="https://..."
              value={mediaUrl}
              disabled={!!selectedFile}
              onChange={(e) =>
                handleUrlChange(e.target.value)
              }
            />

            {selectedFile && (

              <button
                type="button"
                className="remove-button"
                onClick={() => {

                  if (previewUrl) {
                    URL.revokeObjectURL(
                      previewUrl
                    );
                  }

                  setSelectedFile(null);
                  setPreviewUrl("");
                  setMediaUrl("");
                  setMediaType("website");
                  setWidth(null);
                  setHeight(null);

                  if (fileInputRef.current) {
                    fileInputRef.current.value =
                      "";
                  }
                }}
              >
                Remove uploaded media
              </button>

            )}

          </div>

          {/* AUTO DETECTION */}
          <div className="detection-grid">

            <div className="detection-card">

              <span>
                TYPE
              </span>

              <strong>
                {getTypeLabel(mediaType)}
              </strong>

            </div>

            <div className="detection-card">

              <span>
                DIMENSIONS
              </span>

              <strong>
                {width && height
                  ? `${width} × ${height}`
                  : "AUTO"}
              </strong>

            </div>

            <div className="detection-card">

              <span>
                RATIO
              </span>

              <strong>
                {width && height
                  ? `${(width / height).toFixed(2)} : 1`
                  : "AUTO"}
              </strong>

            </div>

          </div>

          {/* REDIRECT */}
          <div className="field full-field">

            <div className="label-row">

              <label>
                Project URL
              </label>

              <span className="optional-label">
                OPTIONAL
              </span>

            </div>

            <input
              type="url"
              placeholder="https://..."
              value={destinationUrl}
              onChange={(e) =>
                setDestinationUrl(
                  e.target.value
                )
              }
            />

            <p className="field-help">
              This is where the project opens when
              someone clicks it. Leave empty to open
              the uploaded media automatically.
            </p>

          </div>

          {/* MESSAGES */}
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

          {/* SUBMIT */}
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

      {/* PROJECTS */}
      <section className="projects-section">

        <div className="projects-heading">

          <div>

            <span className="panel-kicker">
              YOUR WORK
            </span>

            <h2>
              Projects
              <span>
                {projects.length}
              </span>
            </h2>

          </div>

        </div>

        {loading ? (

          <div className="liquid-panel empty-state">
            <div className="loading-spinner" />
            <p>
              Loading projects...
            </p>
          </div>

        ) : projects.length === 0 ? (

          <div className="liquid-panel empty-state">

            <div className="empty-icon">
              ◇
            </div>

            <h3>
              No projects yet
            </h3>

            <p>
              Drop your first image or video above.
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
                    aspectRatio:
                      getAspectRatio(project),
                  }}
                >

                  {project.media_type ===
                    "image" && (

                    <img
                      src={project.media_url}
                      alt={project.title}
                    />

                  )}

                  {project.media_type ===
                    "video" && (

                    <video
                      src={project.media_url}
                      muted
                      loop
                      playsInline
                      controls
                    />

                  )}

                  {project.media_type ===
                    "website" && (

                    <iframe
                      src={project.media_url}
                      title={project.title}
                    />

                  )}

                  <div className="media-overlay" />

                  <div className="media-badge">
                    {getTypeLabel(
                      project.media_type
                    )}
                  </div>

                </div>

                <div className="project-info">

                  <div>

                    <h3>
                      {project.title}
                    </h3>

                    <p>
                      {project.width &&
                      project.height
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
                      className="small-liquid-button"
                    >
                      Open ↗
                    </a>

                    <button
                      type="button"
                      onClick={() =>
                        deleteProject(
                          project.id
                        )
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