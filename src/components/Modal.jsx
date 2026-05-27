import React, { useEffect, useRef, useMemo, useState, useCallback } from 'react';
import gsap from 'gsap';

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

const CATEGORIES = [
  'Nature', 'Water', 'Forest', 'Mountain', 'Sunset',
  'Ocean', 'Flower', 'Sky', 'City', 'Architecture',
  'Abstract', 'Texture',
];

const DESCRIPTIONS = [
  'A fleeting moment captured in light and shadow, where reality bends into the abstract.',
  'Layers of color dissolve into one another, revealing hidden geometries beneath.',
  'The quiet tension between movement and stillness, frozen in time.',
  'Nature whispers through form and texture, inviting contemplation.',
  'Vibrant hues converge in an ephemeral dance of brilliance and shadow.',
  'An intimate glimpse into the extraordinary within the ordinary.',
];

/**
 * Get image URL — tries real image from /images/, falls back to generated.
 */
function getImageUrl(index) {
  const num = String(index + 1).padStart(2, '0');
  // Try common extensions (browser will show fallback on 404)
  // We check existence by attempting load
  return `/images/card-${num}.jpg`;
}

function generateFallbackUrl(index) {
  const W = 640;
  const H = 900;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');

  const [c1, c2] = PALETTES[index % PALETTES.length];

  // Main gradient
  const grad = ctx.createLinearGradient(0, 0, W * 0.5, H);
  grad.addColorStop(0, c1);
  grad.addColorStop(1, c2);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // Radial glow
  const rGrad = ctx.createRadialGradient(W * 0.5, H * 0.4, 0, W * 0.5, H * 0.4, W * 0.7);
  rGrad.addColorStop(0, 'rgba(255,255,255,0.15)');
  rGrad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = rGrad;
  ctx.fillRect(0, 0, W, H);

  // Decorative circles
  ctx.globalAlpha = 0.1;
  const seed = index * 7.31;
  for (let i = 0; i < 7; i++) {
    const cx = W * (0.2 + 0.6 * Math.sin(seed + i * 1.9));
    const cy = H * (0.15 + 0.7 * Math.cos(seed + i * 2.3));
    const r = 80 + 120 * Math.abs(Math.sin(seed + i * 3.1));
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();
  }

  // Flowing lines
  ctx.globalAlpha = 0.07;
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 2;
  for (let i = 0; i < 12; i++) {
    ctx.beginPath();
    const y = H * (i / 12);
    ctx.moveTo(0, y + Math.sin(seed + i) * 50);
    ctx.bezierCurveTo(
      W * 0.25, y + Math.cos(seed + i * 2) * 60,
      W * 0.75, y - Math.sin(seed + i * 3) * 60,
      W, y + Math.cos(seed + i * 4) * 50
    );
    ctx.stroke();
  }

  // Large number watermark
  ctx.globalAlpha = 0.08;
  ctx.fillStyle = '#fff';
  ctx.font = `bold 280px Georgia, serif`;
  ctx.textAlign = 'center';
  ctx.fillText(String(index + 1).padStart(2, '0'), W / 2, H * 0.55);

  // Bottom dark overlay
  ctx.globalAlpha = 1;
  const bGrad = ctx.createLinearGradient(0, H * 0.6, 0, H);
  bGrad.addColorStop(0, 'rgba(0,0,0,0)');
  bGrad.addColorStop(1, 'rgba(0,0,0,0.6)');
  ctx.fillStyle = bGrad;
  ctx.fillRect(0, 0, W, H);

  // Top decorative frame
  ctx.globalAlpha = 0.2;
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 1;
  ctx.strokeRect(16, 16, W - 32, H - 32);

  return canvas.toDataURL('image/jpeg', 0.92);
}

/**
 * Full-size image modal overlay.
 */
export default function Modal({ cardIndex, onClose }) {
  const backdropRef = useRef(null);
  const contentRef = useRef(null);

  const title = TITLES[cardIndex % TITLES.length];
  const category = CATEGORIES[cardIndex % CATEGORIES.length];
  const desc = DESCRIPTIONS[cardIndex % DESCRIPTIONS.length];
  const fallbackUrl = useMemo(() => generateFallbackUrl(cardIndex), [cardIndex]);
  const [imgSrc, setImgSrc] = useState(() => getImageUrl(cardIndex));

  // If real image fails to load, use generated fallback
  const handleImgError = useCallback(() => {
    setImgSrc(fallbackUrl);
  }, [fallbackUrl]);

  useEffect(() => {
    gsap.fromTo(backdropRef.current, { opacity: 0 }, { opacity: 1, duration: 0.4 });
    gsap.fromTo(
      contentRef.current,
      { scale: 0.85, opacity: 0, y: 40 },
      { scale: 1, opacity: 1, y: 0, duration: 0.5, ease: 'back.out(1.4)' }
    );
  }, []);

  const handleClose = () => {
    gsap.to(contentRef.current, {
      scale: 0.85,
      opacity: 0,
      y: 40,
      duration: 0.35,
      ease: 'power2.in',
    });
    gsap.to(backdropRef.current, {
      opacity: 0,
      duration: 0.35,
      delay: 0.1,
      onComplete: onClose,
    });
  };

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-lg"
      onClick={handleClose}
    >
      <div
        ref={contentRef}
        className="relative max-w-lg w-[90%] bg-[#13101d] rounded-2xl overflow-hidden border border-white/10 shadow-2xl"
        style={{ boxShadow: '0 25px 60px rgba(255,107,157,0.12)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 flex items-center justify-center rounded-full bg-black/50 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-all duration-200"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M1 1L13 13M1 13L13 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>

        {/* Image */}
        <div className="aspect-[5/7] overflow-hidden">
          <img
            src={imgSrc}
            alt={title}
            onError={handleImgError}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Details */}
        <div className="p-6">
          <span className="inline-block px-3 py-1 text-[10px] font-mono tracking-[0.2em] uppercase rounded-full mb-3"
            style={{
              background: `linear-gradient(135deg, ${PALETTES[cardIndex % PALETTES.length][0]}22, ${PALETTES[cardIndex % PALETTES.length][1]}22)`,
              color: PALETTES[cardIndex % PALETTES.length][0],
            }}
          >
            {category}
          </span>
          <h2 className="font-display text-xl text-white mb-2">{title}</h2>
          <p className="text-sm text-white/50 leading-relaxed">{desc}</p>

          <div className="flex items-center gap-4 mt-5 pt-4 border-t border-white/5">
            <div className="flex items-center gap-2 text-white/30 text-xs">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
              <span>{124 + cardIndex * 7}</span>
            </div>
            <div className="flex items-center gap-2 text-white/30 text-xs">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
              </svg>
              <span>{8 + cardIndex % 12}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
