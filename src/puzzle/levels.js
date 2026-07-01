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
      // Body — a tall, rounded disc (higher segment counts = smooth silhouette).
      // (Z depths spread wide so it only resolves head-on and scatters otherwise.)
      { type: 'sphere', args: [0.92, 44, 32], pos: [0.0, 0.0, 1.5], scale: [1.0, 1.38, 1.0] },
      // Snout — a broad cone whose wide base sinks into the body for a smooth
      // blend, tapering to the left (the fish faces left).
      { type: 'cone', args: [0.62, 1.1, 40], pos: [-1.18, -0.06, -1.4], rot: [0, 0, Math.PI / 2] },
      // Dorsal fin — a tall triangle sweeping up and back.
      { type: 'cone', args: [0.68, 2.0, 40], pos: [0.44, 1.36, 1.1], rot: [0, 0, -0.6] },
      // Anal fin — a large triangle sweeping down and back (mirror of the dorsal).
      { type: 'cone', args: [0.72, 1.92, 40], pos: [0.48, -1.36, -1.2], rot: [0, 0, Math.PI + 0.6] },
      // Tail — a forked fan at the rear, apex pushed INTO the body so it connects.
      { type: 'cone', args: [0.44, 1.5, 40], pos: [1.25, 0.36, 0.9], rot: [0, 0, Math.PI / 2 + 0.3] },
      { type: 'cone', args: [0.44, 1.5, 40], pos: [1.25, -0.36, -0.9], rot: [0, 0, Math.PI / 2 - 0.3] },
    ],
  },
  {
    name: 'High Kick',
    hint: 'Stillness balanced on one foot — a strike frozen at its peak.',
    solveThreshold: 0.85,
    startQuat: quat(1.1, 1.9, 0.8),
    pieces: [
      // Raised leg — the tall vertical limb shooting straight up (the signature
      // line). (Z depths spread wide so it only resolves head-on and scatters.)
      { type: 'capsule', args: [0.18, 2.4, 8, 18], pos: [0.04, 1.36, -1.5], rot: [0, 0, -0.05] },
      // Raised foot — a pointed toe at the very top.
      { type: 'cone', args: [0.18, 0.56, 24], pos: [-0.04, 2.8, 1.2], rot: [0, 0, 0.15] },
      // Standing leg — vertical, bearing the weight.
      { type: 'capsule', args: [0.2, 2.08, 8, 18], pos: [-0.28, -1.16, 1.5], rot: [0, 0, 0.03] },
      // Standing foot — flat on the ground, toe to the left.
      { type: 'box', args: [0.76, 0.24, 0.5], pos: [-0.56, -2.36, -1.3] },
      // Pelvis / hips — the block both legs spring from.
      { type: 'sphere', args: [0.38, 24, 18], pos: [-0.08, -0.04, 1.2], scale: [1.2, 0.95, 1.0] },
      // Torso — leaning up and to the right toward the shoulders.
      { type: 'capsule', args: [0.27, 1.04, 8, 16], pos: [0.4, 0.6, 1.6], rot: [0, 0, -0.7] },
      // Head — up and to the right.
      { type: 'sphere', args: [0.39, 26, 20], pos: [1.08, 1.44, -1.3] },
      // Lead arm — anchored at the shoulder (~0.74, 1.0), extending forward and
      // down toward the raised leg (guard position).
      { type: 'capsule', args: [0.13, 1.15, 8, 14], pos: [0.25, 0.71, -1.0], rot: [0, 0, -1.03] },
      // Trailing forearm / fist — also from the shoulder, dropping toward the waist.
      { type: 'capsule', args: [0.12, 0.85, 8, 14], pos: [0.55, 0.62, 1.3], rot: [0, 0, -0.46] },
      // Second forearm — the other hand, reaching forward at shoulder height.
      { type: 'capsule', args: [0.12, 0.7, 8, 14], pos: [0.45, 1.05, -1.3], rot: [0, 0, 1.4] },
    ],
  },
  {
    name: 'Cupid',
    hint: 'It aims where reason cannot argue.',
    solveThreshold: 0.83,
    startQuat: quat(0.9, 1.7, 1.1),
    pieces: [
      // Head — upper-left (Cupid faces left). (Z depths spread wide so it only
      // resolves head-on and scatters into noise from other angles.)
      { type: 'sphere', args: [0.58, 40, 30], pos: [-0.24, 1.18, 1.4] },
      // Hair curls — two small bumps on top of the head.
      { type: 'sphere', args: [0.3, 28, 20], pos: [-0.55, 1.55, -1.5] },
      { type: 'sphere', args: [0.26, 28, 20], pos: [-0.05, 1.72, 1.6] },
      // Torso — an elongated (not round) cherub chest tapering to the waist.
      { type: 'sphere', args: [0.55, 40, 30], pos: [0.1, 0.4, 1.5], scale: [0.92, 1.22, 1.0] },
      // Hip / lower body — a flatter mass flowing into the legs.
      { type: 'sphere', args: [0.55, 40, 30], pos: [0.6, -0.5, -1.4], scale: [1.12, 0.92, 1.0] },
      // Wing — a fan of layered feathers radiating from the shoulder, each a
      // long flattened ellipsoid at a slightly different angle. Overlapping tips
      // give a curved leading edge and a scalloped trailing edge (not a triangle).
      { type: 'sphere', args: [0.5, 36, 26], pos: [0.5, 1.0, 1.6], scale: [0.55, 1.6, 1.0], rot: [0, 0, -0.069] },
      { type: 'sphere', args: [0.5, 36, 26], pos: [0.65, 1.28, -1.5], scale: [0.5, 2.1, 1.0], rot: [0, 0, -0.215] },
      { type: 'sphere', args: [0.5, 36, 26], pos: [0.8, 1.6, 1.4], scale: [0.52, 2.6, 1.0], rot: [0, 0, -0.27] },
      { type: 'sphere', args: [0.5, 36, 26], pos: [1.05, 1.67, -1.7], scale: [0.5, 2.9, 1.0], rot: [0, 0, -0.425] },
      // Wing tip — the pointed primary feather at the top.
      { type: 'cone', args: [0.26, 0.9, 32], pos: [1.55, 2.85, 1.3], rot: [0, 0, -0.425] },
      // Second (small) wing — a shorter feather fan peeking out below the main one.
      { type: 'sphere', args: [0.4, 32, 22], pos: [1.0, 0.55, 1.5], scale: [0.5, 1.5, 1.0], rot: [0, 0, -0.7] },
      { type: 'sphere', args: [0.4, 32, 22], pos: [1.2, 0.45, -1.6], scale: [0.5, 1.2, 1.0], rot: [0, 0, -0.95] },
      { type: 'cone', args: [0.16, 0.5, 24], pos: [1.45, 0.8, 1.2], rot: [0, 0, -0.7] },
      // Front thigh — trailing down and to the right.
      { type: 'capsule', args: [0.24, 0.59, 12, 24], pos: [0.825, -1.09, 1.4], rot: [0, 0, 0.29] },
      // Front calf / pointed toe.
      { type: 'capsule', args: [0.2, 0.72, 12, 24], pos: [1.145, -1.88, -1.3], rot: [0, 0, 0.46] },
      // Back leg — kicked out behind, more horizontal.
      { type: 'capsule', args: [0.22, 0.84, 12, 24], pos: [1.21, -0.855, -1.6], rot: [0, 0, 1.29] },
      // Arm — reaching left to grip the bow.
      { type: 'capsule', args: [0.18, 0.66, 12, 24], pos: [-0.33, 0.375, 1.5], rot: [0, 0, -1.51] },
      // Bow — three arc segments bulging left (a smooth recurve curve).
      { type: 'capsule', args: [0.11, 0.78, 12, 24], pos: [-1.45, 0.975, -1.5], rot: [0, 0, -0.29] },
      { type: 'capsule', args: [0.11, 0.68, 12, 24], pos: [-1.625, 0.05, 1.6], rot: [0, 0, -0.055] },
      { type: 'capsule', args: [0.11, 1.23, 12, 24], pos: [-1.175, -0.95, -1.4], rot: [0, 0, 0.71] },
      // Bow tips — the little decorative spiral curls at each end.
      { type: 'torus', args: [0.16, 0.055, 16, 32], pos: [-1.3, 1.5, 1.3] },
      { type: 'torus', args: [0.16, 0.055, 16, 32], pos: [-0.6, -1.6, -1.3] },
      // Bowstring — a thin taut line between the two tips.
      { type: 'cylinder', args: [0.03, 0.03, 3.0, 12], pos: [-0.975, -0.025, 1.6], rot: [0, 0, 0.217] },
      // Arrow — two aligned segments (left of the bow to the heart tip, and
      // right of the bow to the nock) so the shaft reads as passing through it.
      { type: 'cylinder', args: [0.05, 0.05, 1.17, 16], pos: [-1.925, -0.26, 1.5], rot: [0, 0, -1.36] },
      { type: 'cylinder', args: [0.05, 0.05, 1.02, 16], pos: [-0.5, 0.046, -1.4], rot: [0, 0, -1.36] },
      // Heart tip — a sideways heart at the far-left end (point left, lobes right).
      { type: 'cone', args: [0.22, 0.5, 24], pos: [-2.7, -0.38, -1.5], rot: [0, 0, Math.PI / 2] },
      { type: 'sphere', args: [0.17, 24, 18], pos: [-2.45, -0.2, 1.3] },
      { type: 'sphere', args: [0.17, 24, 18], pos: [-2.45, -0.55, -1.3] },
    ],
  },
  {
    name: 'Pawn',
    hint: 'It marches only forward, dreaming of the far rank.',
    solveThreshold: 0.9,
    startQuat: quat(1.0, 1.4, 0.8),
    pieces: [
      // A turned, symmetric chess pawn: a stack of coaxial discs and frustums,
      // each set at a different Z depth so it only lines up head-on and scatters
      // into a ring of debris from every other angle.
      // Ball — the round head on top.
      { type: 'sphere', args: [0.78, 64, 48], pos: [0.0, 1.48, 1.5] },
      // Collar — a wide, flat saucer just below the ball.
      { type: 'sphere', args: [0.47, 56, 40], pos: [0.0, 0.78, -1.4], scale: [2.0, 0.5, 1.6] },
      // Neck — the thin waist.
      { type: 'cylinder', args: [0.33, 0.33, 0.74, 64], pos: [0.0, 0.27, 1.4] },
      // Body — the trumpet flare widening toward the base (top radius matched to
      // the neck so the join is seamless).
      { type: 'cylinder', args: [0.33, 0.74, 1.48, 64], pos: [0.0, -0.66, -1.6] },
      // Base — upper flare.
      { type: 'cylinder', args: [0.74, 1.05, 0.27, 64], pos: [0.0, -1.52, 1.5] },
      // Base — mid ring.
      { type: 'cylinder', args: [1.05, 1.17, 0.27, 64], pos: [0.0, -1.79, -1.3] },
      // Base — wide flat foot.
      { type: 'cylinder', args: [1.17, 1.21, 0.33, 64], pos: [0.0, -2.11, 1.3] },
    ],
  },
  {
    name: 'Wrench',
    hint: 'It turns what stubborn fingers cannot.',
    solveThreshold: 0.88,
    startQuat: quat(0.7, 1.6, 1.2),
    pieces: [
      // A combination wrench stood upright: open-end fork on top, long handle,
      // ring (box-end) at the bottom. (Z depths spread wide so it only resolves
      // head-on and scatters into noise from other angles.)
      // Handle — the long straight bar.
      { type: 'box', args: [0.44, 3.36, 0.5], pos: [0.0, -0.24, 1.5] },
      // Box-end neck — a short flare that widens the handle into the round ring
      // head, so the circle sits inside a proper head instead of floating on the
      // bar. Kept above the hole so it never intrudes on the opening.
      { type: 'box', args: [0.82, 0.55, 0.5], pos: [0.0, -1.72, 1.3] },
      // Box-end ring — the closed-end circle (a ring with a hole). Enlarged to
      // balance the open head and given far more segments so it reads as a
      // smooth, solid ring rather than a coarse loop.
      { type: 'torus', args: [0.5, 0.16, 32, 72], pos: [0.0, -2.45, -1.4] },
      // Open head — the rounded body where the head meets the handle. A full
      // disc facing the viewer gives the beefy, rounded outline of a real
      // open-end head (noticeably wider than the handle), kept low so it never
      // pokes up into the mouth.
      { type: 'cylinder', args: [0.86, 0.86, 0.5, 72], pos: [0.12, 1.22, -1.6], rot: [Math.PI / 2, 0, 0] },
      // Open head — the throat: the FLAT back wall of the U-shaped mouth,
      // bridging the two jaws. Canted to the ~15° a real open-end wrench uses
      // (a flat throat, not a rounded valley, stops it reading as a smiling face).
      { type: 'box', args: [1.4, 0.55, 0.5], pos: [0.02, 1.95, 1.3], rot: [0, 0, 0.26] },
      // Open head — left jaw: a slender prong whose inner face is PARALLEL to
      // the right jaw, so the gap between them is a clean, straight-walled slot.
      { type: 'box', args: [0.42, 1.0, 0.5], pos: [-0.54, 2.35, 1.4], rot: [0, 0, 0.26] },
      // Open head — right jaw: the matching prong, run slightly longer to give
      // the offset, angled mouth of a genuine open-end wrench.
      { type: 'box', args: [0.42, 1.2, 0.5], pos: [0.43, 2.6, -1.3], rot: [0, 0, 0.26] },
    ],
  },
  {
    name: 'Rubber Duck',
    hint: 'It bobs in the bath and squeaks when you squeeze.',
    solveThreshold: 0.86,
    startQuat: quat(0.9, 1.8, 1.1),
    pieces: [
      // Authored facing left. Rather than stacking many spheres (which reads as
      // separate lumps), this uses a few heavily-overlapping solids whose shared
      // edges merge into one smooth, continuous outline. (Z depths spread wide so
      // it only resolves head-on and scatters into noise from every other angle.)
      // Body — one big egg-shaped ellipsoid: the whole smooth belly in a single
      // piece (no seams along the underside).
      { type: 'sphere', args: [1.5, 48, 36], pos: [0.45, -0.5, -1.4], scale: [1.38, 1.1, 1.0] },
      // Head — an ellipsoid sunk deep into the body so the join reads as a neck,
      // not two balls touching.
      { type: 'sphere', args: [1.05, 44, 32], pos: [-0.55, 1.75, 1.5], scale: [1.05, 1.0, 1.0] },
      // Neck / chest — a capsule bridging head to body up the front. Its straight
      // sides give the smooth, near-vertical breast line and erase the pinch that
      // otherwise forms between the two ellipsoids. Longer now, to carry the
      // raised head.
      { type: 'capsule', args: [0.6, 1.3, 12, 24], pos: [-0.9, 0.75, 1.2], rot: [0, 0, 0.15] },
      // Bill — a flat, wide paddle jutting left from the lower head, tip dipped.
      { type: 'sphere', args: [0.4, 36, 26], pos: [-2.0, 1.38, 1.7], scale: [1.95, 0.6, 1.0], rot: [0, 0, -0.12] },
      // Tail — a smooth, rounded fin sweeping UP and to the right off the back
      // (a capsule, so the tip is a soft round curve rather than a sharp point).
      { type: 'capsule', args: [0.5, 1.15, 12, 24], pos: [1.85, 0.4, -1.3], rot: [0, 0, -0.95] },
    ],
  },
  {
    name: 'Horse',
    hint: 'Four strong legs, a flowing tail — it carries you at a gallop.',
    solveThreshold: 0.83,
    startQuat: quat(0.8, 1.7, 1.0),
    pieces: [
      // Authored facing left, built almost entirely from capsules/boxes/cylinders
      // (no spheres) so the outline stays clean and horse-like rather than lumpy.
      // (Z depths spread wide so it only resolves head-on and scatters otherwise.)
      // Barrel — one long horizontal capsule: the whole torso, with the rounded
      // caps giving the chest (front) and the rounded rump (rear) in one piece.
      { type: 'capsule', args: [0.63, 1.56, 12, 24], pos: [0.34, 0.34, -0.88], rot: [0, 0, Math.PI / 2] },
      // Neck — a thick block rising up and to the LEFT from the withers.
      { type: 'box', args: [0.65, 1.29, 0.61], pos: [-1.33, 1.22, 1.02], rot: [0, 0, 0.75] },
      // Head — an elongated block, muzzle tipped down toward the far left.
      { type: 'box', args: [1.02, 0.46, 0.41], pos: [-2.11, 1.46, -0.95], rot: [0, 0, 0.5] },
      // Ears — two small pricked cones at the poll.
      { type: 'cone', args: [0.094, 0.34, 16], pos: [-1.87, 1.87, 0.95], rot: [0, 0, 0.35] },
      { type: 'cone', args: [0.094, 0.34, 16], pos: [-1.7, 1.84, -0.82], rot: [0, 0, 0.15] },
      // Front legs — a near/far pair of tapered columns dropping from the chest.
      { type: 'cylinder', args: [0.18, 0.14, 1.77, 20], pos: [-0.37, -0.82, 1.09] },
      { type: 'cylinder', args: [0.18, 0.14, 1.77, 20], pos: [-0.14, -0.82, -1.09] },
      // Hind legs — each a thick thigh (capsule) tapering into a thin cannon.
      { type: 'capsule', args: [0.29, 0.61, 12, 20], pos: [1.16, -0.31, 1.02] },
      { type: 'cylinder', args: [0.15, 0.12, 1.02, 20], pos: [1.16, -1.22, 1.02] },
      { type: 'capsule', args: [0.29, 0.61, 12, 20], pos: [1.38, -0.31, -1.02] },
      { type: 'cylinder', args: [0.15, 0.12, 1.02, 20], pos: [1.38, -1.22, -1.02] },
      // Tail — a cone hanging off the rump, thick at the dock and tapering down.
      { type: 'cone', args: [0.29, 1.22, 20], pos: [1.79, -0.24, 0.88], rot: [0, 0, Math.PI + 0.12] },
    ],
  },
  {
    name: 'Stroller',
    hint: 'It rolls the littlest passenger off to sleep.',
    solveThreshold: 0.85,
    startQuat: quat(0.9, 1.5, 1.1),
    pieces: [
      // Authored facing left (hood on the left, push-handle on the right). Built
      // from a frustum / box / tori so the outline stays crisp. (Z depths spread
      // wide so it only resolves head-on and scatters into noise otherwise.)
      // Basket — a cone frustum (wider at the top): its side view is the classic
      // tapered pram bucket.
      { type: 'cylinder', args: [1.2, 0.68, 1.12, 40], pos: [0.08, -0.28, -1.1] },
      // Rim — the thick horizontal bar capping the basket, running back to the handle.
      { type: 'box', args: [2.56, 0.34, 0.5], pos: [0.08, 0.4, 1.2] },
      // Hood — a dome over the left end (its flat underside hidden behind the rim).
      { type: 'sphere', args: [0.76, 40, 30], pos: [-0.76, 0.62, -1.0] },
      // Handle — a riser sweeping up off the back, then a hook curling to the right.
      { type: 'capsule', args: [0.14, 0.6, 8, 16], pos: [1.28, 0.8, 1.2], rot: [0, 0, -0.45] },
      { type: 'capsule', args: [0.14, 0.4, 8, 16], pos: [1.64, 1.12, -1.1], rot: [0, 0, -1.25] },
      // Struts — a slanted leg to the front wheel, a straight leg to the rear wheel.
      { type: 'capsule', args: [0.13, 0.64, 8, 16], pos: [-0.72, -1.12, 1.0], rot: [0, 0, -0.7] },
      { type: 'capsule', args: [0.13, 0.56, 8, 16], pos: [0.36, -1.12, -1.0] },
      // Wheels — two rings (circles with open hubs) at the bottom.
      { type: 'torus', args: [0.4, 0.16, 16, 40], pos: [-1.0, -1.48, 1.1] },
      { type: 'torus', args: [0.38, 0.16, 16, 40], pos: [0.36, -1.48, -1.1] },
    ],
  },
  {
    name: 'Elephant',
    hint: 'The largest to walk the land — and it never forgets.',
    solveThreshold: 0.82,
    startQuat: quat(0.8, 1.7, 1.1),
    pieces: [
      // Authored facing left, built from capsules / cylinders / cones (only the
      // domed head is a sphere) so the big outline stays smooth, not lumpy.
      // (Z depths spread wide so it only resolves head-on and scatters otherwise.)
      // Barrel — one big horizontal capsule: the whole body, its rounded caps
      // giving the shoulder (front) and the rounded rump (rear).
      { type: 'capsule', args: [0.96, 1.36, 12, 24], pos: [0.4, 0.52, -0.96], rot: [0, 0, Math.PI / 2] },
      // Head — the high domed skull/face at the front (slightly taller than round).
      { type: 'sphere', args: [0.84, 44, 32], pos: [-1.2, 0.64, 1.04], scale: [1.0, 1.15, 1.0] },
      // Trunk — a smoothly tapering chain of capsules following one continuous
      // curve: the thick root is buried deep in the head so it joins the body
      // seamlessly, then it sweeps down and hooks the slender tip up and forward.
      { type: 'capsule', args: [0.32, 0.62, 12, 20], pos: [-1.775, 0.325, 1.1], rot: [0, 0, -0.321] },
      { type: 'capsule', args: [0.27, 0.5, 12, 20], pos: [-1.95, -0.35, -1.0], rot: [0, 0, -0.165] },
      { type: 'capsule', args: [0.24, 0.42, 12, 20], pos: [-2.025, -0.925, 1.1], rot: [0, 0, -0.091] },
      { type: 'capsule', args: [0.2, 0.32, 12, 20], pos: [-2.1, -1.4, -1.0], rot: [0, 0, -0.245] },
      { type: 'capsule', args: [0.16, 0.28, 12, 20], pos: [-2.275, -1.45, 1.1], rot: [0, 0, 0.694] },
      // Tusks — two thin tapered spears curving forward and down off the lower face.
      { type: 'capsule', args: [0.055, 0.7, 8, 12], pos: [-2.25, -0.2, 1.4], rot: [0, 0, 2.0] },
      { type: 'capsule', args: [0.055, 0.62, 8, 12], pos: [-2.2, -0.38, 1.35], rot: [0, 0, 2.05] },
      // Legs — four thick pillars, slightly splayed wider at the foot.
      { type: 'cylinder', args: [0.3, 0.35, 1.92, 20], pos: [-0.92, -0.92, 1.2] },
      { type: 'cylinder', args: [0.3, 0.35, 1.92, 20], pos: [-0.58, -0.92, -1.2] },
      { type: 'cylinder', args: [0.32, 0.37, 1.92, 20], pos: [1.16, -0.92, 1.2] },
      { type: 'cylinder', args: [0.32, 0.37, 1.92, 20], pos: [1.48, -0.92, -1.2] },
      // Tail — a thin hanging cord off the rump, ending in a little tuft.
      { type: 'capsule', args: [0.072, 0.88, 8, 14], pos: [2.0, -0.05, -1.04], rot: [0, 0, 0.15] },
      { type: 'cone', args: [0.1, 0.3, 12], pos: [2.12, -0.8, -1.04], rot: [0, 0, Math.PI] },
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
