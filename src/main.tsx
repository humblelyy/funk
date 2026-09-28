import React, { useEffect, useRef, useState } from 'react';
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
} from 'framer-motion';
import {
  ArrowUpRight,
  Instagram,
  Youtube,
  Mail,
  MapPin,
  Play,
} from 'lucide-react';
import './index.css';

const heroVideo = '/assets/luffy-hero.mp4';
const heroPoster = '/assets/luffy-poster.jpg';

/* =========================================================
   PROJECT GALLERY
   ========================================================= */

const projectGalleryImages = [
  '/assets/gallery/discord.png',
  '/assets/gallery/youtube.png',
  '/assets/gallery/adobe.png',
  '/assets/gallery/instagram.png',
  '/assets/gallery/davinci.png',
  '/assets/gallery/after-effects.png',
];

/* =========================================================
   HELPERS
   ========================================================= */

function FadeIn({
  children,
  delay = 0,
  duration = 0.7,
  className = '',
}: {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 35 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{
        duration,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </motion.div>
  );
}

function ContactButton({
  href = '#contact',
  children = 'CONTACT ME',
}: {
  href?: string;
  children?: React.ReactNode;
}) {
  return (
    <a
      href={href}
      className="group inline-flex items-center gap-2 rounded-full border border-white/80 bg-gradient-to-r from-[#b600a8] via-[#8b00c9] to-[#e34b36] px-8 py-4 text-sm font-semibold tracking-[0.08em] text-white shadow-[0_0_20px_rgba(182,0,168,.5)] transition-all duration-300 hover:scale-[1.04] hover:shadow-[0_0_35px_rgba(182,0,168,.75)]"
    >
      {children}
      <ArrowUpRight
        size={17}
        className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
      />
    </a>
  );
}

function Magnetic({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const handleMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();

    const x = event.clientX - rect.left - rect.width / 2;
    const y = event.clientY - rect.top - rect.height / 2;

    ref.current.style.transform = `translate(${x * 0.08}px, ${
      y * 0.08
    }px)`;
  };

  const handleLeave = () => {
    if (!ref.current) return;

    ref.current.style.transform = 'translate(0px, 0px)';
  };

  return (
    <div
      ref={ref}
      className={className}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{
        transition: 'transform .25s cubic-bezier(.22,1,.36,1)',
      }}
    >
      {children}
    </div>
  );
}

/* =========================================================
   NAVIGATION
   ========================================================= */

function Navigation() {
  return (
    <div className="fixed left-1/2 top-5 z-50 w-[calc(100%-40px)] max-w-[770px] -translate-x-1/2">
      <nav className="flex items-center justify-center gap-1 rounded-full border border-white/10 bg-[#071019]/75 px-3 py-2 backdrop-blur-xl">
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
    </div>
  );
}

/* =========================================================
   HERO
   ========================================================= */

function Hero() {
  return (
    <section
      id="home"
      className="relative min-h-screen overflow-hidden rounded-b-[55px] bg-[#071019]"
    >
      <div className="absolute inset-0">
        <video
          className="h-full w-full object-cover"
          src={heroVideo}
          poster={heroPoster}
          autoPlay
          muted
          loop
          playsInline
        />

        <div className="absolute inset-0 bg-black/35" />

        <div className="absolute inset-0 bg-gradient-to-b from-[#071019]/20 via-transparent to-[#071019]" />
      </div>

      <Navigation />

      <div className="relative z-10 flex min-h-screen flex-col justify-end px-5 pb-12 pt-32 md:px-10 md:pb-14">
        <FadeIn>
          <h1 className="hero-heading max-w-[1000px] text-[clamp(4.5rem,14vw,12rem)] font-black leading-[0.78] tracking-[-0.07em]">
            HI, I&apos;M FUNK
          </h1>
        </FadeIn>

        <div className="mt-14 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <FadeIn delay={0.15}>
            <div className="max-w-[420px]">
              <h2 className="mb-3 text-lg font-semibold tracking-wide text-white">
                KARAN GORAI
              </h2>

              <p className="text-sm uppercase leading-6 tracking-[0.08em] text-[#D7E2EA]/85">
                VFX, CAR EDITS (SPEED RAMP), CINEMATIC
                <br />
                CUTS, AMV &amp; MOTION GRAPHICS
              </p>

              <div className="mt-4 flex items-center gap-2 text-xs uppercase tracking-[0.12em] text-[#D7E2EA]/70">
                <MapPin size={14} />
                WEST BENGAL, INDIA
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={0.25}>
            <ContactButton href="#contact">
              CONTACT ME
            </ContactButton>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   ABOUT
   ========================================================= */

function AboutSection() {
  return (
    <section
      id="about"
      className="relative bg-[#0C0C0C] px-5 py-28 md:px-10 md:py-40"
    >
      <div className="mx-auto max-w-7xl">
        <FadeIn>
          <p className="mb-5 text-xs uppercase tracking-[0.3em] text-[#7394ab]">
            01 / ABOUT
          </p>
        </FadeIn>

        <div className="grid gap-12 md:grid-cols-[.7fr_1.3fr] md:items-end">
          <FadeIn>
            <h2 className="hero-heading text-[clamp(4rem,10vw,9rem)] font-black leading-[.8] tracking-[-0.06em]">
              WHO
              <br />
              AM I?
            </h2>
          </FadeIn>

          <FadeIn delay={0.15}>
            <div className="about-copy max-w-2xl text-lg leading-8 text-[#D7E2EA]/70 md:text-xl">
              <p>
                I&apos;m Karan — a creative editor and visual artist focused
                on VFX, speed ramps, cinematic edits, AMVs and motion
                graphics.
              </p>

              <p className="mt-6">
                I like turning raw footage into visuals that feel energetic,
                cinematic and memorable.
              </p>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   SERVICES
   ========================================================= */

const services = [
  {
    number: '01',
    title: 'VIDEO EDITING',
    description:
      'Fast-paced edits, cinematic cuts, storytelling and polished social media content.',
  },
  {
    number: '02',
    title: 'VFX',
    description:
      'Visual effects, compositing, tracking, effects and cinematic enhancement.',
  },
  {
    number: '03',
    title: 'SPEED RAMP',
    description:
      'Dynamic speed ramps, transitions and beat-synced automotive edits.',
  },
  {
    number: '04',
    title: 'AMV',
    description:
      'Anime music videos with rhythm-based editing, effects and motion.',
  },
  {
    number: '05',
    title: 'MOTION GRAPHICS',
    description:
      'Animated typography, titles, transitions, overlays, and motion systems that make content feel polished and alive.',
  },
];

function ServicesSection() {
  return (
    <section
      id="services"
      className="relative rounded-t-[55px] bg-[#F4F4F2] px-5 py-28 text-[#080808] md:px-10 md:py-40"
    >
      <div className="mx-auto max-w-7xl">
        <FadeIn>
          <p className="mb-5 text-xs uppercase tracking-[0.3em] text-black/45">
            02 / SERVICES
          </p>
        </FadeIn>

        <FadeIn delay={0.05}>
          <h2 className="mb-20 text-[clamp(4rem,10vw,9rem)] font-black leading-[.8] tracking-[-0.06em]">
            WHAT
            <br />
            I DO
          </h2>
        </FadeIn>

        <div className="space-y-0">
          {services.map((service, index) => (
            <FadeIn key={service.number} delay={index * 0.04}>
              <div className="grid border-t border-black/15 py-8 md:grid-cols-[100px_1fr_1fr] md:items-start md:gap-8">
                <span className="text-5xl font-black tracking-[-0.06em] md:text-7xl">
                  {service.number}
                </span>

                <h3 className="mt-3 text-2xl font-bold tracking-tight md:text-4xl">
                  {service.title}
                </h3>

                <p className="mt-3 max-w-md text-sm leading-6 text-black/55 md:text-base">
                  {service.description}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   PROJECT MARQUEE
   ========================================================= */

function MarqueeRow({
  items,
}: {
  items: string[];
}) {
  const duplicated = [...items, ...items];

  return (
    <div className="marquee-mask">
      <div className="marquee-track">
        {duplicated.map((image, index) => (
          <div className="marquee-card" key={`${image}-${index}`}>
            <img
              src={image}
              alt=""
              className="marquee-logo"
              loading="lazy"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

/* =========================================================
   PROJECTS
   ========================================================= */

function ProjectsSection() {
  const [selectedProject, setSelectedProject] = useState<number | null>(
    null
  );

  return (
    <section
      id="projects"
      className="relative overflow-hidden rounded-t-[55px] bg-[#0C0C0C] px-5 py-28 md:px-10 md:py-40"
    >
      <div className="mx-auto max-w-7xl">
        <FadeIn>
          <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="mb-5 text-xs uppercase tracking-[0.3em] text-[#7394ab]">
                SELECTED WORK
              </p>

              <h2 className="hero-heading text-[clamp(4rem,10vw,9rem)] font-black leading-[.8] tracking-[-0.06em]">
                PROJECTS
              </h2>
            </div>

            <a
              href="https://www.instagram.com/funkvfx/"
              target="_blank"
              rel="noreferrer"
              className="group inline-flex w-fit items-center gap-3 rounded-full border border-[#D7E2EA]/80 px-6 py-4 text-xs font-semibold uppercase tracking-[0.08em] text-[#D7E2EA] transition-all duration-300 hover:bg-white hover:text-black"
            >
              MORE ON INSTAGRAM
              <ArrowUpRight
                size={16}
                className="transition-transform group-hover:-translate-y-1 group-hover:translate-x-1"
              />
            </a>
          </div>
        </FadeIn>

        <div className="mt-24">
          <MarqueeRow items={projectGalleryImages} />
        </div>

        <div className="mt-4">
          <MarqueeRow
            items={[...projectGalleryImages].reverse()}
          />
        </div>

        <div className="mt-24 flex justify-center">
          <p className="text-center text-xs uppercase tracking-[0.3em] text-[#7394ab]">
            CREATIVE WORK / VFX / EDITING / MOTION
          </p>
        </div>
      </div>

      {selectedProject !== null && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-5 backdrop-blur-md"
          onClick={() => setSelectedProject(null)}
        >
          <div
            className="max-w-3xl rounded-3xl border border-white/10 bg-[#121212] p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedProject(null)}
              className="mb-8 rounded-full border border-white/20 px-4 py-2 text-xs uppercase tracking-widest text-white"
            >
              CLOSE
            </button>

            <img
              src={projectGalleryImages[selectedProject]}
              alt=""
              className="max-h-[70vh] w-full rounded-2xl object-contain"
            />
          </div>
        </div>
      )}
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
      className="relative bg-[#0C0C0C] px-5 pb-10 pt-24 md:px-10"
    >
      <div className="mx-auto max-w-7xl">
        <FadeIn>
          <div className="text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-[#7394ab]">
              AVAILABLE FOR FREELANCE &amp; CREATIVE COLLABORATIONS
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <a
                href="https://www.instagram.com/funkvfx/"
                target="_blank"
                rel="noreferrer"
                className="social-link"
              >
                <Instagram size={16} />
                INSTAGRAM
              </a>

              <a
                href="https://www.youtube.com/"
                target="_blank"
                rel="noreferrer"
                className="social-link"
              >
                <Youtube size={16} />
                YOUTUBE
              </a>

              <a
                href="mailto:contact@funkvfx.com"
                className="social-link"
              >
                <Mail size={16} />
                GMAIL
              </a>
            </div>

            <div className="mt-8 flex justify-center">
              <ContactButton href="mailto:contact@funkvfx.com">
                CONTACT ME
              </ContactButton>
            </div>
          </div>
        </FadeIn>

        <footer className="mt-24 flex flex-col gap-4 border-t border-white/10 py-6 text-[10px] uppercase tracking-[0.15em] text-[#D7E2EA]/60 md:flex-row md:items-center md:justify-between">
          <span>BUILD BY HUMBLE ↗</span>
          <span>© HUMBLE &amp; FUNK</span>
        </footer>
      </div>
    </section>
  );
}

/* =========================================================
   APP
   ========================================================= */

export default function App() {
  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'smooth';

    return () => {
      document.documentElement.style.scrollBehavior = '';
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#0C0C0C]">
      <main>
        <Hero />
        <AboutSection />
        <ServicesSection />
        <ProjectsSection />
        <ContactSection />
      </main>
    </div>
  );
}