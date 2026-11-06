/* ============================================================================
   INDEX 86 - BALANCE (from audits/balance.md and the user's decisions D-01, D-02)
   Loaded after the main game script in index.html. Wrap game functions or
   adjust game data the same way the Index sections do.
   Each change: a short note here (what, why, the old and new numbers) and a
   ROLLBACK line.
============================================================================ */

/* J-14 (D-01), revised: Tier 1 of the four hardest hosts, softened without changing who fights.
   Bot sim (same squad and gear, avg survival in seconds): Greenskins 35, Orcs 30, Monsters 27,
   Arcana 27 against Bandits 68 and Hollow 90+, at the same pay. Re-weighting each pool with the
   host's own troops, fewer spawns and lower Condition each moved the numbers by only 0-15s.
   What worked: on a Tier 1 contract against these four hosts, every ordinary troop moves 10%
   slower and fights at -1 Skill (melee and ranged). The pools, bosses, nests, Tier 2/3 and pay
   are untouched. Done with getters on the shared BESTIARY entries that only answer differently
   while that kind of contract is running.
   OLD: speed and skill as in BESTIARY.  NEW: speed x0.9, skill and rskill -1 (min 0).
   ROLLBACK: delete this block. */
{
  const SOFT_HOSTS = ['greenskins', 'monsters', 'orcs', 'arcana'];
  const soft = () => { try { return !!(G && G.contract && G.contract.tier === 1 && SOFT_HOSTS.includes(G.contract.host)); } catch (e) { return false; } };
  for (const k of Object.keys(BESTIARY)){
    const B = BESTIARY[k], d = Object.getOwnPropertyDescriptor(B, 'speed');
    if (B.boss || B.arch === 'fixed' || (d && d.get)) continue;
    const sp = B.speed, sk = B.skill, rs = B.rskill;
    Object.defineProperty(B, 'speed', {configurable:true, enumerable:true, get(){ return soft() ? sp * 0.9 : sp; }});
    Object.defineProperty(B, 'skill', {configurable:true, enumerable:true, get(){ return soft() ? Math.max(0, sk - 1) : sk; }});
    if (rs !== undefined) Object.defineProperty(B, 'rskill', {configurable:true, enumerable:true, get(){ return soft() ? Math.max(0, rs - 1) : rs; }});
  }
}

/* ---- J-15 (D-02): late gold sinks ----------------------------------------------------------
   Masterwork Full Plate (4,000gp) and Runed Deep-Iron Plate already exist (Index 37). Added
   here, as Quartermaster cards (they show wherever GEAR is sold), priced against the income
   model (about 530gp net a contract at contract 7-12, about 860 from 13):
     Masterwork Greatswords   650gp  Dmg 4, strips 2 armour steps (Greatswords: 160gp, strips 1)
     Masterwork Longbows      600gp  Dmg 4, range 400 (Longbows: 160gp, Dmg 3, range 370)
     Bastion Shields          400gp  Shield Pool 6 (Heavy Infantry Shields: 50gp, pool 4)
     Elven Mail              1100gp  AC 5, shift -2, Move 0, +1 Ward Token, light armour
     Destriers               900gp   speed x1.22, Mount Pool 12 (Warhorses: 480gp, pool 8)
   Facility upgrades were NOT added: every building is tied to plots, art in four holdings and
   the 3D set, which is too heavy for this pass (see audits/balance.md).
   ROLLBACK: delete the GEAR.push block. */
if (typeof GEAR !== 'undefined' && !GEAR.some(g => g.id === 'mwgreatswords')){
  if (typeof ARMOUR_LOOK !== 'undefined') ARMOUR_LOOK.elvenmail = ['#b8d0c8', 'bands'];
  if (typeof MELEE_ART !== 'undefined') MELEE_ART.mwgreatswords = 'greatsword';
  if (typeof RANGED_ART !== 'undefined') RANGED_ART.mwlongbows = 'bow';
  if (typeof B2_RANGED !== 'undefined') B2_RANGED.push('mwlongbows');
  GEAR.push(
    {id:'mwgreatswords', slot:'melee', name:'Masterwork Greatswords', cost:650, dmg:4, reach:0, crush:2, req:['blacksmith', '#blacksmith'],
     note:'Dwarf-forged blades: strip 2 steps of armour on every hit. Needs a Blacksmith run by a veteran.'},
    {id:'mwlongbows', slot:'ranged', name:'Masterwork Longbows', cost:600, dmg:4, range:400, req:['carpentry', 'blacksmith'],
     note:'Seasoned yew with steel limbs: heavier shafts and 400px range.'},
    {id:'bastion', slot:'shield', name:'Bastion Shields', cost:400, pool:6, req:['blacksmith'],
     note:'Iron-faced tower shields: Shield Pool 6.'},
    {id:'elvenmail', slot:'armour', name:'Elven Mail', cost:1100, ac:5, shift:2, mv:0, req:['blacksmith', 'leather'], light:true, ward:1,
     note:'Light mail with no Move penalty, and a Ward Token each contract.'},
    {id:'destrier', slot:'mount', name:'Destriers', cost:900, spd:1.22, pool:12, req:['stables', 'barracks'],
     note:'Armoured chargers. Faster than Warhorses, with a Mount Pool of 12 that soaks hits after the Shield Pool.'}
  );
}

/* ============================================================================
   INDEX 86b - J-01: THE NEW-PLAYER START (from audits/balance.md BAL-02, BAL-03, UX-07, UX-09)
   1. Three ready-made Leaders (The Shield, The Bow, The Medic) as large cards at the start of
      Leader creation, in the prologue and in the founding. One click sets race, class,
      specialty and opening ability, rolls a name, and lands on the signing step with
      SIGN CONTRACT and "Change anything...". They replace the three quick-start pills of
      Index 45 (same STARTERS list); "Surprise me" stays.
      OLD pills: Dwarf Freeman Soldier / Human Outcast Folk Hero / Human Devout Cleric, no ability.
      NEW: Human Freeman Soldier + Shield Wall Mastery, Human Freeman Folk Hero + Rallying Cry,
      Human Devout Cleric + Litany of the Shield (the audit's three builds).
   2. The Soldier's role label "Vanguard" clashed with the Soldier ability of the same name.
      OLD role 'Vanguard'. NEW role 'Front-liner'.
   3. Prologue charter kit: the squad is issued Studded Brigandine, Heavy Infantry Shields,
      Spears and Shortbows (200gp, taken from the 350gp kit allowance: treasury 850 -> 650).
      Gear in the kit may total at most 350gp; changing an issued piece refunds it.
      OLD: nothing issued, the whole 350gp had to be spent from the shop, with no cap.
   4. UX-07: in the prologue the top bar shows only WORK ORDERS, MANUAL, SETTINGS and MAIN MENU
      until Day 1 ends. MARKET joins on the kit day and from Day 2; ROSTER and PORTRAITS after the first assault.
   ROLLBACK: delete this section (to END INDEX 86b).
============================================================================ */
{
  SPECS.SOLDIER.role = 'Front-liner';
  const ARCH = [
    {id:'shield', name:'The Shield', race:'HUMAN', cls:'FREEMAN', spec:'SOLDIER', pick:'shieldwall', tag:'Good first pick',
     line:"Stands in front and does not move. The tough one: soaks the hits so the rest of the squad can work.", ab:'Shield Wall Mastery'},
    {id:'bow', name:'The Bow', race:'HUMAN', cls:'FREEMAN', spec:'FOLK_HERO', pick:'rally', tag:'Easy to read',
     line:"Shoots from behind the line and keeps the squad's nerve up. Quick, and good at being everywhere.", ab:'Rallying Cry'},
    {id:'medic', name:'The Medic', race:'HUMAN', cls:'DEVOUT', spec:'CLERIC', pick:'litany', tag:'Keeps people alive',
     line:"Shields the line and mends the wounded. Less to look at, more to look after.", ab:'Litany of the Shield'}
  ];
  STARTERS.splice(0, STARTERS.length, ...ARCH);
  document.head.appendChild(Object.assign(document.createElement('style'), {textContent: `
    .arch-row{display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin:4px 0 8px;width:100%}
    .arch-card{display:flex;flex-direction:column;align-items:center;width:196px;box-sizing:border-box;background:#f3ead8;border:3px solid #6a4428;border-radius:5px;padding:8px 9px;cursor:pointer;text-align:center;color:#2a2520;box-shadow:0 4px 10px rgba(0,0,0,.25)}
    .arch-card:hover,.arch-card:focus{border-color:#b8902a;background:#fbf3df;outline:none}
    .arch-card img{height:96px;image-rendering:pixelated}
    .arch-card .ttl{font:bold 20px Georgia;color:#7a3e26;margin-top:2px}
    .arch-card .who{font:italic 13px Georgia;color:#4a3b2a}
    .arch-card .ln{font-size:13px;line-height:1.35;margin:6px 0 8px}
    .arch-card .ab{font:bold 12px Georgia;color:#226b2a}
    .arch-card .go{margin-top:auto;font-size:13px;padding:6px 8px;width:100%}
    .arch-or{font:italic 13px Georgia;color:#6a5a44;margin:6px 0 2px;text-align:center}
    .arch-sum{background:#fff3c4;border:2px solid #b8902a;border-radius:5px;padding:10px 14px;margin:0 0 10px;max-width:520px;text-align:center;color:#3a2a10;font:14px/1.4 Georgia}
    .arch-sum b{font-size:18px;color:#7a3e26}
  `}));
  const archWho = s => `${RACES[s.race].name} ${CLASSES[s.cls].name} ${SPECS[s.spec].name}`;
  const archCards = () => `<div class="arch-or" style="font-size:15px;font-style:normal;font-weight:bold;color:#4a3b2a">Start with a ready-made Leader</div><div class="arch-row">${STARTERS.map((s, n) => `
    <div class="arch-card" tabindex="0" role="button" onmouseenter="LV.hov={spec:'${s.spec}',cls:'${s.cls}',race:'${s.race}'};ldrHovRaw()" onmouseleave="ldrHov()" onfocus="LV.hov={spec:'${s.spec}',cls:'${s.cls}',race:'${s.race}'};ldrHovRaw()" onclick="ldrArch(${n})" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();ldrArch(${n})}">
      ${img(portraitURL({race:s.race, spec:s.spec, name:'preview' + (CR.sex || 'm'), sex:CR.sex || 'm', id:9}, true))}
      <div class="ttl">${s.name}</div><div class="who">${archWho(s)}</div>
      ${s.tag ? `<span class="ldr-badge" style="margin:4px 0 0">${s.tag}</span>` : ''}
      <div class="ln">${s.line}</div><div class="ab">Opens with ${s.ab}</div>
      <button class="btn gold go" tabindex="-1">CHOOSE</button></div>`).join('')}</div>
    <div class="arch-or">Or build your own, or let fate choose:</div>`;
  window.ldrArch = function(i){
    const s = STARTERS[i]; if (!s) return;
    const sex = CR.sex || (Math.random() < .5 ? 'f' : 'm');
    Object.assign(CR, {race:s.race, cls:s.cls, spec:s.spec, pick:s.pick, sex, name:randomName(s.race, sex), arch:s.id, step:'name'});
    LV.hov = null; renderCreate();
  };
  window.archChange = function(){ CR.arch = null; CR.step = 'spec'; LV.hov = null; renderCreate(); };
  { const f = ldrSel; ldrSel = function(kind){ CR.arch = null; return f.apply(this, arguments); }; }
  { const f = ldrGo; ldrGo = function(step){ if (step !== 'name') CR.arch = null; return f.apply(this, arguments); }; }
  { const f = ldrSurprise; ldrSurprise = function(){ const r = f.apply(this, arguments); CR.arch = null; return r; }; }
  { const f = renderCreate;
    renderCreate = function(){
      const r = f.apply(this, arguments);
      try {
        if (!CR) return r;
        const left = document.getElementById('ldr-left'); if (!left) return r;
        if (CR.step === 'spec' && !CR.arch){
          const bar = left.querySelector('.qbar');
          if (bar){ bar.querySelectorAll('button.qpill:not(.dice)').forEach(b => b.remove()); const sp = bar.querySelector('span'); if (sp) sp.remove(); bar.insertAdjacentHTML('beforebegin', archCards()); }
        } else if (CR.step === 'name' && CR.arch){
          const s = STARTERS.find(a => a.id === CR.arch);
          if (s) left.insertAdjacentHTML('afterbegin', `<div class="arch-sum"><b>${s.name}</b><br>${archWho(s)}, opening with ${s.ab}.<br>Happy with that? Rename them below if you like.
            <div style="margin-top:8px"><button class="btn gold" onclick="ldrNext()">${ldrNextLabel()}</button> <button class="btn small" onclick="archChange()">Change anything…</button></div></div>`);
        }
      } catch (e) { console.error('Index 86b cards', e); }
      return r;
    };
  }

  /* ---- the prologue charter kit ---- */
  const KIT_CAP = 350, KIT_ISSUE = {armour:'brigandine', shield:'heavyshield', melee:'spears', ranged:'shortbows'};
  const kitValue = (gearObj, swap) => {
    const g = Object.assign({}, gearObj, {kits:(gearObj.kits || []).slice()});
    if (swap){ if (swap.slot === 'kit'){ g.kits = g.kits.filter(x => x !== swap.id).concat(swap.id).slice(-2); } else g[swap.slot] = swap.id; }
    return [g.armour, g.shield, g.melee, g.ranged, ...g.kits, g.mount].reduce((s, id) => { const x = id && gear(id); return s + (x ? (x.cost || 0) : 0); }, 0);
  };
  const kitStage = () => { try { return inStory() && CP().part === 'kit'; } catch (e) { return false; } };
  const issueKit = () => {
    const C = CP(); if (C.kitIssued) return;
    const own = META.gear.owned; let cost = 0;
    for (const slot in KIT_ISSUE){ const id = KIT_ISSUE[slot]; if (!own.includes(id)) own.push(id); META.gear[slot] = id; cost += gear(id).cost; }
    META.treasury -= cost; C.kitIssued = {armour:'brigandine', shield:'heavyshield'}; saveMeta();
  };
  { const f = storyMusterDone;
    storyMusterDone = function(){
      const r = f.apply(this, arguments);
      try { issueKit(); renderPanel(); renderTopbar(); } catch (e) { console.error('Index 86b kit', e); }
      return r;
    };
  }
  { const f = gearClick;
    gearClick = function(id){
      if (!kitStage()) return f.apply(this, arguments);
      const g = gear(id), C = CP(), before = META.gear.owned.includes(id);
      if (g && kitValue(META.gear, g) > KIT_CAP){
        SFX.play('nope'); try { campNote(`The Charter Kit holds at most ${KIT_CAP}gp of gear (it holds ${kitValue(META.gear)}gp now).`, 'bad'); } catch (e) {}
        return;
      }
      const old = C.kitIssued && C.kitIssued[g.slot];
      const r = f.apply(this, arguments);
      try {
        if (old && old !== id && META.gear[g.slot] === id && META.gear.owned.includes(id) && META.gear.owned.includes(old)){
          META.gear.owned = META.gear.owned.filter(x => x !== old); META.treasury += gear(old).cost; delete C.kitIssued[g.slot];
          saveMeta(); renderCamp(); renderTopbar();
          campNote(`${gear(old).name} handed back: +${gear(old).cost}gp.`, 'good');
        }
      } catch (e) { console.error('Index 86b refund', e); }
      return r;
    };
  }
  { const f = renderPanel;
    renderPanel = function(){
      const r = f.apply(this, arguments);
      try {
        const P = CAMP.panel; if (!P || P.kind !== 'cpkit' || !inStory()) return r;
        const d = document.querySelector('#camp-panel .desc'); if (!d) return r;
        d.innerHTML = `The Reeve has opened the town's purse: <b>${META.treasury}gp</b> between the Chapter and the Reeve's town works. Your company has been issued the <b>Standard Charter Kit</b>: Studded Brigandine, Heavy Infantry Shields, Spears and Shortbows. That is a sound kit; you can begin the siege with it as it stands.<br><br>To change it, the Market is open today and every card is available, but the kit may hold at most <b>${KIT_CAP}gp</b> of gear (it holds ${kitValue(META.gear)}gp now). Handing back an issued piece refunds it. After today, metal must be forged at Smithy Row.`;
      } catch (e) { console.error('Index 86b kit panel', e); }
      return r;
    };
  }
  { const f = renderCamp;
    renderCamp = function(){
      const r = f.apply(this, arguments);
      try { if (kitStage()){ const ci = document.getElementById('camp-inner'); if (ci) ci.innerHTML = ci.innerHTML.replace('Founding purchases: every card is open to you today.', `Founding purchases: every card is open to you today, but the kit holds at most ${KIT_CAP}gp of gear (${kitValue(META.gear)}gp now).`); } } catch (e) {}
      return r;
    };
  }

  /* ---- UX-07: the prologue's top bar, a little at a time ---- */
  { const f = renderTopbar;
    renderTopbar = function(){
      const r = f.apply(this, arguments);
      try {
        if (!inStory()) return r;
        const C = CP(); if (!['create', 'muster', 'kit', 'siege'].includes(C.part)) return r;
        const tb = document.getElementById('topbar'); if (!tb) return r;
        const roster = C.part === 'siege' && (C.assault || 0) >= 1;
        const market = C.part === 'kit' || (C.part === 'siege' && (C.day >= 2 || (C.assault || 0) >= 1) && marketOpen());
        const drop = t => (/^ROSTER$/.test(t) && !roster) || (/^PORTRAITS$/.test(t) && !roster) || (/^(MARKET|CRAFT)$/.test(t) && !market);
        tb.querySelectorAll('button.tb').forEach(b => { if (drop(b.textContent.trim())) b.remove(); });
        if (window.UX83 && UX83.folded) UX83.folded = UX83.folded.filter(b => !drop(b.textContent.trim()));
      } catch (e) { console.error('Index 86b topbar', e); }
      return r;
    };
  }
}
/* END INDEX 86b */
