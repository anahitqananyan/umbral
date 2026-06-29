// Thin wrapper around the DOM overlay declared in index.html. Keeps all
// document queries in one place.

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];

export class HUD {
  constructor() {
    this.levelTag = document.getElementById('level-tag');
    this.hint = document.getElementById('hint');
    this.meterFill = document.getElementById('meter-fill');
    this.dragHint = document.getElementById('drag-hint');
    this.win = document.getElementById('win');
    this.winName = document.getElementById('win-name');
    this.nextBtn = document.getElementById('next-btn');
    this.loading = document.getElementById('loading');
  }

  setLevel(index, name, hint) {
    this.levelTag.textContent = `Shadow ${ROMAN[index] ?? index + 1}`;
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

  showWin(name, onNext) {
    this.winName.textContent = name;
    this.win.classList.add('show');
    this.nextBtn.onclick = () => {
      this.hideWin();
      onNext?.();
    };
  }

  hideWin() {
    this.win.classList.remove('show');
  }

  hideLoading() {
    this.loading.classList.add('hide');
    setTimeout(() => {
      this.loading.style.display = 'none';
    }, 900);
  }
}
