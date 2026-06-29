import * as THREE from 'three';

// ---------------------------------------------------------------------------
// Data-driven level table. Each object is authored in the XY plane (pieces tile
// into the recognizable silhouette when viewed down the light axis). Add a new
// entry here and it just works — no engine changes.
//
// `startQuat` is a FIXED scrambled orientation (deterministic, same for every
// player) applied at load so the puzzle begins as an unreadable cluster.
// ---------------------------------------------------------------------------

function quat(x, y, z) {
  return new THREE.Quaternion().setFromEuler(new THREE.Euler(x, y, z));
}

export const LEVELS = [
  {
    name: 'Rabbit',
    hint: 'Something small that sits very still, and listens.',
    solveThreshold: 0.86,
    startQuat: quat(1.05, 2.2, 0.7),
    pieces: [
      // Body — large, slightly tall ellipsoid.
      { type: 'sphere', args: [0.95, 32, 24], pos: [0.25, 0.95, 0.0], scale: [1.0, 1.08, 1.0] },
      // Haunch / rear lump.
      { type: 'sphere', args: [0.62, 28, 20], pos: [0.95, 0.8, 0.5], scale: [1.0, 1.05, 1.0] },
      // Head, up front (rabbit faces left).
      { type: 'sphere', args: [0.55, 28, 20], pos: [-0.72, 1.62, 0.35] },
      // Snout.
      { type: 'sphere', args: [0.3, 20, 16], pos: [-1.15, 1.42, 0.55] },
      // Ears — two capsules of DIFFERENT length/angle (asymmetry defeats a flip).
      { type: 'capsule', args: [0.15, 1.05, 6, 16], pos: [-0.95, 2.55, -0.4], rot: [0, 0, 0.22] },
      { type: 'capsule', args: [0.14, 1.3, 6, 16], pos: [-0.6, 2.7, -0.8], rot: [0, 0, -0.08] },
      // Front leg / chest base.
      { type: 'box', args: [0.85, 0.45, 0.6], pos: [-0.5, 0.32, 0.2], rot: [0, 0, 0.05] },
      // Tail.
      { type: 'sphere', args: [0.3, 18, 14], pos: [1.5, 0.78, 0.7] },
    ],
  },
  {
    name: 'Key',
    hint: 'It opens what was closed.',
    solveThreshold: 0.9,
    startQuat: quat(0.6, 1.3, 1.9),
    pieces: [
      // Shaft — long cylinder laid along X.
      { type: 'cylinder', args: [0.16, 0.16, 2.6, 20], pos: [0.25, 1.2, 0.0], rot: [0, 0, Math.PI / 2] },
      // Bow (the round grip) — a torus; its hole shows in silhouette (distinctive).
      { type: 'torus', args: [0.55, 0.18, 16, 40], pos: [-1.5, 1.2, 0.4] },
      // Collar where bow meets shaft.
      { type: 'cylinder', args: [0.24, 0.24, 0.3, 16], pos: [-0.82, 1.2, -0.3], rot: [0, 0, Math.PI / 2] },
      // Teeth / bit — asymmetric stack at the far end (defeats the 180° flip).
      { type: 'box', args: [0.2, 0.5, 0.32], pos: [0.95, 0.82, 0.5] },
      { type: 'box', args: [0.2, 0.72, 0.3], pos: [1.25, 0.72, -0.4] },
      { type: 'box', args: [0.2, 0.42, 0.34], pos: [1.5, 0.9, 0.25] },
    ],
  },
];
