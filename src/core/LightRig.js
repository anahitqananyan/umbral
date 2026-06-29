import * as THREE from 'three';

// ---------------------------------------------------------------------------
// SINGLE SOURCE OF TRUTH for the puzzle light geometry.
// Both the *visible* shadow (DirectionalLight.shadow.camera) and the *matcher*
// (an OrthographicCamera that scores the silhouette) are derived from these
// constants, so they can never drift. If they drifted, the meter would say
// "matched" while the wall shadow looked wrong — which destroys player trust.
// ---------------------------------------------------------------------------

// The puzzle object floats here.
export const OBJECT_CENTER = new THREE.Vector3(0, 2.4, 0);

// Half-size of the orthographic frustum used for BOTH the shadow and the match.
// Sized to comfortably enclose the puzzle object's bounding volume.
export const FRUSTUM_HALF = 2.7;

// The light travels along -Z (straight at the wall). A pure axis keeps the cast
// shadow == the object's XY silhouette, which is exactly what the matcher scores
// and exactly the plane the objects are authored in.
export const LIGHT_DIR = new THREE.Vector3(0, 0, -1).normalize();

// Wall sits behind the object; shadow lands on it.
export const WALL_Z = -6;

// Distance the light source sits in front of the object (opposite the light dir).
const LIGHT_DISTANCE = 9;

// Build the key DirectionalLight + a soft fill. Returns { light, fill, group }.
export function createLightRig() {
  const group = new THREE.Group();

  const light = new THREE.DirectionalLight(0xfff2d8, 3.4);
  const lightPos = OBJECT_CENTER.clone().addScaledVector(LIGHT_DIR, -LIGHT_DISTANCE);
  light.position.copy(lightPos);
  light.target.position.copy(OBJECT_CENTER);

  light.castShadow = true;
  light.shadow.mapSize.set(2048, 2048);

  const cam = light.shadow.camera; // OrthographicCamera
  cam.left = -FRUSTUM_HALF;
  cam.right = FRUSTUM_HALF;
  cam.top = FRUSTUM_HALF;
  cam.bottom = -FRUSTUM_HALF;
  cam.near = 0.5;
  cam.far = LIGHT_DISTANCE + Math.abs(WALL_Z - OBJECT_CENTER.z) + 4;
  cam.updateProjectionMatrix();

  light.shadow.bias = -0.0005;
  light.shadow.normalBias = 0.02;
  light.shadow.radius = 3; // small PCF softness — keep silhouette edges readable

  group.add(light);
  group.add(light.target);

  // Cool rim/fill from the opposite side so the metal reads as a solid form,
  // not a flat cutout. It does NOT cast shadows (only the key light does).
  const fill = new THREE.DirectionalLight(0x6a86b8, 0.5);
  fill.position.set(-6, 5, 4);
  group.add(fill);

  // Gentle ambient so shadowed faces aren't pure black.
  const ambient = new THREE.AmbientLight(0x20242e, 0.6);
  group.add(ambient);

  return { light, fill, ambient, group };
}

// An OrthographicCamera positioned + oriented EXACTLY like the key light, used by
// the matcher to capture the silhouette the player sees on the wall.
export function createMatchCamera() {
  const cam = new THREE.OrthographicCamera(
    -FRUSTUM_HALF, FRUSTUM_HALF, FRUSTUM_HALF, -FRUSTUM_HALF,
    0.1, LIGHT_DISTANCE * 2 + 4
  );
  const pos = OBJECT_CENTER.clone().addScaledVector(LIGHT_DIR, -LIGHT_DISTANCE);
  cam.position.copy(pos);
  cam.lookAt(OBJECT_CENTER);
  cam.updateMatrixWorld();
  cam.updateProjectionMatrix();
  return cam;
}
