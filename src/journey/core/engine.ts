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
    this.timeline = buildTimeline(this.definition.destinations, this.panels, heights, this.vp);
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
    const dt = Math.min((now - this.lastTime) / 1000, 0.05);
    this.lastTime = now;
    const scrollY = window.scrollY;
    const jumped = this.lastScroll >= 0 && Math.abs(scrollY - this.lastScroll) > this.vp.height * 3;
    this.lastScroll = scrollY;

    // Critically damped spring on the scroll offset (not on the pose): wheel notches
    // become continuous velocity in either direction, and the camera stays on the
    // authored path instead of cutting corners. ω = 13 settles 95% in ~0.36 s.
    if (this.smoothY < 0 || !this.pose || this.testMode || jumped) {
      this.smoothY = scrollY;
      this.smoothV = 0;
    } else {
      const omega = 13;
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
    this.pose = { position: [...target.position] as Vec3, target: [...target.target] as Vec3 };
    const delta = prev ? length(sub(target.position, prev)) + (this.smoothY === scrollY ? 0 : 0.05) : 0;
    this.speed = delta > 0 ? this.speed * 0.85 + (length(sub(target.position, prev!)) / Math.max(dt, 1e-3)) * 0.15 : this.speed * 0.8;

    if (!this.testMode && this.ambient) this.time += dt;
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
    if (moving || (this.ambient && this.renderer && !this.testMode) || this.settledFrames < 3 || this.extraFrames > 0) this.wake();
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
    }
  }
}
