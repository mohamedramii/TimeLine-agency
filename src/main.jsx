import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { LangProvider } from './i18n';
import { initialLang, motionOff } from './lib/prefs';
import { codecReady } from './lib/video';

const lang = initialLang();
const html = document.documentElement;
html.lang = lang;
html.dir = lang === 'ar' ? 'rtl' : 'ltr';
if (motionOff()) html.classList.add('motion-off');

if (lang === 'ar') {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'https://fonts.googleapis.com/css2?family=Alexandria:wght@400..700&family=Amiri:wght@400;700&display=swap';
  document.head.appendChild(link);
  document.title = 'تايم لاين ماركتنج — خلّي كل ثانية في براندك تِفرِق';
}

await codecReady;

createRoot(document.getElementById('root')).render(
  // No StrictMode: its double-mount kills WebGL contexts and duplicates GSAP pins in dev.
  <LangProvider lang={lang}>
    <App />
  </LangProvider>
);
