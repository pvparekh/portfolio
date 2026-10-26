import { Pause, Play } from 'lucide-react';
import { storeMotionPreference } from '../core/capability';
import { isSceneActive, spatialStore, useSpatial } from '../core/store';

/**
 * Pause control for the always-moving background (WCAG 2.2.2).
 * Rendered only while the WebGL scene is active. `withLabel` renders a
 * full-width row for the mobile menu.
 */
export default function MotionToggle({ className = '', withLabel = false }: { className?: string; withLabel?: boolean }) {
  const active = useSpatial(isSceneActive);
  const motion = useSpatial(state => state.motion);
  if (!active) return null;
  const playing = motion === 'full';
  const label = playing ? 'Pause background motion' : 'Play background motion';
  const Icon = playing ? Pause : Play;
  return (
    <button
      type="button"
      className={(withLabel ? 'spatial-motion-row ' : 'spatial-motion-toggle ') + className}
      aria-label={withLabel ? undefined : label}
      title={withLabel ? undefined : label}
      onClick={() => {
        const next = playing ? 'still' : 'full';
        storeMotionPreference(next);
        spatialStore.setState({ motion: next });
      }}
    >
      {withLabel && <span>{label}</span>}
      <Icon size={withLabel ? 14 : 13} strokeWidth={2} aria-hidden="true" />
    </button>
  );
}
