import { StrictMode, Suspense, lazy } from 'react';
import { createRoot } from 'react-dom/client';
import './style.css';
import App from './App.tsx';

const SolutionsPage = lazy(() => import('./SolutionsPage.tsx'));
const isSolutionsPath = /^\/solutions(?:\/|$)/.test(window.location.pathname);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isSolutionsPath ? (
      <Suspense fallback={<div role="status" style={{ padding: 40 }}>Loading solutions…</div>}>
        <SolutionsPage />
      </Suspense>
    ) : (
      <App />
    )}
  </StrictMode>,
);
