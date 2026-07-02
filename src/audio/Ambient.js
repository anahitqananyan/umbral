// A self-contained generative ambient score built with the Web Audio API — no
// audio files (nothing to license, download, or bundle). A warm, slowly-cycling
// chord progression (C – G – Am – F) with soft pad chords, a gentle arpeggio and
// a mellow bass, through a light reverb. Calm and pretty rather than dark. Since
// it's generated on the fly it never loops audibly.
//
// Browsers only allow audio to begin after a user gesture, so start() is called
// from the Play button / first interaction and is safe to call repeatedly.

const A4 = 440;
const mtof = (m) => A4 * Math.pow(2, (m - 69) / 12); // MIDI note → frequency

// Progression as [bass, ...pad tones] in MIDI notes. C – G – Am – F.
const PROG = [
  { bass: 36, pad: [48, 52, 55, 59] }, // Cmaj7
  { bass: 43, pad: [50, 55, 59, 62] }, // G
  { bass: 45, pad: [52, 57, 60, 64] }, // Am7
  { bass: 41, pad: [48, 53, 57, 60] }, // Fmaj7
];
const CHORD_SECS = 7;

export class Ambient {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.bus = null;
    this.started = false;
    this.muted = false;
    this.target = 1.0; // resting master level (full)
    this._ci = 0;
    this._chordTimer = null;
  }

  start() {
    if (this.started) {
      this._resume();
      return;
    }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    const ctx = new AC();
    this.ctx = ctx;

    this.master = ctx.createGain();
    this.master.gain.value = 0;
    // Gentle glue-compression, then makeup gain so it's actually LOUD, not
    // squashed. (The old settings were limiting hard, which capped the volume.)
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -6;
    comp.ratio.value = 3;
    comp.attack.value = 0.02;
    comp.release.value = 0.3;
    const makeup = ctx.createGain();
    makeup.gain.value = 3.0; // post-compressor boost
    this.master.connect(comp);
    comp.connect(makeup);
    makeup.connect(ctx.destination);

    // Warmth: a gentle lowpass over everything.
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 2000;
    lp.Q.value = 0.3;
    lp.connect(this.master);

    // A light reverb (generated-noise impulse) in parallel with the dry signal.
    const conv = ctx.createConvolver();
    conv.buffer = this._impulse(1.9, 2.4);
    const rev = ctx.createGain();
    rev.gain.value = 0.4;
    conv.connect(rev);
    rev.connect(this.master);

    // Shared bus feeding both the dry (lowpass) and wet (reverb) paths.
    this.bus = ctx.createGain();
    this.bus.gain.value = 1;
    this.bus.connect(lp);
    this.bus.connect(conv);

    this._scheduleChords();

    this.started = true;
    if (!this.muted) {
      this.master.gain.setValueAtTime(0.0001, ctx.currentTime);
      this.master.gain.linearRampToValueAtTime(this.target, ctx.currentTime + 3); // slow fade-in
    }
  }

  _resume() {
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
  }

  _impulse(seconds, decay) {
    const ctx = this.ctx;
    const len = Math.floor(ctx.sampleRate * seconds);
    const buf = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const data = buf.getChannelData(ch);
      for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
    }
    return buf;
  }

  _scheduleChords() {
    const step = () => {
      if (this.ctx && !this.muted) {
        const chord = PROG[this._ci % PROG.length];
        this._playChord(chord);
        this._arpeggio(chord);
        this._ci++;
      }
      this._chordTimer = setTimeout(step, CHORD_SECS * 1000);
    };
    step();
  }

  // Soft sustained pad chord + a mellow bass note, overlapping the next chord.
  _playChord(chord) {
    const t = this.ctx.currentTime;
    const hold = CHORD_SECS + 1.6; // overlap so chords cross-fade
    for (const m of chord.pad) this._pad(mtof(m), t, hold, 0.09);
    this._pad(mtof(chord.bass), t, hold, 0.14, 'triangle');
  }

  _pad(freq, t, dur, peak, type = 'sine') {
    const ctx = this.ctx;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + 1.4); // slow swell
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur); // long fade
    g.connect(this.bus);

    for (const det of [-5, 5]) {
      const o = ctx.createOscillator();
      o.type = type;
      o.frequency.value = freq;
      o.detune.value = det; // slight detune = warmth
      o.connect(g);
      o.start(t);
      o.stop(t + dur + 0.2);
    }
  }

  // A gentle arpeggio over the chord tones (up an octave) across the bar.
  _arpeggio(chord) {
    const notes = chord.pad.map((m) => m + 12);
    const interval = 0.55;
    const count = Math.floor(CHORD_SECS / interval);
    for (let i = 0; i < count; i++) {
      const t = this.ctx.currentTime + 0.1 + i * interval;
      this._pluck(mtof(notes[i % notes.length]), t);
    }
  }

  _pluck(freq, t) {
    const ctx = this.ctx;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.09, t + 0.02); // quick pluck
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.7); // short decay

    let out = g;
    if (ctx.createStereoPanner) {
      const pan = ctx.createStereoPanner();
      pan.pan.value = Math.random() * 1.0 - 0.5;
      g.connect(pan);
      out = pan;
    }
    out.connect(this.bus);

    const o = ctx.createOscillator();
    o.type = 'triangle';
    o.frequency.value = freq;
    o.connect(g);
    o.start(t);
    o.stop(t + 0.8);
  }

  // A bright, triumphant arpeggio played when a level is solved.
  playWin() {
    if (!this.ctx || this.muted) return;
    const t = this.ctx.currentTime;
    const notes = [72, 76, 79, 84, 88]; // C5 E5 G5 C6 E6 — ascending major flourish
    notes.forEach((m, i) => this._chime(mtof(m), t + 0.08 + i * 0.11));
  }

  _chime(freq, t) {
    const ctx = this.ctx;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.16, t + 0.015); // sharp attack
    g.gain.exponentialRampToValueAtTime(0.0001, t + 1.1); // bell-like decay
    g.connect(this.bus);

    // A sine fundamental plus a soft octave partial for a shimmering bell.
    for (const [mult, mix] of [[1, 1], [2, 0.35], [3, 0.12]]) {
      const o = ctx.createOscillator();
      o.type = 'sine';
      o.frequency.value = freq * mult;
      const vg = ctx.createGain();
      vg.gain.value = mix;
      o.connect(vg);
      vg.connect(g);
      o.start(t);
      o.stop(t + 1.2);
    }
  }

  toggleMute() {
    this.setMuted(!this.muted);
    return this.muted;
  }

  setMuted(m) {
    this.muted = m;
    if (!this.ctx || !this.master) return;
    const now = this.ctx.currentTime;
    this.master.gain.cancelScheduledValues(now);
    this.master.gain.setValueAtTime(this.master.gain.value, now);
    this.master.gain.linearRampToValueAtTime(m ? 0 : this.target, now + (m ? 0.5 : 2));
  }
}
