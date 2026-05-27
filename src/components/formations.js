import * as THREE from 'three';

/**
 * Formation generators for the 3D card gallery.
 * Camera is at z=15. Cards should be between z=-5 and z=5 for good visibility.
 */

// State 1: Scattered desktop — spread out but still close
export function scattered(index, total) {
  const seed = index * 1.618;
  const x = ((Math.sin(seed * 2.3) + 1) / 2) * 16 - 8;
  const y = ((Math.cos(seed * 3.1) + 1) / 2) * 10 - 5;
  const z = ((Math.sin(seed * 1.7) + 1) / 2) * -8 - 1;
  const rx = (Math.sin(seed * 0.9) * Math.PI) / 14;
  const ry = (Math.cos(seed * 1.3) * Math.PI) / 12;
  const rz = Math.sin(seed * 0.7) * 0.12;
  return { pos: [x, y, z], rot: [rx, ry, rz] };
}

// State 2: Gathered sphere (Fibonacci sphere)
export function gathered(index, total) {
  const phi = Math.acos(1 - 2 * (index + 0.5) / total);
  const theta = Math.PI * (1 + Math.sqrt(5)) * (index + 0.5);
  const r = 3.0;
  const x = r * Math.sin(phi) * Math.cos(theta);
  const y = r * Math.cos(phi);
  const z = r * Math.sin(phi) * Math.sin(theta) + 2; // push toward camera
  const dir = new THREE.Vector3(x, y, z - 2).normalize();
  const quat = new THREE.Quaternion();
  quat.setFromUnitVectors(new THREE.Vector3(0, 0, 1), dir);
  const euler = new THREE.Euler().setFromQuaternion(quat);
  return { pos: [x, y, z], rot: [euler.x, euler.y, euler.z] };
}

// State 3: Sine-wave ribbon
export function waveRibbon(index, total) {
  const spread = 18;
  const t = total > 1 ? (index / (total - 1)) * 2 - 1 : 0;
  const x = t * spread;
  const y = Math.sin(t * Math.PI * 2.5) * 2.5;
  const z = Math.cos(t * Math.PI * 2.5) * 2.0;
  const rx = 0;
  const ry = -t * Math.PI * 0.25;
  const rz = Math.cos(t * Math.PI * 2.5) * 0.15;
  return { pos: [x, y, z], rot: [rx, ry, rz] };
}

// State 4: Vertical helix / spiral
export function spiral(index, total) {
  const angle = (index / total) * Math.PI * 6;
  const r = 3.0;
  const x = Math.cos(angle) * r;
  const y = ((index / total) * 2 - 1) * 9;
  const z = Math.sin(angle) * r + 2;
  const dir = new THREE.Vector3(Math.cos(angle), 0, Math.sin(angle)).normalize();
  const quat = new THREE.Quaternion();
  quat.setFromUnitVectors(new THREE.Vector3(0, 0, 1), dir);
  const euler = new THREE.Euler().setFromQuaternion(quat);
  return { pos: [x, y, z], rot: [euler.x, euler.y, euler.z] };
}

// Linear interpolation between two formations
export function lerpFormation(from, to, t) {
  return {
    pos: [
      from.pos[0] + (to.pos[0] - from.pos[0]) * t,
      from.pos[1] + (to.pos[1] - from.pos[1]) * t,
      from.pos[2] + (to.pos[2] - from.pos[2]) * t,
    ],
    rot: [
      from.rot[0] + (to.rot[0] - from.rot[0]) * t,
      from.rot[1] + (to.rot[1] - from.rot[1]) * t,
      from.rot[2] + (to.rot[2] - from.rot[2]) * t,
    ],
  };
}

export const STATE_NAMES = [
  'VALLEY: ARRIVAL',
  'VALLEY: GATHER',
  'VALLEY: WAVE',
  'VALLEY: SPIRAL',
];

export const FORMATIONS = [scattered, gathered, waveRibbon, spiral];
