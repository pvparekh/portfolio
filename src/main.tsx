import { StrictMode, useCallback, useEffect, useLayoutEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import SolutionsPage from './SolutionsPage.tsx';
import SiteNav, { type SitePage } from './SiteNav.tsx';
import './style.css';

const currentPage = (): SitePage =>
  /^\/solutions(?:\/|$)/.test(window.location.pathname) ? 'solutions' : 'portfolio';

const pagePath = (page: SitePage) => page === 'solutions' ? '/solutions' : '/';

const solutionDescription =
  'Data pipelines, reporting automation, SQL modernization and system integrations built around the way your business works.';

function setPageMetadata(page: SitePage) {
  document.title = page === 'solutions' ? 'Data Solutions | Parth Parekh' : 'Parth Parekh | Full-Stack Engineer';

  const setMeta = (selector: string, attr: 'name' | 'property', key: string, value: string | null) => {
    let tag = document.querySelector<HTMLMetaElement>(selector);
    if (value === null) {
      tag?.remove();
      return;
    }
    if (!tag) {
      tag = document.createElement('meta');
      tag.setAttribute(attr, key);
      document.head.appendChild(tag);
    }
    tag.content = value;
  };

  const isSolutions = page === 'solutions';
  setMeta('meta[name="description"]', 'name', 'description', isSolutions ? solutionDescription : null);
  setMeta('meta[property="og:title"]', 'property', 'og:title', isSolutions ? 'Data Solutions | Parth Parekh' : null);
  setMeta('meta[property="og:description"]', 'property', 'og:description',
    isSolutions ? 'Manual reporting, disconnected systems and fragile pipelines. I build focused, reliable data solutions.' : null);
  setMeta('meta[property="og:url"]', 'property', 'og:url',
    isSolutions ? 'https://parthparekh.dev/solutions' : null);
  setMeta('meta[property="og:type"]', 'property', 'og:type', isSolutions ? 'website' : null);
  setMeta('meta[name="twitter:card"]', 'name', 'twitter:card', isSolutions ? 'summary' : null);
  setMeta('meta[name="twitter:title"]', 'name', 'twitter:title', isSolutions ? 'Data Solutions | Parth Parekh' : null);
  setMeta('meta[name="twitter:description"]', 'name', 'twitter:description',
    isSolutions ? 'Data pipelines, reporting automation and systems integration by Parth Parekh.' : null);

  let canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.rel = 'canonical';
    document.head.appendChild(canonical);
  }
  canonical.href = page === 'solutions' ? 'https://parthparekh.dev/solutions' : 'https://parthparekh.dev/';
}

function PortfolioSite() {
  const [page, setPage] = useState<SitePage>(currentPage);

  useEffect(() => {
    const previousRestoration = history.scrollRestoration;
    history.scrollRestoration = 'manual';

    const onBackOrForward = () => {
      const nextPage = currentPage();
      setPage(nextPage);
      // When browser history changes only the hash, React's page state stays
      // the same, so explicitly move to the section without a route remount.
      requestAnimationFrame(() => {
        const id = decodeURIComponent(window.location.hash.slice(1));
        if (id) document.getElementById(id)?.scrollIntoView({ behavior: 'instant' });
        else window.scrollTo({ top: 0, behavior: 'instant' });
      });
    };

    window.addEventListener('popstate', onBackOrForward);
    return () => {
      window.removeEventListener('popstate', onBackOrForward);
      history.scrollRestoration = previousRestoration;
    };
  }, []);

  useLayoutEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1));
    if (id) document.getElementById(id)?.scrollIntoView({ behavior: 'instant' });
    else window.scrollTo({ top: 0, behavior: 'instant' });
  }, [page]);

  useEffect(() => { setPageMetadata(page); }, [page]);

  const navigate = useCallback((target: SitePage) => {
    if (target === page) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    window.history.pushState(null, '', pagePath(target));
    setPage(target);
  }, [page]);

  const goToSection = useCallback((target: SitePage, id: string) => {
    if (target === page) {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    window.history.pushState(null, '', pagePath(target) + '#' + encodeURIComponent(id));
    setPage(target);
  }, [page]);

  return (
    <>
      <SiteNav page={page} navigate={navigate} goToSection={goToSection} />
      {page === 'solutions' ? (
        <SolutionsPage onBackToPortfolio={() => navigate('portfolio')} />
      ) : (
        <App />
      )}
    </>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PortfolioSite />
  </StrictMode>,
);
