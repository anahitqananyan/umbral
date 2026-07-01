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
    solveThreshold: 0.82,
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
    name: 'Teapot',
    hint: 'It waits by the kettle to pour warmth into your cup.',
    solveThreshold: 0.88,
    startQuat: quat(1.0, 1.6, 1.1),
    pieces: [
      // Body — a wide, slightly squat ellipsoid: the round belly of the pot.
      // (Z depths spread wide so it only resolves head-on and scatters otherwise.)
      { type: 'sphere', args: [1.15, 30, 22], pos: [0.05, -0.1, 1.5], scale: [1.28, 1.0, 1.0] },
      // Spout — a cone sweeping out and UP to the left: the unmistakable pour.
      { type: 'cone', args: [0.34, 1.6], pos: [-1.5, 0.4, -1.5], rot: [0, 0, 0.95] },
      // Handle — a ring on the RIGHT side (asymmetry with the spout defeats a flip).
      { type: 'torus', args: [0.58, 0.13, 16, 36], pos: [1.4, 0.05, -1.7] },
      // Lid — a low dome capping the body.
      { type: 'sphere', args: [0.78, 26, 16], pos: [0.0, 1.05, 1.1], scale: [1.15, 0.5, 1.0] },
      // Knob — the little handle on top of the lid.
      { type: 'sphere', args: [0.22, 18, 14], pos: [0.0, 1.55, -1.3] },
    ],
  },
  {
    name: 'Angelfish',
    hint: 'It hangs in the water like a paper kite — all fins and patience.',
    solveThreshold: 0.88,
    startQuat: quat(0.9, 1.7, 1.0),
    pieces: [
      // Body — a tall, laterally-flattened diamond: the angelfish's signature disc.
      // (Z depths spread wide so it only resolves head-on and scatters otherwise.)
      { type: 'sphere', args: [1.0, 30, 22], pos: [0.0, 0.0, 1.5], scale: [0.9, 1.5, 1.0] },
      // Snout — a short cone tapering to the left (the fish faces left).
      { type: 'cone', args: [0.55, 0.9], pos: [-1.15, -0.15, -1.4], rot: [0, 0, Math.PI / 2] },
      // Dorsal fin — a tall triangle sweeping up and back.
      { type: 'cone', args: [0.8, 2.6], pos: [0.5, 1.75, 1.1], rot: [0, 0, -0.55] },
      // Anal fin — a large triangle sweeping down and back (mirror of the dorsal).
      { type: 'cone', args: [0.85, 2.5], pos: [0.55, -1.75, -1.2], rot: [0, 0, Math.PI + 0.55] },
      // Tail — a forked fan at the rear (two lobes, apex toward the body).
      { type: 'cone', args: [0.5, 1.3], pos: [1.85, 0.45, 0.9], rot: [0, 0, Math.PI / 2 + 0.25] },
      { type: 'cone', args: [0.5, 1.3], pos: [1.85, -0.45, -0.9], rot: [0, 0, Math.PI / 2 - 0.25] },
      // Ventral filaments — the long thin fins trailing down from the belly.
      { type: 'cylinder', args: [0.05, 0.05, 2.4], pos: [-0.45, -1.9, 0.7], rot: [0, 0, 0.12] },
      { type: 'cylinder', args: [0.05, 0.05, 2.0], pos: [-0.2, -1.75, -0.9], rot: [0, 0, -0.05] },
    ],
  },
  {
    name: 'Key',
    hint: 'It opens what was closed.',
    solveThreshold: 0.85,
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
    solveThreshold: 0.88,
    startQuat: quat(1.3, 2.0, 0.9),
    pieces: [
      // Haunches — the wide base the cat sits on.
      { type: 'sphere', args: [1.1, 28, 20], pos: [0.0, -1.25, 0.7], scale: [1.2, 0.9, 1.0] },
      // Chest / torso — taller than wide, rising to the neck.
      { type: 'sphere', args: [0.9, 28, 20], pos: [0.0, 0.1, -1.3], scale: [0.85, 1.3, 1.0] },
      // Head.
      { type: 'sphere', args: [0.82, 28, 20], pos: [0.0, 1.55, 1.2] },
      // Ears — tall triangular cones, the unmistakable cat cue.
      { type: 'cone', args: [0.42, 1.0], pos: [-0.52, 2.25, -1.0], rot: [0, 0, 0.16] },
      { type: 'cone', args: [0.42, 1.0], pos: [0.52, 2.3, 1.3], rot: [0, 0, -0.16] },
      // Tail — sweeps UP the right side and curls, not out at the bottom.
      { type: 'capsule', args: [0.2, 1.5, 6, 16], pos: [1.05, -0.55, -1.2], rot: [0, 0, -0.45] },
      { type: 'capsule', args: [0.2, 1.0, 6, 16], pos: [1.5, 0.5, -1.2], rot: [0, 0, 0.05] },
    ],
  },
  {
    name: 'Sailboat',
    hint: 'It leans on the wind to wander.',
    solveThreshold: 0.91,
    startQuat: quat(0.8, 1.7, 1.2),
    pieces: [
      // Hull — a wide flat lens (pointed bow & stern): the classic boat profile.
      { type: 'sphere', args: [1.0, 32, 16], pos: [0.0, -1.55, 0.9], scale: [1.85, 0.5, 1.0] },
      // Mast — tall and thin, rising from the hull.
      { type: 'cylinder', args: [0.09, 0.09, 3.6], pos: [0.0, 0.45, -1.6] },
      // Mainsail — large triangle to one side of the mast.
      { type: 'cone', args: [1.3, 2.8], pos: [0.6, 0.5, 1.2] },
      // Jib — smaller triangle on the other side (asymmetry, reads as a boat).
      { type: 'cone', args: [0.7, 2.0], pos: [-0.9, 0.2, -1.8] },
    ],
  },
  {
    name: 'Wineglass',
    hint: 'Raise it — something is being celebrated.',
    solveThreshold: 0.93,
    startQuat: quat(1.1, 0.7, 1.6),
    pieces: [
      // Bowl — a wide, shallow cone flipped apex-down: the open V of the cup.
      { type: 'cone', args: [1.3, 1.5], pos: [0.0, 1.2, 2.0], rot: [Math.PI, 0, 0] },
      // Stem — long and thin.
      { type: 'cylinder', args: [0.09, 0.09, 1.4], pos: [0.0, -0.2, -2.0] },
      // Foot — a wide flat base.
      { type: 'cylinder', args: [0.85, 0.85, 0.14], pos: [0.0, -0.95, 1.2] },
    ],
  },
  {
    name: 'Fish',
    hint: 'It breathes the water it swims in.',
    solveThreshold: 0.86,
    startQuat: quat(0.9, 1.6, 0.8),
    pieces: [
      // Body — a wide ellipsoid.
      { type: 'sphere', args: [1.1, 28, 20], pos: [-0.2, 0.0, 1.5], scale: [1.5, 1.0, 1.0] },
      // Tail fin — a triangle fanning out behind (apex toward the body).
      { type: 'cone', args: [0.9, 1.4], pos: [1.9, 0.0, -1.0], rot: [0, 0, Math.PI / 2] },
      // Dorsal fin.
      { type: 'cone', args: [0.4, 0.7], pos: [-0.3, 1.0, 0.8] },
    ],
  },
  {
    name: 'Mushroom',
    hint: 'It rises overnight after the rain.',
    solveThreshold: 0.86,
    startQuat: quat(1.2, 0.9, 1.7),
    pieces: [
      // Cap — a wide, low dome.
      { type: 'sphere', args: [1.5, 28, 18], pos: [0.0, 0.5, 1.4], scale: [1.3, 0.62, 1.0] },
      // Stem — stout cylinder.
      { type: 'cylinder', args: [0.5, 0.5, 1.8], pos: [0.0, -0.9, -1.5] },
    ],
  },
  {
    name: 'Pine Tree',
    hint: 'It stays green while the rest let go.',
    solveThreshold: 0.88,
    startQuat: quat(0.7, 2.1, 1.1),
    pieces: [
      // Lower tier of foliage.
      { type: 'cone', args: [1.5, 1.8], pos: [0.0, -0.2, 1.2] },
      // Upper tier.
      { type: 'cone', args: [1.1, 1.6], pos: [0.0, 1.0, -1.4] },
      // Trunk.
      { type: 'cylinder', args: [0.35, 0.35, 1.2], pos: [0.0, -1.6, 0.6] },
    ],
  },
  {
    name: 'House',
    hint: 'Four walls that mean you are home.',
    solveThreshold: 0.88,
    startQuat: quat(1.4, 1.2, 0.6),
    pieces: [
      // Walls — a square box.
      { type: 'box', args: [2.4, 2.0, 1.2], pos: [0.0, -0.6, 0.6] },
      // Roof — a triangle.
      { type: 'cone', args: [1.6, 1.3], pos: [0.0, 1.05, -1.3] },
      // Chimney.
      { type: 'box', args: [0.35, 0.7, 0.35], pos: [0.7, 1.4, 0.8] },
    ],
  },
  {
    name: 'Heart',
    hint: 'It beats louder when you are near.',
    solveThreshold: 0.89,
    startQuat: quat(0.6, 1.9, 1.4),
    pieces: [
      // Two top lobes.
      { type: 'sphere', args: [0.85, 24, 18], pos: [-0.7, 0.7, 1.3] },
      { type: 'sphere', args: [0.85, 24, 18], pos: [0.7, 0.7, -1.3] },
      // The point below — a downward triangle.
      { type: 'cone', args: [1.7, 1.8], pos: [0.0, -0.4, 1.0], rot: [Math.PI, 0, 0] },
    ],
  },
  {
    name: 'Umbrella',
    hint: 'It blooms only when the sky weeps.',
    solveThreshold: 0.9,
    startQuat: quat(1.0, 0.6, 2.0),
    pieces: [
      // Canopy — a wide, peaked dome with a flat lower edge.
      { type: 'cone', args: [2.0, 1.2], pos: [0.0, 0.25, 1.2] },
      // Finial — the little spike on top.
      { type: 'cylinder', args: [0.06, 0.06, 0.5], pos: [0.0, 1.05, 1.2] },
      // Scalloped hem — rib tips hanging from the canopy edge (the umbrella cue).
      { type: 'cone', args: [0.5, 0.6], pos: [-1.4, -0.4, -1.0], rot: [Math.PI, 0, 0] },
      { type: 'cone', args: [0.5, 0.6], pos: [-0.47, -0.4, 0.8], rot: [Math.PI, 0, 0] },
      { type: 'cone', args: [0.5, 0.6], pos: [0.47, -0.4, -0.8], rot: [Math.PI, 0, 0] },
      { type: 'cone', args: [0.5, 0.6], pos: [1.4, -0.4, 1.0], rot: [Math.PI, 0, 0] },
      // Pole — runs up into the canopy.
      { type: 'cylinder', args: [0.07, 0.07, 2.2], pos: [0.0, -0.6, -1.5] },
      // Hooked handle — a J at the foot of the pole.
      { type: 'capsule', args: [0.12, 0.5, 6, 12], pos: [-0.28, -1.7, 0.6], rot: [0, 0, Math.PI / 2] },
      { type: 'capsule', args: [0.12, 0.45, 6, 12], pos: [-0.62, -1.42, 0.6] },
    ],
  },
  {
    name: 'Snowman',
    hint: 'Three rounds of winter, stacked and smiling.',
    solveThreshold: 0.9,
    startQuat: quat(1.5, 1.4, 0.7),
    pieces: [
      // Base.
      { type: 'sphere', args: [1.3, 28, 20], pos: [0.0, -1.4, 0.8] },
      // Middle.
      { type: 'sphere', args: [1.0, 26, 18], pos: [0.0, 0.3, -1.2] },
      // Head.
      { type: 'sphere', args: [0.75, 24, 18], pos: [0.0, 1.55, 1.0] },
      // Hat brim.
      { type: 'box', args: [1.4, 0.2, 1.0], pos: [0.0, 2.2, 0.4] },
      // Hat top.
      { type: 'box', args: [0.85, 0.75, 0.85], pos: [0.0, 2.65, -0.5] },
    ],
  },
  {
    name: 'Cactus',
    hint: 'It hoards the desert and dares you to hold it.',
    solveThreshold: 0.91,
    startQuat: quat(0.8, 2.0, 1.2),
    pieces: [
      // Central column.
      { type: 'capsule', args: [0.55, 2.6, 6, 16], pos: [0.0, -0.2, 1.0] },
      // Left arm — out, then up.
      { type: 'capsule', args: [0.3, 0.7, 6, 12], pos: [-0.85, 0.0, -1.3], rot: [0, 0, Math.PI / 2] },
      { type: 'capsule', args: [0.3, 0.9, 6, 12], pos: [-1.25, 0.6, -1.3] },
      // Right arm (higher — asymmetry).
      { type: 'capsule', args: [0.3, 0.6, 6, 12], pos: [0.8, 0.5, 1.4], rot: [0, 0, Math.PI / 2] },
      { type: 'capsule', args: [0.3, 0.7, 6, 12], pos: [1.15, 1.05, 1.4] },
    ],
  },
  {
    name: 'Mug',
    hint: 'It holds the reason you wake up.',
    solveThreshold: 0.91,
    startQuat: quat(1.1, 1.5, 0.9),
    pieces: [
      // Cup body.
      { type: 'cylinder', args: [0.95, 0.95, 2.0], pos: [-0.2, 0.0, 1.3] },
      // Handle — a ring on the side.
      { type: 'torus', args: [0.55, 0.16], pos: [1.0, 0.0, -1.5] },
    ],
  },
  {
    name: 'Airplane',
    hint: 'It trades the ground for a thin line of cloud.',
    solveThreshold: 0.92,
    startQuat: quat(0.9, 1.8, 1.3),
    pieces: [
      // Fuselage — laid along X with a rounded nose.
      { type: 'capsule', args: [0.45, 2.8, 6, 16], pos: [0.0, 0.0, 1.4], rot: [0, 0, Math.PI / 2] },
      // Wings — a span across the body.
      { type: 'box', args: [0.9, 2.6, 0.3], pos: [0.1, 0.0, -1.6] },
      // Tailplane — smaller span at the rear.
      { type: 'box', args: [0.6, 1.4, 0.3], pos: [-1.5, 0.0, 0.7] },
    ],
  },
  {
    name: 'Flower',
    hint: 'It turns its face to follow the sun.',
    solveThreshold: 0.9,
    startQuat: quat(1.2, 1.7, 0.5),
    pieces: [
      // Center.
      { type: 'sphere', args: [0.55, 24, 18], pos: [0.0, 0.85, 1.0] },
      // Five petals around the center (bottom left open for the stem).
      { type: 'sphere', args: [0.5, 20, 16], pos: [0.0, 1.8, -1.0] },
      { type: 'sphere', args: [0.5, 20, 16], pos: [0.82, 1.28, 1.2] },
      { type: 'sphere', args: [0.5, 20, 16], pos: [0.82, 0.42, -1.2] },
      { type: 'sphere', args: [0.5, 20, 16], pos: [-0.82, 1.28, 1.2] },
      { type: 'sphere', args: [0.5, 20, 16], pos: [-0.82, 0.42, -1.2] },
      // Stem.
      { type: 'cylinder', args: [0.08, 0.08, 2.2], pos: [0.0, -0.9, 0.6] },
      // Leaf.
      { type: 'sphere', args: [0.4, 18, 14], pos: [0.55, -0.9, -0.8], scale: [1.7, 0.7, 1.0], rot: [0, 0, -0.5] },
    ],
  },
  {
    name: 'Anchor',
    hint: 'It holds you steady when the tide pulls.',
    solveThreshold: 0.91,
    startQuat: quat(0.7, 1.4, 1.8),
    pieces: [
      // Ring at the top.
      { type: 'torus', args: [0.42, 0.13], pos: [0.0, 1.65, 1.0] },
      // Shaft.
      { type: 'cylinder', args: [0.15, 0.15, 2.9], pos: [0.0, 0.05, -1.3] },
      // Stock (the crossbar near the top).
      { type: 'capsule', args: [0.12, 1.5, 6, 12], pos: [0.0, 0.85, 1.2], rot: [0, 0, Math.PI / 2] },
      // Flukes — two arms sweeping out at the bottom.
      { type: 'capsule', args: [0.14, 1.0, 6, 12], pos: [-0.55, -1.0, -1.0], rot: [0, 0, 0.8] },
      { type: 'capsule', args: [0.14, 1.0, 6, 12], pos: [0.55, -1.0, 1.0], rot: [0, 0, -0.8] },
    ],
  },
  {
    name: 'Ice Cream',
    hint: 'Sweet, and racing the warmth to melt.',
    solveThreshold: 0.91,
    startQuat: quat(1.0, 2.0, 0.9),
    pieces: [
      // Waffle cone — apex down.
      { type: 'cone', args: [0.75, 2.0], pos: [0.0, -0.3, 1.0], rot: [Math.PI, 0, 0] },
      // Scoops.
      { type: 'sphere', args: [0.78, 24, 18], pos: [0.0, 0.85, -1.2] },
      { type: 'sphere', args: [0.62, 22, 16], pos: [-0.3, 1.65, 1.1] },
    ],
  },
  {
    name: 'Hourglass',
    hint: 'It says the same thing, upside down or not: time runs.',
    solveThreshold: 0.92,
    startQuat: quat(0.6, 1.1, 1.5),
    pieces: [
      // Upper bulb — a downward cone.
      { type: 'cone', args: [1.0, 1.5], pos: [0.0, 0.75, 1.2], rot: [Math.PI, 0, 0] },
      // Lower bulb — an upward cone meeting it at the pinch.
      { type: 'cone', args: [1.0, 1.5], pos: [0.0, -0.75, -1.2] },
      // Top and bottom caps.
      { type: 'box', args: [2.3, 0.28, 1.0], pos: [0.0, 1.6, 0.8] },
      { type: 'box', args: [2.3, 0.28, 1.0], pos: [0.0, -1.6, -0.8] },
    ],
  },
  {
    name: 'Bird',
    hint: 'It owns the morning before anyone wakes.',
    solveThreshold: 0.93,
    startQuat: quat(1.3, 0.8, 1.1),
    pieces: [
      // Body.
      { type: 'sphere', args: [0.9, 26, 18], pos: [-0.1, 0.0, 1.0], scale: [1.3, 1.0, 1.0] },
      // Head.
      { type: 'sphere', args: [0.55, 22, 16], pos: [1.0, 0.75, -1.1] },
      // Beak — a small cone pointing forward.
      { type: 'cone', args: [0.22, 0.65], pos: [1.7, 0.7, -1.1], rot: [0, 0, -Math.PI / 2] },
      // Tail — a fan sweeping back.
      { type: 'cone', args: [0.5, 1.1], pos: [-1.0, 0.05, 1.2], rot: [0, 0, -Math.PI / 2] },
      // Legs.
      { type: 'capsule', args: [0.07, 0.55, 6, 10], pos: [0.1, -1.05, 0.8] },
      { type: 'capsule', args: [0.07, 0.55, 6, 10], pos: [0.5, -1.05, 0.8] },
    ],
  },
];
