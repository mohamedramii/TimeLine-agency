import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'motion/react';
import { useT } from '../i18n';

// Dot + ring cursor. Elements opt in with data-cursor="hover" | "play" | "drag".
export default function Cursor() {
  const t = useT();
  const [enabled, setEnabled] = useState(false);
  const [mode, setMode] = useState('default');
  const [down, setDown] = useState(false);
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const rx = useSpring(x, { stiffness: 380, damping: 32, mass: 0.6 });
  const ry = useSpring(y, { stiffness: 380, damping: 32, mass: 0.6 });

  useEffect(() => {
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (!fine) return undefined;
    setEnabled(true);
    document.documentElement.classList.add('has-cursor');
    const move = e => {
      x.set(e.clientX);
      y.set(e.clientY);
      const t = e.target.closest?.('[data-cursor]');
      setMode(t ? t.getAttribute('data-cursor') : 'default');
    };
    const press = () => setDown(true);
    const release = () => setDown(false);
    window.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('pointerdown', press);
    window.addEventListener('pointerup', release);
    return () => {
      document.documentElement.classList.remove('has-cursor');
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerdown', press);
      window.removeEventListener('pointerup', release);
    };
  }, [x, y]);

  if (!enabled) return null;

  const big = mode === 'play' || mode === 'drag';
  const size = big ? 92 : mode === 'hover' ? 54 : 34;

  return (
    <>
      <motion.div
        className="pointer-events-none fixed left-0 top-0 z-[300] grid place-items-center rounded-full"
        style={{ x: rx, y: ry, translateX: '-50%', translateY: '-50%' }}
        animate={{
          width: size,
          height: size,
          scale: down ? 0.85 : 1,
          backgroundColor: big ? 'rgba(80,180,232,0.95)' : 'rgba(80,180,232,0)',
          borderColor: big ? 'rgba(80,180,232,0)' : mode === 'hover' ? 'rgba(80,180,232,0.9)' : 'rgba(80,180,232,0.55)',
          backdropFilter: big ? 'blur(0px)' : 'blur(0px)'
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 26 }}
      >
        <motion.span
          className="absolute inset-0 rounded-full border"
          style={{ borderColor: 'inherit' }}
        />
        {big && (
          <motion.span
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mono-label !text-[11px] font-medium text-white"
          >
            {mode === 'play' ? t.ui.play : t.ui.drag}
          </motion.span>
        )}
      </motion.div>
      <motion.div
        className="pointer-events-none fixed left-0 top-0 z-[301] h-[6px] w-[6px] rounded-full bg-sky-500 mix-blend-normal"
        style={{ x, y, translateX: '-50%', translateY: '-50%' }}
        animate={{ opacity: big ? 0 : 1 }}
      />
    </>
  );
}
