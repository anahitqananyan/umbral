import * as THREE from 'three';
import { createRenderer } from './core/Renderer.js';
import { createScene, createCamera } from './core/SceneSetup.js';
import { createLightRig } from './core/LightRig.js';
import { createWall } from './env/Wall.js';
import { LEVELS } from './puzzle/levels.js';
import { buildObject } from './puzzle/ObjectBuilder.js';
import { Matcher } from './puzzle/Matcher.js';
import { Arcball } from './controls/Arcball.js';
import { HUD } from './ui/HUD.js';
import { createDebug } from './util/debug.js';

export class Game {
  constructor(container) {
    this.renderer = createRenderer(container);
    this.scene = createScene(this.renderer);
    this.camera = createCamera();

    const rig = createLightRig();
    this.scene.add(rig.group);

    this.scene.add(createWall());

    this.matcher = new Matcher(this.renderer);
    this.arcball = new Arcball(this.renderer.domElement);
    this.hud = new HUD();

    this.clock = new THREE.Clock();
    this.levelIndex = 0;
    this.puzzle = null;
    this.won = false;

    // Snap-to-solution: once the bar holds at ~95%, glide the object the last
    // few degrees to its exact solution pose (identity) so the shadow resolves
    // to 100% of the shape before the win card appears.
    this.snapping = false;
    this.snapT = 0;
    this.snapDur = 0.6; // seconds
    this.snapFrom = new THREE.Quaternion();
    this.snapTo = new THREE.Quaternion(); // identity = solution pose

    // Subtle camera sway for life — does NOT affect the shadow or matcher
    // (the light and the match camera are fixed and independent).
    this.camBase = this.camera.position.clone();
    this.swayT = 0;

    this.debug = createDebug(this.matcher);

    this.arcball.onFirstInteraction = () => this.hud.hideDragHint();

    window.addEventListener('resize', () => this._onResize());

    // Level-select wiring + progression. A level unlocks only once the previous
    // one has been cleared; progress persists across reloads via localStorage.
    this.selecting = false;
    this.completed = this._loadProgress();
    this.hud.onOpenLevelSelect = () => this.openLevelSelect();
    this.hud.onOpenSettings = () => {
      this.hud.setSettingsProgress(this._progressText());
      this.hud.showSettings();
    };
    this.hud.onResetProgress = () => this.resetProgress();
    this.hud.onPlay = () => {
      this.hud.hideMainMenu();
      this.openLevelSelect();
    };

    // Load a level as a backdrop, then present the main menu first.
    this._loadLevel(0);
    this.hud.hideLoading();
    this.openMainMenu();
  }

  openMainMenu() {
    this.selecting = true;
    this.won = false;
    this.arcball.setEnabled(false);
    this.hud.hideDragHint();
    this.hud.hideWin();
    this.hud.hideLevelSelect();
    this.hud.showMainMenu();
  }

  _isUnlocked(index) {
    return index === 0 || this.completed.has(index - 1);
  }

  _loadProgress() {
    try {
      const raw = localStorage.getItem('umbral.completed');
      return new Set(raw ? JSON.parse(raw) : []);
    } catch {
      return new Set();
    }
  }

  _saveProgress() {
    try {
      localStorage.setItem('umbral.completed', JSON.stringify([...this.completed]));
    } catch {
      /* storage unavailable — progress just won't persist */
    }
  }

  selectLevel(index) {
    if (!this._isUnlocked(index)) return; // locked: ignore (cards are disabled too)
    this.selecting = false;
    this.hud.hideLevelSelect();
    this._loadLevel(index);
    setTimeout(() => {
      if (!this.won && !this.selecting) this.hud.showDragHint();
    }, 1200);
  }

  openLevelSelect() {
    this.selecting = true;
    this.won = false;
    this.arcball.setEnabled(false);
    this.hud.hideDragHint();
    this.hud.hideWin();
    this._refreshLevelSelect();
    this.hud.showLevelSelect();
  }

  // Bake a black silhouette figure for every level once — each is that puzzle's
  // own solved shadow, so it looks exactly like the shape you're rotating toward.
  _ensureLevelIcons() {
    if (this._levelIcons) return this._levelIcons;
    this._levelIcons = LEVELS.map((level) => {
      const obj = buildObject(level); // built at identity = the solution pose
      const url = this.matcher.silhouetteDataURL(obj);
      const mats = new Set();
      obj.traverse((o) => {
        if (o.geometry) o.geometry.dispose();
        if (o.material) mats.add(o.material);
      });
      mats.forEach((m) => m.dispose());
      return url;
    });
    return this._levelIcons;
  }

  _refreshLevelSelect() {
    const icons = this._ensureLevelIcons();
    const items = LEVELS.map((level, i) => ({
      locked: !this._isUnlocked(i),
      completed: this.completed.has(i),
      icon: icons[i],
      name: level.name,
    }));
    this.hud.renderLevelSelect(items, (i) => this.selectLevel(i));
  }

  _progressText() {
    const n = this.completed.size;
    const total = LEVELS.length;
    return n === 0 ? 'No shadows cleared yet.' : `${n} of ${total} shadows cleared.`;
  }

  resetProgress() {
    this.completed = new Set();
    this._saveProgress();
    this._refreshLevelSelect(); // relock the grid behind the settings panel
    this.hud.setSettingsProgress(this._progressText());
    this.hud.hideSettings();
  }

  _loadLevel(index) {
    if (this.puzzle) {
      this.scene.remove(this.puzzle);
      this.puzzle.traverse((o) => {
        if (o.geometry) o.geometry.dispose();
      });
    }

    const level = LEVELS[index];
    this.levelIndex = index;
    this.won = false;
    this.snapping = false;
    this.snapT = 0;

    this.puzzle = buildObject(level);
    this.puzzle.quaternion.copy(level.startQuat); // scrambled start
    this.scene.add(this.puzzle);
    this.puzzle.updateMatrixWorld(true);

    this.matcher.setTarget(this.puzzle, this.scene, level.solveThreshold);
    this.arcball.setTarget(this.puzzle);
    this.arcball.setEnabled(true);

    this.hud.setLevel(index, level.name, level.hint);
    this.hud.setProximity(0);
  }

  _nextLevel() {
    const next = (this.levelIndex + 1) % LEVELS.length;
    // The just-cleared level unlocks the next, so this is always allowed.
    this.selectLevel(next);
  }

  _onResize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }

  _beginSnap() {
    this.snapping = true;
    this.snapT = 0;
    this.arcball.setEnabled(false); // no more dragging while it settles
    this.hud.hideDragHint();
    this.snapFrom.copy(this.puzzle.quaternion);
    // snapTo stays identity (the solution pose the matcher captured against).
  }

  _updateSnap(dt) {
    this.snapT = Math.min(1, this.snapT + dt / this.snapDur);
    // easeInOutCubic for a settled, deliberate finish.
    const t = this.snapT;
    const e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    this.puzzle.quaternion.slerpQuaternions(this.snapFrom, this.snapTo, e);
    this.puzzle.updateMatrixWorld(true);
    this.hud.setProximity(1); // bar reads full as it locks in

    if (this.snapT >= 1) {
      this.snapping = false;
      this.puzzle.quaternion.copy(this.snapTo); // exact solution pose
      this._handleWin();
    }
  }

  _handleWin() {
    this.won = true;
    this.arcball.setEnabled(false);
    this.completed.add(this.levelIndex); // unlocks the next level
    this._saveProgress();
    const name = LEVELS[this.levelIndex].name;
    this.hud.hideDragHint();
    this.hud.showWin(name, () => this._nextLevel(), () => this.openLevelSelect());
  }

  start() {
    const loop = () => {
      requestAnimationFrame(loop);
      const dt = Math.min(this.clock.getDelta(), 0.05);

      this.arcball.update(dt);
      this.matcher.update(dt, this.arcball.moving);
      this.hud.setProximity(this.matcher.proximity);

      // Solve detected → glide to the exact solution pose, then show the win.
      if (this.matcher.solved && !this.won && !this.snapping) this._beginSnap();
      if (this.snapping) this._updateSnap(dt);

      // gentle camera sway
      this.swayT += dt;
      this.camera.position.x = this.camBase.x + Math.sin(this.swayT * 0.25) * 0.18;
      this.camera.position.y = this.camBase.y + Math.sin(this.swayT * 0.19) * 0.1;
      this.camera.lookAt(0, 2.2, 0);

      this.debug?.update();
      this.renderer.render(this.scene, this.camera);
    };
    loop();
  }
}
