/* ============================================================================
   INDEX 83 - UX QUICK WINS (from audits/ux.md)
   Loaded after the main game script in index.html. Wrap game functions the
   same way the Index sections do:  { const f = fn; fn = function(){ ... }; }
   Each change: a short note here (what, why) and a ROLLBACK line.

   UX-01  Settings: the title screen shows one SETTINGS button (the top-bar
          popover) instead of every control; the pause screen keeps Volume,
          Game speed, Momentum and Music and folds the rest under "More
          settings". The popover is grouped into Sound / Game / Display / Save.
   UX-02  First run (no Chapter yet): the prologue is the one gold button,
          "Skip the prologue: found a Chapter" is a small button under it.
   UX-04  Disabled primary buttons get a one-line reason under them; doctrine
          price buttons read "ADOPT · 100gp".
   UX-10  Prologue squad pick: icon chips with tooltips instead of
          "Con 6 · Mv 5 · M 2", a role word, and PICK A BALANCED FOUR.
   UX-11  Confirm dialogs for losing something (release, stand down, pull
          down, load over, start again, concede) get a red button with a verb,
          focus THINK AGAIN, and ENTER cancels ([1] confirms). STOP WORK on a
          construction site is an outlined secondary button.
   UX-12  campNote(msg, kind): kind 'good' / 'bad' / 'info' adds an icon and a
          coloured edge. Show tips again, Export save and Text size now say so.
   UX-13  Contract messages (bottom left) sit on a dark strip, 5 at most.
   UX-14  Below 1280px the top bar folds MANUAL / PORTRAITS / SETTINGS into a
          ☰ menu and the ledger chip shortens to "⚒ 2 · -40gp".
   UX-15  After 3 visits to the camp the hint strip shortens; ? shows the keys.
   UX-16  Construction bar: striped, labelled "Season k of N".
   UX-17  Visible keyboard focus everywhere; the volume and music pips are a
          focusable slider (arrow keys); custom checkboxes report their state.
   UX-18  Glyphs as well as colour: ▲ allied / ▼ hostile faction names, ✓ ~ ✗
          on dice faces.
   UX-19  While a Leader is being made (founding or prologue), the top bar
          shows only MANUAL and SETTINGS.
   G-UI-07 Builders' camp label: "Building the Tents" / "Dunstan · 1 season
          left · click for the site". Resting: "sits out the next contract".
   Gemini onboarding 3-5: a first-time Luck note in the Luck offer, a Wounds
          tip the first time the Leader loses a Wound, and a "Back in Varnholt"
          box on the first prologue debrief.
   ROLLBACK  Delete this file's <script> tag in index.html (or empty the file).
             Nothing in index.html was changed for Index 83.
============================================================================ */
(function(){
  const UX = window.UX83 = {hintOpen:false};
  const $q = (s, r) => (r || document).querySelector(s), $all = (s, r) => [...(r || document).querySelectorAll(s)];
  const safe = (name, fn) => { try { return fn(); } catch (e) { console.warn('Index 83 ' + name + ':', e); } };

  /* ---- styles ------------------------------------------------------------ */
  const st = document.createElement('style');
  st.textContent = `
  /* UX-17 focus */
  :focus-visible{outline:3px solid #ffd860 !important;outline-offset:2px}
  .dpips:focus-visible{outline-offset:3px}
  /* UX-01 settings sections */
  .ux-sec{margin:6px 0 2px;text-align:left}
  .ux-sech{font:bold 11px Georgia;letter-spacing:1.6px;text-transform:uppercase;opacity:.75;border-bottom:1px solid currentColor;padding-bottom:2px;margin-bottom:6px}
  .ux-secr{display:flex;flex-wrap:wrap;gap:10px 14px;align-items:center;justify-content:flex-start}
  #tb-settings{max-height:calc(100vh - 70px);overflow-y:auto}
  .ux-more{width:100%;max-width:820px;margin:8px auto 0}
  .ux-moreb{margin-top:6px}
  #overlay-pause{justify-content:safe center !important}
  #pause-map{max-height:calc(100vh - 470px);min-height:160px;width:auto;height:auto}
  /* UX-02 / UX-04 */
  .ux-why{font:italic 12.5px Georgia;color:#8b0000;margin:-2px 0 6px;text-align:center}
  .overlay-screen .ux-why,.splash-screen .ux-why{color:#ffb0a0}
  /* UX-10 chips */
  .ux-chips{display:flex;flex-wrap:wrap;gap:3px;margin-top:2px}
  .ux-chip{font:11.5px Georgia;background:rgba(74,59,42,.12);border:1px solid rgba(74,59,42,.45);border-radius:9px;padding:0 6px;white-space:nowrap;cursor:help}
  .ux-role{font:bold 10.5px Georgia;letter-spacing:1px;text-transform:uppercase;color:#7a3e26}
  /* UX-11 */
  #askbox .btn.ux-danger{background:#7a1e14;border-color:#3a0a04;color:#fff0e0}
  #askbox .btn.ux-danger:hover{background:#9a2a1c}
  #camp-panel .btn.ux-outline{background:transparent;color:#6a2a14;border:2px solid #7a3e26;box-shadow:none;font-size:13px;padding:6px}
  #camp-panel .btn.ux-outline:hover{background:rgba(122,62,38,.12);transform:none}
  /* UX-14 */
  #ux-tbmenu{position:fixed;top:52px;z-index:16;display:flex;flex-direction:column;gap:4px;padding:6px;background:linear-gradient(#4a3420,#2c1e12);border:2px solid #b8902a;box-shadow:0 6px 18px rgba(0,0,0,.6)}
  #ux-tbmenu .tb{background:#5a4028;border:2px solid #22160c;color:#f5ead2;font:bold 12px Georgia;padding:6px 12px;cursor:pointer;border-radius:3px;text-align:left}
  #ux-tbmenu .tb:hover{background:#7a5636}
  /* UX-19 */
  #topbar.ux-creating .tb:not(.ux-keep){display:none}
  /* UX-16 */
  .ux-bar{position:relative;margin:8px 0 2px;height:16px;background:rgba(0,0,0,.25);border:1px solid #4a3b2a;border-radius:3px;overflow:hidden}
  .ux-bar i{position:absolute;left:0;top:0;bottom:0;background:repeating-linear-gradient(45deg,#7a9a3a 0 8px,#93b24c 8px 16px);background-size:22.6px 22.6px;animation:uxstripe 1.2s linear infinite}
  .ux-bar span{position:relative;display:block;text-align:center;font:bold 11px/16px Georgia;color:#1a1a0a;text-shadow:0 0 3px rgba(255,250,230,.9)}
  @keyframes uxstripe{to{background-position:22.6px 0}}
  @media (prefers-reduced-motion:reduce){.ux-bar i{animation:none}}
  /* UX-18 */
  .fseal.ally .n::before{content:'\\25B2\\00a0';font-size:.8em}
  .fseal.host .n::before{content:'\\25BC\\00a0';font-size:.8em}
  .die b{position:relative}
  .die.success b::after,.die.partial b::after,.die.miss b::after{position:absolute;top:-8px;right:-8px;width:18px;height:18px;border-radius:50%;font:bold 12px/18px Georgia;color:#fff;box-shadow:0 1px 2px rgba(0,0,0,.5)}
  .die.success b::after{content:'\\2713';background:#1e5a24}
  .die.partial b::after{content:'~';background:#7a5a14}
  .die.miss b::after{content:'\\2717';background:#8b0000}
  /* onboarding */
  .ux-first{background:#fff3c4;color:#3a2a10;border:2px solid #b8902a;border-radius:4px;padding:6px 10px;margin:0 0 8px;font:13px/1.4 Georgia;text-align:left}
  .ux-town{background:rgba(255,250,232,.9);border:2px solid #7a5a2a;border-radius:4px;padding:8px 12px;margin:10px 0 4px;font-size:14px;line-height:1.45}
  .ux-town ul{margin:4px 0 4px 18px;padding:0}
  `;
  document.head.appendChild(st);

  /* ---- UX-01: settings grouped, off the splash and the pause screen ------- */
  const SEC = [['Sound', /^(Volume|Music|Effects)\b/], ['Save', /^(Export save|Import save|NEW CAMPAIGN|Restore a backup)/],
               ['Display', /Screen shake|Squad Leader look|^Retro|3D world|Sharp text|Text size|HUD size|Seasonal weather/], ['Game', /./]];
  function groupSettings(flex){
    if (!flex || flex.dataset.ux83) return; flex.dataset.ux83 = '1';
    const kids = [...flex.children], box = {};
    for (const c of kids){ const t = (c.textContent || '').replace(/^\s*X?\s*/, '').trim(); const s = SEC.find(([, re]) => re.test(t)); (box[s[0]] = box[s[0]] || []).push(c); }
    flex.style.display = 'block';
    for (const [name] of [['Sound'], ['Game'], ['Display'], ['Save']]){
      if (!box[name]) continue;
      const sec = document.createElement('div'); sec.className = 'ux-sec';
      sec.innerHTML = `<div class="ux-sech">${name}</div><div class="ux-secr"></div>`;
      box[name].forEach(c => sec.lastChild.appendChild(c)); flex.appendChild(sec);
    }
  }
  { const f = toggleSettings;
    toggleSettings = function(){
      const r = f.apply(this, arguments);
      safe('settings popover', () => { const p = $q('#tb-settings'); if (!p) return;
        const flex = p.firstElementChild, nc = $q('button[onclick^="resetSave"]', p);
        if (nc && flex){ nc.parentElement.remove(); nc.style.cssText = 'font-size:12px;padding:4px 10px'; flex.appendChild(nc); }
        groupSettings(flex); });
      return r;
    };
  }
  { const f = showSplash;
    showSplash = function(){
      const r = f.apply(this, arguments);
      safe('splash', () => {
        const ti = $q('#title-inner'); if (!ti) return;
        const setDiv = [...ti.children].find(d => d.tagName === 'DIV' && $q('input,select,.dpips', d));
        if (setDiv){ setDiv.innerHTML = '<button class="btn small" onclick="toggleSettings()">SETTINGS</button>'; setDiv.style.marginTop = '14px'; }
        // UX-02: first run, one recommended path
        if (!META.leader && !(typeof founded === 'function' && founded())){
          const found = $q('button[onclick="openFound()"]', ti), story = $q('button[onclick="openStory()"]', ti);
          if (found && story){
            story.className = 'btn gold'; story.textContent = 'START HERE: THE PROLOGUE';
            const note = story.previousElementSibling; if (note) note.textContent = 'The prologue teaches the game in a short story; the squad that survives becomes your Chapter.';
            found.className = 'btn small'; found.textContent = 'Skip the prologue: found a Chapter';
            story.after(document.createElement('br'), found);
            story.parentElement.style.textAlign = 'center';
          }
        }
      });
      return r;
    };
  }
  { const f = togglePause;
    togglePause = function(){
      const r = f.apply(this, arguments);
      safe('pause', () => {
        const ps = $q('#pause-settings'); if (!ps || !G || !G.paused) return;
        const flex = ps.firstElementChild; if (!flex || flex.dataset.uxp) return; flex.dataset.uxp = '1';
        const more = document.createElement('div'); more.className = 'ux-more hidden';
        const inner = document.createElement('div'); inner.style.cssText = flex.getAttribute('style') || ''; more.appendChild(inner);
        for (const c of [...flex.children]){ const t = (c.textContent || '').trim(); if (!/^(Volume|Game speed|Momentum|Music|Effects)\b/.test(t)) inner.appendChild(c); }
        const btn = document.createElement('button'); btn.className = 'btn small ux-moreb'; btn.textContent = 'More settings…';
        btn.onclick = () => { more.classList.toggle('hidden'); btn.textContent = more.classList.contains('hidden') ? 'More settings…' : 'Fewer settings'; };
        ps.appendChild(btn); ps.appendChild(more); groupSettings(inner);
      });
      return r;
    };
  }

  /* ---- UX-12: campNote kinds and feedback for silent actions -------------- */
  { const f = campNote;
    campNote = function(msg, kind){
      const r = f.apply(this, arguments);
      safe('campNote', () => { const el = $q('#camp-note'); if (!el) return;
        const K = {good:['✓', '#3a8a3a'], bad:['!', '#c0402a'], info:['i', '#d4af37']}[kind];
        el.style.borderLeft = K ? '7px solid ' + K[1] : '';
        if (K) el.textContent = K[0] + '  ' + msg; });
      return r;
    };
  }
  { const f = resetTips; resetTips = function(){ const r = f.apply(this, arguments); campNote('Tips will show again, the first time each one matters.', 'good'); return r; }; }
  { const f = exportSave; exportSave = function(){ const r = f.apply(this, arguments); campNote('Save file downloaded: look in your Downloads folder.', 'good'); return r; }; }
  { const f = setSetting;
    setSetting = function(k, v){
      const r = f.apply(this, arguments);
      if (k === 'textSize') campNote('Text size: ' + ({normal:'Normal', large:'Large', larger:'Larger'}[v] || v) + '.', 'info');
      return r;
    };
  }

  /* ---- UX-11: danger styling and a safe default ---------------------------- */
  const DANGER = /\b(release|stand down|stands down|pull down|replaced|erase|again from the beginning|new campaign|concede|abandon|delete|for good)\b/i;
  { const f = askConfirm;
    askConfirm = function(title, body, onYes, opts){
      opts = opts || {};
      const r = f.apply(this, arguments);
      safe('askConfirm', () => {
        if (opts.alert || !ASK) return;
        const text = String(title) + ' ' + String(body).replace(/<[^>]+>/g, ' ');
        if (!(opts.danger || DANGER.test(text))) return;
        ASK.danger = true;
        const box = $q('#askbox'), yes = $q('.btn.gold', box), no = yes && yes.nextElementSibling;
        if (!yes) return;
        yes.classList.remove('gold'); yes.classList.add('ux-danger');
        if (!opts.ok){
          const m = String(body).replace(/<[^>]+>/g, '').match(/^(Release|Pull down|Load|Start|Concede|Erase|Abandon|Delete)\b[^?.,:]{0,26}/) ||
                    String(title).match(/^(Release|Pull down|Load|Start|Concede|Erase|Abandon|Delete|Stand down)\b[^?.,:]{0,26}/);
          yes.textContent = m ? m[0].split(/\s+(?:from|to|and|for)\s+/)[0].trim().toUpperCase() : 'YES, DO IT';
        }
        const k = $q('.abk', box); if (k) k.textContent = '[1] confirm · [ENTER] or [ESC] cancel';
        if (no) setTimeout(() => { try { no.focus(); } catch (e) {} }, 0);
      });
      return r;
    };
  }
  { const f = askClose;
    askClose = function(yes){
      const ev = window.event;
      if (yes && ASK && ASK.danger && ev && ev.type === 'keydown' && ev.key === 'Enter') yes = false;
      return f.call(this, yes);
    };
  }

  /* ---- UX-16 + UX-11: the construction panel ------------------------------ */
  { const f = sitePanelHTML;
    sitePanelHTML = function(P){
      let h = f.apply(this, arguments);
      safe('site panel', () => {
        const b = buildRec(P.id), need = Math.max(1, b.need || 1), k = Math.min(need, Math.max(1, (buildNow() - b.start) + 1));
        const pct = Math.max(6, Math.round(((k - 1) + 0.5) / need * 100));
        h = h.replace(/<div style="margin:8px 0;height:12px[^]*?<\/div><\/div>/, `<div class="ux-bar" title="Building: season ${k} of ${need}"><i style="width:${pct}%"></i><span>Season ${k} of ${need}</span></div>`)
             .replace('<button class="btn small" onclick="cancelBuild', '<button class="btn small ux-outline" onclick="cancelBuild');
      });
      return h;
    };
  }

  /* ---- G-UI-07: the builder's camp label ----------------------------------- */
  { const f = campLabel;
    campLabel = function(x, y, title, sub){
      if (typeof sub === 'string'){
        const m = sub.match(/^Builder: (.+?)(?:, (.+) left)?$/);
        if (m){ const site = m[1], left = m[2];
          return f.call(this, x, y, site === 'a new building' ? 'Building something new' : 'Building the ' + site,`${title}${left ? ' · ' + left + ' left' : ''} · click for the site`); }
        if (sub === 'Resting') return f.call(this, x, y, title, 'Resting · sits out the next contract');
      }
      return f.apply(this, arguments);
    };
  }

  /* ---- UX-04: why it is disabled; doctrine verbs --------------------------- */
  function uxWhy(root){
    if (!root) return;
    $all('button.btn:disabled', root).forEach(b => {
      if (b.nextElementSibling && b.nextElementSibling.classList.contains('ux-why')) return;
      const t = b.textContent.trim(); let why = '';
      let m;
      if ((m = t.match(/^THESE FOUR \((\d) \/ 4\)/))) why = `Choose ${4 - +m[1]} more.`;
      else if (/^CONTINUE/.test(t)){ const h = $q('h1', root); why = h ? h.textContent.trim().replace(/\s+/g, ' ') + ' to continue.' : 'Make a choice above to continue.'; }
      else if (/^(NEXT|TAKE THE CHAIR)/.test(t)){ const h = $q('h1', root), ht = h ? h.textContent : '';   /* Index 83c */
        why = /Ambition/i.test(ht) ? 'Choose an Ambition to continue.' : /Chair/i.test(ht) ? 'Choose who sits in the chair to continue.' : /Holding/i.test(ht) ? 'Choose a holding to continue.' : 'Make a choice above to continue.'; }
      else if (b.title) why = b.title;
      if (!why) return;
      const d = document.createElement('div'); d.className = 'ux-why'; d.textContent = why; b.after(d);
    });
  }
  function doctrineVerbs(){
    $all('#tbl-doctrines button').forEach(b => { const t = b.textContent.trim(); if (/^\d+gp$/.test(t)) b.textContent = 'ADOPT · ' + t; });
  }
  const afterWhy = (f, sel, extra) => function(){ const r = f.apply(this, arguments); safe('why ' + sel, () => { uxWhy($q(sel)); if (extra) extra(); }); return r; };
  renderCreate = afterWhy(renderCreate, '#create-inner');
  renderFound = afterWhy(renderFound, '#create-inner');
  renderPanel = afterWhy(renderPanel, '#camp-panel');
  renderTable = afterWhy(renderTable, '#table-inner', doctrineVerbs);

  /* ---- UX-10: the prologue squad pick ------------------------------------- */
  const CHIP = [['con', 'Con', 'Condition: how much punishment they take before going down'], ['move', 'Mv', 'Move: walking speed'],
                ['melee', 'Melee', 'Melee skill die'], ['ranged', 'Ranged', 'Ranged skill die'], ['magic', 'Magic', 'Magic skill die (casters)']];
  function chipsHTML(r){
    const s = mateStats(r), caster = SPECS[r.spec].caster;
    return '<span class="ux-chips">' + CHIP.filter(c => c[0] !== 'magic' || caster).map(([k, l, tip]) => `<span class="ux-chip" title="${tip}">${l} ${s[k]}</span>`).join('') + '</span>';
  }
  window.uxBalancedFour = function(){
    const C = CP(); if (!C || !C.offer) return;
    const order = ['CLERIC', 'SOLDIER', 'FOLK_HERO', 'MAGE', 'WITCH', 'SCOUNDREL'], lead = META.leader ? META.leader.spec : null;
    const idx = C.offer.map((r, i) => i), pick = [], used = new Set();
    for (const pass of [0, 1]) for (const sp of order){
      if (pick.length >= 4) break; if (pass === 0 && (sp === lead || used.has(sp))) continue; if (pass === 1 && used.has(sp)) continue;
      const cand = idx.filter(i => !pick.includes(i) && C.offer[i].spec === sp).sort((a, b) => mateStats(C.offer[b]).con - mateStats(C.offer[a]).con)[0];
      if (cand != null){ pick.push(cand); used.add(sp); }
    }
    idx.filter(i => !pick.includes(i)).sort((a, b) => mateStats(C.offer[b]).con - mateStats(C.offer[a]).con).forEach(i => { if (pick.length < 4) pick.push(i); });
    C.pick = pick; SFX.play('pick'); renderPanel();
  };
  { const f = storyMusterHTML;
    storyMusterHTML = function(){
      let h = f.apply(this, arguments);
      safe('squad pick', () => {
        const C = CP();
        (C.offer || []).forEach(r => {
          const line = `<span style="font-size:11.5px">${mateLine(r)}</span>`;
          h = h.replace(line, chipsHTML(r));
          const who = `${RACES[r.race].name} ${CLASSES[r.cls].name} ${SPECS[r.spec].name}<br>`;
          h = h.replace(`<b>${esc(r.name)}</b><br>${who}`, `<b>${esc(r.name)}</b> <span class="ux-role">${SPECS[r.spec].role}</span><br>${who}`);
        });
        h = h.replace('<button class="btn small" onclick="CP().offer=null', '<button class="btn small" onclick="uxBalancedFour()">PICK A BALANCED FOUR</button><button class="btn small" onclick="CP().offer=null');
      });
      return h;
    };
  }

  /* ---- UX-14 + UX-19: the top bar ----------------------------------------- */
  function closeTbMenu(){ const m = $q('#ux-tbmenu'); if (m) m.remove(); }
  window.uxTbMenu = function(btn){
    if ($q('#ux-tbmenu')) return closeTbMenu();
    const m = document.createElement('div'); m.id = 'ux-tbmenu';
    (UX.folded || []).forEach(b => { const c = b.cloneNode(true); c.addEventListener('click', closeTbMenu); m.appendChild(c); });
    document.body.appendChild(m);
    const r = btn.getBoundingClientRect(); m.style.right = Math.max(8, window.innerWidth - r.right) + 'px';
  };
  document.addEventListener('mousedown', e => { const m = $q('#ux-tbmenu'); if (m && !m.contains(e.target) && e.target.id !== 'ux-tbmenu-btn') closeTbMenu(); });
  { const f = renderTopbar;
    renderTopbar = function(){
      const r = f.apply(this, arguments);
      safe('topbar', () => {
        const tb = $q('#topbar'); if (!tb) return; closeTbMenu();
        const btns = $all('button.tb', tb), byText = re => btns.filter(b => re.test(b.textContent.trim()));
        byText(/^(MANUAL|SETTINGS)$/).forEach(b => b.classList.add('ux-keep'));
        const creating = !$q('#screen-create').classList.contains('hidden');
        tb.classList.toggle('ux-creating', creating);
        UX.folded = [];
        if (window.innerWidth < 1280 && !creating){
          const fold = byText(/^(MANUAL|PORTRAITS|SETTINGS)$/);
          if (fold.length > 1){
            UX.folded = fold; fold.forEach(b => b.remove());
            const mb = document.createElement('button'); mb.className = 'tb ux-keep'; mb.id = 'ux-tbmenu-btn'; mb.textContent = '☰'; mb.title = 'Manual, Portraits, Settings';
            mb.setAttribute('aria-label', 'More: Manual, Portraits, Settings'); mb.onclick = () => uxTbMenu(mb); tb.appendChild(mb);
          }
          const chip = [...tb.querySelectorAll('span.stat')].find(s => /^Ledger:/.test(s.textContent.trim()));
          if (chip){ const n = (chip.textContent.match(/(\d+) building/) || [])[1], up = (chip.textContent.match(/upkeep\s*(-?\d+gp)/) || [])[1];
            chip.innerHTML = `⚒ ${n ? `<b>${n}</b> · ` : ''}<b>${up || ''}</b>`; chip.setAttribute('aria-label', 'Ledger: works and upkeep'); }
        }
      });
      return r;
    };
  }
  let rsT = 0;
  window.addEventListener('resize', () => { clearTimeout(rsT); rsT = setTimeout(() => { try { if (!G && !$q('#topbar').classList.contains('hidden')) renderTopbar(); } catch (e) {} }, 150); });

  /* ---- UX-15: the camp hint strip ----------------------------------------- */
  const SHORT_HINT = 'WASD walks your Squad Leader · click buildings, plots and people · press ? for the camp keys';
  { const f = hint81;
    hint81 = function(){
      const r = f.apply(this, arguments);
      const h = $q('#camp-hint'); if (!h) return r;
      const story = typeof inStoryNow === 'function' && inStoryNow();
      if (story || !META || (META.deployments || 0) < 3) return r;   /* Index 83c: after three contracts, not three redraws */
      if (UX.hintOpen){ if (h.textContent === SHORT_HINT){ h.dataset.i81 = ''; f.apply(this, arguments); } }
      else if (h.textContent !== SHORT_HINT) h.textContent = SHORT_HINT;
      return r;
    };
  }
  window.addEventListener('keydown', e => {
    if (e.key !== '?' || G) return;
    const t = e.target; if (t && /INPUT|TEXTAREA|SELECT/.test(t.tagName)) return;
    if (!$q('#screen-title').classList.contains('hidden')) return;
    UX.hintOpen = !UX.hintOpen; try { hint81(); } catch (err) {}
  });

  /* ---- UX-17: keyboard for the custom controls ---------------------------- */
  { const f = enhanceControls;
    enhanceControls = function(root){
      const r = f.apply(this, arguments);
      safe('controls', () => {
        $all('.dpips:not([tabindex])', root).forEach(p => {
          const inp = p.previousElementSibling; if (!inp || inp.type !== 'range') return;
          const min = +inp.min || 0, max = +inp.max || 100, step = (max - min) / 10;
          const lab = (p.closest('label') ? p.closest('label').textContent : 'Level').trim();
          p.tabIndex = 0; p.setAttribute('role', 'slider'); p.setAttribute('aria-label', lab); p.setAttribute('aria-valuemin', min); p.setAttribute('aria-valuemax', max);
          const paint = () => { [...p.children].forEach((c, i) => c.className = (i + 1) / 10 <= (inp.value - min) / (max - min) + 1e-6 ? 'on' : ''); p.setAttribute('aria-valuenow', inp.value); };
          paint(); p.addEventListener('click', () => setTimeout(paint, 0));
          p.addEventListener('keydown', e => {
            let v = +inp.value;
            if (e.key === 'ArrowRight' || e.key === 'ArrowUp') v = Math.min(max, v + step);
            else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') v = Math.max(min, v - step);
            else if (e.key === 'Home') v = min; else if (e.key === 'End') v = max; else return;
            e.preventDefault(); e.stopPropagation(); inp.value = v; paint(); inp.dispatchEvent(new Event('input', {bubbles:true}));
          });
        });
        $all('.dchk:not([role])', root).forEach(b => {
          const c = b.previousElementSibling; b.setAttribute('role', 'checkbox');
          const sync = () => b.setAttribute('aria-checked', c && c.checked ? 'true' : 'false'); sync(); b.addEventListener('click', () => setTimeout(sync, 0));
        });
      });
      return r;
    };
  }

  /* ---- UX-13: a panel behind the contract messages ------------------------ */
  { const f = drawHUD;
    drawHUD = function(){
      if (!G || !G.msgs){ return f.apply(this, arguments); }
      const ms = G.msgs; G.msgs = [];
      try { f.apply(this, arguments); } finally {
        const added = G.msgs; G.msgs = ms;
        safe('messages', () => {
          const show = ms.slice(0, 5);
          if (show.length){
            ctx.save(); ctx.textAlign = 'left'; ctx.font = '13px Georgia';
            const w = Math.min(VW - 40, Math.max(...show.map(m => ctx.measureText(m.t).width)) + 20);
            const top = VH - 216 - (show.length - 1) * 17 - 15, a = Math.min(1, Math.max(...show.map(m => m.life)) / 60);
            ctx.globalAlpha = Math.max(0, a) * 0.72; ctx.fillStyle = '#140e08';
            if (ctx.roundRect){ ctx.beginPath(); ctx.roundRect(14, top, w, (VH - 216 + 7) - top, 4); ctx.fill(); } else ctx.fillRect(14, top, w, (VH - 216 + 7) - top);
            show.forEach((m, i) => { ctx.globalAlpha = Math.max(0, Math.min(1, m.life / 60)); ctx.fillStyle = '#000'; ctx.fillText(m.t, 25, VH - 215 - i * 17); ctx.fillStyle = '#f0e6d2'; ctx.fillText(m.t, 24, VH - 216 - i * 17); });
            ctx.restore();
          }
          ms.forEach(m => m.life--);
          G.msgs = ms.filter(m => m.life > 0).concat(added);
        });
        // Gemini onboarding 4: the first lost Wound
        safe('wounds tip', () => { const L = G.leader; if (!L) return;
          if (UX.wG === G && UX.w != null && L.wounds < UX.w && !L.down) tip('wounds');
          UX.wG = G; UX.w = L.wounds; });
      }
    };
  }

  /* ---- Gemini onboarding 3 and 4: the tips -------------------------------- */
  TIPS.wounds = 'A Wound lost. Hits take Wards, then Shield, then Wounds: at 0 the Leader is down. Healing and Poultices restore them.';
  TIPS.luck = 'Luck: SPEND 1 (Q) to roll this again; it comes back with Momentum and rest. BURN 1 (R) for an automatic success; it lowers your maximum Luck for good.';
  { const f = luckPanelHTML;
    luckPanelHTML = function(job){
      let h = f.apply(this, arguments);
      safe('luck tip', () => { META.tipsSeen = META.tipsSeen || {};
        if (META.tipsSeen.luck || settings().tips === false) return;
        META.tipsSeen.luck = true; saveMeta();
        h = h.replace('<div class="dt-luck" onclick="event.stopPropagation()">', `<div class="dt-luck" onclick="event.stopPropagation()"><div class="ux-first"><b>First failed roll?</b> ${TIPS.luck}</div>`); });
      return h;
    };
  }

  /* ---- Gemini onboarding 5: back in town after the first prologue fight ---- */
  const TOWN = `<div class="ux-town"><b>Back in Varnholt.</b> Three things to watch now the first fight is over:<ul>
    <li><b>Supply</b> (top bar): the town eats every morning; the Mill and the Scrounge order bring more in. The Morning Report shows the sums.</li>
    <li><b>The hurt</b> rest and sit out the next fight. The Tend the Wounded order makes every resting Squad Mate fit at once.</li>
    <li><b>Condition</b> (green pips) is each model's own toughness: hits outside the Command Radius, or after the Leader's Wounds, take it. At 0 a Squad Mate is Bleeding Out.</li></ul>
    Spend the day's Work Orders in the Reeve's Hall, then ring the bell.</div>`;
  { const f = renderDebrief;
    renderDebrief = function(head, lines){
      safe('back in town', () => {
        if (!(typeof inStoryNow === 'function' && inStoryNow()) || !META || !Array.isArray(lines)) return;
        const key = String(head || '').replace(/<[^>]+>/g, '').slice(0, 80);
        if (!META.uxTown){ META.uxTown = key || 'first'; saveMeta(); }
        if (META.uxTown === (key || 'first') && !lines.some(l => typeof l === 'string' && l.indexOf('ux-town') >= 0)) lines = lines.concat([TOWN]);
      });
      return f.call(this, head, lines);
    };
  }
})();
/* ===== END INDEX 83 ======================================================= */

/* ============================================================================
   INDEX 83b - UX ROUND 2 (J-03, J-04, J-05, J-07, J-11, J-12)
   J-03  Planning table: a sticky footer (contract, pay, squad n / 5, SIGN AND
         MARCH, with the reason when it is off), the right column as tabs
         (Ambition, Factions, Doctrines, Rivals, Prisoners), and opening the
         table (P) lands on Contracts.
   J-04  The contract HUD scales with the window: HUDK = clamp(VH/760, 1, 1.6)
         x text size (Auto), or a fixed 100 / 125 / 150% (Settings > Display >
         HUD size). The HUD is drawn in a scaled coordinate frame, so every
         overlay inside drawHUD (alerts, carried items, braziers, Momentum
         cards, messages) follows. Small grey print is brightened.
   J-05  Leader card: rows in the order damage takes them (Wards, Shield,
         Mount, Wounds, then Condition and Luck), each with n/max, shaped pips
         (Ward diamond, Shield square, Wounds circle, Luck triangle) and a red
         flash when the row loses a pip. Filled = what is left.
   J-07  Rolling backups: on each season change the campaign is copied into
         three rotating slots (<save>_bk1..3); Settings > Save > "Restore a
         backup..." lists them. Main campaign only; the prologue slot and its
         hand-over are never touched.
   J-11  A squad portrait strip under the leader card (N hides it): a bust and
         a Condition bar per Squad Mate, red X when down.
   J-12  Plain one-line summaries on the six Specialty cards, the armour and
         shield cards and the doctrines, with the rules text under "Details".
   ROLLBACK  Delete from this comment to END INDEX 83b (nothing else changed).
============================================================================ */
(function(){
  const UX = window.UX83 = window.UX83 || {};
  const $q = (s, r) => (r || document).querySelector(s), $all = (s, r) => [...(r || document).querySelectorAll(s)];
  const safe = (name, fn) => { try { return fn(); } catch (e) { console.warn('Index 83b ' + name + ':', e); } };
  const esc2 = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;'}[c]));
  const css = document.createElement('style');
  css.textContent = `
  /* J-03 */
  .ux-tabs{display:flex;flex-wrap:wrap;gap:4px;margin:14px 8px 0;padding:0 4px;border-bottom:3px solid #1a0e06;position:relative;z-index:2}
  .ux-tabs button{font:bold 14px Georgia;font-variant:small-caps;color:#f0e6d2;background:linear-gradient(#6e4e2c,#4a3018);border:2px solid #24160a;border-bottom:none;border-radius:6px 6px 0 0;padding:6px 14px;cursor:pointer;margin:0}
  .ux-tabs button:hover{background:linear-gradient(#8a6238,#5a3a1c)}
  .ux-tabs button.on{background:#d8c9a8;color:#3a2a1a;transform:translateY(3px)}
  #ux-foot{position:sticky;bottom:0;z-index:6;max-width:1320px;margin:16px auto 0;box-sizing:border-box;display:flex;flex-wrap:wrap;align-items:center;gap:6px 18px;
    padding:8px 16px;background:linear-gradient(#3a2414,#22140a);border:2px solid #b8902a;border-radius:4px;box-shadow:0 -6px 16px rgba(0,0,0,.55);color:#f0e6d2;font-family:Georgia}
  #ux-foot .fc{flex:1 1 220px;min-width:0}
  #ux-foot .fc small,#ux-foot .fs small{display:block;font-size:11px;letter-spacing:1.2px;text-transform:uppercase;opacity:.75}
  #ux-foot .fc b{display:block;font-size:17px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  #ux-foot .fs{flex:0 0 auto;text-align:center}
  #ux-foot .fs b{font-size:17px}
  #ux-foot .btn{margin:0;padding:9px 22px;font-size:16px}
  #ux-foot .fw{flex:1 0 100%;font:italic 12.5px Georgia;color:#ffb0a0;margin:0}
  #ux-foot .fn{flex:1 0 100%;font:italic 12.5px Georgia;color:#e8d8b0;margin:0}
  /* J-07 */
  #ux-bk{position:fixed;inset:0;z-index:220;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.7)}
  #ux-bk .bx{width:min(560px,94vw);max-height:86vh;overflow:auto;background:var(--parch,#d8c9a8);border:3px solid #3a2a1a;box-shadow:0 0 0 2px #8a6a3a inset,0 16px 40px rgba(0,0,0,.7);padding:18px 22px;font-family:Georgia;color:#2a2520}
  #ux-bk h2{margin:0 0 6px;font-variant:small-caps;font-size:26px;border-bottom:3px double #4a3b2a}
  #ux-bk .brow{display:flex;gap:10px;align-items:center;border-top:1px solid #c9bba4;padding:7px 0;font-size:14px}
  #ux-bk .brow .g{flex:1}
  #ux-bk .brow small{display:block;color:#6a5a44;font-size:12px}
  /* J-12 */
  .ux-plain{font:italic 13px/1.35 Georgia;color:#3a2a1a;margin:3px 0 4px;text-align:center}
  .line .ux-plain,.ledger .ux-plain{text-align:left}
  details.ux-det{margin-top:3px;text-align:left}
  details.ux-det summary{cursor:pointer;font:bold 11.5px Georgia;color:#7a3e26;list-style:none}
  details.ux-det summary::before{content:'\\25B8 '}
  details.ux-det[open] summary::before{content:'\\25BE '}
  details.ux-det summary::-webkit-details-marker{display:none}
  `;
  document.head.appendChild(css);

  /* ---- J-03: planning table ------------------------------------------------ */
  const TABS = [['ambition', 'Ambition'], ['factions', 'Factions'], ['doctrines', 'Doctrines'], ['rivals', 'Rivals'], ['ledger', 'Prisoners']];
  UX.tab = UX.tab || 'ambition';
  function tableExtras(){
    const inner = $q('#table-inner'); if (!inner || !META || !META.leader) return;
    const grid = $q('.table-grid', inner); if (!grid || grid.children.length < 2) return;
    const col = grid.children[1];
    $all('.ux-tabs', col).forEach(e => e.remove());
    const bar = document.createElement('div'); bar.className = 'ux-tabs'; bar.setAttribute('role', 'tablist');
    const np = (META.prisoners || []).length;
    const show = id => { UX.tab = id; TABS.forEach(([t]) => { const el = $q('#tbl-' + t, col); if (el) el.style.display = t === id ? '' : 'none'; });
      $all('button', bar).forEach(b => { const on = b.dataset.tab === id; b.classList.toggle('on', on); b.setAttribute('aria-selected', on); }); };
    TABS.forEach(([id, label]) => { const b = document.createElement('button'); b.type = 'button'; b.dataset.tab = id; b.setAttribute('role', 'tab');
      b.textContent = label + (id === 'ledger' && np ? ' (' + np + ')' : ''); b.onclick = () => { SFX.play('pick'); show(id); }; bar.appendChild(b); });
    col.insertBefore(bar, col.firstChild); show(TABS.some(t => t[0] === UX.tab) ? UX.tab : 'ambition');
    // sticky footer
    $all('#ux-foot', inner).forEach(e => e.remove());
    const sel = META.board && META.board[MU.contract]; if (!sel) return;
    const over = META.roster.length > rosterCap();
    const foot = document.createElement('div'); foot.id = 'ux-foot';
    const pay = sel.pay + 'gp' + (sel.edges && sel.edges.includes('terms') ? ' +20%' : '');
    const title = sel.title || OBJECTIVES[sel.obj].name, n = MU.ids.length;
    let note = '';
    if (!sel.council) note = 'The War Council has not been rolled: you can still march on the terms as they stand.';
    else if (sel.picks > 0) note = 'You can still choose ' + sel.picks + ' Contract Edge' + (sel.picks > 1 ? 's' : '') + ' above.';
    else if (!n) note = 'Your Leader marches alone. Pick Squad Mates in Who Marches.';
    foot.innerHTML = `<div class="fc"><small>Contract</small><b title="${esc2(title)}">${esc2(title)}</b></div>
      <div class="fs"><small>Pay</small><b>${pay}</b></div><div class="fs"><small>Squad</small><b>${n} / 5</b></div>
      <button class="btn gold" ${over ? 'disabled' : ''} onclick="deploy()">SIGN AND MARCH</button>
      ${over ? `<p class="fw">Roster over capacity (${META.roster.length} / ${rosterCap()}): release someone first.</p>` : note ? `<p class="fn">${esc2(note)}</p>` : ''}`;
    inner.appendChild(foot);
  }
  { const f = renderTable; renderTable = function(){ const r = f.apply(this, arguments); safe('table', tableExtras); return r; }; }
  { const f = openTable;
    openTable = function(focus){
      if (focus && TABS.some(t => t[0] === focus)) UX.tab = focus;
      const r = f.apply(this, arguments);
      safe('table top', () => { if (!focus){ const s = $q('#screen-table'); if (s) s.scrollTop = 0; } });
      return r;
    };
  }

  /* ---- J-04: the HUD scales with the window ---------------------------------- */
  const hudSet = () => { try { return settings().hudSize || 'auto'; } catch (e) { return 'auto'; } };
  function hudK(){
    const s = hudSet(), ts = typeof textScale === 'function' ? textScale() : 1;   /* Index 83c: text size multiplies the panel scale; fonts inside are not scaled again */
    const base = s === 'auto' ? Math.min(1.6, Math.max(1, VH / 760)) : (+s || 100) / 100;
    return Math.max(0.75, Math.min(base * ts, VW / 1000, VH / 620, 2));   // never wider than the 1000 x 620 design layout
  }
  UX.hudK = hudK;
  const FILL = Object.getOwnPropertyDescriptor(CanvasRenderingContext2D.prototype, 'fillStyle');
  const BRIGHT = {'#aaa':'#d6cbb6', '#aaaaaa':'#d6cbb6', '#c8bca8':'#e8dfcb', '#cdbf9f':'#e6dcc3', '#bbb':'#e0d8c6', '#bbbbbb':'#e0d8c6'};
  function hookFill(){
    if (!ctx || ctx.__ux83f) return; ctx.__ux83f = true;
    Object.defineProperty(ctx, 'fillStyle', {configurable:true, get(){ return FILL.get.call(this); },
      set(v){ if (UX.inHud && typeof v === 'string' && BRIGHT[v]) v = BRIGHT[v]; FILL.set.call(this, v); }});
  }
  { const f = drawSeasonOverlay;       // the weather is not HUD: draw it in the true frame
    drawSeasonOverlay = function(cx, cy, w, h, t, mode){
      if (!UX.inHud || !(UX.k > 1.001 || UX.k < 0.999) || !G || !G.leader) return f.apply(this, arguments);
      const sv = [VW, VH]; VW = UX.vw; VH = UX.vh;
      ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
      const nx = Math.round(G.leader.x - VW / 2), ny = Math.round(G.leader.y - VH / 2); ctx.translate(-nx, -ny);
      try { return f.call(this, nx, ny, w, h, t, mode); } finally { ctx.restore(); VW = sv[0]; VH = sv[1]; }
    };
  }
  { const f = drawHUD;
    drawHUD = function(){
      if (!G) return f.apply(this, arguments);
      hookFill();
      const k = hudK(), ow = VW, oh = VH, m = CAMP.mouse, mx = m.x, my = m.y;
      UX.k = k; UX.vw = ow; UX.vh = oh; UX.inHud = true;
      VW = ow / k; VH = oh / k; m.x = mx / k; m.y = my / k;
      ctx.save(); ctx.scale(k, k);
      try { f.apply(this, arguments); safe('squad strip', () => squadStrip()); }
      finally {
        ctx.restore(); VW = ow; VH = oh; m.x = mx; m.y = my; UX.inHud = false;
        safe('momentum rects', () => { const ch = G && G.momChoice; if (ch && ch.rects && !ch.rects.__ux && k !== 1){
          ch.rects = ch.rects.map(r => ({x:r.x * k, y:r.y * k, w:r.w * k, h:r.h * k})); ch.rects.__ux = true; } });
      }
    };
  }

  /* ---- J-05: the leader card rows ------------------------------------------- */
  const SHAPE = {'#87ceeb':'diamond', '#d4af37':'square', '#a0784f':'square', '#d47a6a':'circle', '#6fa37a':'bar', '#f0c96a':'tri'};
  { const f = pips;
    pips = function(x, y, n, max, on){
      if (!UX.inHud || !SHAPE[on]) return f.apply(this, arguments);
      if (UX.pg !== G){ UX.pg = G; UX.prev = {}; UX.fl = {}; }
      const kind = SHAPE[on], step = 11;
      for (let i = 0; i < max; i++){
        const cx = x + i * step + 4, cy = y + 4, full = i < n;
        ctx.beginPath();
        if (kind === 'diamond'){ ctx.moveTo(cx, cy - 5); ctx.lineTo(cx + 5, cy); ctx.lineTo(cx, cy + 5); ctx.lineTo(cx - 5, cy); ctx.closePath(); }
        else if (kind === 'circle') ctx.arc(cx, cy, 4.2, 0, TAU);
        else if (kind === 'tri'){ ctx.moveTo(cx, cy - 5); ctx.lineTo(cx + 5, cy + 4); ctx.lineTo(cx - 5, cy + 4); ctx.closePath(); }
        else if (kind === 'bar') ctx.rect(cx - 4, cy - 3, 8, 7);
        else ctx.rect(cx - 4, cy - 4, 8, 8);
        if (full){ ctx.fillStyle = on; ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,.4)'; ctx.lineWidth = 1; ctx.stroke(); }
        else { ctx.fillStyle = 'rgba(245,239,227,.08)'; ctx.fill(); ctx.strokeStyle = 'rgba(245,239,227,.4)'; ctx.lineWidth = 1; ctx.stroke(); }
      }
      const ta = ctx.textAlign; ctx.textAlign = 'left'; ctx.fillStyle = '#e8dfcb'; ctx.font = 'bold 10.5px Georgia'; ctx.fillText(n + '/' + max, x + max * step + 4, y + 8.5); ctx.textAlign = ta;
      const pv = UX.prev[on]; if (pv != null && n < pv) UX.fl[on] = G.frame + 40; UX.prev[on] = n;
      if (UX.fl[on] > G.frame){ const a = (UX.fl[on] - G.frame) / 40;
        ctx.strokeStyle = 'rgba(255,70,50,' + (0.4 + 0.6 * a).toFixed(2) + ')'; ctx.lineWidth = 2; ctx.strokeRect(x - 5, y - 3, max * step + 36, 14); }
    };
  }

  /* ---- J-11: the squad portrait strip ----------------------------------------- */
  function stripOn(){ try { return settings().squadStrip !== false; } catch (e) { return true; } }
  function squadStrip(){
    if (!G || !G.squad || !G.squad.length || !stripOn()) return;
    const rows = 5 + (G.mountMax > 0 ? 1 : 0);                      // WARDS, SHIELD, [MOUNT], WOUNDS, CON, LUCK
    const top = 14 + 76 + rows * 14 + 6, S = 44, gap = 8, mates = G.squad.slice(0, 5), w = mates.length * (S + gap) + gap;
    panel(10, top, Math.min(300, w + 4), S + 36);
    mates.forEach((m, i) => {
      const x = 16 + i * (S + gap), y = top + 8, dead = m.state === 'dead', down = m.state === 'bleeding' || m.state === 'stable';
      ctx.fillStyle = '#3a3226'; ctx.fillRect(x, y, S, S);
      ctx.save(); ctx.beginPath(); ctx.rect(x, y, S, S); ctx.clip();
      try { ctx.globalAlpha = dead ? 0.35 : down ? 0.6 : 1; ctx.imageSmoothingEnabled = false; ctx.drawImage(personBust(m.p, false), x, y, S, S); } catch (e) {}
      ctx.restore(); ctx.globalAlpha = 1;
      ctx.strokeStyle = dead ? '#7a2a22' : down ? '#e0a030' : '#d4af37'; ctx.lineWidth = 1.5; ctx.strokeRect(x + .5, y + .5, S - 1, S - 1);
      const fr = dead ? 0 : Math.max(0, Math.min(1, m.con / (m.maxCon || 1)));
      ctx.fillStyle = '#000'; ctx.fillRect(x, y + S + 3, S, 6);
      ctx.fillStyle = fr > 0.6 ? '#6fa37a' : fr > 0.3 ? '#d4af37' : '#d4503a'; ctx.fillRect(x + 1, y + S + 4, Math.round((S - 2) * fr), 4);
      ctx.textAlign = 'center';
      if (dead){ ctx.strokeStyle = '#e03030'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x + 6, y + 6); ctx.lineTo(x + S - 6, y + S - 6); ctx.moveTo(x + S - 6, y + 6); ctx.lineTo(x + 6, y + S - 6); ctx.stroke(); }
      else if (down){ ctx.font = 'bold 10.5px Georgia'; ctx.fillStyle = '#000'; ctx.fillText('DOWN', x + S / 2 + 1, y + S - 4); ctx.fillStyle = '#ffd890'; ctx.fillText('DOWN', x + S / 2, y + S - 5); }
      ctx.textAlign = 'left';
    });
    ctx.font = '10.5px Georgia'; ctx.fillStyle = '#c8bca8'; ctx.textAlign = 'left'; ctx.fillText('[N] hide', 16, top + S + 26);
    if (!UX.stripTip && G.frame > 300 && !G.tip && !(UX.tq && UX.tq.length)){ UX.stripTip = true; tip('squadstrip'); }   /* Index 83c: after the first tips have been read */
  }
  TIPS.squadstrip = 'The portraits under your Leader show each Squad Mate’s Condition. A red X is dead. N hides them.';
  window.addEventListener('keydown', e => {
    if (e.key.toLowerCase() !== 'n' || e.repeat || e.ctrlKey || e.metaKey || e.altKey || !G || G.paused) return;
    const t = e.target; if (t && /INPUT|TEXTAREA|SELECT/.test(t.tagName)) return;
    settings().squadStrip = !stripOn(); saveMeta();
  });

  /* ---- HUD size setting and the backup button ---------------------------------- */
  { const f = settingsHTML;
    settingsHTML = function(dark){
      const h = f(dark);
      const s = hudSet(), o = (v, l) => `<option value="${v}" ${String(s) === v ? 'selected' : ''}>${l}</option>`;
      const add = `<label title="Size of the panels and bars during a contract">HUD size <select onchange="setSetting('hudSize', this.value)">${o('auto', 'Auto')}${o('100', '100%')}${o('125', '125%')}${o('150', '150%')}</select></label>`
        + (SAVE_KEY === MAIN_SLOT && META && META.leader ? `<button class="btn small" style="font-size:12px;padding:4px 10px" onclick="uxBackups()">Restore a backup…</button>` : '');
      const i = h.lastIndexOf('</div>'); return i < 0 ? h + add : h.slice(0, i) + add + h.slice(i);
    };
  }

  /* ---- J-07: rolling backups ---------------------------------------------------------- */
  const BK = () => [1, 2, 3].map(i => MAIN_SLOT + '_bk' + i);
  function bkList(){ return BK().map(k => { try { const v = JSON.parse(localStorage.getItem(k)); return v && v.raw ? v : null; } catch (e) { return null; } }); }
  function bkMake(label){
    try {
      if (SAVE_KEY !== MAIN_SLOT || !META || !META.leader) return false;
      saveMeta(); const raw = localStorage.getItem(MAIN_SLOT); if (!raw) return false;
      const L = bkList(), keys = BK();
      const entry = {when:Date.now(), label:label || 'Backup', leader:META.leader.name, season:seasonName(), gold:META.treasury, contracts:META.deployments || 0, raw};
      const write = () => { for (let i = 2; i >= 1; i--) if (L[i - 1]) localStorage.setItem(keys[i], JSON.stringify(L[i - 1])); localStorage.setItem(keys[0], JSON.stringify(entry)); };
      try { write(); } catch (e) { localStorage.removeItem(keys[2]); L[1] = null; write(); }
      return true;
    } catch (e) { console.warn('Index 83b backup:', e); return false; }
  }
  UX.backup = bkMake;
  { const f = endDeployment;
    endDeployment = function(result){
      const s0 = (META && META.leader) ? seasonName() : null;
      const r = f.apply(this, arguments);
      safe('season backup', () => { if (s0 && SAVE_KEY === MAIN_SLOT && META && META.leader && seasonName() !== s0) bkMake('New season'); });
      return r;
    };
  }
  window.uxBackups = function(){
    $all('#ux-bk').forEach(e => e.remove());
    const box = document.createElement('div'); box.id = 'ux-bk';
    const L = bkList(), fmt = t => new Date(t).toLocaleString([], {day:'numeric', month:'short', hour:'2-digit', minute:'2-digit'});
    box.innerHTML = `<div class="bx"><h2>Backups</h2><div style="font-size:13.5px;margin:4px 0 8px">A copy is kept at every change of season (three at most, the oldest drops off). Restoring one replaces the campaign you are playing, and backs it up first.</div>`
      + L.map((b, i) => b ? `<div class="brow"><div class="g"><b>${esc2(b.leader)}</b> · ${esc2(b.season)} · ${b.gold}gp · ${b.contracts} contract${b.contracts === 1 ? '' : 's'}<small>${esc2(b.label)}, saved ${fmt(b.when)}</small></div><button class="btn small" onclick="uxRestore(${i})">Restore</button></div>`
        : `<div class="brow"><div class="g" style="color:#6a5a44;font-style:italic">Empty slot</div></div>`).join('')
      + `<div style="margin-top:10px;text-align:right"><button class="btn small" onclick="uxBackupNow()">Back up now</button><button class="btn small" onclick="document.getElementById('ux-bk').remove()">Close</button></div></div>`;
    box.addEventListener('mousedown', e => { if (e.target === box) box.remove(); });
    document.body.appendChild(box);
  };
  window.uxBackupNow = function(){ const ok = bkMake('Manual backup'); campNote(ok ? 'Backed up.' : 'Nothing to back up yet.', ok ? 'good' : 'bad'); uxBackups(); };
  window.uxRestore = function(i){
    const b = bkList()[i]; if (!b) return;
    const bx = $q('#ux-bk'); if (bx) bx.remove();
    askConfirm('Restore this backup?', `<b>${esc2(b.leader)}</b>, ${esc2(b.season)}, ${b.gold}gp. The campaign you are playing now will be replaced (it is backed up first).`, () => {
      bkMake('Before restoring');
      try { const m = JSON.parse(b.raw);
        META = Object.assign(freshMeta(), m); saveMeta(); applySkin(); G = null; CAMP.dirty = true; if (typeof MU !== 'undefined') MU = null;
        const tb = $q('#tb-settings'); if (tb) tb.remove(); showSplash(); campNote('Backup restored.', 'good');
      } catch (e) { askAlert('Could not restore', 'That backup could not be read (' + esc2(e.message) + ').'); }
    }, {ok:'RESTORE', danger:true});
  };

  /* ---- J-12: plain-English one-liners ---------------------------------------------------- */
  const PL_SPEC = {Soldier:'Front-line fighter. Takes hits and cuts through crowds.', 'Folk Hero':'Archer. Shoots fast from a safe distance.', Scoundrel:'Knife-fighter. Does most harm to someone already busy.',
    Cleric:'Healer. Keeps the squad on its feet.', Mage:'Wizard. Magic darts that do not miss.', Witch:'Hexer. Weakens and slows what you cannot kill yet.'};
  const PL_GEAR = {'Rags':'Barely clothes. Better than nothing.', 'Padded Gambeson':'Light and cheap. Takes the edge off a blow.', 'Hardened Leather':'Light armour that turns the odd blow.',
    'Studded Brigandine':'Light armour stiffened with studs. Blows glance off more often.', 'Chain Shirt':'Light armour that also gives a Ward Token each fight.',
    'Thick Hide & Furs':'Medium armour. Tougher, but you walk a step slower.', 'Scale Hauberk':'Medium armour. Strong, but a step slower.', 'Heavy Chainmail':'Heavy mail. Hard to hurt, a step slower.',
    'Cuirass / Breastplate':'Strong plate for the chest. A step slower.', 'Splint Mail':'Heavy plates. Strong, and two steps slower.', 'Banded Lamellar':'Plates that shrug off grazes. Two steps slower.',
    'Half-Plate':'The best armour money buys. Shrugs off grazes. Two steps slower.', 'Light Bucklers':'Small shields. A little protection each fight.', 'Heavy Infantry Shields':'Big shields. A deep pool of protection each fight.'};
  const PL_DOC = {Concealment:'Creep up on sleeping camps: guards spot you from about half as far.', 'Earthworks & Traps':'Stakes are in the ground before the fight begins.',
    'Spear Wall Mastery':'Spears hold firm: charging enemies run into a harder wall.', 'Shield Wall Lock':'Brace, and the wall steadies each round and blows land softer.',
    'Push Through':'Charge them, and the survivors may lose their nerve.', 'Skirmisher Drill':'Skirmishers are ready from the first minute.', 'Volley Fire':'Archers loose together from the first minute.',
    'Feigned Retreat':'Fall back, and anyone who chases you into the open pays for it.', 'Field Medicine':'Medics are ready from the start and get people up in half the time.',
    'Plunder Management':'Looting is already drilled before you march.', 'Munitions Drill':'Sharpers (demolition kits) are ready from the first minute.', 'Propaganda & Parlay':'Talk the enemy down: Parlay rolls improve by one step.'};
  function plainify(){
    $all('.card:not([data-ux83p])').forEach(c => {
      if (c.closest('#askbox')) return;
      const t = $q('.ttl', c); if (!t) return;
      const name = t.textContent.trim(), line = PL_SPEC[name] || PL_GEAR[name]; if (!line) return;
      c.dataset.ux83p = '1';
      const p = document.createElement('div'); p.className = 'ux-plain'; p.textContent = line;
      const d = $q('.desc', c), role = $q('.role', c);
      (role || t).after(p);
      if (d && PL_SPEC[name]){ const det = document.createElement('details'); det.className = 'ux-det'; det.innerHTML = '<summary>Details</summary>'; d.before(det); det.appendChild(d); det.addEventListener('click', e => e.stopPropagation()); }
    });
    $all('.gcard:not([data-ux83p])').forEach(c => {       // Quartermaster and Market gear cards
      const n = $q('.gc-name', c); if (!n) return; c.dataset.ux83p = '1';
      const line = PL_GEAR[n.textContent.trim()]; if (!line) return;
      const p = document.createElement('div'); p.className = 'ux-plain'; p.style.fontSize = '12px'; p.textContent = line; n.after(p);
    });
    $all('#tbl-doctrines .line:not([data-ux83p])').forEach(l => {
      const b = $q('b', l); if (!b) return; const line = PL_DOC[b.textContent.trim()]; l.dataset.ux83p = '1'; if (!line) return;
      const g = $q('.grow', l), span = g && $q(':scope > span[style*="font-size:12px"]', g); if (!span) return;
      const p = document.createElement('div'); p.className = 'ux-plain'; p.textContent = line;
      const det = document.createElement('details'); det.className = 'ux-det'; det.innerHTML = '<summary>Details</summary>';
      const br = span.previousElementSibling; span.before(p); span.before(det); det.appendChild(span); if (br && br.tagName === 'BR') br.remove();
    });
  }
  let plT = 0;
  new MutationObserver(() => { clearTimeout(plT); plT = setTimeout(() => safe('plain', plainify), 30); }).observe(document.body, {childList:true, subtree:true});
  UX.plainify = plainify;
})();
/* ===== END INDEX 83b ====================================================== */

/* ============================================================================
   INDEX 83c - UX FIXES FROM THE ROUND 2 RE-AUDIT
   R2-03  Tips queue instead of overwriting each other (the WASD tip was never
          seen). The squad-strip tip waits until the first ones have been read.
   R2-04  The "save changed in another tab" box is a small bottom-right notice
          that fades after ten seconds, instead of covering the objective.
   R2-05  No "upkeep -0gp" chip while nothing is built and nothing is owed.
   R2-06  "NEXT:" and "TAKE THE CHAIR" give a reason when disabled (in 83).
   R2-07  The hint strip shortens after three finished contracts, not three
          camp redraws (in 83).
   R2-08  The Effects slider stays on the pause screen (in 83).
   R2-02  (bugs audit) Text size and the HUD scale compose: the HUD is scaled as
          a whole by base x text size, and fonts drawn inside it are not scaled
          a second time by Index 79. The scale is also capped so the HUD never
          needs more than 1000 x 620 units to lay out (wider windows keep room,
          narrow ones shrink it instead of overlapping).
   ROLLBACK  Delete from this comment to END INDEX 83c and undo the three
             marked "Index 83c" edits above.
============================================================================ */
(function(){
  const UX = window.UX83 = window.UX83 || {};
  const safe = (n, fn) => { try { return fn(); } catch (e) { console.warn('Index 83c ' + n + ':', e); } };
  const st = document.createElement('style');
  st.textContent = `#tab-warn{left:auto !important;right:12px;top:auto !important;bottom:12px;transform:none !important;max-width:min(300px,86vw) !important;
    font-size:12.5px !important;padding:8px 30px 8px 12px !important;z-index:120 !important;animation:uxtabw .6s ease 10s forwards}
    @keyframes uxtabw{to{opacity:0;visibility:hidden}}`;
  document.head.appendChild(st);

  /* R2-02: fonts inside the scaled HUD are already scaled with the panels */
  { const f = fixFont;
    fixFont = function(v){
      if (!UX.inHud) return f.apply(this, arguments);
      return String(v).replace(/(\d+(?:\.\d+)?)px/, (m, n) => (Math.round(Math.max(10.5, parseFloat(n)) * 2) / 2) + 'px');
    };
  }

  /* R2-03: a tip queue */
  { const f = tip;
    tip = function(id){
      if (!G){ return f.apply(this, arguments); }
      if (UX.tg !== G){ UX.tg = G; UX.tq = []; }
      const cur = G.tip, before = META && META.tipsSeen && META.tipsSeen[id];
      f.apply(this, arguments);
      if (!before && cur && cur.life > 20 && G.tip && G.tip !== cur){ UX.tq.push(G.tip); G.tip = cur; }
    };
  }
  { const f = drawHUD;
    drawHUD = function(){
      const r = f.apply(this, arguments);
      safe('tip queue', () => { if (G && UX.tg === G && UX.tq && UX.tq.length && !G.tip){ G.tip = UX.tq.shift(); G.tip.life = 540; } });
      return r;
    };
  }

  /* R2-05: no empty ledger chip */
  { const f = renderTopbar;
    renderTopbar = function(){
      const r = f.apply(this, arguments);
      safe('ledger chip', () => {
        const tb = document.getElementById('topbar'); if (!tb) return;
        [...tb.querySelectorAll('span.stat')].forEach(c => { const t = c.textContent.trim();
          if ((/^Ledger:/.test(t) || /^\u2692/.test(t)) && /-0gp/.test(t) && !/building/.test(t) && !/^\u2692\s*\d/.test(t)) c.remove(); });
      });
      return r;
    };
  }
})();
/* ===== END INDEX 83c ====================================================== */
