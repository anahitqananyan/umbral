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
    this.loading = document.getElementById('loading');

    // Sound (ambient score) toggle.
    this.soundBtn = document.getElementById('sound-btn');
    this.onToggleSound = null;
    this.soundBtn.onclick = () => this.onToggleSound?.();

    // "Reset?" nudge shown once every level is cleared — opens Settings on click.
    this.resetToast = document.getElementById('reset-toast');
    this.resetToast.onclick = () => this.onOpenSettings?.();

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

  showWin(name) {
    this.winName.textContent = name;
    this.win.classList.add('show');
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

    // Layout: a straight stem runs from the first level up to Cupid (index 4);
    // after Cupid the path splits into a top arc and a bottom arc (both playable)
    // that curve out and reconnect at the final level — a stem + oval loop. The
    // host fills a fixed-aspect box, so everything is placed in its pixel space.
    const rect = host.getBoundingClientRect();
    const W = rect.width || 1180;
    const H = rect.height || 620;
    const cy = H / 2;
    const n = items.length;
    if (n === 0) return;

    // Block footprint — keep in sync with .ls-card in index.html.
    const bw = 108;
    const bh = 102;

    // Branch structure (kept in sync with Game._branchInfo): stem 0..CUPID, then
    // the middle levels split into TOP and BOT arcs, converging on MERGE (last).
    const CUPID = 4;
    const MERGE = n - 1;
    const middle = [];
    for (let i = CUPID + 1; i < MERGE; i++) middle.push(i);
    const half = Math.ceil(middle.length / 2);
    const TOP = middle.slice(0, half);
    const BOT = middle.slice(half);

    const xStart = 70;
    const xCupid = W * 0.4; // stem ends here (the diamond)
    const xOvalLeft = W * 0.48; // the oval begins just past the diamond
    const xMerge = W - 60; // the oval's right vertex = the final level
    const ovalCx = (xOvalLeft + xMerge) / 2;
    const ovalRx = (xMerge - xOvalLeft) / 2;
    const ovalRy = Math.min(H * 0.36, cy - bh / 2 - 14); // wide oval (rx > ry)

    const pts = new Array(n);
    // Stem 0..CUPID along the centre line.
    for (let i = 0; i <= CUPID; i++) pts[i] = [xStart + (xCupid - xStart) * (i / CUPID), cy];

    // The branch levels sit evenly around a full oval. Going clockwise from just
    // above the left (where the diamond links in): the top arc rises to the right
    // vertex (the final, MERGE), then the bottom arc returns — so both branch ends
    // flank MERGE and both branch starts flank the diamond's entry gap on the left.
    const order = [...TOP, MERGE, ...[...BOT].reverse()];
    const gap = 0.7; // radians of empty arc at the left, for the diamond entry
    const span = 2 * Math.PI - gap;
    order.forEach((idx, p) => {
      const theta = Math.PI + gap / 2 + span * (p / (order.length - 1));
      pts[idx] = [ovalCx + ovalRx * Math.cos(theta), cy + ovalRy * Math.sin(theta)];
    });

    // Draw the oval itself as a dashed ring (an SVG ellipse, so it's smooth) and
    // the straight dashed links: the stem, and the diamond forking to each branch
    // start. The ring itself connects all the levels sitting on it.
    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('class', 'ls-svg');
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svg.setAttribute('width', W);
    svg.setAttribute('height', H);
    // Draw the ring as an arc that stops at each branch start (open on the left),
    // so there's no line closing across the entry gap between the two starts
    // (Pawn ↔ Christmas Tree). Runs the long way round through the far vertex.
    const [sx, sy] = pts[TOP[0]];
    const [ex, ey] = pts[BOT[0]];
    const ring = document.createElementNS(svgNS, 'path');
    ring.setAttribute('d', `M ${sx} ${sy} A ${ovalRx} ${ovalRy} 0 1 1 ${ex} ${ey}`);
    ring.setAttribute('fill', 'none');
    ring.setAttribute('stroke', '#ffffff');
    ring.setAttribute('stroke-width', '4');
    ring.setAttribute('stroke-dasharray', '7 12');
    ring.setAttribute('opacity', '0.8');
    svg.appendChild(ring);
    host.appendChild(svg);

    const links = [];
    for (let i = 0; i < CUPID; i++) links.push([i, i + 1]); // stem
    if (TOP.length) links.push([CUPID, TOP[0]]); // diamond → top branch start
    if (BOT.length) links.push([CUPID, BOT[0]]); // diamond → bottom branch start

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
      if (i === CUPID) card.classList.add('ls-diamond'); // the split junction
      if (it.locked) card.classList.add('locked');
      if (it.completed) card.classList.add('done');
      card.style.left = `${x}px`;
      card.style.top = `${y}px`;

      // A level shows its silhouette (that puzzle's own solved shadow) only once
      // it's been cleared. Until then — whether unreachable or just not-yet-passed
      // — it shows a padlock, so the shape stays a mystery until you solve it.
      if (!it.completed) {
        const NS = 'http://www.w3.org/2000/svg';
        const lock = document.createElementNS(NS, 'svg');
        lock.setAttribute('class', 'ls-lock');
        lock.setAttribute('viewBox', '0 0 24 24');
        const path = document.createElementNS(NS, 'path');
        path.setAttribute('fill', '#1a1a1a');
        path.setAttribute('fill-rule', 'evenodd');
        path.setAttribute(
          'd',
          'M12 17c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm6-9h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM8.9 6c0-1.71 1.39-3.1 3.1-3.1s3.1 1.39 3.1 3.1v2H8.9V6z'
        );
        lock.appendChild(path);
        card.appendChild(lock);
      } else if (it.icon) {
        const fig = document.createElement('img');
        fig.className = 'ls-fig';
        fig.src = it.icon;
        fig.alt = '';
        fig.draggable = false;
        card.appendChild(fig);
      }

      // The object's name is revealed (on hover) only once the level is cleared.
      if (it.name && it.completed) {
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

  setSoundMuted(muted) {
    this.soundBtn.textContent = muted ? '🔇 Sound: Off' : '🔊 Sound: On';
  }

  showResetSuggestion() {
    this.resetToast.classList.add('show');
  }

  hideResetSuggestion() {
    this.resetToast.classList.remove('show');
  }

  hideLoading() {
    this.loading.classList.add('hide');
    setTimeout(() => {
      this.loading.style.display = 'none';
    }, 900);
  }
}
