// Thin wrapper around the DOM overlay declared in index.html. Keeps all
// document queries in one place.

export class HUD {
  constructor() {
    this.levelTag = document.getElementById('level-tag');
    this.hint = document.getElementById('hint');
    this.meterFill = document.getElementById('meter-fill');
    this.dragHint = document.getElementById('drag-hint');
    this.win = document.getElementById('win');
    this.winName = document.getElementById('win-name');
    this.nextBtn = document.getElementById('next-btn');
    this.selectBtn = document.getElementById('select-btn');
    this.loading = document.getElementById('loading');

    this.mainMenu = document.getElementById('main-menu');
    this.playBtn = document.getElementById('play-btn');

    this.levelSelect = document.getElementById('level-select');
    this.levelGrid = document.getElementById('level-grid');
    this.levelsBtn = document.getElementById('levels-btn');

    // Settings overlay.
    this.settings = document.getElementById('settings');
    this.settingsProgress = document.getElementById('settings-progress');
    this.settingsOpenBtn = document.getElementById('settings-open');
    this.settingsCloseBtn = document.getElementById('settings-close');
    this.resetBtn = document.getElementById('reset-btn');
    this.resetConfirm = document.getElementById('reset-confirm');
    this.resetYesBtn = document.getElementById('reset-yes');
    this.resetNoBtn = document.getElementById('reset-no');

    // Set by Game.
    this.onPlay = null;
    this.onOpenLevelSelect = null;
    this.onOpenSettings = null;
    this.onResetProgress = null;

    this.playBtn.onclick = () => this.onPlay?.();
    this.levelsBtn.onclick = () => this.onOpenLevelSelect?.();
    this.settingsOpenBtn.onclick = () => this.onOpenSettings?.();
    this.settingsCloseBtn.onclick = () => this.hideSettings();
    this.resetBtn.onclick = () => { this.resetConfirm.hidden = false; };
    this.resetNoBtn.onclick = () => { this.resetConfirm.hidden = true; };
    this.resetYesBtn.onclick = () => {
      this.resetConfirm.hidden = true;
      this.onResetProgress?.();
    };
  }

  setLevel(index, name, hint) {
    this.levelTag.textContent = `Level ${index + 1}`;
    this.hint.textContent = hint;
  }

  // proximity 0..1
  setProximity(p) {
    this.meterFill.style.width = `${(p * 100).toFixed(1)}%`;
  }

  showDragHint() {
    this.dragHint.classList.add('show');
  }

  hideDragHint() {
    this.dragHint.classList.remove('show');
  }

  showWin(name, onNext, onSelect) {
    this.winName.textContent = name;
    this.win.classList.add('show');
    this.nextBtn.onclick = () => {
      this.hideWin();
      onNext?.();
    };
    this.selectBtn.onclick = () => {
      this.hideWin();
      onSelect?.();
    };
  }

  hideWin() {
    this.win.classList.remove('show');
  }

  // Render the level-select grid. `items` is one entry per level:
  //   { locked: bool, completed: bool }
  // The shape's name is deliberately NOT shown — it's the puzzle to discover.
  // Locked levels are not clickable. Call again to refresh as progress changes.
  renderLevelSelect(items, onSelect) {
    this.levelGrid.innerHTML = '';
    items.forEach((it, i) => {
      const card = document.createElement('button');
      card.className = 'ls-card';
      if (it.locked) card.classList.add('locked');
      if (it.completed) card.classList.add('done');

      const icon = it.locked ? '🔒' : it.completed ? '✓' : '◆';
      const label = it.locked ? 'Locked' : it.completed ? 'Cleared' : 'Enter';
      card.innerHTML =
        `<span class="num">Level ${i + 1}</span>` +
        `<span class="nm">${icon} ${label}</span>`;

      if (it.locked) {
        card.disabled = true;
      } else {
        card.onclick = () => onSelect(i);
      }
      this.levelGrid.appendChild(card);
    });
  }

  showMainMenu() {
    this.mainMenu.classList.add('show');
  }

  hideMainMenu() {
    this.mainMenu.classList.remove('show');
  }

  showLevelSelect() {
    this.levelSelect.classList.add('show');
  }

  hideLevelSelect() {
    this.levelSelect.classList.remove('show');
  }

  setSettingsProgress(text) {
    this.settingsProgress.textContent = text;
  }

  showSettings() {
    this.resetConfirm.hidden = true; // always start collapsed
    this.settings.classList.add('show');
  }

  hideSettings() {
    this.settings.classList.remove('show');
  }

  hideLoading() {
    this.loading.classList.add('hide');
    setTimeout(() => {
      this.loading.style.display = 'none';
    }, 900);
  }
}
