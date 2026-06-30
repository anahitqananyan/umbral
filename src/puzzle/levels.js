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
      // Body — large, slightly tall ellipsoid. (Z depths are spread wide so the
      // shape only resolves head-on and scatters into noise from other angles.)
      { type: 'sphere', args: [0.95, 32, 24], pos: [0.25, 0.95, 1.6], scale: [1.0, 1.08, 1.0] },
      // Haunch / rear lump.
      { type: 'sphere', args: [0.62, 28, 20], pos: [0.95, 0.8, -1.5], scale: [1.0, 1.05, 1.0] },
      // Head, up front (rabbit faces left).
      { type: 'sphere', args: [0.55, 28, 20], pos: [-0.72, 1.62, 1.9] },
      // Snout.
      { type: 'sphere', args: [0.3, 20, 16], pos: [-1.15, 1.42, 2.4] },
      // Ears — two capsules of DIFFERENT length/angle (asymmetry defeats a flip).
      { type: 'capsule', args: [0.15, 1.05, 6, 16], pos: [-0.95, 2.55, -1.0], rot: [0, 0, 0.22] },
      { type: 'capsule', args: [0.14, 1.3, 6, 16], pos: [-0.6, 2.7, -1.0], rot: [0, 0, -0.08] },
      // Front leg / chest base.
      { type: 'box', args: [0.85, 0.45, 0.6], pos: [-0.5, 0.32, -2.0], rot: [0, 0, 0.05] },
      // Tail.
      { type: 'sphere', args: [0.3, 18, 14], pos: [1.5, 0.78, 1.4] },
    ],
  },
  {
    name: 'Key',
    hint: 'It opens what was closed.',
    solveThreshold: 0.9,
    startQuat: quat(0.6, 1.3, 1.9),
    pieces: [
      // Shaft — long cylinder laid along X. (Z depths spread wide so the key only
      // resolves head-on and scatters into noise from other angles.)
      { type: 'cylinder', args: [0.16, 0.16, 2.6, 20], pos: [0.25, 1.2, 1.5], rot: [0, 0, Math.PI / 2] },
      // Bow (the round grip) — a torus; its hole shows in silhouette (distinctive).
      { type: 'torus', args: [0.55, 0.18, 16, 40], pos: [-1.5, 1.2, -1.6] },
      // Collar where bow meets shaft.
      { type: 'cylinder', args: [0.24, 0.24, 0.3, 16], pos: [-0.82, 1.2, -1.0], rot: [0, 0, Math.PI / 2] },
      // Teeth / bit — asymmetric stack at the far end (defeats the 180° flip).
      { type: 'box', args: [0.2, 0.5, 0.32], pos: [0.95, 0.82, 1.8] },
      { type: 'box', args: [0.2, 0.72, 0.3], pos: [1.25, 0.72, -1.8] },
      { type: 'box', args: [0.2, 0.42, 0.34], pos: [1.5, 0.9, 2.0] },
    ],
  },
  {
    name: 'Cat',
    hint: 'Aloof and warm — and gone the moment you reach for it.',
    solveThreshold: 0.86,
    startQuat: quat(1.3, 2.0, 0.9),
    pieces: [
      // Sitting body — tall ellipsoid.
      { type: 'sphere', args: [1.15, 28, 20], pos: [0.0, -0.3, 0.6], scale: [0.95, 1.3, 0.95] },
      // Chest / front base.
      { type: 'sphere', args: [0.7, 24, 18], pos: [-0.1, -1.0, -1.4] },
      // Head.
      { type: 'sphere', args: [0.8, 28, 20], pos: [0.05, 1.35, 1.4] },
      // Ears — triangular cones of slightly different placement (breaks the flip).
      { type: 'cone', args: [0.4, 0.85], pos: [-0.55, 2.15, -1.3] },
      { type: 'cone', args: [0.4, 0.85], pos: [0.6, 2.2, 1.5] },
      // Curled tail off to one side.
      { type: 'capsule', args: [0.2, 1.8, 6, 16], pos: [1.6, 0.1, -1.1], rot: [0, 0, 0.4] },
    ],
  },
  {
    name: 'Sailboat',
    hint: 'It leans on the wind to wander.',
    solveThreshold: 0.85,
    startQuat: quat(0.8, 1.7, 1.2),
    pieces: [
      // Hull — a rounded capsule laid flat.
      { type: 'capsule', args: [0.5, 2.6, 6, 16], pos: [0.0, -1.5, 0.5], rot: [0, 0, Math.PI / 2] },
      // Mast.
      { type: 'cylinder', args: [0.1, 0.1, 3.8], pos: [0.0, 0.6, -1.3] },
      // Mainsail — large triangle.
      { type: 'cone', args: [1.2, 3.2], pos: [0.5, 0.6, 0.8] },
      // Jib — smaller sail on the other side (asymmetry defeats the flip).
      { type: 'cone', args: [0.6, 2.2], pos: [-0.9, 0.3, -1.5] },
    ],
  },
  {
    name: 'Wineglass',
    hint: 'Raise it — something is being celebrated.',
    solveThreshold: 0.88,
    startQuat: quat(1.1, 0.7, 1.6),
    pieces: [
      // Bowl — a cone flipped apex-down for the V of the cup.
      { type: 'cone', args: [1.1, 2.0], pos: [0.0, 1.4, 1.2], rot: [Math.PI, 0, 0] },
      // Stem.
      { type: 'cylinder', args: [0.1, 0.1, 1.4], pos: [0.0, -0.5, -1.4] },
      // Foot — a flat wide disk.
      { type: 'cylinder', args: [0.8, 0.8, 0.16], pos: [0.0, -1.25, 0.6] },
    ],
  },
];
