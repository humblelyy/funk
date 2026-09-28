import React, { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  ArrowUpRight,
  Instagram,
  Youtube,
  Mail,
  MapPin,
} from 'lucide-react';

import './index.css';
import { supabase } from './lib/supabase';

/* -------------------------------------------------------
   ASSETS
------------------------------------------------------- */

const heroVideo = '/assets/luffy-hero.mp4';
const heroPoster = '/assets/luffy-poster.jpg';

const projectGalleryImages = [
  '/assets/gallery/discord.png',
  '/assets/gallery/youtube.png',
  '/assets/gallery/adobe.png',
  '/assets/gallery/instagram.png',
  '/assets/gallery/davinci.png',
  '/assets/gallery/after-effects.png',
];

/* -------------------------------------------------------
   TYPES
------------------------------------------------------- */

type Project = {
  id?: number;
  title?: string;
  media_url?: string;
  media_type?: string;
  destination_url?: string;
};

/* -------------------------------------------------------
   SMALL COMPONENTS
------------------------------------------------------- */

function FadeIn({
  children,
  delay = 0,
  className = '',
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 35 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{
        duration: 0.7,
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
      className="group inline-flex items-center gap-3 rounded-full border border-white/80 bg-gradient-to-r from-[#b600a8] via-[#8c00c9] to-[#e65a35] px-8 py-4 text-sm font-semibold tracking-[0.08em] text-white shadow-[0_0_18px_rgba(182,0,168,.65)] transition-all duration-300 hover:scale-[1.04] hover:shadow-[0_0_30px_rgba(182,0,168,.9)]"
    >
      {children}
      <ArrowUpRight
        size={17}
        className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
      />
    </a>
  );
}

function Magnet({
  children,
}: {
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const move = (event: MouseEvent) => {
      const rect = element.getBoundingClientRect();

      const x =
        (event.clientX - (rect.left + rect.width / 2)) * 0.08;

      const y =
        (event.clientY - (rect.top + rect.height / 2)) * 0.08;

      element.style.transform = `translate(${x}px, ${y}px)`;
    };

    const leave = () => {
      element.style.transform = 'translate(0, 0)';
    };

    element.addEventListener('mousemove', move);
    element.addEventListener('mouseleave', leave);

    return () => {
      element.removeEventListener('mousemove', move);
      element.removeEventListener('mouseleave', leave);
    };
  }, []);

  return <div ref={ref}>{children}</div>;
}

/* -------------------------------------------------------
   NAVIGATION
------------------------------------------------------- */

function Navigation() {
  return (
    <nav className="fixed left-1/2 top-5 z-50 w-[calc(100%-40px)] max-w-[770px] -translate-x-1/2">
      <div className="flex items-center justify-center gap-2 rounded-full border border-white/15 bg-[#101417]/75 px-3 py-2 backdrop-blur-xl">
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
      </div>
    </nav>
  );
}

/* -------------------------------------------------------
   HERO
------------------------------------------------------- */

function Hero() {
  return (
    <section className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0">
        <video
          className="h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          poster={heroPoster}
        >
          <source src={heroVideo} type="video/mp4" />
        </video>

        <div className="absolute inset-0 bg-black/35" />

        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-[#0c0c0c]" />
      </div>

      <Navigation />

      <div className="relative z-10 flex min-h-screen flex-col justify-between px-6 pb-10 pt-32 md:px-10">
        <div className="overflow-hidden">
          <motion.h1
            className="hero-heading whitespace-nowrap text-[17vw] font-black uppercase leading-[.72] tracking-[-.08em]"
            initial={{ opacity: 0, y: 80 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 1,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            HI, I’M FUNK
          </motion.h1>
        </div>

        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <FadeIn delay={0.3}>
            <div className="max-w-[430px]">
              <p className="mb-2 text-sm font-semibold uppercase tracking-[0.12em] text-white">
                KARAN GORAI
              </p>

              <p className="text-sm uppercase leading-6 tracking-[0.08em] text-[#d7e2ea]/85">
                VFX, CAR EDITS (SPEED RAMP), CINEMATIC
                <br />
                CUTS, AMV & MOTION GRAPHICS
              </p>

              <div className="mt-4 flex items-center gap-2 text-xs uppercase tracking-[0.12em] text-[#d7e2ea]/65">
                <MapPin size={14} />
                WEST BENGAL, INDIA
              </div>
            </div>
          </FadeIn>

          <Magnet>
            <ContactButton href="#contact" />
          </Magnet>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------
   ABOUT
------------------------------------------------------- */

function AboutSection() {
  return (
    <section
      id="about"
      className="relative overflow-hidden bg-[#0c0c0c] px-6 py-28 md:px-10 md:py-40"
    >
      <div className="mx-auto grid max-w-[1200px] gap-16 md:grid-cols-[.35fr_1fr]">
        <FadeIn>
          <p className="text-xs uppercase tracking-[0.3em] text-[#7892a5]">
            01 / ABOUT
          </p>
        </FadeIn>

        <FadeIn delay={0.1}>
          <h2 className="hero-heading max-w-[950px] text-5xl font-black uppercase leading-[.9] tracking-[-.05em] md:text-8xl">
            VISUALS
            <br />
            THAT MOVE.
          </h2>

          <p className="about-copy mt-10 max-w-[700px] text-lg leading-8 text-[#9eabb4] md:text-xl">
            I’m Karan Gorai — a video editor and motion graphics
            artist focused on cinematic edits, VFX, speed ramps,
            AMVs and creative visual storytelling.
          </p>
        </FadeIn>
      </div>
    </section>
  );
}

/* -------------------------------------------------------
   SERVICES
------------------------------------------------------- */

const services = [
  {
    number: '01',
    title: 'VIDEO EDITING',
    text: 'Fast-paced edits, cinematic cuts, reels, AMVs and social content designed to keep attention.',
  },
  {
    number: '02',
    title: 'VFX & SPEED RAMP',
    text: 'Impactful speed ramps, transitions, effects and visual enhancement for high-energy edits.',
  },
  {
    number: '03',
    title: 'CINEMATIC CUTS',
    text: 'Mood, rhythm, sound design and storytelling combined into polished cinematic sequences.',
  },
  {
    number: '04',
    title: 'AMV',
    text: 'Anime music videos with aggressive timing, motion design, effects and beat-driven animation.',
  },
  {
    number: '05',
    title: 'MOTION GRAPHICS',
    text: 'Animated typography, titles, transitions, overlays and motion systems that make content feel polished and alive.',
  },
];

function ServicesSection() {
  return (
    <section
      id="services"
      className="relative overflow-hidden bg-white px-6 py-28 text-black md:px-10 md:py-36"
    >
      <div className="mx-auto max-w-[1200px]">
        <FadeIn>
          <p className="text-xs uppercase tracking-[0.3em] text-black/45">
            02 / SERVICES
          </p>

          <h2 className="mt-6 text-6xl font-black uppercase leading-[.8] tracking-[-.06em] md:text-[9vw]">
            SERVICES
          </h2>
        </FadeIn>

        <div className="mt-20">
          {services.map((service, index) => (
            <FadeIn key={service.number} delay={index * 0.04}>
              <div className="grid border-t border-black/15 py-8 md:grid-cols-[120px_1fr_1fr] md:items-start md:gap-10">
                <span className="text-5xl font-black tracking-[-.06em]">
                  {service.number}
                </span>

                <h3 className="mt-3 text-3xl font-bold uppercase md:mt-0 md:text-5xl">
                  {service.title}
                </h3>

                <p className="mt-5 max-w-[520px] text-base leading-7 text-black/55 md:mt-0 md:text-lg">
                  {service.text}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------
   PROJECT CARD
------------------------------------------------------- */

function ProjectCard({
  image,
  index,
}: {
  image: string;
  index: number;
}) {
  return (
    <motion.a
      href="#contact"
      className="project-tile group relative block overflow-hidden rounded-[28px] bg-[#171717]"
      initial={{ opacity: 0, y: 35 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{
        duration: 0.6,
        delay: (index % 5) * 0.05,
      }}
      whileHover={{ y: -8 }}
    >
      <div className="absolute inset-0 flex items-center justify-center p-8">
        <img
          src={image}
          alt={`FUNK project ${index + 1}`}
          className="h-full w-full object-contain transition duration-500 group-hover:scale-110"
          onError={(event) => {
            event.currentTarget.src = '/assets/no-img.webp';
          }}
        />
      </div>

      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/80 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between opacity-0 transition-all duration-300 group-hover:opacity-100">
        <span className="text-xs font-semibold uppercase tracking-[0.15em] text-white">
          FUNK / VFX
        </span>

        <ArrowUpRight
          size={18}
          className="text-white"
        />
      </div>
    </motion.a>
  );
}

/* -------------------------------------------------------
   PROJECTS
------------------------------------------------------- */

function ProjectsSection() {
  const repeatedImages = Array.from(
    { length: 10 },
    (_, index) =>
      projectGalleryImages[index % projectGalleryImages.length]
  );

  return (
    <section
      id="projects"
      className="relative z-10 -mt-8 overflow-hidden rounded-t-[55px] bg-[#0c0c0c] px-6 py-28 md:px-10 md:py-36"
    >
      <div className="mx-auto max-w-[1200px]">
        <FadeIn>
          <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-[#7892a5]">
                SELECTED WORK
              </p>

              <h2 className="hero-heading mt-6 text-6xl font-black uppercase leading-[.8] tracking-[-.06em] md:text-[7vw]">
                PROJECTS
              </h2>
            </div>

            <a
              href="https://www.instagram.com/funkvfx/"
              target="_blank"
              rel="noreferrer"
              className="group inline-flex w-fit items-center gap-3 rounded-full border border-[#d7e2ea] px-6 py-4 text-xs font-semibold uppercase tracking-[0.08em] text-[#d7e2ea] transition-all duration-300 hover:bg-white hover:text-black"
            >
              MORE ON INSTAGRAM

              <ArrowUpRight
                size={16}
                className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
              />
            </a>
          </div>
        </FadeIn>

        <div className="projects-row mt-20 grid grid-cols-5 gap-3 md:gap-4">
          {repeatedImages.map((image, index) => (
            <ProjectCard
              key={`${image}-${index}`}
              image={image}
              index={index}
            />
          ))}
        </div>

        <FadeIn delay={0.2}>
          <div className="mt-28 text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-[#7892a5]">
              AVAILABLE FOR FREELANCE & CREATIVE COLLABORATIONS
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <a
                href="https://www.instagram.com/funkvfx/"
                target="_blank"
                rel="noreferrer"
                className="social-link"
              >
                <Instagram size={17} />
                Instagram
              </a>

              <a
                href="https://www.youtube.com/"
                target="_blank"
                rel="noreferrer"
                className="social-link"
              >
                <Youtube size={17} />
                YouTube
              </a>

              <a
                href="mailto:contact@funkvfx.com"
                className="social-link"
              >
                <Mail size={17} />
                Gmail
              </a>
            </div>

            <div className="mt-8">
              <Magnet>
                <ContactButton href="#contact" />
              </Magnet>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

/* -------------------------------------------------------
   CONTACT
------------------------------------------------------- */

function ContactSection() {
  return (
    <section
      id="contact"
      className="relative overflow-hidden bg-[#0c0c0c] px-6 pb-10 pt-20 md:px-10"
    >
      <div className="mx-auto max-w-[1200px]">
        <FadeIn>
          <p className="text-xs uppercase tracking-[0.3em] text-[#7892a5]">
            03 / CONTACT
          </p>

          <h2 className="hero-heading mt-6 max-w-[1000px] text-6xl font-black uppercase leading-[.82] tracking-[-.06em] md:text-[9vw]">
            LET’S MAKE
            <br />
            SOMETHING.
          </h2>

          <div className="mt-12">
            <Magnet>
              <ContactButton href="mailto:contact@funkvfx.com">
                START A PROJECT
              </ContactButton>
            </Magnet>
          </div>
        </FadeIn>

        <footer className="mt-32 border-t border-white/10 py-8">
          <div className="flex flex-col justify-between gap-5 text-[10px] uppercase tracking-[0.18em] text-[#7892a5] md:flex-row">
            <span>BUILD BY HUMBLE ↗</span>
            <span>© HUMBLE & FUNK</span>
          </div>
        </footer>
      </div>
    </section>
  );
}

/* -------------------------------------------------------
   APP
------------------------------------------------------- */

export default function App() {
  const [projects, setProjects] = useState<Project[]>([]);

  /*
   * Supabase is kept connected so your existing project
   * table continues to work.
   *
   * The visual gallery above uses the local gallery images.
   * If you later add more database projects, they can be
   * connected here without breaking the gallery.
   */
  useEffect(() => {
    let mounted = true;

    async function loadProjects() {
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .order('id', { ascending: true });

        if (error) {
          console.warn('Supabase projects:', error.message);
          return;
        }

        if (mounted && data) {
          setProjects(data);
        }
      } catch (error) {
        console.warn('Supabase connection failed:', error);
      }
    }

    loadProjects();

    return () => {
      mounted = false;
    };
  }, []);

  void projects;

  return (
    <main className="min-h-screen bg-[#0c0c0c]">
      <Hero />
      <AboutSection />
      <ServicesSection />
      <ProjectsSection />
      <ContactSection />
    </main>
  );
}