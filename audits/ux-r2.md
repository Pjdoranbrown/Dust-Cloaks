# UX re-audit, round 2 (build 554b965 plus working tree)

**Summary**
1. Walked a first-time player on the combined build: splash → Found a Chapter (the balancer's ready-made Leader, 4 clicks) → camp → hire three → first contract → debrief → camp → second contract table; also the prologue (Quick) through squad pick, Charter Kit and the Reeve's Hall Day 1. No console errors from any of it.
2. Most of my 83 and 83b work holds up on the combined build (table tabs and footer, HUD scaling, shaped pips, squad strip, backups, plain lines, danger confirms, ☰ menu). The balancer's and story designer's changes sit well beside it.
3. Two of my own items are silently broken by later files: the builder label (graphics.js replaces `campLabel`) and the toast kinds (story.js's `campNote` wrapper drops the second argument).
4. The first contract's tips fight each other: `move`, my `squadstrip` and `abilities` all fire in the first frames and overwrite each other, so a first-time player never reads "WASD moves the Leader".
5. A first-time player still gets no "what now?" in camp (200gp, no squad, nothing says hire first), and the hire list still uses the abbreviated stat line.

Method: built-in browser, 1280×800 (also 1024×768 and 1920×1080), `.claude/audit.js` loaded (volume 0). The campaign lived in separate storage keys (`ux83:` prefix, removed afterwards); the real saves were not written. The pane is closed and the window is back at desktop size. Screenshots in this pane often lag or crop, so most checks were done from the DOM and game state.

---

## Regressions and bugs

### R2-01 Builder label wording is gone (graphics.js overwrites it)
- **Where:** `js/graphics.js:372` assigns `campLabel = function…` outright; my wrapper in `js/ux.js` (G-UI-07) is installed first (ux.js loads before graphics.js) and is discarded.
- **Reproduce:** call `campLabel(200,200,'Dunstan','Builder: Tents, 1 season left')`: it draws the old strings ("Builder: Tents, 1 season left"). Hover a builder in camp.
- **Fix:** move the builder/resting rewrite into `js/graphics.js`'s `campLabel` (it draws the label now), or add a small late wrapper in a file that loads after graphics.js. Effort: S.

### R2-02 Toast kinds (✓ / ! / i, coloured edge) never show (story.js drops the argument)
- **Where:** `js/story.js:133`: `campNote = function(msg){ … return f.call(this, msg); }`. The second argument (`kind`) never reaches my wrapper.
- **Reproduce:** `campNote('Test','good')` → no icon and no edge. Affects Show tips again, Export save, Text size, Back up now and Backup restored.
- **Fix:** in story.js use `function(msg, kind)` and `f.call(this, msg, kind)` (or `f.apply(this, arguments)`). Effort: S.

### R2-03 First-contract tips overwrite each other
- **Where:** `tip()` stores a single `G.tip`. In a new campaign `move`, `squadstrip` (mine, Index 83b) and `abilities` all trigger in the first frames, and `tipsSeen` marks all three seen; only the last shows. In my run the screen showed the abilities tip at frame ~965 and `move` ("WASD moves the Leader…") was never visible.
- **Fix:** make `tip()` queue instead of overwrite (show the next when `life` runs out), and drop `squadstrip` from the first few seconds (show it after `move` and `abilities` have been read). Effort: S.

### R2-04 "Save changed in another tab" box covers the objective and the top bar
- **Where:** the warning that appeared in every tab of mine (other sessions were writing the same key). It is a fixed DOM box at top centre that stays up: it sat over the objective counter during a contract and over the PLANNING TABLE / ROSTER chips in camp.
- **Fix:** move it to the bottom centre or into the top-bar's empty space, add auto-dismiss after ~8s (keep the × and re-show on the next save), and make it not cover the objective. Effort: S.

### R2-05 Ledger chip reads "Ledger: upkeep -0gp" / "⚒ -0gp" on a new campaign
- **Where:** Index 78 chip plus my ☰-width shortening. With nothing built and no upkeep it says a meaningless "-0gp".
- **Fix:** hide the chip until there is a work or upkeep, or show "no works" / "no upkeep". Effort: S.

### R2-06 "NEXT: THE BANNER" is disabled with no reason
- **Where:** the Ambition step of founding. My UX-04 reasons only handle buttons starting `CONTINUE`; this one starts `NEXT:`.
- **Fix:** extend the pattern in `uxWhy` to `/^(CONTINUE|NEXT|TAKE)/` and use the step name: "Choose an Ambition to continue." Effort: S.

### R2-07 Camp hint collapses after only a few camp redraws
- **Where:** `META.uxCampVisits` is bumped in every `renderTitle()`, which also runs when you close a sheet. In my walk it had collapsed to the short hint by the fourth return, before the second contract.
- **Fix:** count only real arrivals (the debrief's RETURN TO CAMP, or entering from the splash) and raise the threshold to 5; or collapse by time spent in camp. Effort: S.

### R2-08 Pause "shown settings" miss the Effects slider
- **Where:** audio.js added Effects/Music; my pause filter keeps only `Volume|Game speed|Momentum|Music`, so Effects goes under "More settings…".
- **Fix:** add `Effects` to the kept list in `js/ux.js`. Effort: S.

---

## Verification table

| Item | Result | Note |
|---|---|---|
| UX-01 settings off splash and pause | works | splash: one SETTINGS button; pause fits at 1024×768 (Resume at y=588 of 768); see R2-08 |
| UX-02 first-run path | works | gold prologue button plus "Skip the prologue" |
| UX-04 reasons / ADOPT verbs | partly | works on Specialty step, squad pick and doctrines; missing on `NEXT:` buttons (R2-06) |
| UX-10 squad chips, balanced four | works | chips plus roles; balanced four skips the Leader's own Specialty; story's role words ("Front-liner") sit well |
| UX-11 danger confirm | works | red verb button, THINK AGAIN focused, ENTER cancels |
| UX-12 toast kinds | broken | R2-02 |
| UX-13 message panel | works | dark strip behind messages |
| UX-14 ☰ menu, short ledger chip | works | at 1024: `PLANNING TABLE … QUARTERMASTER ☰`; chip text see R2-05 |
| UX-15 hint collapse | partly | works, collapses too early (R2-07) |
| UX-16 construction bar | not re-tested | no building site in my run; unchanged code |
| UX-17 focus, volume slider | works | not re-walked end to end |
| UX-18 glyphs | not re-tested | table seals and dice unchanged |
| UX-19 founding top bar | works | MANUAL and SETTINGS only |
| G-UI-07 builder label | broken | R2-01 |
| Luck / Wounds / Back in town tips | partly | Wounds tip fired on the first lost Wound but was displaced by others in the first minute (R2-03); Luck and town box not re-triggered |
| J-03 table footer, tabs, P | works | tabs persist; footer notes; `openTable('ledger')` selects Prisoners; no-op in the Reeve's Hall (it has no grid) |
| J-04 HUD scaling | works | k=1.05 at 1280×800, 1.42 at 1920×1080; HUD size setting; Momentum card clicks still land; weather in true frame |
| J-05 leader rows | works | shapes, `n/max`, red flash on loss |
| J-07 backups | works | season change wrote "New season"; restore backs up first; story slot never touched |
| J-11 squad strip | works | X and DOWN states; N toggles |
| J-12 plain lines | works | specialties, gear (Quartermaster/Market), doctrines |

---

## New proposals

- **UX2-01 First-time "what now?" in camp (M, commander).** After founding, the player is dropped in camp with 200gp, no squad, the planning table button gold and nothing saying to hire first. Add a small checklist chip in the top bar for the first campaign ("1 Hire a squad · 2 Pick a contract · 3 March") that ticks itself, and a gold outline on HIRE while the roster is empty.
- **UX2-02 Hiring Line stats in words (S, delegate).** The camp's Hiring Line still prints "Con 3 · Mv 4 · M 2 · R 2". Reuse my squad-pick chips and role word. Also give a toast when you hire ("Baldric hired, 30gp. Treasury 170gp"): there was none.
- **UX2-03 Tip queue (S, delegate).** See R2-03. Also a one-line "Tips: off" setting is not reachable from the tip itself; add "(Settings → Tips)" to the first tip.
- **UX2-04 Debrief heading (S, delegate; confirm first).** In my forced end-of-contract the report read "FIELD REPORT | undefined". I called `endDeployment('win')` by hand, so this may be an artefact of my call; worth a check by the bug finder with a real win.
- **UX2-05 Warn about a thin squad at the table (S, delegate).** Footer shows "Squad 2 / 5" but says nothing. Add a one-line amber note under 3 mates: "A small squad: hire at the fire before you march."
- **UX2-06 Table tabs when there is something new (S, delegate).** A small dot on the Prisoners and Doctrines tabs when a prisoner is held or a doctrine is affordable.
- **UX2-07 Named backup labels and a "last saved" line (S, delegate).** Show "Last backup: 2 seasons ago" in Settings → Save, so players know it exists.
- **UX2-08 The cross-tab warning (see R2-04) becomes a proper two-tab guard (M, commander).** Instead of letting both tabs write, let the newer tab ask "Take over this save?".
- **UX2-09 Keyboard walk-through of the table (S, delegate).** Tabs should be reachable with arrow keys (`role=tablist` is set, arrows are not wired), and the footer button should be the default focus after rolling the War Council.
- **UX2-10 HUD at 150% on small windows (S, delegate).** The 760-wide key strip crowds the minimap below ~1100px: wrap the key list onto two lines when the scaled width is under 900.

---

## Fixed (Index 83c, `js/ux.js`)

Tested muted at 1280×800, 1920×1080 and 1024×768, with Normal, Large and Larger text, on a fresh test campaign in separate storage keys (removed afterwards; real saves untouched). No console errors. Pane closed.

| ID | Fix | Checked |
|---|---|---|
| R2-03 | `tip()` now queues instead of overwriting. In a fresh campaign the first contract shows the WASD tip first, then the squad-strip tip, then abilities, chest and Momentum, one after another (about 9s each). The squad-strip tip waits until the earlier tips have gone. | Played 2,400 frames: five tips in order, none lost. |
| R2-04 | The "save changed in another tab" box is a small bottom-right notice (about 300px wide) that fades after ten seconds. It no longer covers the objective or the top bar. | Visible bottom-right in a contract and in camp. |
| R2-05 | The ledger chip is dropped while nothing is built and nothing is owed. | New campaign top bar shows only Treasury, date, Ambition. |
| R2-06 | `NEXT:` and `TAKE THE CHAIR` give a reason when disabled: "Choose an Ambition to continue.", "Choose who sits in the chair to continue.", "Choose a holding to continue." | Walked founding. |
| R2-07 | The hint strip shortens after three finished contracts (`META.deployments`), not after three camp redraws. | 2 contracts: full hint, even after 6 redraws; 3: short hint. |
| R2-08 | The Effects slider stays on the pause screen with Volume, Game speed, Momentum and Music. | Pause screen. |
| bugs R2-02 | Text size and the HUD scale compose. The HUD panel scale is now `base × text size` (base = Auto's window scale or the fixed HUD size), and fonts drawn inside the HUD are no longer scaled a second time by Index 79. The scale is capped at `min(window width/1000, height/620, 2)`, so the HUD never needs more than its original 1000×620 layout: wider windows keep room, narrow ones shrink it instead of overlapping. | Normal/Large/Larger at 1280×800 (scale 1.05/1.21/1.28), at 1920×1080 (1.42/–/1.74) and Larger at 1024×768 (1.02): no overlap in the leader card, objective box, bottom bar, key line or ability names. |

**Notes**
- Because of the cap, a fixed "HUD size 150%" on a 1280-wide window is limited to 1.28, and Larger text at 1024×768 gets the same scale as Normal. Text size still applies fully on 1920×1080 and wider.
- The bottom-bar label and key line no longer collide at any size I tried; the draw code itself is unchanged (the earlier cause was the double scaling).
- R2-01 (builder label, graphics) and R2-02 toast kinds (story) are left to their owners. After their changes the "Text size: Larger." toast already shows its ℹ icon, so the story fix appears to be in.
