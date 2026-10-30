import { basis, cameraCss, clamp, composeMatrix, dot, length, lookAtView, objectCss, smoothstep, sub, type Vec3 } from './math';
import { buildTimeline, sampleTimeline, type Segment, type Timeline, type Viewport } from './timeline';
import type { JourneyDefinition, PanelSpec, Pose } from './types';

/**
 * The single frame-loop owner for a journey page. Each frame it maps scroll to
 * a camera pose, damps it, writes the CSS3D camera transform for the DOM
 * panels, fades panels by distance, and hands the frame to the WebGL scene
 * (which renders via R3F's manual `advance`). No other rAF loop runs.
 */
export interface JourneyFrame {
  pose: Pose;
  view: number[];
  vp: Viewport;
  fov: number;
  segment: Segment | null;
  /** 0 settled, ~1 at the middle of a long travel. */
  travel: number;
  /** Continuous destination index: integer while at a destination, fractional in travel. */
  place: number;
  /** Camera speed in world units per second (smoothed). */
  speed: number;
  /** Ambient time in seconds; frozen while motion is paused. */
  time: number;
  /** Smoothed pointer in [-1, 1]. */
  pointer: [number, number];
  /** Undamped pointer in -1..1 (y down), or null when no mouse is over the page; used for picking. */
  pointerRaw: [number, number] | null;
  /** True while the mouse is over HTML content (a panel or chrome), where 3D picking yields. */
  pointerOnContent: boolean;
  /** Keep rendering for at least this many more frames (interaction animations while motion is paused). */
  requestFrames: (count: number) => void;
  panelSizes: Map<string, { width: number; height: number }>;
}

type Listener = () => void;

const DESKTOP_FOV = 32;
const NARROW_FOV = 40;

export class JourneyEngine {
  readonly definition: JourneyDefinition;
  private panels: Map<string, PanelSpec>;
  private elements = new Map<string, HTMLElement>();
  private sizes = new Map<string, { width: number; height: number }>();
  private stage: HTMLElement | null = null;
  private camera: HTMLElement | null = null;
  private timeline: Timeline | null = null;
  private vp: Viewport = { width: 1, height: 1, perspective: 1, narrow: false };
  private fov = DESKTOP_FOV;
  private pose: Pose | null = null;
  private frameId = 0;
  private lastTime = 0;
  private time = 0;
  private speed = 0;
  private lastScroll = -1;
  /** Spring-smoothed scroll offset and its velocity: the camera samples the path here. */
  private smoothY = -1;
  private smoothV = 0;
  /** Scroll offset to re-apply once the page has grown to the new journey length. */
  pendingScroll: number | null = null;
  private settledFrames = 0;
  private pointer: [number, number] = [0, 0];
  private pointerTarget: [number, number] = [0, 0];
  private pointerRaw: [number, number] | null = null;
  private pointerOnContent = false;
  private extraFrames = 0;
  private requestFrames = (count: number) => { this.extraFrames = Math.max(this.extraFrames, count); };
  private moving = false;
  private opacities = new Map<string, number>();
  private resizeObserver: ResizeObserver | null = null;
  private layoutQueued = false;
  private listeners = new Set<Listener>();
  private layoutListeners = new Set<Listener>();
  private renderer: ((frame: JourneyFrame) => void) | null = null;
  private lastFrame: JourneyFrame | null = null;
  ambient = true;
  /**
   * Fully faded panels are also made `visibility: hidden`, so the browser skips painting
   * and layering them every frame (the main per-frame cost on phones). Off by default:
   * hidden panels leave the tab order, and desktop keyboard users Tab to far panels.
   */
  private hideFaded = false;
  /** Disable damping and freeze time (deterministic tests). */
  testMode = false;
  heightProvider: () => number = () => window.innerHeight;
  place = 0;

  constructor(definition: JourneyDefinition) {
    this.definition = definition;
    this.panels = new Map(definition.panels.map(p => [p.id, p]));
  }

  // ── wiring ────────────────────────────────────────────────────
  attach(stage: HTMLElement, camera: HTMLElement) {
    this.stage = stage;
    this.camera = camera;
    this.resizeObserver = new ResizeObserver(() => this.queueLayout());
    for (const el of this.elements.values()) this.resizeObserver.observe(el);
    window.addEventListener('scroll', this.wake, { passive: true });
    window.addEventListener('resize', this.onResize, { passive: true });
    window.addEventListener('pointermove', this.onPointer, { passive: true });
    document.documentElement.addEventListener('pointerleave', this.onPointerLeave);
    document.addEventListener('visibilitychange', this.wake);
    this.layout();
    this.wake();
  }

  detach() {
    cancelAnimationFrame(this.frameId);
    this.frameId = 0;
    this.resizeObserver?.disconnect();
    window.removeEventListener('scroll', this.wake);
    window.removeEventListener('resize', this.onResize);
    window.removeEventListener('pointermove', this.onPointer);
    document.documentElement.removeEventListener('pointerleave', this.onPointerLeave);
    document.removeEventListener('visibilitychange', this.wake);
    this.stage = this.camera = null;
  }

  registerPanel(id: string, el: HTMLElement | null) {
    const previous = this.elements.get(id);
    if (previous && previous !== el) this.resizeObserver?.unobserve(previous);
    if (!el) { this.elements.delete(id); return; }
    this.elements.set(id, el);
    this.resizeObserver?.observe(el);
    this.queueLayout();
  }

  setRenderer(renderer: ((frame: JourneyFrame) => void) | null) {
    this.renderer = renderer;
    this.wake();
  }

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    return () => { this.listeners.delete(listener); };
  }

  /** Called after every layout (timeline rebuilt): markers, spacer height. */
  subscribeLayout(listener: Listener) {
    this.layoutListeners.add(listener);
    return () => { this.layoutListeners.delete(listener); };
  }

  getTimeline() { return this.timeline; }
  getViewport() { return this.vp; }
  getFrame() { return this.lastFrame; }

  /** Re-apply a scroll offset computed during layout, after the spacer has been resized. */
  applyPendingScroll() {
    if (this.pendingScroll === null) return;
    window.scrollTo({ top: this.pendingScroll, behavior: 'instant' });
    this.pendingScroll = null;
  }

  /** Place the visitor at a scroll offset with the camera already there (restore, deep link). */
  jumpTo(y: number) {
    window.scrollTo({ top: y, behavior: 'instant' });
    this.smoothY = window.scrollY;
    this.smoothV = 0;
    this.lastScroll = window.scrollY;
    this.pose = null;
    this.wake();
  }

  /** Scroll offset where a destination's first reading position begins. */
  destinationOffset(index: number) {
    return this.timeline?.destinationStarts[index] ?? 0;
  }

  /** Scroll offset of the dwell that reads a given panel. */
  panelOffset(panelId: string) {
    if (!this.timeline) return null;
    const { destinations } = this.definition;
    for (let d = 0; d < destinations.length; d++) {
      const s = destinations[d].shots.findIndex(shot => shot.panel === panelId || shot.with?.includes(panelId));
      if (s >= 0) return this.timeline.dwellStarts.get(`${d}:${s}`) ?? null;
    }
    return null;
  }

  /** Turn hiding of faded panels on or off (on for the lite budget until the keyboard is used). */
  setHideFaded(on: boolean) {
    if (on === this.hideFaded) return;
    this.hideFaded = on;
    if (!on) for (const el of this.elements.values()) el.style.visibility = '';
    this.opacities.clear();
    this.wake();
  }

  // ── layout ────────────────────────────────────────────────────
  private onResize = () => { this.queueLayout(); };

  private onPointer = (event: PointerEvent) => {
    if (event.pointerType !== 'mouse') return;
    this.pointerTarget = [event.clientX / window.innerWidth * 2 - 1, event.clientY / window.innerHeight * 2 - 1];
    this.pointerRaw = this.pointerTarget;
    const target = event.target as Element | null;
    this.pointerOnContent = !!target?.closest?.('.journey-panel > *, [data-journey-ui], nav, header, footer, a, button');
    this.wake();
  };
  private onPointerLeave = () => { this.pointerRaw = null; this.wake(); };

  private queueLayout() {
    if (this.layoutQueued) return;
    this.layoutQueued = true;
    requestAnimationFrame(() => { this.layoutQueued = false; this.layout(); });
  }

  private layout() {
    if (!this.stage || !this.camera) return;
    const width = window.innerWidth;
    const height = this.heightProvider();
    const narrow = width < 820 || width / height < 0.9;
    this.fov = narrow ? NARROW_FOV : DESKTOP_FOV;
    const perspective = height / 2 / Math.tan((this.fov * Math.PI) / 360);
    this.vp = { width, height, perspective, narrow };
    this.stage.style.perspective = `${perspective}px`;
    this.camera.style.width = `${width}px`;
    this.camera.style.height = `${height}px`;

    for (const [id, el] of this.elements) {
      const spec = this.panels.get(id);
      if (!spec) continue;
      const panelWidth = Math.min(spec.width, narrow ? width - 32 : width - 140);
      el.style.width = `${panelWidth}px`;
      this.sizes.set(id, { width: panelWidth, height: el.offsetHeight });
    }
    // Stacked panels hang under their parent at its measured height; then place everything.
    for (const authored of this.definition.panels) {
      const parent = authored.below && this.panels.get(authored.below.panel);
      const own = this.sizes.get(authored.id);
      const parentSize = authored.below && this.sizes.get(authored.below.panel);
      if (!parent || !own || !parentSize) continue;
      const { up } = basis(parent.yaw, parent.pitch ?? 0);
      const drop = parentSize.height / 2 + (authored.below!.gap ?? 28) + own.height / 2;
      const position: Vec3 = [parent.position[0] - up[0] * drop, parent.position[1] - up[1] * drop, parent.position[2] - up[2] * drop];
      this.panels.set(authored.id, { ...authored, position, yaw: parent.yaw, pitch: parent.pitch });
    }
    for (const [id, el] of this.elements) {
      const spec = this.panels.get(id);
      if (!spec) continue;
      const { right, up, normal } = basis(spec.yaw, spec.pitch ?? 0);
      el.style.transform = objectCss(composeMatrix(spec.position, right, up, normal));
    }
    const heights = new Map([...this.sizes].map(([id, s]) => [id, s.height]));
    const previous = this.timeline;
    this.timeline = buildTimeline(this.definition.destinations, this.panels, heights, this.vp);
    // A new layout (resize, font load) changes segment lengths. Keep the visitor at the same
    // point of the journey (same segment, same fraction) instead of letting the same scroll
    // offset land somewhere else, which would snap the camera.
    if (previous && previous.segments.length === this.timeline.segments.length && window.scrollY > 0) {
      const remap = (y: number) => {
        const i = previous.segments.findIndex(s => y < s.end);
        if (i < 0) return this.timeline!.total;
        const from = previous.segments[i];
        const to = this.timeline!.segments[i];
        const f = from.end > from.start ? (y - from.start) / (from.end - from.start) : 0;
        return to.start + f * (to.end - to.start);
      };
      const nextScroll = remap(window.scrollY);
      if (this.smoothY >= 0) this.smoothY = remap(this.smoothY);
      this.lastScroll = nextScroll;
      this.pendingScroll = nextScroll;
      window.scrollTo({ top: nextScroll, behavior: 'instant' });
    }
    this.layoutListeners.forEach(l => l());
    this.wake();
  }

  // ── frame loop ────────────────────────────────────────────────
  wake = () => {
    if (!this.frameId && !document.hidden) {
      this.lastTime = performance.now();
      this.frameId = requestAnimationFrame(this.tick);
    }
  };

  private tick = (now: number) => {
    this.frameId = 0;
    if (!this.timeline || !this.camera) return;
    // Real elapsed time (capped only for long gaps such as a backgrounded tab), so ambient
    // motion never slows or pauses when a frame runs long.
    const elapsed = Math.min((now - this.lastTime) / 1000, 0.25);
    const dt = Math.min(elapsed, 0.1);
    this.lastTime = now;
    const scrollY = window.scrollY;
    // Only a programmatic teleport (far beyond any gesture) cuts; everything else is travelled.
    const jumped = this.lastScroll >= 0 && Math.abs(scrollY - this.lastScroll) > this.vp.height * 40;
    this.lastScroll = scrollY;

    // Critically damped spring on the scroll offset (not on the pose): wheel notches
    // become continuous velocity in either direction, and the camera stays on the
    // authored path instead of cutting corners. ω = 11 settles 95% in ~0.43 s (the measured balance of smoothness and response).
    if (this.smoothY < 0 || !this.pose || this.testMode || jumped) {
      this.smoothY = scrollY;
      this.smoothV = 0;
    } else {
      const omega = 11;
      const steps = Math.max(1, Math.ceil(dt / (1 / 120)));
      const h = dt / steps;
      for (let i = 0; i < steps; i++) {
        const accel = omega * omega * (scrollY - this.smoothY) - 2 * omega * this.smoothV;
        this.smoothV += accel * h;
        this.smoothY += this.smoothV * h;
      }
      if (Math.abs(scrollY - this.smoothY) < 0.5 && Math.abs(this.smoothV) < 8) {
        // Settle exactly so panels land at 1:1 with crisp text.
        this.smoothY = scrollY;
        this.smoothV = 0;
      }
    }
    const sample = sampleTimeline(this.timeline, this.smoothY);
    const target = sample.pose;
    const prev = this.pose?.position;
    // Speed-adaptive glide: at reading speeds the camera rides the exact authored path;
    // when scrolling fast it low-passes that path, so the cinematic pull-backs and
    // stop-go holds of a whole sequence blend into one continuous sweep instead of
    // reading as jitter. Continuous in speed, so it vanishes as scrolling slows.
    const speedVh = Math.abs(this.smoothV) / this.vp.height;
    const tau = smoothstep(1.2, 4, speedVh) * 0.3;
    if (!this.pose || jumped || this.testMode || tau < 0.002) {
      this.pose = { position: [...target.position] as Vec3, target: [...target.target] as Vec3 };
    } else {
      const a = 1 - Math.exp(-dt / tau);
      const mix = (from: Vec3, to: Vec3): Vec3 => [from[0] + (to[0] - from[0]) * a, from[1] + (to[1] - from[1]) * a, from[2] + (to[2] - from[2]) * a];
      this.pose = { position: mix(this.pose.position, target.position), target: mix(this.pose.target, target.target) };
    }
    const delta = prev ? length(sub(target.position, prev)) + (this.smoothY === scrollY ? 0 : 0.05) : 0;
    this.speed = delta > 0 ? this.speed * 0.85 + (length(sub(target.position, prev!)) / Math.max(dt, 1e-3)) * 0.15 : this.speed * 0.8;

    if (!this.testMode && this.ambient) this.time += elapsed;
    this.pointer = [this.pointer[0] + (this.pointerTarget[0] - this.pointer[0]) * (1 - Math.exp(-4 * dt)), this.pointer[1] + (this.pointerTarget[1] - this.pointer[1]) * (1 - Math.exp(-4 * dt))];

    const view = lookAtView(this.pose.position, this.pose.target);
    this.camera.style.transform = cameraCss(view, this.vp.perspective, this.vp.width, this.vp.height);
    const moving = delta >= 0.05;
    if (moving !== this.moving) {
      this.moving = moving;
      // will-change only while moving, so text re-rasterizes crisply at rest.
      this.camera.style.willChange = moving ? 'transform' : 'auto';
      this.camera.classList.toggle('is-moving', moving);
    }
    this.updatePanels(this.pose.position);

    const seg = sample.segment;
    this.place = seg.kind === 'travel' ? seg.destination - 1 + sample.t : seg.destination;
    const frame: JourneyFrame = {
      pose: this.pose, view, vp: this.vp, fov: this.fov, segment: seg, travel: sample.travel,
      place: this.place, speed: this.speed, time: this.time, pointer: this.pointer, pointerRaw: this.pointerRaw, pointerOnContent: this.pointerOnContent, requestFrames: this.requestFrames, panelSizes: this.sizes,
    };
    this.lastFrame = frame;
    this.renderer?.(frame);
    this.listeners.forEach(l => l());

    const pointerSettled = Math.abs(this.pointerTarget[0] - this.pointer[0]) + Math.abs(this.pointerTarget[1] - this.pointer[1]) < 0.002;
    this.settledFrames = moving || !pointerSettled ? 0 : this.settledFrames + 1;
    // Keep animating while moving, while ambient motion plays, or for a few frames to settle.
    if (this.extraFrames > 0) this.extraFrames--;
    // Continue directly (not via wake(), which resets the clock): lastTime must stay the previous
    // frame's timestamp or every frame loses its own processing time and motion runs slow.
    if ((moving || (this.ambient && this.renderer && !this.testMode) || this.settledFrames < 3 || this.extraFrames > 0) && !document.hidden) {
      this.frameId = requestAnimationFrame(this.tick);
    }
  };

  private updatePanels(eye: Vec3) {
    const p = this.vp.perspective;
    for (const [id, el] of this.elements) {
      const spec = this.panels.get(id);
      if (!spec) continue;
      const { normal } = basis(spec.yaw, spec.pitch ?? 0);
      const toEye = sub(eye, spec.position);
      const distance = length(toEye);
      const facing = dot(normal, toEye) / Math.max(distance, 1);
      const opacity = clamp(1 - smoothstep(p * 1.35, p * 3.2, distance), 0, 1) * smoothstep(0.05, 0.35, facing);
      const rounded = Math.round(opacity * 50) / 50;
      if (this.opacities.get(id) === rounded) continue;
      this.opacities.set(id, rounded);
      // Distant panels stay focusable (keyboard users can Tab to them, which travels there) but ignore the pointer.
      el.style.opacity = String(rounded);
      el.style.pointerEvents = rounded > 0.5 ? 'auto' : 'none';
      el.classList.toggle('is-near', rounded > 0.6);
      if (this.hideFaded) el.style.visibility = rounded === 0 ? 'hidden' : '';
    }
  }
}
