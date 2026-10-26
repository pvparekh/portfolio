import type { SceneProps } from '../dom/JourneyStage';
import { softwareJourney } from '../worlds/software';
import { offerings } from '../../SoftwarePage';
import JourneyCanvas from './JourneyCanvas';
import { AssemblyStack, BenchFloor, ExplodedLayers, Gallery, ModularWall, OpenSlot, ServiceModules } from './software/AssemblyWorlds';

const palettes = softwareJourney.destinations.map(d => d.palette);

/** Software Solutions: the Assembly bench, from exploded interface to an open slot. */
export default function SoftwareScene({ engine }: SceneProps) {
  return (
    <JourneyCanvas engine={engine} palettes={palettes}>
      <hemisphereLight args={['#9FB2D1', '#05060A', 0.45]} />
      <directionalLight color="#DCE6F5" intensity={0.9} position={[60000, 40000, 30000]} />
      <BenchFloor />
      <ExplodedLayers index={0} />
      <ModularWall index={1} gaps={3} />
      <ServiceModules index={2} count={offerings.length} />
      <Gallery index={3} />
      <AssemblyStack index={4} />
      <OpenSlot index={5} />
    </JourneyCanvas>
  );
}
