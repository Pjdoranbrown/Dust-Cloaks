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
