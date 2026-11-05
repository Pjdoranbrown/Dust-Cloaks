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
  const SEC = [['Sound', /^(Volume|Music)\b/], ['Save', /^(Export save|Import save|NEW CAMPAIGN)/],
               ['Display', /Screen shake|Squad Leader look|^Retro|3D world|Sharp text|Text size|Seasonal weather/], ['Game', /./]];
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
        for (const c of [...flex.children]){ const t = (c.textContent || '').trim(); if (!/^(Volume|Game speed|Momentum|Music)\b/.test(t)) inner.appendChild(c); }
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
  { const f = renderTitle;
    renderTitle = function(){
      const r = f.apply(this, arguments);
      try { if (META && !(typeof inStoryNow === 'function' && inStoryNow())){ META.uxCampVisits = (META.uxCampVisits || 0) + 1; } } catch (e) {}
      return r;
    };
  }
  const SHORT_HINT = 'WASD walks your Squad Leader · click buildings, plots and people · press ? for the camp keys';
  { const f = hint81;
    hint81 = function(){
      const r = f.apply(this, arguments);
      const h = $q('#camp-hint'); if (!h) return r;
      const story = typeof inStoryNow === 'function' && inStoryNow();
      if (story || !META || (META.uxCampVisits || 0) < 3) return r;
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
