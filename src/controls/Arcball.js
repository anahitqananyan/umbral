import * as THREE from 'three';

// Rotates the PUZZLE OBJECT (not the camera — moving the camera would move the
// shadow). Pointer drag tumbles the object in world space: horizontal drag spins
// about world-Y, vertical drag about world-X. Adds inertia after release, and
// reports `moving` so the matcher can idle-gate its sampling.
//
// (A virtual-trackball mapping is fancier, but this turntable+tumble scheme is
// rock-solid and feels great for inspecting a floating object.)

const IDENTITY = new THREE.Quaternion();
const AXIS_X = new THREE.Vector3(1, 0, 0);
const AXIS_Y = new THREE.Vector3(0, 1, 0);

export class Arcball {
  constructor(domElement) {
    this.dom = domElement;
    this.target = null;
    this.sensitivity = 0.0095; // radians per pixel
    this.dragging = false;
    this.lastX = 0;
    this.lastY = 0;
    this.movedThisFrame = false;
    this.spin = new THREE.Quaternion(); // last-frame delta, reused for inertia
    this.moving = false;
    this.onFirstInteraction = null;
    this._interacted = false;

    this._qy = new THREE.Quaternion();
    this._qx = new THREE.Quaternion();
    this._delta = new THREE.Quaternion();

    this._bindEvents();
  }

  setTarget(group) {
    this.target = group;
    this.spin.identity();
    this.moving = false;
  }

  setEnabled(enabled) {
    this.enabled = enabled;
    if (!enabled) {
      this.dragging = false;
      this.spin.identity();
    }
  }

  _bindEvents() {
    this.enabled = true;
    const dom = this.dom;

    const onDown = (e) => {
      if (!this.enabled || !this.target) return;
      this.dragging = true;
      const p = this._point(e);
      this.lastX = p.x;
      this.lastY = p.y;
      this.spin.identity();
      dom.setPointerCapture?.(e.pointerId);
      if (!this._interacted) {
        this._interacted = true;
        this.onFirstInteraction?.();
      }
    };

    const onMove = (e) => {
      if (!this.dragging || !this.target) return;
      const p = this._point(e);
      const dx = p.x - this.lastX;
      const dy = p.y - this.lastY;
      this.lastX = p.x;
      this.lastY = p.y;

      this._qy.setFromAxisAngle(AXIS_Y, dx * this.sensitivity);
      this._qx.setFromAxisAngle(AXIS_X, dy * this.sensitivity);
      this._delta.copy(this._qy).multiply(this._qx);

      // World-space rotation: premultiply.
      this.target.quaternion.premultiply(this._delta);
      this.spin.copy(this._delta);
      this.movedThisFrame = true;
    };

    const onUp = (e) => {
      this.dragging = false;
      dom.releasePointerCapture?.(e.pointerId);
    };

    dom.addEventListener('pointerdown', onDown);
    dom.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    dom.addEventListener('pointercancel', onUp);
  }

  _point(e) {
    return { x: e.clientX, y: e.clientY };
  }

  update(dt) {
    if (!this.target) {
      this.moving = false;
      return;
    }

    if (this.dragging) {
      this.moving = this.movedThisFrame;
      this.movedThisFrame = false;
      return;
    }

    // Inertia: keep applying the last spin, decaying toward identity.
    const decay = 1 - Math.pow(0.86, dt * 60);
    this.spin.slerp(IDENTITY, decay);
    this.target.quaternion.premultiply(this.spin);

    // Angle magnitude of the residual spin.
    const angle = 2 * Math.acos(Math.min(1, Math.abs(this.spin.w)));
    this.moving = angle > 0.0009;
  }
}
