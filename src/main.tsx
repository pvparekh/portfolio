import { StrictMode, useCallback, useEffect, useLayoutEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import SolutionsPage from './SolutionsPage.tsx';
import SoftwarePage from './SoftwarePage.tsx';
import SiteNav, { type SitePage } from './SiteNav.tsx';
import PortfolioJourney from './journey/pages/PortfolioJourney.tsx';
import SolutionsJourney from './journey/pages/SolutionsJourney.tsx';
import SoftwareJourney from './journey/pages/SoftwareJourney.tsx';
import { journeyEligible } from './journey/core/mode.ts';
import { pendingRestore, rememberScroll } from './journey/core/restore.ts';
import './style.css';
import './mobile.css';
import './journey/journey.css';

// Decided once per load: the spatial journey on capable devices with motion allowed, else the standard page.
const JOURNEY = journeyEligible();

const currentPage = (): SitePage =>
  /^\/software(?:\/|$)/.test(window.location.pathname) ? 'software' : /^\/solutions(?:\/|$)/.test(window.location.pathname) ? 'solutions' : 'portfolio';

const pagePath = (page: SitePage) => page === 'software' ? '/software' : page === 'solutions' ? '/solutions' : '/';

const portfolioTitle = 'Parth Parekh | Data Engineer & Software Developer';
const portfolioDescription =
  'Parth Parekh is a data engineer and software developer building production data pipelines, automation systems, and interactive engineering products. Explore experience and independent projects.';
const solutionTitle = 'Data Solutions | Parth Parekh';
const solutionDescription =
  'Data pipelines, reporting automation, SQL modernization and system integrations built around the way your business works.';

const softwareTitle = 'Software Solutions | Parth Parekh';
const softwareDescription = 'Custom web applications, business websites, backend integrations and focused AI-assisted software built around practical requirements.';
function setPageMetadata(page: SitePage) {
  const isSolutions = page === 'solutions';
  const isSoftware = page === 'software';
  const title = isSoftware ? softwareTitle : isSolutions ? solutionTitle : portfolioTitle;
  const description = isSoftware ? softwareDescription : isSolutions ? solutionDescription : portfolioDescription;
  const socialDescription = isSoftware
    ? 'Websites, web applications and software features designed, built and delivered around your needs.'
    : isSolutions ? 'Manual reporting, disconnected systems and fragile pipelines. I build focused, reliable data solutions.'
    : 'Engineering experience, production data systems, and independent technical projects by Parth Parekh.';
  const canonicalUrl = isSoftware ? 'https://parthparekh.dev/software' : isSolutions ? 'https://parthparekh.dev/solutions' : 'https://parthparekh.dev/';

  document.title = title;

  const setMeta = (selector: string, attr: 'name' | 'property', key: string, value: string) => {
    let tag = document.querySelector<HTMLMetaElement>(selector);
    if (!tag) {
      tag = document.createElement('meta');
      tag.setAttribute(attr, key);
      document.head.appendChild(tag);
    }
    tag.content = value;
  };

  setMeta('meta[name="description"]', 'name', 'description', description);
  setMeta('meta[property="og:title"]', 'property', 'og:title', title);
  setMeta('meta[property="og:description"]', 'property', 'og:description', socialDescription);
  setMeta('meta[property="og:url"]', 'property', 'og:url', canonicalUrl);
  setMeta('meta[property="og:type"]', 'property', 'og:type', 'website');
  setMeta('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary');
  setMeta('meta[name="twitter:title"]', 'name', 'twitter:title', title);
  setMeta('meta[name="twitter:description"]', 'name', 'twitter:description', socialDescription);

  let canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.rel = 'canonical';
    document.head.appendChild(canonical);
  }
  canonical.href = canonicalUrl;
}

function PortfolioSite() {
  const [page, setPage] = useState<SitePage>(currentPage);

  useEffect(() => {
    const previousRestoration = history.scrollRestoration;
    history.scrollRestoration = 'manual';

    const onBackOrForward = (event: PopStateEvent) => {
      const nextPage = currentPage();
      const saved = (event.state as { scrollY?: number } | null)?.scrollY;
      pendingRestore.y = typeof saved === 'number' ? saved : null;
      setPage(nextPage);
      // When browser history changes only the hash, React's page state stays
      // the same, so explicitly move to the section without a route remount.
      requestAnimationFrame(() => {
        if (pendingRestore.y !== null && !JOURNEY) { window.scrollTo({ top: pendingRestore.y, behavior: 'instant' }); pendingRestore.y = null; return; }
        if (JOURNEY && pendingRestore.y !== null) return; // the journey applies it after layout
        const id = decodeURIComponent(window.location.hash.slice(1));
        if (id) document.getElementById(id)?.scrollIntoView({ behavior: 'instant' });
        else window.scrollTo({ top: 0, behavior: 'instant' });
      });
    };

    // Keep the current entry's scroll position up to date, so back AND forward can restore it
    // (popstate fires after the entry has already changed, too late to save it then).
    let saveTimer = 0;
    const onScroll = () => { clearTimeout(saveTimer); saveTimer = window.setTimeout(rememberScroll, 150); };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('popstate', onBackOrForward);
    return () => {
      clearTimeout(saveTimer);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('popstate', onBackOrForward);
      history.scrollRestoration = previousRestoration;
    };
  }, []);

  useLayoutEffect(() => {
    if (JOURNEY && pendingRestore.y !== null) return;
    const id = decodeURIComponent(window.location.hash.slice(1));
    if (id) document.getElementById(id)?.scrollIntoView({ behavior: 'instant' });
    else window.scrollTo({ top: 0, behavior: 'instant' });
  }, [page]);

  useEffect(() => { setPageMetadata(page); }, [page]);

  const navigate = useCallback((target: SitePage) => {
    const destination = pagePath(target);
    if (target === page) {
      // A brand or destination click is a true home/top navigation, not a
      // revisit to a previously selected section such as /#projects.
      // Clearing the fragment also makes refresh and copied URLs deterministic.
      if (window.location.pathname + window.location.search + window.location.hash !== destination) {
        window.history.replaceState(window.history.state, '', destination);
      }
      window.scrollTo({ top: 0, behavior: 'instant' });
      // A smooth section scroll still in flight can override one instant jump; repeat next frame.
      requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'instant' }));
      return;
    }
    rememberScroll();
    window.history.pushState(null, '', destination);
    setPage(target);
  }, [page]);

  const goToSection = useCallback((target: SitePage, id: string) => {
    if (target === page) {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    rememberScroll();
    window.history.pushState(null, '', pagePath(target) + '#' + encodeURIComponent(id));
    setPage(target);
  }, [page]);

  return (
    <>
      <SiteNav page={page} navigate={navigate} goToSection={goToSection} />
      {page === 'software' ? (
        JOURNEY
          ? <SoftwareJourney onBackToPortfolio={() => navigate('portfolio')} />
          : <SoftwarePage onBackToPortfolio={() => navigate('portfolio')} />
      ) : page === 'solutions' ? (
        JOURNEY
          ? <SolutionsJourney onBackToPortfolio={() => navigate('portfolio')} />
          : <SolutionsPage onBackToPortfolio={() => navigate('portfolio')} />
      ) : (
        JOURNEY
          ? <PortfolioJourney onNavigateSolutions={() => navigate('solutions')} />
          : <App onNavigateSolutions={() => navigate('solutions')} />
      )}
    </>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PortfolioSite />
  </StrictMode>,
);
