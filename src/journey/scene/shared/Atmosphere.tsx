import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import type { Palette, SkyMotif } from '../../core/types';
import { LITE } from '../../core/budget';
import { frameRef } from './frame';

/*
 * The backdrop of every destination: a base gradient (the void's own colour)
 * plus a procedural motif unique to the destination, cross-faded while travelling.
 *
 * Cost is kept small on purpose:
 * - the motif is painted into an offscreen target at half resolution (a third on
 *   the lite budget) and upscaled: backdrops are soft, so this is visually
 *   identical for about a quarter of the fragment work;
 * - each page compiles only the motifs its destinations use, and a motif is only
 *   evaluated while it is on screen (one at rest, two during a cross-fade);
 * - distant stars are added in the full-resolution pass so they stay pin sharp.
 * The motif depends only on view direction, so it reads as infinitely far away.
 */

const MOTIFS: SkyMotif[] = ['nebula', 'aurora', 'dusk', 'galaxy', 'dawn', 'streams', 'storm', 'contours', 'confluence', 'ripples', 'blueprint', 'shards', 'circuit', 'hex'];

const common = /* glsl */ `
float hash13(vec3 p3) { p3 = fract(p3 * 0.1031); p3 += dot(p3, p3.zyx + 31.32); return fract((p3.x + p3.y) * p3.z); }
// Value noise from a 32^3 random texture: hardware trilinear filtering on smoothstep-remapped
// coordinates gives the same smooth noise as eight hashes, for one fetch. (Computed noise in
// nested loops cost seconds of D3D shader compilation at load.) textureLod: no gradients in loops.
precision highp sampler3D;
uniform sampler3D uNoise;
float vnoise(vec3 x) {
  vec3 i = floor(x); vec3 f = fract(x); f = f * f * (3.0 - 2.0 * f);
  return textureLod(uNoise, (i + f + 0.5) / 32.0, 0.0).r;
}
float fbm3(vec3 p) { float s = 0.0, a = 0.5; for (int i = 0; i < 3; i++) { s += a * vnoise(p); p = p * 2.03 + vec3(1.7, 9.2, 3.1); a *= 0.5; } return s / 0.875; }
float fbm4(vec3 p) { float s = 0.0, a = 0.5; for (int i = 0; i < 4; i++) { s += a * vnoise(p); p = p * 2.03 + vec3(1.7, 9.2, 3.1); a *= 0.5; } return s / 0.9375; }
// An anti-aliased line at every integer value of v.
float lineAA(float v, float w) { float d = abs(fract(v - 0.5) - 0.5); return 1.0 - smoothstep(0.0, fwidth(v) * w, d); }
vec2 cubeUV(vec3 d, out vec3 face) {
  vec3 a = abs(d);
  if (a.x >= a.y && a.x >= a.z) { face = vec3(sign(d.x), 0.0, 0.0); return d.zy / a.x; }
  if (a.y >= a.z) { face = vec3(0.0, sign(d.y), 0.0); return d.xz / a.y; }
  face = vec3(0.0, 0.0, sign(d.z)); return d.xy / a.z;
}
vec3 around(vec3 d, vec3 T) { return normalize(d - T * dot(d, T) + vec3(1e-5)); }
`;

/** Each motif: emission added over the base gradient. d = view direction, A/B = colours, T = organising direction. */
const motifSource: Record<SkyMotif, string> = {
  // Domain-warped clouds of gas with dust lanes and a few bright knots.
  nebula: `
    vec3 p = d * 2.2 + vec3(0.0, 0.0, t * 0.006);
    vec2 q = vec2(fbm4(p), fbm4(p + vec3(5.2, 1.3, 2.8)));
    float r = fbm4(p + 3.2 * vec3(q, q.x * q.y) + vec3(t * 0.004, 0.0, 0.0));
    float dens = smoothstep(0.4, 0.86, r);
    float dust = smoothstep(0.52, 0.72, fbm3(p * 3.1 + 7.0));
    vec3 col = mix(A, B, smoothstep(0.3, 0.8, q.x)) * dens * (1.0 - 0.75 * dust);
    return (col + B * pow(dens, 5.0) * 0.8) * 0.55;`,
  // Two layers of aurora curtains: sharp lower hems, soft tops, fine vertical striations.
  aurora: `
    vec3 col = vec3(0.0);
    for (int i = 0; i < 2; i++) {
      float fi = float(i);
      vec2 xz = d.xz * (1.0 + fi * 0.4);
      float warp = fbm3(vec3(xz * 1.4, t * 0.03 + fi * 3.0)) * 2.2;
      float curtain = smoothstep(0.45, 0.95, vnoise(vec3(xz * (3.0 + fi * 1.5) + warp, t * 0.05 + fi * 11.0)));
      float hem = 0.04 + 0.11 * fi + 0.06 * (warp - 1.1);
      float profile = smoothstep(hem - 0.01, hem + 0.03, d.y) * exp(-max(d.y - hem, 0.0) * (5.0 - fi));
      float striae = 0.55 + 0.45 * vnoise(vec3(xz * 42.0, t * 0.25));
      col += mix(A, B, smoothstep(hem, hem + 0.35, d.y)) * curtain * profile * striae * (0.55 - fi * 0.15);
    }
    return col * 1.25;`,
  // Dusk at the end of the colonnade: a soft glow low on the horizon and drifting strata of lit cloud.
  dusk: `
    float c = max(dot(d, T), 0.0);
    float glow = pow(c, 10.0) * 0.1 + pow(c, 3.0) * 0.035;
    float strata = smoothstep(0.45, 0.85, fbm3(vec3(d.x * 2.5 + t * 0.006, d.y * 26.0, d.z * 2.5)));
    strata *= smoothstep(-0.02, 0.1, d.y) * exp(-max(d.y, 0.0) * 5.0);
    return A * glow + mix(B, A, c) * strata * 0.22;`,
  // A galactic band across the sky with clumped stars, a dust lane and a bright core.
  galaxy: `
    float lat = dot(d, T);
    vec3 C = normalize(cross(T, vec3(0.0, 0.0, 1.0)));
    float toward = max(dot(d, C), 0.0);
    float clump = fbm3(d * 6.0 + vec3(t * 0.003));
    float dust = smoothstep(0.5, 0.75, fbm3(d * 13.0 + 3.0)) * exp(-lat * lat * 260.0);
    vec3 col = mix(A, B, toward) * exp(-lat * lat * 38.0) * (0.35 + 0.65 * clump) * (1.0 - 0.8 * dust) * 0.45;
    return col + B * pow(toward, 10.0) * exp(-lat * lat * 20.0) * 0.6;`,
  // A sun just under the horizon: corona, slow rays, banded warm haze along the horizon.
  dawn: `
    float c = max(dot(d, T), 0.0);
    vec3 v = around(d, T);
    float rays = smoothstep(0.4, 0.95, vnoise(v * 9.0 + vec3(0.0, 0.0, t * 0.05))) * pow(c, 4.0) * 0.18;
    float corona = pow(c, 40.0) * 0.3 + pow(c, 7.0) * 0.1;
    float bands = (0.6 + 0.4 * fbm3(vec3(d.x * 2.0 + t * 0.008, d.y * 30.0, d.z * 2.0))) * exp(-abs(d.y - T.y) * 7.0);
    return A * (corona + rays) + mix(B, A, c) * bands * 0.22 * (0.4 + 0.6 * pow(c, 1.5));`,
  // Streamlines of data flowing across the sky, with bright packets travelling along them.
  streams: `
    float w = fbm3(d * 2.6 + vec3(0.0, 0.0, t * 0.02));
    float v = (d.y * 9.0 + w * 2.6 + sin(d.x * 3.0 + d.z * 2.0) * 0.4) * 2.0;
    float lines = lineAA(v, 1.4);
    float flow = fract((d.x * 0.8 - d.z * 0.6) * 3.0 + w * 1.5 - t * 0.06 + floor(v + 0.5) * 0.37);
    float fade = smoothstep(-0.15, 0.25, d.y) * (1.0 - smoothstep(0.55, 0.9, d.y));
    return (A * lines * (0.1 + 0.9 * pow(flow, 10.0)) + B * lines * 0.04 + A * 0.03 * w) * fade;`,
  // Friction: a slow ember storm of ridged, churning turbulence.
  storm: `
    vec3 p = d * 2.4;
    vec2 q = vec2(fbm3(p + vec3(t * 0.02, 0.0, 0.0)), fbm3(p + vec3(4.1, t * 0.015, 2.3)));
    vec3 r3 = p + 1.8 * vec3(q, q.x);
    float s = 0.0, a = 0.5;
    for (int i = 0; i < 4; i++) { float n = 1.0 - abs(vnoise(r3) * 2.0 - 1.0); s += a * n * n; r3 = r3 * 2.1 + vec3(3.1, 1.7, 5.3); a *= 0.5; }
    float heat = smoothstep(0.35, 0.95, s);
    return (mix(B, A, heat) * heat * 0.5 + A * pow(heat, 6.0) * 0.6) * smoothstep(-0.3, 0.2, d.y);`,
  // A topographic survey of a slowly shifting data terrain.
  contours: `
    float e = fbm4(d * 2.0 + vec3(0.0, t * 0.008, 0.0));
    float v = e * 22.0;
    float shade = smoothstep(0.3, 0.8, e);
    vec3 col = mix(B, A, shade) * (lineAA(v, 1.2) * 0.22 + lineAA(v / 5.0, 1.6) * 0.55) + A * 0.035 * shade;
    return col * (0.4 + 0.6 * smoothstep(-0.2, 0.3, d.y));`,
  // Rivers of light converging on one point, with pulses flowing inward.
  confluence: `
    float c = dot(d, T);
    float dist = acos(clamp(c, -1.0, 1.0));
    vec3 v = around(d, T);
    float n = (vnoise(v * 5.0 + vec3(dist * 1.3)) + 0.5 * vnoise(v * 11.0 + vec3(dist * 2.1 + 4.0))) / 1.5;
    float river = pow(1.0 - abs(n * 2.0 - 1.0), 14.0);
    float pulse = pow(0.5 + 0.5 * sin(dist * 26.0 + t * 1.1 - n * 6.0), 10.0);
    return A * river * (0.12 + 0.8 * pulse) * exp(-dist * 1.1) + B * pow(max(c, 0.0), 30.0) * 0.6 + B * river * 0.04;`,
  // Milestones: rings expanding slowly from a point below the horizon.
  ripples: `
    float c = dot(d, T);
    float dist = acos(clamp(c, -1.0, 1.0));
    float v = dist * 9.0 - t * 0.12;
    vec3 col = A * (lineAA(v, 1.5) * 0.25 + lineAA(v / 4.0, 2.0) * 0.6) * exp(-dist * 1.2) + B * pow(max(c, 0.0), 40.0) * 0.5;
    return col * (0.6 + 0.4 * fbm3(d * 4.0 + t * 0.01));`,
  // A drafting room: a measured grid on every wall with a slow scanning sweep.
  blueprint: `
    vec3 f; vec2 g = cubeUV(d, f) * 8.0;
    float minor = max(lineAA(g.x, 1.0), lineAA(g.y, 1.0));
    float major = max(lineAA(g.x / 4.0, 1.4), lineAA(g.y / 4.0, 1.4));
    float sweep = exp(-pow((d.y - (fract(t * 0.025) * 2.4 - 1.2)) * 7.0, 2.0));
    return (A * (minor * 0.1 + major * 0.32) * (1.0 + sweep * 2.0) + B * sweep * 0.05) * (0.5 + 0.5 * smoothstep(-0.4, 0.5, d.y));`,
  // Fractured glass: drifting Voronoi facets with luminous edges.
  shards: `
    vec3 p = d * 4.0;
    vec3 i = floor(p); vec3 fr = fract(p);
    float f1 = 8.0, f2 = 8.0, id = 0.0;
    for (int z = -1; z <= 1; z++) for (int y = -1; y <= 1; y++) for (int x = -1; x <= 1; x++) {
      vec3 g = vec3(float(x), float(y), float(z));
      vec3 h = vec3(hash13(i + g), hash13(i + g + 17.1), hash13(i + g + 31.7));
      float dd = length(g + 0.5 + 0.4 * sin(t * 0.05 + 6.2831 * h) - fr);
      if (dd < f1) { f2 = f1; f1 = dd; id = h.x; } else if (dd < f2) { f2 = dd; }
    }
    float edge = f2 - f1;
    float line = 1.0 - smoothstep(0.0, 0.05 + fwidth(edge) * 1.5, edge);
    float shimmer = pow(0.5 + 0.5 * sin(t * 0.4 + id * 40.0), 6.0);
    return A * line * 0.45 + B * (0.3 + 0.7 * id) * smoothstep(0.6, 0.0, f1) * 0.05 * (0.4 + shimmer);`,
  // Circuit traces (Truchet tiles) with signals running along them.
  circuit: `
    vec3 f; vec2 g = cubeUV(d, f) * 12.0 + f.xy * 13.0 + f.z * 7.0;
    vec2 cell = floor(g); vec2 lp = fract(g) - 0.5;
    float h = hash13(vec3(cell, dot(f, vec3(1.0, 2.0, 3.0))));
    if (h > 0.5) lp.x = -lp.x;
    vec2 c1 = lp - 0.5; vec2 c2 = lp + 0.5;
    float d1 = abs(length(c1) - 0.5); float d2 = abs(length(c2) - 0.5);
    float fw = fwidth(g.x) * 1.2;
    float trace = 1.0 - smoothstep(0.02, 0.02 + fw, min(d1, d2));
    vec2 cc = d1 < d2 ? c1 : c2;
    float flow = fract(atan(cc.y, cc.x) / 1.5708 + h * 7.0 - t * 0.35);
    float live = step(0.45, hash13(vec3(cell, 5.0)));
    float pad = (1.0 - smoothstep(0.05, 0.05 + fw, length(lp - vec2(0.0, 0.5)))) * step(0.85, h);
    return A * trace * 0.16 + B * trace * pow(flow, 16.0) * live * 0.9 + A * pad * 0.4;`,
  // A hexagonal lattice with waves of light crossing it.
  hex: `
    vec3 f; vec2 p = cubeUV(d, f) * 15.0 + f.xy * 5.0;
    const vec2 s = vec2(1.0, 1.7320508);
    vec2 a = mod(p, s) - s * 0.5; vec2 b = mod(p - s * 0.5, s) - s * 0.5;
    vec2 gv = dot(a, a) < dot(b, b) ? a : b; vec2 id = p - gv;
    vec2 ag = abs(gv);
    float e = 0.5 - max(dot(ag, vec2(0.5, 0.8660254)), ag.x);
    float edge = 1.0 - smoothstep(0.015, 0.015 + fwidth(p.x) * 1.2, e);
    float wave = 0.5 + 0.5 * sin(length(id) * 0.6 - t * 0.5 + dot(f, vec3(1.0)));
    float lit = pow(wave, 6.0) * step(0.55, hash13(vec3(id, 3.0)));
    return A * edge * (0.12 + 0.5 * pow(wave, 3.0)) + B * lit * (1.0 - smoothstep(0.0, 0.5, e)) * 0.08;`,
};

function skyFragment(used: SkyMotif[]) {
  const fns = used.map(m => `vec3 m_${m}(vec3 d, vec3 A, vec3 B, vec3 T, float t) {${motifSource[m]}\n}`).join('\n');
  const branch = used.map(m => `if (k == ${MOTIFS.indexOf(m)}) r = m_${m}(d, A, B, T, t);`).join('\n  ');
  return /* glsl */ `
uniform vec3 uRight; uniform vec3 uUp; uniform vec3 uFwd;
uniform vec3 uTop; uniform vec3 uHorizon; uniform vec3 uBottom;
uniform int uKA; uniform int uKB; uniform float uMix; uniform float uTime;
uniform vec3 uA1; uniform vec3 uA2; uniform vec3 uAT; uniform float uAS; uniform float uAG;
uniform vec3 uB1; uniform vec3 uB2; uniform vec3 uBT; uniform float uBS; uniform float uBG;
varying vec2 vNdc;
${common}
${fns}
vec3 motif(int k, vec3 d, vec3 A, vec3 B, vec3 T, float t) {
  vec3 r = vec3(0.0);
  ${branch}
  return r;
}
vec3 aces(vec3 color) {
  const mat3 inM = mat3(vec3(0.59719, 0.07600, 0.02840), vec3(0.35458, 0.90834, 0.13383), vec3(0.04823, 0.01566, 0.83777));
  const mat3 outM = mat3(vec3(1.60475, -0.10208, -0.00327), vec3(-0.53108, 1.10813, -0.07276), vec3(-0.07367, -0.00605, 1.07602));
  color = inM * (color / 0.6);
  vec3 a = color * (color + 0.0245786) - 0.000090537;
  vec3 b = color * (0.983729 * color + 0.4329510) + 0.238081;
  return clamp(outM * (a / b), 0.0, 1.0);
}
vec3 srgb(vec3 c) { return mix(pow(c, vec3(0.41666)) * 1.055 - 0.055, c * 12.92, vec3(lessThanEqual(c, vec3(0.0031308)))); }
void main() {
  vec3 d = normalize(uFwd + vNdc.x * uRight + vNdc.y * uUp);
  float h = d.y;
  vec3 color = mix(uHorizon, uTop, smoothstep(0.0, 0.55, h));
  color = mix(color, uBottom, smoothstep(0.0, -0.35, h));
  float above = smoothstep(0.0, 0.09, h);
  if (uMix < 0.999) color += motif(uKA, d, uA1, uA2, uAT, uTime) * uAS * (1.0 - uMix) * mix(1.0, above, uAG);
  if (uMix > 0.001) color += motif(uKB, d, uB1, uB2, uBT, uTime) * uBS * uMix * mix(1.0, above, uBG);
  gl_FragColor = vec4(srgb(aces(color)), 1.0);
}`;
}

const triangleVertex = /* glsl */ `
varying vec2 vNdc;
void main() { vNdc = position.xy; gl_Position = vec4(position.xy, 0.0, 1.0); }`;

/** Full-resolution pass: the upscaled backdrop plus pin-sharp distant stars. */
const compositeFragment = /* glsl */ `
uniform sampler2D uSky;
uniform vec3 uRight; uniform vec3 uUp; uniform vec3 uFwd;
uniform float uTime; uniform float uStars;
varying vec2 vNdc;
float hash(vec3 p) { return fract(sin(dot(p, vec3(12.9898, 78.233, 37.719))) * 43758.5453); }
void main() {
  vec3 color = texture2D(uSky, vNdc * 0.5 + 0.5).rgb;
  vec3 dir = normalize(uFwd + vNdc.x * uRight + vNdc.y * uUp);
  // Sparse distant stars (deterministic per direction), slowly wheeling.
  float spin = uTime * 0.0045;
  vec3 d = vec3(dir.x * cos(spin) - dir.z * sin(spin), dir.y, dir.x * sin(spin) + dir.z * cos(spin));
  vec3 g = d * 900.0;
  vec3 cell = floor(g);
  float star = step(1.0 - 0.0018 * uStars, hash(cell)) * (1.0 - smoothstep(0.05, 0.22, length(fract(g) - 0.5)));
  float twinkle = 0.6 + 0.4 * sin(uTime * 0.7 + hash(cell + 3.1) * 40.0);
  color += vec3(0.55, 0.62, 0.75) * star * twinkle * 0.5 * smoothstep(-0.1, 0.2, dir.y);
  // A whisper of dither keeps 8-bit gradients from banding.
  color += (hash(vec3(gl_FragCoord.xy, 1.0)) - 0.5) / 255.0;
  gl_FragColor = vec4(color, 1.0);
}`;

const DEFAULT_SKY = { motif: 'nebula' as SkyMotif, a: '#1E293B', b: '#334155', strength: 0, toward: [0, 0, -1] as [number, number, number], stars: 1 };

export default function Atmosphere({ palettes }: { palettes: Palette[] }) {
  const { gl, camera } = useThree();
  const stops = useMemo(() => palettes.map(p => {
    const sky = { ...DEFAULT_SKY, ...p.sky };
    return {
      top: new THREE.Color(p.background),
      horizon: new THREE.Color(p.atmosphere).multiplyScalar(0.55),
      bottom: new THREE.Color(p.background).multiplyScalar(0.6),
      kind: MOTIFS.indexOf(sky.motif),
      a: new THREE.Color(sky.a),
      b: new THREE.Color(sky.b),
      toward: new THREE.Vector3(...sky.toward).normalize(),
      strength: p.sky ? sky.strength ?? 1 : 0,
      stars: sky.stars ?? 1,
      ground: sky.ground ? 1 : 0,
    };
  }), [palettes]);

  const { target, skyScene, skyCamera, skyMaterial, composite } = useMemo(() => {
    const used = [...new Set(palettes.map(p => p.sky?.motif).filter((m): m is SkyMotif => !!m))];
    const basis = { uRight: { value: new THREE.Vector3() }, uUp: { value: new THREE.Vector3() }, uFwd: { value: new THREE.Vector3() }, uTime: { value: 0 } };
    const size = 32;
    const random = new Uint8Array(size * size * size);
    for (let i = 0; i < random.length; i++) random[i] = Math.floor(Math.random() * 256);
    const noise = new THREE.Data3DTexture(random, size, size, size);
    noise.format = THREE.RedFormat;
    noise.minFilter = noise.magFilter = THREE.LinearFilter;
    noise.wrapS = noise.wrapT = noise.wrapR = THREE.RepeatWrapping;
    noise.unpackAlignment = 1;
    noise.needsUpdate = true;
    const triangle = new THREE.BufferGeometry();
    triangle.setAttribute('position', new THREE.BufferAttribute(new Float32Array([-1, -1, 0, 3, -1, 0, -1, 3, 0]), 3));
    const skyMaterial = new THREE.ShaderMaterial({
      vertexShader: triangleVertex,
      fragmentShader: skyFragment(used),
      depthTest: false,
      depthWrite: false,
      uniforms: {
        ...basis,
        uNoise: { value: noise },
        uTop: { value: new THREE.Color() }, uHorizon: { value: new THREE.Color() }, uBottom: { value: new THREE.Color() },
        uKA: { value: 0 }, uKB: { value: 0 }, uMix: { value: 0 },
        uA1: { value: new THREE.Color() }, uA2: { value: new THREE.Color() }, uAT: { value: new THREE.Vector3() }, uAS: { value: 0 }, uAG: { value: 0 },
        uB1: { value: new THREE.Color() }, uB2: { value: new THREE.Color() }, uBT: { value: new THREE.Vector3() }, uBS: { value: 0 }, uBG: { value: 0 },
      },
    });
    const skyScene = new THREE.Scene();
    const skyMesh = new THREE.Mesh(triangle, skyMaterial);
    skyMesh.frustumCulled = false;
    skyScene.add(skyMesh);
    const target = new THREE.WebGLRenderTarget(2, 2, { depthBuffer: false, stencilBuffer: false, magFilter: THREE.LinearFilter, minFilter: THREE.LinearFilter, generateMipmaps: false });
    const composite = new THREE.Mesh(triangle, new THREE.ShaderMaterial({
      vertexShader: triangleVertex,
      fragmentShader: compositeFragment,
      depthTest: false,
      depthWrite: false,
      uniforms: { ...basis, uSky: { value: target.texture }, uStars: { value: 1 } },
    }));
    composite.frustumCulled = false;
    composite.renderOrder = -100;
    return { target, skyScene, skyCamera: new THREE.OrthographicCamera(), skyMaterial, composite };
  }, [palettes]);

  // The backdrop is drawn only once its program has linked (in parallel where the driver
  // supports it), so the first frames never wait on its compilation.
  const ready = useRef(false);
  useEffect(() => {
    // Compiled with the offscreen target bound: three.js keys programs by output target
    // (tone mapping and colour space differ), and a screen variant would recompile at first draw.
    const previous = gl.getRenderTarget();
    gl.setRenderTarget(target);
    const compiled = gl.compileAsync(skyScene, skyCamera);
    gl.setRenderTarget(previous);
    void compiled.then(() => { ready.current = true; }, () => { ready.current = true; });
    return () => {
      target.dispose();
      skyMaterial.dispose();
      (composite.material as THREE.Material).dispose();
      (skyMaterial.uniforms.uNoise.value as THREE.Texture).dispose();
      composite.geometry.dispose();
    };
  }, [gl, skyScene, skyCamera, target, skyMaterial, composite]);

  const size = useMemo(() => new THREE.Vector2(), []);
  // After the camera is synced (-10), before the scene renders.
  useFrame(() => {
    const frame = frameRef.current;
    if (!frame) return;
    const cam = camera as THREE.PerspectiveCamera;
    cam.updateMatrixWorld();
    const e = cam.matrixWorld.elements;
    const tanY = Math.tan((cam.fov * Math.PI) / 360);
    const tanX = tanY * cam.aspect;
    const u = skyMaterial.uniforms;
    u.uRight.value.set(e[0], e[1], e[2]).multiplyScalar(tanX);
    u.uUp.value.set(e[4], e[5], e[6]).multiplyScalar(tanY);
    u.uFwd.value.set(-e[8], -e[9], -e[10]);
    u.uTime.value = frame.time;

    const i = Math.max(0, Math.min(Math.floor(frame.place), stops.length - 1));
    const j = Math.min(i + 1, stops.length - 1);
    const f = Math.min(Math.max(frame.place - i, 0), 1);
    const A = stops[i];
    const B = stops[j];
    u.uTop.value.copy(A.top).lerp(B.top, f);
    u.uHorizon.value.copy(A.horizon).lerp(B.horizon, f);
    u.uBottom.value.copy(A.bottom).lerp(B.bottom, f);
    u.uKA.value = A.kind; u.uA1.value.copy(A.a); u.uA2.value.copy(A.b); u.uAT.value.copy(A.toward); u.uAS.value = A.strength; u.uAG.value = A.ground;
    u.uKB.value = B.kind; u.uB1.value.copy(B.a); u.uB2.value.copy(B.b); u.uBT.value.copy(B.toward); u.uBS.value = B.strength; u.uBG.value = B.ground;
    // Smoothstep the cross-fade so each backdrop holds while you are near its destination.
    u.uMix.value = i === j ? 0 : f * f * (3 - 2 * f);
    (composite.material as THREE.ShaderMaterial).uniforms.uStars.value = A.stars + (B.stars - A.stars) * f;

    gl.getDrawingBufferSize(size);
    const scale = LITE ? 0.34 : 0.5;
    const w = Math.max(2, Math.min(1280, Math.round(size.x * scale)));
    const h = Math.max(2, Math.round((w * size.y) / Math.max(1, size.x)));
    if (target.width !== w || target.height !== h) target.setSize(w, h);
    const previous = gl.getRenderTarget();
    gl.setRenderTarget(target);
    if (ready.current) gl.render(skyScene, skyCamera);
    else gl.clear(true, false, false);
    gl.setRenderTarget(previous);
  }, -9);

  return <primitive object={composite} />;
}
