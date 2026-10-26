import type { SceneProps } from '../dom/JourneyStage';
import { portfolioJourney } from '../worlds/portfolio';
import JourneyCanvas from './JourneyCanvas';
import OriginWorld from './portfolio/OriginWorld';
import AboutWorld from './portfolio/AboutWorld';
import ExperienceWorld from './portfolio/ExperienceWorld';
import ProjectsWorld from './portfolio/ProjectsWorld';
import SkillsWorld from './portfolio/SkillsWorld';
import ContactWorld from './portfolio/ContactWorld';

const palettes = portfolioJourney.destinations.map(d => d.palette);

/** The homepage universe: six distinct worlds along one continuous journey. */
export default function PortfolioScene({ engine }: SceneProps) {
  return (
    <JourneyCanvas engine={engine} palettes={palettes}>
      <OriginWorld index={0} />
      <AboutWorld index={1} />
      <ExperienceWorld index={2} />
      <ProjectsWorld index={3} />
      <SkillsWorld index={4} />
      <ContactWorld index={5} />
    </JourneyCanvas>
  );
}
