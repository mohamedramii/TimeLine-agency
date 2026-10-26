import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { dismissMotionNotice, motionOff, setMotion, shouldShowMotionNotice } from '../lib/prefs';
import { useT } from '../i18n';

// Shown once when the OS asks for reduced motion: the visitor decides.
export function MotionNotice({ ready }) {
  const t = useT();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!ready || !shouldShowMotionNotice()) return undefined;
    const id = setTimeout(() => setShow(true), 2200);
    return () => clearTimeout(id);
  }, [ready]);

  const keep = () => {
    dismissMotionNotice();
    setShow(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          role="dialog"
          aria-live="polite"
          className="fixed bottom-5 end-5 z-[150] w-[min(380px,calc(100vw-40px))] rounded-[24px] bg-night p-5 text-white shadow-[var(--shadow-lift)] ring-1 ring-white/10"
          initial={{ y: 40, opacity: 0, scale: 0.96 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 30, opacity: 0, scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 260, damping: 26 }}
        >
          <p className="text-[14.5px] leading-relaxed text-white/85">{t.ui.motionNotice}</p>
          <div className="mt-4 flex gap-2">
            <button type="button" onClick={keep} className="rounded-full bg-sky-500 px-4 py-2 text-sm font-medium" data-cursor="hover">
              {t.ui.motionKeep}
            </button>
            <button type="button" onClick={() => setMotion(false)} className="rounded-full bg-white/10 px-4 py-2 text-sm font-medium" data-cursor="hover">
              {t.ui.motionTurnOff}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Small switch for the footer.
export function MotionToggle() {
  const t = useT();
  const off = motionOff();
  return (
    <button
      type="button"
      onClick={() => setMotion(off)}
      className="inline-flex items-center gap-2 rounded-full bg-white/[0.06] px-3 py-1.5 text-[13px] text-white/70 ring-1 ring-white/10 transition hover:text-white"
      aria-pressed={!off}
      data-cursor="hover"
    >
      <span className={`relative h-4 w-7 rounded-full transition ${off ? 'bg-white/20' : 'bg-sky-500'}`}>
        <span className={`absolute top-0.5 h-3 w-3 rounded-full bg-white transition-all ${off ? 'start-0.5' : 'start-[14px]'}`} />
      </span>
      {off ? t.ui.motionOff : t.ui.motionOn}
    </button>
  );
}
