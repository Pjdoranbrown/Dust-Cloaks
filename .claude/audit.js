// 3D replacement audit harness (not part of the game). Load with:
//   await new Promise(r => { const s = document.createElement('script'); s.src = '.claude/audit.js?' + Date.now(); s.onload = r; document.head.appendChild(s); });
(function(){
  const A = window.AUD = window.AUD || {};
  A.hits = A.hits || {}; A.scene = '-'; A.on = true; A.status = 'idle'; A.log = A.log || [];
  // Test muted: the in-app browser plays through the user's speakers. Mute in memory only;
  // when the game saves, the real volume settings are written, never the test's zeros.
  A.mute = function(){
    try {
      if (typeof META === 'undefined' || !META) return;
      const s = settings();
      if (!A._vol){
        let saved = null; try { saved = (JSON.parse(localStorage.getItem(SAVE_KEY) || 'null') || {}).settings; } catch (e) {}
        A._vol = saved && saved.volume !== undefined ? {volume:saved.volume, music:saved.music} : {volume:s.volume, music:s.music};   // the saved values, in case the page was already muted
        if (typeof saveMeta === 'function' && !saveMeta._muted){ const f = saveMeta;
          saveMeta = function(){ const t = settings(), v = {volume:t.volume, music:t.music}; Object.assign(t, A._vol); try { return f.apply(this, arguments); } finally { Object.assign(t, v); } };
          saveMeta._muted = true; } }
      s.volume = 0; s.music = 0;
      try { SFX.setVol(); } catch (e) {}
      try { if (MUS && MUS.setVol) MUS.setVol(); } catch (e) {}
    } catch (e) {}
  };
  A.mute();
  if (!A._muteTimer) A._muteTimer = setInterval(A.mute, 2000);   // a safety net
  // re-mute the instant a save is loaded (prologue slot, holding moves), not up to 2s later
  if (typeof loadMeta === 'function' && !loadMeta._muted){ const f = loadMeta; loadMeta = function(){ const r = f.apply(this, arguments); try { A._vol = null; A.mute(); } catch (e) {} return r; }; loadMeta._muted = true; }
  if (!window._origDI) window._origDI = CanvasRenderingContext2D.prototype.drawImage;
  const orig = window._origDI;
  const FRAME = /at (?:(\S+) )?\(?https?:\/\/localhost:\d+\/(?:index\.html)?(?:\?[^:]*)?:(\d+):\d+/;
  CanvasRenderingContext2D.prototype.drawImage = function(img, ...a){
    try {
      if (A.on && A.scene !== '-' && this.canvas === canvas && img && img.width){
        let sw, dw; if (a.length === 4){ sw = img.width; dw = a[2]; } else if (a.length === 8){ sw = a[2]; dw = a[6]; } else { sw = dw = 1; }
        const sc = Math.abs(dw / (sw || 1)) * Math.abs(this.getTransform().a);
        if (sc >= 1.8){
          const fr = new Error().stack.split('\n').slice(2).map(l => { const m = l.match(FRAME); return m ? {fn:(m[1] || '?').replace(/^Object\./, ''), ln:+m[2]} : null; }).filter(Boolean);
          if (!fr.some(f => /^(r3|w3|W3D|R3D)/.test(f.fn))){
            const key = fr.filter(f => f.fn !== 'blit' && f.fn !== 'drawSprite').slice(0, 3).map(f => f.fn + ':' + f.ln).join(' < ');
            const h = A.hits[key] || (A.hits[key] = {n:0, scenes:new Set(), size:img.width + 'x' + img.height, sc:sc.toFixed(1)});
            h.n++; h.scenes.add(A.scene);
          }
        }
      }
    } catch(e){}
    return orig.call(this, img, ...a);
  };
  // yield without background-tab timer throttling
  const mc = new MessageChannel(), q = []; mc.port1.onmessage = () => { const f = q.shift(); f && f(); };
  A.tick = () => new Promise(r => { q.push(r); mc.port2.postMessage(0); });
  A.dump = (filter) => Object.entries(A.hits).filter(([k, v]) => !filter || [...v.scenes].some(s => s.includes(filter)))
    .sort((a, b) => b[1].n - a[1].n).map(([k, v]) => `${v.n}\t${[...v.scenes].join(',')}\t${v.size}@${v.sc}\t${k}`).join('\n');

  A.campSweep = async function(label){
    CAMP.dirty = true;
    const W = CAMP_W, H = CAMP_H, pts = [], SX = Math.max(400, VW * 0.7), SY = Math.max(300, VH * 0.7);   // a hidden pane reports a 0x0 window
    for (let y = -60; y < H; y += SY) for (let x = -40; x < W; x += SX) pts.push([x, y]);
    A.scene = '-';
    for (let pass = 0; pass < 3; pass++) for (const [x, y] of pts){ CAMP.cam.x = x; CAMP.cam.y = y; for (let i = 0; i < 6; i++){ CAMP.t++; drawCamp(); await A.tick(); } }
    A.scene = label;
    for (const [x, y] of pts){ CAMP.cam.x = x; CAMP.cam.y = y; for (let i = 0; i < 3; i++){ CAMP.t++; drawCamp(); await A.tick(); } }
    A.scene = '-';
  };

  // Start a deployment, simulate it briefly, then sweep the camera over the whole map.
  A.contractSweep = async function(label, contract, opts = {}){
    const ids = META.roster.filter(p => !p.resting).slice(0, 5).map(p => p.id);
    A.scene = '-';
    startDeployment(contract, ids);
    if (!G) throw new Error('no deployment for ' + label);
    G.paused = false;
    for (let i = 0; i < (opts.ticks || 900); i++){ try { update(); } catch(e){ A.log.push(label + ' update: ' + e.message); break; } if (G.over) break; if (i % 60 === 0) await A.tick(); }
    if (!G) return;
    if (opts.setup) { try { opts.setup(G); } catch(e){ A.log.push(label + ' setup: ' + e.message); } }
    const L = G.leader, lx = L.x, ly = L.y;
    const W = MAP.w * CELL, H = MAP.h * CELL, pts = [], SX = Math.max(400, VW * 0.7), SY = Math.max(300, VH * 0.7);
    for (let y = SY / 2; y < H; y += SY) for (let x = SX / 2; x < W; x += SX) pts.push([x, y]);
    const at = async (n) => { for (const [x, y] of pts){ L.x = x; L.y = y; for (let i = 0; i < n; i++){ G.frame++; try { draw(); } catch(e){ A.log.push(label + ' draw: ' + e.message); return; } await A.tick(); } } };
    await at(4); await at(4);
    A.scene = label; await at(2); A.scene = '-';
    L.x = lx; L.y = ly;
    G.over = true; G = null;
  };

  A.run = function(fn){ A.status = 'running'; fn().then(() => A.status = 'done', e => { A.status = 'error: ' + e.message; A.log.push(e.stack); }); return 'started'; };
})();
