import type { SceneProps } from '../dom/JourneyStage';
import { approvedCases, solutionsJourney } from '../worlds/solutions';
import { offerings } from '../../SolutionsPage';
import { deliveryExamples } from '../../deliveryExamples';
import JourneyCanvas from './JourneyCanvas';
import {
  HeroConfluence, ProblemTangles, ProcessAqueduct, ProductDelta, Reservoir, ServiceChannels, ValidationRings,
} from './solutions/ConfluenceWorlds';

const palettes = solutionsJourney.destinations.map(d => d.palette);

/** Data Solutions: the Confluence, raw data becoming dependable data downstream. */
export default function SolutionsScene({ engine }: SceneProps) {
  return (
    <JourneyCanvas engine={engine} palettes={palettes}>
      <HeroConfluence index={0} />
      <ProblemTangles index={1} />
      <ServiceChannels index={2} count={offerings.length} />
      <ValidationRings index={3} count={deliveryExamples.length} />
      <ProcessAqueduct index={4} />
      <ProductDelta index={5} branches={approvedCases.length} />
      <Reservoir index={6} />
    </JourneyCanvas>
  );
}
