import React, {
  useEffect,
  useRef,
  useState,
} from 'react';

import { createRoot } from 'react-dom/client';

import {
  motion,
  useScroll,
  useTransform,
  MotionValue,
} from 'framer-motion';

import {
  ArrowUpRight,
  Instagram,
  Youtube,
  Mail,
  MapPin,
  LogOut,
  Plus,
  Trash2,
  Edit3,
  Save,
  X,
  RefreshCw,
  ExternalLink,
  Image as ImageIcon,
  Video,
  Globe,
  Lock,
} from 'lucide-react';

import './index.css';

import { supabase } from './lib/supabase';

/* =========================================================
   TYPES
========================================================= */

type MediaType =
  | 'image'
  | 'video'
  | 'website';

type Project = {
  id: number;
  title: string | null;
  media_url: string | null;
  media_type: MediaType | string | null;
  destination_url: string | null;
  width?: number | null;
  height?: number | null;
  created_at?: string;
};

/* =========================================================
   ASSETS
========================================================= */

const heroVideo =
  '/assets/luffy-hero.mp4';

const heroPoster =
  '/assets/luffy-poster.jpg';

const galleryImages = [
  '/assets/gallery/discord.png',
  '/assets/gallery/youtube.png',
  '/assets/gallery/adobe.png',
  '/assets/gallery/instagram.png',
  '/assets/gallery/davinci.png',
  '/assets/gallery/after-effects.png',
];

const fallbackProjectImages = [
  '/assets/gallery/discord.png',
  '/assets/gallery/youtube.png',
  '/assets/gallery/adobe.png',
  '/assets/gallery/instagram.png',
  '/assets/gallery/davinci.png',
  '/assets/gallery/after-effects.png',
];

const projectTypes = [
  'VFX',
  'CAR EDIT',
  'CINEMATIC',
  'AMV',
  'MOTION GRAPHICS',
];

/* =========================================================
   HELPERS
========================================================= */

function isValidUrl(
  value: string | null | undefined,
) {
  if (!value) return false;

  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

function getFallbackImage(index: number) {
  return (
    fallbackProjectImages[
      index % fallbackProjectImages.length
    ]
  );
}

/* =========================================================
   FADE IN
========================================================= */

function FadeIn({
  children,
  delay = 0,
  duration = 0.7,
  x = 0,
  y = 30,
  className = '',
}: {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  x?: number;
  y?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{
        opacity: 0,
        x,
        y,
      }}
      whileInView={{
        opacity: 1,
        x: 0,
        y: 0,
      }}
      viewport={{
        once: true,
        margin: '-50px',
        amount: 0.1,
      }}
      transition={{
        delay,
        duration,
        ease: [
          0.25,
          0.1,
          0.25,
          1,
        ],
      }}
    >
      {children}
    </motion.div>
  );
}

/* =========================================================
   CONTACT BUTTON
========================================================= */

function ContactButton({
  href = 'mailto:funkvfx@gmail.com',
}: {
  href?: string;
}) {
  const isMail =
    href.startsWith('mailto:');

  return (
    <a
      href={href}
      target={
        isMail
          ? undefined
          : '_blank'
      }
      rel={
        isMail
          ? undefined
          : 'noreferrer'
      }
      className="contact-button"
    >
      <span>Contact Me</span>

      <ArrowUpRight
        size={17}
        strokeWidth={2.2}
      />
    </a>
  );
}

/* =========================================================
   MAGNETIC BUTTON
========================================================= */

function Magnet({
  children,
  padding = 120,
  strength = 4,
}: {
  children: React.ReactNode;
  padding?: number;
  strength?: number;
}) {
  const ref =
    useRef<HTMLDivElement>(null);

  const [style, setStyle] =
    useState<React.CSSProperties>({
      transform:
        'translate3d(0,0,0)',
      transition:
        'transform .5s ease',
    });

  useEffect(() => {
    const move = (
      event: MouseEvent,
    ) => {
      if (!ref.current) return;

      const rect =
        ref.current.getBoundingClientRect();

      const centerX =
        rect.left +
        rect.width / 2;

      const centerY =
        rect.top +
        rect.height / 2;

      const dx =
        event.clientX - centerX;

      const dy =
        event.clientY - centerY;

      const distance =
        Math.sqrt(
          dx * dx + dy * dy,
        );

      const maxDistance =
        Math.max(
          rect.width,
          rect.height,
        ) /
          2 +
        padding;

      if (
        distance <
        maxDistance
      ) {
        setStyle({
          transform: `translate3d(${
            dx / strength
          }px, ${
            dy / strength
          }px, 0)`,
          transition:
            'transform .15s ease-out',
        });
      } else {
        setStyle({
          transform:
            'translate3d(0,0,0)',
          transition:
            'transform .5s ease',
        });
      }
    };

    window.addEventListener(
      'mousemove',
      move,
      {
        passive: true,
      },
    );

    return () => {
      window.removeEventListener(
        'mousemove',
        move,
      );
    };
  }, [
    padding,
    strength,
  ]);

  return (
    <div
      ref={ref}
      style={{
        ...style,
        willChange:
          'transform',
      }}
    >
      {children}
    </div>
  );
}

/* =========================================================
   HERO
========================================================= */

function HeroSection() {
  return (
    <section
      id="home"
      className="hero-section"
    >
      <video
        className="hero-video"
        autoPlay
        muted
        loop
        playsInline
        poster={heroPoster}
        preload="metadata"
        aria-hidden="true"
      >
        <source
          src={heroVideo}
          type="video/mp4"
        />
      </video>

      <div className="hero-radial" />
      <div className="hero-gradient" />

      <FadeIn
        className="hero-nav-wrapper"
        y={-20}
      >
        <nav className="hero-nav">
          <a
            href="#about"
            className="nav-pill"
          >
            About
          </a>

          <a
            href="#services"
            className="nav-pill"
          >
            Services
          </a>

          <a
            href="#projects"
            className="nav-pill"
          >
            Projects
          </a>

          <a
            href="#contact"
            className="nav-pill"
          >
            Contact
          </a>
        </nav>
      </FadeIn>

      <div className="hero-title-wrapper">
        <motion.h1
          className="hero-heading hero-title"
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: {
              transition: {
                staggerChildren:
                  0.045,
                delayChildren:
                  0.18,
              },
            },
          }}
        >
          {'Hi, i’m funk'
            .split('')
            .map(
              (
                char,
                index,
              ) => (
                <motion.span
                  key={index}
                  className="hero-letter"
                  variants={{
                    hidden: {
                      opacity: 0,
                      y: '70%',
                      rotateX: -70,
                    },
                    show: {
                      opacity: 1,
                      y: 0,
                      rotateX: 0,
                      transition: {
                        duration:
                          0.55,
                        ease: [
                          0.22,
                          1,
                          0.36,
                          1,
                        ],
                      },
                    },
                  }}
                >
                  {char === ' '
                    ? '\u00A0'
                    : char}
                </motion.span>
              ),
            )}
        </motion.h1>
      </div>

      <div className="hero-bottom">
        <FadeIn
          delay={0.35}
          y={20}
        >
          <div className="hero-info">
            <p className="hero-name">
              KARAN GORAI
            </p>

            <p className="hero-description">
              VFX, car edits
              ( speed ramp ),
              cinematic cuts,
              AMV & motion
              graphics
            </p>

            <p className="hero-location">
              <MapPin size={14} />
              WEST BENGAL, INDIA
            </p>
          </div>
        </FadeIn>

        <FadeIn
          delay={0.5}
          y={20}
        >
          <Magnet>
            <ContactButton />
          </Magnet>
        </FadeIn>
      </div>
    </section>
  );
}

/* =========================================================
   MARQUEE
========================================================= */

function MarqueeRow({
  items,
}: {
  items: string[];
}) {
  const repeated = [
    ...items,
    ...items,
  ];

  return (
    <div className="marquee-mask">
      <div className="marquee-track">
        {repeated.map(
          (
            src,
            index,
          ) => (
            <div
              className="marquee-card"
              key={`${src}-${index}`}
            >
              <img
                src={src}
                alt="FUNK software"
                loading="lazy"
                className="marquee-logo"
              />
            </div>
          ),
        )}
      </div>
    </div>
  );
}

function MarqueeSection() {
  return (
    <section className="marquee-section">
      <FadeIn y={20}>
        <div className="marquee-heading">
          <span>
            TOOLS / PLATFORMS
          </span>

          <span>∞</span>
        </div>
      </FadeIn>

      <MarqueeRow
        items={galleryImages}
      />
    </section>
  );
}

/* =========================================================
   ABOUT
========================================================= */

const aboutText =
  "I’m Karan Gorai, the creator behind FUNK. I turn raw footage into high-energy visuals through VFX, car edits, cinematic storytelling, AMVs, and motion graphics. I care about rhythm, impact, clean compositing, and edits that stay in your head. Based in West Bengal, India — available for creative work worldwide.";

function AnimatedText({
  text,
}: {
  text: string;
}) {
  const ref =
    useRef<HTMLParagraphElement>(
      null,
    );

  const {
    scrollYProgress,
  } = useScroll({
    target: ref,
    offset: [
      'start 0.8',
      'end 0.2',
    ],
  });

  return (
    <p
      ref={ref}
      className="about-copy"
    >
      {text
        .split('')
        .map(
          (
            char,
            index,
          ) => (
            <Char
              key={index}
              char={char}
              index={index}
              total={
                text.length
              }
              progress={
                scrollYProgress
              }
            />
          ),
        )}
    </p>
  );
}

function Char({
  char,
  index,
  total,
  progress,
}: {
  char: string;
  index: number;
  total: number;
  progress: MotionValue<number>;
}) {
  const start =
    index / total;

  const end =
    (index + 1) / total;

  const opacity =
    useTransform(
      progress,
      [start, end],
      [0.18, 1],
    );

  const renderedChar =
    char === ' '
      ? '\u00A0'
      : char;

  return (
    <span className="char">
      <span className="char-placeholder">
        {renderedChar}
      </span>

      <motion.span
        style={{
          opacity,
        }}
        className="char-visible"
      >
        {renderedChar}
      </motion.span>
    </span>
  );
}

const tools = [
  {
    name: 'After Effects',
    src: '/assets/tools/ae.png',
  },
  {
    name: 'DaVinci Resolve Studio',
    src: '/assets/tools/davinci.png',
  },
];

function AboutSection() {
  return (
    <section
      id="about"
      className="about-section"
    >
      <div className="section-container">
        <FadeIn y={25}>
          <div className="section-heading-center">
            <p className="eyebrow">
              FUNK / KARAN GORAI
            </p>

            <h2 className="hero-heading section-title">
              ABOUT ME
            </h2>
          </div>
        </FadeIn>

        <AnimatedText
          text={aboutText}
        />

        <div className="tool-list">
          {tools.map(
            (tool) => (
              <div
                className="tool-pill"
                key={
                  tool.name
                }
              >
                <img
                  src={tool.src}
                  alt={
                    tool.name
                  }
                />

                <span>
                  {tool.name}
                </span>
              </div>
            ),
          )}
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   SERVICES
========================================================= */

const services = [
  [
    '01',
    'VFX / COMPOSITING',
    'Tracking, compositing, effects, screen replacements, cleanup, and detailed finishing for edits that need a cinematic push.',
  ],
  [
    '02',
    'CAR EDITS',
    'High-energy automotive edits with speed ramps, camera movement, sound sync, transitions, VFX, and aggressive visual styling.',
  ],
  [
    '03',
    'CINEMATIC EDITING',
    'Story-driven cuts, pacing, color, music sync, and atmosphere built around the emotion of the footage.',
  ],
  [
    '04',
    'AMV EDITING',
    'Fast, expressive anime music videos with beat-synced cuts, impact frames, effects, transitions, and custom motion.',
  ],
  [
    '05',
    'MOTION GRAPHICS',
    'Animated typography, titles, transitions, overlays, and motion systems that make content feel polished and alive.',
  ],
];

function ServicesSection() {
  return (
    <section
      id="services"
      className="services-section"
    >
      <FadeIn>
        <h2 className="services-title">
          SERVICES
        </h2>
      </FadeIn>

      <div className="services-list">
        {services.map(
          (
            [
              number,
              title,
              description,
            ],
            index,
          ) => (
            <FadeIn
              key={number}
              delay={
                index * 0.08
              }
            >
              <div className="service-row">
                <div className="service-number">
                  {number}
                </div>

                <div className="service-content">
                  <h3>
                    {title}
                  </h3>

                  <p>
                    {
                      description
                    }
                  </p>
                </div>
              </div>
            </FadeIn>
          ),
        )}
      </div>
    </section>
  );
}

/* =========================================================
   PROJECT CARD
========================================================= */

function ProjectCard({
  project,
  index,
}: {
  project: Project;
  index: number;
}) {
  const fallback =
    getFallbackImage(
      index,
    );

  const [
    imageSrc,
    setImageSrc,
  ] = useState(
    project.media_url ||
      fallback,
  );

  const mediaType =
    project.media_type ||
    'image';

  const destination =
    project.destination_url ||
    'https://www.instagram.com/funk.vfx/';

  const title =
    project.title ||
    projectTypes[
      index %
        projectTypes.length
    ];

  const handleError =
    () => {
      if (
        imageSrc !==
        fallback
      ) {
        setImageSrc(
          fallback,
        );
      }
    };

  return (
    <motion.a
      href={destination}
      target="_blank"
      rel="noreferrer"
      className="project-card"
      initial={{
        opacity: 0,
        y: 30,
      }}
      whileInView={{
        opacity: 1,
        y: 0,
      }}
      viewport={{
        once: true,
        amount: 0.1,
      }}
      transition={{
        delay:
          index * 0.04,
        duration: 0.6,
      }}
    >
      {mediaType ===
      'video' ? (
        <video
          src={
            project.media_url ||
            undefined
          }
          poster={fallback}
          muted
          loop
          autoPlay
          playsInline
          onError={() =>
            undefined
          }
        />
      ) : (
        <img
          src={imageSrc}
          onError={
            handleError
          }
          alt={
            project.title ||
            `FUNK project ${
              index + 1
            }`
          }
          loading="lazy"
        />
      )}

      <div className="project-overlay" />

      <div className="project-label">
        <span>
          FUNK / {title}
        </span>
      </div>

      {mediaType ===
        'website' && (
        <div
          style={{
            position:
              'absolute',
            right: '18px',
            top: '18px',
            zIndex: 5,
          }}
        >
          <ExternalLink
            size={18}
          />
        </div>
      )}
    </motion.a>
  );
}

/* =========================================================
   PROJECTS - SUPABASE
========================================================= */

function ProjectsSection() {
  const [
    projects,
    setProjects,
  ] = useState<Project[]>(
    [],
  );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState<string | null>(
    null,
  );

  useEffect(() => {
    let mounted = true;

    async function loadProjects() {
      try {
        setLoading(true);
        setError(null);

        const {
          data,
          error,
        } = await supabase
          .from('projects')
          .select(
            'id,title,media_url,media_type,destination_url,width,height,created_at',
          )
          .order(
            'id',
            {
              ascending: true,
            },
          );

        if (error) {
          throw error;
        }

        if (mounted) {
          setProjects(
            (data ||
              []) as Project[],
          );
        }
      } catch (err) {
        console.error(
          'Supabase projects error:',
          err,
        );

        if (mounted) {
          setError(
            'Unable to load projects from Supabase.',
          );
          setProjects([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadProjects();

    return () => {
      mounted = false;
    };
  }, []);

  /*
    If Supabase is empty or unavailable,
    keep the portfolio looking normal.
  */

  const displayProjects =
    projects.length > 0
      ? projects.slice(
          0,
          10,
        )
      : fallbackProjectImages.map(
          (
            image,
            index,
          ) => ({
            id:
              index + 1,
            title: null,
            media_url:
              image,
            media_type:
              'image',
            destination_url:
              'https://www.instagram.com/funk.vfx/',
          }),
        );

  return (
    <section
      id="projects"
      className="projects-section"
    >
      <div className="projects-header">
        <FadeIn>
          <div>
            <p className="eyebrow">
              SELECTED WORK
            </p>

            <h2 className="hero-heading projects-title">
              PROJECTS
            </h2>
          </div>
        </FadeIn>

        <FadeIn
          delay={0.15}
        >
          <a
            href="https://www.instagram.com/funk.vfx/"
            target="_blank"
            rel="noreferrer"
            className="instagram-button desktop-only"
          >
            MORE ON INSTAGRAM

            <ArrowUpRight
              size={15}
            />
          </a>
        </FadeIn>
      </div>

      {loading && (
        <div
          style={{
            padding:
              '40px 0',
            opacity: 0.6,
            textAlign:
              'center',
          }}
        >
          Loading projects...
        </div>
      )}

      {error && (
        <div
          style={{
            padding:
              '20px 0',
            opacity: 0.5,
            textAlign:
              'center',
            fontSize:
              '12px',
          }}
        >
          {error}
        </div>
      )}

      <div className="projects-grid">
        {displayProjects.map(
          (
            project,
            index,
          ) => (
            <ProjectCard
              key={
                project.id
              }
              project={
                project
              }
              index={
                index
              }
            />
          ),
        )}
      </div>

      <div className="mobile-instagram">
        <a
          href="https://www.instagram.com/funk.vfx/"
          target="_blank"
          rel="noreferrer"
          className="instagram-button"
        >
          MORE ON INSTAGRAM

          <ArrowUpRight
            size={15}
          />
        </a>
      </div>
    </section>
  );
}

/* =========================================================
   CONTACT
========================================================= */

function ContactSection() {
  return (
    <section
      id="contact"
      className="contact-section"
    >
      <p className="contact-eyebrow">
        AVAILABLE FOR FREELANCE &
        CREATIVE COLLABORATIONS
      </p>

      <div className="social-list">
        <a
          href="https://www.instagram.com/funk.vfx/"
          target="_blank"
          rel="noreferrer"
          className="social-link"
        >
          <Instagram
            size={18}
          />
          Instagram
        </a>

        <a
          href="https://www.youtube.com/@funk.vfx_yt"
          target="_blank"
          rel="noreferrer"
          className="social-link"
        >
          <Youtube
            size={18}
          />
          YouTube
        </a>

        <a
          href="mailto:funkvfx@gmail.com"
          className="social-link"
        >
          <Mail
            size={18}
          />
          Gmail
        </a>
      </div>

      <Magnet>
        <ContactButton />
      </Magnet>
    </section>
  );
}

/* =========================================================
   FOOTER
========================================================= */

function Footer() {
  return (
    <footer className="footer">
      <a
        href="https://www.instagram.com/_humble.y_/"
        target="_blank"
        rel="noreferrer"
      >
        BUILD BY HUMBLE ↗
      </a>

      <span>
        © HUMBLE & FUNK
      </span>
    </footer>
  );
}

/* =========================================================
   ADMIN STYLES
========================================================= */

const adminStyles: Record<
  string,
  React.CSSProperties
> = {
  page: {
    minHeight: '100vh',
    background: '#0c0c0c',
    color: '#d7e2ea',
    padding: '30px',
    fontFamily:
      "'Kanit', sans-serif",
  },

  container: {
    width: '100%',
    maxWidth: '1200px',
    margin: '0 auto',
  },

  card: {
    background:
      'rgba(255,255,255,.035)',
    border:
      '1px solid rgba(255,255,255,.1)',
    borderRadius: '22px',
    padding: '24px',
  },

  input: {
    width: '100%',
    background:
      'rgba(255,255,255,.05)',
    border:
      '1px solid rgba(255,255,255,.12)',
    color: '#fff',
    borderRadius: '12px',
    padding:
      '13px 14px',
    outline: 'none',
    fontFamily:
      "'Kanit', sans-serif",
  },

  button: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent:
      'center',
    gap: '8px',
    border: 0,
    borderRadius: '12px',
    padding:
      '11px 16px',
    cursor: 'pointer',
    fontFamily:
      "'Kanit', sans-serif",
    fontWeight: 600,
  },
};

/* =========================================================
   ADMIN LOGIN
========================================================= */

function AdminLogin({
  onLogin,
}: {
  onLogin: () => void;
}) {
  const [
    email,
    setEmail,
  ] = useState('');

  const [
    password,
    setPassword,
  ] = useState('');

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState('');

  async function handleLogin(
    event: React.FormEvent,
  ) {
    event.preventDefault();

    setLoading(true);
    setError('');

    const {
      error,
    } = await supabase.auth.signInWithPassword(
      {
        email,
        password,
      },
    );

    if (error) {
      setError(
        error.message,
      );
      setLoading(false);
      return;
    }

    setLoading(false);
    onLogin();
  }

  return (
    <div
      style={{
        ...adminStyles.page,
        display: 'flex',
        alignItems:
          'center',
        justifyContent:
          'center',
      }}
    >
      <form
        onSubmit={
          handleLogin
        }
        style={{
          ...adminStyles.card,
          width: '100%',
          maxWidth: '420px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems:
              'center',
            gap: '12px',
            marginBottom:
              '25px',
          }}
        >
          <Lock size={22} />

          <div>
            <h1
              style={{
                margin: 0,
                fontSize:
                  '28px',
              }}
            >
              FUNK ADMIN
            </h1>

            <p
              style={{
                margin:
                  '4px 0 0',
                opacity: 0.55,
                fontSize:
                  '13px',
              }}
            >
              Manage portfolio
              projects
            </p>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gap: '14px',
          }}
        >
          <input
            type="email"
            placeholder="Admin email"
            value={email}
            onChange={(event) =>
              setEmail(
                event.target
                  .value,
              )
            }
            style={
              adminStyles.input
            }
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={
              password
            }
            onChange={(event) =>
              setPassword(
                event.target
                  .value,
              )
            }
            style={
              adminStyles.input
            }
            required
          />

          {error && (
            <div
              style={{
                color:
                  '#ff6b6b',
                fontSize:
                  '13px',
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              ...adminStyles.button,
              background:
                '#fff',
              color:
                '#000',
              marginTop:
                '5px',
            }}
          >
            {loading
              ? 'Signing in...'
              : 'Sign in'}
          </button>

          <a
            href="/"
            style={{
              textAlign:
                'center',
              opacity: 0.5,
              fontSize:
                '13px',
            }}
          >
            ← Back to portfolio
          </a>
        </div>
      </form>
    </div>
  );
}

/* =========================================================
   ADMIN PROJECT FORM
========================================================= */

type ProjectForm = {
  title: string;
  media_url: string;
  media_type: MediaType;
  destination_url: string;
  width: string;
  height: string;
};

const emptyProjectForm: ProjectForm = {
  title: '',
  media_url: '',
  media_type: 'image',
  destination_url:
    'https://www.instagram.com/funk.vfx/',
  width: '',
  height: '',
};

function AdminProjectForm({
  editingProject,
  onSaved,
  onCancel,
}: {
  editingProject:
    | Project
    | null;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const [
    form,
    setForm,
  ] = useState<ProjectForm>(
    emptyProjectForm,
  );

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState('');

  useEffect(() => {
    if (
      editingProject
    ) {
      setForm({
        title:
          editingProject.title ||
          '',
        media_url:
          editingProject.media_url ||
          '',
        media_type:
          (editingProject.media_type as MediaType) ||
          'image',
        destination_url:
          editingProject.destination_url ||
          '',
        width:
          editingProject.width
            ? String(
                editingProject.width,
              )
            : '',
        height:
          editingProject.height
            ? String(
                editingProject.height,
              )
            : '',
      });
    } else {
      setForm(
        emptyProjectForm,
      );
    }

    setError('');
  }, [
    editingProject,
  ]);

  function updateField(
    field: keyof ProjectForm,
    value: string,
  ) {
    setForm(
      (current) => ({
        ...current,
        [field]: value,
      }),
    );
  }

  async function handleSubmit(
    event: React.FormEvent,
  ) {
    event.preventDefault();

    setSaving(true);
    setError('');

    try {
      const payload = {
        title:
          form.title.trim() ||
          null,

        media_url:
          form.media_url.trim() ||
          null,

        media_type:
          form.media_type,

        destination_url:
          form.destination_url.trim() ||
          null,

        width:
          form.width
            ? Number(
                form.width,
              )
            : null,

        height:
          form.height
            ? Number(
                form.height,
              )
            : null,
      };

      if (
        editingProject
      ) {
        const {
          error,
        } = await supabase
          .from('projects')
          .update(payload)
          .eq(
            'id',
            editingProject.id,
          );

        if (error) {
          throw error;
        }
      } else {
        const {
          error,
        } = await supabase
          .from('projects')
          .insert(
            payload,
          );

        if (error) {
          throw error;
        }
      }

      onSaved();
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : 'Failed to save project.',
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={
        handleSubmit
      }
      style={{
        ...adminStyles.card,
        marginBottom:
          '24px',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent:
            'space-between',
          alignItems:
            'center',
          marginBottom:
            '20px',
        }}
      >
        <h2
          style={{
            margin: 0,
          }}
        >
          {editingProject
            ? 'Edit Project'
            : 'Add Project'}
        </h2>

        {editingProject && (
          <button
            type="button"
            onClick={
              onCancel
            }
            style={{
              ...adminStyles.button,
              background:
                'rgba(255,255,255,.08)',
              color:
                '#fff',
            }}
          >
            <X size={16} />
            Cancel
          </button>
        )}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(auto-fit,minmax(240px,1fr))',
          gap: '14px',
        }}
      >
        <input
          placeholder="Project title"
          value={
            form.title
          }
          onChange={(event) =>
            updateField(
              'title',
              event.target
                .value,
            )
          }
          style={
            adminStyles.input
          }
        />

        <select
          value={
            form.media_type
          }
          onChange={(event) =>
            updateField(
              'media_type',
              event.target
                .value,
            )
          }
          style={
            adminStyles.input
          }
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

        <input
          placeholder="Media URL"
          value={
            form.media_url
          }
          onChange={(event) =>
            updateField(
              'media_url',
              event.target
                .value,
            )
          }
          style={
            adminStyles.input
          }
        />

        <input
          placeholder="Destination URL"
          value={
            form.destination_url
          }
          onChange={(event) =>
            updateField(
              'destination_url',
              event.target
                .value,
            )
          }
          style={
            adminStyles.input
          }
        />

        <input
          type="number"
          placeholder="Width"
          value={
            form.width
          }
          onChange={(event) =>
            updateField(
              'width',
              event.target
                .value,
            )
          }
          style={
            adminStyles.input
          }
        />

        <input
          type="number"
          placeholder="Height"
          value={
            form.height
          }
          onChange={(event) =>
            updateField(
              'height',
              event.target
                .value,
            )
          }
          style={
            adminStyles.input
          }
        />
      </div>

      {error && (
        <div
          style={{
            color:
              '#ff6b6b',
            marginTop:
              '15px',
            fontSize:
              '13px',
          }}
        >
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={saving}
        style={{
          ...adminStyles.button,
          background:
            '#fff',
          color:
            '#000',
          marginTop:
            '18px',
        }}
      >
        <Save size={16} />

        {saving
          ? 'Saving...'
          : editingProject
          ? 'Update Project'
          : 'Add Project'}
      </button>
    </form>
  );
}

/* =========================================================
   ADMIN DASHBOARD
========================================================= */

function AdminDashboard() {
  const [
    projects,
    setProjects,
  ] = useState<Project[]>(
    [],
  );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState('');

  const [
    editingProject,
    setEditingProject,
  ] = useState<
    Project | null
  >(null);

  async function loadProjects() {
    setLoading(true);
    setError('');

    const {
      data,
      error,
    } = await supabase
      .from('projects')
      .select(
        'id,title,media_url,media_type,destination_url,width,height,created_at',
      )
      .order(
        'id',
        {
          ascending: true,
        },
      );

    if (error) {
      setError(
        error.message,
      );
      setProjects([]);
    } else {
      setProjects(
        (data ||
          []) as Project[],
      );
    }

    setLoading(false);
  }

  useEffect(() => {
    loadProjects();
  }, []);

  async function deleteProject(
    id: number,
  ) {
    const confirmed =
      window.confirm(
        'Delete this project?',
      );

    if (!confirmed) return;

    const {
      error,
    } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);

    if (error) {
      alert(
        error.message,
      );
      return;
    }

    await loadProjects();
  }

  async function logout() {
    await supabase.auth.signOut();

    window.location.href =
      '/admin';
  }

  return (
    <div
      style={
        adminStyles.page
      }
    >
      <div
        style={
          adminStyles.container
        }
      >
        {/* HEADER */}

        <header
          style={{
            display: 'flex',
            justifyContent:
              'space-between',
            alignItems:
              'center',
            gap: '15px',
            marginBottom:
              '30px',
            flexWrap:
              'wrap',
          }}
        >
          <div>
            <p
              style={{
                margin: 0,
                opacity: 0.5,
                fontSize:
                  '12px',
                letterSpacing:
                  '.18em',
              }}
            >
              FUNK / ADMIN
            </p>

            <h1
              style={{
                margin:
                  '4px 0 0',
                fontSize:
                  '42px',
                lineHeight: 1,
              }}
            >
              PROJECTS
            </h1>
          </div>

          <div
            style={{
              display:
                'flex',
              gap: '10px',
              flexWrap:
                'wrap',
            }}
          >
            <a
              href="/"
              style={{
                ...adminStyles.button,
                background:
                  'rgba(255,255,255,.08)',
                color:
                  '#fff',
              }}
            >
              <ExternalLink
                size={16}
              />
              View site
            </a>

            <button
              onClick={
                loadProjects
              }
              style={{
                ...adminStyles.button,
                background:
                  'rgba(255,255,255,.08)',
                color:
                  '#fff',
              }}
            >
              <RefreshCw
                size={16}
              />
              Refresh
            </button>

            <button
              onClick={
                logout
              }
              style={{
                ...adminStyles.button,
                background:
                  '#fff',
                color:
                  '#000',
              }}
            >
              <LogOut
                size={16}
              />
              Logout
            </button>
          </div>
        </header>

        {/* FORM */}

        <AdminProjectForm
          editingProject={
            editingProject
          }
          onSaved={() => {
            setEditingProject(
              null,
            );
            loadProjects();
          }}
          onCancel={() =>
            setEditingProject(
              null,
            )
          }
        />

        {/* STATUS */}

        {loading && (
          <div
            style={{
              ...adminStyles.card,
              marginBottom:
                '20px',
              textAlign:
                'center',
            }}
          >
            Loading projects...
          </div>
        )}

        {error && (
          <div
            style={{
              ...adminStyles.card,
              marginBottom:
                '20px',
              color:
                '#ff6b6b',
            }}
          >
            {error}
          </div>
        )}

        {/* PROJECT LIST */}

        <div
          style={{
            display:
              'grid',
            gap: '14px',
          }}
        >
          {projects.length ===
            0 &&
            !loading && (
              <div
                style={{
                  ...adminStyles.card,
                  textAlign:
                    'center',
                  padding:
                    '50px 20px',
                }}
              >
                <ImageIcon
                  size={40}
                  style={{
                    opacity:
                      0.4,
                    marginBottom:
                      '12px',
                  }}
                />

                <h3>
                  No projects
                  yet
                </h3>

                <p
                  style={{
                    opacity:
                      0.5,
                  }}
                >
                  Add your first
                  project above.
                </p>
              </div>
            )}

          {projects.map(
            (
              project,
              index,
            ) => {
              const preview =
                project.media_url ||
                getFallbackImage(
                  index,
                );

              return (
                <div
                  key={
                    project.id
                  }
                  style={{
                    ...adminStyles.card,
                    display:
                      'grid',
                    gridTemplateColumns:
                      '140px 1fr auto',
                    gap:
                      '20px',
                    alignItems:
                      'center',
                  }}
                >
                  {/* PREVIEW */}

                  <div
                    style={{
                      height:
                        '90px',
                      borderRadius:
                        '12px',
                      overflow:
                        'hidden',
                      background:
                        '#111',
                    }}
                  >
                    {project.media_type ===
                    'video' ? (
                      <video
                        src={
                          project.media_url ||
                          undefined
                        }
                        muted
                        playsInline
                        style={{
                          width:
                            '100%',
                          height:
                            '100%',
                          objectFit:
                            'cover',
                        }}
                      />
                    ) : (
                      <img
                        src={
                          preview
                        }
                        alt=""
                        onError={(
                          event,
                        ) => {
                          event.currentTarget.src =
                            getFallbackImage(
                              index,
                            );
                        }}
                        style={{
                          width:
                            '100%',
                          height:
                            '100%',
                          objectFit:
                            'cover',
                        }}
                      />
                    )}
                  </div>

                  {/* INFO */}

                  <div
                    style={{
                      minWidth:
                        0,
                    }}
                  >
                    <h3
                      style={{
                        margin:
                          '0 0 5px',
                        fontSize:
                          '19px',
                      }}
                    >
                      {project.title ||
                        'Untitled Project'}
                    </h3>

                    <p
                      style={{
                        margin:
                          '0 0 5px',
                        opacity:
                          0.5,
                        fontSize:
                          '12px',
                        wordBreak:
                          'break-all',
                      }}
                    >
                      {project.media_url ||
                        'No media URL'}
                    </p>

                    <div
                      style={{
                        display:
                          'flex',
                        gap:
                          '8px',
                        flexWrap:
                          'wrap',
                      }}
                    >
                      <span
                        style={{
                          padding:
                            '4px 8px',
                          border:
                            '1px solid rgba(255,255,255,.12)',
                          borderRadius:
                            '999px',
                          fontSize:
                            '11px',
                        }}
                      >
                        {project.media_type ||
                          'image'}
                      </span>

                      {project.width &&
                        project.height && (
                          <span
                            style={{
                              padding:
                                '4px 8px',
                              border:
                                '1px solid rgba(255,255,255,.12)',
                              borderRadius:
                                '999px',
                              fontSize:
                                '11px',
                            }}
                          >
                            {
                              project.width
                            }{' '}
                            ×{' '}
                            {
                              project.height
                            }
                          </span>
                        )}
                    </div>
                  </div>

                  {/* ACTIONS */}

                  <div
                    style={{
                      display:
                        'flex',
                      gap:
                        '8px',
                    }}
                  >
                    <button
                      onClick={() =>
                        setEditingProject(
                          project,
                        )
                      }
                      style={{
                        ...adminStyles.button,
                        background:
                          'rgba(255,255,255,.08)',
                        color:
                          '#fff',
                      }}
                    >
                      <Edit3
                        size={
                          16
                        }
                      />
                    </button>

                    <button
                      onClick={() =>
                        deleteProject(
                          project.id,
                        )
                      }
                      style={{
                        ...adminStyles.button,
                        background:
                          'rgba(255,50,50,.12)',
                        color:
                          '#ff7777',
                      }}
                    >
                      <Trash2
                        size={
                          16
                        }
                      />
                    </button>
                  </div>
                </div>
              );
            },
          )}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   ADMIN ROUTER
========================================================= */

function AdminApp() {
  const [
    session,
    setSession,
  ] = useState<
    any | null
  >(null);

  const [
    checking,
    setChecking,
  ] = useState(true);

  useEffect(() => {
    supabase.auth
      .getSession()
      .then(
        ({
          data,
        }) => {
          setSession(
            data.session,
          );
          setChecking(false);
        },
      );

    const {
      data: listener,
    } =
      supabase.auth.onAuthStateChange(
        (
          _event,
          session,
        ) => {
          setSession(
            session,
          );
        },
      );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  if (checking) {
    return (
      <div
        style={{
          ...adminStyles.page,
          display:
            'flex',
          alignItems:
            'center',
          justifyContent:
            'center',
        }}
      >
        Loading admin...
      </div>
    );
  }

  if (!session) {
    return (
      <AdminLogin
        onLogin={() =>
          window.location.reload()
        }
      />
    );
  }

  return (
    <AdminDashboard />
  );
}

/* =========================================================
   PUBLIC APP
========================================================= */

function PublicApp() {
  return (
    <main className="app">
      <HeroSection />

      <MarqueeSection />

      <AboutSection />

      <ServicesSection />

      <ProjectsSection />

      <ContactSection />

      <Footer />
    </main>
  );
}

/* =========================================================
   APP ROUTER
========================================================= */

function App() {
  const isAdmin =
    window.location.pathname ===
      '/admin' ||
    window.location.pathname.startsWith(
      '/admin/',
    );

  if (isAdmin) {
    return <AdminApp />;
  }

  return <PublicApp />;
}

/* =========================================================
   MOUNT
========================================================= */

const rootElement =
  document.getElementById(
    'root',
  );

if (!rootElement) {
  throw new Error(
    'FUNK portfolio: #root element was not found.',
  );
}

createRoot(
  rootElement,
).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);