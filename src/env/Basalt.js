import * as THREE from 'three';
import { fbm2D } from '../util/noise.js';
import { hash11, hash21 } from '../util/math.js';
import { WALL_Z } from '../core/LightRig.js';

// Procedural field of columnar basalt — hexagonal prisms of clustered, varied
// heights — rendered as a SINGLE InstancedMesh (one draw call). Frames the scene
// like a volcanic amphitheatre, receding into fog.
//
// Columns are kept out of a central "clear zone" so they never block the camera,
// the floating object, or the shadow-catching wall face.

const CELL = 1.15;            // hex cell spacing
const COL_RADIUS = 0.62;      // prism radius (baked into geometry)
const CLEAR_X = 6.5;          // keep |x| < CLEAR_X clear when in front of the wall
const CLEAR_Z = WALL_Z - 0.5; // ...and z > CLEAR_Z — clear all the way to (and just behind) the wall

export function createBasalt() {
  // 6-sided cylinder == hexagonal prism. Translate so the base sits at y=0,
  // then per-instance Y-scale grows the column upward from the ground.
  const geo = new THREE.CylinderGeometry(COL_RADIUS, COL_RADIUS, 1, 6, 1, false);
  geo.translate(0, 0.5, 0);

  const mat = new THREE.MeshStandardMaterial({
    color: 0xffffff,        // tinted per-instance via instanceColor
    roughness: 0.9,
    metalness: 0.08,
    flatShading: true,      // hard faceted volcanic-rock look
  });

  // Gather instance transforms across a wide region, skipping the clear zone.
  const matrices = [];
  const colors = [];
  const dummy = new THREE.Object3D();
  const baseColor = new THREE.Color(0x23242b);
  const warm = new THREE.Color(0x3a3026);

  const X_MIN = -26, X_MAX = 26;
  const Z_MIN = -26, Z_MAX = 9;

  let row = 0;
  for (let z = Z_MIN; z <= Z_MAX; z += CELL * 0.86, row++) {
    const offset = row % 2 === 0 ? 0 : CELL * 0.5; // hex offset every other row
    for (let x = X_MIN + offset; x <= X_MAX; x += CELL) {
      const jx = x + (hash21(x, z) - 0.5) * CELL * 0.45;
      const jz = z + (hash21(z, x) - 0.5) * CELL * 0.45;

      // Skip the play corridor: clear in front of / around the wall.
      const inFront = jz > CLEAR_Z;
      if (inFront && Math.abs(jx) < CLEAR_X) continue;

      // Height from layered noise -> organic clustering. Columns behind the wall
      // (far -z) are encouraged taller so they tower above the wall top.
      const n = fbm2D(jx * 0.12 + 7.3, jz * 0.12 - 2.1, 3);
      const behindBoost = jz < -6 ? (1 - (jz + 6) / (Z_MIN + 6)) * 6 : 0;
      const sideBoost = Math.abs(jx) > 10 ? (Math.abs(jx) - 10) * 0.18 : 0;
      let h = 1.6 + n * 11 + behindBoost + sideBoost;
      h = Math.max(0.8, h);

      const sx = 0.9 + hash11(jx * 3.1 + jz) * 0.25;
      const sz = 0.9 + hash11(jz * 2.7 - jx) * 0.25;

      dummy.position.set(jx, 0, jz);
      dummy.rotation.set(0, hash21(jx, jz) * Math.PI * 2, 0);
      dummy.scale.set(sx, h, sz);
      dummy.updateMatrix();
      matrices.push(dummy.matrix.clone());

      const tint = baseColor.clone().lerp(warm, hash11(jx + jz * 1.7) * 0.5);
      const shade = 0.75 + hash11(jx * 1.3 - jz) * 0.4;
      tint.multiplyScalar(shade);
      colors.push(tint.r, tint.g, tint.b);
    }
  }

  const count = matrices.length;
  const mesh = new THREE.InstancedMesh(geo, mat, count);
  mesh.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(colors), 3);

  for (let i = 0; i < count; i++) {
    mesh.setMatrixAt(i, matrices[i]);
  }
  mesh.instanceMatrix.needsUpdate = true;
  mesh.instanceColor.needsUpdate = true;

  // Static field: don't burn the puzzle shadow map on it, and don't let it
  // self-shadow. The tight key-light frustum excludes it anyway.
  mesh.castShadow = false;
  mesh.receiveShadow = false;
  mesh.frustumCulled = true;

  return mesh;
}
