import { useEffect, useRef, useState } from "react";
import {
  Upload,
  Image as ImageIcon,
  Video,
  Globe,
  Link2,
  Trash2,
  ExternalLink,
  RefreshCw,
  LogOut,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Loader2,
  Sparkles,
  Maximize2,
  Scan,
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

const EMPTY_MEDIA: MediaInfo = {
  file: null,
  type: "website",
  width: null,
  height: null,
  preview: null,
  name: "",
};

export default function Admin() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dragging, setDragging] = useState(false);

  const [title, setTitle] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");

  const [media, setMedia] = useState<MediaInfo>(EMPTY_MEDIA);

  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      window.location.href = "/admin";
      return;
    }

    await loadProjects();
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
      setProjects((data || []) as Project[]);
    }

    setLoadingProjects(false);
  }

  function showMessage(
    type: "success" | "error",
    text: string
  ) {
    setMessage({ type, text });

    window.setTimeout(() => {
      setMessage(null);
    }, 5000);
  }

  function detectMediaType(
    file: File
  ): "image" | "video" | null {
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
        const image = new Image();

        image.onload = () => {
          URL.revokeObjectURL(objectUrl);

          resolve({
            width: image.naturalWidth,
            height: image.naturalHeight,
          });
        };

        image.onerror = () => {
          URL.revokeObjectURL(objectUrl);
          reject(
            new Error("Could not read image dimensions.")
          );
        };

        image.src = objectUrl;
        return;
      }

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
        reject(
          new Error("Could not read video dimensions.")
        );
      };

      video.src = objectUrl;
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
      const dimensions = await getMediaDimensions(
        file,
        type
      );

      if (media.preview) {
        URL.revokeObjectURL(media.preview);
      }

      const preview = URL.createObjectURL(file);

      setMedia({
        file,
        type,
        width: dimensions.width,
        height: dimensions.height,
        preview,
        name: file.name,
      });

      /*
       * The uploaded file becomes the project URL after
       * upload. For now we keep the external URL empty.
       */
      setWebsiteUrl("");
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
      void handleFile(file);
    }
  }

  function handleDragEnter(
    event: React.DragEvent<HTMLDivElement>
  ) {
    event.preventDefault();
    event.stopPropagation();
    setDragging(true);
  }

  function handleDragOver(
    event: React.DragEvent<HTMLDivElement>
  ) {
    event.preventDefault();
    event.stopPropagation();
    setDragging(true);
  }

  function handleDragLeave(
    event: React.DragEvent<HTMLDivElement>
  ) {
    event.preventDefault();
    event.stopPropagation();

    if (
      event.currentTarget === event.target
    ) {
      setDragging(false);
    }
  }

  function handleDrop(
    event: React.DragEvent<HTMLDivElement>
  ) {
    event.preventDefault();
    event.stopPropagation();

    setDragging(false);

    const file = event.dataTransfer.files?.[0];

    if (file) {
      void handleFile(file);
    }
  }

  function removeMedia() {
    if (media.preview) {
      URL.revokeObjectURL(media.preview);
    }

    setMedia(EMPTY_MEDIA);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function getAspectRatio(
    width: number | null = media.width,
    height: number | null = media.height
  ) {
    if (!width || !height) {
      return "—";
    }

    function gcd(a: number, b: number): number {
      return b === 0 ? a : gcd(b, a % b);
    }

    const divisor = gcd(width, height);

    return `${width / divisor}:${height / divisor}`;
  }

  function detectWebsite(url: string): boolean {
    if (!url.trim()) return false;

    try {
      const parsed = new URL(url.trim());

      return (
        parsed.protocol === "http:" ||
        parsed.protocol === "https:"
      );
    } catch {
      return false;
    }
  }

  async function uploadMedia(): Promise<string> {
    if (!media.file) {
      throw new Error("No media selected.");
    }

    const file = media.file;

    const extension =
      file.name.split(".").pop()?.toLowerCase() || "bin";

    const safeTitle =
      title
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "") || "project";

    const uniqueName =
      `${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 9)}`;

    const filePath =
      `${safeTitle}/${uniqueName}.${extension}`;

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      });

    if (error) {
      throw error;
    }

    const { data } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    if (!data.publicUrl) {
      throw new Error(
        "Could not create public media URL."
      );
    }

    return data.publicUrl;
  }

  async function addProject() {
    setMessage(null);

    if (!title.trim()) {
      showMessage(
        "error",
        "Enter a project name."
      );
      return;
    }

    if (!media.file && !websiteUrl.trim()) {
      showMessage(
        "error",
        "Drop an image/video or enter a website URL."
      );
      return;
    }

    if (websiteUrl.trim()) {
      if (!detectWebsite(websiteUrl)) {
        showMessage(
          "error",
          "Enter a valid website URL starting with https://"
        );
        return;
      }
    }

    setSaving(true);

    try {
      let mediaUrl: string | null = null;
      let projectUrl: string | null = null;
      let finalType: MediaType = "website";

      if (media.file) {
        /*
         * Upload image/video to Supabase.
         */
        mediaUrl = await uploadMedia();

        /*
         * The project card opens the uploaded media.
         */
        projectUrl = mediaUrl;

        finalType = media.type;
      } else {
        /*
         * Website project.
         */
        projectUrl = websiteUrl.trim();
        mediaUrl = null;
        finalType = "website";
      }

      const { error } = await supabase
        .from("projects")
        .insert({
          title: title.trim(),
          type: finalType,
          media_url: mediaUrl,
          project_url: projectUrl,
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
      setWebsiteUrl("");
      removeMedia();

      await loadProjects();
    } catch (error: any) {
      console.error(error);

      showMessage(
        "error",
        error?.message ||
          "Failed to save project."
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteProject(
    project: Project
  ) {
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

    await loadProjects();
  }

  async function logout() {
    await supabase.auth.signOut();
    window.location.href = "/admin";
  }

  function renderProjectMedia(
    project: Project
  ) {
    if (!project.media_url) {
      return (
        <div className="project-media-placeholder">
          <Globe size={34} />
          <span>WEBSITE</span>
        </div>
      );
    }

    if (project.type === "video") {
      return (
        <video
          src={project.media_url}
          muted
          loop
          playsInline
          autoPlay
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

  const currentType: MediaType =
    media.file
      ? media.type
      : websiteUrl.trim()
        ? "website"
        : "website";

  return (
    <main className="admin-page">
      <div className="liquid-orb orb-one" />
      <div className="liquid-orb orb-two" />
      <div className="liquid-orb orb-three" />

      <div className="admin-noise" />

      <header className="admin-header">
        <div>
          <div className="admin-kicker">
            FUNK / ADMIN
          </div>

          <h1>PROJECTS</h1>

          <p className="admin-subtitle">
            Manage your creative work
          </p>
        </div>

        <div className="admin-actions">
          <button
            className="liquid-button"
            onClick={() => {
              window.location.href = "/";
            }}
          >
            <ArrowLeft size={16} />
            View site
          </button>

          <button
            className="liquid-button"
            onClick={() => {
              void loadProjects();
            }}
          >
            <RefreshCw size={16} />
            Refresh
          </button>

          <button
            className="liquid-button logout-button"
            onClick={logout}
          >
            <LogOut size={16} />
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

      <section className="liquid-card add-project-card">
        <div className="card-glow" />

        <div className="section-heading">
          <div>
            <div className="heading-top">
              <div className="heading-icon">
                <Sparkles size={19} />
              </div>

              <span className="auto-badge">
                <Scan size={13} />
                AUTO DETECTION
              </span>
            </div>

            <h2>Add Project</h2>

            <p>
              Drop your media and everything else
              is detected automatically.
            </p>
          </div>
        </div>

        <div className="project-form">
          <div className="field">
            <label>Project name</label>

            <input
              value={title}
              onChange={(event) =>
                setTitle(event.target.value)
              }
              placeholder="e.g. One Piece AMV"
            />
          </div>

          <div className="field">
            <label>
              Website URL
              <span>optional</span>
            </label>

            <div className="input-glass">
              <Link2 size={17} />

              <input
                value={websiteUrl}
                onChange={(event) =>
                  setWebsiteUrl(event.target.value)
                }
                placeholder="https://example.com"
              />
            </div>

            <small>
              Leave empty when uploading an image
              or video.
            </small>
          </div>

          <div className="upload-section">
            <label>Media</label>

            {!media.file ? (
              <div
                className={`liquid-dropzone ${
                  dragging
                    ? "liquid-dropzone-active"
                    : ""
                }`}
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
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

                <div className="drop-liquid-icon">
                  <Upload size={26} />
                </div>

                <strong>
                  {dragging
                    ? "Drop it here"
                    : "Drag & drop your media"}
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

                  <span>
                    <Scan size={14} />
                    Auto detect
                  </span>
                </div>
              </div>
            ) : (
              <div className="selected-media">
                <div className="selected-preview">
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
                      alt="Selected media"
                    />
                  )}
                </div>

                <div className="selected-info">
                  <div className="detected-pill">
                    {media.type === "video" ? (
                      <Video size={14} />
                    ) : (
                      <ImageIcon size={14} />
                    )}

                    {media.type}
                  </div>

                  <strong>
                    {media.name}
                  </strong>

                  <span>
                    {media.width} × {media.height}
                  </span>

                  <span>
                    Ratio:{" "}
                    {getAspectRatio()}
                  </span>
                </div>

                <button
                  className="remove-media"
                  type="button"
                  onClick={removeMedia}
                >
                  <Trash2 size={17} />
                </button>
              </div>
            )}
          </div>

          <div className="detected-grid">
            <div className="detected-box">
              <span>TYPE</span>

              <strong>
                {currentType === "video" && (
                  <Video size={16} />
                )}

                {currentType === "image" && (
                  <ImageIcon size={16} />
                )}

                {currentType === "website" && (
                  <Globe size={16} />
                )}

                {currentType.toUpperCase()}
              </strong>
            </div>

            <div className="detected-box">
              <span>WIDTH</span>

              <strong>
                {media.width
                  ? `${media.width}px`
                  : "AUTO"}
              </strong>
            </div>

            <div className="detected-box">
              <span>HEIGHT</span>

              <strong>
                {media.height
                  ? `${media.height}px`
                  : "AUTO"}
              </strong>
            </div>

            <div className="detected-box">
              <span>ASPECT RATIO</span>

              <strong>
                {getAspectRatio()}
              </strong>
            </div>
          </div>

          {media.file && (
            <div className="upload-note">
              <Maximize2 size={15} />
              Dimensions and aspect ratio detected
              automatically from the original file.
            </div>
          )}

          {!media.file &&
            websiteUrl.trim() && (
              <div className="website-detected">
                <Globe size={16} />
                Website detected automatically
              </div>
            )}

          <button
            className="add-project-button"
            type="button"
            onClick={() => {
              void addProject();
            }}
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
        </div>
      </section>

      <section className="projects-section">
        <div className="projects-heading">
          <div>
            <span>YOUR WORK</span>

            <h2>
              PROJECTS
              <small>
                {projects.length}
              </small>
            </h2>
          </div>
        </div>

        {loadingProjects ? (
          <div className="liquid-card empty-state">
            <Loader2
              size={27}
              className="spin"
            />

            <span>
              Loading projects...
            </span>
          </div>
        ) : projects.length === 0 ? (
          <div className="liquid-card empty-state">
            <Sparkles size={34} />

            <h3>No projects yet</h3>

            <p>
              Drop your first image or video
              above.
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
                        <Video size={13} />
                      )}

                      {project.type === "image" && (
                        <ImageIcon size={13} />
                      )}

                      {project.type === "website" && (
                        <Globe size={13} />
                      )}

                      {project.type}
                    </span>

                    {project.project_url && (
                      <a
                        href={project.project_url}
                        target="_blank"
                        rel="noreferrer"
                        className="open-project"
                        title="Open project"
                      >
                        <ExternalLink size={15} />
                      </a>
                    )}
                  </div>
                </div>

                <div className="project-details">
                  <div>
                    <h3>
                      {project.title}
                    </h3>

                    {project.width &&
                      project.height && (
                        <span>
                          {project.width} ×{" "}
                          {project.height}
                          {" • "}
                          {getAspectRatio(
                            project.width,
                            project.height
                          )}
                        </span>
                      )}
                  </div>

                  <button
                    className="delete-button"
                    type="button"
                    onClick={() => {
                      void deleteProject(
                        project
                      );
                    }}
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