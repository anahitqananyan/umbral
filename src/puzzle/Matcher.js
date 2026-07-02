import * as THREE from 'three';
import { createMatchCamera } from '../core/LightRig.js';
import { smoothstep, clamp01, ema } from '../util/math.js';

// ---------------------------------------------------------------------------
// The shadow matcher. Renders ONLY the puzzle object from the light's viewpoint
// into a small offscreen target (flat white on black = a binary silhouette),
// reads it back, and scores Intersection-over-Union against the silhouette
// captured at the solution pose. Drives both the win trigger and the proximity
// meter.
//
// Key correctness rules (see plan):
//  - mask scene contains the puzzle object ONLY (no wall/basalt).
//  - mask material is toneMapped:false (else ACES darkens "white" below 0.5).
//  - the match camera is derived from the SAME LightRig as the visible shadow.
//  - readback is throttled (~10 Hz) and idle-gated — never every frame.
// ---------------------------------------------------------------------------

const SIZE = 128; // 128x128 is plenty to tell a rabbit from a bird; tiny readback.

export class Matcher {
  constructor(renderer) {
    this.renderer = renderer;
    this.camera = createMatchCamera();

    // Dedicated scene; the puzzle group is re-parented in here just for the
    // mask render, then returned to the main scene.
    this.maskScene = new THREE.Scene();
    this.maskScene.overrideMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      toneMapped: false,
      fog: false,
      side: THREE.DoubleSide,
    });

    this.rt = new THREE.WebGLRenderTarget(SIZE, SIZE, {
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
      depthBuffer: true,
      stencilBuffer: false,
      generateMipmaps: false,
      format: THREE.RGBAFormat,
      type: THREE.UnsignedByteType,
    });

    this.buffer = new Uint8Array(SIZE * SIZE * 4);
    this.solutionMask = null;
    this.solutionArea = 0;

    // tunables
    this.threshold = 0.9;
    this.release = 0.85;
    this.holdMs = 350;
    this.sampleInterval = 0.1; // seconds (~10 Hz)

    // The level passes once the recognition bar holds near-full, rather than
    // requiring a pixel-perfect (100%) match. `winProx`/`winRelease` are fractions
    // of the displayed bar (which is smoothstep(0.4, threshold, iou)).
    this.winProx = 0.95;
    this.winRelease = 0.85;

    this._reset();

    this._group = null;
    this._mainScene = null;
    this._tmpColor = new THREE.Color();
  }

  _reset() {
    this.iou = 0;
    this._rawProx = 0;
    this.proximity = 0;
    this.heldMs = 0;
    this.solved = false;
    this._acc = 0;
    this._settle = 0;
  }

  // Bind a puzzle group (already added to mainScene) and capture its solution mask.
  setTarget(group, mainScene, threshold = 0.9) {
    this._group = group;
    this._mainScene = mainScene;
    this.threshold = threshold;
    this.release = Math.max(0.5, threshold - 0.05);
    this._reset();
    this._captureSolution();
  }

  _renderMaskToBuffer(group = this._group) {
    const prevParent = group.parent;

    // Save clear state.
    const prevTarget = this.renderer.getRenderTarget();
    const prevClear = this.renderer.getClearColor(this._tmpColor).clone();
    const prevAlpha = this.renderer.getClearAlpha();

    this.maskScene.add(group); // detaches from prevParent; world transform preserved
    group.updateMatrixWorld(true);

    this.renderer.setRenderTarget(this.rt);
    this.renderer.setClearColor(0x000000, 1);
    this.renderer.clear(true, true, false);
    this.renderer.render(this.maskScene, this.camera);
    this.renderer.readRenderTargetPixels(this.rt, 0, 0, SIZE, SIZE, this.buffer);

    // Restore.
    this.renderer.setRenderTarget(prevTarget);
    this.renderer.setClearColor(prevClear, prevAlpha);
    if (prevParent) prevParent.add(group);
  }

  _captureSolution() {
    const q = this._group.quaternion.clone();
    this._group.quaternion.identity(); // solution pose, by construction
    this._renderMaskToBuffer();

    const n = SIZE * SIZE;
    this.solutionMask = new Uint8Array(n);
    let area = 0;
    for (let i = 0; i < n; i++) {
      const v = this.buffer[i * 4] > 127 ? 1 : 0;
      this.solutionMask[i] = v;
      area += v;
    }
    this.solutionArea = area;

    this._group.quaternion.copy(q); // restore scrambled start
    this._group.updateMatrixWorld(true);
  }

  _computeIoU() {
    this._renderMaskToBuffer();
    const sol = this.solutionMask;
    const buf = this.buffer;
    const n = SIZE * SIZE;

    // Extract the live silhouette as a binary mask.
    const live = this._live || (this._live = new Uint8Array(n));
    for (let i = 0; i < n; i++) live[i] = buf[i * 4] > 127 ? 1 : 0;

    // Rotation-invariant match: the shadow's shape only forms at the right 3D
    // orientation, but its in-plane *angle* should not matter — a correctly
    // assembled shape that is merely tilted still counts. So we score IoU against
    // the solution over a sweep of in-plane rotations (about the image center,
    // which is where the object's pivot projects) and keep the best.
    const ROT_STEPS = 36; // 10° resolution — within ~5° of any true angle
    const c = (SIZE - 1) / 2;
    let best = 0;
    for (let s = 0; s < ROT_STEPS; s++) {
      const theta = (s / ROT_STEPS) * Math.PI * 2;
      const cos = Math.cos(theta);
      const sin = Math.sin(theta);
      let inter = 0;
      let uni = 0;
      for (let y = 0; y < SIZE; y++) {
        const dy = y - c;
        for (let x = 0; x < SIZE; x++) {
          const dx = x - c;
          // Inverse-rotate to sample the live mask at this output pixel.
          const sx = (cos * dx + sin * dy + c) | 0;
          const sy = (-sin * dx + cos * dy + c) | 0;
          const a = sx >= 0 && sx < SIZE && sy >= 0 && sy < SIZE ? live[sy * SIZE + sx] : 0;
          const b = sol[y * SIZE + x];
          inter += a & b;
          uni += a | b;
        }
      }
      const iou = uni === 0 ? 0 : inter / uni;
      if (iou > best) best = iou;
    }
    this.iou = best;
  }

  // Called every frame. `isMoving` gates sampling (IoU can't change while idle).
  update(dt, isMoving) {
    // Smooth the displayed proximity every frame for a buttery meter, even
    // though the underlying IoU is sampled at only ~10 Hz.
    this.proximity = ema(this.proximity, this._rawProx, clamp01(dt * 9));

    if (this.solved || !this.solutionMask) return;

    if (isMoving) this._settle = 0.6; // keep sampling briefly after motion stops
    else this._settle -= dt;

    this._acc += dt;
    if (this._acc < this.sampleInterval) return;
    if (!isMoving && this._settle <= 0) {
      this._acc = 0;
      return; // idle: nothing to measure
    }
    const elapsed = this._acc;
    this._acc = 0;

    this._computeIoU();
    this._rawProx = smoothstep(0.4, this.threshold, this.iou);

    // Schmitt-trigger win on the recognition bar: must hold at/above ~95% for
    // holdMs; only resets once the bar drops below the lower release fraction.
    if (this._rawProx >= this.winProx) {
      this.heldMs += elapsed * 1000;
    } else if (this._rawProx < this.winRelease) {
      this.heldMs = 0;
    }

    if (this.heldMs >= this.holdMs) {
      this.solved = true;
      this._rawProx = 1;
    }
  }

  // Render `group` at its current (solution) pose and return a tightly-cropped
  // black silhouette as a PNG data URL — the exact shadow the puzzle resolves to.
  // Used to bake a recognizable figure onto each level-select block. Does not
  // disturb the active matcher target (only the shared readback buffer, which is
  // refreshed every sample).
  silhouetteDataURL(group) {
    this._renderMaskToBuffer(group);
    this.maskScene.remove(group); // it had no prior parent; don't leave it attached

    const buf = this.buffer;
    // Build a top-down binary mask (readback is bottom-up, so flip Y).
    const on = (x, y) => buf[((SIZE - 1 - y) * SIZE + x) * 4] > 127;

    // Bounding box of the shape so the figure fills the block.
    let minX = SIZE, minY = SIZE, maxX = -1, maxY = -1;
    for (let y = 0; y < SIZE; y++) {
      for (let x = 0; x < SIZE; x++) {
        if (!on(x, y)) continue;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
    if (maxX < 0) return null; // empty silhouette

    const pad = 3;
    minX = Math.max(0, minX - pad);
    minY = Math.max(0, minY - pad);
    maxX = Math.min(SIZE - 1, maxX + pad);
    maxY = Math.min(SIZE - 1, maxY + pad);
    const w = maxX - minX + 1;
    const h = maxY - minY + 1;

    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    const img = ctx.createImageData(w, h);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const di = (y * w + x) * 4;
        img.data[di] = 0;
        img.data[di + 1] = 0;
        img.data[di + 2] = 0;
        img.data[di + 3] = on(minX + x, minY + y) ? 255 : 0; // solid black shape
      }
    }
    ctx.putImageData(img, 0, 0);
    return canvas.toDataURL();
  }

  dispose() {
    this.rt.dispose();
    this.maskScene.overrideMaterial.dispose();
  }
}
