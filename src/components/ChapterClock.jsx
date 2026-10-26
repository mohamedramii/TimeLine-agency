import { useRef, useState } from 'react';
import { AnimatePresence, motion, useMotionValueEvent, useScroll, useSpring } from 'motion/react';
import { ScrollTrigger, useGSAP } from '../lib/gsap';
import { chapterIds, chapterTimes } from '../content/shared';
import { useT } from '../i18n';

const R = 17;
const CIRC = 2 * Math.PI * R;

// Fixed HUD: a tiny clock whose hand is the page's scroll progress, plus the current chapter.
export default function ChapterClock({ ready }) {
  const t = useT();
  const [active, setActive] = useState(0);
  const [away, setAway] = useState(false);
  const hand = useRef(null);
  const arc = useRef(null);
  const { scrollY, scrollYProgress } = useScroll();
  const smooth = useSpring(scrollYProgress, { stiffness: 140, damping: 26 });

  useMotionValueEvent(scrollY, 'change', y => {
    const end = document.documentElement.scrollHeight - window.innerHeight;
    // out of the way on the hero and over the footer
    setAway(y > window.innerHeight * 0.5 && y < end - 360);
  });

  // SVG attributes with an explicit pivot (20,20): CSS transform-origin on SVG children
  // resolves against each element's own box, which made the hand swing off-centre.
  useMotionValueEvent(smooth, 'change', v => {
    const p = Math.min(1, Math.max(0, v));
    hand.current?.setAttribute('transform', `rotate(${(p * 360).toFixed(2)} 20 20)`);
    arc.current?.setAttribute('stroke-dashoffset', (CIRC * (1 - p)).toFixed(2));
  });

  useGSAP(
    () => {
      if (!ready) return;
      chapterIds.forEach((id, i) => {
        const el = document.getElementById(id);
        if (!el) return;
        ScrollTrigger.create({
          trigger: el,
          start: 'top 55%',
          end: 'bottom 55%',
          onToggle: self => self.isActive && setActive(i)
        });
      });
    },
    { dependencies: [ready] }
  );

  const show = ready && away;

  return (
    <motion.div
      className="pointer-events-none fixed bottom-5 start-5 z-[80] hidden items-center gap-3 rounded-full bg-white/90 py-2 ps-2 pe-5 shadow-[0_0_0_1px_rgba(223,232,239,0.9),0_16px_40px_-20px_rgba(23,63,90,0.4)] lg:flex"
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: show ? 0 : 80, opacity: show ? 1 : 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 40 40" className="h-10 w-10 shrink-0">
        <circle cx="20" cy="20" r="19" fill="var(--color-sky-50)" />
        <circle cx="20" cy="20" r={R} fill="none" stroke="var(--color-sky-100)" strokeWidth="2" />
        {/* progress ring starts at 12 o'clock */}
        <circle
          ref={arc}
          cx="20"
          cy="20"
          r={R}
          fill="none"
          stroke="var(--color-sky-500)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray={CIRC.toFixed(2)}
          strokeDashoffset={CIRC.toFixed(2)}
          transform="rotate(-90 20 20)"
        />
        {[0, 90, 180, 270].map(a => (
          <line key={a} x1="20" y1="5.5" x2="20" y2="8" stroke="var(--color-sky-300)" strokeWidth="1.4" strokeLinecap="round" transform={`rotate(${a} 20 20)`} />
        ))}
        <line ref={hand} x1="20" y1="20" x2="20" y2="9.5" stroke="var(--color-ink)" strokeWidth="2" strokeLinecap="round" transform="rotate(0 20 20)" />
        <circle cx="20" cy="20" r="2.4" fill="var(--color-ink)" />
        <circle cx="20" cy="20" r="0.9" fill="var(--color-sky-500)" />
      </svg>
      <div className="relative h-[36px] w-[160px] overflow-hidden">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={active}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0 flex flex-col justify-center"
          >
            <span dir="ltr" className="self-start font-mono text-[10px] tracking-[0.08em] text-sky-600">
              {chapterTimes[active]}
            </span>
            <span className="truncate text-[13px] font-medium leading-tight text-ink">{t.chapters[active]}</span>
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
