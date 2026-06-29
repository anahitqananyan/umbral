// Optional dev overlay, enabled with ?debug in the URL. Draws the live silhouette
// mask and the target mask side by side, and prints the current IoU. Handy for
// authoring objects and catching false-peak orientations.

const SIZE = 128;

export function createDebug(matcher) {
  if (!new URLSearchParams(location.search).has('debug')) return null;

  const wrap = document.createElement('div');
  wrap.style.cssText =
    'position:fixed;right:12px;bottom:12px;z-index:40;display:flex;gap:8px;' +
    'align-items:flex-end;font:11px monospace;color:#7fd6a8;pointer-events:none;';

  const liveCanvas = makeCanvas('live');
  const targetCanvas = makeCanvas('target');
  const readout = document.createElement('div');
  readout.style.cssText = 'background:rgba(0,0,0,0.6);padding:4px 8px;border-radius:4px;';

  wrap.appendChild(targetCanvas.label);
  wrap.appendChild(liveCanvas.label);
  wrap.appendChild(readout);
  document.body.appendChild(wrap);

  function makeCanvas(title) {
    const c = document.createElement('canvas');
    c.width = SIZE;
    c.height = SIZE;
    c.style.cssText = 'width:96px;height:96px;image-rendering:pixelated;border:1px solid #333;display:block;';
    const label = document.createElement('div');
    label.style.cssText = 'text-align:center;';
    const cap = document.createElement('div');
    cap.textContent = title;
    label.appendChild(c);
    label.appendChild(cap);
    return { canvas: c, ctx: c.getContext('2d'), label };
  }

  function drawMask(target, mask) {
    if (!mask) return;
    const img = target.ctx.createImageData(SIZE, SIZE);
    for (let i = 0; i < SIZE * SIZE; i++) {
      const v = mask[i] ? 255 : 20;
      img.data[i * 4] = v * 0.5;
      img.data[i * 4 + 1] = v;
      img.data[i * 4 + 2] = v * 0.65;
      img.data[i * 4 + 3] = 255;
    }
    target.ctx.putImageData(img, 0, 0);
  }

  let lastTargetDrawn = null;
  let frame = 0;

  return {
    update() {
      // Draw target once it exists / changes.
      if (matcher.solutionMask && matcher.solutionMask !== lastTargetDrawn) {
        drawMask(targetCanvas, matcher.solutionMask);
        lastTargetDrawn = matcher.solutionMask;
      }
      // Live mask: derive a binary mask from the matcher's last readback buffer.
      if (frame++ % 6 === 0 && matcher.buffer) {
        const n = SIZE * SIZE;
        const live = new Uint8Array(n);
        for (let i = 0; i < n; i++) live[i] = matcher.buffer[i * 4] > 127 ? 1 : 0;
        drawMask(liveCanvas, live);
        readout.textContent =
          `IoU ${matcher.iou.toFixed(3)}  prox ${matcher.proximity.toFixed(2)}  held ${matcher.heldMs | 0}ms`;
      }
    },
  };
}
