import * as THREE from 'three';
import { OBJECT_CENTER } from '../core/LightRig.js';

// Maps a level's declarative "piece" entries to Three.js geometries. Pieces are
// authored in the XY plane (the shadow plane) at varied Z depths: looking down
// the light axis they tile into one clean silhouette (the recognizable shape),
// but from any other angle the depth spread reads as a chaotic metal cluster.
//
// Because pieces are authored at the solve pose, the SOLUTION ORIENTATION is the
// identity rotation — no offline search needed.

function makeGeometry(type, args) {
  switch (type) {
    case 'box':
      return new THREE.BoxGeometry(...args);
    case 'sphere':
      return new THREE.SphereGeometry(args[0], args[1] ?? 32, args[2] ?? 24);
    case 'capsule':
      return new THREE.CapsuleGeometry(args[0], args[1], args[2] ?? 6, args[3] ?? 16);
    case 'cylinder':
      return new THREE.CylinderGeometry(args[0], args[1], args[2], args[3] ?? 24);
    case 'cone':
      return new THREE.ConeGeometry(args[0], args[1], args[2] ?? 24);
    case 'torus':
      return new THREE.TorusGeometry(args[0], args[1], args[2] ?? 16, args[3] ?? 40);
    default:
      console.warn('Unknown piece type:', type);
      return new THREE.BoxGeometry(0.5, 0.5, 0.5);
  }
}

// Polished metal — relies on the scene environment map for reflections.
function makeMaterial() {
  return new THREE.MeshStandardMaterial({
    color: 0xb9b2a6,
    metalness: 0.92,
    roughness: 0.26,
    envMapIntensity: 1.1,
  });
}

// Builds a THREE.Group from a level definition. The group is placed at
// OBJECT_CENTER with identity rotation (= the solution pose).
export function buildObject(level) {
  const group = new THREE.Group();
  const material = makeMaterial();

  for (const piece of level.pieces) {
    const geo = makeGeometry(piece.type, piece.args);
    const mesh = new THREE.Mesh(geo, material);

    if (piece.pos) mesh.position.set(...piece.pos);
    if (piece.rot) mesh.rotation.set(...piece.rot);
    if (piece.scale) {
      if (Array.isArray(piece.scale)) mesh.scale.set(...piece.scale);
      else mesh.scale.setScalar(piece.scale);
    }

    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);
  }

  group.position.copy(OBJECT_CENTER);
  group.quaternion.identity();
  // Optional uniform scale for the whole object (positions + sizes). Rotation is
  // driven separately by the arcball, and the matcher captures at identity
  // rotation, so a persistent group scale is safe and shrinks the shadow too.
  if (level.scale) group.scale.setScalar(level.scale);
  return group;
}
