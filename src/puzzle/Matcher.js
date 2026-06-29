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

  _renderMaskToBuffer() {
    const group = this._group;
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
    const mask = this.solutionMask;
    const buf = this.buffer;
    const n = SIZE * SIZE;
    let inter = 0;
    let uni = 0;
    for (let i = 0; i < n; i++) {
      const a = buf[i * 4] > 127 ? 1 : 0;
      const b = mask[i];
      inter += a & b;
      uni += a | b;
    }
    this.iou = uni === 0 ? 0 : inter / uni;
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

    // Schmitt-trigger win: must hold above threshold for holdMs; only resets
    // once it drops below the lower release threshold.
    if (this.iou >= this.threshold) {
      this.heldMs += elapsed * 1000;
    } else if (this.iou < this.release) {
      this.heldMs = 0;
    }

    if (this.heldMs >= this.holdMs) {
      this.solved = true;
      this._rawProx = 1;
    }
  }

  dispose() {
    this.rt.dispose();
    this.maskScene.overrideMaterial.dispose();
  }
}
