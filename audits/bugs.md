# Bug audit: Dust Cloaks (Index 80 base, fixes in Index 81)

Method: played and scripted the game in the browser (server on :8765). Drove every contract type at tier 1 and 3 (1,200 ticks plus a draw every 15), all ten raid hosts, the bar fight (6 waves), the prologue (sortie, both assaults, all three nights, both formations), holding moves with builds under way, build / stop / finish / move / pull down, ledger and Chronicle, old-save variants (fields removed), seasons, total-wipe defeat, camp hotkeys. Console errors and Index 80 "Draw error" warnings were captured throughout: **none occurred**. The bugs below are layout, input and clarity faults; the engine itself is solid.

Nothing is committed. All fixes are in the **INDEX 81** section at the end of `index.html`, plus one marked one-line patch inside the Index 78 key handler (`/* Index 81 */`).

Summary: 6 fixed, 2 need the commander.

## Fixed in Index 81

### BUG-01 Camp hotkeys fire on the title screen (Medium)
- Where: Index 78 key handler (~line 25020), title screen ("Dust Cloaks / Enter the Camp").
- Repro: load a campaign so the title shows; press H, L, B or M: panels open hidden behind the title; press Q, R or P: the title is replaced by the Quartermaster, Roster or Planning Table with no way "back" to the title.
- Cause: `campOverlayOpen()` deliberately ignores `screen-title`, so the handler thought the camp was in view.
- Fix: the handler also returns while `screen-title` is visible (one marked line). Verified: no key does anything on the title; R opens the roster once in camp.
- Status: fixed in Index 81.

### BUG-02 Title screen top is cut off when the window is short (Medium)
- Where: title/splash screen, any window shorter than about 800px with a leader (the settings block makes it ~800px tall).
- Repro: 1024x768 viewport, load a campaign: the "Dust Cloaks" heading starts at y = -17 and cannot be scrolled to.
- Cause: `.splash-screen{justify-content:center}` centres overflowing content equally above and below, and the top overflow is unreachable.
- Fix: `justify-content:safe center`. Verified: heading now at y = 20.
- Status: fixed in Index 81.

### BUG-03 The camp hint advertises hotkeys on the Varnholt prologue map where none work (Medium) (= G-BUG-02, G-BUG-03)
- Where: `#camp-hint`, Index 78 wrapper of `startCamp` (~line 25046).
- Cause: the text was appended once and never changed; the key handler stops in the prologue (`inStoryNow()`).
- Fix: `hint81()` (called from the `drawCamp` wrapper) sets a keyless hint in the prologue, and in the main camp the hint now reads "Camp keys (in a fight Q and R spend Luck): ...". The Manual gets a short "Q and R mean two things" note. The hint bar also stops swallowing clicks (`pointer-events:none`).
- Status: fixed in Index 81.

### BUG-04 The Reeve's Hall / Planning Table board is shorter than its contents (Medium) (= G-UI-06, bell part)
- Where: `#table-inner` inside `#screen-table`; most visible in the Reeve's Hall (scroll height ~1,450px).
- Repro: story mode, siege part, open the Work Orders table in a 768px window: the wood board ends at ~708px and the content, including the red "Ring the Bell" button, runs on below it.
- Cause: `#table-inner` is a flex item with `min-height:100%` and the default shrink, so it is squeezed to the window height while its children overflow.
- Fix: `#table-inner{flex:0 0 auto}`. Verified: board height 1,470px now contains the button (bottom at 1,450).
- Status: fixed in Index 81.

### BUG-05 Gear cards: EQUIPPED stamp over text; long SOURCE crowds COST (Low) (= G-UI-03, G-UI-04)
- Where: `gearCardHTML` (~line 10457) and `.gc-st` / `.gc-foot` CSS; Market and Quartermaster.
- Cause: the stamp was absolutely positioned 40px from the bottom and sat on the description; footer spans had no gap or wrapping rule.
- Fix: stamp is now an in-flow line under the footer; COST is a fixed column and SOURCE wraps in its own column. Verified on Infantry Spears, Long Spears, Heavy Arbalest and Imperial Siege Arbalest (EQUIPPED and OWNED).
- Status: fixed in Index 81.

### BUG-06 "No Squad Leader yet" placeholder is an unframed wrapping blob (Low) (= G-UI-02)
- Where: Settings "Squad Leader look" cards when there is no leader (first-run title).
- Fix: the placeholder is centred, padded and dimmed inside its 96px slot (string replace in a `settingsHTML` wrapper).
- Status: fixed in Index 81.

## Needs the commander

### BUG-07 Debrief headline "Now Xgp" is stale (Low)
- Where: `endDeployment` summary line (~line 5536) versus later additions: Detailed Salvage replacing Quick Salvage (~10160) and Facility upkeep (~16196).
- Repro: owned Tavern, Merchant and Command; win any contract. Debrief says "Treasury +381gp ... Now 1381gp", but the Treasury ends at 1,340 (Detailed Salvage swaps 36gp for 10gp, then upkeep -15gp). The real numbers add up; only the printed total is wrong.
- Suggested fix: drop "Now Xgp" from the first line and have `renderDebrief` print the current `META.treasury` once at the bottom (or recompute the headline on every call). Effort S. Not done here because lines are appended from many places at different times.

### BUG-08 Enemies attacking a palisade section beeline through trees and fence corners (Low) (= G-BUG-04)
- Where: `moveEnemy` (~line 2569): `d < 260` for any non-leader target skips the flow field and walks straight at the target even without line of sight.
- Cause: structure targets (palisade sections) are "non-leader targets", so within 260px small groups steer straight into outer trees/fence corners and stack. `collide()` only pushes them out.
- Suggested fix: for `target.struct` (and other `objHp` targets) take the direct line only if `clearLine(e, target, 30)`; otherwise follow a flow field aimed at the structure (or the leader field as now). Needs play-testing across all six assaults. Effort M. Not attempted (touches combat movement; no balance change allowed).

## Minor notes (no action needed)
- `startBuild(id, undefined)` stores an undefined site. Not reachable from the UI (the plot panel always passes a slot), so left alone.
- `leaveStory()` called with a live deployment leaves `G` set and the camp canvas blank. Not reachable from the UI (the title is not offered mid-fight); noted because it cost me a reload while scripting.
- Prologue Work Orders panel shows "Ledger Wagon undefined / undefined" if `part` is changed by hand without the real road set-up. Normal play sets `wagonHp`; not a bug.

## Gemini leads

| Lead | Verdict |
|---|---|
| **G-BUG-01** coin pickup | **Not reproduced.** Siege (`launchAssault`) uses the normal `update()` loop. I dropped a coin 60px from the leader (collected, counter +7), killed 40 enemies (16 coin drops, 32% chance + cutpurse, as designed), then walked onto them: counter rose 7 -> 23 and the pickups cleared. The magnet radius is 100px, pickup radius 18px. Likely a misread: only about a third of kills drop coin, many drops are worth 1gp, and pickups last 40 seconds. |
| **G-BUG-02** prologue hotkeys in the hint | **Fixed in Index 81** (BUG-03). |
| **G-BUG-03** Q/R double meaning | **Works as designed, clarified.** The camp handler returns when `G` is set, so no camp key can fire in combat, and combat keys never run in camp. Hint and Manual now say so (Index 81). |
| **G-BUG-04** west palisade snagging | **Needs commander** (BUG-08, effort M). |
| **G-BUG-05** builder hover | **Confirmed fixed** in Index 80: builders hovered and drawn on sites, plus two full camp sweeps with builders on site, produced no draw warnings. |
| **G-UI-01** title note on the button border | **Partly reproduced.** No overlap of the button at 1024x768, but the note sat tight under its divider and the title was clipped at the top (BUG-02). Added spacing. **Fixed in Index 81.** |
| **G-UI-02** "No Squad Leader yet" | **Fixed in Index 81** (BUG-06). |
| **G-UI-03** EQUIPPED badge over text | **Fixed in Index 81** (BUG-05). |
| **G-UI-04** SOURCE collides with COST | **Fixed in Index 81** (BUG-05). |
| **G-UI-05** formation helper clips | **Not reproduced.** At 1024x768 the "Open Order..." line is drawn at VH-62, above its panel, with room (only the ability bar's labels sit near it). It is not clipped by a container. If it happens, it is on a window shorter than ~600px, where the 10.5px floor pushes the line against the ability bar; the fix would be to move it above the bar. Left as is. |
| **G-UI-06** Reeve's Keep label and Ring the Bell | **Fixed in Index 81** (BUG-04 for the button; the hint bar no longer intercepts clicks and is one line in the prologue, so it covers less of the map labels). |

## Update: BUG-08 fixed in Index 82

Status: **fixed in Index 82** (was "needs commander").

- Change: new section at the end of `index.html`. `moveEnemy` is wrapped: when the target is a siege structure (`target.struct`) and the straight line is blocked (`clearLine` fails), the enemy follows a flow field built from that structure (cached per structure in `G.sflow`, rebuilt when any wall falls). Clear lines, the leader, every other target and every other contract fall through to the original code unchanged. Rollback: delete Index 82.
- Scope note: this build has **two** prologue assaults (`ASSAULTS.length` is 2), not six; both were tested, three runs each, 3,600 ticks (one minute) per run, squad idle inside the walls, with and without the patch (a temporary switch, since removed).
- Time to first wall or gate hit (frames, per run):
  - Assault 1 before 283 / 275 / 323 (avg 294); after 216 / 382 / 279 (avg 292).
  - Assault 2 before 92 / 207 / 114 (avg 138); after 198 / 138 / 276 (avg 204). Spread between runs is as wide as the difference, so no real shift.
- Structures fallen after a minute (per run): before 2,1,1,2,2,2; after 1,2,2,3,3,3. Slightly more walls fall, which is the fix working (fewer enemies lost on corners), so the siege may be a touch harder in the second assault. No balance values were changed.
- Stuck check (melee enemy outside the walls, unmoved for 240 frames, more than 70px from any wall and the leader), sampled every 240 frames: 0 of 1,205 samples before, 0 of 2,065 after. My check was too strict to show the original snagging, so I can't prove the old bug is gone, only that nothing got stuck and walls and gates are still reached and attacked.
- Also run on the final code: two raids (bandits, greenskins) and a sortie, no console errors or draw warnings.

## Update: UX auditor's bugs (Index 82)

| Bug | Result |
|---|---|
| **B-1** disabled-button tooltips | **Fixed in Index 82.** `.btn`, `.mini button` and `.sealbtn` disabled now take the pointer (`cursor:not-allowed`, hover effects off) so `title` reasons show. A capture-phase document click guard stops any click on a `button:disabled`. Verified: computed `pointer-events:auto`, cursor `not-allowed`, a disabled button's `click()` and a dispatched click both ran no handler. |
| **B-2** Faction Standing labels overlap | **Fixed in Index 82.** After the table renders (and on image load and resize), `nudgeSeals82` scales the seals to the map width (min 0.55) and pushes colliding ones apart, clamped inside the map. At 1024x768 (map 386x227px): 27 overlapping pairs before, 0 after, all seals inside the map. Labels are small on that map but legible. |
| **B-3** wax seal over perk text | **Fixed in Index 82.** `.cscroll{padding-bottom:66px}` (computed 66px), so the 48px seal sits below the last line. |
| **B-4** | Already fixed in Index 81. |
| **B-5** Treasury 850 -> 890 | **Not a bug, left as is.** `startSiege` runs `nextDay()`, which adds the Silver Pit's +40gp and writes the same "+40gp" line into the Morning Report that opens with Day 1. The bar and the report change together; it only looks early because the Charter Kit screen precedes it. |
| **B-6** two tabs on one save | **Fixed in Index 82.** A `storage` listener shows one dismissible banner ("This save was changed in another tab or window...") the first time another tab writes the current save key; no auto-reload. Verified: two events produce one banner. |

No console errors during the checks.
