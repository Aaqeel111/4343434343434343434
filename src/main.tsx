import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Register service worker for PWA support
registerSW({
  onNeedRefresh() {
    if (confirm('تحديث جديد متاح، هل تود التحديث؟')) {
      window.location.reload();
    }
  },
  onOfflineReady() {
    console.log('التطبيق جاهز للعمل دون اتصال بالإنترنت');
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
