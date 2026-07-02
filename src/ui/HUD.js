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
    const host = this.levelGrid;
    host.innerHTML = '';

    // Layout: the first level is a diamond "hub" at the left; the remaining
    // levels split into a top straight line and a bottom straight line, both
    // running to the right and starting from the diamond. The host fills a
    // fixed-aspect box, so everything is placed in its pixel space.
    const rect = host.getBoundingClientRect();
    const W = rect.width || 1120;
    const H = rect.height || 560;
    const cy = H / 2;
    const n = items.length;
    if (n === 0) return;

    // Block footprint — keep in sync with .ls-card in index.html.
    const bw = 96;
    const bh = 90;

    const diamondX = 44 + bw / 2;
    const rowStartX = diamondX + 124; // first block of each line, right of the diamond
    const rowEndX = W - (bw / 2 + 22);
    const rowOffset = bh / 2 + 120; // vertical distance of each line from the centre (lines set well apart)
    const topY = cy - rowOffset;
    const botY = cy + rowOffset;

    const rest = n - 1;
    const topCount = Math.ceil(rest / 2);
    const botCount = rest - topCount;
    const cols = Math.max(topCount, botCount, 2);
    const dx = (rowEndX - rowStartX) / (cols - 1);

    // Point per level index: [0] = diamond; [1..topCount] = top line;
    // [topCount+1 ..] = bottom line.
    const pts = new Array(n);
    pts[0] = [diamondX, cy];
    for (let j = 0; j < topCount; j++) pts[1 + j] = [rowStartX + j * dx, topY];
    for (let j = 0; j < botCount; j++) pts[1 + topCount + j] = [rowStartX + j * dx, botY];

    // Connectors: diamond → first of each line, then along each line.
    const links = [];
    if (topCount > 0) links.push([0, 1]);
    if (botCount > 0) links.push([0, 1 + topCount]);
    for (let j = 1; j < topCount; j++) links.push([j, j + 1]);
    for (let j = 0; j < botCount - 1; j++) links.push([1 + topCount + j, 1 + topCount + j + 1]);

    for (const [ai, bi] of links) {
      const [x1, y1] = pts[ai];
      const [x2, y2] = pts[bi];
      const link = document.createElement('div');
      link.className = 'ls-link';
      link.style.left = `${(x1 + x2) / 2}px`;
      link.style.top = `${(y1 + y2) / 2}px`;
      link.style.width = `${Math.hypot(x2 - x1, y2 - y1)}px`;
      link.style.transform = `translate(-50%, -50%) rotate(${Math.atan2(y2 - y1, x2 - x1)}rad)`;
      host.appendChild(link);
    }

    // The level blocks.
    items.forEach((it, i) => {
      const [x, y] = pts[i];
      const card = document.createElement('button');
      card.className = 'ls-card';
      if (i === 0) card.classList.add('ls-diamond'); // the hub
      if (it.locked) card.classList.add('locked');
      if (it.completed) card.classList.add('done');
      card.style.left = `${x}px`;
      card.style.top = `${y}px`;

      // Each unlocked block shows the level's silhouette — that puzzle's own
      // solved shadow. Locked levels stay blank so the shape remains a mystery.
      if (it.icon && !it.locked) {
        const fig = document.createElement('img');
        fig.className = 'ls-fig';
        fig.src = it.icon;
        fig.alt = '';
        fig.draggable = false;
        card.appendChild(fig);
      }

      // The object's name, revealed as a tooltip on hover (unlocked levels only).
      if (it.name && !it.locked) {
        const label = document.createElement('span');
        label.className = 'ls-name';
        label.textContent = it.name;
        card.appendChild(label);
      }

      if (it.locked) {
        card.disabled = true;
      } else {
        card.onclick = () => onSelect(i);
      }
      host.appendChild(card);
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
