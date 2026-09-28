import React, { useEffect, useRef } from 'react';
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
} from 'lucide-react';
import './index.css';

const heroVideo = '/assets/luffy-hero.mp4';
const heroPoster = '/assets/luffy-poster.jpg';

/* =========================================================
   PROJECT GALLERY IMAGES
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
   PROJECT DATA
   ========================================================= */

const projects = [
  {
    image: '/assets/gallery/discord.png',
    title: 'Discord',
    category: 'FUNK / VFX',
    url: 'https://www.instagram.com/funkvfx/',
  },
  {
    image: '/assets/gallery/youtube.png',
    title: 'YouTube',
    category: 'VIDEO EDITING',
    url: 'https://www.youtube.com/',
  },
  {
    image: '/assets/gallery/adobe.png',
    title: 'Adobe',
    category: 'MOTION GRAPHICS',
    url: 'https://www.instagram.com/funkvfx/',
  },
  {
    image: '/assets/gallery/instagram.png',
    title: 'Instagram',
    category: 'SOCIAL CONTENT',
    url: 'https://www.instagram.com/funkvfx/',
  },
  {
    image: '/assets/gallery/davinci.png',
    title: 'DaVinci Resolve',
    category: 'COLOR / EDITING',
    url: 'https://www.instagram.com/funkvfx/',
  },
  {
    image: '/assets/gallery/after-effects.png',
    title: 'After Effects',
    category: 'MOTION / VFX',
    url: 'https://www.instagram.com/funkvfx/',
  },
];

/* =========================================================
   FADE IN
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
        amount: 0.15,
      }}
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

/* =========================================================
   MAGNETIC ELEMENT
   ========================================================= */

function Magnet({
  children,
  strength = 25,
  className = '',
}: {
  children: React.ReactNode;
  strength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;

    if (!element) return;

    const handleMove = (event: MouseEvent) => {
      const rect = element.getBoundingClientRect();

      const x =
        event.clientX -
        (rect.left + rect.width / 2);

      const y =
        event.clientY -
        (rect.top + rect.height / 2);

      const moveX = (x / rect.width) * strength;
      const moveY = (y / rect.height) * strength;

      element.style.transform = `
        translate(${moveX}px, ${moveY}px)
      `;
    };

    const handleLeave = () => {
      element.style.transform = 'translate(0px, 0px)';
    };

    element.addEventListener('mousemove', handleMove);
    element.addEventListener('mouseleave', handleLeave);

    return () => {
      element.removeEventListener(
        'mousemove',
        handleMove
      );
      element.removeEventListener(
        'mouseleave',
        handleLeave
      );
    };
  }, [strength]);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        transition:
          'transform .35s cubic-bezier(.22,1,.36,1)',
      }}
    >
      {children}
    </div>
  );
}

/* =========================================================
   CONTACT BUTTON
   ========================================================= */

function ContactButton({
  href = '#contact',
  children = 'CONTACT ME',
}: {
  href?: string;
  children?: React.ReactNode;
}) {
  return (
    <Magnet strength={18}>
      <a
        href={href}
        className="
          inline-flex
          items-center
          gap-3
          rounded-full
          border
          border-white/70
          bg-gradient-to-r
          from-[#8d00c9]
          via-[#c000b4]
          to-[#a53a37]
          px-8
          py-4
          text-sm
          font-semibold
          uppercase
          tracking-widest
          text-white
          shadow-[0_0_20px_rgba(191,0,190,.45)]
          transition-all
          duration-300
          hover:scale-[1.03]
          hover:shadow-[0_0_32px_rgba(191,0,190,.7)]
        "
      >
        {children}
        <ArrowUpRight size={17} />
      </a>
    </Magnet>
  );
}

/* =========================================================
   NAVIGATION
   ========================================================= */

function Navigation() {
  return (
    <nav
      className="
        fixed
        left-1/2
        top-6
        z-50
        flex
        w-[calc(100%-40px)]
        max-w-[770px]
        -translate-x-1/2
        items-center
        justify-center
        gap-1
        rounded-full
        border
        border-white/10
        bg-[#0b1014]/80
        px-3
        py-2
        backdrop-blur-xl
      "
    >
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
  );
}

/* =========================================================
   HERO
   ========================================================= */

function Hero() {
  const { scrollY } = useScroll();

  const heroY = useTransform(
    scrollY,
    [0, 700],
    [0, 180]
  );

  const heroOpacity = useTransform(
    scrollY,
    [0, 550],
    [1, 0]
  );

  return (
    <section
      className="
        relative
        min-h-screen
        overflow-hidden
        bg-[#0c0c0c]
      "
    >
      <motion.div
        style={{
          y: heroY,
          opacity: heroOpacity,
        }}
        className="
          absolute
          inset-0
          h-full
          w-full
        "
      >
        <video
          className="
            absolute
            inset-0
            h-full
            w-full
            object-cover
          "
          src={heroVideo}
          poster={heroPoster}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
        />

        <div
          className="
            absolute
            inset-0
            bg-gradient-to-b
            from-black/35
            via-black/10
            to-[#0c0c0c]
          "
        />

        <div
          className="
            absolute
            inset-0
            bg-black/15
          "
        />
      </motion.div>

      <Navigation />

      <div
        className="
          relative
          z-10
          flex
          min-h-screen
          flex-col
          justify-between
          px-6
          pb-10
          pt-36
          md:px-10
          md:pt-44
        "
      >
        <FadeIn>
          <h1
            className="
              hero-heading
              select-none
              whitespace-nowrap
              text-[20vw]
              font-black
              uppercase
              leading-[.72]
              tracking-[-.07em]
              md:text-[15vw]
            "
          >
            HI, I'M FUNK
          </h1>
        </FadeIn>

        <div
          className="
            mt-auto
            flex
            flex-col
            gap-10
            md:flex-row
            md:items-end
            md:justify-between
          "
        >
          <FadeIn delay={0.15}>
            <div className="max-w-[430px]">
              <p
                className="
                  mb-3
                  text-sm
                  font-semibold
                  uppercase
                  tracking-[.16em]
                  text-white
                "
              >
                KARAN GORAI
              </p>

              <p
                className="
                  text-sm
                  uppercase
                  leading-relaxed
                  tracking-[.06em]
                  text-[#D7E2EA]/85
                "
              >
                VFX, CAR EDITS (SPEED RAMP), CINEMATIC
                <br />
                CUTS, AMV & MOTION GRAPHICS
              </p>

              <div
                className="
                  mt-4
                  flex
                  items-center
                  gap-2
                  text-xs
                  uppercase
                  tracking-[.12em]
                  text-[#D7E2EA]/70
                "
              >
                <MapPin size={14} />
                WEST BENGAL, INDIA
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={0.25}>
            <ContactButton />
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
      className="
        relative
        bg-[#0c0c0c]
        px-6
        py-32
        md:px-10
        md:py-44
      "
    >
      <div className="mx-auto max-w-[1250px]">
        <FadeIn>
          <p
            className="
              mb-5
              text-xs
              uppercase
              tracking-[.35em]
              text-[#7d9bb1]
            "
          >
            About
          </p>

          <h2
            className="
              hero-heading
              max-w-[1000px]
              text-5xl
              font-black
              uppercase
              leading-[.9]
              tracking-[-.04em]
              md:text-8xl
            "
          >
            EDIT.
            <br />
            CREATE.
            <br />
            REPEAT.
          </h2>
        </FadeIn>

        <FadeIn delay={0.15}>
          <p
            className="
              about-copy
              mt-12
              max-w-[700px]
              text-lg
              leading-relaxed
              text-[#D7E2EA]/70
              md:text-xl
            "
          >
            I create high-energy visual content focused on
            VFX, cinematic editing, motion graphics, car
            edits and creative storytelling.
          </p>
        </FadeIn>
      </div>
    </section>
  );
}

/* =========================================================
   SERVICES
   ========================================================= */

function ServicesSection() {
  const services = [
    'VIDEO EDITING',
    'VFX',
    'MOTION GRAPHICS',
    'CAR EDITS',
    'AMV',
    'CINEMATIC CONTENT',
  ];

  return (
    <section
      id="services"
      className="
        bg-[#0c0c0c]
        px-6
        py-28
        md:px-10
        md:py-36
      "
    >
      <div className="mx-auto max-w-[1250px]">
        <FadeIn>
          <p
            className="
              text-xs
              uppercase
              tracking-[.35em]
              text-[#7d9bb1]
            "
          >
            What I Do
          </p>

          <h2
            className="
              hero-heading
              mt-5
              text-6xl
              font-black
              uppercase
              leading-none
              tracking-[-.05em]
              md:text-8xl
            "
          >
            SERVICES
          </h2>
        </FadeIn>

        <div className="mt-14 grid gap-3 md:grid-cols-2">
          {services.map((service, index) => (
            <FadeIn
              key={service}
              delay={index * 0.05}
            >
              <div
                className="
                  flex
                  items-center
                  justify-between
                  border-b
                  border-white/10
                  py-7
                "
              >
                <span
                  className="
                    text-xl
                    font-medium
                    uppercase
                    tracking-wider
                    text-[#D7E2EA]
                    md:text-2xl
                  "
                >
                  {service}
                </span>

                <span className="text-[#7d9bb1]">
                  0{index + 1}
                </span>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   PROJECT CARD
   ========================================================= */

function ProjectCard({
  project,
}: {
  project: {
    image: string;
    title: string;
    category: string;
    url: string;
  };
}) {
  return (
    <motion.a
      href={project.url}
      target="_blank"
      rel="noopener noreferrer"
      className="
        project-tile
        group
        relative
        block
        overflow-hidden
        rounded-[30px]
        bg-[#151515]
      "
      whileHover={{
        y: -8,
      }}
      transition={{
        duration: 0.35,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <div
        className="
          relative
          aspect-square
          w-full
          overflow-hidden
          bg-[#111]
        "
      >
        <img
          src={project.image}
          alt={project.title}
          className="
            h-full
            w-full
            object-cover
            transition-transform
            duration-700
            ease-out
            group-hover:scale-105
          "
          onError={(event) => {
            event.currentTarget.src =
              '/assets/no-img.webp';
          }}
        />

        <div
          className="
            absolute
            inset-0
            bg-gradient-to-t
            from-black/80
            via-transparent
            to-transparent
            opacity-70
          "
        />

        <div
          className="
            absolute
            bottom-0
            left-0
            right-0
            p-5
          "
        >
          <p
            className="
              text-[10px]
              font-semibold
              uppercase
              tracking-[.2em]
              text-white
            "
          >
            {project.category}
          </p>

          <div className="mt-2 flex items-center justify-between">
            <h3
              className="
                text-lg
                font-semibold
                text-white
              "
            >
              {project.title}
            </h3>

            <ArrowUpRight
              size={18}
              className="
                opacity-60
                transition-all
                duration-300
                group-hover:translate-x-1
                group-hover:-translate-y-1
                group-hover:opacity-100
              "
            />
          </div>
        </div>
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
      className="
        relative
        z-10
        overflow-hidden
        rounded-t-[55px]
        bg-[#0c0c0c]
        px-6
        py-28
        md:px-10
        md:py-36
      "
    >
      <div className="mx-auto max-w-[1250px]">
        <FadeIn>
          <div
            className="
              flex
              flex-col
              gap-8
              md:flex-row
              md:items-end
              md:justify-between
            "
          >
            <div>
              <p
                className="
                  text-xs
                  uppercase
                  tracking-[.35em]
                  text-[#7d9bb1]
                "
              >
                Selected Work
              </p>

              <h2
                className="
                  hero-heading
                  mt-5
                  text-6xl
                  font-black
                  uppercase
                  leading-none
                  tracking-[-.05em]
                  md:text-8xl
                "
              >
                PROJECTS
              </h2>
            </div>

            <Magnet strength={12}>
              <a
                href="https://www.instagram.com/funkvfx/"
                target="_blank"
                rel="noopener noreferrer"
                className="
                  inline-flex
                  w-fit
                  items-center
                  gap-3
                  rounded-full
                  border
                  border-[#D7E2EA]/80
                  px-6
                  py-4
                  text-xs
                  font-semibold
                  uppercase
                  tracking-widest
                  text-[#D7E2EA]
                  transition-all
                  duration-300
                  hover:bg-white
                  hover:text-black
                "
              >
                MORE ON INSTAGRAM
                <ArrowUpRight size={15} />
              </a>
            </Magnet>
          </div>
        </FadeIn>

        {/* PROJECT GRID */}

        <div
          className="
            projects-row
            mt-16
            grid
            grid-cols-5
            gap-3
          "
        >
          {projects.map((project, index) => (
            <FadeIn
              key={`${project.title}-${index}`}
              delay={index * 0.04}
            >
              <ProjectCard project={project} />
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   LOGO MARQUEE
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
          <div
            className="marquee-card"
            key={`${image}-${index}`}
          >
            <img
              src={image}
              alt=""
              className="marquee-logo"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

/* =========================================================
   CONTACT
   ========================================================= */

function ContactSection() {
  return (
    <section
      id="contact"
      className="
        bg-[#0c0c0c]
        px-6
        pb-12
        pt-28
        md:px-10
        md:pt-36
      "
    >
      <div className="mx-auto max-w-[1250px]">
        <FadeIn>
          <div className="text-center">
            <p
              className="
                text-xs
                uppercase
                tracking-[.35em]
                text-[#7d9bb1]
              "
            >
              Available for freelance & creative
              collaborations
            </p>

            <div className="mt-8 flex justify-center">
              <div className="flex flex-wrap justify-center gap-3">
                <a
                  href="https://www.instagram.com/funkvfx/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-link"
                >
                  <Instagram size={16} />
                  Instagram
                </a>

                <a
                  href="https://www.youtube.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-link"
                >
                  <Youtube size={16} />
                  YouTube
                </a>

                <a
                  href="mailto:hello@funkvfx.com"
                  className="social-link"
                >
                  <Mail size={16} />
                  Gmail
                </a>
              </div>
            </div>

            <div className="mt-9 flex justify-center">
              <ContactButton>
                CONTACT ME
              </ContactButton>
            </div>
          </div>
        </FadeIn>

        <footer
          className="
            mt-24
            flex
            flex-col
            gap-5
            border-t
            border-white/10
            pt-7
            text-[10px]
            uppercase
            tracking-[.18em]
            text-[#D7E2EA]/60
            md:flex-row
            md:items-center
            md:justify-between
          "
        >
          <span>
            BUILD BY HUMBLE ↗
          </span>

          <span>
            © HUMBLE & FUNK
          </span>
        </footer>
      </div>
    </section>
  );
}

/* =========================================================
   APP
   ========================================================= */

export default function App() {
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