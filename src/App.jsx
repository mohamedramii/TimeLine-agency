import { useEffect, useState } from 'react';
import { ScrollTrigger } from './lib/gsap';
import { SmoothScroll } from './lib/smooth';
import { VideoModalProvider } from './components/VideoModal';
import Preloader from './components/Preloader';
import Cursor from './components/Cursor';
import Nav from './components/Nav';
import ChapterClock from './components/ChapterClock';
import ClickSpark from './components/reactbits/ClickSpark';
import Hero from './sections/Hero';
import Manifesto from './sections/Manifesto';
import Showreel from './sections/Showreel';
import Services from './sections/Services';
import Work from './sections/Work';
import Process from './sections/Process';
import Results from './sections/Results';
import Pricing from './sections/Pricing';
import Faq from './sections/Faq';
import Contact from './sections/Contact';

export default function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);
    // ScrollTrigger already refreshes on window load; fonts change line heights, so refresh once they land
    document.fonts?.ready.then(() => ScrollTrigger.refresh());
  }, []);

  useEffect(() => {
    if (ready) ScrollTrigger.refresh();
  }, [ready]);

  return (
    <SmoothScroll>
      <VideoModalProvider>
        <Preloader onDone={() => setReady(true)} />
        <Cursor />
        <Nav ready={ready} />
        <ChapterClock ready={ready} />
        <div className="guides" aria-hidden="true" />
        {/* static film grain: composited once, no per-frame blending */}
        <div className="grain" aria-hidden="true" />
        <ClickSpark sparkColor="#50B4E8" sparkSize={12} sparkRadius={26} sparkCount={9} duration={520}>
          <main>
            <Hero ready={ready} />
            <Manifesto />
            <Showreel />
            <Services />
            <Work />
            <Process />
            <Results />
            <Pricing />
            <Faq />
            <Contact />
          </main>
        </ClickSpark>
      </VideoModalProvider>
    </SmoothScroll>
  );
}
