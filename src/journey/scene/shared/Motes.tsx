import { useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { frameRef } from './frame';

const BOX = 9000;

/**
 * Fine dust that always surrounds the camera: one draw call of points whose
 * positions wrap inside a box centred on the eye. It gives every stop depth
 * and a quiet sense of life, and parallaxes naturally while travelling.
 * Frozen (no drift) when motion is paused.
 */
export default function Motes({ count = 900, color = '#C7D2E4' }: { count?: number; color?: string }) {
  const { geometry, material } = useMemo(() => {
    let seed = 7;
    const r = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = r() * BOX;
      positions[i * 3 + 1] = r() * BOX;
      positions[i * 3 + 2] = r() * BOX;
      sizes[i] = 0.6 + r() * r() * 2.4;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    g.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
    const m = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: { uEye: { value: new THREE.Vector3() }, uTime: { value: 0 }, uColor: { value: new THREE.Color(color) }, uScale: { value: 1 } },
      vertexShader: `
        uniform vec3 uEye; uniform float uTime; uniform float uScale;
        attribute float aSize; varying float vFade;
        void main() {
          vec3 drift = vec3(sin(uTime * 0.05 + position.y) * 60.0, uTime * 18.0, cos(uTime * 0.04 + position.x) * 60.0);
          vec3 p = mod(position + drift - uEye + ${BOX / 2}.0, ${BOX}.0) - ${BOX / 2}.0 + uEye;
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          float d = -mv.z;
          // Fade near the eye (no pops in front of text) and toward the box edge (no visible wrap).
          vFade = smoothstep(500.0, 1600.0, d) * (1.0 - smoothstep(${BOX * 0.32}.0, ${BOX * 0.5}.0, length(p - uEye)));
          gl_PointSize = aSize * uScale * 900.0 / max(d, 1.0);
          gl_Position = projectionMatrix * mv;
        }`,
      fragmentShader: `
        uniform vec3 uColor; varying float vFade;
        void main() {
          float r = length(gl_PointCoord - 0.5);
          float a = smoothstep(0.5, 0.0, r) * vFade * 0.55;
          gl_FragColor = vec4(uColor * a, a);
        }`,
    });
    return { geometry: g, material: m };
  }, [count, color]);

  useFrame(state => {
    const f = frameRef.current;
    if (!f) return;
    material.uniforms.uEye.value.set(...f.pose.position);
    material.uniforms.uTime.value = f.time;
    material.uniforms.uScale.value = state.gl.getPixelRatio();
  });

  return <points geometry={geometry} material={material} frustumCulled={false} />;
}
