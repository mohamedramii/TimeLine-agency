"""Web & app work clips: cleans the raw screen recordings and encodes what the site plays.

    python scripts/encode-web-work.py <folder with the source recordings> [name ...]

For each clip it crops the browser toolbar, blurs personal details (account names, emails), cuts moments that
shouldn't be public (DevTools, extension popups, customer and client lists) and writes to public/media:

    name.webp                 poster
    name.mp4 + av1/name.mp4   7-second preview, sharp (desktop)
    name-tile.mp4 + av1/...   7-second preview, small (phones, small cards)
    name-full.mp4             the cleaned walkthrough, opens on tap (H.264 only, already small)

The name web-reel builds the rotation on the services card instead: one clip, a new project every two seconds.
"""
import os
import subprocess
import sys
import tempfile

MEDIA = os.path.join(os.path.dirname(__file__), '..', 'public', 'media')

# top/height: the page area inside the recording. blur: (x, y, w, h), negative y counts from the bottom.
# keep: time ranges of the full walkthrough. preview: (start, seconds) of the loop.
TOOLBAR = 56
CLIPS = {
    'web-nizam-erp': {'src': 'nizam-erp-product', 'keep': [(0, 3.5), (15, 53.6)], 'preview': (16, 7)},
    'web-nizam-story': {'src': 'nizam-website-story', 'top': 108, 'height': 918, 'preview': (0, 7)},
    'web-khw-reports': {'src': 'khwarizmi-report-builder', 'blur': [(26, 58, 256, 58), (10, -74, 256, 62)], 'keep': [(9, 28.2), (33.2, 41.7)], 'preview': (16, 7)},
    'web-khw-sources': {'src': 'khwarizmi-integrations', 'blur': [(26, 58, 256, 58), (10, -74, 256, 62)], 'keep': [(0, 13.5)], 'preview': (6.5, 7)},
    'web-snap': {'src': 'snap-action-experience', 'top': 0, 'height': 1000, 'preview': (0, 7)},
    'web-jeel': {'src': 'jeeltech-experience', 'blur': [(16, 58, 200, 66)], 'preview': (4, 7)},
    'web-vbooking': {'src': 'vbooking-walkthrough', 'keep': [(36, 110.6)], 'preview': (36, 7)},
    'web-radx': {'src': 'radx-walkthrough', 'top': 54, 'keep': [(0, 32)], 'preview': (0, 7)},
    'web-byv': {'src': 'bookyourvibes-walkthrough', 'top': 42, 'keep': [(0, 41.5), (48.5, 91.9)], 'preview': (0, 7)},
    'web-travelio': {'src': 'travelio-walkthrough', 'preview': (0, 7)},
    'web-culin': {'src': 'culin-walkthrough', 'preview': (5, 7)},
    'web-ifish': {'src': 'i-fish-walkthrough', 'top': 42, 'keep': [(5, 24.1)], 'preview': (5, 7)},
}

# Same order as `screens` in src/content/shared.js, same timing as REEL_* in src/components/ui.jsx.
REEL = ['web-travelio', 'web-culin', 'web-nizam-story', 'web-byv', 'web-snap', 'web-ifish', 'web-radx']
REEL_STEP = 2
REEL_FADE = 0.4
WINDOW = 2.08  # .screen-view aspect-ratio

COMMON = ['-an', '-map_metadata', '-1', '-map', '[out]', '-movflags', '+faststart', '-g', '60']
X264 = ['-c:v', 'libx264', '-preset', 'veryslow', '-profile:v', 'high']
AV1 = ['-c:v', 'libaom-av1', '-cpu-used', '6', '-row-mt', '1', '-tiles', '2x1', '-b:v', '0']


def probe(path):
    out = subprocess.check_output(['ffprobe', '-v', 'error', '-select_streams', 'v', '-show_entries', 'stream=width,height', '-of', 'csv=p=0', path])
    return map(int, out.decode().strip().split(','))


def graph(clip, w, h, width, keep=None):
    """Filter graph: blur boxes, optional cuts, then crop to the page and scale."""
    chain, last = [], '0:v'
    for i, (x, y, bw, bh) in enumerate(clip.get('blur', [])):
        y = h + y if y < 0 else y
        chain.append(f'[{last}]split=2[m{i}][b{i}];[b{i}]crop={bw}:{bh}:{x}:{y},boxblur=14:3:7:3[bb{i}];[m{i}][bb{i}]overlay={x}:{y}[v{i}]')
        last = f'v{i}'
    if keep:
        labels = ''.join(f'[s{i}]' for i in range(len(keep)))
        chain.append(f'[{last}]split={len(keep)}{labels}' if len(keep) > 1 else f'[{last}]null{labels}')
        for i, (a, b) in enumerate(keep):
            chain.append(f'[s{i}]trim={a}:{b},setpts=PTS-STARTPTS[t{i}]')
        chain.append(''.join(f'[t{i}]' for i in range(len(keep))) + f'concat=n={len(keep)}:v=1:a=0[c]')
        last = 'c'
    top = clip.get('top', TOOLBAR)
    height = clip.get('height', h - top - 4)
    chain.append(f'[{last}]crop={w - 10}:{height}:4:{top},scale={width}:-2:flags=lanczos,fps=30,format=yuv420p[out]')
    return ';'.join(chain)


def run(*args):
    subprocess.run(['ffmpeg', '-v', 'error', '-y', *args], check=True)


def reel(src_dir):
    """Each project's opening cut to the window's shape and crossfaded into the next; the last fades back into the
    first, and the cut starts where that fade ends, so the loop has no seam."""
    out = lambda *p: os.path.join(MEDIA, *p)
    with tempfile.TemporaryDirectory() as tmp:
        inputs = []
        for name in REEL:
            clip = CLIPS[name]
            src = os.path.join(src_dir, clip['src'] + '.mp4')
            w, h = probe(src)
            part = os.path.join(tmp, f'{name}.mp4')
            run('-ss', str(clip['preview'][0]), '-t', str(REEL_STEP + REEL_FADE), '-i', src, '-filter_complex', graph(clip, w, h, 1280), '-map', '[out]', '-an', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '8', part)
            inputs += ['-i', part]
        inputs += inputs[:2]

        def montage(width):
            height = round(width / WINDOW / 2) * 2
            count = len(REEL)
            chain = [f'[{i}:v]scale={width}:{height}:force_original_aspect_ratio=increase:flags=lanczos,crop={width}:{height}:(iw-{width})/2:0,setsar=1,fps=30[p{i}]' for i in range(count + 1)]
            last = 'p0'
            for i in range(1, count + 1):
                chain.append(f'[{last}][p{i}]xfade=transition=fade:duration={REEL_FADE}:offset={i * REEL_STEP}[x{i}]')
                last = f'x{i}'
            chain.append(f'[{last}]trim={REEL_FADE}:{count * REEL_STEP + REEL_FADE},setpts=PTS-STARTPTS,format=yuv420p[out]')
            return ';'.join(chain)

        run(*inputs, '-filter_complex', montage(1280), '-map', '[out]', '-frames:v', '1', '-c:v', 'libwebp', '-quality', '74', '-map_metadata', '-1', out('web-reel.webp'))
        run(*inputs, '-filter_complex', montage(1280), *COMMON, *X264, '-crf', '27', out('web-reel.mp4'))
        run(*inputs, '-filter_complex', montage(1280), *COMMON, *AV1, '-crf', '38', out('av1', 'web-reel.mp4'))
        run(*inputs, '-filter_complex', montage(720), *COMMON, *X264, '-crf', '28', out('web-reel-tile.mp4'))
        run(*inputs, '-filter_complex', montage(720), *COMMON, *AV1, '-crf', '40', out('av1', 'web-reel-tile.mp4'))
    size = lambda p: os.path.getsize(p) // 1024
    print('web-reel poster', size(out('web-reel.webp')), 'preview', size(out('web-reel.mp4')), 'av1', size(out('av1', 'web-reel.mp4')), 'tile', size(out('web-reel-tile.mp4')), 'av1', size(out('av1', 'web-reel-tile.mp4')), 'KB', flush=True)


def main():
    src_dir = sys.argv[1]
    names = sys.argv[2:] or [*CLIPS, 'web-reel']
    os.makedirs(os.path.join(MEDIA, 'av1'), exist_ok=True)
    for name in names:
        if name == 'web-reel':
            reel(src_dir)
            continue
        clip = CLIPS[name]
        src = os.path.join(src_dir, clip['src'] + '.mp4')
        w, h = probe(src)
        start, secs = clip['preview']
        window = ['-ss', str(start), '-t', str(secs), '-i', src]
        out = lambda *p: os.path.join(MEDIA, *p)
        # poster (a frame from the start of the preview)
        run('-ss', str(start + 0.4), '-i', src, '-filter_complex', graph(clip, w, h, 1280), '-map', '[out]', '-frames:v', '1', '-c:v', 'libwebp', '-quality', '74', '-map_metadata', '-1', out(f'{name}.webp'))
        # sharp preview
        run(*window, '-filter_complex', graph(clip, w, h, 1280), *COMMON, *X264, '-crf', '27', out(f'{name}.mp4'))
        run(*window, '-filter_complex', graph(clip, w, h, 1280), *COMMON, *AV1, '-crf', '38', out('av1', f'{name}.mp4'))
        # small preview
        run(*window, '-filter_complex', graph(clip, w, h, 720), *COMMON, *X264, '-crf', '28', out(f'{name}-tile.mp4'))
        run(*window, '-filter_complex', graph(clip, w, h, 720), *COMMON, *AV1, '-crf', '40', out('av1', f'{name}-tile.mp4'))
        # the full walkthrough
        run('-i', src, '-filter_complex', graph(clip, w, h, min(w - 10, 1600), clip.get('keep')), *COMMON, *X264, '-preset', 'slow', '-crf', '26', out(f'{name}-full.mp4'))
        size = lambda p: os.path.getsize(p) // 1024
        print(name, 'poster', size(out(f'{name}.webp')), 'preview', size(out(f'{name}.mp4')), 'av1', size(out('av1', f'{name}.mp4')), 'tile', size(out(f'{name}-tile.mp4')), 'av1', size(out('av1', f'{name}-tile.mp4')), 'full', size(out(f'{name}-full.mp4')), 'KB', flush=True)


if __name__ == '__main__':
    main()
