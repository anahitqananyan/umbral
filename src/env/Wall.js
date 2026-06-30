import * as THREE from 'three';
import { WALL_Z } from '../core/LightRig.js';

// The minimal dark room: a matte flat back wall that catches the puzzle object's
// shadow (kept flat so the silhouette reads cleanly), a dark floor, and a barely
// perceptible rug so the floor isn't empty without drawing the eye.
export function createWall() {
  const group = new THREE.Group();

  const wallGeo = new THREE.PlaneGeometry(22, 16);
  const wallMat = new THREE.MeshStandardMaterial({
    color: 0x6a6b72, // light enough that the cast shadow reads as a clear dark shape
    roughness: 0.98,
    metalness: 0.0,
  });
  const wall = new THREE.Mesh(wallGeo, wallMat);
  wall.position.set(0, 6.5, WALL_Z);
  wall.receiveShadow = true;
  group.add(wall);

  // Floor — also catches a soft shadow and grounds the scene.
  const floorGeo = new THREE.PlaneGeometry(60, 60);
  const floorMat = new THREE.MeshStandardMaterial({
    color: 0x121319, // dark neutral, matched to the room walls but still readable
    roughness: 0.97,
    metalness: 0.0,
  });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(0, 0, 0);
  floor.receiveShadow = true;
  group.add(floor);

  // Rug — a low, soft rectangle under the floating form. Its colour sits only a
  // hair above the floor and its slightly lower roughness lets it catch a touch
  // more of the cool fill light, so it's just barely there, never flashy.
  const rugGeo = new THREE.PlaneGeometry(6, 8);
  const rugMat = new THREE.MeshStandardMaterial({
    color: 0x1b1c25,
    roughness: 0.85,
    metalness: 0.0,
  });
  const rug = new THREE.Mesh(rugGeo, rugMat);
  rug.rotation.x = -Math.PI / 2;
  rug.position.set(0, 0.02, -0.5); // just above the floor to avoid z-fighting
  rug.receiveShadow = true;
  group.add(rug);

  // Baseboard / skirting where the wall meets the floor — a low band, a shade
  // darker than the wall, that gives the room a finished edge. Sits at the bottom,
  // clear of the shadow's main area, so it stays a quiet architectural detail.
  const baseGeo = new THREE.PlaneGeometry(22, 0.55);
  const baseMat = new THREE.MeshStandardMaterial({
    color: 0x53545c,
    roughness: 0.95,
    metalness: 0.0,
  });
  const baseboard = new THREE.Mesh(baseGeo, baseMat);
  baseboard.position.set(0, 0.27, WALL_Z + 0.03); // just in front of the wall
  baseboard.receiveShadow = true;
  group.add(baseboard);

  return group;
}
