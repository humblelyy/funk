import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { motion, useScroll, useTransform, MotionValue } from 'framer-motion';
import { ArrowUpRight, Instagram, Youtube, Mail, MapPin } from 'lucide-react';
import './index.css';

const heroVideo = '/assets/luffy-hero.mp4';
const heroPoster = '/assets/luffy-poster.jpg';

const projectGalleryImages = [
  '/assets/gallery/discord.png',
  '/assets/gallery/youtube.png',
  '/assets/gallery/adobe.png',
  '/assets/gallery/instagram.png',
  '/assets/gallery/davinci.png',
  '/assets/gallery/after-effects.png'
];

const projectImages = Array.from({ length: 10 }, () => '/assets/no-img.webp');

function FadeIn({ children, delay=0, duration=.7, x=0, y=30, className='' }: {children:React.ReactNode;delay?:number;duration?:number;x?:number;y?:number;className?:string}) {
  return <motion.div className={className} initial={{opacity:0,x,y}} whileInView={{opacity:1,x:0,y:0}} viewport={{once:true,margin:'50px',amount:0}} transition={{delay,duration,ease:[.25,.1,.25,1]}}>{children}</motion.div>;
}

function ContactButton({href='https://www.instagram.com/funk.vfx/', external=true}:{href?:string;external?:boolean}){ return <a href={href} target={external ? '_blank' : undefined} rel={external ? 'noreferrer' : undefined} className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(123deg,#18011F_7%,#B600A8_37%,#7621B0_72%,#BE4C00_100%)] px-8 py-3 sm:px-10 sm:py-3.5 md:px-12 md:py-4 text-xs sm:text-sm md:text-base font-medium uppercase tracking-widest text-white shadow-[0_4px_4px_rgba(181,1,167,.25),4px_4px_12px_#7721B1_inset] outline outline-2 outline-white outline-offset-[-3px] transition-transform duration-200 hover:scale-[1.03]">Contact Me <ArrowUpRight size={16} strokeWidth={2.2} /></a> }

function Magnet({children,padding=150,strength=3}:{children:React.ReactNode;padding?:number;strength?:number}){
  const ref=useRef<HTMLDivElement>(null); const [style,setStyle]=useState({transform:'translate3d(0,0,0)',transition:'transform .6s ease-in-out'});
  useEffect(()=>{ const move=(e:MouseEvent)=>{if(!ref.current)return; const r=ref.current.getBoundingClientRect(); const cx=r.left+r.width/2,cy=r.top+r.height/2; const dx=e.clientX-cx,dy=e.clientY-cy; const dist=Math.hypot(dx,dy); const max=Math.max(r.width,r.height)/2+padding; if(dist<=max){setStyle({transform:`translate3d(${dx/strength}px,${dy/strength}px,0)`,transition:'transform .3s ease-out'});}else setStyle({transform:'translate3d(0,0,0)',transition:'transform .6s ease-in-out'});}; window.addEventListener('mousemove',move,{passive:true}); return()=>window.removeEventListener('mousemove',move);},[padding,strength]);
  return <div ref={ref} style={{...style,willChange:'transform'}}>{children}</div>;
}

function HeroSection(){ return <section id="home" className="relative flex min-h-screen flex-col overflow-hidden bg-[#0C0C0C]">
  <video className="absolute inset-0 h-full w-full object-cover opacity-75" autoPlay muted loop playsInline poster={heroPoster} preload="metadata" aria-hidden="true"><source src={heroVideo} type="video/mp4" /></video>
  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_55%,transparent_0%,rgba(12,12,12,.18)_35%,rgba(12,12,12,.9)_100%)]" />
  <div className="absolute inset-0 bg-gradient-to-b from-[#0C0C0C]/70 via-transparent to-[#0C0C0C]" />
  <FadeIn className="relative z-30 px-5 pt-5 sm:px-7 sm:pt-7 md:px-10 md:pt-8" y={-20}><nav className="mx-auto flex max-w-3xl items-center justify-center gap-1 rounded-full border border-white/15 bg-black/35 p-1.5 shadow-[0_12px_40px_rgba(0,0,0,.22)] backdrop-blur-xl"><a href="#about" className="nav-pill">About</a><a href="#services" className="nav-pill">Services</a><a href="#projects" className="nav-pill">Projects</a><a href="#contact" className="nav-pill">Contact</a></nav></FadeIn>
  <div className="relative z-20 mt-8 overflow-hidden sm:mt-5 md:-mt-3"><FadeIn delay={.15} y={40}><motion.h1 className="hero-heading w-full whitespace-nowrap text-[16vw] font-black uppercase leading-none tracking-tight sm:text-[16vw] md:text-[17vw] lg:text-[18vw]" initial="hidden" animate="show" variants={{hidden:{},show:{transition:{staggerChildren:.045,delayChildren:.18}}}}>{"Hi, i’m funk".split('').map((char,i)=><motion.span key={i} className="inline-block" variants={{hidden:{opacity:0,y:'70%',rotateX:-70},show:{opacity:1,y:0,rotateX:0,transition:{duration:.55,ease:[.22,1,.36,1]}}}}>{char === ' ' ? ' ' : char}</motion.span>)}</motion.h1></FadeIn></div>
  <div className="relative z-20 mt-auto flex items-end justify-between gap-8 px-6 pb-7 sm:px-8 sm:pb-8 md:px-10 md:pb-10">
    <FadeIn delay={.35} y={20}><div><p className="mb-2 text-[clamp(.8rem,1.2vw,1.2rem)] font-medium uppercase tracking-[.18em] text-white">Karan Gorai</p><p className="max-w-[190px] text-[clamp(.75rem,1.4vw,1.5rem)] font-light uppercase leading-snug tracking-wide text-[#D7E2EA] sm:max-w-[280px]">VFX, car edits ( speed ramp ), cinematic cuts, AMV &amp; motion graphics</p><p className="mt-3 flex items-center gap-2 text-xs uppercase tracking-widest text-[#D7E2EA]/70"><MapPin size={14}/> West Bengal, India</p></div></FadeIn>
    <FadeIn delay={.5} y={20}><ContactButton href="mailto:funkvfx@gmail.com" /></FadeIn>
  </div>
</section> }

function MarqueeRow({items}:{items:string[]}){
  const trackItems = [...items, ...items];
  return <div className="marquee-mask" aria-label="FUNK tools and platforms">
    <div className="marquee-track">
      {trackItems.map((src,i)=><div key={`${src}-${i}`} className="marquee-card">
        <img src={src} loading="lazy" alt="FUNK creative software or platform logo" className="marquee-logo" />
      </div>)}
    </div>
  </div>
}
function MarqueeSection(){
  return <section className="relative overflow-hidden bg-[#0C0C0C] px-5 pb-10 pt-10 sm:px-8 sm:pb-12 sm:pt-12 md:px-10 md:pb-14 md:pt-14">
    <FadeIn y={24}>
      <div className="mb-5 flex items-center justify-between gap-4 px-1 text-[10px] uppercase tracking-[.3em] text-[#D7E2EA]/40 sm:text-xs">
        <span>Tools / Platforms</span><span>∞</span>
      </div>
    </FadeIn>
    <MarqueeRow items={projectGalleryImages}/>
  </section>
}

const aboutText="I’m Karan Gorai, the creator behind FUNK. I turn raw footage into high-energy visuals through VFX, car edits, cinematic storytelling, AMVs, and motion graphics. I care about rhythm, impact, clean compositing, and edits that stay in your head. Based in West Bengal, India — available for creative work worldwide.";
function AnimatedText({text}:{text:string}){const ref=useRef<HTMLParagraphElement>(null);const {scrollYProgress}=useScroll({target:ref,offset:['start 0.8','end 0.2']});return <p ref={ref} className="relative max-w-[700px] text-center text-[clamp(1rem,2vw,1.35rem)] font-medium leading-relaxed text-[#D7E2EA]">{text.split('').map((c,i)=><Char key={i} char={c} index={i} total={text.length} progress={scrollYProgress}/>)}</p>}
function Char({char,index,total,progress}:{char:string;index:number;total:number;progress:MotionValue<number>}){
  const start=index/total,end=(index+1)/total;
  const opacity=useTransform(progress,[start,end],[.2,1]);
  const renderedChar = char === ' ' ? '\u00A0' : char;
  return <span className="relative inline-block whitespace-pre">
    <span className="invisible">{renderedChar}</span>
    <motion.span style={{opacity}} className="absolute left-0 top-0 whitespace-pre">{renderedChar}</motion.span>
  </span>
}

const toolItems=[
  {name:'After Effects', src:'/assets/tools/ae.png'},
  {name:'DaVinci Resolve Studio', src:'/assets/tools/davinci.png'}
];
function AboutSection(){return <section id="about" className="relative border-y border-[#D7E2EA]/10 bg-[#0C0C0C] px-5 py-10 sm:px-8 sm:py-12 md:px-10 md:py-14"><div className="mx-auto flex max-w-6xl flex-col items-center gap-6 sm:gap-7 md:gap-8"><FadeIn y={24}><div className="text-center"><p className="mb-2 text-[10px] uppercase tracking-[.35em] text-[#D7E2EA]/45 sm:text-xs">FUNK / KARAN GORAI</p><h2 className="hero-heading text-center text-[clamp(2.8rem,8vw,110px)] font-black uppercase leading-none tracking-tight">About me</h2></div></FadeIn><AnimatedText text={aboutText}/><div className="flex flex-wrap justify-center gap-3">{toolItems.map(tool=><div key={tool.name} className="flex items-center gap-3 rounded-full border border-[#D7E2EA]/20 bg-white/[.04] px-4 py-2.5"><img src={tool.src} alt={tool.name} className="h-7 w-7 object-contain"/><span className="text-xs uppercase tracking-widest text-[#D7E2EA] sm:text-sm">{tool.name}</span></div>)}</div></div></section>}

const services=[['01','VFX / Compositing','Tracking, compositing, effects, screen replacements, cleanup, and detailed finishing for edits that need a cinematic push.'],['02','Car Edits','High-energy automotive edits with speed ramps, camera movement, sound sync, transitions, VFX, and aggressive visual styling.'],['03','Cinematic Editing','Story-driven cuts, pacing, color, music sync, and atmosphere built around the emotion of the footage.'],['04','AMV Editing','Fast, expressive anime music videos with beat-synced cuts, impact frames, effects, transitions, and custom motion.'],['05','Motion Graphics','Animated typography, titles, transitions, overlays, and motion systems that make content feel polished and alive.']];
function ServicesSection(){return <section id="services" className="rounded-t-[40px] bg-white px-5 py-20 text-[#0C0C0C] sm:rounded-t-[50px] sm:px-8 sm:py-24 md:rounded-t-[60px] md:px-10 md:py-32"><FadeIn><h2 className="mb-16 text-center text-[clamp(3rem,12vw,160px)] font-black uppercase leading-none tracking-tight sm:mb-20 md:mb-28">Services</h2></FadeIn><div className="mx-auto max-w-5xl">{services.map(([num,name,desc],i)=><FadeIn key={num} delay={i*.1}><div className="flex items-start gap-5 border-t border-[rgba(12,12,12,.15)] py-8 sm:gap-8 sm:py-10 md:gap-12 md:py-12"><div className="w-[25%] shrink-0 text-[clamp(3rem,10vw,140px)] font-black leading-none">{num}</div><div className="pt-1 sm:pt-3"><h3 className="text-[clamp(1rem,2.2vw,2.1rem)] font-medium uppercase">{name}</h3><p className="max-w-2xl text-[clamp(.85rem,1.6vw,1.25rem)] font-light leading-relaxed opacity-60">{desc}</p></div></div></FadeIn>)}</div></section>}

function ProjectsSection(){return <section id="projects" className="relative z-10 -mt-10 overflow-hidden rounded-t-[40px] bg-[#0C0C0C] px-5 pb-8 pt-12 sm:-mt-12 sm:rounded-t-[50px] sm:px-8 sm:pt-16 md:-mt-14 md:rounded-t-[60px] md:px-10 md:pt-20">
  <div className="mb-10 flex items-end justify-between gap-6 sm:mb-14"><FadeIn><div><p className="mb-2 text-xs uppercase tracking-[.35em] text-[#D7E2EA]/50">Selected work</p><h2 className="hero-heading text-[clamp(3rem,10vw,140px)] font-black uppercase leading-none tracking-tight">Projects</h2></div></FadeIn><FadeIn delay={.15}><a href="https://www.instagram.com/funk.vfx/" target="_blank" rel="noreferrer" className="hidden items-center gap-2 rounded-full border-2 border-[#D7E2EA] px-6 py-3 text-xs font-medium uppercase tracking-widest text-[#D7E2EA] transition-colors hover:bg-[#D7E2EA]/10 sm:inline-flex">More on Instagram <ArrowUpRight size={15}/></a></FadeIn></div>
  <div className="mx-auto max-w-[1900px] space-y-3">
    <div className="projects-row grid grid-cols-5 gap-3">
      {projectImages.slice(0,5).map((src,i)=><ProjectImage key={src+i} src={src} index={i}/>) }
    </div>
    <div className="projects-row grid grid-cols-5 gap-3">
      {projectImages.slice(5,10).map((src,i)=><ProjectImage key={src+i} src={src} index={i+5}/>) }
    </div>
  </div>
  <div className="mt-10 flex justify-center sm:hidden"><a href="https://www.instagram.com/funk.vfx/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border-2 border-[#D7E2EA] px-6 py-3 text-xs font-medium uppercase tracking-widest text-[#D7E2EA]">More on Instagram <ArrowUpRight size={15}/></a></div>
  <div id="contact" className="flex flex-col items-center gap-7 py-24 text-center"><p className="text-xs uppercase tracking-[.3em] text-[#D7E2EA]/50">Available for freelance &amp; creative collaborations</p><div className="flex flex-wrap justify-center gap-3"><a href="https://www.instagram.com/funk.vfx/" target="_blank" rel="noreferrer" className="social-link"><Instagram size={18}/> Instagram</a><a href="https://www.youtube.com/@funk.vfx_yt" target="_blank" rel="noreferrer" className="social-link"><Youtube size={18}/> YouTube</a><a href="mailto:funkvfx@gmail.com" target="_blank" rel="noreferrer" className="social-link"><Mail size={18}/> Gmail</a></div><ContactButton href="mailto:funkvfx@gmail.com"/></div>
  <footer className="border-t border-[#D7E2EA]/10 pt-5 pb-2 text-[10px] uppercase tracking-[.18em] text-[#D7E2EA]/55 sm:flex sm:items-center sm:justify-between">
    <a href="https://www.instagram.com/_humble.y_/" target="_blank" rel="noreferrer" className="transition-colors hover:text-white">Build by HUMBLE ↗</a>
    <span className="mt-3 block sm:mt-0">© HUMBLE &amp; FUNK</span>
  </footer>
</section>}
function ProjectImage({src,index}:{src:string;index:number}){
  const handleImageError = (event: React.SyntheticEvent<HTMLImageElement>) => {
    const img = event.currentTarget;
    if (img.dataset.fallbackApplied === 'true') return;
    img.dataset.fallbackApplied = 'true';
    img.src = '/assets/no-img.webp';
  };
  return <motion.a href="https://www.instagram.com/funk.vfx/" target="_blank" rel="noreferrer" className="project-tile group relative block overflow-hidden rounded-[22px] sm:rounded-[28px] md:rounded-[34px]" initial={{opacity:0,y:30}} whileInView={{opacity:1,y:0}} viewport={{once:true,amount:.15}} transition={{delay:index*.04,duration:.6}}>
    <img src={src} onError={handleImageError} alt={`FUNK project ${index+1}`} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"/>
    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"/>
    <div className="absolute bottom-4 left-4 right-4 translate-y-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100"><p className="text-[10px] font-medium uppercase tracking-[.25em] text-white">FUNK / {['VFX','CAR EDIT','CINEMATIC','AMV','MOTION GRAPHICS'][index%5]}</p></div>
  </motion.a>
}

function App(){return <main className="overflow-x-clip bg-[#0C0C0C]"><HeroSection/><MarqueeSection/><AboutSection/><ServicesSection/><ProjectsSection/></main>}

createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>);
