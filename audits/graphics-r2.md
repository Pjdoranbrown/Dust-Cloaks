# Graphics re-audit, round 2 (build 554b965)

Reviewer: game graphics. Read-only; nothing in `index.html`, `js/*.js` or `game-bible.md` was changed. Tested muted at 1280x800 (and one 1920x1080 look) with `.claude/audit.js` loaded. The real campaign (4 mates) was used; `saveMeta` was disabled in the page so nothing was written to the save.

## Summary
1. One real regression from my own J-06: when the Leader stands with a wall in front of them, every Brace slot (now all in front) is blocked, so every mate collapses onto the Leader and stacks (measured: mates 1-9 px from the Leader for 150+ ticks). Fix below.
2. Separation works at rest (Open Order minimum gap 32-42 px; Brace arc 16+ px in open ground) but loses to slot pull while moving: in a 150-tick walk the gap fell under 12 px for about 19% of ticks (minimum 1.6-5.5 px).
3. Everything else shipped from both rounds works on the combined build: no console errors and no "Draw error" warnings across the camp in all four holdings x four seasons, all 16 contract kinds (seasons rotated), a raid-start and the bar fight; frame cost 1-5 ms.
4. At 1920x1080 the HUD scales to about 1.4x but world overlays (floating text, squad bars, camp bubbles and labels) stay 1x, so they now look tiny next to the HUD.
5. Coverage gaps I could not close: the raid itself (my harness started the raid contract with zero enemies and drew a stale frame), and the prologue (`openStory()` in this build shows the Reeve's Hall panel, not an in-world scene), so neither was seen live.

## Regressions and bugs

### GFX2-R1 Brace collapses onto the Leader when a wall is ahead (regression from J-06)
- Where: `slotTarget` wrapper (js/graphics.js, Index 84b) with `updateMates` (index.html about line 2200: slots near a wall are pulled toward the Leader up to 8 times, then set to the Leader).
- Repro: start any contract (I used Hold the Redoubt), walk the Leader right until against the east wall (Leader at x about 1510, y 1050), press Brace. Slots are at (+32, +/-9) in front, all blocked. After 150 ticks mates sit at about (+1,+11), (-3,-1), (-9,0): on top of the Leader and each other, and one mate dropped out of "up" in my run.
- Cause: the old full ring always had free slots behind; my arc puts all of them in front of the aim direction.
- Suggested fix: in the `slotTarget` Brace branch, test up to 7 centre angles (facing, then +/-45, +/-90, +/-135, 180 degrees) and use the first whose slots are not `blockedXY` (use the same five-point test `updateMates` uses); fall back to the old ring if none. Cache the chosen angle per formation change so the arc does not flip every frame. Effort: S-M. Owner: commander (movement code; the original J-06 author can do it).

### GFX2-R2 Mates still overlap while moving
- Where: `sepMates` (Index 84b). Cap of 1.2 px per frame against the slot pull and double-time catch-up.
- Repro: 150-tick walk in Open Order or Brace with four mates: gap under 12 px on 28 and 61 of 150 ticks, minimum 5.5 and 0.9.
- Suggested fix: raise the cap to 2.0 px and run two passes, or push harder when both units are moving the same way; also apply a small sideways bias to a mate's slot when it is within 14 px of another mate. Effort: S. Owner: delegate.

### GFX2-R3 Bar fight: two mates stay 160 px from the Leader
- Where: `startDeployment` for the brawl (placement) and `updateMates`.
- Repro: start the brawl with 4 mates, 120 ticks of Open Order: offsets (4,161), (-11,157), (-6,19), (6,21). Not seen before the spacing change, so it may be old; I could not tell whether tables or my separation hold them. Effort: S to investigate. Owner: delegate (bug finder).

### Minor
- The old speech-bubble style can show for one frame when a new bark starts (the wrapper hides only barks that already existed). Cosmetic. Fix: hide `q.bark` before the first draw in the same wrapper by also checking `barkLife === 260`.
- Tavern hint line ("Braced: +1 AC...") draws over the stone tile border at the bottom and loses contrast. Add a dark backing plate. S, delegate.

## Verification of my shipped items

| Item | Result | Note |
|---|---|---|
| GFX-01 walk cadence by speed | works | measured 3.0 px/frame about 5.4 ticks per frame, 0.6 px about 14; not studied frame by frame live |
| GFX-09 direction hold | works | |
| GFX-03 floating text stacking | works | at 1920x1080 the text is small (see GFX2-N1) |
| GFX-04 fog edge | works | edge is a smooth ramp in contracts |
| GFX-05 winter puddles and fort roads | works | the warehouse also shows a frozen puddle indoors (roof-leak puddles), acceptable |
| GFX-12 trees +20% | works | forest still readable |
| GFX-13 coins and gems | works | |
| GFX-15 squad bars | works | small at 1080p |
| GFX-16 corpse shadows, GFX-08 | works | seen in round 1; not re-inspected closely |
| J-06 separation, Open Order | partly | GFX2-R2 |
| J-06 Brace arc | partly | good in open ground (arc 18..34 px), broken against walls (GFX2-R1) |
| J-06 camp idler ring | works | no errors in all holdings; could not photograph an overlap case |
| J-08 dust, knockback | works | dust specks created while charging (5 live); knockback tag set on hit |
| J-08 hit-stop (off by default) | works | with the setting on, a 5-damage hit stopped 2 of 3 updates |
| J-09 ink ring, bubbles, labels | works | |
| J-09 shadows lower-right, fire pool | works | warm pool visible in camp |
| J-09 plot fade | works | only while the Leader is under keyboard control |

## Coverage this round
- Camp: fort, barge, warehouse, waystation x spring, summer, autumn, winter: no errors. Screenshots of barge (summer), warehouse (winter) and waystation (autumn): all draw correctly; the light beams, deck, rigging and autumn leaves read well.
- Contracts: all 16 kinds, 200-260 ticks with sprint and Brace forced, seasons rotated; `AUD.contractSweep` on hunt, beacons, breach, plague, trial and ambush: only the flat-on-purpose items showed up (arrows, the "?" blip token, coins, HUD, minimap, the fog scale-up).
- Bar fight: draws correctly; squad bars and the notched labels read well.
- Not covered: the raid itself and the prologue (see summary), and anything under the "Save changed in another tab" banner, which other sessions were triggering.

## New proposals

### GFX2-N1 Scale world overlays with the window
Floating combat text, squad bars, camp bubbles and `campLabel` stay 1x while the contract HUD scales by `clamp(VH/760, 1, 1.6)` (about 1.42 at 1080p). Draw them with `k = Math.min(1.35, Math.max(1, VH / 760))`: scale the font size and the pip/plate sizes in `gfxMateBar`, `bubble`, `campLabel` and the Index 79 text hook for `G.fx` text. Effort S-M. Owner: delegate.

### GFX2-N2 Plot signs per holding
Barge and warehouse empty plots reuse the fort's sign and wooden stakes. A barge could use a rope-and-bollard marker, a warehouse a chalk rectangle and a crate stencil. Effort M. Owner: delegate.

### GFX2-N3 Camp squad spacing: furniture
Wandering camp people can still stand on benches and logs. Add a small avoid list of furniture positions to `separatePeople`. Effort M. Owner: delegate.

### GFX2-N4 Dust for Shield Bash and landings
Dust now covers sprint and Brace start. Add a ring burst on Shield Bash and when a thrown or knocked unit lands. Effort S. Owner: delegate.

### GFX2-N5 Hit-stop and knockback options in Settings text
The Hit-stop checkbox exists; add a one-line hint ("freezes the action 1-2 frames on big hits") and an optional "Knock-back on hits" checkbox for players who find the shove distracting. Effort S. Owner: delegate.

### GFX2-N6 Raid and prologue coverage
Next round, test the raid from the real "Raiders!" panel (so it spawns its waves) and the prologue by playing it, with screenshots. Effort S. Owner: commander or bug finder.

## Fixed (Index 84c, `js/graphics.js`)

Tested muted at 1280x800 with `.claude/audit.js` loaded, using the real campaign (4 mates, saving disabled in the page). No console errors and no "Draw error" warnings.

| ID | Result |
|---|---|
| GFX2-R1 Brace against walls | Fixed. `slotTarget` now picks the first of eight arc centre angles (facing, then +/-45, +/-90, +/-135, 180 degrees) whose slots are all clear of walls (same five-point test as `updateMates`), tries last frame's choice first so it does not flip, and falls back to the old full ring only if walled in on every side. Test: Leader pressed against a wall in each of four directions on Hold, Hunt, Breach, Extract and Plague (every case that actually reached a wall): nearest mate to the Leader 14-33 px with all 4 mates up, where before they collapsed to 1-9 px. In the bar fight the arc is skipped so its own engage-the-nearest slots stay. |
| GFX2-R2 mates overlapping while moving | Mostly fixed. Separation now runs two passes with a 2 px cap (was one pass, 1.2 px). 200-tick walks: Open Order never fell under 12 px (minimum 13.3 and 14.0), Brace walking 'w' minimum 12.8; one Brace walk kept 7.3 px minimum (102 of 200 ticks under 12 px) while the squad was still settling from Open Order into the arc. |
| GFX2-R3 bar fight mates 160 px away | Not a bug. The bar fight's own slot wrapper (Index 72) sends each mate to the nearest brawler, so mates 100-200 px from the Leader is intended. I briefly added a catch-up pull, saw that it fought that behaviour, and removed it again. |
| R2-01 builder label wording | Fixed. `campLabel` in 84c applies the UX rewrite itself before drawing in the notched style. Checked with a text spy: "Building the Tents" / "Dunstan \u00b7 1 season left \u00b7 click for the site", "Resting \u00b7 sits out the next contract", "Building something new" / "Ann \u00b7 click for the site"; ordinary plot labels unchanged. |
