import { useCallback } from 'react';
import JourneyStage from '../dom/JourneyStage';
import { approvedCases, solutionsJourney } from '../worlds/solutions';
import {
  ArchitectureGraphic, CaseStudy, ContactAside, ContactCopy, DeliveryProofCard, DeliveryProofClose, EngagementProcess,
  ProcessChecks, SectionIntro, ServiceArticle, SOLUTIONS_INTROS, SolutionsFooter, SolutionsHeroBottom, SolutionsHeroCopy, SolutionsProblems,
  ToolingNote, offerings,
} from '../../SolutionsPage';
import { deliveryExamples } from '../../deliveryExamples';
import '../../solutions.css';
import '../../deliveryProof.css';

const loadScene = () => import('../scene/SolutionsScene');

/** Data Solutions as a journey down the Confluence; every panel reuses the page's own components. */
export default function SolutionsJourney({ onBackToPortfolio }: { onBackToPortfolio: () => void }) {
  const renderPanel = useCallback((id: string) => {
    switch (id) {
      case 'sol-hero': return <div className="jp-sol jp-sol--hero sol-hero"><SolutionsHeroCopy /><SolutionsHeroBottom /></div>;
      case 'sol-graphic': return <div className="jp-sol jp-sol--bare"><ArchitectureGraphic /></div>;
      case 'sol-problems': return <div className="jp-sol"><SectionIntro {...SOLUTIONS_INTROS.i01} /><SolutionsProblems /></div>;
      case 'sol-services-intro': return <div className="jp-sol"><SectionIntro {...SOLUTIONS_INTROS.i02} /></div>;
      case 'sol-tooling': return <div className="jp-sol jp-sol--bare"><ToolingNote /></div>;
      case 'sol-work-intro': return <div className="jp-sol"><SectionIntro {...SOLUTIONS_INTROS.i03} /></div>;
      case 'sol-proof-close': return <div className="jp-sol"><DeliveryProofClose /></div>;
      case 'sol-approach': return <div className="jp-sol"><SectionIntro {...SOLUTIONS_INTROS.i04} /><EngagementProcess /><ProcessChecks /></div>;
      case 'sol-independent-intro': return <div className="jp-sol"><SectionIntro {...SOLUTIONS_INTROS.i05} /></div>;
      case 'sol-contact': return <div className="jp-sol jp-sol--contact sol-contact-section"><ContactCopy /></div>;
      case 'sol-contact-aside': return <div className="jp-sol jp-sol--bare"><ContactAside /></div>;
    }
    if (id.startsWith('sol-service-')) {
      const offering = offerings[Number(id.slice('sol-service-'.length))];
      return offering ? <div className="jp-sol"><ServiceArticle offering={offering} /></div> : null;
    }
    if (id.startsWith('sol-proof-')) {
      const item = deliveryExamples.find(entry => 'sol-proof-' + entry.id === id);
      return item ? <div className="jp-sol jp-sol--bare sol-proof"><DeliveryProofCard item={item} /></div> : null;
    }
    if (id.startsWith('sol-case-')) {
      const index = approvedCases.findIndex(study => 'sol-case-' + study.id === id);
      return index >= 0 ? <div className="jp-sol"><CaseStudy study={approvedCases[index]} index={index} /></div> : null;
    }
    return null;
  }, []);

  return (
    <div className="solutions data-solutions journey-solutions">
      <JourneyStage
        definition={solutionsJourney}
        page="solutions"
        renderPanel={renderPanel}
        loadScene={loadScene}
        footer={<SolutionsFooter onBackToPortfolio={onBackToPortfolio} />}
      />
    </div>
  );
}
