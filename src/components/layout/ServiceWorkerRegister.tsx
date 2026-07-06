'use client';

import { useEffect } from 'react';

export function ServiceWorkerRegister() {
  useEffect(() => {
    const isLocal = window.location.hostname === 'localhost';
    const isHttps = window.location.protocol === 'https:';
    
    if ('serviceWorker' in navigator && (isHttps || isLocal)) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch((err) => {
          console.error('Service Worker registration failed:', err);
        });
      });
    }
  }, []);

  return null;
}
