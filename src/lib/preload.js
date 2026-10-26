// Downloads the first videos a visitor meets while the preloader runs, and keeps them as in-memory
// blobs so they start instantly (no network wait, no black frame) when they come on screen.
import { videoUrl } from './video';

const blobs = new Map();

// the URL a <video> should use: the preloaded blob when there is one
export const cachedUrl = url => blobs.get(url) || url;

// Fetches every url (4 at a time) and reports overall progress 0 → 1.
export function preloadVideos(urls, onProgress) {
  const list = [...new Set(urls.map(videoUrl))];
  const done = list.map(() => 0);
  const report = () => onProgress?.(done.reduce((s, d) => s + d, 0) / list.length);

  const one = async (url, i) => {
    try {
      const res = await fetch(url);
      const total = +res.headers.get('content-length') || 0;
      const reader = res.body.getReader();
      const chunks = [];
      let got = 0;
      for (;;) {
        const { done: end, value } = await reader.read();
        if (end) break;
        chunks.push(value);
        got += value.length;
        if (total) done[i] = Math.min(0.99, got / total);
        report();
      }
      blobs.set(url, URL.createObjectURL(new Blob(chunks, { type: 'video/mp4' })));
    } catch {
      /* the video just streams normally later */
    }
    done[i] = 1;
    report();
  };

  let next = 0;
  const worker = async () => {
    while (next < list.length) {
      const i = next++;
      await one(list[i], i);
    }
  };
  return Promise.all(Array.from({ length: Math.min(4, list.length) }, worker));
}
