import * as THREE from 'three';
import { WALL_Z } from '../core/LightRig.js';

// The matte, flat surface that catches the puzzle object's shadow. Kept flat
// (not the irregular basalt) so the silhouette reads cleanly — broken column
// faces would fragment the shadow and hurt readability.
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
    color: 0x141519,
    roughness: 0.95,
    metalness: 0.0,
  });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(0, 0, 0);
  floor.receiveShadow = true;
  group.add(floor);

  return group;
}
