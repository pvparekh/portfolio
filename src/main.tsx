import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './style.css';
import App from './App.tsx';
import SolutionsPage from './SolutionsPage.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/^\/solutions(?:\/|$)/.test(window.location.pathname) ? <SolutionsPage /> : <App />}
  </StrictMode>,
);
