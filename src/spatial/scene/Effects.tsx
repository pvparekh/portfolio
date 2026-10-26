import { Bloom, EffectComposer } from '@react-three/postprocessing';

/** Tier 3 only: one half-resolution mipmap bloom pass on the filament cores. */
export default function Effects() {
  return (
    <EffectComposer multisampling={0} enableNormalPass={false} resolutionScale={0.5}>
      <Bloom mipmapBlur intensity={0.55} luminanceThreshold={0.42} luminanceSmoothing={0.3} radius={0.68} />
    </EffectComposer>
  );
}
