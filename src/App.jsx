import React, { useState, useEffect, useRef, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Scene from './components/Scene';
import Overlay from './components/Overlay';
import Modal from './components/Modal';
import MusicPlayer from './components/MusicPlayer';
import { STATE_NAMES } from './components/formations';

gsap.registerPlugin(ScrollTrigger);

export default function App() {
  const [scrollState, setScrollState] = useState(0);
  const [stateName, setStateName] = useState(STATE_NAMES[0]);
  const [modalCard, setModalCard] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const trigger = ScrollTrigger.create({
      trigger: el,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.5,
      onUpdate: (self) => {
        const progress = self.progress;
        const state = progress * 3;
        setScrollState(state);
        const idx = Math.min(Math.floor(state), STATE_NAMES.length - 1);
        setStateName(STATE_NAMES[idx]);
      },
    });

    return () => trigger.kill();
  }, []);

  const handleCardDoubleClick = useCallback((index) => {
    setModalCard(index);
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalCard(null);
  }, []);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') setModalCard(null);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  return (
    <div style={{ background: '#0d0b14', minHeight: '100vh' }}>
      {/* Fixed 3D Canvas */}
      <Scene scrollState={scrollState} onCardDoubleClick={handleCardDoubleClick} />

      {/* UI Overlay */}
      <Overlay stateName={stateName} />

      {/* Music Player */}
      <MusicPlayer />

      {/* Scroll spacer */}
      <div
        ref={scrollRef}
        style={{
          height: '500vh',
          position: 'relative',
          zIndex: 0,
          pointerEvents: 'auto',
        }}
      />

      {/* Modal */}
      {modalCard !== null && (
        <Modal cardIndex={modalCard} onClose={handleCloseModal} />
      )}
    </div>
  );
}
