import { useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { catmullRom, type Vec3 } from '../../core/math';
import { frameRef } from './frame';
import { particles } from '../../core/budget';

export interface Stream {
  points: Vec3[];
  closed?: boolean;
  count: number;
  color: string;
  /** Path traversals per second. */
  speed: number;
  /** Lateral spread of particles around the path (world units). */
  width: number;
  /** 0 = orderly lane, 1 = wandering, flickering raw data. */
  chaos: number;
  /** Streak length in world units. */
  length: number;
  brightness?: number;
}

const SAMPLES = 128;

const vertex = /* glsl */ `
attribute vec2 corner;
attribute vec4 aA; // stream row (v), phase, jitter x, jitter y
attribute vec4 aB; // speed, chaos, width, length
attribute vec4 aC; // rgb, brightness
uniform sampler2D uPaths;
uniform float uRows;
uniform float uTime;
uniform float uPresence;
uniform vec2 uResolution;
varying vec2 vUv;
varying vec3 vColor;
varying float vAlpha;

vec3 pathAt(float t, float row) {
  float x = fract(t) * ${(SAMPLES - 1).toFixed(1)};
  float i = floor(x);
  float f = x - i;
  float v = (row + 0.5) / uRows;
  vec3 a = texture2D(uPaths, vec2((i + 0.5) / ${SAMPLES.toFixed(1)}, v)).xyz;
  vec3 b = texture2D(uPaths, vec2((min(i + 1.0, ${(SAMPLES - 1).toFixed(1)}) + 0.5) / ${SAMPLES.toFixed(1)}, v)).xyz;
  return mix(a, b, f);
}

void main() {
  float row = aA.x;
  float t = fract(aA.y + uTime * aB.x);
  vec3 p = pathAt(t, row);
  vec3 ahead = pathAt(t + 0.004, row);
  vec3 dir = normalize(ahead - p + vec3(1e-4));
  vec3 side = normalize(cross(dir, vec3(0.0, 1.0, 0.0)) + vec3(1e-4));
  vec3 up = normalize(cross(side, dir));
  float wob = aB.y * (sin(uTime * (1.3 + aA.z * 2.0) + aA.y * 40.0) * 0.5 + 0.5);
  vec3 offset = side * aA.z * aB.z * (1.0 + wob) + up * aA.w * aB.z * 0.6 * (1.0 + wob);
  vec3 head = p + offset;
  vec3 tail = head - dir * aB.w;
  mat4 vp = projectionMatrix * viewMatrix;
  vec4 ch = vp * vec4(head, 1.0);
  vec4 ct = vp * vec4(tail, 1.0);
  float flicker = mix(1.0, 0.35 + 0.65 * step(0.4, fract(sin(floor(uTime * 8.0) + aA.y * 91.7) * 4375.5)), aB.y);
  vAlpha = uPresence * aC.w * flicker * smoothstep(0.0, 0.04, t) * (1.0 - smoothstep(0.96, 1.0, t));
  if (ch.w < 20.0 || ct.w < 20.0) { gl_Position = vec4(2.0, 2.0, 2.0, 1.0); vAlpha = 0.0; return; }
  vec2 sh = ch.xy / ch.w * 0.5 * uResolution;
  vec2 st = ct.xy / ct.w * 0.5 * uResolution;
  vec2 d = sh - st; float l = length(d);
  vec2 n = l > 0.001 ? vec2(-d.y, d.x) / l : vec2(0.0, 1.0);
  vec4 c = mix(ct, ch, corner.x);
  float px = max(10.0 * uResolution.y / c.w, 0.9);
  c.xy += n * corner.y * (px + 1.0) * 2.0 / uResolution * c.w;
  gl_Position = c;
  vUv = vec2(corner.x, corner.y * (px + 1.0) / px);
  vColor = aC.rgb;
}`;

const fragment = /* glsl */ `
varying vec2 vUv;
varying vec3 vColor;
varying float vAlpha;
void main() {
  float across = exp(-vUv.y * vUv.y * 2.5);
  float along = smoothstep(0.0, 0.75, vUv.x) * (1.0 - smoothstep(0.9, 1.0, vUv.x));
  float a = vAlpha * across * along;
  gl_FragColor = vec4(vColor * a, a);
  #include <colorspace_fragment>
}`;

/**
 * Particle rivers along authored paths, one instanced draw call for all
 * streams. Paths are sampled into a float texture; motion is computed on the
 * GPU. Chaos makes a stream wander and flicker (raw data); zero is a lane.
 */
export default function StreamField({ streams, presence }: { streams: Stream[]; presence: () => number }) {
  const { geometry, material, texture } = useMemo(() => {
    const rows = streams.length;
    const data = new Float32Array(SAMPLES * rows * 4);
    streams.forEach((stream, r) => {
      const pts = stream.closed ? [...stream.points, stream.points[0], stream.points[1]] : stream.points;
      const span = stream.closed ? (pts.length - 2) / (pts.length - 1) : 1;
      for (let i = 0; i < SAMPLES; i++) {
        const p = catmullRom(pts, (i / (SAMPLES - 1)) * span);
        data.set([p[0], p[1], p[2], 1], (r * SAMPLES + i) * 4);
      }
    });
    const tex = new THREE.DataTexture(data, SAMPLES, rows, THREE.RGBAFormat, THREE.FloatType);
    tex.minFilter = tex.magFilter = THREE.NearestFilter;
    tex.needsUpdate = true;

    const counts = streams.map(s => particles(s.count));
    const total = counts.reduce((n, c) => n + c, 0);
    const a = new Float32Array(total * 4);
    const b = new Float32Array(total * 4);
    const c = new Float32Array(total * 4);
    let seed = 41;
    const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    let k = 0;
    streams.forEach((stream, r) => {
      const color = new THREE.Color(stream.color);
      for (let i = 0; i < counts[r]; i++, k++) {
        const gauss = () => (rand() + rand() + rand() - 1.5) / 1.5;
        a.set([r, rand(), gauss(), gauss()], k * 4);
        b.set([stream.speed * (0.8 + rand() * 0.4), stream.chaos, stream.width, stream.length * (0.6 + rand() * 0.8)], k * 4);
        c.set([color.r, color.g, color.b, (stream.brightness ?? 1) * (0.5 + rand() * 0.5)], k * 4);
      }
    });
    const g = new THREE.InstancedBufferGeometry();
    g.setAttribute('corner', new THREE.Float32BufferAttribute([0, -1, 0, 1, 1, -1, 1, 1], 2));
    g.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(12), 3));
    g.setIndex([0, 2, 1, 2, 3, 1]);
    g.setAttribute('aA', new THREE.InstancedBufferAttribute(a, 4));
    g.setAttribute('aB', new THREE.InstancedBufferAttribute(b, 4));
    g.setAttribute('aC', new THREE.InstancedBufferAttribute(c, 4));
    g.instanceCount = total;
    const m = new THREE.ShaderMaterial({
      vertexShader: vertex,
      fragmentShader: fragment,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uPaths: { value: tex },
        uRows: { value: rows },
        uTime: { value: 0 },
        uPresence: { value: 1 },
        uResolution: { value: new THREE.Vector2(1, 1) },
      },
    });
    return { geometry: g, material: m, texture: tex };
  }, [streams]);

  useEffect(() => () => { geometry.dispose(); material.dispose(); texture.dispose(); }, [geometry, material, texture]);

  useFrame(state => {
    const frame = frameRef.current;
    if (!frame) return;
    material.uniforms.uTime.value = frame.time;
    material.uniforms.uPresence.value = presence();
    material.uniforms.uResolution.value.set(state.size.width * state.viewport.dpr, state.size.height * state.viewport.dpr);
  });

  return <mesh geometry={geometry} material={material} frustumCulled={false} />;
}
