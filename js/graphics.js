/* ============================================================================
   INDEX 84 - GRAPHICS QUICK WINS (from audits/graphics.md)
   Loaded after the main game script in index.html. Wrap game functions the
   same way the Index sections do:  { const f = fn; fn = function(){ ... }; }
   Each change: a short note here (what, why) and a ROLLBACK line.

   GFX-01  r3dChoose        walk and run frames advance with the real speed
   GFX-09  r3dDirFor        a new facing must hold for 3 frames before it shows
   GFX-03  pop              floating combat text steps up instead of stacking
   GFX-05  drawPuddleList   winter puddles are frozen (no ripple, cracks);
           drawCampRoads    the fort's winter roads get a muddy edge
   GFX-12  w3dTreeAt        trees drawn 20% larger
   GFX-13  simpleSprite/blit coins and gems drawn smaller
   GFX-15  gfxMateBar       bordered, colour-graded squad bar (one in-place
                            patch in draw(), marked Index 84)
   GFX-16  r3dCorpse        a soft shadow under 3D corpses
   GFX-08  r3dCorpse        no flat pixel corpse while the 3D death frames render
   ROLLBACK  Delete this file's contents (the game falls back to the Index 55-80
             behaviour) and undo the one "Index 84" patch in draw()'s mate loop.
============================================================================ */
(function(){
'use strict';
const now = () => (typeof G !== 'undefined' && G) ? G.frame : (typeof CAMP !== 'undefined' ? CAMP.t : 0);

/* ---- GFX-01: walk and run cadence follows how fast the unit really moves ------------------
   Was Math.floor(tick / 6) (walk) and tick / 4 (run): the legs ran at one rate whatever the
   speed, so units in snow, mud or a trap, or sprinting, slid. Now a per-unit phase advances by
   a rate that grows with the measured speed. At the Leader's normal pace it is close to the
   old rate, so nothing speeds up for free. */
{ const f = r3dChoose;
  r3dChoose = function(rec, u, frame, tick){
    const c = f(rec, u, frame, tick);
    try {
      const st = u && u._r3d;
      if (st && typeof u.x === 'number'){
        const t = now();
        if (st.gfT !== t){
          let d = (st.gx === undefined) ? 0 : Math.hypot(u.x - st.gx, u.y - st.gy);
          if (d > 14) d = 0;                                              // a teleport, not a step
          st.gx = u.x; st.gy = u.y; st.gfT = t;
          st.gs = (st.gs === undefined ? d : st.gs * 0.7 + d * 0.3);      // smoothed px per frame
          const run = c.clip === 'run';
          const rate = run ? Math.min(0.36, 0.07 + 0.06 * st.gs) : Math.min(0.30, 0.045 + 0.05 * st.gs);
          if (c.clip === 'walk' || c.clip === 'run') st.gph = (st.gph || 0) + rate;
        }
        if ((c.clip === 'walk' || c.clip === 'run') && st.gph !== undefined) c.i = Math.floor(st.gph) % 8;
      }
    } catch (e) {}
    return c;
  };
}

/* ---- GFX-09: a facing has to hold for three frames before it changes -----------------------
   Units pushed about by separation, wander wobble or slot corrections flip between
   neighbouring directions and shimmer. Eight directions are pre-rendered, so there is nothing
   to blend; this only filters one-frame flickers. */
{ const f = r3dDirFor;
  r3dDirFor = function(u){
    const st = f(u);
    try {
      if (st && typeof st.dir === 'number'){
        const t = now();
        if (st.hd === undefined){ st.hd = st.dir; st.hc = st.dir; st.hn = 0; st.ht = t; }
        else if (st.ht !== t){
          st.ht = t;
          if (st.dir === st.hd) st.hn = 0;
          else if (st.dir === st.hc){ if (++st.hn >= 3){ st.hd = st.dir; st.hn = 0; } }
          else { st.hc = st.dir; st.hn = 1; }
        }
        st.dir = st.hd;
      }
    } catch (e) {}
    return st;
  };
}

/* ---- GFX-03: floating text no longer stacks on one spot -----------------------------------
   pop() put every label at the unit's exact spot, so CRITICAL, MOMENTUM RANK and STEADY printed
   on top of each other. A new label now steps up 13px for each younger label near it. */
{ const f = pop;
  pop = function(x, y, text, c){
    f(x, y, text, c);
    try {
      const fx = G.fx, me = fx[fx.length - 1]; if (!me || me.text !== text) return;
      let k = 0;
      for (let i = fx.length - 2, n = 0; i >= 0 && n < 40; i--, n++){
        const o = fx[i]; if (o.text === undefined || o.life < 12) continue;
        const oy = o.y - (46 - o.life) * 0.7;
        if (Math.abs(o.x - me.x) < (String(o.text).length + String(text).length) * 2.8 && Math.abs(oy - me.y) < 12) k++;
      }
      if (k) me.y -= Math.min(4, k) * 13;
    } catch (e) {}
  };
}

/* ---- GFX-05: frozen puddles in winter, a muddy edge on the fort's winter roads ------------- */
{ const f = drawPuddleList;
  drawPuddleList = function(list, cx, cy){
    if (!list || !list.length || seasonOf() !== 'winter') return f(list, cx, cy);
    for (const p of list){
      if (p.x < cx - 60 || p.x > cx + VW + 60 || p.y < cy - 40 || p.y > cy + VH + 40) continue;
      const a = (p.seed || 1) * 2.399, rx = p.rx, ry = p.ry;
      ctx.save(); ctx.translate(Math.round(p.x), Math.round(p.y)); ctx.rotate(p.ang || 0);
      ctx.fillStyle = 'rgba(40,36,28,.55)'; ctx.beginPath(); ctx.ellipse(1, 2, rx + 3, ry + 2.5, 0, 0, TAU); ctx.fill();        // frozen mud rim
      ctx.fillStyle = '#c4d6de'; ctx.beginPath(); ctx.ellipse(0, 0, rx, ry, 0, 0, TAU); ctx.fill();                               // ice
      ctx.fillStyle = '#e6f0f3'; ctx.beginPath(); ctx.ellipse(-rx * 0.14, -ry * 0.16, rx * 0.66, ry * 0.58, 0, 0, TAU); ctx.fill();   // frost bloom
      ctx.strokeStyle = 'rgba(86,120,140,.75)'; ctx.lineWidth = 1; ctx.beginPath();                                               // two cracks
      for (let k = 0; k < 2; k++){ const t = a + k * 2.2, x1 = Math.cos(t) * rx * 0.9, y1 = Math.sin(t) * ry * 0.9; ctx.moveTo(x1 * 0.1, y1 * 0.1); ctx.lineTo(x1 * 0.5 + Math.sin(a) * 2, y1 * 0.5 - Math.cos(a)); ctx.lineTo(x1, y1); }
      ctx.stroke();
      ctx.fillStyle = '#ffffff'; ctx.fillRect(Math.round(-rx * 0.45), Math.round(-ry * 0.42), Math.max(2, Math.round(rx * 0.3)), 1);  // glint
      ctx.restore();
    }
  };
}
{ const f = drawCampRoads;
  drawCampRoads = function(){
    try {
      if (seasonOf() === 'winter' && typeof CAMP_LAYOUT !== 'undefined' && CAMP_LAYOUT.fort){
        ctx.save(); ctx.lineCap = 'square'; ctx.lineJoin = 'miter';
        for (const r of CAMP_LAYOUT.fort.roads){ ctx.beginPath(); ctx.moveTo(r.pts[0][0], r.pts[0][1]); for (const p of r.pts.slice(1)) ctx.lineTo(p[0], p[1]); ctx.strokeStyle = 'rgba(30,26,18,.5)'; ctx.lineWidth = r.w + 12; ctx.stroke(); }
        ctx.restore();
      }
    } catch (e) {}
    return f.apply(this, arguments);
  };
}

/* ---- GFX-12: trees 20% larger -------------------------------------------------------------
   Trees stood about 2.3 characters tall beside 3.5-character buildings. W3D.S is the world model
   scale (the same trick w3dMapProp uses for its o.scale). */
{ const f = w3dTreeAt;
  w3dTreeAt = function(t, frame, gl, alpha){
    const s0 = W3D.S; W3D.S = s0 * 1.2;
    try { return f(t, frame, gl, alpha); } finally { W3D.S = s0; }
  };
}

/* ---- GFX-13: coins and gems a little smaller (they were about half a torso) --------------- */
{ const f = simpleSprite;
  simpleSprite = function(key, w, h, draw, noOutline){
    const c = f(key, w, h, draw, noOutline);
    if (c && c._gk === undefined) c._gk = (/^coin[0-3]$/.test(key)) ? 0.79 : key === 'gem' ? 0.82 : 0;
    return c;
  };
  const b = blit;
  blit = function(img, x, y, s, flip, ax, ay){ return b(img, x, y, img && img._gk ? s * img._gk : s, flip, ax, ay); };
}

/* ---- GFX-15: squad bar (called from draw()'s mate loop) -----------------------------------
   Was bare 4x3 pips with no backing, hard to see on the floor. Now a dark plate, 4x4 pips that
   shift green, amber, red as Constitution falls. More than 8 pips becomes a bar. */
window.gfxMateBar = function(m){
  const n = m.maxCon, fr = Math.max(0, m.con) / n, col = fr > 0.6 ? '#6fd37a' : fr > 0.3 ? '#e0c050' : '#e0604a';
  const y = Math.round(m.y + 21);
  if (n > 8){
    const w = 40, x0 = Math.round(m.x - w / 2);
    ctx.fillStyle = 'rgba(8,6,4,.8)'; ctx.fillRect(x0 - 1, y - 1, w + 2, 6);
    ctx.fillStyle = col; ctx.fillRect(x0, y, Math.round(w * fr), 4); return;
  }
  const w = n * 5 - 1, x0 = Math.round(m.x - w / 2);
  ctx.fillStyle = 'rgba(8,6,4,.8)'; ctx.fillRect(x0 - 2, y - 2, w + 4, 8);
  for (let i = 0; i < n; i++){ ctx.fillStyle = i < m.con ? col : 'rgba(255,255,255,.14)'; ctx.fillRect(x0 + i * 5, y, 4, 4); }
};

/* ---- GFX-16 and GFX-08: corpses ------------------------------------------------------------
   Corpses are drawn with shadow:false and floated. Draw a soft shadow under them (fading with
   the corpse). The 3D death frames render in the background; until they are ready r3dCorpse
   returns false and the old flat rotated pixel sprite showed for a few frames. For kinds that
   do have 3D death clips, draw nothing for the first 24 frames instead of that pixel flash. */
{ const f = r3dCorpse;
  r3dCorpse = function(x){
    let drew = false;
    try {
      const B = BESTIARY[x.k];
      if (r3dOn() && B && B.arch !== 'fixed' && x.born !== undefined){
        const s = B.sc * 1.2, a = Math.min(1, x.life / 40) * 0.55, quad = typeof QUAD_KINDS !== 'undefined' && QUAD_KINDS.has(x.k);
        ctx.save(); ctx.globalAlpha = a; shadow(x.x, x.y + 7 * s, (quad ? 7 : 5) * s); ctx.restore();
      }
    } catch (e) {}
    const r = f(x);
    try {
      if (!r && r3dOn() && x.born !== undefined && G.frame - x.born < 24 && (ENEMY_LOOK[x.k] || (typeof QUAD_KINDS !== 'undefined' && QUAD_KINDS.has(x.k)) || (typeof R3D_SPECIAL !== 'undefined' && R3D_SPECIAL[x.k]))) return true;
    } catch (e) {}
    return r;
  };
}

/* ---- GFX-04: the unexplored (black) fog edge is softer ------------------------------------
   fogBlack() is one pixel per map cell, scaled up with smoothing, so the edge of the dark
   showed the cell grid. Its result is now blurred about one cell, once per change of the fog
   (not per frame), so the scale-up gives a smooth rim. */
if (typeof fogBlack === 'function' && typeof FOGK !== 'undefined'){
  const f = fogBlack, S = {c:null, src:null, w:0, h:0};
  fogBlack = function(){
    const was = FOGK.dirty, B = f();
    try {
      if (was || S.src !== B || S.w !== B.width || S.h !== B.height || !S.c){
        if (!S.c || S.w !== B.width || S.h !== B.height){ S.c = newCanvas(B.width, B.height); S.w = B.width; S.h = B.height; }
        const g = S.c.getContext('2d'); g.clearRect(0, 0, S.w, S.h);
        g.filter = 'blur(0.8px)'; g.drawImage(B, 0, 0); g.filter = 'none'; S.src = B;
      }
      return S.c;
    } catch (e) { return B; }
  };
}

/* ---- GFX-18 (seasonal particles): nothing to do. The "blue sparkles" are summer dragonflies and
   fireflies in drawSeasonOverlay; spring has pollen and bees, autumn leaves, winter rain streaks. */
})();
