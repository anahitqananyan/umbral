import { hash21 } from './math.js';

// Cheap 2D value noise with smooth interpolation. Deterministic (seeded by integer lattice).
// Good enough to cluster basalt column heights into organic "organ pipe" formations.
export function valueNoise2D(x, y) {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = x - xi;
  const yf = y - yi;

  const tl = hash21(xi, yi);
  const tr = hash21(xi + 1, yi);
  const bl = hash21(xi, yi + 1);
  const br = hash21(xi + 1, yi + 1);

  const u = xf * xf * (3 - 2 * xf);
  const v = yf * yf * (3 - 2 * yf);

  const top = tl + (tr - tl) * u;
  const bottom = bl + (br - bl) * u;
  return top + (bottom - top) * v;
}

// Layered (fractal) value noise for richer height variation.
export function fbm2D(x, y, octaves = 3) {
  let amp = 0.5;
  let freq = 1;
  let sum = 0;
  let norm = 0;
  for (let i = 0; i < octaves; i++) {
    sum += amp * valueNoise2D(x * freq, y * freq);
    norm += amp;
    amp *= 0.5;
    freq *= 2;
  }
  return sum / norm;
}
