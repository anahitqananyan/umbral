import * as THREE from 'three';
import { createRenderer } from './core/Renderer.js';
import { createScene, createCamera } from './core/SceneSetup.js';
import { createLightRig } from './core/LightRig.js';
import { createWall } from './env/Wall.js';
import { createBasalt } from './env/Basalt.js';
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
    this.scene.add(createBasalt());

    this.matcher = new Matcher(this.renderer);
    this.arcball = new Arcball(this.renderer.domElement);
    this.hud = new HUD();

    this.clock = new THREE.Clock();
    this.levelIndex = 0;
    this.puzzle = null;
    this.won = false;

    // Subtle camera sway for life — does NOT affect the shadow or matcher
    // (the light and the match camera are fixed and independent).
    this.camBase = this.camera.position.clone();
    this.swayT = 0;

    this.debug = createDebug(this.matcher);

    this.arcball.onFirstInteraction = () => this.hud.hideDragHint();

    window.addEventListener('resize', () => this._onResize());

    this._loadLevel(0);
    this.hud.hideLoading();
    setTimeout(() => {
      if (!this.won) this.hud.showDragHint();
    }, 1400);
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
    this._loadLevel(next);
  }

  _onResize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }

  _handleWin() {
    this.won = true;
    this.arcball.setEnabled(false);
    const name = LEVELS[this.levelIndex].name;
    this.hud.hideDragHint();
    this.hud.showWin(name, () => this._nextLevel());
  }

  start() {
    const loop = () => {
      requestAnimationFrame(loop);
      const dt = Math.min(this.clock.getDelta(), 0.05);

      this.arcball.update(dt);
      this.matcher.update(dt, this.arcball.moving);
      this.hud.setProximity(this.matcher.proximity);

      if (this.matcher.solved && !this.won) this._handleWin();

      // gentle camera sway
      this.swayT += dt;
      this.camera.position.x = this.camBase.x + Math.sin(this.swayT * 0.25) * 0.18;
      this.camera.position.y = this.camBase.y + Math.sin(this.swayT * 0.19) * 0.1;
      this.camera.lookAt(0, 2.3, 0);

      this.debug?.update();
      this.renderer.render(this.scene, this.camera);
    };
    loop();
  }
}
