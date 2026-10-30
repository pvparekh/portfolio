import { useEffect, useState, type ReactNode } from 'react';
import { ArrowUpRight } from 'lucide-react';
import {
  ABOUT_ACADEMICS, ABOUT_STATS, AboutBio, CONTACT_INTRO, CONTACT_LINKS, EXPERIENCE, EXPERIENCE_INTRO,
  FV_ARCHITECTURE, FV_ARCHITECTURE_URL, FV_LEAD, FV_PROOF_POINTS, GithubIcon, HERO_SUBTAGLINE, PROJECTS,
  PROJECTS_INTRO, RoleBullets, SKILLS, SOCIAL_LINKS, SUPPORTING_FLOWS, SUPPORTING_TYPES, TAGLINES,
  companyLocationFor, employmentTypeFor, formatExperienceTenure, useTypingEffect,
} from '../../App';

/*
 * Homepage content for the spatial journey. Every string comes from the
 * shared copy in App.tsx, so both layouts present identical information.
 */

/** On narrow screens the exhibit screens sit off-frame, so the real capture appears inside the panel. */
export function MobilePreview({ src, alt }: { src: string; alt: string }) {
  return <img className="jp-mobile-preview" src={src} alt={alt} loading="lazy" decoding="async" width={1600} height={1000} />;
}

function Kicker({ children }: { children: ReactNode }) {
  return <p className="jp-kicker"><span aria-hidden="true" />{children}<span aria-hidden="true" /></p>;
}

/** Live tenure strings refresh when the month changes, as on the standard page. */
function useMonth() {
  const [asOf, setAsOf] = useState(() => new Date());
  useEffect(() => {
    const check = () => {
      const now = new Date();
      setAsOf(prev => (prev.getFullYear() === now.getFullYear() && prev.getMonth() === now.getMonth() ? prev : now));
    };
    const id = window.setInterval(check, 60_000);
    document.addEventListener('visibilitychange', check);
    return () => { window.clearInterval(id); document.removeEventListener('visibilitychange', check); };
  }, []);
  return asOf;
}

export function OriginPanel() {
  const tagline = useTypingEffect(TAGLINES);
  return (
    <div className="jp-origin">
      <p className="jp-origin-status">
        <span className="jp-rule" aria-hidden="true" />
        <span>Actively Building</span>
        <span className="jp-live-dot" aria-hidden="true" />
        <span className="jp-rule" aria-hidden="true" />
      </p>
      <div className="jp-origin-name">
        <div>PARTH</div>
        <div><span className="jp-warm">PAR</span>EKH</div>
      </div>
      <p className="jp-origin-tagline"><span>{tagline}</span><span className="cursor-blink" aria-hidden="true">|</span></p>
      <p className="jp-origin-sub">{HERO_SUBTAGLINE}</p>
      <div className="jp-origin-marker"><div>P1</div><div>GRID REF.</div></div>
    </div>
  );
}

export function AboutBioPanel() {
  return (
    <article className="jp-about-bio">
      <Kicker>About</Kicker>
      <h2>Who <span className="jp-accent">am I?</span></h2>
      <div className="jp-about-row">
        <figure className="jp-portrait">
          <img src="/about-portrait-400.webp" alt="Parth Parekh photographed in front of a colorful mural" width={400} height={551} decoding="async" />
        </figure>
        <div className="jp-prose"><AboutBio /></div>
      </div>
    </article>
  );
}

export function AboutProfilePanel() {
  return (
    <article className="jp-about-profile">
      <div className="jp-board">
        <p className="jp-board-title"><span aria-hidden="true">◈</span> TECHNICAL PROFILE</p>
        {ABOUT_STATS.map(s => (
          <div key={s.label} className="jp-board-row">
            <div><p className="jp-board-label">{s.label}</p><p className="jp-board-sub">{s.sub}</p></div>
            <p className="jp-board-value">{s.value}</p>
          </div>
        ))}
      </div>
      <div className="jp-board">
        <p className="jp-board-title"><span aria-hidden="true">◈</span> ACADEMIC PROFILE</p>
        {ABOUT_ACADEMICS.map(a => (
          <div key={a.label} className="jp-board-row">
            <div><p className="jp-board-label">{a.label}</p><p className="jp-board-sub">{a.sub}</p></div>
            <p className="jp-board-value jp-board-value--text">{a.value}</p>
          </div>
        ))}
      </div>
      <div className="jp-socials">
        {SOCIAL_LINKS.map(({ href, label, Icon, download }) => (
          <a key={label} href={href} download={download} target={download ? undefined : '_blank'} rel={download ? undefined : 'noreferrer'} className="jp-chip-link">
            <Icon size={13} />{label}
          </a>
        ))}
      </div>
    </article>
  );
}

export function ExperienceIntroPanel() {
  return (
    <article className="jp-intro">
      <Kicker>Experience</Kicker>
      <h2>Engineering across <span className="jp-accent">data and software</span></h2>
      <p>{EXPERIENCE_INTRO}</p>
    </article>
  );
}

/** Flattened roles in display order, each with its company and whether it opens that company. */
export const ROLE_ENTRIES = EXPERIENCE.flatMap(exp => exp.roles.map((role, index) => ({ exp, role, first: index === 0 })));

export function RolePanel({ index }: { index: number }) {
  const asOf = useMonth();
  const entry = ROLE_ENTRIES[index];
  if (!entry) return null;
  const { exp, role, first } = entry;
  const employmentType = employmentTypeFor(exp, role);
  return (
    <article className={`jp-role ${role.current ? 'is-current' : ''}`} aria-label={`${exp.company}: ${role.role}`}>
      {first ? (
        <header className="jp-company">
          {exp.logo && (
            <span className="jp-company-logo" style={{ background: exp.company === 'DOWC' ? '#050508' : (exp.logoBg ?? '#111119') }}>
              <img src={exp.company === 'DOWC' ? '/dowc-logo-supplied.png' : exp.logo} alt="" style={exp.logoScale ? { transform: `scale(${exp.logoScale})` } : undefined} />
            </span>
          )}
          <div>
            <h3>
              {exp.companyUrl
                ? <a href={exp.companyUrl} target="_blank" rel="noreferrer">{exp.company}<ArrowUpRight size={17} aria-hidden="true" /></a>
                : exp.company}
            </h3>
            <p className="jp-meta">{formatExperienceTenure(exp.companyPeriod, asOf)}</p>
            <p className="jp-meta">{companyLocationFor(exp)}</p>
          </div>
        </header>
      ) : (
        <p className="jp-company-continued" aria-hidden="true">
          <span className="jp-company-logo jp-company-logo--small" style={{ background: exp.company === 'DOWC' ? '#050508' : (exp.logoBg ?? '#111119') }}>
            {exp.logo && <img src={exp.company === 'DOWC' ? '/dowc-logo-supplied.png' : exp.logo} alt="" />}
          </span>
        </p>
      )}
      <div className="jp-role-body">
        <div className="jp-role-title">
          <h4>{role.role}</h4>
          {role.current && <span className="jp-current">CURRENT</span>}
        </div>
        {employmentType && <p className="jp-role-type">{employmentType}</p>}
        <p className="jp-meta">{formatExperienceTenure(role.period, asOf, exp.roles.length > 1)}</p>
        {role.bullets && <RoleBullets exp={exp} role={role} />}
      </div>
    </article>
  );
}

export function ProjectsIntroPanel() {
  return (
    <article className="jp-intro">
      <Kicker>Projects</Kicker>
      <h2>Things I've <span className="jp-accent">built</span></h2>
      <p>{PROJECTS_INTRO}</p>
    </article>
  );
}

export function FlagshipPanel() {
  const flagship = PROJECTS[0];
  return (
    <article className="jp-exhibit jp-exhibit--fv" aria-labelledby="jp-fv-title">
      <p className="jp-topline"><span>01 / FEATURED SYSTEM</span><span>DATA PLATFORM + INTERACTIVE PRODUCT</span></p>
      <MobilePreview src="/projects/formula-vision-replay-map.webp" alt="Formula Vision race replay: the race order, circuit map and driver telemetry" />
      <p className="jp-overline">{flagship.tagline}</p>
      <h3 id="jp-fv-title">{flagship.name}</h3>
      <p className="jp-lead">{FV_LEAD}</p>
      <p className="jp-desc">{flagship.description}</p>
      <div className="jp-proof" aria-label="Engineering highlights">
        {FV_PROOF_POINTS.map((point, i) => <div key={point}><span>0{i + 1}</span><p>{point}</p></div>)}
      </div>
      <div className="jp-actions">
        {flagship.live && <a href={flagship.live} target="_blank" rel="noreferrer" className="jp-primary">Explore Live Replay <ArrowUpRight size={16} aria-hidden="true" /></a>}
        {flagship.github && <a href={flagship.github} target="_blank" rel="noreferrer" className="jp-text-link">Documentation <GithubIcon size={16} /></a>}
        <a href={FV_ARCHITECTURE_URL} target="_blank" rel="noreferrer" className="jp-text-link">Architecture <ArrowUpRight size={15} aria-hidden="true" /></a>
      </div>
      <div className="jp-tech" aria-label="Formula Vision technologies">{flagship.tech.map(t => <span key={t}>{t}</span>)}</div>
    </article>
  );
}

export function FlagshipArchitecturePanel() {
  return (
    <aside className="jp-architecture" aria-label="Formula Vision architecture diagram">
      <p className="jp-topline"><span>BUILD / VALIDATE / DEPLOY</span></p>
      <ol>
        {FV_ARCHITECTURE.map(step => (
          <li key={step.code}>
            <span className="jp-step-index">{step.code}</span>
            <div><strong>{step.label}</strong><small>{step.tech}</small><p>{step.detail}</p></div>
          </li>
        ))}
      </ol>
    </aside>
  );
}

export function SupportingPanel({ id }: { id: 'github-review-bot' | 'aetherflow' }) {
  const project = PROJECTS.find(p => p.id === id)!;
  const flow = SUPPORTING_FLOWS[project.id];
  return (
    <article className={`jp-exhibit ${id === 'aetherflow' ? 'jp-exhibit--aether' : 'jp-exhibit--bot'}`}>
      <p className="jp-topline"><span>{project.number} / ENGINEERING PROJECT</span><span>{SUPPORTING_TYPES[project.id]}</span></p>
      <MobilePreview src={id === 'aetherflow' ? '/projects/aetherflow-home.webp' : '/projects/review-bot-pipeline.webp'} alt={id === 'aetherflow' ? 'AetherFlow home page' : 'GitHub Review Bot pipeline, from its repository README'} />
      <p className="jp-overline">{project.tagline}</p>
      <h3>{project.name}</h3>
      <p className="jp-desc">{project.description}</p>
      <ol className="jp-flow" aria-label={`${project.name} system workflow`}>
        {flow.map((step, i) => <li key={step}><span>0{i + 1}</span>{step}</li>)}
      </ol>
      <div className="jp-actions">
        {project.github && <a className="jp-text-link" href={project.github} target="_blank" rel="noreferrer">Examine Repository <GithubIcon size={16} /></a>}
        {project.live && <a className="jp-text-link" href={project.live} target="_blank" rel="noreferrer">Open Product <ArrowUpRight size={15} aria-hidden="true" /></a>}
      </div>
      <div className="jp-tech" aria-label={`${project.name} technologies`}>{project.tech.map(t => <span key={t}>{t}</span>)}</div>
    </article>
  );
}

export function SkillsPanel() {
  return (
    <article className="jp-skills">
      <Kicker>Skills</Kicker>
      <h2>The full <span className="jp-accent">technical</span> stack</h2>
      <div className="jp-skill-grid">
        {SKILLS.map(group => {
          const { Icon } = group;
          return (
            <div key={group.sector} className="jp-skill-group">
              <p className="jp-skill-heading"><Icon size={13} aria-hidden="true" /><span>S{group.sector} /</span><span>{group.label}</span></p>
              <div className="jp-skill-chips">{group.skills.map(skill => <span key={skill}>{skill}</span>)}</div>
            </div>
          );
        })}
      </div>
    </article>
  );
}

export function ContactPanel({ onNavigateSolutions, onReturn }: { onNavigateSolutions: () => void; onReturn: () => void }) {
  return (
    <article className="jp-contact">
      <Kicker>Contact</Kicker>
      <h2>Let's build something<br /><span className="jp-warm">together</span></h2>
      <p>{CONTACT_INTRO}</p>
      <button type="button" onClick={onNavigateSolutions} className="jp-text-link jp-solutions-link">
        Explore Data Solutions <ArrowUpRight size={16} strokeWidth={2} aria-hidden="true" />
      </button>
      <div className="jp-contact-links">
        {CONTACT_LINKS.map(({ href, Icon, label, sub }) => (
          <a key={href} href={href} target="_blank" rel="noreferrer">
            <span className="jp-contact-icon"><Icon size={15} /></span>
            <span><span className="jp-contact-label">{label}</span><span className="jp-contact-sub">{sub}</span></span>
            <ArrowUpRight size={15} aria-hidden="true" />
          </a>
        ))}
      </div>
      <button type="button" className="jp-return" onClick={onReturn} aria-label="Return to origin">↑ Return to origin</button>
    </article>
  );
}
