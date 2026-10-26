import { useCallback } from 'react';
import JourneyStage from '../dom/JourneyStage';
import { portfolioJourney } from '../worlds/portfolio';
import { Footer, TELEMETRY } from '../../App';
import {
  AboutBioPanel, AboutProfilePanel, ContactPanel, ExperienceIntroPanel, FlagshipArchitecturePanel, FlagshipPanel,
  OriginPanel, ProjectsIntroPanel, RolePanel, SkillsPanel, SupportingPanel,
} from '../content/PortfolioPanels';

const loadScene = () => import('../scene/PortfolioScene');

function Telemetry() {
  return (
    <div className="journey-telemetry">
      {TELEMETRY.map(item => (
        <div key={item.label}>
          <span>{item.label}</span>
          <span aria-hidden="true" />
          <span className={item.label === 'STATUS' ? 'is-status' : undefined}>{item.value}</span>
        </div>
      ))}
    </div>
  );
}

export default function PortfolioJourney({ onNavigateSolutions }: { onNavigateSolutions: () => void }) {
  const returnToOrigin = useCallback(() => window.scrollTo({ top: 0, behavior: 'smooth' }), []);
  const renderPanel = useCallback((id: string) => {
    switch (id) {
      case 'origin': return <OriginPanel />;
      case 'about-bio': return <AboutBioPanel />;
      case 'about-profile': return <AboutProfilePanel />;
      case 'exp-intro': return <ExperienceIntroPanel />;
      case 'projects-intro': return <ProjectsIntroPanel />;
      case 'fv-info': return <FlagshipPanel />;
      case 'fv-architecture': return <FlagshipArchitecturePanel />;
      case 'bot-info': return <SupportingPanel id="github-review-bot" />;
      case 'aether-info': return <SupportingPanel id="aetherflow" />;
      case 'skills': return <SkillsPanel />;
      case 'contact': return <ContactPanel onNavigateSolutions={onNavigateSolutions} onReturn={returnToOrigin} />;
      default:
        if (id.startsWith('role-')) return <RolePanel index={Number(id.slice(5))} />;
        return null;
    }
  }, [onNavigateSolutions, returnToOrigin]);

  return (
    <JourneyStage
      definition={portfolioJourney}
      page="portfolio"
      renderPanel={renderPanel}
      loadScene={loadScene}
      originHud={<Telemetry />}
      footer={<Footer />}
    />
  );
}
