import { forwardRef } from 'react';
import { NAME_GROUP, NAME_PATHS, NAME_VIEWBOX, SYMBOL_GROUP, SYMBOL_PATHS } from '../lib/logoPaths';

// The circular "TL clock" symbol. Paths get the class `symbol-part` so they can be animated.
export const Symbol = forwardRef(function Symbol({ className = '', color = 'currentColor', title = 'TIME LINE', ...rest }, ref) {
  return (
    <svg ref={ref} viewBox="0 0 640 640" className={className} role="img" aria-label={title} {...rest}>
      <g transform={SYMBOL_GROUP} fill={color}>
        {SYMBOL_PATHS.map((p, i) => (
          <path key={i} className="symbol-part" d={p.d} transform={p.t} />
        ))}
      </g>
    </svg>
  );
});

// "TIME LINE" wordmark
export const Wordmark = forwardRef(function Wordmark({ className = '', color = 'currentColor' }, ref) {
  return (
    <svg ref={ref} viewBox={NAME_VIEWBOX} className={className} role="img" aria-label="TIME LINE">
      <g transform={NAME_GROUP} fill={color}>
        {NAME_PATHS.map((p, i) => (
          <path key={i} className="name-part" d={p.d} transform={p.t || undefined} />
        ))}
      </g>
    </svg>
  );
});

export function LogoLockup({ className = '', tone = 'ink' }) {
  const word = tone === 'white' ? '#fff' : 'var(--color-ink)';
  return (
    <span dir="ltr" className={`inline-flex items-center gap-2.5 ${className}`}>
      {/* data-logo-mark: the preloader's symbol flies onto the nav's copy of this */}
      <Symbol className="h-8 w-8 shrink-0" color="var(--color-sky-500)" data-logo-mark="" />
      <span className="flex flex-col leading-none">
        <Wordmark className="-ml-[3px] h-[15px] w-auto" color={word} />
        <span className="logo-tagline mt-[3px] font-mono text-[8.5px] uppercase tracking-[0.42em]" style={{ color: 'var(--color-sky-500)' }}>
          Marketing
        </span>
      </span>
    </span>
  );
}
