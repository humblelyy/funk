import { useEffect, useRef, useState } from "react";
import {
  Upload,
  Image as ImageIcon,
  Video,
  Globe,
  Link as LinkIcon,
  Trash2,
  ExternalLink,
  RefreshCw,
  LogOut,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Loader2,
  Sparkles,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import "./admin.css";

type MediaType = "image" | "video" | "website";

type Project = {
  id: string;
  title: string;
  type: MediaType;
  media_url: string | null;
  project_url: string | null;
  width: number | null;
  height: number | null;
  created_at?: string;
};

type MediaInfo = {
  file: File | null;
  type: MediaType;
  width: number | null;
  height: number | null;
  preview: string | null;
  name: string;
};

const BUCKET_NAME = "project-media";

export default function Admin() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dragging, setDragging] = useState(false);

  const [title, setTitle] = useState("");
  const [projectUrl, setProjectUrl] = useState("");

  const [media, setMedia] = useState<MediaInfo>({
    file: null,
    type: "website",
    width: null,
    height: null,
    preview: null,
    name: "",
  });

  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    const { data } = await supabase.auth.getSession();

    if (!data.session) {
      window.location.href = "/admin";
      return;
    }

    loadProjects();
  }

  async function loadProjects() {
    setLoadingProjects(true);

    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      showMessage("error", error.message);
    } else {
      setProjects(data || []);
    }

    setLoadingProjects(false);
  }

  function showMessage(type: "success" | "error", text: string) {
    setMessage({ type, text });

    setTimeout(() => {
      setMessage(null);
    }, 5000);
  }

  function detectMediaType(file: File): "image" | "video" | null {
    if (file.type.startsWith("image/")) {
      return "image";
    }

    if (file.type.startsWith("video/")) {
      return "video";
    }

    return null;
  }

  async function getMediaDimensions(
    file: File,
    type: "image" | "video"
  ): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const objectUrl = URL.createObjectURL(file);

      if (type === "image") {
        const img = new Image();

        img.onload = () => {
          URL.revokeObjectURL(objectUrl);

          resolve({
            width: img.naturalWidth,
            height: img.naturalHeight,
          });
        };

        img.onerror = () => {
          URL.revokeObjectURL(objectUrl);
          reject(new Error("Could not read image dimensions."));
        };

        img.src = objectUrl;
      } else {
        const video = document.createElement("video");

        video.preload = "metadata";

        video.onloadedmetadata = () => {
          URL.revokeObjectURL(objectUrl);

          resolve({
            width: video.videoWidth,
            height: video.videoHeight,
          });
        };

        video.onerror = () => {
          URL.revokeObjectURL(objectUrl);
          reject(new Error("Could not read video dimensions."));
        };

        video.src = objectUrl;
      }
    });
  }

  async function handleFile(file: File) {
    setMessage(null);

    const type = detectMediaType(file);

    if (!type) {
      showMessage(
        "error",
        "Only image and video files are supported."
      );
      return;
    }

    try {
      const dimensions = await getMediaDimensions(file, type);
      const preview = URL.createObjectURL(file);

      setMedia({
        file,
        type,
        width: dimensions.width,
        height: dimensions.height,
        preview,
        name: file.name,
      });
    } catch (error) {
      console.error(error);

      showMessage(
        "error",
        "Could not read the selected media."
      );
    }
  }

  function handleFileInput(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (file) {
      handleFile(file);
    }
  }

  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);

    const file = event.dataTransfer.files?.[0];

    if (file) {
      handleFile(file);
    }
  }

  function removeMedia() {
    if (media.preview) {
      URL.revokeObjectURL(media.preview);
    }

    setMedia({
      file: null,
      type: "website",
      width: null,
      height: null,
      preview: null,
      name: "",
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function getAspectRatio() {
    if (!media.width || !media.height) {
      return null;
    }

    const gcd = (a: number, b: number): number => {
      return b === 0 ? a : gcd(b, a % b);
    };

    const divisor = gcd(media.width, media.height);

    return `${media.width / divisor}:${media.height / divisor}`;
  }

  async function uploadMedia(): Promise<string | null> {
    if (!media.file) {
      return null;
    }

    const file = media.file;

    const extension =
      file.name.split(".").pop()?.toLowerCase() || "bin";

    const safeTitle =
      title
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "") || "project";

    const uniqueName = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 9)}`;

    const filePath = `${safeTitle}/${uniqueName}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      });

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    return data.publicUrl;
  }

  async function addProject() {
    setMessage(null);

    if (!title.trim()) {
      showMessage("error", "Enter a project name.");
      return;
    }

    if (!media.file && !projectUrl.trim()) {
      showMessage(
        "error",
        "Upload an image/video or enter a website URL."
      );
      return;
    }

    if (projectUrl.trim()) {
      try {
        new URL(projectUrl.trim());
      } catch {
        showMessage(
          "error",
          "Enter a valid URL starting with https://"
        );
        return;
      }
    }

    setSaving(true);

    try {
      let mediaUrl: string | null = null;

      if (media.file) {
        mediaUrl = await uploadMedia();
      }

      const finalType: MediaType = media.file
        ? media.type
        : "website";

      const { error } = await supabase.from("projects").insert({
        title: title.trim(),
        type: finalType,
        media_url: mediaUrl,
        project_url: projectUrl.trim() || null,
        width: media.width,
        height: media.height,
      });

      if (error) {
        throw error;
      }

      showMessage(
        "success",
        "Project added successfully."
      );

      setTitle("");
      setProjectUrl("");
      removeMedia();

      await loadProjects();
    } catch (error: any) {
      console.error(error);

      showMessage(
        "error",
        error?.message || "Failed to save project."
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteProject(project: Project) {
    const confirmed = window.confirm(
      `Delete "${project.title}"?`
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("projects")
      .delete()
      .eq("id", project.id);

    if (error) {
      showMessage("error", error.message);
      return;
    }

    showMessage(
      "success",
      "Project deleted."
    );

    loadProjects();
  }

  async function logout() {
    await supabase.auth.signOut();
    window.location.href = "/admin";
  }

  function renderProjectMedia(project: Project) {
    if (!project.media_url) {
      return (
        <div className="project-media-placeholder">
          <Globe size={30} />
        </div>
      );
    }

    if (project.type === "video") {
      return (
        <video
          src={project.media_url}
          muted
          playsInline
          preload="metadata"
          className="project-media"
        />
      );
    }

    return (
      <img
        src={project.media_url}
        alt={project.title}
        className="project-media"
      />
    );
  }

  return (
    <main className="admin-page">
      <div className="admin-background" />

      <header className="admin-header">
        <div>
          <div className="admin-kicker">
            FUNK / ADMIN
          </div>

          <h1>PROJECTS</h1>
        </div>

        <div className="admin-actions">
          <button
            className="glass-button"
            onClick={() => {
              window.location.href = "/";
            }}
          >
            <ArrowLeft size={17} />
            View site
          </button>

          <button
            className="glass-button"
            onClick={loadProjects}
          >
            <RefreshCw size={17} />
            Refresh
          </button>

          <button
            className="glass-button logout-button"
            onClick={logout}
          >
            <LogOut size={17} />
            Logout
          </button>
        </div>
      </header>

      {message && (
        <div
          className={`admin-message ${
            message.type === "success"
              ? "message-success"
              : "message-error"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 size={18} />
          ) : (
            <XCircle size={18} />
          )}

          <span>{message.text}</span>
        </div>
      )}

      <section className="glass-card add-project-card">
        <div className="section-heading">
          <div>
            <div className="heading-icon">
              <Sparkles size={20} />
            </div>

            <h2>Add Project</h2>

            <p>
              Upload media or add a website. Everything else is
              detected automatically.
            </p>
          </div>
        </div>

        <div className="form-grid">
          <div className="field field-full">
            <label>Project name</label>

            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Cinematic AMV"
            />
          </div>

          <div className="field field-full">
            <label>Project URL</label>

            <div className="input-with-icon">
              <LinkIcon size={17} />

              <input
                value={projectUrl}
                onChange={(e) =>
                  setProjectUrl(e.target.value)
                }
                placeholder="https://instagram.com/funk.vfx/"
              />
            </div>

            <small>
              This is the URL opened when someone clicks the
              project.
            </small>
          </div>

          <div className="field field-full">
            <label>Media</label>

            {!media.file ? (
              <div
                className={`dropzone ${
                  dragging ? "dropzone-active" : ""
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
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*"
                  hidden
                  onChange={handleFileInput}
                />

                <div className="drop-icon">
                  <Upload size={25} />
                </div>

                <strong>
                  Drag & drop your media here
                </strong>

                <span>
                  or click to browse
                </span>

                <div className="supported-types">
                  <span>
                    <ImageIcon size={14} />
                    Image
                  </span>

                  <span>
                    <Video size={14} />
                    Video
                  </span>
                </div>
              </div>
            ) : (
              <div className="media-preview-card">
                <div className="media-preview">
                  {media.type === "video" ? (
                    <video
                      src={media.preview || ""}
                      controls
                      muted
                      playsInline
                    />
                  ) : (
                    <img
                      src={media.preview || ""}
                      alt="Preview"
                    />
                  )}
                </div>

                <div className="media-info">
                  <div className="media-type">
                    {media.type === "video" ? (
                      <Video size={15} />
                    ) : (
                      <ImageIcon size={15} />
                    )}

                    {media.type.toUpperCase()}
                  </div>

                  <strong>{media.name}</strong>

                  <div className="media-meta">
                    {media.width} × {media.height}
                    <span>•</span>
                    {getAspectRatio()}
                  </div>
                </div>

                <button
                  className="remove-media"
                  onClick={removeMedia}
                  type="button"
                  title="Remove media"
                >
                  <Trash2 size={17} />
                </button>
              </div>
            )}
          </div>

          <div className="auto-detect-grid">
            <div className="auto-box">
              <span>TYPE</span>

              <strong>
                {media.file ? (
                  media.type === "video" ? (
                    <>
                      <Video size={16} />
                      Video
                    </>
                  ) : (
                    <>
                      <ImageIcon size={16} />
                      Image
                    </>
                  )
                ) : (
                  <>
                    <Globe size={16} />
                    Website
                  </>
                )}
              </strong>
            </div>

            <div className="auto-box">
              <span>WIDTH</span>

              <strong>
                {media.width
                  ? `${media.width}px`
                  : "AUTO"}
              </strong>
            </div>

            <div className="auto-box">
              <span>HEIGHT</span>

              <strong>
                {media.height
                  ? `${media.height}px`
                  : "AUTO"}
              </strong>
            </div>

            <div className="auto-box">
              <span>RATIO</span>

              <strong>
                {getAspectRatio() || "AUTO"}
              </strong>
            </div>
          </div>
        </div>

        <button
          className="add-project-button"
          onClick={addProject}
          disabled={saving}
        >
          {saving ? (
            <>
              <Loader2
                size={18}
                className="spin"
              />
              Uploading...
            </>
          ) : (
            <>
              <Upload size={18} />
              Add Project
            </>
          )}
        </button>
      </section>

      <section className="projects-section">
        <div className="projects-heading">
          <div>
            <span>YOUR WORK</span>
            <h2>PROJECTS</h2>
          </div>

          <div className="project-count">
            {projects.length}{" "}
            {projects.length === 1
              ? "project"
              : "projects"}
          </div>
        </div>

        {loadingProjects ? (
          <div className="glass-card empty-state">
            <Loader2
              size={25}
              className="spin"
            />
            <span>Loading projects...</span>
          </div>
        ) : projects.length === 0 ? (
          <div className="glass-card empty-state">
            <Sparkles size={30} />
            <h3>No projects yet</h3>
            <p>
              Add your first project above.
            </p>
          </div>
        ) : (
          <div className="projects-grid">
            {projects.map((project) => (
              <article
                className="project-card"
                key={project.id}
              >
                <div className="project-image-wrapper">
                  {renderProjectMedia(project)}

                  <div className="project-overlay">
                    <span className="type-badge">
                      {project.type === "video" && (
                        <Video size={14} />
                      )}

                      {project.type === "image" && (
                        <ImageIcon size={14} />
                      )}

                      {project.type === "website" && (
                        <Globe size={14} />
                      )}

                      {project.type}
                    </span>

                    {project.project_url && (
                      <a
                        href={project.project_url}
                        target="_blank"
                        rel="noreferrer"
                        className="open-project"
                      >
                        <ExternalLink size={16} />
                      </a>
                    )}
                  </div>
                </div>

                <div className="project-details">
                  <div>
                    <h3>{project.title}</h3>

                    {project.width &&
                      project.height && (
                        <span>
                          {project.width} ×{" "}
                          {project.height}
                        </span>
                      )}
                  </div>

                  <button
                    className="delete-button"
                    onClick={() =>
                      deleteProject(project)
                    }
                    title="Delete project"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}