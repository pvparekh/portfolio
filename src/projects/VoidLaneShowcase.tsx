import { ArrowUpRight, Images, Play } from 'lucide-react';
import { openLightbox } from '../gallery/Lightbox';
import { VOID_LANE, VOID_LANE_ITEMS, VOID_LANE_MEDIA, displaySrc, thumbSrc, type GalleryMedia } from './voidLane';
import './voidLane.css';

/*
 * Void Lane, presented as the featured build. The standard page and the
 * journey share the strings and the filmstrip below, so both layouts show
 * identical content; the full-size gallery opens in the shared lightbox and
 * nothing beyond the thumbnails is fetched until it does.
 */

const open = (index: number) => openLightbox(VOID_LANE_ITEMS(), index);
const ITEMS_LABEL = `Open gallery (${VOID_LANE_MEDIA.length})`;

/** Larger renditions are only requested where the hero is drawn wide. */
const heroSrcSet = (m: GalleryMedia) => `${displaySrc(m)} 1600w, /projects/void-lane/${m.stem}-full.webp 2560w`;

/** Thumbnails of every capture and clip; each opens the gallery at itself. */
export function VoidLaneFilmstrip({ from = 0, className = '' }: { from?: number; className?: string }) {
  return (
    <ul className={`vl-filmstrip ${className}`} aria-label="Void Lane gallery">
      {VOID_LANE_MEDIA.slice(from).map((m, i) => (
        <li key={m.stem}>
          <button type="button" className={`vl-thumb ${m.kind === 'video' ? 'is-video' : ''}`} onClick={() => open(from + i)} aria-label={`${m.label}: ${m.alt}`}>
            <span className="vl-thumb-frame">
              <img src={thumbSrc(m)} alt="" width={480} height={270} loading="lazy" decoding="async" />
            </span>
            {m.kind === 'video' && <span className="vl-thumb-play" aria-hidden="true"><Play size={14} fill="currentColor" /></span>}
            <span className="vl-thumb-label">{m.label}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}

function GalleryButton({ className }: { className: string }) {
  return (
    <button type="button" className={className} onClick={() => open(0)}>
      <Images size={16} aria-hidden="true" />{ITEMS_LABEL}
    </button>
  );
}

/** The playtest build on itch.io, a secondary link beside the gallery button. */
function BuildLink({ className }: { className: string }) {
  return (
    <a className={className} href={VOID_LANE.build.href} target="_blank" rel="noreferrer">
      {VOID_LANE.build.label} <ArrowUpRight size={15} aria-hidden="true" />
    </a>
  );
}

/**
 * The build is password-protected: one quiet line under the actions says so
 * and offers a prefilled email asking for the password.
 */
function EarlyAccessNote() {
  return (
    <p className="vl-early">
      <span className="vl-early-note">{VOID_LANE.earlyAccess.note}</span>
      <a className="vl-early-link" href={VOID_LANE.earlyAccess.href}>
        {VOID_LANE.earlyAccess.label}<ArrowUpRight size={13} aria-hidden="true" />
      </a>
    </p>
  );
}

function ProofPoints({ className }: { className: string }) {
  return (
    <div className={className} aria-label="Engineering highlights">
      {VOID_LANE.proofPoints.map((point, i) => (
        <div key={point.label}><span>0{i + 1}</span><p><strong className="vl-proof-label">{point.label}.</strong> {point.text}</p></div>
      ))}
    </div>
  );
}

function StudioFlow({ className }: { className: string }) {
  return (
    <ol className={className}>
      {VOID_LANE.studio.map(step => (
        <li key={step.code}>
          <span className="vl-step-index">{step.code}</span>
          <div><strong>{step.label}</strong><p>{step.detail}</p></div>
        </li>
      ))}
    </ol>
  );
}

function Notes({ className }: { className: string }) {
  return (
    <div className={className}>
      <p><strong>Status</strong> {VOID_LANE.status}</p>
    </div>
  );
}

/** Standard page: a cinematic hero, the filmstrip, then the story and how the studio works. */
export function VoidLaneShowcase() {
  const hero = VOID_LANE_MEDIA[0];
  return (
    <article className="vl-showcase" aria-labelledby="void-lane-title">
      <div className="renaissance-project-topline">
        <span>{VOID_LANE.topline[0]}</span>
        <span>{VOID_LANE.topline[1]}</span>
      </div>
      {hero && (
        <button type="button" className="vl-hero" onClick={() => open(0)} aria-label={`Open the Void Lane gallery: ${hero.alt}`}>
          <img
            src={displaySrc(hero)} srcSet={heroSrcSet(hero)} sizes="(min-width: 1280px) 1240px, 100vw"
            alt="" width={1600} height={900} loading="lazy" decoding="async"
          />
          <span className="vl-hero-caption" aria-hidden="true">
            <span>{hero.label}</span><span className="vl-hero-caption-text">{hero.caption}</span>
          </span>
        </button>
      )}
      <VoidLaneFilmstrip from={1} />
      <div className="vl-body">
        <div className="vl-story">
          <p className="renaissance-project-overline">{VOID_LANE.tagline}</p>
          <h3 id="void-lane-title">{VOID_LANE.name}</h3>
          <p className="vl-lead">{VOID_LANE.lead}</p>
          <p className="renaissance-project-description">{VOID_LANE.description}</p>
          <ProofPoints className="renaissance-proof-points vl-proof" />
          <div className="renaissance-project-actions">
            <GalleryButton className="renaissance-primary-project-link vl-gallery-button" />
            <BuildLink className="renaissance-text-project-link" />
          </div>
          <EarlyAccessNote />
        </div>
        <aside className="vl-studio" aria-label="How the Void Lane studio ships">
          <p className="vl-studio-caption">{VOID_LANE.studioCaption}</p>
          <StudioFlow className="vl-studio-flow" />
        </aside>
      </div>
      <div className="renaissance-tech-strip" aria-label="Void Lane technologies">
        {VOID_LANE.tech.map(t => <span key={t}>{t}</span>)}
      </div>
      <Notes className="vl-notes" />
    </article>
  );
}

/** Journey: the reading panel beside the 3D exhibit (its screens are the hero). */
export function VoidLanePanel() {
  const hero = VOID_LANE_MEDIA[0];
  return (
    <article className="jp-exhibit jp-exhibit--vl" aria-labelledby="jp-vl-title">
      <p className="jp-topline"><span>{VOID_LANE.topline[0]}</span><span>{VOID_LANE.topline[1]}</span></p>
      {hero && <img className="jp-mobile-preview" src={displaySrc(hero)} alt={hero.alt} loading="lazy" decoding="async" width={1600} height={900} />}
      <p className="jp-overline">{VOID_LANE.tagline}</p>
      <h3 id="jp-vl-title">{VOID_LANE.name}</h3>
      <p className="jp-lead">{VOID_LANE.lead}</p>
      <p className="jp-desc">{VOID_LANE.description}</p>
      <ProofPoints className="jp-proof" />
      <div className="jp-actions">
        <GalleryButton className="jp-primary vl-gallery-button" />
        <BuildLink className="jp-text-link" />
      </div>
      <EarlyAccessNote />
      <div className="jp-tech" aria-label="Void Lane technologies">{VOID_LANE.tech.map(t => <span key={t}>{t}</span>)}</div>
    </article>
  );
}

/** Journey: the gallery and the studio, read beside the exhibit's second screen. */
export function VoidLaneStudioPanel() {
  const hero = VOID_LANE_MEDIA[0];
  return (
    <aside className="jp-architecture jp-vl-studio" aria-label="How the Void Lane studio ships">
      {hero && (
        <p className="vl-hero-caption-inline"><span>{hero.label}</span>{hero.caption}</p>
      )}
      <VoidLaneFilmstrip from={1} className="is-compact" />
      <p className="jp-topline"><span>{VOID_LANE.studioCaption}</span></p>
      <StudioFlow className="vl-studio-flow" />
      <Notes className="vl-notes" />
    </aside>
  );
}
