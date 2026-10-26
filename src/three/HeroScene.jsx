import { useEffect, useRef } from 'react';
import {
  ACESFilmicToneMapping,
  AmbientLight,
  Box3,
  BoxGeometry,
  Color,
  DirectionalLight,
  DoubleSide,
  ExtrudeGeometry,
  Group,
  InstancedMesh,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  Object3D,
  PerspectiveCamera,
  PlaneGeometry,
  PMREMGenerator,
  RingGeometry,
  Scene,
  SphereGeometry,
  TorusGeometry,
  Vector3,
  WebGLRenderer
} from 'three';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js';

// Plain Three.js with named imports (no React-Three-Fiber): the bundler can drop every part of
// Three this scene doesn't use, which keeps the 3D chunk a fraction of its former size.

const SKY = new Color('#50B4E8');

// Soft studio reflections: a few glowing panels baked once into a PMREM environment map.
const PANELS = [
  { ring: false, intensity: 1.8, color: '#ffffff', position: [0, 4, 4], scale: [10, 2, 1] },
  { ring: false, intensity: 2, color: '#bfe6fa', position: [-5, 0, 2], scale: [8, 4, 1] },
  { ring: false, intensity: 1.5, color: '#ffffff', position: [5, -1, 2], scale: [8, 4, 1] },
  { ring: true, intensity: 2, color: '#ffffff', position: [0, 0, -6], scale: [6, 6, 6] }
];

function studioEnvironment(renderer, disposables) {
  const env = new Scene();
  PANELS.forEach(p => {
    const geo = p.ring ? new RingGeometry(0.5, 1, 64) : new PlaneGeometry(1, 1);
    const mat = new MeshBasicMaterial({ color: new Color(p.color).multiplyScalar(p.intensity), side: DoubleSide, toneMapped: false });
    const mesh = new Mesh(geo, mat);
    mesh.position.set(...p.position);
    mesh.scale.set(...p.scale);
    mesh.lookAt(0, 0, 0);
    env.add(mesh);
    disposables.push(geo, mat);
  });
  const pmrem = new PMREMGenerator(renderer);
  const target = pmrem.fromScene(env, 0.02);
  pmrem.dispose();
  disposables.push(target);
  return target.texture;
}

// The brand symbol, extruded from the official SVG.
function symbolMesh(svgText, disposables) {
  const data = new SVGLoader().parse(svgText);
  const material = new MeshPhysicalMaterial({
    color: SKY,
    roughness: 0.22,
    metalness: 0,
    clearcoat: 1,
    clearcoatRoughness: 0.06,
    envMapIntensity: 0.55,
    iridescence: 0.15,
    iridescenceIOR: 1.25
  });
  disposables.push(material);
  const inner = new Group();
  data.paths.forEach(path => {
    path.toShapes(true).forEach(shape => {
      const geo = new ExtrudeGeometry(shape, { depth: 70, bevelEnabled: true, bevelThickness: 10, bevelSize: 6, bevelSegments: 8, curveSegments: 64 });
      disposables.push(geo);
      inner.add(new Mesh(geo, material));
    });
  });
  const center = new Box3().setFromObject(inner).getCenter(new Vector3());
  inner.children.forEach(m => m.position.sub(center));
  const outer = new Group();
  outer.scale.set(0.0058, -0.0058, 0.0058);
  outer.add(inner);
  return outer;
}

// 60 ticks around the symbol plus a dot that keeps real seconds.
function bezel(disposables) {
  const group = new Group();
  const count = 60;
  const tickGeo = new BoxGeometry(0.025, 0.07, 0.025);
  const tickMat = new MeshStandardMaterial({ roughness: 0.4, metalness: 0.2 });
  const ticks = new InstancedMesh(tickGeo, tickMat, count);
  const dummy = new Object3D();
  const grey = new Color('#b9c9d6');
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2;
    const major = i % 5 === 0;
    dummy.position.set(Math.sin(a) * 2.55, Math.cos(a) * 2.55, 0);
    dummy.rotation.set(0, 0, -a);
    dummy.scale.set(major ? 1.6 : 1, major ? 2.6 : 1.2, 1);
    dummy.updateMatrix();
    ticks.setMatrixAt(i, dummy.matrix);
    ticks.setColorAt(i, major ? SKY : grey);
  }
  group.add(ticks);

  const ringGeo = new TorusGeometry(2.78, 0.012, 16, 200);
  const ringMat = new MeshStandardMaterial({ color: '#cfe9f7', roughness: 0.3 });
  group.add(new Mesh(ringGeo, ringMat));

  const dotGeo = new SphereGeometry(0.07, 32, 32);
  const dotMat = new MeshStandardMaterial({ color: SKY, emissive: SKY, emissiveIntensity: 0.6 });
  const dot = new Mesh(dotGeo, dotMat);
  dot.position.set(0, 2.78, 0);
  const hand = new Group();
  hand.add(dot);
  group.add(hand);

  disposables.push(tickGeo, tickMat, ringGeo, ringMat, dotGeo, dotMat);
  return { group, hand };
}

// The canvas fills its whole layer so the scroll dive never runs into an edge; `anchor` is the box
// the clock is framed in, as if the canvas were only that big.
export default function HeroScene({ progress, anchor, className = '' }) {
  const wrap = useRef(null);

  useEffect(() => {
    const host = wrap.current;
    const disposables = [];
    let alive = true;
    let raf = 0;
    let visible = true;
    let last = performance.now();

    const renderer = new WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.toneMapping = ACESFilmicToneMapping;
    renderer.domElement.style.cssText = 'display:block;width:100%;height:100%';
    host.appendChild(renderer.domElement);

    const scene = new Scene();
    const camera = new PerspectiveCamera(32, 1, 0.1, 100);
    camera.position.set(0, 0, 9);
    scene.add(new AmbientLight(0xffffff, 0.25));
    const key = new DirectionalLight(0xffffff, 1.1);
    key.position.set(3, 4, 6);
    const fill = new DirectionalLight('#bfe6fa', 0.35);
    fill.position.set(-4, -2, 3);
    scene.add(key, fill);
    scene.environment = studioEnvironment(renderer, disposables);

    const rig = new Group();
    const float = new Group();
    rig.add(float);
    scene.add(rig);
    const { group: dial, hand } = bezel(disposables);
    float.add(dial);

    fetch('/brand/symbol.svg')
      .then(r => r.text())
      .then(svg => alive && float.add(symbolMesh(svg, disposables)))
      .catch(() => {});

    const pointer = { x: 0, y: 0 };
    const onPointer = e => {
      const r = host.getBoundingClientRect();
      pointer.x = ((e.clientX - r.left) / r.width) * 2 - 1;
      pointer.y = -(((e.clientY - r.top) / r.height) * 2 - 1);
    };
    window.addEventListener('pointermove', onPointer, { passive: true });

    const resize = () => {
      const w = Math.max(1, host.clientWidth);
      const h = Math.max(1, host.clientHeight);
      // a full-screen canvas on big monitors: ease the pixel ratio off a little
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, w * h > 2e6 ? 1.25 : 1.5));
      renderer.setSize(w, h, false);
      // project as if the canvas were the anchor box, then widen the view to the whole canvas
      // (offset* are layout values, so the intro's scale tween doesn't skew them)
      const a = anchor?.current;
      if (a?.offsetWidth && a.offsetHeight) {
        camera.aspect = a.offsetWidth / a.offsetHeight;
        camera.setViewOffset(a.offsetWidth, a.offsetHeight, host.offsetLeft - a.offsetLeft, host.offsetTop - a.offsetTop, w, h);
      } else {
        camera.aspect = w / h;
        camera.clearViewOffset();
      }
      camera.updateProjectionMatrix();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(host);
    if (anchor?.current) ro.observe(anchor.current);
    resize();

    const seed = Math.random() * 100;
    const frame = now => {
      raf = 0;
      if (!alive || !visible || document.hidden) return;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const t = now / 1000;
      const p = progress?.current ?? 0;
      const k = 1 - Math.pow(0.001, dt);

      // gentle float
      const ft = seed + t * 1.4;
      float.position.y = Math.sin(ft) * 0.06;
      float.rotation.set((Math.cos(ft / 4) / 8) * 0.25, (Math.sin(ft / 4) / 8) * 0.25, (Math.sin(ft / 4) / 20) * 0.25);

      // pointer parallax + the scroll dive into the clock
      rig.rotation.y = MathUtils.lerp(rig.rotation.y, pointer.x * 0.35 + p * Math.PI * 0.9, k);
      rig.rotation.x = MathUtils.lerp(rig.rotation.x, -pointer.y * 0.22 + p * 0.25, k);
      camera.position.z = MathUtils.lerp(camera.position.z, 9 - p * 7.2, k);
      camera.position.x = MathUtils.lerp(camera.position.x, -p * 0.6, k);

      // real seconds on the bezel
      const d = new Date();
      hand.rotation.z = -((d.getSeconds() + d.getMilliseconds() / 1000) / 60) * Math.PI * 2;

      renderer.render(scene, camera);
      raf = requestAnimationFrame(frame);
    };
    const wake = () => {
      if (!raf && alive && visible && !document.hidden) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    };
    const io = new IntersectionObserver(
      ([e]) => {
        visible = e.isIntersecting;
        wake();
      },
      { rootMargin: '100px' }
    );
    io.observe(host);
    document.addEventListener('visibilitychange', wake);
    wake();

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      window.removeEventListener('pointermove', onPointer);
      document.removeEventListener('visibilitychange', wake);
      disposables.forEach(d => d.dispose());
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [progress, anchor]);

  return <div ref={wrap} className={className} />;
}
