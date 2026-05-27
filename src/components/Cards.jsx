import React, { useRef, useMemo, useState, useCallback, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { FORMATIONS, lerpFormation } from './formations';

const CARD_COUNT = 36;
const CARD_W = 1.4;
const CARD_H = 1.9;

const PALETTES = [
  ['#ff6b9d', '#c44569'], ['#6c5ce7', '#a29bfe'], ['#fd79a8', '#e84393'],
  ['#00b894', '#00cec9'], ['#fdcb6e', '#f39c12'], ['#0984e3', '#74b9ff'],
  ['#e17055', '#d63031'], ['#6c5ce7', '#0984e3'], ['#fab1a0', '#e17055'],
  ['#55efc4', '#00b894'], ['#ffeaa7', '#fdcb6e'], ['#dfe6e9', '#b2bec3'],
  ['#fd79a8', '#6c5ce7'], ['#00cec9', '#0984e3'], ['#e84393', '#fd79a8'],
  ['#a29bfe', '#ffeaa7'], ['#ff7675', '#d63031'], ['#81ecec', '#00cec9'],
  ['#fab1a0', '#fd79a8'], ['#636e72', '#2d3436'], ['#74b9ff', '#a29bfe'],
  ['#ffeaa7', '#e17055'], ['#55efc4', '#81ecec'], ['#fdcb6e', '#fab1a0'],
  ['#0984e3', '#6c5ce7'], ['#d63031', '#e17055'], ['#00b894', '#55efc4'],
  ['#a29bfe', '#dfe6e9'], ['#fd79a8', '#fab1a0'], ['#ffeaa7', '#81ecec'],
  ['#e84393', '#6c5ce7'], ['#00cec9', '#55efc4'], ['#ff7675', '#fdcb6e'],
  ['#74b9ff', '#0984e3'], ['#fab1a0', '#ffeaa7'], ['#2d3436', '#636e72'],
];

const TITLES = [
  'Ethereal Dawn', 'Velvet Dusk', 'Crimson Echo', 'Silent Wave',
  'Golden Mist', 'Azure Dream', 'Moonlit Path', 'Crystal Bloom',
  'Amber Glow', 'Twilight Haze', 'Scarlet Rain', 'Ivory Shore',
  'Celestial Rise', 'Opal Drift', 'Indigo Pulse', 'Rose Quartz',
  'Emerald Tide', 'Copper Sun', 'Pearl Shadow', 'Violet Storm',
  'Sapphire Deep', 'Obsidian Fire', 'Coral Reef', 'Cobalt Night',
  'Amethyst Glow', 'Jade Whisper', 'Ruby Dawn', 'Onyx Mist',
  'Topaz Light', 'Luna Bloom', 'Dusk Reverie', 'Nova Spark',
  'Zenith Flare', 'Nebula Swirl', 'Eclipse Fade', 'Solstice Haze',
];

// Generate a canvas texture for each card
function createCardTexture(index) {
  const W = 512;
  const H = 700;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');

  const [c1, c2] = PALETTES[index % PALETTES.length];

  // Background gradient
  const grad = ctx.createLinearGradient(0, 0, W * 0.5, H);
  grad.addColorStop(0, c1);
  grad.addColorStop(1, c2);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // Decorative circles
  const seed = index * 7.31;
  for (let i = 0; i < 5; i++) {
    ctx.globalAlpha = 0.1 + 0.03 * Math.sin(seed + i);
    ctx.beginPath();
    const cx = W * (0.3 + 0.5 * Math.sin(seed + i * 2.1));
    const cy = H * (0.2 + 0.6 * Math.cos(seed + i * 1.7));
    const r = 60 + 80 * Math.sin(seed + i * 3.3);
    ctx.arc(cx, cy, Math.abs(r), 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
  }

  // Bottom dark overlay
  ctx.globalAlpha = 1;
  const bGrad = ctx.createLinearGradient(0, H * 0.6, 0, H);
  bGrad.addColorStop(0, 'rgba(0,0,0,0)');
  bGrad.addColorStop(1, 'rgba(0,0,0,0.6)');
  ctx.fillStyle = bGrad;
  ctx.fillRect(0, 0, W, H);

  // Number watermark
  ctx.globalAlpha = 0.12;
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 140px Georgia, serif';
  ctx.textAlign = 'left';
  ctx.fillText(String(index + 1).padStart(2, '0'), 15, 130);

  // Title
  ctx.globalAlpha = 1;
  ctx.fillStyle = '#ffffff';
  ctx.font = '600 26px "Segoe UI", Arial, sans-serif';
  ctx.fillText(TITLES[index % TITLES.length], 28, H - 55);

  // Subtitle
  ctx.globalAlpha = 0.55;
  ctx.font = '14px monospace';
  ctx.fillText(`CARD ${String(index + 1).padStart(2, '0')} / ${CARD_COUNT}`, 28, H - 28);

  // Border
  ctx.globalAlpha = 0.2;
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 2;
  ctx.strokeRect(6, 6, W - 12, H - 12);

  // Center glow
  ctx.globalAlpha = 0.08;
  const rGrad = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, W * 0.6);
  rGrad.addColorStop(0, '#ffffff');
  rGrad.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = rGrad;
  ctx.fillRect(0, 0, W, H);

  const tex = new THREE.CanvasTexture(canvas);
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  return tex;
}

// Gradient fallback texture cache
const gradientCache = {};
function getGradientTexture(index) {
  if (!gradientCache[index]) {
    gradientCache[index] = createCardTexture(index);
  }
  return gradientCache[index];
}

// Image texture loader — tries /images/card-01.jpg, .png, .webp
const imageLoader = new THREE.TextureLoader();
const imageExtensions = ['jpg', 'jpeg', 'png', 'webp'];
const imageTextureCache = {};

function tryLoadImage(index, onLoad) {
  const num = String(index + 1).padStart(2, '0');
  let tried = 0;

  function tryNext(extIdx) {
    if (extIdx >= imageExtensions.length) return; // all failed, keep gradient
    const url = `/images/card-${num}.${imageExtensions[extIdx]}`;
    imageLoader.load(
      url,
      (tex) => {
        tex.minFilter = THREE.LinearFilter;
        tex.magFilter = THREE.LinearFilter;
        imageTextureCache[index] = tex;
        onLoad(tex);
      },
      undefined,
      () => tryNext(extIdx + 1) // on error, try next extension
    );
  }
  tryNext(0);
}

// ─── Single Card ─────────────────────────────────────────────
function Card({ index, total, scrollState, onDoubleClick }) {
  const groupRef = useRef();
  const glowRef = useRef();
  const [hovered, setHovered] = useState(false);

  // Start with gradient, upgrade to image if available
  const [texture, setTexture] = useState(() => imageTextureCache[index] || getGradientTexture(index));

  useEffect(() => {
    if (imageTextureCache[index]) return; // already loaded
    tryLoadImage(index, (tex) => setTexture(tex));
  }, [index]);

  // Target positions computed from scroll — stored in refs for useFrame
  const targetPos = useRef([0, 0, 0]);
  const targetRot = useRef([0, 0, 0]);

  // Use useEffect (not useMemo) for computing targets — this is a derived side-effect
  useEffect(() => {
    const stateIdx = Math.min(Math.floor(scrollState), FORMATIONS.length - 2);
    const blend = Math.max(0, Math.min(1, scrollState - stateIdx));
    const from = FORMATIONS[Math.max(0, stateIdx)](index, total);
    const to = FORMATIONS[Math.min(stateIdx + 1, FORMATIONS.length - 1)](index, total);
    const interp = lerpFormation(from, to, blend);
    targetPos.current = interp.pos;
    targetRot.current = interp.rot;
  }, [scrollState, index, total]);

  // Smooth animation each frame
  useFrame(() => {
    const g = groupRef.current;
    if (!g) return;
    const tp = targetPos.current;
    const tr = targetRot.current;

    g.position.x += (tp[0] - g.position.x) * 0.07;
    g.position.y += (tp[1] - g.position.y) * 0.07;
    g.position.z += (tp[2] - g.position.z) * 0.07;
    g.rotation.x += (tr[0] - g.rotation.x) * 0.07;
    g.rotation.y += (tr[1] - g.rotation.y) * 0.07;
    g.rotation.z += (tr[2] - g.rotation.z) * 0.07;

    // Glow
    if (glowRef.current) {
      const targetOp = hovered ? 0.35 : 0;
      glowRef.current.material.opacity += (targetOp - glowRef.current.material.opacity) * 0.12;
    }
  });

  const onOver = useCallback((e) => {
    e.stopPropagation();
    setHovered(true);
    document.body.style.cursor = 'pointer';
  }, []);
  const onOut = useCallback((e) => {
    e.stopPropagation();
    setHovered(false);
    document.body.style.cursor = 'default';
  }, []);
  const onDbl = useCallback((e) => {
    e.stopPropagation();
    onDoubleClick(index);
  }, [index, onDoubleClick]);

  return (
    <group ref={groupRef}>
      <mesh onPointerOver={onOver} onPointerOut={onOut} onDoubleClick={onDbl}>
        <planeGeometry args={[CARD_W, CARD_H]} />
        <meshStandardMaterial
          map={texture}
          side={THREE.DoubleSide}
          metalness={0.05}
          roughness={0.45}
        />
      </mesh>
      <mesh ref={glowRef} position={[0, 0, -0.04]}>
        <planeGeometry args={[CARD_W + 0.15, CARD_H + 0.15]} />
        <meshBasicMaterial color="#ff6b9d" transparent opacity={0} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

// ─── Cards Container ─────────────────────────────────────────
export default function Cards({ scrollState, onCardDoubleClick }) {
  return (
    <group>
      {Array.from({ length: CARD_COUNT }, (_, i) => (
        <Card
          key={i}
          index={i}
          total={CARD_COUNT}
          scrollState={scrollState}
          onDoubleClick={onCardDoubleClick}
        />
      ))}
    </group>
  );
}

export { CARD_COUNT };
