import { useEffect, useRef } from 'react';

// Phone marquee: two copies on a track moved by a CSS animation, so the browser's compositor runs it with
// no JavaScript per frame and no repaints. `speed` is in px/s; `reverse` runs it rightwards.
export function Marquee({ children, speed = 60, reverse = false, className = '', style }) {
  const track = useRef(null);

  useEffect(() => {
    const el = track.current;
    const fit = () => el.style.setProperty('--marquee-time', `${Math.max(8, el.offsetWidth / 2 / speed).toFixed(1)}s`);
    fit();
    document.fonts?.ready.then(fit);
    // off screen it stays paused, so a resting page really rests
    const io = new IntersectionObserver(([entry]) => {
      el.style.animationPlayState = entry.isIntersecting ? 'running' : 'paused';
    });
    io.observe(el.parentElement);
    return () => io.disconnect();
  }, [speed]);

  return (
    <div dir="ltr" className={`marquee ${className}`} style={style}>
      <div ref={track} className={`marquee-track ${reverse ? 'marquee-reverse' : ''}`}>
        <div className="marquee-copy">{children}</div>
        <div className="marquee-copy" aria-hidden="true">
          {children}
        </div>
      </div>
    </div>
  );
}

// Outlined text drawn once to a canvas (stroke, then the fill punched out), so joined Arabic letters show no
// seams and the moving marquee never re-runs a filter: an SVG filter here cost a repaint on every frame.
export function OutlineText({ text, color = '#ffffff', width = 1.7 }) {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    let alive = true;

    const draw = () => {
      if (!alive) return;
      const cs = getComputedStyle(canvas.parentElement);
      const size = parseFloat(cs.fontSize);
      const ratio = Math.min(window.devicePixelRatio || 1, 2.5);
      const ctx = canvas.getContext('2d');
      const font = `${cs.fontWeight} ${size}px ${cs.fontFamily}`;
      canvas.dir = document.documentElement.dir;
      ctx.font = font;
      const w = Math.ceil(ctx.measureText(text).width + size * 0.5);
      const h = Math.ceil(size * 1.5);
      canvas.width = w * ratio;
      canvas.height = h * ratio;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.scale(ratio, ratio);
      ctx.font = font; // resizing the canvas resets its state
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'left';
      ctx.lineJoin = 'round';
      ctx.lineWidth = width * 2;
      ctx.strokeStyle = color;
      ctx.strokeText(text, size * 0.25, h / 2);
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillText(text, size * 0.25, h / 2);
    };

    const cs = getComputedStyle(canvas.parentElement);
    const ready = document.fonts?.load(`${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`, text) ?? Promise.resolve();
    ready.then(draw, draw);
    return () => {
      alive = false;
    };
  }, [text, color, width]);

  return <canvas ref={ref} role="img" aria-label={text} className="block shrink-0" />;
}
