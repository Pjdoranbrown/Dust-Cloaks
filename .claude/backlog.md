# Dust Cloaks — Jobs & Decisions Backlog

The one list of bigger jobs and open decisions. Keep it current: when something is approved, started, shipped or dropped, change its Status here in the same turn, and log decisions in `game-bible.md` → Decisions log.

- **Jobs** need the user's OK before work starts (bugs don't — fix as found).
- **Decisions** are the user's call; record the answer in the bible, then turn it into a job if needed.
- Sources: `audits/*.md` (IDs like UX-03, GFX-02, STORY-05, BAL-01; G-* = Gemini leads in `audits/leads/`).
- Owner: **commander** (the main chat) or **delegate** (a Sonnet session or the `game-drafter` subagent).
- Status: `proposed` → `approved` → `in progress` → `shipped (Index N, commit)` / `dropped (why)`.

Last updated: 2026-11-06 (audio review added J-19…J-22).

---

## Jobs

| ID | Job | Sources | Effort | Owner | Status |
|---|---|---|---|---|---|
| J-01 | **New-player start**: three ready-made starting leaders (archetype cards that skip Ability/Name), a fixed default kit in the prologue with customisation capped at 350gp, prologue menus hidden until they matter | UX-09, BAL-02, BAL-03, UX-07, G onboarding 1 | M–L | commander (cards: delegate) | proposed |
| J-02 | **Reeve's Hall Day 1**: only the Sergeant's suggested orders, the rest folded; pulsing "next" card; END THE DAY button in the header with candle count; dice toast when an order resolves | UX-08, G onboarding 2 | M | commander | proposed |
| J-03 | **Planning table**: sticky footer (contract · pay · squad n/5 · SIGN AND MARCH); right column as tabs (Ambition, Factions, Doctrines, Rivals, Prisoners); P lands on Contracts | UX-03 | M | commander | proposed |
| J-04 | **HUD scales with the window**, plus a HUD size setting (Auto/100/125/150%); brighter small print | UX-05 | M | commander | proposed |
| J-05 | **Leader card health rows** that can't be misread: damage order, n/max numbers, shaped pips, flash on loss | UX-06 | S–M | delegate (commander signs off wording) | proposed |
| J-06 | **Squad spacing**: soft separation in combat (Default, Brace, Open) and for camp idlers, so shield walls read as a line and bars don't stack | GFX-02, GFX-11, G spacing | M | commander | proposed |
| J-07 | **Rolling save backups** (keep 3, restore from Settings → Save); named slots later only if wanted | G-UI-08 (UX phase 1/2) | M (slots L) | commander | proposed |
| J-08 | **Game feel**: dust at feet (sprint, Brace, construction), hit knockback/stagger offset, optional hit-stop | GFX-06, GFX-07, G roadmap | M | delegate (hit-stop: commander) | proposed |
| J-09 | **Visual polish**: in-world overlay style (bubbles, labels, command ring), building vs character light direction, camp plot clutter | GFX-14, GFX-19, GFX-17 | S–M | delegate | proposed |
| J-10 | **Story, mid-size**: barks and the Chapter Master react to events; patron voices in briefs; a moment for the dead; prologue ending → Chronicle's first entry; carry the Epilogue's tone into the middle | STORY-09, 11, 12, 13, 18 | M each | delegate (13, 18: commander) | proposed |
| J-11 | **Squad portrait strip** in contracts (5 busts, health bar, red X when down, toggle N) | UX tooltips row | M | commander | proposed |
| J-12 | **Plain-English one-liners** on specialties, armour and doctrines, rules text under "Details" | UX tooltips row | M | delegate (wording: story) | proposed |
| J-13 | **Fill `game-bible.md`** sections (core loop, classes, enemies, items, balance, art, story) from the code and audits | — | S | `game-drafter` | proposed |
| J-14 | **Soften the hard hosts** at Tier 1 (Monsters, Greenskins, Orcs, Arcana) via their enemy pools, toward the middle of the spread; same pay (from D-01) | BAL-01(b) | S | game-balancer → `js/balance.js` | shipped (Index 86): Tier 1 troops of the four hosts move 10% slower and fight at -1 Skill; same troops, same pay |
| J-15 | **Tabletop gold sinks**: Masterwork Full Plate and costly late upgrades for facilities/gear (from D-02) | BAL-04 | M | game-balancer → `js/balance.js` | shipped (Index 86): 5 gear sinks; facility upgrades not added (too heavy for now) |
| J-16 | **Cayde's title** matches the Manual: Grand Master of the Grey Cloaks, no "Reynard" (from D-06) | STORY-05 | S | story-designer → `js/story.js` | shipped (Index 85c, 9d0b481) |
| J-17 | **New named lieutenants** replace Orsolt and Ilvaryn as later bosses (from D-07) | STORY-04 | S–M | story-designer → `js/story.js` | shipped (Index 85d, 9d0b481) |
| J-18 | **Prologue cold open, version 1** (from D-10) | audits/story.md → Onboarding cold open | S | story-designer (commander reviews flow) | shipped (Index 85b, 9d0b481) |
| J-19 | **Mellow town audio (first pass)**: lute carries the melody instead of the pipe, mellower pipe where it stays, frame drum and hand drums for the Bard, a small room reverb, softer fatiguing SFX (coin, pick, horn, nope, level, win), gentler gaps between verses, bard strumming synced to the real tempo, audio accessibility basics | AUD-01, 02, 05, 06, 07, 10, 15, 16 | M | sound-designer → `js/audio.js` | shipped (Index 87): lute melody, mellower pipe, frame and hand drums, room reverb, softer SFX, rests with wind and fire, bard strum on the beat, Soft sounds setting |
| J-20 | **One continuous theme with Humanity-style tempo**: town and contract play the same tune, layers added as the fight builds; tempo eases with game speed, danger, momentum and slow-mo | AUD-03, 04 | L | commander (music transport) + sound-designer (arrangement) | proposed |
| J-21 | **Audio plumbing**: one shared audio context, music ducks under important SFX, separate SFX and music sliders, node cleanup for long sessions | AUD-08, 09, 12, 13 | M | commander + sound-designer | proposed |
| J-22 | **Audio contexts and feedback**: music for the title, prologue, debrief, raid and bar fight; missing feedback sounds | AUD-11, 14 | M | sound-designer (commander picks contexts) | proposed |

## Decisions (user's call)

| ID | Question | Options / recommendation | Sources | Status |
|---|---|---|---|---|
| D-01 | **Host difficulty spread**: at Tier 1, Monsters/Greenskins/Orcs/Arcana kill a test squad 2–3× faster than the Hollow, for the same pay | (a) pay scales with host danger (touches the board/saves); (b) soften the hard hosts' pools. Balancer: do (b) now, (a) later | BAL-01 | decided: soften hard hosts (J-14) |
| D-02 | **Late-game gold glut** from about contract 12: add a sink? | Masterwork Full Plate (tabletop), costlier late facilities/upgrades, or higher late upkeep | BAL-04 | decided: tabletop sinks (J-15) |
| D-03 | **Small rule fixes** (mostly drift from the tabletop) | Hazard upkeep per deployed Squad Mate (not per survivor); Merchant Stalls 10% market discount; Hold the Redoubt pay per minute; softer upkeep after a lost contract; cap the raid pay-off; Light Crossbows vs Longbows; armour Move note | BAL-05…09, 11, 12 | decided: none for now |
| D-04 | **Tier gating**: by leader level (game) or Charter Rank (tabletop)? | Balancer reads the current rule as deliberate | BAL-14 | decided: keep leader level |
| D-05 | **Goblin / Witch strength** look off in a crude sim | Needs a human playtest before changing | BAL-13 | decided: wait for a real playtest |
| D-06 | **Lore: "Reynard"** — Cayde is titled "Reynard, Grand Master of the Dust Cloaks", but the Manual makes him Grand Master of the Grey Cloaks and Reynard a secret | Change the title, or treat the game as canon | STORY-05 | decided: match the Manual (J-16) |
| D-07 | **Orsolt and Ilvaryn** die in the prologue but return as generic bosses | Rename the later bosses, or make their return a story beat | STORY-04 | decided: rename later bosses (J-17) |
| D-08 | **Default Squad Leader look**: Crisp (current) or Retro? | Gemini prefers Retro; graphics auditor gives its view in GFX-10 | GFX-10, G cohesion | decided: keep Crisp |
| D-09 | **Co-op multiplayer** (1–4 players, WebRTC, host browser authoritative) | Large; not started | Gemini report §8 | decided: parked |
| D-10 | **Prologue cold open**: none, version 1 (S), 2 (M) or 3 (L)? | Story designer recommends version 1 first | audits/story.md → Onboarding cold open | decided: version 1 (J-18) |

## Recently settled (moved to the bible's Decisions log)
- Upkeep is 15gp per staffed facility per **season**; one contract = one season (Index 30 calendar).
- Build times: 1–3 seasons by cost; full refund in the season ordered, half after (Index 77–78).
- Approved and shipped: audit bug fixes and quick wins (Index 81–85).
