# Dust Cloaks: balance audit (Game Balancer)

Scope: economy, progression, difficulty, plus the two extra questions from the Gemini playtest. Read-only. I did not edit `index.html` and did not run any git commands that change state. Line numbers refer to `index.html` as of this audit.

## Summary (five lines)

1. The economy is tight for the first ~6 contracts and a glut after that. A Tier-1 win nets about 315gp. Costs are flat while Tier 2/3 pay 2.25x and 4.5x, so gold stops mattering around contract 12–15. There is no late sink.
2. The biggest difficulty problem is the host, not the tier. At Tier 1 with identical gear and pay, a test squad lasted over 90s against the Hollow, 68s against Bandits, and 27–35s against Monsters, Greenskins, Orcs and Arcana.
3. Build times (1–3 seasons) are fine. Gold, not time, is the binding limit early, and there is no cap on parallel builds. The 15gp-per-season upkeep is gentle: about 5% of Tier-1 income per staffed facility.
4. Departures from the tabletop worth fixing: hazard upkeep is charged per survivor, not per deployed Squad Mate; Merchant Stalls lack the tabletop's 10% market discount; the Masterwork Full Plate sink is missing. The others (100% of pay to one Treasury, tiers gated by leader level) look deliberate.
5. Prologue: yes, give new players a fixed default kit (Brigandine, Heavy Shields, Spears, Shortbows = 200gp) and cap customisation at the tabletop's 350gp. Three archetype builds are in section 3.

Top three: **BAL-01** (host difficulty spread), **BAL-02** (prologue default kit and 350gp cap), **BAL-03** (three archetype starts).

---

## 0. Method and limits (read before trusting any number)

- **Code reading** for all prices, pay, upkeep, raids and momentum, cross-checked against the tabletop Players Manual (2026-10) and GDD v1.4. I extracted the .docx text without trouble. The relevant manual sections are 1.7 and Table 1.4 (starting funds), 1.9 (four starting kits), 3.x (gear), 4.2 (Equal Squad Dividend), 4.4 (facilities) and 11.1 (tier payouts).
- **Headless simulation** in the browser pane at localhost:8765. I called `startDeployment` and `update()` with a deliberately crude bot. It walks the leader at the nearest enemy and always picks the first momentum choice. It never braces, kites, uses abilities or spends Luck. It stands in for "a squad that charges in". Treat results as relative (same bot, same squad, one variable changed). Absolute seconds mean nothing.
- Sample sizes are 3–10 runs per cell and the noise is large (about ±15s). I only call something a finding when the gap is 2x or more, or when the code says so directly. Smaller gaps are marked "indicative".
- The sim writes to a throwaway key (`SAVE_KEY='sim_bal'`) in the page, so the real saves are untouched.
- Co-op multiplayer is out of scope, as instructed.

---

## 1. Income and expense model (average early campaign)

Assumptions: the squad wins, 4–5 Squad Mates deployed, board contracts rolled at random (so the mean base pay is 290gp across the ten kinds: hold 260 average, the rest 270–320).

Per-contract flows (code: debrief at lines 5518–5534; `makeContract` line 3056; `TIER_PAY` line 460):

| Line | Tier 1 (contracts 1–6, leader L1–2) | Notes / code |
|---|---|---|
| Contract pay | **+290** | `c.pay` = base x `TIER_PAY[tier]`; +20% with the "Better Terms" edge |
| Quick Salvage | +29 | 10% of `c.pay` (matches manual 4.8) |
| Field coin | +20 to +65 (use +40) | Measured 0.35–0.45gp per kill; coin drops 32% of kills (line 2431) |
| Merchant Stalls | +15 (once built) | line 5528 |
| Hazard Upkeep | **−40 to −50** | 10gp per *surviving* Squad Mate (line 5529) |
| Civilian upkeep | −15 per staffed facility | `UPKEEP_EACH`, line 15935, charged after every deployment |
| Prisoners (no Cells) | −5 each | line 5532 |
| **Net before civilian upkeep** | **about +315** | |

Spend side (all one-off unless stated): hire 10gp (5 for a Noble), reroll the hiring line 15gp, Advancement `6+4n` (line 1568), training 50–100gp, a Specialty ability 80gp, doctrines 100–180gp (12 of them, 1,550gp in total), facilities 5,270gp in total including Huts, Bunks, Fortress Church, Defences, Kennels and Edelos Wagons. Armour and weapons run from 30gp to 2,200gp (Half-Plate).

Cumulative earnings if every contract is won, with tier access by leader level (`rollBoard`, line 1573: Tier 2 from L3 and Tier 3 from L5; leader level rises every 3 ticks, so L3 is about contract 7 and L5 about contract 13):

| Phase | Mean tier multiplier | Net per contract | Running total |
|---|---|---|---|
| Start | n/a | n/a | 200 |
| Contracts 1–6 (T1 only) | 1.0 | about 315 | about 2,100 |
| Contracts 7–12 (T1/T2) | 1.63 | about 530 | about 5,300 |
| Contracts 13+ (T1/T2/T3) | 2.58 | about 860 (a T3 win is about 1,400) | about 12,000 by contract 20 |

Reading it: total sinks are roughly 5,270 (facilities) + 1,550 (doctrines) + 2,200 (Half-Plate) + training and mounts, which is 12,000+. By contract ~13 the player can afford nearly everything on offer. After that, gold only matters through raids (BAL-12). If the player builds every staffed facility with civilians, upkeep is 14 x 15 = **210/season**. That is 67% of a Tier-1 net but only about 25% of an average mid-campaign one.

Failure cost: a lost or fled contract pays nothing, but `civilUpkeep` still charges (line 16190, hooked after every deployment). With 8 staffed facilities that is −120 on a loss against +315 on a win, a 435gp swing.

Tabletop comparison (manual 4.2 and 11.1): the tabletop pays Tier 1 at 400–800gp per *job for 3–4 squads*, with 25% to the Chapter and 75% split between squads. A solo player in the tabletop would take the whole payout. The game's 290 is at or below that floor, so the game is **not** more generous than the tabletop. The Equal Squad Dividend is simply collapsed into one Treasury (a sound simplification for one player). `TIER_PAY` 1 : 2.25 : 4.5 is below the tabletop midpoint ratio of 1 : 2.25 : 5.4, so the multipliers look intentional.

---

## 2. Difficulty evidence (bot sim, same 5-person squad, same gear unless stated)

Tier-1 "hunt" contract, Studded Brigandine + Heavy Infantry Shields + Spears + Shortbows, 5 runs per host, 90s cap:

| Host | Avg survival | Kills | Squad deaths |
|---|---|---|---|
| Hollow dead | **90s (no losses, hit cap)** | 178 | 0.0 |
| Bandits | 68s | 159 | 1.2 |
| Deserters | 48s | 66 | 1.6 |
| Greenskins | 35s | 59 | 2.0 |
| Orcs | 30s | 35 | 1.8 |
| Monsters | 27s | 69 | 1.6 |
| Arcana Guild | 27s | 34 | 2.2 |

Pay is identical for all of them. Tier scaling at fixed gear and Bandits: T1 about 84s, T2 61s, T3 19s. That is a steep T3 step but it is opt-in, because the board offers three contracts, and it is priced at 4.5x.

Spec and race spread (Soldier, brigandine kit, 6 runs): Soldier 65s, Folk Hero 59s, Scoundrel 74s, Cleric 71s, Mage 70s, Witch 86s. That is inside the noise except the Witch, which is indicative only. Races (Soldier, 4 runs): Goblin 40s and Zuhri 39s sit well below the rest (53–77s). I trust the Goblin result (Con −1, Melee −1, Move 3). Zuhri has no obvious reason to be weak, so I treat it as noise. I found no dominant race.

---

## 3. Extra question A: three archetype starts

Pricing uses the game's `GEAR` table (lines 350–380), which matches the manual's Chapter 3 prices. Kit day ignores facility requirements, so all three are buyable at the prologue shop. The default free gear (Padded Gambeson, Light Bucklers, Spears, Shortbows) is already owned, so only the extras cost gold. Stats are from the game's own `leaderStats`.

| Archetype | Leader (race / class / spec) | Stats at L1 | Kit | Cost | First ability |
|---|---|---|---|---|---|
| **Vanguard Soldier** | Human Freeman Soldier | Con 6, Melee 2, Ranged 2, Luck 2, Per 2, Move 4 | Studded Brigandine, Heavy Infantry Shields, Infantry Spears, Shortbows; kit: Siege Tower Shield | 260gp | Shield Wall Mastery |
| **Folk Archer** | Human Freeman Folk Hero (the manual's own worked example, Cayde Hallinan) | Con 5, Melee 2, Ranged 2, Luck 2, Per 3, Move 4 | Studded Brigandine, Light Bucklers, Infantry Spears, Longbows | 310gp | Rallying Cry |
| **Battle Cleric** | Human Devout Cleric | Con 5, Melee 1, Ranged 1, **Magic 2**, Luck 2, Per 2, Move 4 | Studded Brigandine, Heavy Infantry Shields, Infantry Spears, Shortbows; kit: Caster Focus | 265gp | Litany of the Shield |

Why these are fair:
- All three cost 260–310gp, inside the tabletop's 350gp Standard Charter Kit, leaving 40–90gp for hires or the Treasury.
- All use Brigandine (AC 5). In the sim, AC 4 to AC 5 was the single largest early gain, worth about 15–25s of survival. Heavy Chainmail or Chain Shirt added little for much more money (chain shirt kit about 66s against brigandine's 70s, at +90gp). So none of the three is a trap and none is the best money can buy.
- Human with Freeman is the neutral, representative start (Adaptable +1 Melee/+1 Ranged, +1 Con). A Dwarf or Orc would be stronger, but Humans keep the archetypes teachable. The Cleric's Devout class gives Magic 2 at creation, which the Chapel otherwise sells for 100gp or more.
- I did not use Heavy Greatswords, Warhorses or Chain Shirt: each costs more than the others and nets less per gp than armour.
- Bot results for these exact builds (5 runs, Bandits T1): Vanguard about 55s, Archer about 55s, Cleric about 78s. The Cleric is stronger mainly because it carries Brigandine and Heavy Shields together. If the commander wants parity, change the Archer to Brigandine plus Heavy Infantry Shields and keep Shortbows (200gp). The sim says the Longbows contribute little to a crude bot, but they will matter to a human who kites. Treat the 310gp Archer as the design choice and the 200gp one as the safe alternative.

---

## 4. Extra question B: the prologue's 850gp charter-kit shop

Today (`newStory`, line 7413; `cpkit` screen, line 8314; `gearClick`, line 8368): the player gets 850gp and a shop that ignores facility requirements. The comment says "200 Chapter + 300 the Reeve's town works + the 350gp Standard Charter Kit". **Nothing in the code enforces that split.** The whole 850 is one balance, and only two things limit spending: the 850 and the price list.

Problems:
1. A novice can burn nearly everything on one item. Heavy Chainmail 520 + Greatswords 160 + Longbows 160 = 840gp, leaving 10gp. Munitions cost 30gp each and Fire Pits 25gp each (line 8545), so the player cannot fund the siege prep, and leftover gold carries into the main game (`META.treasury = 200 + gold`, line 8812).
2. Metal gear is only buyable *at that screen*. After the kit day it needs Smithy Row and Work Orders (line 8371). The shop is a one-shot, irreversible decision with 20+ cards the player cannot yet judge.
3. The shop shows horses (120/220/480gp) to a squad about to defend a palisade on foot.

Recommendation: **yes, make a fixed default kit, and cap customisation.**
- Default kit, pre-equipped: Studded Brigandine (150), Heavy Infantry Shields (50), Infantry Spears (free), Shortbows (free). Total 200gp. Treasury after: 650gp.
- Offer a "Customise" button that opens the existing shop, capped at 350gp of *gear* spending in total (the tabletop's Standard Charter Kit). The other 500 stays in the Treasury for the siege (munitions, fire pits) and carries into the main game.
- Optionally offer the three archetype kits (section 3) as one-click presets on the same screen.
- Hide mounts on the kit day (the siege is fought on foot behind a palisade).

---

## 5. Prioritised findings

Priority order is my judgement of player impact versus effort. "Delegate" means a Sonnet session could do it safely from this description. "Commander" means it touches design or several systems.

### BAL-01. Host difficulty spread at Tier 1 (same pay for very different danger)
- **Evidence:** section 2 table. Hollow lasts over 3x longer than Monsters or Arcana at the same pay. Pay is set by kind and tier only (`makeContract`, line 3056) and the host is picked uniformly from `HOST_KEYS` (line 3057). The T1 pools are overridden at lines 3797–3802 (and 11524, 18332 for Orcs and Arcana): Monsters `['wolf','spider','cinder','spider']` has three of four units moving at speed 1.25–1.55, Orcs T1 contains two `hobgob` (a tier-2 stat block: AC 5, skill 3), and Arcana T1 is `['crossbow','enforcer','hedgewitch']` (two ranged or casting units of three). When I swapped one fast unit for a slow `levy`, survival roughly doubled (Monsters 27s to 69s, Greenskins 33s to 68s).
- **Proposed change (pick one, or both):**
  - (a) Host pay multiplier applied in `makeContract` after tier: `HOST_PAY = {hollow:0.9, bandits:1.0, deserters:1.05, greenskins:1.15, orcs:1.2, monsters:1.2, arcana:1.2}` (other hosts 1.0). Show it on the board card.
  - (b) Ease the hardest Tier-1 pools: Monsters `['wolf','spider','cinder','levy']`; Orcs `['hobgob','wolf','goblinsniper','levy']`; Arcana `['crossbow','enforcer','hedgewitch','brigand']`. Keep Tier 2/3 as they are until measured (I only measured Tier 1 across hosts).
- **Expected effect:** the first six contracts stop being a coin flip decided by the host roll; a new player's early deaths drop.
- **Effort:** S for (a), S for (b) (pool arrays only).
- **Owner:** delegate for (b); commander for (a) because it touches the board UI and save format (`c.pay` is stored per contract).

### BAL-02. Prologue: fixed default kit and a 350gp gear cap
- **Evidence:** section 4; lines 7413, 8314, 8368–8381, 8812.
- **Proposed change:** pre-equip Brigandine + Heavy Infantry Shields (200gp). Add a `kitGearSpent` counter on `META.cp`; `gearClick` during `C.part === 'kit'` refuses a purchase that would push it past 350. Hide the `mount` slot on the kit screen. Show "Reserved for the siege: 500gp" on the card.
- **Expected effect:** a novice cannot strand the Chapter with 10gp, the first purchase is sensible, and the 200/300/350 split in the comment becomes real.
- **Effort:** S–M.
- **Owner:** commander (touches the story flow and the start of the first-run experience).

### BAL-03. Three archetype starting leaders
- **Evidence:** section 3. Squad Leader creation is fully open (6 specs x 6 classes x 16 races) with no guidance on which are strong or traps.
- **Proposed change:** add three presets to the leader creation screen that fill race, class, spec, first ability and kit exactly as in the section 3 table (Vanguard Soldier 260gp, Folk Archer 310gp, Battle Cleric 265gp). The player can still edit afterwards.
- **Expected effect:** a working first squad in one click, with builds that are neither optimal nor traps.
- **Effort:** M (UI plus wiring into `makeLeader` and `META.gear.owned`).
- **Owner:** commander (UX and first-run flow).

### BAL-04. Late-game gold glut: add a sink
- **Evidence:** section 1 table (about 12,000gp of sinks, available by contract ~15–20, and income about 860/contract mid-campaign). The game's `GEAR` stops at Half-Plate (2,200gp); the manual lists Masterwork Full Plate at 4,000gp ("Heavy Tier 4", AC 6, −3 steps, Grazing = 0 unless Natural Max Face, and the first Solid Hit against the squad each round is downgraded).
- **Proposed change:** add `{id:'fullplate', slot:'armour', name:'Masterwork Full Plate', cost:4000, ac:6, shift:3, mv:-2, req:['blacksmith'], graze0:true, firstHitDown:true}`. Do **not** touch `TIER_PAY`, which already sits below the tabletop's ratio. Optionally add a 400–600gp "Retinue Banquet" style sink such as a luck-restoring feast. That is a design call.
- **Expected effect:** the long-run economy has a goal in the last third; a tabletop item returns.
- **Effort:** M (the "first Solid Hit downgraded" rule needs combat code).
- **Owner:** commander.

### BAL-05. Hazard upkeep charged per survivor, not per deployed Squad Mate
- **Evidence:** line 5529 uses `survivors.length`. Manual 4.2: "10gp Hazard Upkeep per deployed Squad Mate (30gp for 3 mates; 50gp for 5 mates)" and "casualties never shrink your squad's gross share". As coded, a death saves 10gp, and a squad that loses two mates saves 20gp.
- **Proposed change:** `survivors.length` to `G.squad.length` in that line (and in `forecast()`, line 24881, which already uses available mates).
- **Expected effect:** fixes an accidental departure and a small perverse incentive (casualties raise net pay by 10gp each). Net effect on an average win is about −5gp.
- **Effort:** S.
- **Owner:** delegate.

### BAL-06. Merchant Stalls: add the tabletop's 10% market discount
- **Evidence:** manual Table 4.3: Merchant Stalls give +15gp per contract and "Town Market gear costs 10% less". The game's description and `gearPrice` (line 5337) have only the +15. At 140gp for +15 a season, the payback is 9+ seasons, longer than the Tier-1 phase, so on its own it is a trap.
- **Proposed change:** in `gearPrice` add `if (has('merchant')) k *= 0.9;` (it stacks multiplicatively with the others). Update the facility description. Keep +15.
- **Expected effect:** a real reason to build it before the first big armour purchase (a 10% saving on a 520gp Heavy Chainmail is 52gp).
- **Effort:** S.
- **Owner:** delegate.

### BAL-07. Hold the Redoubt pays the least per minute
- **Evidence:** line 3069: hold pays 200 / 260 / 320 for 6 / 8 / 10 minutes (about 32–33gp per minute, with two commanders arriving). The other nine kinds pay 270–320 and are structured objectives that end when done. Pay differs by only about ±8% across kinds despite very different length and difficulty.
- **Proposed change:** hold `{6:240, 8:300, 10:360}`.
- **Expected effect:** hold becomes a fair pick, not a trap, without moving average income much (mean base pay goes from 290 to 296).
- **Effort:** S.
- **Owner:** delegate.

### BAL-08. A lost or fled contract still costs full civilian upkeep: soften the spiral
- **Evidence:** `civilUpkeep` (line 16190) runs after every deployment. With 8 staffed facilities that is −120 on a loss, plus the shortfall carried as `upkeepDebt` out of the next contract (line 16196). Combined with a 30% raid loss (BAL-12) a bad run snowballs.
- **Proposed change:** after a `fallen` or `fled` result, charge half the civilian upkeep (rounded down). Cap carried debt at two seasons' worth.
- **Expected effect:** a lost contract no longer swings the Treasury by about 435gp; the death-spiral risk drops for facility-heavy campaigns.
- **Effort:** S.
- **Owner:** delegate.

### BAL-09. Raid payoff is 30% of the whole Treasury, uncapped
- **Evidence:** `payOffRaid` (line 6519) and `raidDebrief` (line 6686) take `round(treasury x 0.3)`. At 3,000gp that is 900gp, while the defend reward is `60 x tier` (line 6509). Frequency: 12% a contract from contract 3 (`rollRaid`, line 6497), plus 20% per hostile faction, capped at 55%, plus rival raids up to 60%. The frequency itself looks fine.
- **Proposed change:** loss = `min(30% of treasury, 250 x tier)`. Show the figure on the button (it already does).
- **Expected effect:** a rich Treasury no longer makes every raid a compulsory defence, while the choice still has teeth (250 / 500 / 750gp).
- **Effort:** S.
- **Owner:** delegate.

### BAL-10. Build times: keep, but note two cliffs
- **Evidence:** `buildSeasons` (line 24628): cost up to 150 is 1 season, up to 250 is 2, and over 250 is 3, with overrides for Kennels, Trap Yard, Edelos, Palisade (1) and Watchtower (2). In practice gold, not time, is the limit. A season is one contract, net income is about 315, there is no cap on parallel builds, and cancelling in the first season refunds in full (`buildRefund`, line 24647). Chains are long: Tents to Huts to Bunks is 5 seasons, and Chapel to Fortress Church is 5.
- **Proposed change:** no change to the table. Optional: make Blacksmith (250gp) 3 seasons to match its value as the gate to all metal armour, but only if the commander wants a slower mid-game. Fix wording: line 16214 and `upkeepLabel` say "a contract", the ledger says "a season". Use one word.
- **Expected effect:** n/a (confirms the new system is sound).
- **Effort:** S (wording only).
- **Owner:** delegate.

### BAL-11. Light Crossbows are dominated by Longbows
- **Evidence:** lines 363–364. Crossbow: 130gp, Dmg 3, Range 250, cooldown x1.3 (slower), +1 step only within 130px. Longbow: 160gp, Dmg 3, Range 370, ignores 1 armour step on a Critical. Both need Carpentry. For 30gp more the longbow is faster and longer-ranged with no downside.
- **Proposed change:** Crossbows `cost:110, dmg:4, range:260`. The slow reload then buys a harder hit, which is the crossbow's tabletop identity.
- **Expected effect:** a real choice between the two, with the crossbow the budget option.
- **Effort:** S.
- **Owner:** delegate.

### BAL-12. Armour Move penalty is meaningless for several races, which makes some armour tiers strictly dominated
- **Evidence:** movement is `Math.max(3, L.s.move + G.armour.mv)` (line 2134), the tabletop's "Min 3" rule. Dwarf, Gnome, Halfling and Goblin have Move 3, so they pay no penalty for any armour: Half-Plate (−2) is free for them. Humans (Move 4) see −1 and −2 as the same penalty, so Splint Mail (750gp, −2) beats Cuirass (950gp, −1) for them with identical effect.
- **Proposed change:** none to the rule (it is deliberate). Add a note on the quartermaster card ("no penalty for your race" or "Cuirass gives you nothing over Splint") so players do not overpay. Optionally lower Cuirass to 850gp.
- **Expected effect:** fewer wasted 200gp purchases; nothing else changes.
- **Effort:** S (UI note).
- **Owner:** delegate.

### BAL-13. Goblin (and possibly the Witch) look weak or strong in the sim
- **Evidence:** section 2. Goblin 40s against 53–77s for the other races. Witch leader 86s against 59–74s for the others.
- **Proposed change:** low confidence, do not change yet. If a human playtest agrees: Goblin Con −1 to 0, or Move 3 to 4. Playtest the Witch at Tier 2 first.
- **Effort:** S.
- **Owner:** commander (judgement call, needs a human playtest).

### BAL-14. Tier gating by leader level departs from the tabletop's Charter Rank
- **Evidence:** `rollBoard` (line 1573) opens Tier 2 at leader L3 and Tier 3 at L5. The manual (Table 11.1) gates by Charter Rank 3–4 and 5+. Leader level rises every 3 successful contracts, so Tier 2 arrives around contract 7 and Tier 3 around contract 13. A leader who dies resets the level.
- **Proposed change:** none recommended (looks deliberate, a sensible one-player simplification). Flag it in the Manual text so it is a known departure.
- **Effort:** S.
- **Owner:** commander.

### BAL-15. Plunder Management and Merchant-style income check (watch list)
- **Evidence:** Plunder Management (100gp, needs Command Tent) gives +30% coin and XP per rank. The XP half is the strong half (more momentum ranks). At about 40gp of field coin per contract the coin half is worth about 12gp.
- **Proposed change:** none yet. If playtests show XP snowballing, move the +30% to coin only.
- **Effort:** S.
- **Owner:** commander.

---

## 6. Things I checked and found fine (so nobody re-audits them)

- **Momentum pacing:** the XP curve (`xpNext` x1.25 + 20, line 3518) gives ranks at 60, 155, 294, 488, 750, 1,097 total XP. A T1 contract of 100–190 kills yields about 3–5 ranks, which matches the sim. The later `rollMomentum` (line 10282) caps each field order at 3 picks and tiers them blue/purple/gold, so Second Wind, Captured Supplies and Fortune Favours cannot be spammed (the older `max:99` entries at lines 3467 and 3471 are overridden).
- **Gear prices vs the manual:** all armour and the main weapons match Chapter 3 (Half-Plate 2,200, Heavy Chainmail 520, Longbows 160, and so on). Spears and Shortbows are free in the game but 45/100gp in the manual: a deliberate starter-kit simplification.
- **Facility prices and upkeep:** match Table 4.3 and 4.4 (15gp per staffed facility, 50gp Training Grounds drill). Tier payouts match the tabletop's ratio (see section 1).
- **Raid frequency:** reasonable. Raids only start after contract 3 and never on consecutive contracts (line 6497).
- **Hiring at 10gp** is cheap but matches the manual; it is not a balance problem because Hazard Upkeep is the real roster cost.
