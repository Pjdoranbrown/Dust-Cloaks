/* ============================================================================
   INDEX 85 - STORY QUICK WINS (from audits/story.md)
   Loaded after the main script in index.html. Wrap game functions the
   same way the Index sections do:  { const f = fn; fn = function(){ ... }; }
   Each change: a short note here (what, why) and a ROLLBACK line.

   STORY-01  The Reeve speaks: a line on Day 1, the last day, and on events.
   STORY-02  A story line after each assault (and STORY-14: who the levy are).
   STORY-03  Voices for Orsolt, Ilvaryn, Khan Duruk (spawn, fall, riders).
   STORY-06  Varnholt's carts join the column on the road.
   STORY-07  One line per contract result in the debrief.
   STORY-08  A line when a building is finished (camp note and the Works line).
   STORY-10  (calmer Bard intro: small patch in index.html marked Index 85)
   STORY-15  Nemesis arrival and nemesis slain lines.
   STORY-16  More bark lines, Bard lines and alternate contract briefs.
   STORY-17  Grey Cloaks note on a held Varnholt (text only, no Standing).
   ROLLBACK: delete this file's <script> tag in index.html, and restore the
   Bard intro line marked Index 85.
============================================================================ */
(function(){
  'use strict';
  const pick = a => a[Math.random() * a.length | 0];
  const story = () => { try { return typeof inStoryNow === 'function' && inStoryNow(); } catch (e) { return false; } };

  /* ---- STORY-01 / 06 / 17: the Reeve and the carts -------------------- */
  const REEVE_DAY1 = '“I have a purse, a mill and no soldiers,” says the Reeve. “You will do. Look up the north road, put spears in the hands of the people who will stand behind you, and mend my gate. In that order, if you please.”';
  const REEVE_LAST = '“If this fails, Varnholt was a silver town for eleven generations,” says the Reeve. “Write that down somewhere.”';
  const REEVE_AFTER = {
    'The First Wave': '“I had planned a speech,” says the Reeve. “I have lost the speech. Thank you.”',
    'The Last Day of Varnholt': '“Load the carts,” says the Reeve. “I will count the town twice and sit on the last one.”'
  };
  const REEVE_EVENT = {
    mill: '“That was my grain,” says the Reeve. “I will mention it.”',
    starving: '“The cellar is empty,” says the Reeve. “So is my patience, and I had a lot.”'
  };
  if (typeof nextDay === 'function'){
    const f = nextDay;
    nextDay = function(){
      f();
      try {
        const C = CP(); if (!C || C.part !== 'siege' || !C.dayNews) return;
        const say = t => C.dayNews.push(`<i>${t}</i>`);
        if (C.day === 1) say(REEVE_DAY1);
        else if (C.day === lastDay()) say(REEVE_LAST);
        else if (C.starving) say(REEVE_EVENT.starving);
        else if (C.district.mill === 'overrun' && !C.reeveMill){ C.reeveMill = true; say(REEVE_EVENT.mill); }
        else if (C.lastReeve) { say(C.lastReeve); }
        C.lastReeve = null;
      } catch (e) { console.warn('story nextDay', e); }
    };
  }
  if (typeof startRoadDay === 'function'){
    const f = startRoadDay;
    startRoadDay = function(){
      f();
      try {
        const C = CP(); if (C && C.part === 'road' && C.night === 1 && C.dayNews)
          C.dayNews.push('<i>Varnholt’s carts reach the forest road at midnight and fall in behind the elves. Nobody says much. Everyone counts the same number twice.</i>');
      } catch (e) {}
    };
  }
  if (typeof retreatHTML === 'function'){
    const f = retreatHTML;
    retreatHTML = function(){
      let h = f();
      try {
        const C = CP(), won = C.siegeWon;
        h = h.replace('<p>Your Squad Leader, Squad Mates and gear come with you.',
          `<p><i>Varnholt’s carts go out with you and join the elves’ column at the forest road.${won ? ' The Grey Cloaks note the Keep in their ledger and say nothing else.' : ' The Reeve rides the last cart and does not look back.'}</i></p><p>Your Squad Leader, Squad Mates and gear come with you.`);
      } catch (e) {}
      return h;
    };
  }

  /* ---- STORY-02 / 14: after each assault; STORY-07: contract results --- */
  const ASSAULT_AFTER = {
    'The First Wave': {win:'They came in a line and went away in pieces. The gate has a new scar and the Mill still turns. These were Hollow Levy: field-hands with a tithe-mark on the wrist, driven by Overseers at the back. The Reeve says it quietly: “Those are somebody’s farmers.”',
                       loss:'The levy are through the gate, and nobody on the wall has the heart to say how many there were.'},
    "The Reeve's Tithe": {win:'The host draws off. The levy that were driving at the gate stop where they stand, and someone brings them bread.', loss:'The north is lost. The tithe was collected in full.'},
    'The Hired Line': {win:'The ram burned. The Overseer is still deciding whether to be brave.', loss:'The ram reached the gate and the gate did not argue.'},
    'Over the Wall': {win:'The night was long and the palisade is shorter than it was. The Tithe-Priest’s lamp goes out on the ridge.', loss:'They came over the wall in the dark, and it is hard to say when it stopped being a wall.'},
    'The Tithe Is Called': {win:'Three sides, one town, and the town is still standing. Nobody has slept.', loss:'The town stands, in the sense that some of it is still on its feet.'},
    'The Last Wall': {win:'Horns from the ridge are the best sound anyone has heard all year. Varnholt still has a keep.', loss:'The Keep Gate is down, and the carts are loading in the smoke.'},
    'The Last Day of Varnholt': {win:'The host draws back to wait for its engines. Varnholt cannot take another.', loss:'The town goes down the sally gate in the smoke, on foot and in carts.'}
  };
  const ORSOLT = {slain:'Orsolt the Hollow Reeve is dead, and no one pretends to be sorry.', fled:'Orsolt is gone down the mill road. He will be back, and he knows now where the wall is thin.'};
  const RESULT = {
    hold:{victory:['The relief column arrived and found a fort. The patron’s thanks arrived a week later.', 'The wall held. The patron says the column was always going to come.'], withdrawn:['The fort is behind you. The relief column will find it empty and say so.'], fled:['The fort fell behind you. The Scribe wrote “withdrew in good order”, in pencil.']},
    hunt:{victory:['Every commander is accounted for. Nobody thought to ask the dead for a receipt.'], withdrawn:['The commanders will be there next time, and so will the camps.'], fled:['The camps are still there. So are the commanders.']},
    extract:{victory:['Three strongboxes, one road, and nobody left to ask where the coin came from.'], withdrawn:['The boxes are still in the ruin. So are the people picking over them.'], fled:['The strongboxes stayed where they were.']},
    escort:{victory:['The wagon arrived dented. The patron said it was fine. The patron has not looked at the wagon.'], withdrawn:['The wagon went on without you, or did not.'], fled:['The caravan went on without you, or did not. Nobody has written back.']},
    rescue:{victory:['The cages are open and the road is full of people walking in one direction.'], withdrawn:['Some of the cages are still shut. The Scribe has counted them.'], fled:['The cages are still shut. The Scribe has counted them twice.']},
    assassinate:{victory:['The mark is dead. The patron will not ask how.'], withdrawn:['The mark will hear about this.'], fled:['The mark is alive and now knows your name.']},
    purge:{victory:['The nests are ash. The ground is quiet, which is the only thing it was ever asked to be.'], withdrawn:['The nests will fill again.'], fled:['The nests are still there, and busy.']},
    sabotage:{victory:['The engines burned well. The smoke was visible for a day.'], withdrawn:['The engines still stand. They will be finished by spring.'], fled:['The engines are intact, and the camp is awake.']},
    beacons:{victory:['The beacons burn. Someone, somewhere, is looking at them and drawing a conclusion.'], withdrawn:['The beacons went out one by one.'], fled:['The beacons are cold. The hills were not ours.']},
    relic:{victory:['The relic is home. It is heavier than it looked, and so is the patron’s gratitude.'], withdrawn:['The relic is still in the ruin.'], fled:['The relic stayed where it lay.']}
  };
  const FALLEN_LINE = ['Nobody was happy with the result, including the Scribe, who wrote it down anyway.', 'The squad was overrun. The Scribe has begun a new page.'];
  if (typeof contractDebrief === 'function'){
    const f = contractDebrief;
    contractDebrief = function(c, result, lines){
      f(c, result, lines);
      try {
        if (story() || !c || !RESULT[c.obj] || c.finale) return;
        const pool = result === 'fallen' ? FALLEN_LINE : (RESULT[c.obj][result] || (result === 'victory' ? null : RESULT[c.obj].fled));
        if (pool) lines.push(`<p class="sx"><i>${pick(pool)}</i></p>`);
      } catch (e) { console.warn('story contractDebrief', e); }
    };
  }

  /* ---- debrief: assault lines (STORY-02), works line (STORY-08) ------- */
  const WORKS_FLAVOUR = {
    blacksmith:'The forge is lit. Everyone suddenly has something that needs mending.', chapel:'A small roof and a small bell. The camp is quieter than it was.',
    tavern:'The first barrel is tapped. The Bard has already moved his log.', palisade:'The gate has a bar now. The first thing the squad does is lean on it.',
    hospital:'The beds are made. Nobody wants to be the first to use one.', kitchen:'Something is cooking. It is not yet clear what.',
    training:'The yard is marked out. The first bruise is already on the books.', stables:'The stalls smell of straw and opinions.',
    watchtower:'The tower has a ladder and a view. The view is mostly weather.', magetower:'The tower has a door and a smell. The door is kept shut.',
    graveyard:'It is only a fence. Nobody walks across it.', default:'The builders have gone. The Scribe has counted the nails.'
  };
  const worksFlavour = ids => { const id = (ids || []).find(i => WORKS_FLAVOUR[i]) ; return WORKS_FLAVOUR[id] || WORKS_FLAVOUR.default; };
  let lastDone = [];
  if (typeof tickBuilds === 'function'){
    const f = tickBuilds;
    tickBuilds = function(){
      const before = META && META.build ? Object.keys(META.build) : [];
      lastDone = before.filter(id => { try { return buildLeft(id) <= 0 && !has(id); } catch (e) { return false; } });
      f();
    };
  }
  if (typeof campNote === 'function'){
    const f = campNote;
    campNote = function(msg){
      try {
        if (typeof msg === 'string' && /is finished\.$|are finished\.$/.test(msg) && lastDone.length){
          const d = document.getElementById('screen-debrief');
          if (!d || d.classList.contains('hidden')) msg += ' ' + worksFlavour(lastDone);
        }
      } catch (e) {}
      return f.call(this, msg);
    };
  }
  if (typeof renderDebrief === 'function'){
    const f = renderDebrief;
    renderDebrief = function(h, l){
      try {
        if (Array.isArray(l) && !l.some(x => /class="sx/.test(x))){
          l = l.slice();
          const wi = l.findIndex(x => /<b>Works<\/b>/.test(x) && /is finished/.test(x));
          if (wi >= 0 && lastDone.length) l.splice(wi + 1, 0, `<p class="sx"><i>${worksFlavour(lastDone)}</i></p>`);
          if (story() && G && G.contract && G.contract.obj === 'siege'){
            const C = CP(), A = ASSAULTS[G.contract.assault], T = A && ASSAULT_AFTER[A.name];
            if (T){
              const win = l.some(x => /the town holds\./.test(x)), at = l.findIndex(x => /is over:/.test(x));
              const extra = [`<p class="sx"><i>${win ? T.win : T.loss}</i></p>`];
              if (l.some(x => /Orsolt the Hollow Reeve is dead/.test(x))) extra.push(`<p class="sx"><i>${ORSOLT.slain}</i></p>`);
              else if (l.some(x => /Orsolt the Hollow Reeve is still standing/.test(x))) extra.push(`<p class="sx"><i>${ORSOLT.fled}</i></p>`);
              l.splice(at >= 0 ? at + 1 : l.length, 0, ...extra);
              const rl = REEVE_AFTER[A.name]; C.lastReeve = rl || null;
            }
          }
        }
      } catch (e) { console.warn('story renderDebrief', e); }
      return f.call(this, h, l);
    };
  }

  /* ---- STORY-03 / 15: named enemies, nemeses --------------------------- */
  const VOICE = [
    [/^Orsolt the Hollow Reeve has seen you\.$/, 'Orsolt walks to the front of his own levy and does not look back at them.'],
    [/^Strategos Ilvaryn has seen you\.$/, 'Ilvaryn has brought a banner and a proper line. He is the first one tonight who looks as if he is enjoying it.'],
    [/^Orsolt the Hollow Reeve falls\.$/, 'The levy go still. For a moment nobody is driving them.'],
    [/^Strategos Ilvaryn falls\.$/, 'The Strategos goes down. His line does not break; it simply stops, as if someone had put down the pen.'],
    [/^Khan Duruk's orc riders hit the host from behind!$/, 'Horns, from behind the host. Khan Duruk has kept his promise.']
  ];
  const TAUNT = {
    bandits:['You owe me a camp.', 'I remember your faces. I have had time.'], hollow:['The tithe is never paid in full.', 'You took my levy. I have more.'],
    deserters:['I drew my last pay from your patron.', 'You wear the same road I do.'], greenskins:['You smell like last time.', 'We counted. You are fewer now.'],
    monsters:['It remembers you.', 'The ground here remembers you too.'], skulkcrew:['Reynard’s people never forget a face.'],
    cabal:['The circle remembers every ward you broke.'], freecompany:['That was our job.']
  };
  if (typeof note === 'function'){
    const f = note;
    note = function(t){
      f(t);
      try {
        if (typeof t !== 'string' || !G) return;
        for (const [re, line] of VOICE) if (re.test(t)) return f(line);
        const m = /^(.+) remembers the Chapter\. Your nemesis is here\.$/.exec(t);
        if (m){ const h = G.contract && G.contract.host; return f(pick(TAUNT[h] || TAUNT.bandits)); }
        if (/, your nemesis, will trouble the Chapter no more\./.test(t)) return f('The Scribe closes a page he was fond of.');
      } catch (e) {}
    };
  }

  /* ---- STORY-16: variety --------------------------------------------- */
  try {
    const add = (o, k, a) => { (o[k] = o[k] || []).push(...a); };
    add(BARK_RACE, 'HUMAN', ['Everyone I know has a brother in a worse company.', 'Pay on the day. That is all I ask of a war.']);
    add(BARK_RACE, 'SUN_ELF', ['There is a word for this weather in Sunlit. It is not a kind word.', 'I did not know a wet blanket could be a career.']);
    add(BARK_RACE, 'GREY_ELF', ['I have read the contract. The contract is lying politely.', 'Every argument here could have been a letter.']);
    add(BARK_RACE, 'DARK_ELF', ['Daylight is a rumour you people have chosen to believe.', 'You would not recognise a good ambush if it fell on you.']);
    add(BARK_RACE, 'ORC', ['If it cannot be ridden, it can be eaten, or avoided.', 'A fight that ends before supper is a good one.']);
    add(BARK_RACE, 'GOBLIN', ['Who put the shiny thing there? Who is asking?', 'I counted the Treasury. It is fine. It is fine now.']);
    add(BARK_RACE, 'HOBGOBLIN', ['Dress the line. Dress it again.', 'A tidy camp is a living camp.']);
    add(BARK_RACE, 'DWARF', ['A wall is only a promise made of stone.', 'The beer is the first honest thing in this camp.']);
    add(BARK_RACE, 'GNOME', ['I have a theory. It is incomplete. It is loud.', 'Do not look at that. It might look back.']);
    add(BARK_RACE, 'HALFLING', ['Somebody ought to count the spoons.', 'The soup tastes better when nobody asks about it.']);
    add(BARK_CLS, 'FREEMAN', ['A day’s pay for a day’s work. I like a short contract.']);
    add(BARK_CLS, 'OUTCAST', ['I have had worse roofs. I have had better company.']);
    add(BARK_CLS, 'NOBLE', ['The blade I can manage. The porridge is another matter.']);
    add(BARK_CLS, 'SLAVE', ['I count the doors in every room. Old habit.']);
    add(BARK_CLS, 'DEVOUT', ['The gods are patient. I am working on it.']);
    add(BARK_CLS, 'EDELOS', ['The old regiment would not recognise us. I would not tell them.']);
    add(BARK_REGION, 'heartland', ['Too many fences in the Heartland. Nowhere to run.']);
    add(BARK_REGION, 'marches', ['The Marches changed their minds about the border again.']);
    add(BARK_REGION, 'mendor', ['The Mendor bells ring on the hour. You stop hearing them, then you hear them again.']);
    add(BARK_REGION, 'spine', ['Old stone on the Spine. It watches the road.']);
    add(BARK_REGION, 'frost', ['The Frost-Vault wind goes through leather as if it were paper.']);
    add(BARK_REGION, 'freelands', ['Suderian bread is the best thing about the war.']);
    BARK_VET.push('Varnholt had a silver mill. I remember the sound of it.', 'Twelve nights to Kalloon, and nobody lost count.');
    if (typeof BARD_LINES !== 'undefined') BARD_LINES.push('I am working on a song about the road. It rhymes with mud.', 'The verse about the Reeve is not complimentary.', 'Somebody ought to write down the dead. I will sing them.');
  } catch (e) { console.warn('story barks', e); }

  // Alternate contract briefs: same facts, a second voice. Mechanics stay in the text.
  try {
    const alt = {
      hold:c => `The old fort at ${c.place} will not hold itself. Keep it until the relief column arrives; ${HOSTS[c.host].the} will send two commanders to take it from you.`,
      hunt:c => `${cap(HOSTS[c.host].the)} are dug in around ${c.place}. Find every camp and kill every commander.`,
      extract:c => `There are three strongboxes in the ruins of ${c.place}. Open them and leave by the road you came in on. ${cap(HOSTS[c.host].the)} are there first.`,
      escort:c => `A caravan of ${c.cargo} goes ${DIRS[c.dir]} through ${c.place}, and ${HOSTS[c.host].the} are waiting in the trees. If the wagon burns, the job is lost.`,
      rescue:c => `${c.town} is in ruins, and ${HOSTS[c.host].the} hold ${HOSTAGE_FOLK[c.hostFaction]} in cages there. Open them and get everyone to the road. ${cap(facName(c.hostFaction))} will remember it.`,
      assassinate:c => `A commander of ${HOSTS[c.host].the} is passing through ${c.place} with a bodyguard. Kill them before they leave the map. They run the moment they see you.`,
      purge:c => `${cap(HOSTS[c.host].the)} are breeding in ${c.place}, and each ${HOSTS[c.host].den} sends more until it is destroyed. Destroy every one.`,
      sabotage:c => `${cap(HOSTS[c.host].the)} are building siege engines at ${c.place}. Get into the camp, burn them all, and get out again.`,
      beacons:c => `Three beacons stand above ${c.place}. Light all three; ${HOSTS[c.host].the} hold the hills and will fight for each, but a lit beacon stays lit.`,
      relic:c => `${cap(c.relic)} lies in a ruin at ${c.place}, with ${HOSTS[c.host].the} standing guard. Take it home. It is heavy, and they will follow.`
    };
    for (const k in alt) if (CONTRACTS[k]){
      const orig = CONTRACTS[k].desc;
      CONTRACTS[k].desc = c => (Math.random() < 0.5 ? alt[k](c) : orig(c));
    }
  } catch (e) { console.warn('story briefs', e); }
})();

/* ============================================================================
   INDEX 85b - J-16: CAYDE'S TITLE MATCHES THE MANUAL
   The Manual keeps "Reynard" secret and calls Cayde Grand Master of the Grey
   Cloaks. HEROES.cayde.title is the one source for hero cards, the founding
   chair screen, the Chapter Master panel, the Epilogue and the Elder panel.
   A saved Elder carries its own copy of the title, so that is cleaned up too.
   ROLLBACK: delete this block.
============================================================================ */
(function(){
  const NEW = 'Grand Master of the Grey Cloaks';
  try { if (HEROES && HEROES.cayde) HEROES.cayde.title = NEW; } catch (e) {}
  const fix = s => typeof s === 'string' ? s.replace(/Reynard, Grand Master of the Dust Cloaks/g, NEW) : s;
  try {
    if (typeof elderHTML === 'function'){ const f = elderHTML; elderHTML = function(){ try { if (META && META.elder) META.elder.title = fix(META.elder.title); } catch (e) {} return fix(f()); }; }
    if (typeof loadMeta === 'function'){ const f = loadMeta; loadMeta = function(){ const r = f.apply(this, arguments); try { if (META && META.elder) META.elder.title = fix(META.elder.title); } catch (e) {} return r; }; }
  } catch (e) { console.warn('story cayde', e); }
})();

/* ============================================================================
   INDEX 85c - J-17: ORSOLT AND ILVARYN STAY DEAD AFTER THE PROLOGUE
   The game already rolls a fresh name for every commander (commanderName,
   NAME_RULES). Two faults: the prologue's own Orsolt and Ilvaryn were being
   renamed at random too, and the Hollow name pool could still roll "Orsolt".
   Now: in the prologue they keep their own names; in every later contract the
   Hollow and Frost-Vault bosses are named lieutenants of the same host, each
   with a one-line voice when they see you and when they fall.
   ROLLBACK: delete this block.
============================================================================ */
(function(){
  const LT = {
    orsolt:[
      ['Wendel the Hollow Bailiff', 'Wendel counts the levy as they pass him. He is not counting for their sake.', 'The bailiff stops counting.'],
      ['Mabry the Hollow Sexton', 'Mabry rings a small bell at the back of the levy. The levy walk faster.', 'The bell stops.'],
      ['Corvin the Hollow Warden', 'Corvin has the keys to a cage and the manner of a man who has lost the lock.', 'Corvin goes down with the keys still on his belt.'],
      ['Edda the Hollow Abbot', 'Edda blesses the levy with a wet hand. Nobody looks pleased about it.', 'Edda’s blessing runs out all at once.'],
      ['Ulric the Hollow Reeve', 'Another Reeve, same tithe, different coat.', 'The tithe goes uncollected.'],
      ['Sibyl the Hollow Warden', 'Sibyl keeps her levy in step with a tally stick and no kindness.', 'Sibyl’s tally stick cracks under her.']
    ],
    ilvaryn:[
      ['Strategos Aurelian Vask', 'Vask has brought a banner and a proper line, and the line is looking at you.', 'Vask’s line wavers, then holds out of habit.'],
      ['Strategos Thessaly Orne', 'Orne is reading your formation the way you read a letter.', 'Orne falls, still annotating.'],
      ['Strategos Caldrus Veyne', 'Veyne does not shout. His line moves anyway.', 'Veyne goes quiet. The line takes a moment to notice.'],
      ['Strategos Maera Valdane', 'Valdane salutes you with the flat of her blade. She means it politely.', 'Valdane is down. The salute was sincere.'],
      ['Strategos Hadriel Sorn', 'Sorn has done this before, and says so by not hurrying.', 'Sorn falls; the line needs a moment to find a new opinion.']
    ]
  };
  const BY = {}; for (const k in LT) for (const [n, seen, fall] of LT[k]) BY[n] = {seen, fall};
  const FIXED = {orsolt:'Orsolt the Hollow Reeve', ilvaryn:'Strategos Ilvaryn'};
  if (typeof commanderName === 'function'){
    const f = commanderName;
    commanderName = function(k){
      if (!LT[k]) return f(k);
      try {
        if (typeof inStoryNow === 'function' && inStoryNow()) return FIXED[k];
        META.usedNames = META.usedNames || [];
        const free = LT[k].filter(x => !META.usedNames.includes(x[0]));
        const n = (free.length ? free[Math.random() * free.length | 0] : LT[k][Math.random() * LT[k].length | 0])[0] + (free.length ? '' : ' the Younger');
        META.usedNames.push(n); return n;
      } catch (e) { return f(k); }
    };
  }
  if (typeof note === 'function'){
    const f = note;
    note = function(t){
      f(t);
      try {
        if (typeof t !== 'string' || !G) return;
        const key = s => s.replace(/ the Younger$/, '');
        let m = /^(.+) has seen you\.$/.exec(t); if (m && BY[key(m[1])]) return f(BY[key(m[1])].seen);
        m = /^(.+) falls\.$/.exec(t); if (m && BY[key(m[1])]) return f(BY[key(m[1])].fall);
      } catch (e) {}
    };
  }
})();

/* ============================================================================
   INDEX 85d - J-18: PROLOGUE COLD OPEN, VERSION 1 (text and one panel)
   - The intro and the muster text say the company was on the north road when
     the smoke rose (two came with you; two are hires from the mill camp).
   - Before Day 1, once, a short arrival card: the man in the good coat and
     the Reeve's "you are a beginning". It reuses askConfirm; "Back to the
     market" returns to the Charter Kit panel.
   - On Day 1 the Sergeant points at the three jobs the Reeve asked for.
   No change to days, assaults, saves or the fight. ROLLBACK: delete this block.
============================================================================ */
(function(){
  const sw = s => typeof s === 'string' ? s : '';
  if (typeof openStoryIntro === 'function'){
    const f = openStoryIntro;
    openStoryIntro = function(){
      f();
      try {
        const ti = document.getElementById('title-inner');
        if (ti) ti.innerHTML = ti.innerHTML.replace('happened to be camped by the mill when the smoke rose in the north', 'happened to be on the north road when the smoke rose');
      } catch (e) {}
    };
  }
  if (typeof storyMusterHTML === 'function'){
    const f = storyMusterHTML;
    storyMusterHTML = function(){
      return sw(f()).replace('two companions and two hires, camped by the mill when the smoke rose.', 'two companions who came down the road with you, and two hires from the camp by the mill.');
    };
  }
  if (typeof startSiege === 'function'){
    const f = startSiege;
    startSiege = function(){
      const C = CP();
      if (C && !C.arrived && typeof askConfirm === 'function'){
        return askConfirm('Varnholt', 'You come in off the north road at dusk with smoke behind you. A man in a good coat is standing on the gate step, counting heads.<br><br><i>“The Reeve will see you now,” he says. “He says he has a purse, a mill and no soldiers. He says you are a beginning.”</i>',
          () => { C.arrived = true; f(); }, {ok:'ENTER THE GATE', cancel:'BACK TO THE MARKET'});
      }
      return f();
    };
  }
  if (typeof coachLines === 'function'){
    const f = coachLines;
    coachLines = function(){
      const out = f();
      try {
        const C = CP();
        if (C && C.part === 'siege' && C.day === 1) out.unshift('The Reeve asked for three things: <b>Scout</b> the north road, <b>Rally the Town</b> for spears, and <b>Ditch and Stakes</b> for the gate. Start there.');
      } catch (e) {}
      return out;
    };
  }
})();
