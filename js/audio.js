/* ============================================================================
   INDEX 87 - AUDIO (from audits/audio.md; backlog J-19 and later)
   Loaded after the main game script in index.html. Wrap SFX / MUS functions
   or override their voices from here; never rewrite index.html.
   Each change: a short note here (what, why, old and new values) and a
   ROLLBACK line.

   Reach into the game: two tiny marked patches in index.html expose
   MUS._V (the voice table) and SFX._g() (the SFX audio context). Without
   them this file does nothing. Rolling the whole file back = delete the
   <script src="js/audio.js"> line; the two patches are harmless.

   J-19 (first pass of mellow town audio)
   AUD-01  Camp/town melody: the plucked lute (Karplus-Strong string, one
           cached buffer per pitch) replaces the pipe. Old: V.pipe sine +
           octave triangle, vibrato, peak 0.36. New: peak 0.24, lowpass sweep
           3600 -> 900 Hz, body peak +5 dB at 230 Hz. The Full Tankard keeps
           its fiddle; its pipe doubling uses the mellow pipe.
           ROLLBACK: delete the "AUD-01" block (V.pipe / V.cut / V.lute).
   AUD-02  Pipes that still sound (battle whistle, party doubling): peak 0.36
           -> 0.24, lowpass 3400 -> 2100 Hz, attack 35 -> 70 ms, release
           90 -> 150 ms, 2nd harmonic 0.13 -> 0.06, vibrato 7 -> 4 cents and
           later, chiff 0.05 -> 0.02.   ROLLBACK: delete "AUD-02".
   AUD-05  Music bus: highshelf -2 dB at 6 kHz, small room reverb send
           (1.6 s, wet 0.14), compressor -14/-18 dB threshold -> -18, knee 12,
           ratio 4 -> 3, release 0.25 -> 0.3.   ROLLBACK: delete "AUD-05".
   AUD-06  Town drums: thump -> frame drum "dum" (sine 130 -> 68 Hz, 0.3 s),
           tick -> rim "tek" (sine 320 -> 220 Hz + 1.8 kHz noise), +-10 %
           velocity and +-3 % pitch variation. Contract drums are untouched.
           ROLLBACK: delete "AUD-06".
   AUD-07  Bard strum follows the audio clock (bar start times logged by a
           wrapper on each tune's camp.fn).   ROLLBACK: delete "AUD-07".
   AUD-10  SFX coin, pick, horn, nope, level, win rewritten softer, with
           small pitch variation.   ROLLBACK: delete "AUD-10".
   AUD-15  Rests between verses capped at 5.5 s; a quiet wind bed with the
           odd fire crackle fills a rest (not when the bard is "off").
           ROLLBACK: delete "AUD-15".
   AUD-16  "Soft sounds" setting (lowpass 3 kHz on effects, music shelf
           -5 dB), effects pause when the tab is hidden, a one-time
           "click for sound" hint.   ROLLBACK: delete "AUD-16".
============================================================================ */
(function(){
'use strict';
if (typeof MUS === 'undefined' || !MUS._V || typeof SFX === 'undefined' || !SFX._g) return;
const M = MUS._M, V = MUS._V;
const hz = MUS.hz;
const cfg = () => { try { return (typeof settings === 'function') ? settings() : {}; } catch (e) { return {}; } };
const jit = a => 1 + (Math.random() * 2 - 1) * a;
const camp = () => M.track === 'camp';

/* ---- shared helpers ------------------------------------------------------ */
function nburst(ac, buf, dest, t, dur, vol, type, f, q){
  const s = ac.createBufferSource(), fl = ac.createBiquadFilter(), g = ac.createGain();
  s.buffer = buf; s.loop = true; fl.type = type; fl.frequency.value = f; fl.Q.value = q || .7;
  g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
  s.connect(fl); fl.connect(g); g.connect(dest); s.start(t, Math.random() * .5); s.stop(t + dur + .02);
}
const mnb = (t, dur, vol, type, f, q) => nburst(M.ac, M.noise, M.bus.g, t, dur, vol, type, f, q);

/* ---- AUD-01 the lute -------------------------------------------------------
   Karplus-Strong: a damped delay line, y[n] = .997 * .5 * (y[n-D] + y[n-D-1]), D = sr/f - .5,
   fractional delay by linear interpolation, seeded with softened noise. Rendered once per pitch. */
const ksCache = new Map();
function ksBuf(ac, f){
  const dur = f < 300 ? 1.8 : 1.3, key = Math.round(f * 10) + ':' + ac.sampleRate;
  let b = ksCache.get(key); if (b) return b;
  const sr = ac.sampleRate, N = Math.floor(sr * dur); b = ac.createBuffer(1, N, sr);
  const y = b.getChannelData(0), D = sr / f - .5, Di = Math.floor(D), fr = D - Di;
  let lp = 0; for (let i = 0; i < Di + 2; i++){ lp += ((Math.random() * 2 - 1) - lp) * .55; y[i] = lp; }
  for (let n = Di + 2; n < N; n++){
    const a = y[n - Di] * (1 - fr) + y[n - Di - 1] * fr, c = y[n - Di - 1] * (1 - fr) + y[n - Di - 2] * fr;
    y[n] = .997 * .5 * (a + c);
  }
  let mx = 0; for (let i = 0; i < N; i++) mx = Math.max(mx, Math.abs(y[i])); mx = mx || 1;
  for (let i = 0; i < N; i++) y[i] /= mx;
  ksCache.set(key, b); return b;
}
function lute(t, e, gain){
  const ac = M.ac, f = hz(e.m), life = Math.min(1.6, .7 + Math.max(.1, e.d || .3) * .9);
  const s = ac.createBufferSource(), lp = ac.createBiquadFilter(), body = ac.createBiquadFilter(), g = ac.createGain();
  s.buffer = ksBuf(ac, f); lp.type = 'lowpass'; lp.Q.value = .6; body.type = 'peaking'; body.frequency.value = 230; body.Q.value = 1.2; body.gain.value = 5;
  lp.frequency.setValueAtTime(3600, t); lp.frequency.exponentialRampToValueAtTime(900, t + .7);
  g.gain.setValueAtTime(.24 * e.v * (gain || 1), t); g.gain.setTargetAtTime(.0001, t + life * .55, life * .15);
  s.connect(lp); lp.connect(body); body.connect(g); g.connect(M.bus.g); s.start(t); s.stop(t + life + .5);
  mnb(t, .02, .02 * e.v, 'bandpass', Math.min(5000, f * 3), 1.4);                 // the finger
}
const luteMelody = (t, e) => {
  lute(t, e, 1);
  if ((e.d || 0) >= 1.5) lute(t + e.d / 2, {m:e.m, d:e.d / 2, v:e.v * .5}, 1);     // a long note is plucked again halfway
};

/* ---- AUD-02 the mellow pipe ------------------------------------------------- */
const pipe0 = V.pipe, cut0 = V.cut;
function mellowPipe(t, e){
  const ac = M.ac, f = hz(e.m), d = Math.max(.08, e.d), g = ac.createGain(), lp = ac.createBiquadFilter();
  lp.type = 'lowpass'; lp.frequency.value = 2100; lp.Q.value = .4;
  const o1 = ac.createOscillator(), o2 = ac.createOscillator(), g2 = ac.createGain();
  o1.type = 'sine'; o2.type = 'triangle'; o1.frequency.setValueAtTime(f, t); o2.frequency.setValueAtTime(f * 2, t); g2.gain.value = .06;
  o1.connect(g); o2.connect(g2); g2.connect(g); g.connect(lp); lp.connect(M.bus.g);
  const pk = .24 * e.v, a = .07, hold = Math.max(a, d - .03), rel = .15;
  g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(Math.max(.0002, pk), t + a);
  g.gain.setValueAtTime(Math.max(.0002, pk), t + hold); g.gain.exponentialRampToValueAtTime(.0001, t + hold + rel);
  if (e.vib && d > .3){
    const l = ac.createOscillator(), lg = ac.createGain(); l.frequency.value = 5; lg.gain.setValueAtTime(0, t); lg.gain.setValueAtTime(0, t + .25); lg.gain.linearRampToValueAtTime(4, t + .25 + Math.min(.4, d * .6));
    l.connect(lg); lg.connect(o1.detune); lg.connect(o2.detune); l.start(t); l.stop(t + d + rel + .1);
  }
  o1.start(t); o2.start(t); o1.stop(t + hold + rel + .05); o2.stop(t + hold + rel + .05);
  mnb(t, .05, .02 * e.v, 'bandpass', f * 3, 2.5);
}
V.pipe = function(t, e){
  if (camp() && M.song !== 'party') return luteMelody(t, e);                      // AUD-01: town melody on the lute
  return mellowPipe(t, e);                                                          // AUD-02
};
V.cut = function(t, e){
  if (camp() && M.song !== 'party') return lute(t, {m:e.m, d:.1, v:e.v * .35}, 1);
  return cut0(t, e);
};
V.lute = function(t, e){ lute(t, e, 1); };                                          // the Dust and Iron / March bard tunes

/* ---- AUD-06 frame drum and hand drum for the town ------------------------- */
const thump0 = V.thump, tick0 = V.tick;
V.thump = function(t, e){
  if (!camp()) return thump0(t, e);
  const ac = M.ac, v = e.v * jit(.1), o = ac.createOscillator(), g = ac.createGain();
  o.type = 'sine'; o.frequency.setValueAtTime(130 * jit(.03), t); o.frequency.exponentialRampToValueAtTime(68, t + .14);
  o.connect(g); g.connect(M.bus.g); g.gain.setValueAtTime(.42 * v, t); g.gain.exponentialRampToValueAtTime(.0001, t + .3); o.start(t); o.stop(t + .32);
  mnb(t, .05, .08 * v, 'lowpass', 700, .7);
};
V.tick = function(t, e){
  if (!camp()) return tick0(t, e);
  const ac = M.ac, v = e.v * jit(.1), o = ac.createOscillator(), g = ac.createGain();
  o.type = 'sine'; o.frequency.setValueAtTime(320 * jit(.03), t); o.frequency.exponentialRampToValueAtTime(220, t + .05);
  o.connect(g); g.connect(M.bus.g); g.gain.setValueAtTime(.16 * v, t); g.gain.exponentialRampToValueAtTime(.0001, t + .07); o.start(t); o.stop(t + .09);
  mnb(t, .045, .09 * v, 'bandpass', 1800, 1.1);
};

/* ---- AUD-07 the bard strums on the audio clock ----------------------------- */
const barLog = [];
for (const id in MUS.SONGS){
  const c = MUS.SONGS[id].camp, f = c.fn;
  c.fn = function(bi, variant){
    const r = f(bi, variant);
    barLog.push({t:M.nextT, len:r.len * (M.pk || 1)}); if (barLog.length > 8) barLog.shift();   // M.nextT is this bar's start while it is being scheduled
    return r;
  };
}
const bardFrame0 = window.bardFrame;
if (typeof bardFrame0 === 'function') window.bardFrame = function(){
  if (!MUS.playing()) return 2;
  const now = M.ac.currentTime; let cur = null;
  for (const b of barLog) if (b.t <= now) cur = b;
  if (!cur || now - cur.t > cur.len * 1.5) return bardFrame0();
  return Math.floor((now - cur.t) / Math.max(.05, MUS.beat())) % 2;                // MUS.beat() already includes the pass tempo
};

/* ---- AUD-05 mix chain on the music bus ------------------------------------- */
let shelf = null;
function installMix(){
  const ac = M.ac; if (!ac || shelf || !M.comp || !M.out) return;
  const c = M.comp; c.disconnect();
  c.threshold.value = -18; c.knee.value = 12; c.ratio.value = 3; c.release.value = .3;
  shelf = ac.createBiquadFilter(); shelf.type = 'highshelf'; shelf.frequency.value = 6000; shelf.gain.value = -2;
  c.connect(shelf); shelf.connect(M.out);
  const len = Math.floor(ac.sampleRate * 1.6), imp = ac.createBuffer(2, len, ac.sampleRate);
  for (let ch = 0; ch < 2; ch++){ const a = imp.getChannelData(ch); let lp = 0; for (let i = 0; i < len; i++){ lp += ((Math.random() * 2 - 1) - lp) * .35; a[i] = lp * Math.pow(1 - i / len, 3.2); } }
  const conv = ac.createConvolver(), wet = ac.createGain(); conv.buffer = imp; wet.gain.value = .14;
  shelf.connect(conv); conv.connect(wet); wet.connect(M.out);
}

/* ---- AUD-10 softer, varied sound effects ------------------------------------ */
const SOFT = {};
let sfxLP = null;
const sfxLast = {}, SGAP = {coin:40, pick:25, horn:120, nope:60, level:150, win:150};
function sfxPing(X, f, dur, peak, delay, type, lpHz){
  const t = X.ac.currentTime + (delay || 0), o = X.ac.createOscillator(), g = X.ac.createGain();
  o.type = type || 'sine'; o.frequency.setValueAtTime(f, t);
  g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + .004); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
  o.connect(g); if (lpHz){ const l = X.ac.createBiquadFilter(); l.type = 'lowpass'; l.frequency.value = lpHz; g.connect(l); l.connect(X.master); } else g.connect(X.master);
  o.start(t); o.stop(t + dur + .02);
}
SOFT.coin = X => { const f = [784, 988, 1175][Math.random() * 3 | 0] * jit(.03); sfxPing(X, f, .28, .08); sfxPing(X, f * 2.76, .12, .025); };
SOFT.pick = X => {
  const t = X.ac.currentTime, f = 420 * jit(.06), o = X.ac.createOscillator(), g = X.ac.createGain(), lp = X.ac.createBiquadFilter();
  o.type = 'triangle'; o.frequency.setValueAtTime(f, t); o.frequency.exponentialRampToValueAtTime(f * .8, t + .05); lp.type = 'lowpass'; lp.frequency.value = 1800;
  o.connect(g); g.connect(lp); lp.connect(X.master); g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.12, t + .003); g.gain.exponentialRampToValueAtTime(.0001, t + .07); o.start(t); o.stop(t + .09);
  nburst(X.ac, X.noiseBuf, X.master, t, .02, .03, 'bandpass', 2200, 1.2);
};
SOFT.horn = X => {
  const t = X.ac.currentTime;
  [110, 164.8, 220].forEach((f, i) => {
    const o = X.ac.createOscillator(), g = X.ac.createGain(), lp = X.ac.createBiquadFilter(), pk = .07 / (1 + i * .4);
    o.type = 'sawtooth'; o.frequency.setValueAtTime(f, t); lp.type = 'lowpass'; lp.Q.value = .8;
    lp.frequency.setValueAtTime(300, t); lp.frequency.linearRampToValueAtTime(900, t + .18); lp.frequency.linearRampToValueAtTime(500, t + .7);
    o.connect(lp); lp.connect(g); g.connect(X.master);
    g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(pk, t + .1); g.gain.setValueAtTime(pk, t + .4); g.gain.exponentialRampToValueAtTime(.0001, t + .85);
    o.start(t); o.stop(t + .9);
  });
};
SOFT.nope = X => {
  const t = X.ac.currentTime, o = X.ac.createOscillator(), g = X.ac.createGain(), lp = X.ac.createBiquadFilter();
  o.type = 'sine'; o.frequency.setValueAtTime(150 * jit(.03), t); o.frequency.exponentialRampToValueAtTime(110, t + .12); lp.type = 'lowpass'; lp.frequency.value = 700;
  o.connect(g); g.connect(lp); lp.connect(X.master); g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.12, t + .005); g.gain.exponentialRampToValueAtTime(.0001, t + .12); o.start(t); o.stop(t + .14);
};
SOFT.level = X => { const k = jit(.01); [523, 659, 784, 1046].forEach((f, i) => { sfxPing(X, f * k, .4, .1, i * .09); sfxPing(X, f * k * 2, .2, .02, i * .09); }); };
SOFT.win = X => { const k = jit(.01), n = [392, 523, 659, 784, 1046]; n.forEach((f, i) => { const last = i === n.length - 1; sfxPing(X, f * k, last ? .7 : .3, .11, i * .1); sfxPing(X, f * k * 2, last ? .35 : .15, .02, i * .1); }); };
const play0 = SFX.play;
SFX.play = function(name){
  const fn = SOFT[name];
  if (!fn) return play0.apply(this, arguments);
  try {
    const X = SFX._g(); if (!X.ac || !cfg().volume || cfg().volume <= 0) return;
    const now = performance.now(); if (now - (sfxLast[name] || 0) < SGAP[name]) return; sfxLast[name] = now;
    fn(X);
  } catch (e) {}
};

/* ---- AUD-15 gentler rests between verses and a wind bed ---------------------- */
let amb = null, seenRest = -1, crackleT = 0;
function crackle(){
  crackleT = 0;
  if (!amb || !camp() || M.bus) return;
  try { const t = M.ac.currentTime + .01; nburst(M.ac, M.noise, amb.g, t, .02, (.05 + Math.random() * .1), 'bandpass', 1200 + Math.random() * 2000, 1.5); } catch (e) {}
  crackleT = setTimeout(crackle, 400 + Math.random() * 2600);
}
function ambience(){
  const ac = M.ac; if (!ac) return;
  const resting = camp() && !M.bus && M.song !== 'off' && isFinite(M.restartAt) && MUS.vol() > .005;
  if (resting && !amb){
    const s = ac.createBufferSource(), lp = ac.createBiquadFilter(), g = ac.createGain();
    s.buffer = M.noise; s.loop = true; lp.type = 'lowpass'; lp.frequency.value = 280; lp.Q.value = .3; g.gain.value = .0001;
    s.connect(lp); lp.connect(g); g.connect(M.out); s.start();
    amb = {s, g}; crackleT = setTimeout(crackle, 900);
  }
  if (amb){
    amb.g.gain.setTargetAtTime(resting ? .15 : .0001, ac.currentTime, resting ? 1.2 : .6);
    if (!resting && amb.g.gain.value < .002){ try { amb.s.stop(); amb.g.disconnect(); } catch (e) {} clearTimeout(crackleT); amb = null; }
  }
}
function capRest(){
  if (!camp() || M.bus || !isFinite(M.restartAt) || M.restartAt === seenRest) return;
  M.restartAt = Math.min(M.restartAt, M.nextT + 2.4 + 5.5); seenRest = M.restartAt;
}

/* ---- AUD-16 soft sounds, hidden tab, first-click hint ------------------------ */
{ const f = window.settingsHTML;
  if (typeof f === 'function') window.settingsHTML = function(dark){
    const s = f(dark), on = !!cfg().softSound;
    const ctl = `<label title="Rounds off bright, high sounds (effects and music)."><input type="checkbox" ${on ? 'checked' : ''} onchange="setSetting('softSound', this.checked)"> Soft sounds</label>`;
    const i = s.lastIndexOf('</div>');
    return i < 0 ? s + ctl : s.slice(0, i) + ctl + s.slice(i);
  };
}
function installSfxChain(){
  const X = SFX._g(); if (!X.ac || !X.master || sfxLP) return;
  sfxLP = X.ac.createBiquadFilter(); sfxLP.type = 'lowpass'; sfxLP.frequency.value = 20000; sfxLP.Q.value = .5;
  X.master.disconnect(); X.master.connect(sfxLP); sfxLP.connect(X.ac.destination);
}
document.addEventListener('visibilitychange', () => {
  const X = SFX._g(); if (!X.ac) return;
  try { if (document.hidden) X.ac.suspend(); else X.ac.resume(); } catch (e) {}
});
let hint = null;
function showHint(){
  const c = cfg(); if (M.ac || c.volume === 0 || c.music === 0) return;
  hint = document.createElement('div');
  hint.textContent = 'Click anywhere to turn the sound on';
  hint.style.cssText = 'position:fixed;left:50%;bottom:14px;transform:translateX(-50%);background:rgba(20,16,10,.8);color:#e8d8b0;font:13px Georgia,serif;padding:6px 14px;border-radius:14px;z-index:9999;pointer-events:none;transition:opacity .5s';
  document.body.appendChild(hint);
  const gone = () => { if (!hint) return; hint.style.opacity = 0; const h = hint; hint = null; setTimeout(() => h.remove(), 600); };
  for (const ev of ['pointerdown', 'keydown', 'touchend']) window.addEventListener(ev, gone, {once:true});
  setTimeout(gone, 9000);
}
setTimeout(showHint, 1200);

/* ---- one light poll for everything that needs the audio context ---------------- */
setInterval(() => {
  try {
    installSfxChain(); installMix();
    const soft = !!cfg().softSound;
    if (sfxLP) sfxLP.frequency.setTargetAtTime(soft ? 3000 : 20000, sfxLP.context.currentTime, .1);
    if (shelf) shelf.gain.setTargetAtTime(soft ? -5 : -2, shelf.context.currentTime, .1);
    if (M.ac){ capRest(); ambience(); }
  } catch (e) {}
}, 250);

window.AUDIO87 = {barLog, ksCache, amb:() => amb};
})();
