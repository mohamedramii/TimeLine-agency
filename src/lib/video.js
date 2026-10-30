// Picks the lightest video format this device plays well.
// AV1 files (public/media/av1) are ~30-45% smaller than the H.264 ones at the same visual quality,
// but we only use them where decoding is smooth (desktop) or hardware-accelerated (phones).

const AV1 = 'video/mp4; codecs="av01.0.05M.08"';
const OPUS = 'audio/mp4; codecs="opus"';
let useAv1 = false;
let useAv1Audio = false;

async function probe() {
  if (typeof document === 'undefined') return;
  const v = document.createElement('video');
  if (v.canPlayType(AV1) !== 'probably') return;
  try {
    const info = await navigator.mediaCapabilities?.decodingInfo({
      type: 'file',
      video: { contentType: AV1, width: 720, height: 1280, bitrate: 900_000, framerate: 30 }
    });
    const coarse = window.matchMedia('(pointer: coarse)').matches;
    useAv1 = !!info?.supported && (coarse ? info.powerEfficient : info.smooth);
  } catch {
    useAv1 = !window.matchMedia('(pointer: coarse)').matches;
  }
  useAv1Audio = useAv1 && v.canPlayType(OPUS) === 'probably';
}

// resolved before the app renders (main.jsx awaits it; it takes a few milliseconds)
export const codecReady = probe();

export function videoUrl(url) {
  if (!url || !useAv1) return url;
  // full clips carry audio (Opus in the AV1 files) — keep H.264/AAC where Opus-in-MP4 isn't supported
  // and the web-work walkthroughs ship as H.264 only: they are short and already tiny
  if (url.endsWith('-full.mp4') && (!useAv1Audio || url.includes('/web-'))) return url;
  return url.replace('/media/', '/media/av1/');
}
