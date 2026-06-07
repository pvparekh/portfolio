import { useState, useEffect, useRef } from 'react';
import {
  motion,
  useScroll,
  useTransform,
  useInView,
  AnimatePresence,
  type Variants,
} from 'framer-motion';
import {
  Mail,
  ExternalLink,
  ArrowUpRight,
  ChevronDown,
  Code2,
  Layers,
  Server,
  Brain,
  Box,
  Database,
} from 'lucide-react';

/* ── Brand icon SVGs (lucide-react v1 dropped these) ── */
function GithubIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.6.113.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

function LinkedinIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────
   DATA
───────────────────────────────────────────────────────────── */

const PROJECTS = [
  {
    id: 'formula-vision',
    number: '01',
    name: 'Formula Vision',
    tagline: 'F1 Race Replay Platform',
    description:
      'Full-scale race replay platform with real-time telemetry visualization, lap comparison tools, and multi-driver sync, built for the fan who cares about the milliseconds.',
    tech: ['React', 'TypeScript', 'FastAPI', 'WebSockets', 'Python', 'Render'],
    live: 'https://formulavision.vercel.app' as string | null,
    github: 'https://github.com/pvparekh/F1-Viewer' as string | null,
    accent: '#E8002D',
    accentDim: 'rgba(232,0,45,0.07)',
    glow: 'rgba(232,0,45,0.6)',
    note: 'First load takes ~45s while the backend wakes up, give it a moment.' as
      | string
      | null,
  },
  {
    id: 'github-review-bot',
    number: '02',
    name: 'GitHub Review Bot',
    tagline: 'AI-Powered Code Review Automation',
    description:
      'Production-grade GitHub App that reviews pull requests using Claude AI, posts inline comments, and integrates natively with any CI/CD pipeline. Deployed on AWS EC2.',
    tech: ['Python', 'FastAPI', 'Claude API', 'Docker', 'AWS EC2', 'GitHub Actions'],
    live: 'https://github.com/pvparekh/github-review-bot' as string | null,
    github: 'https://github.com/pvparekh/github-review-bot' as string | null,
    accent: '#F59E0B',
    accentDim: 'rgba(245,158,11,0.07)',
    glow: 'rgba(245,158,11,0.65)',
    note: null as string | null,
  },
  {
    id: 'aetherflow',
    number: '03',
    name: 'AetherFlow',
    tagline: 'AI Expense Intelligence SaaS',
    description:
      'Next-gen expense intelligence platform that uses GPT-4o to analyze spending patterns, predict cash flow, and surface actionable financial insights in real time.',
    tech: ['Next.js 15', 'GPT-4o', 'Supabase', 'PostgreSQL', 'TypeScript', 'Tailwind'],
    live: 'https://aetherflow-three.vercel.app' as string | null,
    github: 'https://github.com/pvparekh/aetherflow' as string | null,
    accent: '#8B5CF6',
    accentDim: 'rgba(139,92,246,0.07)',
    glow: 'rgba(139,92,246,0.6)',
    note: null as string | null,
  },
];

const EXPERIENCE = [
  {
    company: 'DOWC',
    companyUrl: 'https://dowc.com',
    logo: '/dowc-logo.png' as string | null,
    logoBg: null as string | null,
    logoScale: null as number | null,
    role: 'Data Analytics Intern',
    period: 'June 2026 – Present',
    location: 'Parsippany, NJ' as string | null,
    description: null as string | null,
    current: true,
  },
  {
    company: 'Perfect Threading Salon',
    companyUrl: 'https://perfect-threading.vercel.app' as string | null,
    logo: '/perfect-threading-logo.svg' as string | null,
    logoBg: null as string | null,
    logoScale: null as number | null,
    role: 'Web Developer',
    period: 'May 2025 – June 2025',
    location: 'Parsippany, NJ' as string | null,
    description:
      'Built and deployed a full-stack booking platform with Next.js 14 and Calendly API integration, reducing receptionist workload by ~30%.',
    current: false,
  },
  {
    company: 'Marketeq Digital',
    companyUrl: 'https://marketeqdigital.com/' as string | null,
    logo: '/marketeq-logo.svg' as string | null,
    logoBg: '#FFFFFF' as string | null,
    logoScale: 1.1 as number | null,
    role: 'Technical Business Analyst Intern',
    period: 'Sept 2024 – Feb 2025',
    location: 'Remote' as string | null,
    description:
      'Bridged engineering and business stakeholders, translating wireframes into user stories that enabled modular feature rollouts across 3 product teams. Mapped data flows across Strapi CMS, MongoDB, and Customer.io for personalized campaigns serving 150+ clients.',
    current: false,
  },
];

const SKILLS = [
  {
    sector: '01',
    label: 'Languages',
    Icon: Code2,
    skills: ['Python', 'TypeScript', 'JavaScript', 'Java', 'R', 'SQL'],
  },
  {
    sector: '02',
    label: 'Frontend',
    Icon: Layers,
    skills: ['React', 'Next.js 15', 'Tailwind CSS', 'Framer Motion'],
  },
  {
    sector: '03',
    label: 'Backend',
    Icon: Server,
    skills: ['FastAPI', 'Node.js', 'REST APIs', 'WebSockets'],
  },
  {
    sector: '04',
    label: 'AI / APIs',
    Icon: Brain,
    skills: ['Claude API', 'OpenAI GPT-4o', 'Prompt Engineering'],
  },
  {
    sector: '05',
    label: 'DevOps',
    Icon: Box,
    skills: ['Docker', 'AWS EC2', 'GitHub Actions', 'Vercel', 'CI/CD'],
  },
  {
    sector: '06',
    label: 'Databases',
    Icon: Database,
    skills: ['PostgreSQL', 'Supabase', 'MongoDB'],
  },
];

const TAGLINES = [
  'Full-Stack Engineer',
  'Formula One Fan',
  'AI Systems Builder',
  'Rutgers CS Grad',
];

/* ─────────────────────────────────────────────────────────────
   UTILITY
───────────────────────────────────────────────────────────── */

function useTypingEffect(words: string[], typingSpeed = 60, pauseMs = 1800) {
  const [display, setDisplay] = useState('');
  const [wordIdx, setWordIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = words[wordIdx];
    let timeout: ReturnType<typeof setTimeout>;

    if (!deleting && charIdx <= current.length) {
      timeout = setTimeout(() => {
        setDisplay(current.slice(0, charIdx));
        setCharIdx((c) => c + 1);
      }, typingSpeed);
    } else if (!deleting && charIdx > current.length) {
      timeout = setTimeout(() => setDeleting(true), pauseMs);
    } else if (deleting && charIdx > 0) {
      timeout = setTimeout(() => {
        setDisplay(current.slice(0, charIdx - 1));
        setCharIdx((c) => c - 1);
      }, typingSpeed / 2);
    } else {
      setDeleting(false);
      setWordIdx((w) => (w + 1) % words.length);
    }

    return () => clearTimeout(timeout);
  }, [charIdx, deleting, wordIdx, words, typingSpeed, pauseMs]);

  return display;
}

const ease = [0.22, 1, 0.36, 1] as const;

function FadeInSection({
  children,
  delay = 0,
  className = '',
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function SectionLabel({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center gap-3 mb-5">
      <span className="h-px w-8" style={{ background: 'var(--accent)', opacity: 0.5 }} />
      <span
        className="font-mono text-xs tracking-[0.25em] uppercase"
        style={{ color: 'var(--accent)' }}
      >
        {label}
      </span>
      <span className="h-px w-8" style={{ background: 'var(--accent)', opacity: 0.5 }} />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   NAV
───────────────────────────────────────────────────────────── */

function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMenuOpen(false);
  };

  const links = [
    { label: 'About', id: 'about' },
    { label: 'Experience', id: 'experience' },
    { label: 'Projects', id: 'projects' },
    { label: 'Skills', id: 'skills' },
    { label: 'Contact', id: 'contact' },
  ];

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease }}
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? 'rgba(8,8,13,0.92)' : 'transparent',
        backdropFilter: scrolled ? 'blur(16px)' : 'none',
        borderBottom: scrolled ? '1px solid var(--border)' : 'none',
      }}
    >
      <div className="w-full px-6 md:px-10 h-16 flex items-center justify-between">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="flex items-center gap-2"
        >
          <span
            className="font-display font-bold text-lg tracking-tight"
            style={{ color: 'var(--accent)' }}
          >
            Parth
          </span>
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: 'var(--accent)', opacity: 0.5 }}
          />
        </button>

        <div className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <button
              key={l.id}
              onClick={() => scrollTo(l.id)}
              className="nav-link font-mono text-xs tracking-widest uppercase"
              style={{ color: 'var(--text-2)' }}
            >
              {l.label}
            </button>
          ))}
          <a
            href="mailto:pvparekh14@gmail.com"
            className="btn-primary font-mono text-xs tracking-widest px-4 py-2 rounded-sm font-semibold"
            style={{ background: 'var(--accent)', color: '#08080D' }}
          >
            Hire Me
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden flex flex-col gap-1.5 p-2"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="block w-5 h-px transition-all duration-300"
              style={{
                background: 'var(--text-2)',
                transform:
                  i === 0 && menuOpen
                    ? 'rotate(45deg) translate(3.5px, 3.5px)'
                    : i === 2 && menuOpen
                    ? 'rotate(-45deg) translate(3.5px, -3.5px)'
                    : '',
                opacity: i === 1 && menuOpen ? 0 : 1,
              }}
            />
          ))}
        </button>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden overflow-hidden"
            style={{ background: 'rgba(8,8,13,0.97)', borderBottom: '1px solid var(--border)' }}
          >
            <div className="px-6 py-4 flex flex-col gap-5">
              {links.map((l) => (
                <button
                  key={l.id}
                  onClick={() => scrollTo(l.id)}
                  className="text-left font-mono text-xs tracking-widest uppercase"
                  style={{ color: 'var(--text-2)' }}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

/* ─────────────────────────────────────────────────────────────
   HERO
───────────────────────────────────────────────────────────── */

const SPEED_LINES = [
  { top: '18%', dur: '3.8s', delay: '0s',    opacity: 0.55 },
  { top: '33%', dur: '5.4s', delay: '1.3s',  opacity: 0.3 },
  { top: '48%', dur: '4.2s', delay: '0.5s',  opacity: 0.5 },
  { top: '62%', dur: '6.2s', delay: '2.2s',  opacity: 0.22 },
  { top: '74%', dur: '3.3s', delay: '0.9s',  opacity: 0.4 },
  { top: '86%', dur: '5.0s', delay: '1.8s',  opacity: 0.28 },
];

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};

const letterVariants: Variants = {
  hidden: { opacity: 0, y: 70 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: 'easeOut' },
  },
};

function HeroSection() {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 0.28], [0, -55]);
  const op = useTransform(scrollYProgress, [0, 0.22], [1, 0]);
  const tagline = useTypingEffect(TAGLINES);

  const first = 'PARTH'.split('');
  const last = 'PAREKH'.split('');

  return (
    <section
      id="hero"
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden circuit-grid"
      style={{ background: 'var(--bg-0)' }}
    >
      {SPEED_LINES.map((line, i) => (
        <div
          key={i}
          className="speed-line"
          style={
            {
              top: line.top,
              '--dur': line.dur,
              '--delay': line.delay,
              opacity: line.opacity,
            } as React.CSSProperties
          }
        />
      ))}

      {/* Ambient radial */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 70% 50% at 50% 60%, rgba(245,158,11,0.05) 0%, transparent 70%)',
        }}
      />

      {/* F1 race number watermark */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8, duration: 1 }}
        className="absolute top-20 right-6 md:right-14 font-display text-right select-none pointer-events-none"
      >
        <div
          className="font-bold leading-none"
          style={{ fontSize: 'clamp(5rem, 12vw, 9rem)', color: 'rgba(245,158,11,0.03)' }}
        >
          P1
        </div>
        <div className="font-mono text-xs tracking-widest mt-1" style={{ color: 'var(--text-3)' }}>
          GRID REF.
        </div>
      </motion.div>

      {/* Hero content */}
      <motion.div style={{ y, opacity: op }} className="relative z-10 text-center px-6 max-w-5xl mx-auto">
        {/* Status pill */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6, ease }}
          className="flex items-center justify-center gap-3 mb-10"
        >
          <span className="h-px w-10" style={{ background: 'var(--accent)', opacity: 0.45 }} />
          <span
            className="font-mono text-xs tracking-[0.3em] uppercase"
            style={{ color: 'var(--accent)' }}
          >
            Available for work
          </span>
          <span
            className="w-1.5 h-1.5 rounded-full live-dot"
            style={{ background: '#22C55E' }}
          />
          <span className="h-px w-10" style={{ background: 'var(--accent)', opacity: 0.45 }} />
        </motion.div>

        {/* Name, staggered letter reveal */}
        <div className="mb-6 overflow-hidden">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="font-display font-bold leading-[0.9] select-none"
            style={{ fontSize: 'clamp(3.8rem, 11.5vw, 9.5rem)' }}
          >
            <div className="flex justify-center gap-[0.025em] mb-[0.04em]">
              {first.map((ch, i) => (
                <motion.span
                  key={i}
                  variants={letterVariants}
                  style={{ display: 'inline-block', color: 'var(--text-1)' }}
                >
                  {ch}
                </motion.span>
              ))}
            </div>
            <div className="flex justify-center gap-[0.025em]">
              {last.map((ch, i) => (
                <motion.span
                  key={i}
                  variants={letterVariants}
                  style={{
                    display: 'inline-block',
                    color: i < 3 ? 'var(--accent)' : 'var(--text-1)',
                  }}
                >
                  {ch}
                </motion.span>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Typing tagline */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1, duration: 0.6 }}
          className="font-mono text-base md:text-lg mb-2 h-8 flex items-center justify-center gap-1"
          style={{ color: 'var(--text-2)' }}
        >
          <span>{tagline}</span>
          <span className="cursor-blink" style={{ color: 'var(--accent)' }}>
            |
          </span>
        </motion.div>

        {/* Sub-tagline */}
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3, duration: 0.6, ease }}
          className="text-base md:text-lg max-w-2xl mx-auto leading-relaxed mb-12 px-4"
          style={{ color: 'var(--text-3)' }}
        >
          I build software that ships, scales, and occasionally runs at 200 mph.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.6, ease }}
          className="flex flex-wrap items-center justify-center gap-4"
        >
          <button
            onClick={() =>
              document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' })
            }
            className="btn-primary font-display font-semibold text-sm px-7 py-3.5 rounded-sm flex items-center gap-2"
            style={{ background: 'var(--accent)', color: '#08080D' }}
          >
            View My Work
            <ArrowUpRight size={16} strokeWidth={2.5} />
          </button>
          <button
            onClick={() =>
              document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })
            }
            className="btn-secondary font-display font-medium text-sm px-7 py-3.5 rounded-sm border"
            style={{ borderColor: 'var(--border)', color: 'var(--text-2)' }}
          >
            Get In Touch
          </button>
        </motion.div>
      </motion.div>

      {/* F1 telemetry bar */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.9, duration: 0.7, ease }}
        className="absolute bottom-0 left-0 right-0 border-t font-mono text-xs"
        style={{ borderColor: 'var(--border)' }}
      >
        <div className="max-w-6xl mx-auto px-6 py-3 flex flex-wrap gap-x-8 gap-y-1 items-center justify-between">
          {[
            { label: 'DRIVER', value: 'PAREKH' },
            { label: 'TEAM',   value: "RUTGERS '26" },
            { label: 'STACK',  value: 'FULL-STACK + AI + ANALYTICS' },
            { label: 'STATUS', value: 'AVAILABLE' },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-3">
              <span style={{ color: 'var(--text-3)' }}>{item.label}</span>
              <span className="h-px w-4" style={{ background: 'var(--border)' }} />
              <span style={{ color: item.label === 'STATUS' ? '#22C55E' : 'var(--text-2)' }}>
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.2, duration: 0.6 }}
        className="absolute bottom-14 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 7, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ChevronDown size={16} style={{ color: 'var(--text-3)' }} />
        </motion.div>
      </motion.div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────
   ABOUT
───────────────────────────────────────────────────────────── */

function AboutSection() {
  const stats = [
    { value: '3', label: 'Production Apps',  sub: 'shipped end to end' },
    { value: '3', label: 'Experiences',      sub: 'web dev to data analytics' },
    { value: '150+', label: 'Clients Reached', sub: 'via data pipelines' },
  ];

  return (
    <section id="about" className="py-20 md:py-28 px-6" style={{ background: 'var(--bg-0)' }}>
      <div className="max-w-6xl mx-auto">
        <FadeInSection>
          <SectionLabel label="About" />
          <h2
            className="font-display font-bold text-3xl sm:text-4xl md:text-5xl mb-16 leading-[1.15] text-center max-w-3xl mx-auto text-balance"
            style={{ color: 'var(--text-1)' }}
          >
            Building at the intersection of{' '}
            <span style={{ color: 'var(--accent)' }}>precision</span> and speed.
          </h2>
        </FadeInSection>

        <div className="grid md:grid-cols-2 gap-16 items-start">
          {/* Bio */}
          <FadeInSection delay={0.1}>
            <div className="flex gap-5 items-center mb-8">
              <div
                className="flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center font-display font-bold text-xl border-2"
                style={{
                  background: 'var(--bg-card)',
                  borderColor: 'var(--accent-border)',
                  color: 'var(--accent)',
                }}
              >
                PP
              </div>
              <div>
                <p className="font-display font-semibold text-base" style={{ color: 'var(--text-1)' }}>
                  Parth Parekh
                </p>
                <p className="font-mono text-xs mt-1" style={{ color: 'var(--text-3)' }}>
                  Rutgers University, CS + Data Science, 2026
                </p>
              </div>
            </div>

            <div className="space-y-4 text-sm leading-relaxed" style={{ color: 'var(--text-2)' }}>
              <p>
                I'm a full-stack software engineer with a B.S. in Computer Science and a
                minor in Data Science from Rutgers University, focused on AI-powered
                systems. Currently working as a Data Analytics Intern at{' '}
                <a
                  href="https://dowc.com"
                  target="_blank"
                  rel="noreferrer"
                  className="underline underline-offset-2"
                  style={{ color: 'var(--accent)' }}
                >
                  DOWC
                </a>
                .
              </p>
              <p>
                I like to solve problems, especially the kind that are in between systems
                engineering and AI. Whether it's building autonomous code reviewers, streaming 440MB of telemetry in
                real-time, or engineering two-pass
                LLM pipelines, I care about writing software that's fast, reliable, and
                worth using.
              </p>
              <p>
                Outside of work I'm probably either at the gym or hanging out with
                friends and family.
              </p>
            </div>

            {/* Social links */}
            <div className="flex flex-wrap gap-3 mt-7">
              {[
                { href: 'https://github.com/pvparekh', label: 'GitHub', Icon: GithubIcon },
                { href: 'https://linkedin.com/in/parekh422', label: 'LinkedIn', Icon: LinkedinIcon },
                { href: 'mailto:pvparekh14@gmail.com', label: 'Email', Icon: Mail },
              ].map(({ href, label, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 font-mono text-xs tracking-wide px-4 py-2 rounded-sm border transition-all duration-200"
                  style={{
                    borderColor: 'var(--border)',
                    color: 'var(--text-2)',
                    background: 'var(--bg-card)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--accent-border)';
                    e.currentTarget.style.color = 'var(--accent)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border)';
                    e.currentTarget.style.color = 'var(--text-2)';
                  }}
                >
                  <Icon size={13} />
                  {label}
                </a>
              ))}
            </div>
          </FadeInSection>

          {/* Stats board */}
          <FadeInSection delay={0.22}>
            <div
              className="rounded-sm border"
              style={{ borderColor: 'var(--border)', background: 'var(--bg-card)' }}
            >
              <div
                className="font-mono text-xs tracking-widest px-4 py-2.5 border-b flex items-center gap-2"
                style={{ borderColor: 'var(--border)', color: 'var(--text-2)' }}
              >
                <span style={{ color: 'var(--accent)' }}>◈</span>
                TECHNICAL PROFILE / PARTH PAREKH
              </div>
              <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
                {stats.map((s) => (
                  <div key={s.label} className="flex items-center justify-between px-5 py-4">
                    <div>
                      <div className="font-mono text-xs tracking-widest uppercase" style={{ color: 'var(--text-2)' }}>
                        {s.label}
                      </div>
                      <div className="font-mono text-xs mt-0.5" style={{ color: 'var(--text-2)', opacity: 0.75 }}>
                        {s.sub}
                      </div>
                    </div>
                    <div className="font-display font-bold text-4xl" style={{ color: 'var(--accent)' }}>
                      {s.value}
                    </div>
                  </div>
                ))}
              </div>
              <div
                className="font-mono text-xs px-4 py-2.5 border-t flex items-center justify-between"
                style={{ borderColor: 'var(--border)', color: 'var(--text-2)' }}
              >
                <span>CS + DATA SCIENCE • CLASS OF 2026</span>
                <span style={{ color: 'var(--accent)' }}>Rutgers University - NB</span>
              </div>
            </div>
          </FadeInSection>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────
   PROJECTS
───────────────────────────────────────────────────────────── */

function ProjectCard({
  project,
  index,
}: {
  project: (typeof PROJECTS)[0];
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 36 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay: index * 0.14, ease }}
      className="flex flex-col h-full"
    >
      <div
        className="project-card rounded-sm border relative overflow-hidden flex flex-col h-full"
        style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
      >
        {/* Livery stripe */}
        <div className="h-0.5 w-full flex-shrink-0" style={{ background: project.accent }} />

        {/* Top glow */}
        <div
          className="absolute top-0 left-0 right-0 h-20 pointer-events-none"
          style={{ background: `linear-gradient(180deg, ${project.accentDim} 0%, transparent 100%)` }}
        />

        <div className="p-6 flex flex-col flex-1 relative z-10">
          <div className="flex items-start justify-between mb-5">
            <span
              className="font-mono text-xs tracking-widest"
              style={{ color: project.accent, opacity: 0.7 }}
            >
              {project.number}
            </span>
            <div className="flex gap-2.5">
              {project.github && (
                <a
                  href={project.github}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="GitHub repository"
                  className="p-2.5 rounded-md border transition-all duration-200"
                  style={{ borderColor: 'var(--border)', color: 'var(--text-2)' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = project.accent;
                    e.currentTarget.style.color = project.accent;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border)';
                    e.currentTarget.style.color = 'var(--text-2)';
                  }}
                >
                  <GithubIcon size={18} />
                </a>
              )}
              {project.live && (
                <a
                  href={project.live}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Live site"
                  className="live-link-glow p-2.5 rounded-md border flex items-center justify-center transition-transform duration-200 hover:scale-110"
                  style={
                    {
                      borderColor: project.accent,
                      color: project.accent,
                      background: project.accentDim,
                      '--glow-color': project.glow,
                    } as React.CSSProperties
                  }
                >
                  <ExternalLink size={18} strokeWidth={2.4} />
                </a>
              )}
            </div>
          </div>

          <h3 className="font-display font-bold text-2xl mb-1" style={{ color: 'var(--text-1)' }}>
            {project.name}
            {project.note && (
              <span style={{ color: project.accent }} aria-hidden="true">
                {' '}
                *
              </span>
            )}
          </h3>
          <p className="font-mono text-xs tracking-wide mb-4" style={{ color: project.accent }}>
            {project.tagline}
          </p>
          <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--text-2)' }}>
            {project.description}
          </p>

          {project.note && (
            <p
              className="mb-6 text-xs leading-relaxed flex gap-1.5"
              style={{ color: 'var(--text-3)' }}
            >
              <span style={{ color: project.accent }}>*</span>
              <span>{project.note}</span>
            </p>
          )}

          <div className="flex flex-wrap gap-1.5 mt-auto">
            {project.tech.map((t) => (
              <span
                key={t}
                className="font-mono text-xs px-2.5 py-1 rounded-sm border"
                style={{ borderColor: 'var(--border)', color: 'var(--text-2)', background: 'var(--bg-2)' }}
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function ProjectsSection() {
  return (
    <section id="projects" className="py-20 md:py-28 px-6" style={{ background: 'var(--bg-0)' }}>
      <div className="max-w-6xl mx-auto">
        <FadeInSection>
          <SectionLabel label="Projects" />
          <h2
            className="font-display font-bold text-3xl sm:text-4xl md:text-5xl mb-4 leading-[1.15] text-center"
            style={{ color: 'var(--text-1)' }}
          >
            Things I've <span style={{ color: 'var(--accent)' }}>built</span> and shipped.
          </h2>
          <p
            className="text-base mb-16 max-w-xl mx-auto text-center"
            style={{ color: 'var(--text-2)' }}
          >
            A few projects I've designed, built, and shipped end to end.
          </p>
        </FadeInSection>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
          {PROJECTS.map((p, i) => (
            <ProjectCard key={p.id} project={p} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────
   EXPERIENCE
───────────────────────────────────────────────────────────── */

function ExperienceSection() {
  return (
    <section id="experience" className="py-20 md:py-28 px-6" style={{ background: 'var(--bg-1)' }}>
      <div className="max-w-6xl mx-auto">
        <FadeInSection>
          <SectionLabel label="Experience" />
          <h2
            className="font-display font-bold text-3xl sm:text-4xl md:text-5xl mb-16 leading-[1.15] text-center"
            style={{ color: 'var(--text-1)' }}
          >
            Where I've <span style={{ color: 'var(--accent)' }}>worked</span>.
          </h2>
        </FadeInSection>

        <div className="relative max-w-2xl mx-auto">
          {/* Vertical timeline line */}
          <div
            className="absolute left-[11px] top-2 bottom-2 w-px"
            style={{ background: 'var(--border)' }}
          />

          <div className="space-y-12">
            {EXPERIENCE.map((exp, i) => (
              <FadeInSection key={i} delay={i * 0.1}>
                <div className="flex gap-7 relative">
                  {/* Dot */}
                  <div className="flex-shrink-0 relative z-10 mt-1.5">
                    <div
                      className="w-6 h-6 rounded-full border-2 flex items-center justify-center"
                      style={{
                        borderColor: exp.current ? 'var(--accent)' : 'var(--border)',
                        background: exp.current ? 'rgba(245,158,11,0.1)' : 'var(--bg-0)',
                      }}
                    >
                      {exp.current && (
                        <div
                          className="w-2 h-2 rounded-full live-dot"
                          style={{ background: 'var(--accent)' }}
                        />
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      {exp.logo && (
                        <span
                          className="inline-flex items-center justify-center w-7 h-7 rounded-md border flex-shrink-0 p-1"
                          style={{
                            borderColor: 'var(--border)',
                            background: exp.logoBg ?? 'var(--bg-2)',
                          }}
                        >
                          <img
                            src={exp.logo}
                            alt={`${exp.company} logo`}
                            className="max-w-full max-h-full object-contain"
                            style={
                              exp.logoScale
                                ? { transform: `scale(${exp.logoScale})` }
                                : undefined
                            }
                          />
                        </span>
                      )}
                      {exp.companyUrl ? (
                        <a
                          href={exp.companyUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="font-display font-semibold text-xl flex items-center gap-1 transition-colors duration-200"
                          style={{ color: 'var(--text-1)' }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent)')}
                          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-1)')}
                        >
                          {exp.company}
                          <ArrowUpRight size={14} />
                        </a>
                      ) : (
                        <span className="font-display font-semibold text-xl" style={{ color: 'var(--text-1)' }}>
                          {exp.company}
                        </span>
                      )}
                      {exp.current && (
                        <span
                          className="font-mono text-xs px-2 py-0.5 rounded-sm border"
                          style={{
                            borderColor: 'rgba(34,197,94,0.3)',
                            color: '#22C55E',
                            background: 'rgba(34,197,94,0.08)',
                          }}
                        >
                          CURRENT
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-x-3 gap-y-1 items-center mb-3">
                      <span className="text-sm font-medium" style={{ color: 'var(--accent)' }}>
                        {exp.role}
                      </span>
                      <span className="font-mono text-xs" style={{ color: '#6B7280' }}>
                        {exp.period}
                      </span>
                      {exp.location && (
                        <span
                          className="font-mono text-xs flex items-center gap-1"
                          style={{ color: '#6B7280' }}
                        >
                          <span style={{ opacity: 0.6 }}>•</span>
                          {exp.location}
                        </span>
                      )}
                    </div>

                    {exp.description && (
                      <p className="text-sm leading-relaxed" style={{ color: 'var(--text-2)' }}>
                        {exp.description}
                      </p>
                    )}
                  </div>
                </div>
              </FadeInSection>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────
   SKILLS
───────────────────────────────────────────────────────────── */

function SkillsSection() {
  return (
    <section id="skills" className="py-20 md:py-28 px-6" style={{ background: 'var(--bg-1)' }}>
      <div className="max-w-6xl mx-auto">
        <FadeInSection>
          <SectionLabel label="Skills" />
          <h2
            className="font-display font-bold text-3xl sm:text-4xl md:text-5xl mb-16 leading-[1.15] text-center"
            style={{ color: 'var(--text-1)' }}
          >
            The full <span style={{ color: 'var(--accent)' }}>technical</span> stack.
          </h2>
        </FadeInSection>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-w-5xl mx-auto">
          {SKILLS.map((group, i) => {
            const { Icon } = group;
            return (
              <FadeInSection key={group.sector} delay={i * 0.07}>
                <div
                  className="rounded-sm border p-5 h-full transition-all duration-300 cursor-default"
                  style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--accent-border)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)';
                  }}
                >
                  <div className="flex items-baseline gap-2 mb-4">
                    <Icon
                      size={13}
                      style={{ color: 'var(--accent)', flexShrink: 0, alignSelf: 'center' }}
                    />
                    <span
                      className="font-mono text-xs tracking-widest uppercase"
                      style={{ color: 'var(--text-3)' }}
                    >
                      S{group.sector} /
                    </span>
                    <span
                      className="font-mono text-base tracking-widest uppercase"
                      style={{ color: 'var(--text-3)' }}
                    >
                      {group.label}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {group.skills.map((skill) => (
                      <span
                        key={skill}
                        className="skill-chip font-mono text-xs px-2.5 py-1.5 rounded-sm border cursor-default"
                        style={{ borderColor: 'var(--border)', color: 'var(--text-2)', background: 'var(--bg-2)' }}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </FadeInSection>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────
   CONTACT
───────────────────────────────────────────────────────────── */

function ContactSection() {
  return (
    <section
      id="contact"
      className="py-20 md:py-28 px-6 relative overflow-hidden"
      style={{ background: 'var(--bg-0)' }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 60% 45% at 50% 100%, rgba(245,158,11,0.055) 0%, transparent 70%)',
        }}
      />

      <div className="max-w-6xl mx-auto relative z-10">
        <FadeInSection>
          <SectionLabel label="Contact" />
        </FadeInSection>

        <div className="max-w-2xl mx-auto">
          <FadeInSection delay={0.1}>
            <h2
              className="font-display font-bold leading-[1.1] mb-6 text-center"
              style={{ fontSize: 'clamp(2.4rem, 6vw, 5rem)', color: 'var(--text-1)' }}
            >
              Let's build something
              <br />
              <span style={{ color: 'var(--accent)' }}>worth launching.</span>
            </h2>
          </FadeInSection>

          <FadeInSection delay={0.2}>
            <p
              className="text-sm leading-relaxed mb-12 max-w-md mx-auto text-center"
              style={{ color: 'var(--text-2)' }}
            >
              Open to full-time roles, interesting contracts, or a conversation about
              building something new. If you have an ambitious project and need an engineer
              who ships, reach out.
            </p>
          </FadeInSection>

          <FadeInSection delay={0.3}>
            <div className="flex flex-col gap-3">
              {[
                {
                  href: 'mailto:pvparekh14@gmail.com',
                  Icon: Mail,
                  label: 'pvparekh14@gmail.com',
                  sub: 'Primary inbox',
                },
                {
                  href: 'https://linkedin.com/in/parekh422',
                  Icon: LinkedinIcon,
                  label: 'linkedin.com/in/parekh422',
                  sub: 'LinkedIn',
                },
                {
                  href: 'https://github.com/pvparekh',
                  Icon: GithubIcon,
                  label: 'github.com/pvparekh',
                  sub: 'GitHub',
                },
              ].map(({ href, Icon, label, sub }) => (
                <a
                  key={href}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex items-center justify-between p-4 rounded-sm border transition-all duration-300"
                  style={{ borderColor: 'var(--border)', background: 'var(--bg-card)' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--accent-border)';
                    e.currentTarget.style.background = 'var(--accent-dim)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border)';
                    e.currentTarget.style.background = 'var(--bg-card)';
                  }}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="p-2 rounded-sm border"
                      style={{ borderColor: 'var(--border)', color: 'var(--accent)' }}
                    >
                      <Icon size={15} />
                    </div>
                    <div>
                      <div className="font-mono text-sm" style={{ color: 'var(--text-1)' }}>
                        {label}
                      </div>
                      <div className="font-mono text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>
                        {sub}
                      </div>
                    </div>
                  </div>
                  <ArrowUpRight
                    size={15}
                    className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
                    style={{ color: 'var(--text-3)' }}
                  />
                </a>
              ))}
            </div>
          </FadeInSection>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────
   FOOTER
───────────────────────────────────────────────────────────── */

function Footer() {
  return (
    <footer
      className="border-t py-7 px-6"
      style={{ borderColor: 'var(--border)', background: 'var(--bg-0)' }}
    >
      <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4">
        <span className="font-mono text-xs" style={{ color: 'var(--text-3)' }}>
          Parth Parekh © 2026 · Built with React + Framer Motion
        </span>
        <div
          className="font-mono text-xs flex items-center gap-2"
          style={{ color: 'var(--text-3)' }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: 'var(--accent)', animation: 'livePulse 2s ease-out infinite' }}
          />
          Designed &amp; engineered from scratch
        </div>
      </div>
    </footer>
  );
}

/* ─────────────────────────────────────────────────────────────
   ROOT
───────────────────────────────────────────────────────────── */

export default function App() {
  return (
    <>
      <Nav />
      <main>
        <HeroSection />
        <AboutSection />
        <ExperienceSection />
        <ProjectsSection />
        <SkillsSection />
        <ContactSection />
      </main>
      <Footer />
    </>
  );
}
