import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import './styles/index.css';
import { App } from './app/App';

// PWA-first: register the service worker (auto-updates on next visit). No-op in
// dev (devOptions.enabled = false) and harmless where SW is unsupported.
registerSW({ immediate: true });

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
