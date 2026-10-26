import { Pause, Play } from 'lucide-react';
import { storeMotionPreference } from '../core/capability';
import { isSceneActive, spatialStore, useSpatial } from '../core/store';

/**
 * Pause control for the always-moving background (WCAG 2.2.2).
 * Rendered only while the WebGL scene is active.
 */
export default function MotionToggle({ className = '' }: { className?: string }) {
  const active = useSpatial(isSceneActive);
  const motion = useSpatial(state => state.motion);
  if (!active) return null;
  const playing = motion === 'full';
  const label = playing ? 'Pause background motion' : 'Play background motion';
  return (
    <button
      type="button"
      className={'spatial-motion-toggle ' + className}
      aria-label={label}
      title={label}
      onClick={() => {
        const next = playing ? 'still' : 'full';
        storeMotionPreference(next);
        spatialStore.setState({ motion: next });
      }}
    >
      {playing ? <Pause size={13} strokeWidth={2} aria-hidden="true" /> : <Play size={13} strokeWidth={2} aria-hidden="true" />}
    </button>
  );
}
