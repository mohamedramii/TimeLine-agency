import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useLenis } from '../lib/smooth';
import { useT } from '../i18n';
import { videoUrl } from '../lib/video';

const ModalContext = createContext(() => {});
const WatchingContext = createContext(false);
export const usePlayer = () => useContext(ModalContext);
// true while the full player is open, so loops behind it can hold still
export const useWatching = () => useContext(WatchingContext);

// Full-screen player for a reel, with sound. `open(mediaItem)` from anywhere.
export function VideoModalProvider({ children }) {
  const [item, setItem] = useState(null);
  const lenis = useLenis();
  const t = useT();
  const open = useCallback(next => setItem(next), []);
  const close = useCallback(() => setItem(null), []);

  useEffect(() => {
    if (item) lenis?.stop();
    else lenis?.start();
  }, [item, lenis]);

  useEffect(() => {
    const onKey = e => e.key === 'Escape' && close();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [close]);

  return (
    <ModalContext.Provider value={open}>
      <WatchingContext.Provider value={!!item}>{children}</WatchingContext.Provider>
      <AnimatePresence>
        {item && (
          <motion.div
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.35 } }}
            onClick={close}
            role="dialog"
            aria-modal="true"
            aria-label={item.title}
          >
            <div className="absolute inset-0 bg-night/80 backdrop-blur-xl" />
            <motion.div
              className={`relative flex items-center gap-8 ${item.wide ? 'w-full max-w-[1280px] flex-col md:items-start' : 'h-full max-h-[86vh]'}`}
              initial={{ y: 60, scale: 0.92, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1, transition: { type: 'spring', stiffness: 170, damping: 22 } }}
              exit={{ y: 40, scale: 0.95, opacity: 0, transition: { duration: 0.3 } }}
              onClick={e => e.stopPropagation()}
            >
              <div className={item.wide ? 'reel !aspect-[2.08] w-full !rounded-[16px] md:!rounded-[22px]' : 'reel h-full !rounded-[30px]'}>
                <video src={videoUrl(item.full || item.loop)} poster={item.poster} autoPlay controls playsInline className="!object-contain bg-black" />
              </div>
              <div className={`hidden text-white md:block ${item.wide ? '' : 'max-w-[260px]'}`}>
                <p className="mono-label text-sky-400">{t.ui.nowPlaying}</p>
                <p className="mt-3 text-2xl font-medium tracking-tight">{item.title}</p>
                {!item.wide && <p className="mt-4 text-sm text-white/60">{t.ui.modalNote}</p>}
              </div>
            </motion.div>
            <button
              type="button"
              onClick={close}
              className="absolute end-5 top-5 grid h-12 w-12 place-items-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-sky-500"
              aria-label={t.ui.closeVideo}
              data-cursor="hover"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
                <path d="M3 3l10 10M13 3 3 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </ModalContext.Provider>
  );
}
