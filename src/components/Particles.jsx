import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const COUNT = 400;

export default function Particles() {
  const pointsRef = useRef();
  const timeRef = useRef(0);

  const { positions, velocities, colors } = useMemo(() => {
    const positions = new Float32Array(COUNT * 3);
    const velocities = new Float32Array(COUNT * 3);
    const colors = new Float32Array(COUNT * 3);

    for (let i = 0; i < COUNT; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 40;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 40;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 30;

      velocities[i * 3] = (Math.random() - 0.5) * 0.004;
      velocities[i * 3 + 1] = Math.random() * 0.006 + 0.003;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.003;

      const r = Math.random();
      if (r < 0.5) {
        // Pink
        colors[i * 3] = 1.0;
        colors[i * 3 + 1] = 0.4 + Math.random() * 0.2;
        colors[i * 3 + 2] = 0.6 + Math.random() * 0.2;
      } else if (r < 0.8) {
        // Rose
        colors[i * 3] = 0.9;
        colors[i * 3 + 1] = 0.5 + Math.random() * 0.2;
        colors[i * 3 + 2] = 0.5 + Math.random() * 0.2;
      } else {
        // Gold glimmer
        colors[i * 3] = 1.0;
        colors[i * 3 + 1] = 0.75 + Math.random() * 0.15;
        colors[i * 3 + 2] = 0.1;
      }
    }
    return { positions, velocities, colors };
  }, []);

  // Heart-shaped sprite texture
  const sprite = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = 64;
    c.height = 64;
    const x = c.getContext('2d');
    // Soft circle glow
    const g = x.createRadialGradient(32, 32, 0, 32, 32, 30);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(0.3, 'rgba(255,180,210,0.7)');
    g.addColorStop(1, 'rgba(255,100,157,0)');
    x.fillStyle = g;
    x.fillRect(0, 0, 64, 64);
    const t = new THREE.CanvasTexture(c);
    return t;
  }, []);

  useFrame((_, delta) => {
    if (!pointsRef.current) return;
    timeRef.current += delta;
    const attr = pointsRef.current.geometry.attributes.position;
    const arr = attr.array;

    for (let i = 0; i < COUNT; i++) {
      arr[i * 3] += velocities[i * 3] + Math.sin(timeRef.current * 0.5 + i) * 0.001;
      arr[i * 3 + 1] += velocities[i * 3 + 1];
      arr[i * 3 + 2] += velocities[i * 3 + 2];

      if (arr[i * 3 + 1] > 20) {
        arr[i * 3] = (Math.random() - 0.5) * 40;
        arr[i * 3 + 1] = -20;
        arr[i * 3 + 2] = (Math.random() - 0.5) * 30;
      }
    }
    attr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={COUNT} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-color" count={COUNT} array={colors} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        size={0.2}
        vertexColors
        transparent
        opacity={0.6}
        map={sprite}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
