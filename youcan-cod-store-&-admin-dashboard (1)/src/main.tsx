import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { getStoredSettings } from './services/storage';
import { applyStoreTheme } from './utils/themeHelper';

// Apply stored theme color immediately before React mounts to guarantee zero color flicker
try {
  const initialSettings = getStoredSettings();
  if (initialSettings?.themeColor) {
    applyStoreTheme(initialSettings.themeColor);
  }
} catch (e) {}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
