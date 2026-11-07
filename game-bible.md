# Dust Cloaks — Game Bible

The single source of truth for design decisions. Keep entries short; link to `audits/` for detail.

## Pitch
A bullet heaven / action RPG adaptation of the Dust Cloaks tabletop game. Runs in the browser from `index.html`.

## Core loop
- Camp (the main menu) → Planning Table → sign one of three contracts on the board → fight in the field → debrief → back to camp. One contract is one season (Index 30 calendar).
- In the field: WASD moves the Squad Leader; the squad follows and fights on its own. Kills fill the Momentum bar; each rank pauses the fight to pick one of three choices (empower a known ability, or a field order) for that contract only. Luck is spent with Q or burned with R. SPACE braces into a Shield Wall.
- Win conditions depend on the contract kind (22 objective types in `OBJECTIVES`: 16 on the board, plus raids, the bar fight, the practice bout and the prologue siege, road and sortie). The contract is lost if the Leader dies or the whole squad is down.
- Coin picked up goes home with the pay and salvage to one Treasury. The Treasury pays for buildings, hires, gear and Doctrines. Upkeep: 15gp per staffed facility per season, plus 10gp per Squad Mate who comes home.
- Camp growth: buildings on any empty plot (1–3 seasons by cost; the Palisade and Watchtowers have fixed plots), veterans retire to staff them, and a Charter Ambition (Wealth, Fame, Liberation, Dominion) gives milestone perks.
- Between contracts: raids on the camp (gates and defences matter), the Rank'n tavern game, the bar fight, Faction Standing, prisoners and Parlay. Saves live in the browser (`localStorage`); the prologue has its own save slot.
- Detail: `audits/bugs.md` (what was tested and fixed), `audits/ux.md`.

## Characters & classes
- Six classes (Devout, Edelōs, Freeman, Noble, Outcast, Ex-Slave) set the camp bonus and background. Nine Specialties set the dice and kit: Soldier, Folk Hero, Scoundrel, Cleric, Mage and Witch fight (six abilities each); Edelōs Trader, Chapter Scribe and Camp Bard are camp roles.
- Sixteen races (Human, Sun/Grey/Dark Elf, Orc, Goblin, Hobgoblin, Dwarf, Gnome, Halfling, Half-Elf, Half-Orc and others) set Condition, Move, Melee/Ranged/Magic, Luck and Personality.
- The Squad Leader carries over between contracts; up to five Squad Mates march (roster cap is 5 plus bench). Advancements, abilities, spells and Doctrines are earned in camp and kept.
- Combat follows the tabletop: a Shifted d6 against Target AC; Natural Minimum misses, Natural Maximum hits; a Solid Hit rolls damage, a Grazing Hit does 1.
- The Command Radius absorbs damage in order: Ward Tokens, Shield Pool, Mount Pool, the Leader's Wounds, then Condition. Squad Mates outside it take hits on their own Condition. Bleeding out: a d6 every 8 seconds, 1–3 dies.
- Comrade Bonds (+1 step side by side), retiring veterans, the Chapter Master (War Council) and 21 Doctrines round out the squad. The Leader's look can be Retro, Crisp (default) or Pixel sprite.
- Detail: the in-game Manual (`openManual`), `audits/balance.md`.

## Enemies
- Ten hosts: Bandits, Greenskin raiders, Beasts and monsters, the Hollow dead, Frost-Vault deserters, Steppe Orc warbands, Arcana Guild enforcers, Skulk cutthroats, Reprobate cabalists, Free Company sellswords.
- 43 enemy types in `BESTIARY`, in six archetypes: brute (presses the line), beast, skirmisher (keeps its distance and shoots), caster (Fireballs and Sharpers where the squad bunches), fixed (nests, engines) and boss.
- Eight bosses, e.g. Orsolt the Hollow Reeve, Captain Vane, Alpha Dire Wolf, Young Wyrm and Strategos Ilvaryn. Orsolt and Ilvaryn die in the prologue; later contracts get new named lieutenants (D-07).
- Enemy camps sleep until the squad is near; Blip Tokens turn into decoys, snipers, traps or ambushes. Killing a commander tests Morale and enemies can Break; some raise a white flag (Parlay).
- Tiers 1–3 pay x1, x2.25 and x4.5 and unlock by Squad Leader level. Tier 1 difficulty varies a lot by host (`audits/balance.md`, decision D-01).
- Enemies path with a shared flow field; siege enemies attack walls and gates, and follow a field built from the wall when the straight line is blocked (BUG-08, Index 82).

## Items, upgrades & Rank'n cards
- 39 gear items in six slots: armour, shield, melee, ranged, kit, mount. Squad Standard gear is shared by the whole squad; kit is carried by one mate. Gear unlocks through facilities (Blacksmith, Carpentry, Armoury and so on) and the Town Market.
- 27 facilities in seven groups: Holding, Command, Military, Medical, Workshops, Arcane, Defences. Four holdings change the camp's look and layout: Frontier Timber Fort, Dockside Cog-Barge, Abandoned City Warehouse, Ruined Waystation.
- Upgrades: Advancements, ability and spell ranks, 21 Tactical Doctrines (bought once from the Treasury), Charter Ambition perks (milestones 3, 6, 9) and Edges on the contract board (e.g. Better Terms).
- Momentum picks last for one contract only: Empower an ability, spell or doctrine already known, or a field order.
- Rank'n is the tavern card game (Legend Lore Studios): Copper Spears beat Gold Knights, Silver Bows beat Spears, Knights beat Bows. Stakes: Penny table (x1), Soldier's table (x5), High table (x20); coin values Spear 1, Bow 2, Knight 4. You keep surviving coins and every coin you capture.
- Gold sink gap: gold piles up from about contract 12; decision D-02 adds the tabletop's costly upgrades.

## Balance rules
- Money in: contract pay x tier, 10% Quick Salvage (or Detailed Salvage), field coin, Merchant income. Money out: upkeep, hires, gear, builds, repairs after raids. A Tier 1 win nets about 315gp; gold is tight for about six contracts, then plentiful (`audits/balance.md`).
- Build times: 1–3 seasons (cost ≤150gp 1, ≤250gp 2, more 3). Stopping work refunds everything in the season ordered, half after. Moving costs ¼ of the price (minimum 20gp); pulling down returns ¼.
- Hazard Upkeep is per Squad Mate who comes home (the tabletop charges per deployed mate; kept as is, D-03). Contract tiers unlock by Leader level (D-04).
- Do not change balance numbers without the user's OK; record balance changes in the Decisions log. Goblin and Witch strength stays until a real playtest (D-05).
- Numbers live in `makeContract`, `BESTIARY`, `TIER_PAY` and `ASSAULTS`/`NIGHTS`; later modules in `js/` may patch them (see `js/balance.js`).
- Test with `.claude/audit.js` (it mutes the game) at 1280×800. The headless sims are crude: trust only gaps of 2x or more.

## Art & audio style
- The world is drawn in a soft 3D look (Index 70–77: camp, terrain, tavern, builders). Pixel art stays only as a fallback and for things flat on purpose: arrows, orbs, coins, the "?" token, smoke and the HUD.
- Squad Leader looks: Retro (hard outline), Crisp (default, D-08) and Pixel sprite. Text is sharp at any zoom (Index 79); Settings has text size.
- Seasons change the camp (summer to winter); winter is the weakest-looking season (`audits/graphics.md`). Each holding has its own camp layout.
- Audio is generated in code (Web Audio): `SFX` voices and a music engine with town and battle arrangements. The `pipe` voice was the grating one (`audits/audio.md`, J-19 mellow town audio).
- Tests and agents must stay silent: `.claude/audit.js` mutes the game.
- Detail: `audits/graphics.md`, `audits/ux.md`, `audits/audio.md`.

## Story & setting
- Setting: Arcadia, year 616 onward, with ten factions. Faction Standing runs from -3 to +3 (Allied at +2, no contracts at -2).
- The Manual is the lore authority. Cayde Hallinan is Grand Master of the Grey Cloaks (D-06); the prologue's Reeve is Aldous Harl.
- Prologue, "The Founding of the Dust Cloaks": the Frost-Vault legions reach Varnholt, a silver town with a palisade. Part One is the siege (assaults on walls and gates); Part Two is the Long Road with the refugee column. The company keeps its people and gear into the main game.
- Orsolt and Ilvaryn stay dead after the prologue (D-07). A small cold open for new players is approved (D-10).
- Tone: dry and a little grim (the intro, the Scribe's Epilogue). The story was told mostly on the title and ending panels, so one line per assault, result and building was added (`js/story.js`).
- Detail: `audits/story.md`.

## Decisions log
Newest first. One line each: date — decision — why.
- 2026-11-07 — Elven Mail AC 5 → 6 (price still 1,100gp; `js/balance.js` 86c) — it was no better than a 240gp Chain Shirt (BAL2-01). The prologue kit stays paid from charter money, now explained on screen (BAL2-02). Approved by the user.
- 2026-11-06 — D-10: build the small (version 1) prologue cold open — eases new players in with the least rewrite.
- 2026-11-06 — D-09: co-op multiplayer parked — finish single-player polish first; it touches almost every system.
- 2026-11-06 — D-08: default Squad Leader look stays Crisp — the 3D world and sharp text are built for it.
- 2026-11-06 — D-07: Orsolt and Ilvaryn stay dead after the prologue; later contracts get new named lieutenants — continuity.
- 2026-11-06 — D-06: Cayde is Grand Master of the Grey Cloaks, as in the Manual; "Reynard" is not part of his public title — the Manual is the lore authority.
- 2026-11-06 — D-05: Goblin/Witch strength unchanged until a real playtest — the simulation was too crude to act on.
- 2026-11-06 — D-04: contract tiers keep unlocking by Squad Leader level (not Charter Rank) — a deliberate video-game simplification.
- 2026-11-06 — D-03: the seven small rule fixes (hazard upkeep per deployed mate, Merchant discount, etc.) are not made for now.
- 2026-11-06 — D-02: add the tabletop's gold sinks (Masterwork Full Plate and costly late upgrades) — gold piles up from about contract 12.
- 2026-11-06 — D-01: soften the hardest hosts' Tier 1 pools (Monsters, Greenskins, Orcs, Arcana) rather than paying more for them — same pay should mean similar danger.
- 2026-11-06 — Improvements from audits ship as separate modules (`js/ux.js`, `js/graphics.js`, `js/story.js`) loaded after `index.html`'s script — lets several delegates work at once without edit clashes.
- 2026-11-06 — Bugs are fixed as found; improvements need the user's OK (tracked in `.claude/backlog.md`) — the user's working rule.
- 2026-11-06 — Facility upkeep is 15gp per staffed facility per season; one contract is one season (Index 30 calendar) — confirmed by the user.
- 2026-11-06 — Buildings can go on any empty plot and take 1–3 seasons by cost (≤150gp 1, ≤250gp 2, more 3); three townsfolk builders work the site; stopping work refunds all in the season ordered, half after; built facilities can be moved (¼ cost) or pulled down (¼ back) — user request, Index 77–78.
- 2026-11-06 — The world is drawn in the 3D look, with pixel art kept only as a fallback; arrows, orbs, coins, the "?" token, smoke and the HUD stay flat on purpose — Index 74–76.

## Open questions
- See `.claude/backlog.md` → Decisions (D-01…D-10).
