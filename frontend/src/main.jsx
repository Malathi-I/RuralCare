import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);

// Offline support is handled by a service worker in production builds.
//
// The worker must never run during development: it caches modules and would
// keep re-serving an old copy of the app after a source file has been edited,
// which makes the dev server look like it ignored the changes. If a worker was
// registered by an earlier production/preview session on this origin, remove
// it and clear its caches so the dev server is always hit directly.
if ('serviceWorker' in navigator) {
  if (import.meta.env.PROD) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        // Offline support is an enhancement - a failure must not break the app.
      });
    });
  } else {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations.forEach((registration) => registration.unregister());
    });

    if (window.caches) {
      caches.keys().then((keys) => keys.forEach((key) => caches.delete(key)));
    }
  }
}