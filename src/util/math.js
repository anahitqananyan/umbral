// Small math helpers used across the game.

export function clamp(v, lo, hi) {
  return v < lo ? lo : v > hi ? hi : v;
}

export function clamp01(v) {
  return clamp(v, 0, 1);
}

export function lerp(a, b, t) {
  return a + (b - a) * t;
}

// GLSL-style smoothstep: 0 below edge0, 1 above edge1, smooth in between.
export function smoothstep(edge0, edge1, x) {
  const t = clamp01((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

// Exponential moving average step toward target. `rate` in [0,1].
export function ema(current, target, rate) {
  return current + (target - current) * rate;
}

// Deterministic hash -> [0,1). Used instead of Math.random for reproducible scenes.
export function hash11(n) {
  const s = Math.sin(n * 127.1) * 43758.5453123;
  return s - Math.floor(s);
}

export function hash21(x, y) {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453123;
  return s - Math.floor(s);
}

export const DEG = Math.PI / 180;
