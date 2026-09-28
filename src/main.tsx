import React, { useEffect, useRef, useState } from 'react';
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
} from 'lucide-react';

import './index.css';

/* =========================================================
   ASSETS
========================================================= */

const heroVideo = '/assets/luffy-hero.mp4';
const heroPoster = '/assets/luffy-poster.jpg';

const galleryImages = [
  '/assets/gallery/discord.png',
  '/assets/gallery/youtube.png',
  '/assets/gallery/adobe.png',
  '/assets/gallery/instagram.png',
  '/assets/gallery/davinci.png',
  '/assets/gallery/after-effects.png',
];

/*
  Repeat the real gallery images instead of using no-img.webp.
*/
const projectImages = [
  '/assets/gallery/discord.png',
  '/assets/gallery/youtube.png',
  '/assets/gallery/adobe.png',
  '/assets/gallery/instagram.png',
  '/assets/gallery/davinci.png',
  '/assets/gallery/after-effects.png',
  '/assets/gallery/discord.png',
  '/assets/gallery/youtube.png',
  '/assets/gallery/adobe.png',
  '/assets/gallery/instagram.png',
];

const projectTypes = [
  'VFX',
  'CAR EDIT',
  'CINEMATIC',
  'AMV',
  'MOTION GRAPHICS',
];

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
        ease: [0.25, 0.1, 0.25, 1],
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
  const isMail = href.startsWith('mailto:');

  return (
    <a
      href={href}
      target={isMail ? undefined : '_blank'}
      rel={isMail ? undefined : 'noreferrer'}
      className="contact-button"
    >
      <span>Contact Me</span>
      <ArrowUpRight size={17} strokeWidth={2.2} />
    </a>
  );
}

/* =========================================================
   MAGNETIC WRAPPER
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
  const ref = useRef<HTMLDivElement>(null);

  const [style, setStyle] = useState<React.CSSProperties>({
    transform: 'translate3d(0,0,0)',
    transition: 'transform .5s ease',
  });

  useEffect(() => {
    const move = (event: MouseEvent) => {
      if (!ref.current) return;

      const rect = ref.current.getBoundingClientRect();

      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const dx = event.clientX - centerX;
      const dy = event.clientY - centerY;

      const distance = Math.sqrt(dx * dx + dy * dy);

      const maxDistance =
        Math.max(rect.width, rect.height) / 2 + padding;

      if (distance < maxDistance) {
        setStyle({
          transform: `translate3d(${dx / strength}px, ${
            dy / strength
          }px, 0)`,
          transition: 'transform .15s ease-out',
        });
      } else {
        setStyle({
          transform: 'translate3d(0,0,0)',
          transition: 'transform .5s ease',
        });
      }
    };

    window.addEventListener('mousemove', move, {
      passive: true,
    });

    return () => {
      window.removeEventListener('mousemove', move);
    };
  }, [padding, strength]);

  return (
    <div
      ref={ref}
      style={{
        ...style,
        willChange: 'transform',
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
    <section id="home" className="hero-section">

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
        <source src={heroVideo} type="video/mp4" />
      </video>

      <div className="hero-radial" />
      <div className="hero-gradient" />

      {/* NAVIGATION */}

      <FadeIn
        className="hero-nav-wrapper"
        y={-20}
      >
        <nav className="hero-nav">

          <a href="#about" className="nav-pill">
            About
          </a>

          <a href="#services" className="nav-pill">
            Services
          </a>

          <a href="#projects" className="nav-pill">
            Projects
          </a>

          <a href="#contact" className="nav-pill">
            Contact
          </a>

        </nav>
      </FadeIn>

      {/* BIG TITLE */}

      <div className="hero-title-wrapper">

        <motion.h1
          className="hero-heading hero-title"
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: {
              transition: {
                staggerChildren: 0.045,
                delayChildren: 0.18,
              },
            },
          }}
        >
          {'Hi, i’m funk'.split('').map((char, index) => (
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
                    duration: 0.55,
                    ease: [0.22, 1, 0.36, 1],
                  },
                },
              }}
            >
              {char === ' ' ? '\u00A0' : char}
            </motion.span>
          ))}
        </motion.h1>

      </div>

      {/* HERO BOTTOM */}

      <div className="hero-bottom">

        <FadeIn delay={0.35} y={20}>

          <div className="hero-info">

            <p className="hero-name">
              KARAN GORAI
            </p>

            <p className="hero-description">
              VFX, car edits ( speed ramp ),
              cinematic cuts, AMV & motion graphics
            </p>

            <p className="hero-location">
              <MapPin size={14} />
              WEST BENGAL, INDIA
            </p>

          </div>

        </FadeIn>

        <FadeIn delay={0.5} y={20}>

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
  const repeated = [...items, ...items];

  return (
    <div className="marquee-mask">

      <div className="marquee-track">

        {repeated.map((src, index) => (
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
        ))}

      </div>

    </div>
  );
}

function MarqueeSection() {
  return (
    <section className="marquee-section">

      <FadeIn y={20}>

        <div className="marquee-heading">
          <span>TOOLS / PLATFORMS</span>
          <span>∞</span>
        </div>

      </FadeIn>

      <MarqueeRow items={galleryImages} />

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
  const ref = useRef<HTMLParagraphElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 0.8', 'end 0.2'],
  });

  return (
    <p
      ref={ref}
      className="about-copy"
    >
      {text.split('').map((char, index) => (
        <Char
          key={index}
          char={char}
          index={index}
          total={text.length}
          progress={scrollYProgress}
        />
      ))}
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
  const start = index / total;
  const end = (index + 1) / total;

  const opacity = useTransform(
    progress,
    [start, end],
    [0.18, 1]
  );

  const renderedChar =
    char === ' ' ? '\u00A0' : char;

  return (
    <span className="char">
      <span className="char-placeholder">
        {renderedChar}
      </span>

      <motion.span
        style={{ opacity }}
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

        <AnimatedText text={aboutText} />

        <div className="tool-list">

          {tools.map((tool) => (
            <div
              className="tool-pill"
              key={tool.name}
            >
              <img
                src={tool.src}
                alt={tool.name}
              />

              <span>
                {tool.name}
              </span>
            </div>
          ))}

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
          ([number, title, description], index) => (
            <FadeIn
              key={number}
              delay={index * 0.08}
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
                    {description}
                  </p>

                </div>

              </div>

            </FadeIn>
          )
        )}

      </div>

    </section>
  );
}

/* =========================================================
   PROJECT CARD
========================================================= */

function ProjectCard({
  src,
  index,
}: {
  src: string;
  index: number;
}) {
  const [imageSrc, setImageSrc] = useState(src);

  const handleError = () => {
    if (imageSrc !== '/assets/no-img.webp') {
      setImageSrc('/assets/no-img.webp');
    }
  };

  return (
    <motion.a
      href="https://www.instagram.com/funk.vfx/"
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
        delay: index * 0.04,
        duration: 0.6,
      }}
    >

      <img
        src={imageSrc}
        onError={handleError}
        alt={`FUNK project ${index + 1}`}
        loading="lazy"
      />

      <div className="project-overlay" />

      <div className="project-label">

        <span>
          FUNK / {projectTypes[index % projectTypes.length]}
        </span>

      </div>

    </motion.a>
  );
}

/* =========================================================
   PROJECTS
========================================================= */

function ProjectsSection() {
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

        <FadeIn delay={0.15}>

          <a
            href="https://www.instagram.com/funk.vfx/"
            target="_blank"
            rel="noreferrer"
            className="instagram-button desktop-only"
          >
            MORE ON INSTAGRAM
            <ArrowUpRight size={15} />
          </a>

        </FadeIn>

      </div>

      <div className="projects-grid">

        {projectImages.map((src, index) => (
          <ProjectCard
            key={`${src}-${index}`}
            src={src}
            index={index}
          />
        ))}

      </div>

      <div className="mobile-instagram">

        <a
          href="https://www.instagram.com/funk.vfx/"
          target="_blank"
          rel="noreferrer"
          className="instagram-button"
        >
          MORE ON INSTAGRAM
          <ArrowUpRight size={15} />
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
        AVAILABLE FOR FREELANCE & CREATIVE COLLABORATIONS
      </p>

      <div className="social-list">

        <a
          href="https://www.instagram.com/funk.vfx/"
          target="_blank"
          rel="noreferrer"
          className="social-link"
        >
          <Instagram size={18} />
          Instagram
        </a>

        <a
          href="https://www.youtube.com/@funk.vfx_yt"
          target="_blank"
          rel="noreferrer"
          className="social-link"
        >
          <Youtube size={18} />
          YouTube
        </a>

        <a
          href="mailto:funkvfx@gmail.com"
          className="social-link"
        >
          <Mail size={18} />
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
   APP
========================================================= */

function App() {
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
   MOUNT
========================================================= */

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error(
    'FUNK portfolio: #root element was not found.'
  );
}

createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);