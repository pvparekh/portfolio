/**
 * Minimal vector/matrix math for the journey core (no three.js), so camera
 * choreography and CSS3D panel projection run before the WebGL chunk loads.
 * Matrices are column-major (same layout as three.js / CSS matrix3d).
 */
export type Vec3 = [number, number, number];

export const add = (a: Vec3, b: Vec3): Vec3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
export const sub = (a: Vec3, b: Vec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
export const scale = (a: Vec3, k: number): Vec3 => [a[0] * k, a[1] * k, a[2] * k];
export const dot = (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
export const cross = (a: Vec3, b: Vec3): Vec3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
export const length = (a: Vec3) => Math.hypot(a[0], a[1], a[2]);
export const normalize = (a: Vec3): Vec3 => { const l = length(a) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const lerp3 = (a: Vec3, b: Vec3, t: number): Vec3 => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
export const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
export const smoothstep = (e0: number, e1: number, x: number) => { const t = clamp((x - e0) / (e1 - e0), 0, 1); return t * t * (3 - 2 * t); };
export const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
export const easeInOutSine = (t: number) => -(Math.cos(Math.PI * t) - 1) / 2;
export const deg = (d: number) => (d * Math.PI) / 180;

/** Orientation basis for an object rotated by yaw (Y) then pitch (X); it faces +Z when yaw = pitch = 0. */
export function basis(yawDeg: number, pitchDeg = 0) {
  const y = deg(yawDeg);
  const p = deg(pitchDeg);
  const right: Vec3 = [Math.cos(y), 0, -Math.sin(y)];
  const forward: Vec3 = [Math.sin(y) * Math.cos(p), -Math.sin(p), Math.cos(y) * Math.cos(p)];
  const up = cross(forward, right);
  return { right, up, normal: forward };
}

/** World matrix (column-major) from position and basis. */
export function composeMatrix(position: Vec3, right: Vec3, up: Vec3, normal: Vec3): number[] {
  return [
    right[0], right[1], right[2], 0,
    up[0], up[1], up[2], 0,
    normal[0], normal[1], normal[2], 0,
    position[0], position[1], position[2], 1,
  ];
}

/** Camera view matrix (world -> camera) looking from eye toward target with world up. */
export function lookAtView(eye: Vec3, target: Vec3, worldUp: Vec3 = [0, 1, 0]): number[] {
  const z = normalize(sub(eye, target));
  let x = cross(worldUp, z);
  if (length(x) < 1e-6) x = [1, 0, 0];
  x = normalize(x);
  const y = cross(z, x);
  return [
    x[0], y[0], z[0], 0,
    x[1], y[1], z[1], 0,
    x[2], y[2], z[2], 0,
    -dot(x, eye), -dot(y, eye), -dot(z, eye), 1,
  ];
}

const fmt = (v: number) => (Math.abs(v) < 1e-10 ? 0 : v);

/** CSS3DRenderer-equivalent camera transform (y axis flipped for CSS). */
export function cameraCss(view: number[], perspective: number, width: number, height: number) {
  const e = view;
  const m = [
    e[0], -e[1], e[2], e[3],
    e[4], -e[5], e[6], e[7],
    e[8], -e[9], e[10], e[11],
    e[12], -e[13], e[14], e[15],
  ].map(fmt).join(',');
  return `translateZ(${fmt(perspective)}px) matrix3d(${m}) translate(${width / 2}px,${height / 2}px)`;
}

/** CSS3DRenderer-equivalent object transform. */
export function objectCss(world: number[]) {
  const e = world;
  const m = [
    e[0], e[1], e[2], e[3],
    -e[4], -e[5], -e[6], -e[7],
    e[8], e[9], e[10], e[11],
    e[12], e[13], e[14], e[15],
  ].map(fmt).join(',');
  return `translate(-50%,-50%) matrix3d(${m})`;
}

/** Centripetal Catmull-Rom through points at parameter t in [0, 1]. */
export function catmullRom(points: Vec3[], t: number): Vec3 {
  const n = points.length;
  if (n === 1) return points[0];
  if (n === 2) return lerp3(points[0], points[1], t);
  const segs = n - 1;
  const f = clamp(t, 0, 1) * segs;
  const i = Math.min(Math.floor(f), segs - 1);
  const u = f - i;
  const p0 = points[Math.max(i - 1, 0)];
  const p1 = points[i];
  const p2 = points[i + 1];
  const p3 = points[Math.min(i + 2, n - 1)];
  const dt = (a: Vec3, b: Vec3) => Math.max(Math.pow(length(sub(b, a)), 0.5), 1e-4);
  let t01 = dt(p0, p1), t12 = dt(p1, p2), t23 = dt(p2, p3);
  if (i === 0) t01 = t12;
  if (i + 2 >= n) t23 = t12;
  const out: Vec3 = [0, 0, 0];
  for (let k = 0; k < 3; k++) {
    let m1 = (p1[k] - p0[k]) / t01 - (p2[k] - p0[k]) / (t01 + t12) + (p2[k] - p1[k]) / t12;
    let m2 = (p2[k] - p1[k]) / t12 - (p3[k] - p1[k]) / (t12 + t23) + (p3[k] - p2[k]) / t23;
    m1 *= t12;
    m2 *= t12;
    const a = 2 * p1[k] - 2 * p2[k] + m1 + m2;
    const b = -3 * p1[k] + 3 * p2[k] - 2 * m1 - m2;
    out[k] = a * u * u * u + b * u * u + m1 * u + p1[k];
  }
  return out;
}
