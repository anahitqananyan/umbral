import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

const BG_COLOR = 0x0a0c12;

// Builds the Scene, atmospheric fog, and an image-based-lighting environment map
// (generated from RoomEnvironment via PMREM — no external HDR file needed) so the
// metallic puzzle objects get believable soft reflections.
export function createScene(renderer) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(BG_COLOR);
  scene.fog = new THREE.FogExp2(BG_COLOR, 0.026);

  const pmrem = new THREE.PMREMGenerator(renderer);
  pmrem.compileEquirectangularShader();

  const roomScene = new RoomEnvironment();
  const envTexture = pmrem.fromScene(roomScene, 0.04).texture;
  scene.environment = envTexture;
  scene.environmentIntensity = 0.55;

  // Dispose the temporary generator scene; keep only the baked env texture.
  roomScene.dispose?.();
  pmrem.dispose();

  return scene;
}

export function createCamera() {
  const camera = new THREE.PerspectiveCamera(
    42,
    window.innerWidth / window.innerHeight,
    0.1,
    100
  );
  // Vantage from the left and above, looking across at the floating form
  // (the light + matcher are independent and fixed, so this is purely visual).
  camera.position.set(-6, 6.5, 5.5);
  camera.lookAt(0, 2.2, 0);
  return camera;
}
