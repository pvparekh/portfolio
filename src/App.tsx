import { useState, useEffect, useRef } from 'react';
import {
  motion,
  useScroll,
  useTransform,
  useInView,
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
  FileText,
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
  description: 'Historical Formula 1 replay rebuilt as a verified data product: canonical Parquet, timing-authoritative race intelligence, immutable releases, and a client-owned replay engine.',
  tech: ['Python', 'FastF1', 'Parquet', 'React', 'TypeScript', 'Vite', 'Cloudflare R2', 'Recharts', 'Vercel'],
  live: 'https://formulavision.vercel.app' as string | null,
  github: 'https://github.com/pvparekh/F1-Viewer' as string | null,
  accent: '#E8002D',
  accentDim: 'rgba(232,0,45,0.07)',
  glow: 'rgba(232,0,45,0.6)',
  note: null, // Note removed since v2 uses static historical delivery
},
  {
    id: 'github-review-bot',
    number: '02',
    name: 'GitHub Review Bot',
    tagline: 'AI-Powered Code Review Automation',
    description:
      'GitHub App code-review agent using signed webhooks, a custom diff-position parser, and a two-pass Claude workflow for structured findings and inline feedback.',
    tech: ['Python', 'FastAPI', 'Claude', 'GitHub API', 'Webhooks', 'Railway'],
    live: null as string | null,
    github: 'https://github.com/pvparekh/github-review-bot' as string | null,
    accent: '#4ADE80',
    accentDim: 'rgba(74,222,128,0.07)',
    glow: 'rgba(74,222,128,0.65)',
    note: null as string | null,
  },
  {
    id: 'aetherflow',
    number: '03',
    name: 'AetherFlow',
    tagline: 'Expense Data & Analytics Product',
    description:
      'Expense intelligence product that ingests business files, categorizes transactions with AI, computes deterministic anomalies and vendor metrics, and presents actionable analyses.',
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
    companyPeriod: 'June 2026 – Present',
    location: 'Parsippany, NJ' as string | null,
    roles: [
      {
        role: 'Junior Data Engineer',
        period: 'Sept 2026 – Present',
        current: true,
        bullets: [
          'Build and maintain production ETL/ELT pipelines, data integrations, and analytics infrastructure using Python, SQL, Apache Airflow, PostgreSQL, and Snowflake.',
          'Developed and productionized an end-to-end pipeline for NESNA, replacing a 1+ hour manual daily process with an unattended rolling 36-month Tableau-to-PostgreSQL refresh.',
        ],
      },
      {
        role: 'Data Analytics Intern',
        period: 'June 2026 – Sept 2026',
        current: false,
        bullets: [
          'Reverse-engineered and translated complex, nested Power BI DAX logic into validated SQL for NetSuite accounting integration, decomposing 15+ production reports and 100+ measures; reproduced filter-context, cancellation, reinstatement, and transaction-reconstruction logic and validated outputs against production Power BI results.',
          'Designed and deployed a fully automated email-to-database ingestion pipeline using Power Automate, Azure SFTP, Airflow, Python, and PostgreSQL, replacing a manual reporting workflow with hourly, idempotent processing; built ~600 lines of dynamic Excel extraction, standardization, region mapping, and duplicate-prevention logic.',
          'Automated manual Tableau reporting workflows using Selenium, enabling reports to be programmatically downloaded and routed into downstream data-processing/database workflows; also developed additional process automations using Power Automate.',
          'Audited four production Apache Airflow DAGs and developed a 400+ line config-driven reusable SFTP-to-PostgreSQL ETL framework, standardizing loading, metadata, archiving, connection handling, and pipeline structure while improving maintainability, observability, and retry safety.',
        ],
      },
    ],
  },
  {
    company: 'Perfect Threading Salon',
    companyUrl: 'https://perfect-threading.vercel.app' as string | null,
    logo: '/perfect-threading-logo.svg' as string | null,
    logoBg: null as string | null,
    logoScale: null as number | null,
    companyPeriod: 'May 2025 – June 2025',
    location: 'Contract' as string | null,
    roles: [
      {
        role: 'Web Developer',
        period: 'May 2025 – June 2025',
        current: false,
        bullets: [
          'Partnered with salon ownership to modernize its booking experience, building and deploying a full-stack website using Next.js 14.',
          'Integrated the Calendly API into the booking workflow, reducing receptionist workload and call volume by ~30%.',
        ],
      },
    ],
  },
  {
    company: 'Marketeq Digital',
    companyUrl: 'https://marketeqdigital.com/' as string | null,
    logo: '/marketeq-logo.svg' as string | null,
    logoBg: '#FFFFFF' as string | null,
    logoScale: 1.1 as number | null,
    companyPeriod: 'Sept 2024 – Feb 2025',
    location: 'Remote' as string | null,
    roles: [
      {
        role: 'Technical Business Analyst Intern',
        period: 'Sept 2024 – Feb 2025',
        current: false,
        bullets: [
          'Bridged engineering and business stakeholders, translating wireframes into technical requirements, user stories, and acceptance criteria that supported modular feature rollouts across 3 product teams.',
          'Integrated internal systems with Strapi CMS, MongoDB, and Customer.io by mapping data flows and researching API-based user-data synchronization, enabling personalized newsletter delivery for 150+ users.',
        ],
      },
    ],
  },
];

const SKILLS = [
  {
    sector: '01',
    label: 'Languages',
    Icon: Code2,
    skills: ['Python', 'SQL', 'TypeScript', 'JavaScript', 'Java', 'R'],
  },
  {
    sector: '02',
    label: 'Data Engineering',
    Icon: Database,
    skills: ['Apache Airflow', 'Snowflake', 'PostgreSQL', 'SQL Server', 'ETL / ELT', 'SFTP', 'Selenium', 'Power Automate', 'Tableau', 'Power BI / DAX'],
  },
  {
    sector: '03',
    label: 'Frontend',
    Icon: Layers,
    skills: ['React', 'Next.js 15', 'Tailwind CSS', 'Framer Motion'],
  },
  {
    sector: '04',
    label: 'Backend',
    Icon: Server,
    skills: ['FastAPI', 'Node.js', 'REST APIs', 'WebSockets'],
  },
  {
    sector: '05',
    label: 'AI / APIs',
    Icon: Brain,
    skills: ['Claude API', 'OpenAI GPT-4o', 'Prompt Engineering'],
  },
  {
    sector: '06',
    label: 'DevOps',
    Icon: Box,
    skills: ['Git', 'Docker', 'AWS EC2', 'GitHub Actions', 'Vercel', 'CI/CD'],
  },
];

const TAGLINES = [
  'Data Engineer',
  'Fitness Enthusiast',
  'Formula One Fan',
  'AI Systems Builder',
  'Rutgers CS Grad',
];

/* ─────────────────────────────────────────────────────────────
   UTILITY
───────────────────────────────────────────────────────────── */

function useTypingEffect(words: string[], typingSpeed = 60, pauseMs = 1800) {
  const [display, setDisplay] = useState('');
  const [initialDelayElapsed, setInitialDelayElapsed] = useState(false);
  const [wordIdx, setWordIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);

  // Let the hero's delayed tagline fade-in begin while the text is still blank.
  // The typing loop then starts once, rather than completing offscreen.
  useEffect(() => {
    const start = setTimeout(() => setInitialDelayElapsed(true), 1450);
    return () => clearTimeout(start);
  }, []);

  useEffect(() => {
    if (!initialDelayElapsed) return;
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
  }, [initialDelayElapsed, charIdx, deleting, wordIdx, words, typingSpeed, pauseMs]);

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
        className="font-mono text-sm tracking-[0.22em] uppercase"
        style={{ color: 'var(--accent)' }}
      >
        {label}
      </span>
      <span className="h-px w-8" style={{ background: 'var(--accent)', opacity: 0.5 }} />
    </div>
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
            Actively Building
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
          className="text-base md:text-lg max-w-2xl mx-auto leading-relaxed mb-6 px-4"
          style={{ color: 'var(--text-3)' }}
        >
          Building dependable data platforms and ambitious software, from production pipelines to interactive products.
        </motion.p>

      </motion.div>

      {/* F1 telemetry bar */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.9, duration: 0.7, ease }}
        className="absolute bottom-0 left-0 right-0 border-t font-mono text-[10px] lg:text-[10px] 2xl:text-xs overflow-x-auto"
        style={{ borderColor: 'var(--border)' }}
      >
        <div className="max-w-[1500px] mx-auto px-4 sm:px-6 py-3 flex flex-nowrap gap-x-3 lg:gap-x-4 items-center justify-between min-w-max">
          {[
            { label: 'ROLE', value: 'DATA ENGINEER' },
            { label: 'EDUCATION', value: "CS + DS @ Rutgers-NB" },
            { label: 'STACK',  value: 'PYTHON + SQL + AIRFLOW + SNOWFLAKE' },
            { label: 'FOCUS', value: 'DATA + SOFTWARE + AI/ML' },
            { label: 'STATUS', value: 'AVAILABLE' },
          ].map((item) => (
            <div key={item.label} className="flex shrink-0 items-center gap-1.5 lg:gap-2 whitespace-nowrap">
              <span style={{ color: 'var(--text-3)' }}>{item.label}</span>
              <span className="h-px w-2 lg:w-3 shrink-0" style={{ background: 'var(--border)' }} />
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
    { value: '4', label: 'Experiences',      sub: 'engineering to analytics' },
    { value: '150+', label: 'Clients Reached', sub: 'via data pipelines' },
  ];

  const academics = [
    { label: 'College', sub: 'Class of 2026', value: 'Rutgers University - New Brunswick' },
    { label: 'Major',   sub: 'B.S.',          value: 'Computer Science' },
    { label: 'Minor',   sub: 'concentration', value: 'Data Science' },
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
            Who <span style={{ color: 'var(--accent)' }}>am I?</span>
          </h2>
        </FadeInSection>

        <div className="grid md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] gap-8 items-stretch">
          {/* Bio */}
          <FadeInSection delay={0.1} className="md:col-span-1">
            <div className="space-y-4 text-sm leading-relaxed" style={{ color: 'var(--text-2)' }}>
              <p>
                I'm a Data Engineer with a B.S. in Computer Science and a
                minor in Data Science from Rutgers University, currently working at{' '}
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
                I like solving problems that call for reliable, scalable, and useful systems. At work, that means building production data pipelines and automating how information moves between systems. On my own time, I've rebuilt Formula Vision around validated race data and efficient browser delivery, and developed an autonomous code reviewer with a two-pass LLM pipeline.
              </p>
              <p>
                Outside of work I'm probably playing sports, working out, or hanging out with
                friends and family.
              </p>
            </div>
          </FadeInSection>

          {/* Profile boards */}
          <FadeInSection delay={0.22} className="md:col-span-1">
            <div className="grid sm:grid-cols-2 gap-5 h-full">
              {/* Technical profile */}
              <div
                className="rounded-sm border h-full flex flex-col"
                style={{ borderColor: 'var(--border)', background: 'var(--bg-card)' }}
              >
                <div
                  className="font-mono text-xs tracking-widest px-4 py-3 border-b flex items-center gap-2"
                  style={{ borderColor: 'var(--border)', color: 'var(--text-2)' }}
                >
                  <span style={{ color: 'var(--accent)' }}>◈</span>
                  TECHNICAL PROFILE
                </div>
                <div className="divide-y flex-1 flex flex-col" style={{ borderColor: 'var(--border)' }}>
                  {stats.map((s) => (
                    <div key={s.label} className="flex-1 flex items-center justify-between px-5 py-5">
                      <div>
                        <div className="font-mono text-xs tracking-widest uppercase" style={{ color: 'var(--text-2)' }}>
                          {s.label}
                        </div>
                        <div className="font-mono text-xs mt-0.5" style={{ color: 'var(--text-2)', opacity: 0.75 }}>
                          {s.sub}
                        </div>
                      </div>
                      <div className="font-display font-bold text-5xl" style={{ color: 'var(--accent)' }}>
                        {s.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Academic profile */}
              <div
                className="rounded-sm border h-full flex flex-col"
                style={{ borderColor: 'var(--border)', background: 'var(--bg-card)' }}
              >
                <div
                  className="font-mono text-xs tracking-widest px-4 py-3 border-b flex items-center gap-2"
                  style={{ borderColor: 'var(--border)', color: 'var(--text-2)' }}
                >
                  <span style={{ color: 'var(--accent)' }}>◈</span>
                  ACADEMIC PROFILE
                </div>
                <div className="divide-y flex-1 flex flex-col" style={{ borderColor: 'var(--border)' }}>
                  {academics.map((a) => (
                    <div key={a.label} className="flex-1 flex items-center justify-between gap-3 px-5 py-5">
                      <div className="flex-shrink-0">
                        <div className="font-mono text-xs tracking-widest uppercase" style={{ color: 'var(--text-2)' }}>
                          {a.label}
                        </div>
                        <div className="font-mono text-xs mt-0.5" style={{ color: 'var(--text-2)', opacity: 0.75 }}>
                          {a.sub}
                        </div>
                      </div>
                      <div
                        className="font-display font-semibold text-base text-right leading-snug"
                        style={{ color: 'var(--accent)' }}
                      >
                        {a.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </FadeInSection>

          {/* Social links */}
          <FadeInSection delay={0.3} className="md:col-span-1">
            <div className="flex flex-wrap justify-center gap-3">
              {[
                { href: 'https://github.com/pvparekh', label: 'GitHub', Icon: GithubIcon, download: undefined },
                { href: 'https://linkedin.com/in/parekh422', label: 'LinkedIn', Icon: LinkedinIcon, download: undefined },
                { href: 'mailto:pvparekh14@gmail.com', label: 'Email', Icon: Mail, download: undefined },
                { href: '/resume.pdf', label: 'Resume', Icon: FileText, download: 'Parth_Parekh_Resume.pdf' },
              ].map(({ href, label, Icon, download }) => (
                <a
                  key={label}
                  href={href}
                  download={download}
                  target={download ? undefined : '_blank'}
                  rel={download ? undefined : 'noreferrer'}
                  className="flex items-center whitespace-nowrap min-h-10 gap-2 font-mono text-xs tracking-wide px-3.5 py-2 rounded-sm border transition-all duration-200"
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
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────
   PROJECTS
───────────────────────────────────────────────────────────── */

function ProjectsSection() {
  const flagship = PROJECTS[0];
  const supporting = PROJECTS.slice(1);

  return (
    <section id="projects" className="renaissance-project-section">
      <div className="renaissance-project-wrap">
        <FadeInSection>
          <div className="renaissance-project-intro">
            <SectionLabel label="Projects" />
            <h2 className="font-display">Things I've <span>built</span></h2>
            <p>Projects spanning data engineering, developer automation, and full-stack software, with the code and architecture available to explore.</p>
          </div>
        </FadeInSection>

        <FadeInSection>
          <article className="renaissance-flagship" aria-labelledby="formula-vision-title">
            <div className="renaissance-project-topline">
              <span>01 / FEATURED SYSTEM</span>
              <span>DATA PLATFORM + INTERACTIVE PRODUCT</span>
            </div>
            <div className="renaissance-flagship-grid">
              <div className="renaissance-flagship-story">
                <p className="renaissance-project-overline">{flagship.tagline}</p>
                <h3 id="formula-vision-title">{flagship.name}</h3>
                <p className="renaissance-flagship-lead">An actual racing product. An engineering system underneath.</p>
                <p className="renaissance-project-description">{flagship.description}</p>
                <div className="renaissance-proof-points" aria-label="Engineering highlights">
                  <div><span>01</span><p>Official timing determines race order, while telemetry positions the cars on the circuit.</p></div>
                  <div><span>02</span><p>Canonical data and browser delivery are separate contracts.</p></div>
                  <div><span>03</span><p>Valid releases publish atomically; broken races are quarantined.</p></div>
                </div>
                <div className="renaissance-project-actions">
                  {flagship.live && (
                    <a href={flagship.live} target="_blank" rel="noreferrer" className="renaissance-primary-project-link">
                      Explore Live Replay <ArrowUpRight size={16} aria-hidden="true" />
                    </a>
                  )}
                  {flagship.github && (
                    <a href={flagship.github} target="_blank" rel="noreferrer" className="renaissance-text-project-link">
                      Source Code <GithubIcon size={16} />
                    </a>
                  )}
                  <a href="https://github.com/pvparekh/F1-Viewer/blob/main/docs/v2/ENGINEERING_OVERVIEW.md"
                    target="_blank" rel="noreferrer" className="renaissance-text-project-link">
                    Architecture <ArrowUpRight size={15} aria-hidden="true" />
                  </a>
                </div>
              </div>

              <div className="renaissance-architecture" aria-label="Formula Vision architecture diagram">
                <div className="renaissance-architecture-caption">
                  <span>BUILD / VALIDATE / DEPLOY</span>
                </div>
                <div className="renaissance-architecture-flow">
                  {[
                    { label: 'Acquire', tech: 'FastF1 + source timing', detail: 'Ingest authoritative race data', code: '01' },
                    { label: 'Canonical truth', tech: 'Typed Parquet + lineage', detail: 'Normalize and version race products', code: '02' },
                    { label: 'Validate', tech: 'Quality gates + quarantine', detail: 'Reject inconsistent sessions', code: '03' },
                    { label: 'Publish', tech: 'Immutable R2 artifacts', detail: 'Verify objects, promote catalog', code: '04' },
                    { label: 'Replay', tech: 'React + client-owned clock', detail: 'Load only needed data chunks', code: '05' },
                  ].map((step, i) => (
                    <div key={step.code} className="renaissance-architecture-step">
                      <span className="renaissance-architecture-index">{step.code}</span>
                      <div className="renaissance-architecture-step-body">
                        <strong>{step.label}</strong>
                        <small>{step.tech}</small>
                        <p>{step.detail}</p>
                      </div>
                      {i !== 4 && <span className="renaissance-architecture-connector" aria-hidden="true" />}
                    </div>
                  ))}
                </div>
                
              </div>
            </div>
            <div className="renaissance-tech-strip" aria-label="Formula Vision technologies">
              {flagship.tech.map(tech => <span key={tech}>{tech}</span>)}
            </div>
          </article>
        </FadeInSection>

        <div className="renaissance-supporting-projects">
          {supporting.map((project, index) => {
            const isReviewBot = project.id === 'github-review-bot';
            const flow = isReviewBot
              ? ['Verify webhook', 'Parse pull-request diff', 'Two-pass AI review', 'Post inline feedback']
              : ['Upload expense files', 'Categorize in batches', 'Compute deterministic statistics', 'Explore analysis'];
            return (
              <FadeInSection key={project.id} delay={index * .07}>
                <article className={`renaissance-supporting-project ${isReviewBot ? 'is-review-bot' : 'is-aetherflow'}`}>
                  <div className="renaissance-project-topline">
                    <span>{project.number} / ENGINEERING PROJECT</span>
                    <span>{isReviewBot ? 'GITHUB INTEGRATION + DEVELOPER TOOLING' : 'FILE INGESTION + ANALYTICS'}</span>
                  </div>
                  <div className="renaissance-secondary-body">
                    <div>
                      <p className="renaissance-project-overline">{project.tagline}</p>
                      <h3>{project.name}</h3>
                      <p className="renaissance-project-description">{project.description}</p>
                    </div>
                    <ol className="renaissance-mini-flow" aria-label={`${project.name} system workflow`}>
                      {flow.map((step, i) => <li key={step}><span>0{i+1}</span>{step}</li>)}
                    </ol>
                    <div className="renaissance-project-actions">
                      {project.github && <a className="renaissance-text-project-link" href={project.github} target="_blank" rel="noreferrer">
                        Examine Repository <GithubIcon size={16} />
                      </a>}
                      {project.live && <a className="renaissance-text-project-link" href={project.live} target="_blank" rel="noreferrer">
                        Open Product <ArrowUpRight size={15} aria-hidden="true" />
                      </a>}
                    </div>
                  </div>
                  <div className="renaissance-secondary-tech" aria-label={`${project.name} technologies`}>
                    {project.tech.map(tech => <span key={tech}>{tech}</span>)}
                  </div>
                </article>
              </FadeInSection>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────
   EXPERIENCE
───────────────────────────────────────────────────────────── */


/* Calendar-month tenure: Jun-Sep is four inclusive months; Sep-Present
   becomes three months on November 1, regardless of browser reload. */
const EXPERIENCE_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] as const;

function formatExperienceTenure(period: string, today: Date): string {
  const match = /^([A-Za-z]+)\s+(\d{4})\s*[–-]\s*([A-Za-z]+)(?:\s+(\d{4}))?$/.exec(period.trim());
  if (!match) return period;
  const [, startName, startYearText, endName, endYearText] = match;
  const monthIndex = (name: string) => EXPERIENCE_MONTHS.findIndex(month => month.toLowerCase() === name.slice(0, 3).toLowerCase());
  const startMonth = monthIndex(startName);
  const present = endName.toLowerCase() === 'present';
  const endMonth = present ? today.getMonth() : monthIndex(endName);
  if (startMonth < 0 || endMonth < 0) return period;
  const startYear = Number(startYearText);
  const endYear = present ? today.getFullYear() : Number(endYearText);
  if (!Number.isInteger(startYear) || !Number.isInteger(endYear)) return period;
  const total = (endYear - startYear) * 12 + (endMonth - startMonth) + 1;
  if (total <= 0) return period;
  const years = Math.floor(total / 12);
  const months = total % 12;
  const duration = years > 0
    ? [years === 1 ? '1 yr' : `${years} yrs`, ...(months ? [months === 1 ? '1 mo' : `${months} mos`] : [])].join(' ')
    : total === 1 ? '1 mo' : `${total} mos`;
  return `${EXPERIENCE_MONTHS[startMonth]} ${startYear} - ${present ? 'Present' : `${EXPERIENCE_MONTHS[endMonth]} ${endYear}`} · ${duration}`;
}

function ExperienceSection() {
  const [asOf, setAsOf] = useState(() => new Date());

  // Refresh while the tab stays open; finished roles keep their fixed end date.
  useEffect(() => {
    const checkDate = () => {
      const now = new Date();
      setAsOf(previous =>
        previous.getFullYear() === now.getFullYear() && previous.getMonth() === now.getMonth()
          ? previous
          : now
      );
    };
    const interval = window.setInterval(checkDate, 60_000);
    document.addEventListener('visibilitychange', checkDate);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', checkDate);
    };
  }, []);

  return (
    <section id="experience" className="renaissance-experience-section" style={{ background: 'var(--bg-1)' }}>
      <div className="renaissance-experience-wrap">
        <FadeInSection>
          <div className="renaissance-experience-intro">
            <SectionLabel label="Experience" />
            <h2 className="font-display">
              Engineering across <span>data and software</span>
            </h2>
            <p>
              I build production data pipelines, automate reporting and integrations, and develop end-to-end software. These roles trace my progression across data engineering, analytics, and application development.
            </p>
          </div>
        </FadeInSection>

        <div className="renaissance-company-list">
          {EXPERIENCE.map((exp, companyIndex) => (
            <FadeInSection key={exp.company} delay={companyIndex * 0.06}>
              <article className="renaissance-company" aria-label={exp.company}>
                <header className="renaissance-company-header">
                  {exp.logo && (
                    <span
                      className={`renaissance-company-logo ${exp.company === 'DOWC' ? 'is-dowc' : ''}`}
                      style={{ background: exp.company === 'DOWC' ? '#050508' : (exp.logoBg ?? 'var(--bg-2)') }}
                    >
                      <img
                        src={exp.company === 'DOWC' ? '/dowc-logo-supplied.png' : exp.logo}
                        alt=""
                        loading="lazy"
                        style={exp.logoScale ? { transform: `scale(${exp.logoScale})` } : undefined}
                      />
                    </span>
                  )}
                  <div className="renaissance-company-details">
                    <h3>
                      {exp.companyUrl ? (
                        <a className="renaissance-company-name" href={exp.companyUrl} target="_blank" rel="noreferrer">
                          {exp.company}<ArrowUpRight size={17} aria-hidden="true" />
                        </a>
                      ) : (
                        <span className="renaissance-company-name">{exp.company}</span>
                      )}
                    </h3>
                    <p className="renaissance-company-meta">{formatExperienceTenure(exp.companyPeriod, asOf)}</p>
                    <p className="renaissance-company-meta">
                      {exp.company === 'DOWC'
                        ? <>Parsippany, NJ <span aria-hidden="true">·</span> On-site</>
                        : exp.company === 'Perfect Threading Salon'
                          ? 'Async'
                          : exp.location}
                    </p>
                  </div>
                </header>

                <div
                  className={`renaissance-roles ${exp.roles.length > 1 ? 'renaissance-roles--nested' : 'renaissance-roles--single'}`}
                  aria-label={`${exp.company} roles`}
                >
                  {exp.roles.map((role) => {
                    const employmentType = role.role === 'Junior Data Engineer'
                      ? 'Full-time'
                      : role.role.includes('Intern')
                        ? 'Internship'
                        : exp.location === 'Contract'
                          ? 'Contract'
                          : null;
                    return (
                      <div className={`renaissance-role ${role.current ? 'is-current' : ''}`} key={`${exp.company}-${role.role}`}>
                        <div className="renaissance-role-title-row">
                          <h4 className="renaissance-role-title">{role.role}</h4>
                          {role.current && (
                            <span className="renaissance-current-marker">CURRENT</span>
                          )}
                        </div>
                        {employmentType && <p className="renaissance-role-type">{employmentType}</p>}
                        <p className="renaissance-role-period">{formatExperienceTenure(role.period, asOf)}</p>
                        {role.bullets && (
                          <ul className="renaissance-role-bullets">
                            {role.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}
                          </ul>
                        )}
                      </div>
                    );
                  })}
                </div>
              </article>
            </FadeInSection>
          ))}
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
            The full <span style={{ color: 'var(--accent)' }}>technical</span> stack
          </h2>
        </FadeInSection>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-w-6xl mx-auto">
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
                        className="skill-chip font-mono text-xs px-2 py-1.5 rounded-sm border cursor-default"
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

function ContactSection({ onNavigateSolutions }: { onNavigateSolutions: () => void }) {
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
              <span style={{ color: 'var(--accent)' }}>together</span>
            </h2>
          </FadeInSection>

          <FadeInSection delay={0.2}>
            <p
              className="text-sm leading-relaxed mb-12 max-w-md mx-auto text-center"
              style={{ color: 'var(--text-2)' }}
            >
              Open to full-time roles, interesting contracts, or a conversation about
              building something new.
            </p>
            <div className="flex justify-center -mt-8 mb-11">
              <button type="button" onClick={onNavigateSolutions} className="renaissance-solutions-text-link">
                Explore Data Solutions <ArrowUpRight size={16} strokeWidth={2} aria-hidden="true" />
              </button>
            </div>
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
          Parth Parekh © 2026
        </span>
      </div>
    </footer>
  );
}

/* ─────────────────────────────────────────────────────────────
   ROOT
───────────────────────────────────────────────────────────── */

export default function App({ onNavigateSolutions }: { onNavigateSolutions: () => void }) {
  return (
    <>
      <main>
        <HeroSection />
        <AboutSection />
        <ExperienceSection />
        <ProjectsSection />
        <SkillsSection />
        <ContactSection onNavigateSolutions={onNavigateSolutions} />
      </main>
      <Footer />
    </>
  );
}