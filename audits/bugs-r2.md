# Bug re-audit, round 2 (build 554b965)

Read-only. Tested muted (`.claude/audit.js`) at 1280x800; both saves were backed up and restored afterwards.

## Summary
1. The combined build is stable: every contract type (tier 1 and 3), ten raid hosts, the bar fight, both prologue lengths end to end and holding moves ran with no console errors and no "Draw error" warnings.
2. One real soft-lock: a prologue save made before the Quick/Full split loads as the Quick prologue (3 days, 2 assaults), so a save on day 9 of 14 can never reach another assault or the end (R2-01).
3. The text-size setting breaks the combat HUD: at Large and Larger the bottom bar label, the ability names and the top-centre timer text run into each other (R2-02).
4. All my own fixes from both rounds still work on the combined build (table below). The new-player kit, the Reeve's Hall Day 1, the full 14-day / 12-night chronicle and the hand-over into the main game all work.
5. Performance note: a Tier 3 Hold with about 150 live enemies draws in about 26ms a frame (hidden pane, so only a rough figure).

## Regressions and bugs

### R2-01 Old prologue saves load as the Quick prologue and can never finish (High for anyone mid-prologue)
- Where: `isFull()` (`index.html:8789`), `setChronicle`, `switchSlot` wrapper (~11281).
- Repro: a story save in progress with no `cp.full` field (every save made before the Quick/Full choice shipped, which was always the 14-day game). Set `part:'siege', day:9, assault:4` and delete `cp.full`, leave and re-enter the prologue. It reports `A=2 N=3 isFull=false`, `nextAssault()` is null, "Day 9 of 3". Ring the bell: day 10, no assault ever launches, supply runs out, and the siege never ends because `part` only becomes `retreat` after an assault.
- Fix: treat a missing `full` flag as the Full Chronicle: `isFull = () => !!(META && META.cp && META.cp.full !== false)`. New games always set `full` true or false when the player picks (`onclick` at ~11286-11287), so only old saves change. Effort S. Owner: bug finder or commander.

### R2-02 Text size Large/Larger breaks the combat HUD (Medium)
- Where: `drawHUD` bottom bar (`index.html` ~4323-4331), top-centre timer box, ability bar labels.
- Repro: Settings, Text size Larger, start any contract at 1280x800. "OPEN ORDER" / "SHIELD WALL" runs into the "[1-6] abilities..." key line (it starts at a fixed x=148; at normal size the label ends at about x=138, or 144 for "SHIELD WALL", a 4px gap); "Cure Wounds" and "Lightning Bolt" ability names touch; "HOLD THE REDOUBT · [H] SOUND SORTIE HORN (+20s)" spills past its frame. The same bar is already tight at normal size on a different font.
- Fix: draw the key line at `28 + measureText(label) + 16` instead of 148, shorten or wrap the objective line to the box width, and clamp ability label width. Effort S to M. Owner: UX delegate.

### R2-03 Debrief headline still says "Treasury +916gp" while the Treasury really rose by 800 (Low)
- Where: first debrief line (`index.html` ~5536).
- Repro: Tier 2 hold with Tavern, Merchant and four other buildings, victory: "Treasury +916gp: ... Now 2780gp." Detailed Salvage (-41) and facility upkeep (-75) come as later lines. "Now 2780" is correct (the Index 81 fix); only the "+916" headline is stale. Arithmetic checked: 810 + 81 + 15 - 40 + 50 = 916; 916 - 81 + 40 - 75 = 800; and 2000 - 20 march rations + 800 = 2780.
- Fix: rewrite the "+Ngp" in that line at the same time as "Now". Effort S.

## Verification table (my shipped work)

| Item | Result |
|---|---|
| BUG-01 camp hotkeys off on the title screen | works |
| BUG-02 title screen not clipped at 1024x768 and 1280x800 | works (top at 177px at 1280x800) |
| BUG-03 prologue hint without hotkeys | works (the UX module has since replaced the text with "press ? for the camp keys"; the `?` key does not open anything on the title screen or in combat, as intended) |
| BUG-04 table board grows with content | works |
| BUG-05/06 gear card stamps, SOURCE column, "No Squad Leader yet" | works |
| BUG-07 "Now Xgp" (commander) | works (see R2-03 for the headline) |
| BUG-08 siege enemies reach walls (Index 82) | works; the full 6-assault prologue ran clean |
| B-1 disabled buttons keep tooltips and stay inert | works (`pointer-events:auto`, `not-allowed`) |
| B-2 Faction Standing labels | works (0 of 10 overlapping) |
| B-3 seal padding | works |
| B-6 other-tab save warning | works (one banner per page) |
| Fixed Palisade and Watchtower plots, old saves with strays | works (all four holdings, no overlaps) |
| Gates with 3D world off | works |

## Interaction and coverage checks (no bug found)
- New-player start (J-01): kit issued (650gp after the 200gp kit), 350gp cap enforced (Full Plate refused), swapping Brigandine to Padded refunds and charges correctly, and swapping back is net zero.
- Reeve's Hall Day 1 (J-02): the arrival modal ("Enter the gate" / "Back to the market"), the Reeve's line, the Sergeant's advice, Silver Pit +40gp shown in the Morning Report. Top bar shows only Work Orders, Manual, Settings, Main Menu on Day 1, as designed.
- Prologue end to end, Quick and Full (14 days, 6 assaults, 12 nights, with a defeat thrown in every fourth night): no errors; the hand-over to the main game asks before replacing an existing Chapter ("Your main game already has a Chapter led by...") and gives 200 + Kalloon's gold.
- Old main saves with newer fields removed (no build, sites, chron, scribe, settings, holding, master, gear; no leader): title, camp, table, roster, Chronicle, Manual, Quartermaster, ledger all open without errors.
- Squad spacing (J-06): 290 samples over 1,500 ticks, closest approach 49px, no overlaps; Brace tested.
- Hotkeys, seasons, builds finishing, moving holdings with builds under way: clean.

## New proposals
- R2-P1 (S): fix R2-01 before anyone loads an old story save; consider a one-time migration that writes `full:true` into legacy saves.
- R2-P2 (S): make the HUD layout measure-based (R2-02) so every text size works.
- R2-P3 (S): add a console-safe self-test page (a `?selftest` flag) that runs the contract/raid/prologue sweeps from this audit, so a regression is caught by one click. Owner: bug finder.
- R2-P4 (M): look at draw cost with 100+ enemies (about 26ms a frame here); culling off-screen enemy bars and shadows is the likely win. Owner: graphics delegate.

## Fixed

All in `index.html` Index 89 (end of the main script), plus one marked line at `isFull`, and `.claude/audit.js`. Tested muted at 1280x800. Rollback: delete Index 89 and the `/* Index 89 */` mark at `isFull`.

| ID | Fix | Verified |
|---|---|---|
| **R2-01** | `isFull()` is true unless `cp.full === false`, so a prologue save with no flag (pre-split) is the 14-day game. New games always set the flag, so they are unaffected. | A save on day 9, assault index 4, `full` deleted: after leaving and re-entering it reports 6 assaults, 12 nights, `isFull` true, next assault "The Tithe Is Called", 14 days, and ringing the bell moves to day 10. An explicit `full:false` still loads as Quick (2 assaults). |
| **R2-03** | `endDeployment` records the Treasury on entry; the `renderDebrief` wrapper rewrites the "Treasury +Ngp" in the first line to the real change (same idea as the Index 81 "Now" fix), at every redraw. | Tier 2 hold: lines sum to +654, Detailed Salvage and upkeep bring the real change to +615; headline says +615, "Now 2595gp" (2000 - 20 march rations + 615). |
| **STORY2-05** | In the prologue, `endDeployment` clears `G.slainFactions` first, so killing Orsolt or Ilvaryn no longer shifts Mendor / Frost-Vault Standing. Existing saves: once, on load, a founded Chapter with `prologueChron`, `deployments <= 1` and a Mendor or Frost-Vault Standing of exactly -1 is set to 0 (flag `standingFix89`). Any other save is left alone: after a contract has been played there is no way to tell that -1 from one earned in the main game. | Orsolt killed in an assault: Mendor 0 to 0, no Standing line in the debrief. Migration: fresh-founded -1/-1 becomes 0/0 (Suderia +1 kept); after 3 deployments -1 stays; no prologue flag, -1 stays; -2 stays. |
| **AUD2-B5** (test tool) | `.claude/audit.js` no longer touches `settings()`. `AUD.mute()` puts a zero-gain stage after the limiter of Index 87's shared audio context (built with `new GainNode`, because Index 87 patches `createGain`); the context is muted the moment it is created (a wrapper on `AudioContext`), and `AUD.unmute()` undoes it. Without the shared context it zeroes the SFX master gain. The old save-guard is gone because nothing test-only is ever set. | After a user-gesture event the shared context was created and muted at once (gain 0, state running); a contract started the music engine (`track: fight`, `fsong: jig`) with `volume` 60 and `music` unchanged; saving wrote volume 60. This browser profile's main save had `volume: 0` again (left by another session's older audit.js); restored to 60. The story slot has no volume setting (default). |

Note: while checking I dispatched bare `new Event('keydown')` objects (no `key`); three handlers (`index.html` ~657, ~5681, ~25023) throw on `e.key.toLowerCase()` for such events. Real keyboard events always have a key, so this is not a game bug, but a one-word `(e.key || '')` guard would make the page robust against synthetic events.
