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

/* ============================================================================
   INDEX 84b - SQUAD SPACING, GAME FEEL AND IN-WORLD POLISH (J-06, J-08, J-09)
   J-06  slotTarget / updateMates / anchorFor
           Brace is a shoulder-to-shoulder arc in front of the Leader; squad mates
           keep 16px apart (they, never the Leader, are pushed, then collide()d
           off walls); camp people who share a role spot are spread round it.
   J-08  update / hurtEnemy / moveLeader
           dust at the feet when the squad charges, braces, and when the camp
           Leader sprints (construction dust already existed in drawSite);
           struck enemies are shoved 3.6px over 3 frames; optional hit-stop
           (setting "Hit-stop", off by default) of 1-2 frames on hits of 3+.
   J-09  gfxRing (one patch in draw()), camp speech bubbles, campLabel, shadow,
         w3dFire, w3dPlot
           ink-backed command ring, notched-corner parchment bubbles and
           labels, cast shadows fall lower-right (the light is upper-left, as
           in R3D_LIGHT), a warm light pool under the campfire, and empty
           plots fade when the Leader is far away.
   ROLLBACK  Delete from this comment to the end of this file and undo the
             "Index 84b" patch in draw() (command ring).
============================================================================ */
(function(){
'use strict';

/* ---- J-06: Brace as a line, and personal space ---------------------------------------- */
{ const f = slotTarget;
  slotTarget = function(i, n, shieldWall){
    if (!shieldWall) return f(i, n, shieldWall);
    const L = G.leader, fa = (typeof G.facing === 'number') ? G.facing : 0;
    const step = Math.min(22 / 34, 2.4 / Math.max(1, n - 1)), a = fa + (i - (n - 1) / 2) * step;
    return {x: L.x + Math.cos(a) * 34, y: L.y + Math.sin(a) * 30};
  };
}
const SEP_R = 16;
function sepMates(){
  const S = G.squad, L = G.leader; if (!S || !L) return;
  for (let i = -1; i < S.length; i++){
    const a = i < 0 ? L : S[i]; if (i >= 0 && a.state !== 'up') continue;
    for (let j = i + 1; j < S.length; j++){
      const b = S[j]; if (b.state !== 'up') continue;
      let dx = b.x - a.x, dy = (b.y - a.y) * 0.8, d = Math.hypot(dx, dy);   // vertical neighbours need more room: sprites are tall and the bar sits under the feet
      if (d >= SEP_R) continue;
      if (d < 0.01){ dx = (j % 2 ? 1 : -1); dy = 0.3; d = Math.hypot(dx, dy); }
      const p = Math.min(2.0, (SEP_R - d) * 0.35), mx = dx / d * p, my = dy / d * p / 0.8;
      if (i < 0){ b.x += mx; b.y += my; }
      else { a.x -= mx / 2; a.y -= my / 2; b.x += mx / 2; b.y += my / 2; }
      b.sep84 = 2; if (i >= 0) a.sep84 = 2;
    }
  }
  for (const m of S) if (m.sep84 > 0){ m.sep84--; if (m.state === 'up') collide(m, 9, true); }
}
{ const f = updateMates;
  updateMates = function(sw){ f(sw); try { if (G && !G.over){ sepMates(); sepMates(); } } catch (e) {} };   /* 84c: two passes, 2px cap */
}
// camp people who share a role spot (training yard, hospital, ...) stand in a small ring round it
{ const f = anchorFor;
  anchorFor = function(q, role){
    const a = f(q, role); if (!a || role === 'sit') return a;
    try {
      q._gax = a.x; q._gay = a.y; q._gar = role;
      let k = 0; const P = CAMP.people;
      for (let i = 0; i < P.length; i++){ const o = P[i]; if (o === q) break; if (o._gar === role && o.role === role && Math.abs(o._gax - a.x) < 10 && Math.abs(o._gay - a.y) < 10) k++; }
      if (k){ const ang = k * 2.4; a.x += Math.cos(ang) * (14 + 6 * (k >> 2)); a.y += Math.sin(ang) * 8; }
    } catch (e) {}
    return a;
  };
}

/* ---- J-08: dust, knock-back, optional hit-stop ----------------------------------------- */
const dustCol = () => { const s = seasonOf(); return s === 'winter' ? '#dfe6e6' : (SEASONS_CFG[s] || SEASONS_CFG.summer).dust2; };
function dust(x, y, n, spread, life){
  const c = dustCol();
  for (let i = 0; i < n; i++) G.fx.push({x: x + rnd(-spread, spread), y: y + rnd(-2, 2), vx: rnd(-0.5, 0.5), vy: rnd(-0.35, -0.1), life: life || 20, c, px: 2 + (i % 2)});
}
{ const f = update;
  update = function(){
    if (G && !G.over && !G.paused && G.hs84 > 0){ G.hs84--; return; }               // hit-stop: this frame does not advance
    f.apply(this, arguments);
    try {
      if (!G || G.over || G.paused) return;
      const L = G.leader;
      if (G.frame % 6 === 0 && G.chargeT > 0){
        if (L.moving && !L.down) dust(L.x, L.y + 15, 2, 5);
        for (const m of G.squad) if (m.state === 'up' && m.moving) dust(m.x, m.y + 15, 2, 5);
      }
      const sh = G.formation === 'SHIELD';
      if (sh && !G.sh84){ dust(L.x, L.y + 16, 4, 10, 24); for (const m of G.squad) if (m.state === 'up') dust(m.x, m.y + 16, 4, 10, 24); }
      G.sh84 = sh;
      for (const e of G.enemies){ const k = e.kb84; if (k && k.t > 0 && !e.dead){ e.x += k.x; e.y += k.y; collide(e, e.r * 0.7); k.t--; } }
    } catch (e) {}
  };
}
{ const f = hurtEnemy;
  hurtEnemy = function(e, n){
    try {
      if (G && e && !e.dead){
        const B = BESTIARY[e.k];
        if (B && !B.boss && B.arch !== 'fixed' && !e.dormant && !e.charging){
          let best = G.leader, bd = Math.hypot(e.x - best.x, e.y - best.y);
          for (const m of G.squad){ if (m.state !== 'up') continue; const d = Math.hypot(e.x - m.x, e.y - m.y); if (d < bd){ bd = d; best = m; } }
          const a = Math.atan2(e.y - best.y, e.x - best.x); e.kb84 = {x: Math.cos(a) * 1.2, y: Math.sin(a) * 1.2, t: 3};
        }
        if (n >= 3 && settings().hitstop) G.hs84 = Math.max(G.hs84 || 0, n >= 5 ? 2 : 1);
      }
    } catch (err) {}
    return f(e, n);
  };
}
// the Settings row (stored as META.settings.hitstop; off unless ticked)
{ const f = settingsHTML;
  settingsHTML = function(dark){
    const h = f(dark), box = `<label title="Freeze the action for a frame or two on big hits"><input type="checkbox" ${settings().hitstop ? 'checked' : ''} onchange="setSetting('hitstop', this.checked)"> Hit-stop</label>`;
    return h.includes('Screen shake</label>') ? h.replace('Screen shake</label>', 'Screen shake</label>\n    ' + box) : h;
  };
}
{ const f = moveLeader;
  moveLeader = function(q){
    f(q);
    try { if (q.moving && keys.shift && CAMP.t % 5 === 0){ const s = seasonOf(); CAMP.puffs.push({x: q.x + rnd(-4, 4), y: q.y + 14, vx: rnd(-0.25, 0.25), vy: -0.12, life: 30, c: s === 'winter' ? '#dfe6e6' : (SEASONS_CFG[s] || SEASONS_CFG.summer).dust2}); } } catch (e) {}
  };
}

/* ---- J-09: in-world overlay style ------------------------------------------------------- */
window.gfxRing = function(sw){
  const col = ctx.strokeStyle; ctx.save(); ctx.setLineDash([6, 8]);
  ctx.lineWidth = sw ? 5 : 4; ctx.strokeStyle = 'rgba(18,12,6,.3)'; ctx.stroke();      // a dark under-line so it reads on grass and stone
  ctx.lineWidth = sw ? 3 : 2; ctx.strokeStyle = col; ctx.stroke(); ctx.restore();
};
function inkBox(x, y, w, h, fill, edge, hl){
  x = Math.round(x); y = Math.round(y); w = Math.round(w); h = Math.round(h);
  ctx.fillStyle = edge; ctx.fillRect(x + 2, y - 2, w - 4, 2); ctx.fillRect(x + 2, y + h, w - 4, 2); ctx.fillRect(x - 2, y + 2, 2, h - 4); ctx.fillRect(x + w, y + 2, 2, h - 4);
  ctx.fillRect(x, y, 2, 2); ctx.fillRect(x + w - 2, y, 2, 2); ctx.fillRect(x, y + h - 2, 2, 2); ctx.fillRect(x + w - 2, y + h - 2, 2, 2);
  ctx.fillStyle = fill; ctx.fillRect(x + 2, y, w - 4, h); ctx.fillRect(x, y + 2, w, h - 4);
  if (hl){ ctx.fillStyle = hl; ctx.fillRect(x + 2, y, w - 4, 1); }
}
function bubble(x, y, w, text){
  const bx = x - w / 2, by = y - 18, tx = Math.round(x);
  inkBox(bx + 2, by + 3, w, 24, 'rgba(0,0,0,.2)', 'rgba(0,0,0,0)');                          // soft drop
  inkBox(bx, by, w, 24, '#ece0c4', '#3a2c1a', '#f7efd9');
  ctx.fillStyle = '#3a2c1a'; ctx.fillRect(tx - 4, by + 24, 8, 2); ctx.fillRect(tx - 3, by + 26, 6, 2); ctx.fillRect(tx - 2, by + 28, 4, 2);   // stepped tail
  ctx.fillStyle = '#ece0c4'; ctx.fillRect(tx - 2, by + 24, 4, 2); ctx.fillRect(tx - 1, by + 26, 2, 2);
  ctx.fillStyle = '#2a1a0a'; ctx.textAlign = 'center'; ctx.font = 'italic 13px Georgia'; ctx.fillText(text, x, y - 1, w - 10);
}
{ const f = drawCamp;
  drawCamp = function(){
    let hid = null;
    if (!G) for (const q of CAMP.people) if (q.bark){ (hid || (hid = [])).push(q, q.bark); q.bark = null; }   // the old bubble skips them
    const r = f.apply(this, arguments);
    if (G) return r;
    try {
      if (hid) for (let i = 0; i < hid.length; i += 2){ const q = hid[i]; if (!q.bark) q.bark = hid[i + 1]; if (q.bark === hid[i + 1]) q.barkLife--; }
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      for (const q of CAMP.people){
        if (!q.bark || !(q.barkLife > 0)) continue;
        const x = q.x - CAMP.cam.x, y = q.y - CAMP.cam.y - 62; if (x < -100 || x > VW + 100 || y < -40 || y > VH) continue;
        ctx.font = 'italic 13px Georgia'; const w = Math.min(260, ctx.measureText(q.bark).width + 16);
        ctx.globalAlpha = Math.min(1, q.barkLife / 30); bubble(x, y, w, q.bark); ctx.globalAlpha = 1;
      }
    } catch (e) { if (hid) for (let i = 0; i < hid.length; i += 2) if (!hid[i].bark) hid[i].bark = hid[i + 1]; }
    return r;
  };
}
campLabel = function(x, y, title, sub){
  ctx.font = 'bold 15px Georgia'; const w1 = ctx.measureText(title).width; ctx.font = '12px Georgia'; const w2 = ctx.measureText(sub).width;
  const w = Math.max(w1, w2) + 20;
  inkBox(x - w / 2, y - 40, w, 40, 'rgba(30,20,10,.92)', '#d4af37', 'rgba(255,233,176,.18)');
  ctx.textAlign = 'center'; ctx.fillStyle = '#ffe9b0'; ctx.font = 'bold 15px Georgia'; ctx.fillText(title, x, y - 22);
  ctx.fillStyle = '#cdbf9f'; ctx.font = '12px Georgia'; ctx.fillText(sub, x, y - 7);
};

/* ---- J-09: light direction. The 3D light comes from the upper left (R3D_LIGHT x < 0), so
   cast shadows now fall to the lower right, and the campfire throws a warm pool on the ground. */
{ const f = shadow;
  shadow = function(x, y, w){ return f(x + w * 0.2, y, w * 1.08); };
}
{ const f = w3dFire;
  w3dFire = function(x, y, t){
    try {
      if (!G && w3dOn()){
        const r = 96 + Math.sin(t / 5) * 4, g = ctx.createRadialGradient(x, y + 6, 8, x, y + 6, r);
        g.addColorStop(0, 'rgba(255,160,70,.2)'); g.addColorStop(1, 'rgba(255,160,70,0)');
        ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(x, y + 6, r, r * 0.55, 0, 0, TAU); ctx.fill(); ctx.restore();
      }
    } catch (e) {}
    return f(x, y, t);
  };
}
/* ---- J-09: camp plot clutter. Empty plots (sign and stakes) fade when the Leader is far away. */
{ const f = w3dPlot;
  w3dPlot = function(o){
    let a = 1;
    try {
      const Lq = CAMP.people.find(q => q.kind === 'leader');
      if (Lq && CAMP.ctrl){ const d = Math.hypot(Lq.x - o.x, Lq.y - o.y); a = d > 420 ? 0.5 : d > 260 ? 0.5 + (420 - d) / 160 * 0.5 : 1; }
      const hv = CAMP.hover; if (hv && hv.kind === o.kind && hv.id === o.id) a = 1;
    } catch (e) {}
    if (a >= 1) return f(o);
    ctx.save(); ctx.globalAlpha *= a; try { return f(o); } finally { ctx.restore(); }
  };
}
})();

/* ============================================================================
   INDEX 84c - FIXES FROM audits/graphics-r2.md
   GFX2-R1  Brace line against walls: the arc picks the first of eight centre
            angles whose slots are all free (the last choice is tried first, so
            it does not flip); Brace only falls back to the old ring if none is.
   GFX2-R2  mates overlapping while moving: two separation passes, 2px cap
            (edit to 84b's sepMates / updateMates wrapper, marked 84c).
   GFX2-R3  bar-fight mates far from the Leader: by design (they engage the nearest brawler); no change.
   R2-01    campLabel keeps the UX builder wording (Building the Tents / Dunstan
            . 1 season left . click for the site), drawn in the notched style.
   ROLLBACK delete from this comment to the end of the file.
============================================================================ */
(function(){
'use strict';
const blk = (x, y) => blockedXY(x, y) || blockedXY(x + 11, y) || blockedXY(x - 11, y) || blockedXY(x, y + 11) || blockedXY(x, y - 11);
const OFFS = [0, 0.785, -0.785, 1.571, -1.571, 2.356, -2.356, 3.142];
function braceAngle(L, fa, n){
  const B = G.br84 || (G.br84 = {t: -1, off: 0, key: ''}), key = n + ':' + Math.round(fa * 4) + ':' + (L.x / 20 | 0) + ':' + (L.y / 20 | 0);
  if (B.t === G.frame) return B.off;
  if (B.key === key && G.frame - B.t < 20) return B.off;   // keep the choice while nothing has changed
  const step = Math.min(22 / 34, 2.4 / Math.max(1, n - 1));
  const free = off => { for (let i = 0; i < n; i++){ const a = fa + off + (i - (n - 1) / 2) * step; if (blk(L.x + Math.cos(a) * 34, L.y + Math.sin(a) * 30)) return false; } return true; };
  let pick = null;
  if (free(B.off)) pick = B.off; else for (const o of OFFS) if (free(o)){ pick = o; break; }
  B.off = pick === null ? B.off : pick; B.none = pick === null; B.t = G.frame; B.key = key;
  return B.off;
}
{ const f = slotTarget;
  slotTarget = function(i, n, shieldWall){
    if (!shieldWall || (typeof isBrawl === 'function' && isBrawl())) return f(i, n, shieldWall);   // the bar fight keeps its own engage-the-nearest slots
    try {
      const L = G.leader, fa = (typeof G.facing === 'number') ? G.facing : 0, off = braceAngle(L, fa, n);
      if (G.br84.none) return f(i, n, shieldWall);                    // walled in on every side: the old full ring
      const step = Math.min(22 / 34, 2.4 / Math.max(1, n - 1)), a = fa + off + (i - (n - 1) / 2) * step;
      return {x: L.x + Math.cos(a) * 34, y: L.y + Math.sin(a) * 30};
    } catch (e) { return f(i, n, shieldWall); }
  };
}

/* ---- R2-01: the label, with the UX builder wording ---------------------------------------- */
{ const draw = campLabel;      // the 84b notched label
  campLabel = function(x, y, title, sub){
    if (typeof sub === 'string'){
      const m = sub.match(/^Builder: (.+?)(?:, (.+) left)?$/);
      if (m){ const site = m[1], left = m[2];
        return draw.call(this, x, y, site === 'a new building' ? 'Building something new' : 'Building the ' + site, `${title}${left ? ' \u00b7 ' + left + ' left' : ''} \u00b7 click for the site`); }
      if (sub === 'Resting') return draw.call(this, x, y, title, 'Resting \u00b7 sits out the next contract');
    }
    return draw.apply(this, arguments);
  };
}

/* GFX2-R3: nothing to fix. In the bar fight the squad deliberately walks to the nearest brawler
   (Index 72 slotTarget / updateMates wrappers), so mates 100-200px from the Leader are by design. */
})();
