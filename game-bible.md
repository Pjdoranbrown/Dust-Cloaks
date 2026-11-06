# Dust Cloaks — Game Bible

The single source of truth for design decisions. Keep entries short; link to `audits/` for detail.

## Pitch
A bullet heaven / action RPG adaptation of the Dust Cloaks tabletop game. Runs in the browser from `index.html`.

## Core loop
- (to fill in)

## Characters & classes
- (to fill in)

## Enemies
- (to fill in)

## Items, upgrades & Rank'n cards
- (to fill in)

## Balance rules
- (to fill in — see `audits/balance.md`)

## Art & audio style
- (to fill in — see `audits/graphics.md`)

## Story & setting
- (to fill in — see `audits/story.md`)

## Decisions log
Newest first. One line each: date — decision — why.
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
