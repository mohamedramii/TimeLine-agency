# TIME LINE Marketing — Landing page

React 19 + Vite · GSAP (ScrollTrigger, SplitText, DrawSVG) · Motion · Lenis · Three.js / React Three Fiber · React Bits · Tailwind 4.
Arabic (RTL, default) and English.

## Run

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production files in dist/
npm run preview  # serve the production build
```

## The story (one scroll = one clock)

| Time  | Chapter            | Motion                                                                 |
| ----- | ------------------ | ---------------------------------------------------------------------- |
| —     | Preloader          | 000→100 clock sweep, the logo shrinks and flies into the nav, curtain lifts |
| 00:00 | Hero               | 3D extruded logo + live seconds bezel, Silk sky, headline parts sideways, night falls |
| 00:30 | Why we exist       | Pinned: words light up sky → white while you read, then breathe out    |
| 01:00 | Showreel           | Canvas zoom-out: from inside one reel to a wall of 15 reels             |
| 02:00 | What we do         | Pinned horizontal scroll of service cards (reverses for Arabic)        |
| 03:00 | Selected work      | Sticky stacked case cards                                              |
| 04:00 | The timeline       | Line draws down the page, clock hand rides the tip, milestones light up |
| 05:00 | Results            | Count-ups, velocity marquee, testimonials, logo loop                   |
| 06:00 | Packages           | 3 package cards with real savings, single services, sponsor on request |
| 07:00 | Questions          | Accordion                                                              |
| 08:00 | Your next chapter  | WhatsApp brief form + footer wordmark                                  |

A fixed "chapter clock" (bottom corner) shows the current chapter and page progress.

## Editing content

- **Arabic copy:** `src/content/ar.js` · **English copy:** `src/content/en.js`
- **Contact details, social links, WhatsApp number:** `src/content/shared.js` → `brand`
- **Media mapping / showreel wall / which video goes on which card:** `src/content/shared.js`
- Anything marked `SAMPLE` (results numbers, stats, testimonials) is placeholder — replace before launch.
- **Prices:** the real price list lives in `src/content/shared.js` (`prices`, `packages`); package values and savings are calculated from it.

## Media

Web-ready media lives in `public/media/`. It is produced by a perceptual-quality pipeline (needs ffmpeg with libaom + libvmaf):

```bash
python scripts/optimize-media.py
```

For each clip it renders a lossless reference at the size the site displays, measures the clip's near-lossless
VMAF ceiling, and keeps the **smallest** encode within 4 VMAF points of it (one just-noticeable difference is ~6),
so files are as small as possible with no visible loss. Results are logged to `scripts/media-report.json`.

- `name.mp4` / `name-tile.mp4` / `name-full.mp4` — H.264 (plays everywhere)
- `av1/…` — AV1 versions, 30–50% smaller; served automatically where the device decodes AV1 smoothly
  (desktop Chrome/Edge/Firefox, phones with hardware AV1). See `src/lib/video.js`.
- `name.webp` — posters; photos are WebP too. Brand SVGs are run through SVGO.
- The 3D hero is plain Three.js (no React-Three-Fiber/drei) and only loads on tablets/desktops.

## Visitor preferences

- Language: header button (عربي / EN) or `?lang=en` / `?lang=ar`.
- Motion: on by default. If the device reports "reduced motion" (e.g. Windows → Animation effects off) the visitor is asked once; there is also a Motion toggle in the footer.
