import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import Particles from './Particles';
import Cards from './Cards';

export default function Scene({ scrollState, onCardDoubleClick }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 15], fov: 55, near: 0.1, far: 100 }}
      gl={{ antialias: true, alpha: false }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: '#0d0b14',
        zIndex: 0,
      }}
    >
      {/* Lighting — generous to make cards clearly visible */}
      <ambientLight intensity={0.6} color="#e0d0f0" />
      <directionalLight position={[5, 8, 10]} intensity={1.0} color="#ffd5e5" />
      <directionalLight position={[-5, -3, 5]} intensity={0.5} color="#6c5ce7" />
      <pointLight position={[0, 0, 8]} intensity={0.6} color="#ff6b9d" distance={30} />

      {/* Fog removed for max visibility */}
      {/* <fog attach="fog" args={['#0d0b14', 25, 60]} /> */}

      {/* Particles */}
      <Particles />

      {/* 3D Cards */}
      <Suspense fallback={null}>
        <Cards scrollState={scrollState} onCardDoubleClick={onCardDoubleClick} />
      </Suspense>

      {/* Camera controls */}
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        maxPolarAngle={Math.PI * 0.6}
        minPolarAngle={Math.PI * 0.4}
        maxAzimuthAngle={Math.PI * 0.2}
        minAzimuthAngle={-Math.PI * 0.2}
        rotateSpeed={0.3}
        dampingFactor={0.08}
        enableDamping
      />
    </Canvas>
  );
}
