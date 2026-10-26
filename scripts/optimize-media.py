"""Perceptually-tuned media compression for the TIME LINE site.

For every clip it builds a lossless reference at the exact size the site shows, measures the
clip's near-lossless VMAF ceiling (Netflix's perceptual metric; grainy footage never reaches 100),
then keeps the *smallest* encode within 4 points of that ceiling — below one just-noticeable
difference (~6 points). Maximum compression, no visible loss.

Outputs (in public/media):
  name.mp4 / name-tile.mp4 / name-full.mp4   H.264 (plays everywhere)
  av1/<same names>                           AV1 (~30-50% smaller; used when the browser supports it)
  name.webp                                   poster
usage:  python scripts/optimize-media.py [clip ...] [--fast]   (from the website folder; needs ffmpeg with libaom + libvmaf)
        --fast encodes at the levels in KNOWN instead of searching
"""
import json, os, subprocess, sys, tempfile, shutil
from concurrent.futures import ThreadPoolExecutor

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.dirname(ROOT)
FB = os.path.join(SRC, '_fb-reels')
OUT = os.path.join(ROOT, 'public', 'media')
AV1 = os.path.join(OUT, 'av1')
WORK = os.environ.get('TL_WORK') or tempfile.mkdtemp(prefix='tl-media-')
os.makedirs(AV1, exist_ok=True)

MARGIN = 4.0  # VMAF points below the clip's near-lossless ceiling; one just-noticeable difference is ~6
H264_CRF = [28, 26, 24, 22]
H264_TILE_CRF = [30, 28, 26, 24, 22]                       # tried from smallest file upward
AV1_CRF = [40, 37, 34, 31, 28]
AV1_TILE_CRF = [48, 45, 42, 39, 36]  # 360p tiles hide much more; start higher
SELECT = "select='lt(mod(t\\,10)\\,1.2)',setpts=N/FRAME_RATE/TB,"

# name: (source, start, duration, prefilter, full_duration or None)
CLIPS = {
    'zat-pour': (os.path.join(SRC, 'masheaa 1.mov'), 0, 6.8, '', None),
    'zat-stir': (os.path.join(SRC, 'masheaa 2.mov'), 0, 6.8, '', None),
    'zat-iced': (os.path.join(SRC, 'masheaa 3.mov'), 0, 6.8, '', None),
    'zat-final': (os.path.join(SRC, 'finl.mov'), 0, 6.8, '', None),
    'talk': (os.path.join(SRC, 'IMG_0941.MP4'), 0.5, 12, '', 90),
    'mamo-bowl': (os.path.join(FB, '1861471828059827.mp4'), 0, 12, '', 90),
    'mamo-bite': (os.path.join(FB, '650739354384611.mp4'), 3, 12, '', 90),
    'santos': (os.path.join(FB, '1616995760014401.mp4'), 0, 12, '', 90),
    'alex-vlog': (os.path.join(FB, '1095851096735185.mp4'), 0, 121, SELECT, 75),
}
SIZES = {'loop': (720, 1280, 30), 'tile': (360, 640, 24), 'full': (720, 1280, 30)}


def run(args):
    r = subprocess.run(args, capture_output=True, text=True)
    if r.returncode:
        raise RuntimeError(' '.join(args[:6]) + '\n' + r.stderr[-800:])
    return r


def reference(name, kind):
    src, ss, dur, pre, full = CLIPS[name]
    w, h, fps = SIZES[kind]
    if kind == 'full':
        ss, dur, pre = 0, full, ''
    ref = os.path.join(WORK, f'{name}-{kind}-ref.mp4')
    if not os.path.exists(ref):
        vf = f'{pre}scale={w}:{h}:force_original_aspect_ratio=increase:flags=lanczos,crop={w}:{h},fps={fps},format=yuv420p'
        args = ['ffmpeg', '-v', 'error', '-y', '-threads', '4', '-ss', str(ss), '-t', str(dur), '-i', src, '-vf', vf,
                '-c:v', 'libx264', '-qp', '0', '-preset', 'ultrafast', '-video_track_timescale', str(fps * 512)]
        args += ['-c:a', 'alac'] if kind == 'full' else ['-an']
        run(args + [ref])
    return ref


def vmaf(dist, ref):
    # run inside the work dir so the log path needs no filter-graph escaping (Windows drive colons)
    log = os.path.basename(dist) + '.vmaf.json'
    r = subprocess.run(['ffmpeg', '-v', 'error', '-i', os.path.basename(dist), '-i', os.path.basename(ref), '-lavfi',
                        f'[0:v]setpts=N/30/TB[d];[1:v]setpts=N/30/TB[r];[d][r]libvmaf=n_threads=4:log_fmt=json:log_path={log}',  # compare frame i with frame i
                        '-f', 'null', '-'], capture_output=True, text=True, cwd=WORK)
    if r.returncode:
        raise RuntimeError(r.stderr[-800:])
    data = json.load(open(os.path.join(WORK, log)))
    os.remove(os.path.join(WORK, log))
    return data['pooled_metrics']['vmaf']['mean'], data['pooled_metrics']['vmaf']['min']


def encode(ref, out, codec, crf, kind):
    fps = SIZES[kind][2]
    if codec == 'h264':
        v = ['-c:v', 'libx264', '-preset', 'veryslow', '-tune', 'film', '-crf', str(crf), '-profile:v', 'high', '-pix_fmt', 'yuv420p']
        a = ['-c:a', 'aac', '-b:a', '96k']
    else:
        v = ['-c:v', 'libaom-av1', '-crf', str(crf), '-b:v', '0', '-cpu-used', '5', '-row-mt', '1', '-tiles', '1x2', '-pix_fmt', 'yuv420p']
        a = ['-c:a', 'libopus', '-b:a', '80k']
    args = ['ffmpeg', '-v', 'error', '-y', '-i', ref] + v + (a if kind == 'full' else ['-an']) + ['-r', str(fps), '-video_track_timescale', str(fps * 512), '-movflags', '+faststart', out]
    run(args)
    return os.path.getsize(out)


def best(name, kind, codec):
    ref = reference(name, kind)
    suffix = '' if kind == 'loop' else f'-{kind}'
    final = os.path.join(OUT if codec == 'h264' else AV1, f'{name}{suffix}.mp4')
    # full-length clips are the same footage as their loop: reuse the level found there
    if kind == 'full':
        crf = RESULTS[(name, 'loop', codec)]['crf']
        size = encode(ref, final, codec, crf, kind)
        print(f'  {name:10s} full {codec:4s} crf {crf:2d}  {size/1024:7.0f} KB  (level from loop)', flush=True)
        return {'crf': crf, 'size': size}
    # this clip's own ceiling: a near-lossless encode. Grainy footage never scores 100.
    key = (name, kind)
    if key not in PLATEAU:
        tmp = os.path.join(WORK, f'{name}{suffix}.ceiling.mp4')
        encode(ref, tmp, 'h264', 16, kind)
        PLATEAU[key] = vmaf(tmp, ref)[0]
        if PLATEAU[key] < 93:  # a near-lossless encode always scores high; anything lower means misaligned frames
            raise RuntimeError(f'{name} {kind}: suspicious ceiling {PLATEAU[key]:.1f}')
    target = PLATEAU[key] - MARGIN
    if codec == 'h264':
        ladder = H264_TILE_CRF if kind == 'tile' else H264_CRF
    else:
        ladder = AV1_TILE_CRF if kind == 'tile' else AV1_CRF
    chosen = None
    for crf in ladder:
        tmp = os.path.join(WORK, f'{name}{suffix}.{codec}.{crf}.mp4')
        size = encode(ref, tmp, codec, crf, kind)
        mean, low = vmaf(tmp, ref)
        ok = mean >= target
        print(f'  {name:10s} {kind:4s} {codec:4s} crf {crf:2d}  {size/1024:7.0f} KB  vmaf {mean:5.2f} / ceiling {PLATEAU[key]:5.2f} {"OK" if ok else "--"}', flush=True)
        if ok or crf == ladder[-1]:
            chosen = {'crf': crf, 'size': size, 'vmaf': round(mean, 2), 'ceiling': round(PLATEAU[key], 2)}
            shutil.copyfile(tmp, final)
            break
    return chosen


PLATEAU = {}

# Levels measured with VMAF in earlier full runs (loop CRF per codec). `--fast` reuses them:
# tiles take a step up (smaller frames hide more), full-length clips reuse the loop level.
KNOWN = {
    'zat-pour': {'h264': 24, 'av1': 31},
    'mamo-bowl': {'h264': 26, 'av1': 34},
    'mamo-bite': {'h264': 24, 'av1': 34},
    'santos': {'h264': 24, 'av1': 34},
    'talk': {'h264': 22, 'av1': 30},
    'alex-vlog': {'h264': 24, 'av1': 32},
}
FAST = '--fast' in sys.argv
TILES = [c for c in ('h264', 'av1') if f'--tiles-{c}' in sys.argv]  # only (re)search the showreel-wall tiles


def fast(name, kind, codec):
    ref = reference(name, kind)
    suffix = '' if kind == 'loop' else f'-{kind}'
    final = os.path.join(OUT if codec == 'h264' else AV1, f'{name}{suffix}.mp4')
    crf = KNOWN[name][codec] + ((2 if codec == 'h264' else 4) if kind == 'tile' else 0)
    size = encode(ref, final, codec, crf, kind)
    print(f'  {name:10s} {kind:4s} {codec:4s} crf {crf:2d}  {size/1024:7.0f} KB  (measured level)', flush=True)
    return {'crf': crf, 'size': size, 'source': 'measured level'}
RESULTS = {}


def job(name):
    if TILES:
        for codec in TILES:
            RESULTS[(name, 'tile', codec)] = best(name, 'tile', codec)
        return
    for kind in ('loop', 'tile', 'full'):
        if kind == 'full' and CLIPS[name][4] is None:
            continue
        for codec in ('h264', 'av1'):
            RESULTS[(name, kind, codec)] = fast(name, kind, codec) if FAST and name in KNOWN else best(name, kind, codec)
    # poster from the H.264 loop
    run(['ffmpeg', '-v', 'error', '-y', '-ss', '0.8', '-i', os.path.join(OUT, f'{name}.mp4'), '-frames:v', '1',
         '-c:v', 'libwebp', '-quality', '82', '-compression_level', '6', os.path.join(OUT, f'{name}.webp')])


if __name__ == '__main__':
    names = [a for a in sys.argv[1:] if not a.startswith('--')] or list(CLIPS)
    print('work dir:', WORK, flush=True)
    with ThreadPoolExecutor(4) as ex:
        list(ex.map(job, names))
    report = {f'{n}|{k}|{c}': v for (n, k, c), v in RESULTS.items()}
    path = os.path.join(ROOT, 'scripts', 'media-report.json')
    old = json.load(open(path)) if os.path.exists(path) else {}
    old.update(report)
    json.dump(old, open(path, 'w'), indent=1)
    print('done')
