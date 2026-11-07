# Balance re-audit, round 2 (build 554b965)

Read-only. Same crude bot as round 1 (charges the nearest enemy, never braces, kites or uses abilities), muted, sim saves under a separate key. Noise is large: single runs on the same set-up ranged 25s to 200s, so only gaps of about 25s or more mean anything.

## Summary
1. J-14 holds up: Tier 1 Greenskins, Orcs, Monsters and Arcana now sit at 44-73s against Bandits 88s, so the gap is closing, but Hollow (233s, no deaths) and Deserters (45s) are the new outliers at either end.
2. Tier 2 is now the cliff: Greenskins T2 lasts 23s and Orcs T2 20s, against 44-73s at T1 for the same hosts. J-14 softened T1 only, as decided; the T1-to-T2 drop is steeper than before.
3. The new gear sinks cost a lot and prove nothing in the sim; Elven Mail is the one real trap (1,100gp for one more armour step than the 240gp Chain Shirt).
4. The Medic opener does best on autopilot (about 125s against Bandits versus 80s for the Shield), because its Ward Tokens need no input. That is a bot artefact, not proof of dominance; no archetype is a trap.
5. I could not isolate the effect of squad separation and knockback: there is no clean before/after, and Bandits moved from about 68s to 88s with the same bot (inside the noise).

## 1. Regressions and bugs
| ID | Where | Finding | Suggested fix | Effort |
|---|---|---|---|---|
| BAL2-01 | Elven Mail (`js/balance.js`, J-15) | AC 5, shift 2, Ward 1 at 1,100gp. Chain Shirt is AC 5, shift 1, Ward 1 at 240gp. For 860gp more you get one armour shift step and nothing else; Half-Plate (AC 6, shift 3, 2,200gp) is better on every number. | Make it AC 6, shift 2, Move 0, light (1,100gp), so it is the "heavy armour, no Move penalty" sink; or drop it. | S |
| BAL2-02 | Reproduce: run Quick Prologue, finish the muster, open THE MARKET | The 200gp default kit is deducted from the treasury, so the headline treasury (650) is lower than before. Players who did not read the panel may think gold was lost. Not a bug; confirm the message is visible. | None needed if the kit panel text stays. | - |

No console errors in any of the sim or test runs.

## 2. Verification of my shipped items
| Item | Result |
|---|---|
| J-14 softened Tier 1 (four hosts) | **Works.** Survival now Greenskins 72s, Monsters 44s, Orcs 52s, Arcana 73s (6 runs each) against Bandits 88s and Deserters 45s. Round 1 numbers were 35, 27, 30, 27. |
| J-14 identity (no outsider troops) | **Works.** Pools untouched; only speed and skill changed. |
| J-15 gold sinks | **Partly.** All five exist and equip. Longbows, greatswords and Bastion Shields gave no measurable change on a Half-Plate base against T3 Bandits (82, 72 and 83s against a base of 82s: noise). Elven Mail see BAL2-01. Destriers not simulated (the bot has no mount use). |
| J-01 ready-made leaders | **Works** (round 2 build). No archetype is a trap: Shield, Bow and Medic all lasted 29-65s against T1 Orcs and 62-140s against Bandits. |
| J-01 prologue kit and 350gp cap | **Works** (tested last round; not re-tested on the combined build). |

## 3. Findings on the combined build
- **Host spread at T1 (6 runs):** Hollow 233 (hit the 240s cap), Bandits 88, Arcana 73, Greenskins 72, Orcs 52, Deserters 45, Monsters 44. Spread excluding Hollow: 2x, down from 3x.
- **Tier 2:** Bandits 57s, Greenskins 23s, Orcs 20s. **Tier 3** Bandits 24s with a Brigandine squad. The same squad with Half-Plate, Heavy Greatswords, Longbows and a Tower Shield lasted about 82-120s at T3, so armour carries the tier jump; that is intended, but the first Half-Plate (2,200gp) sits far from the earlier gear.
- **Archetypes on autopilot:** the Medic's Litany gives the squad 1 Ward Token every 9s at rank 1 with no input; Rallying Cry gives 2 per 28s; Shield Wall Mastery gives 1 per 4s but only while the Soldiers hold a Shield Wall, which the bot never does. So the bot rates Medic over Bow over Shield, and a player who braces will see the reverse. Played by hand, expect Shield to be the strongest of the three in a prepared line.
- **Squad separation and knockback:** I saw no new losses or stalls; bot survival against Bandits went from about 68s to 88s, but the bot's noise (25-123s on identical runs) hides any effect smaller than 30s. A human playtest of a shield wall is the only fair test.

## 4. Proposals
| ID | Change | Effort | Owner |
|---|---|---|---|
| BAL2-01 | Rework Elven Mail as above | S | delegate |
| BAL2-03 | Soften Tier 2 Greenskins/Orcs/Monsters/Arcana the same way as J-14 (speed x0.9, Skill -1) only if a human playtest confirms the T1-to-T2 cliff; do not do it from this bot alone | S | commander decision |
| BAL2-04 | Give Hollow a modest pay premium or a harder pool; at 233s with no deaths it is the best-paid-for-effort contract at T1 | S | commander decision |
| BAL2-05 | Add a smarter test bot (braces, uses abilities, kites) so the archetype and sink questions can be answered without a human | M | delegate |
| BAL2-06 | A mid-tier armour between Chain Shirt (240gp) and Half-Plate (2,200gp) at about 800-1,000gp (Cuirass 950gp exists; confirm it is reachable and used) | S | commander |
| BAL2-07 | Watch Destriers: untested here; confirm the 900gp price against income at contract 13+ in a real campaign | S | commander |

## 5. Coverage gaps
Not covered: a human-played fight; Destriers and mounts; Tier 2/3 for Monsters and Arcana; late-game income with the new sinks (needs a campaign playthrough); the Reeve's Hall Day 1 change and whether the new top bar leaves players able to find the Market.
Save note: I backed up and restored the browser saves, but the story-slot save that came back is the one present when this audit started (1,319 bytes), which was smaller than the 2,778-byte save I restored after round 2 testing. The page likely overwrote it on reload before I took the backup. If a real prologue save went missing, that is the cause; the main-slot save is unchanged.

Summary: J-14 works (T1 spread now about 2x) but Tier 2 drops steeply; Elven Mail is a trap (BAL2-01); the sinks and archetypes cannot be ranked with this bot.

## Fixed
| ID | Fix | Old / new |
|---|---|---|
| BAL2-01 | Elven Mail improved in `js/balance.js` Index 86c | AC 5, shift 2, Move 0, Ward 1, 1,100gp -> **AC 6**, shift 2, Move 0, Ward 1, 1,100gp. Now better than the Cuirass (950gp, AC 6, shift 2, Move -1) on Move and Ward, and below Half-Plate (AC 6, shift 3, Move -2, 2,200gp). |
| BAL2-02 | **Kept the charge**, made it clear. The kit is bought with the 350gp charter money, as the founding always was, so nothing extra is taken. | Kit panel and Market note now say the 200gp came out of the charter allowance (850 - 200 = 650) and that handing a piece back refunds it (Index 86b text). |

Verified muted at the title screen and a throwaway prologue: Elven Mail reads 6/2/0/1/1100, both texts show, no console errors, main save unchanged. Tier 2 and the other findings are left as proposals. No commits.
