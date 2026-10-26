import { useCallback } from 'react';
import JourneyStage from '../dom/JourneyStage';
import { softwareJourney } from '../worlds/software';
import {
  CaseStudy, ContactAside, ContactCopy, EngagementProcess, ProcessChecks, SectionIntro, ServiceArticle, SOFTWARE_INTROS,
  SoftwareHeroBottom, SoftwareHeroCopy, SoftwarePreview, SoftwareProblems, SolutionsFooter, ToolingNote, offerings,
} from '../../SoftwarePage';
import { softwareProjects } from '../../softwareProjects';
import { MobilePreview } from '../content/PortfolioPanels';

const PREVIEWS: Record<string, string> = {
  salon: '/projects/perfect-threading-home.webp',
  formula: '/projects/formula-vision-replay-map.webp',
  aetherflow: '/projects/aetherflow-home.webp',
  'review-bot': '/projects/review-bot-pipeline.webp',
  biaslens: '/projects/biaslens-dashboard.webp',
};
import '../../solutions.css';
import '../../software.css';

const loadScene = () => import('../scene/SoftwareScene');

/** Software Solutions as a walk along the Assembly bench; panels reuse the page's own components. */
export default function SoftwareJourney({ onBackToPortfolio }: { onBackToPortfolio: () => void }) {
  const renderPanel = useCallback((id: string) => {
    switch (id) {
      case 'sw-hero': return <div className="jp-sol jp-sol--hero sol-hero"><SoftwareHeroCopy /><SoftwareHeroBottom /></div>;
      case 'sw-preview': return <div className="jp-sol jp-sol--bare"><SoftwarePreview /></div>;
      case 'sw-opportunities': return <div className="jp-sol"><SectionIntro {...SOFTWARE_INTROS.i01} /><SoftwareProblems /></div>;
      case 'sw-services-intro': return <div className="jp-sol"><SectionIntro {...SOFTWARE_INTROS.i02} /></div>;
      case 'sw-tooling': return <div className="jp-sol jp-sol--bare"><ToolingNote /></div>;
      case 'sw-work-intro': return <div className="jp-sol"><SectionIntro {...SOFTWARE_INTROS.i03} /></div>;
      case 'sw-approach': return <div className="jp-sol"><SectionIntro {...SOFTWARE_INTROS.i04} /><EngagementProcess /><ProcessChecks /></div>;
      case 'sw-contact': return <div className="jp-sol jp-sol--contact sol-contact-section"><ContactCopy /></div>;
      case 'sw-contact-aside': return <div className="jp-sol jp-sol--bare"><ContactAside /></div>;
    }
    if (id.startsWith('sw-service-')) {
      const offering = offerings[Number(id.slice('sw-service-'.length))];
      return offering ? <div className="jp-sol"><ServiceArticle offering={offering} /></div> : null;
    }
    if (id.startsWith('sw-case-')) {
      const index = softwareProjects.findIndex(p => 'sw-case-' + p.id === id);
      if (index < 0) return null;
      const study = softwareProjects[index];
      return <div className="jp-sol jp-sol--case">{PREVIEWS[study.id] && <MobilePreview src={PREVIEWS[study.id]} alt={study.title + ' screenshot'} />}<CaseStudy study={study} index={index} /></div>;
    }
    return null;
  }, []);

  return (
    <div className="solutions software-solutions journey-solutions">
      <JourneyStage
        definition={softwareJourney}
        page="software"
        renderPanel={renderPanel}
        loadScene={loadScene}
        footer={<SolutionsFooter onBackToPortfolio={onBackToPortfolio} />}
      />
    </div>
  );
}
