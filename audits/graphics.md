# Game graphics audit (in-world look)

Reviewer: game graphics auditor. Read-only; nothing in `index.html` was changed. Line numbers are against the current `index.html` (about 25,200 lines, Index 80).

## Summary
1. The 3D world is cohesive: camp (summer/winter), the Hold-the-Redoubt contract and fire/props read as one soft-lit pixel-ish world. No pixel-art leakage seen in the views I drove by hand.
2. The biggest gaps are animation, not models: the walk cycle runs at a fixed cadence (ice-skating), direction changes can flicker between 8 pre-rendered directions, and nothing kicks up dust or recoils.
3. In combat the squad has no separation force (only enemies and camp idlers do), so mates stack and their bars/labels collide; floating text ("CRITICAL", "MOMENTUM RANK", "STEADY") piles up on the Leader.
4. Several Gemini leads are already done (ground shadows, hit flash and hit clip, humanoid death-collapse clip, construction builders and dust, enemy health bars with border); see the Gemini leads section.
5. Winter is the weakest season: puddles stay liquid-blue, roads nearly vanish into the ground, and the flat fog edge in contracts is a hard yellow-brown halo.

What I checked: camp (fort holding, summer and `SEASON_FORCE='winter'`), a Hold the Redoubt contract after about 700 ticks with 21 enemies, a style swap Crisp to Retro, and the code for animation, death, shadows, bars and separation. I did not get to the other three holdings, the other 15 contract kinds, a raid, the bar fight or the prologue in the browser. Items from those screens would be additional. The pane was visible, so frames could be driven by hand.

## Prioritised list

### GFX-01 Walk and run cycle ignores real speed (ice skating)
- Where: `r3dChoose`, lines 20067-20085 (`Math.floor(tick / 6) % 8` walk, `tick / 4` run). `r3dDirFor` (20052-20065) already measures `dx,dy` per unit for non-leaders.
- Problem: cadence is time-based, not distance-based. Snow/mud slow (`seasonSlow`, trap slow 0.6, Shaken 0.85, Withered 0.75), Shift sprint and enemy `speed` differ, but legs animate at one rate, so slow units skate and fast ones jog in place.
- Change: keep a per-unit phase accumulator in `u._r3d`: `st.ph = (st.ph||0) + moved/STRIDE` with STRIDE about 5.5 px per frame index (8 frames = about 44 px per cycle for a Crisp-sized human; tune by watching one unit). Walk frame = `floor(st.ph) % 8`. Run uses the 8-frame run clip with STRIDE about 8. For the Leader use the real per-frame displacement (store previous x,y the same way). Cap idle-to-walk blending: clip stays 'walk' only while `mvT > 0`.
- Effort: S (two functions, one file region). Owner: delegate (low risk; visual check needed).

### GFX-02 Squad Mates have no separation force; units and bars stack in combat
- Where: `slotTarget` (2191), `updateMates` (2198), `separate()` (2559, enemies only). Camp has `separatePeople` (17670, R = 17) but it skips pairs where both are "pinned" (role spots, idlers), which is why idlers still overlap furniture and each other.
- Problem: Brace ring radius 34x30 for n mates plus Leader gives about 25 px between mates at n = 8 but they then collide with each other when moving; Open Order slots vary radius 58/74 and overlap when n is small. Bars/labels overlap.
- Change: add `separateMates()` after `updateMates`: pairwise over `G.squad` (state up) plus Leader, personal space 16 px in x, 11 px in y (sprites are wider than tall, same y-scale trick as the camp code: multiply dy by 1.5). Push each mate (never the Leader) by `(R - d) * 0.3`, then run `collide()` so nobody is pushed into walls. For Brace use R = 14 and sort slots by angle so the ring becomes a shoulder-to-shoulder arc facing `G.facing`: change the shield-wall branch to an arc of +/-70 degrees in front of the Leader at radius 30 with spacing `min(20, 140/n)` instead of a full circle. Also pairwise-check camp idlers: let pinned/pinned pairs be pushed 0.15 so two idlers do not share a spot.
- Risk: moves unit positions, so it touches targeting ranges and Command Radius checks; keep pushes small and capped (max 1.2 px per frame), do not push into the 6.11 Open Order blast logic differently. Needs a play test.
- Effort: M. Owner: commander (movement code).

### GFX-03 Combat floating text stacks and is hard to read
- Where: `pop()` (3007; life 46, no collision handling); CRITICAL, MOMENTUM RANK, STEADY drawn at the same spot on the Leader in the Hold contract screenshot.
- Problem: three labels overlapped on one pixel row.
- Change: in `pop`, offset `y` by `-9 * k` where k = number of live text fx within 12 px horizontally and 14 px vertically; also drift `vy = -0.5`. Give text a 2 px dark stroke (`strokeText` first) if not already; keep fonts as set by Index 79.
- Effort: S. Owner: delegate.

### GFX-04 Hard edge on the contract fog/vignette
- Where: `draw()` fog pass (Index 49 RTS fog; the yellow-brown halo around the lit area in the Hold screenshot).
- Problem: the unexplored edge shows a warm yellow rim and abrupt falloff, which reads as a glowing border rather than darkness, and is brighter than the lit floor next to it.
- Change: make the rim colour the same cool near-black as the fog (`#0b0d0a`), widen the soft gradient by about 40 px, and drop the warm tint. Where the walls end, keep the edge at 0.85 alpha rather than bright.
- Effort: S-M. Owner: delegate (needs a screenshot check).

### GFX-05 Winter water and roads
- Where: puddles (line 21718 and `seasonWaterBase`), `drawCampRoads` and ground road tile for winter.
- Problem: in winter the puddles are liquid-blue ovals with a ripple, so the "ice" cue is missing. The camp roads become a faint dotted line with no edge, so paths disappear against the dark green-grey.
- Change: winter puddle = pale blue-white `#b8d0d8` fill, `#e8f0f2` highlight arc, one or two dark crack lines, no ripple animation. Winter road: lift the road colour about 12 lightness and add a frost fringe (1 px `#d8e0dc` at 40 % alpha along both edges); keep wheel-rut lines darker.
- Effort: S-M. Owner: delegate.

### GFX-06 No dust, no ground feedback for sprint, Brace, landing
- Where: `G.fx` particles; only blood/death sparks exist (killEnemy, 2432). Camp `CAMP.puffs` is only chimney/fire/construction dust (5949, 18020, 24724).
- Problem: movement has no ground contact, so the world feels slippery with GFX-01.
- Change: when a unit is running (`running` in `r3dChoose` or `G.chargeT > 0`), push a dust puff every 6th frame at the feet: `{x, y+7s, vx:rnd(-.3,.3), vy:-.2, life:22, c: season ground tone (dust1 from SEASONS_CFG), r:2.5 growing to 5, alpha .35}`. In winter use `#e8eeee` (snow kick). On Shield Bash and Brace start: a ring of 6 puffs radius 12. Cap at 40 live puffs.
- Effort: M. Owner: delegate.

### GFX-07 Ranged and melee impact is under-sold (no knockback, no stagger, no recoil on normal hits)
- Where: `hurtEnemy` (2416: sets `flash = 6`); `o.knock` exists only for Shield Bash (2411).
- Problem: the white flash and the 3D 'hit' clip exist, but the struck unit does not move. Gemini's hit-stop lead is partly done.
- Change: purely visual offset: on a hit set `e.kx = unit vector from attacker * 3`, `e.ky` similarly, decaying `*0.7` per frame, applied only at draw time (do not change `e.x/e.y`, so collision stays untouched). Add a 2-frame freeze (skip `update` for enemies with `e.hit stop` only if both `flash` frames are on) only for crits and boss kills (hit-stop of 3 frames, `G.hitstop`). Attacker lunge: during `atkT > len/2` offset the draw 2 px toward the target.
- Effort: M. Owner: delegate for the draw-only offset; commander for hit-stop.

### GFX-08 Death collapse only for 3D humanoids; animals and monsters use the flat fallback
- Where: `drawUnits`/corpse loop 3998-4006 and `r3dCorpse` (20189) which excludes wolf, cinder, alpha, wyrm, nest, engine. Humanoids already have a 6-frame 'death' clip with fade (alpha = life/40).
- Problem: for those excluded kinds a death shows the pixel sprite rotated 90 degrees, 70 % alpha, with a different look from the 3D world. Corpses are drawn with `shadow:false`.
- Change: check whether Index 56/57 have death clips for wolves and monsters (the quadruped rig has `qPose`); if yes route them through `r3dCorpse`, otherwise tip the 3D quadruped frame on its side (rotate 90 degrees around the feet, scale y 0.85) instead of the pixel sprite. Add a small shadow at alpha 0.15 under corpses so bodies do not float.
- Effort: M. Owner: delegate.

### GFX-09 Walk direction snaps; direction can flicker
- Where: `r3dDirFor` (20052): `if (moved) st.dir = r3dDirOf(atan2(dy,dx))`, threshold 0.2 px.
- Problem: units that jitter (separation pushes, enemy `wob` wander of 0.14 px, formation correction) can flip between neighbouring directions, so characters seem to shimmer. 8 directions are pre-rendered, so turning is inherently stepwise.
- Change: keep the pre-rendered 8 directions but add hysteresis: only change `st.dir` when the new direction has been the target for 3 consecutive frames or the move distance is above 0.8 px/frame. Do not blend between directions (no in-between frames exist).
- Effort: S. Owner: delegate.

### GFX-10 Squad Leader look default
- Where: `r3dStyleId` (19158), `R3D_STYLES` (19149).
- Finding: Retro (res 0.37, hard black outline, 3 bands) and Crisp (res 0.5, inner contour, rim light) look close at play size in the Hold contract; Retro has heavier, steadier edges that match the baked terrain, while Crisp's rim light and finer lines shimmer when units move across tile joints. Pixel sprite is out of the 3D system.
- Change: make Retro the default for new campaigns and when `chars3d` is unset (`v === true || undefined` returns 'retro'), keep Crisp as the option for players who want detail. Do not change a saved explicit choice.
- Effort: S. Owner: delegate (one line); the commander should confirm the preference with the user.

### GFX-11 Camp idlers pinned on furniture and each other
- Where: `separatePeople` (17670): pairs where both are pinned are skipped.
- Problem: seated or role-bound people overlap (fire bench, wagon, planning table).
- Change: for pinned/pinned pairs closer than 10 px, nudge one by `(10 - d) * 0.5` toward the nearest free offset of the original role spot, never more than 6 px from its spot; re-run once per second, not every frame.
- Effort: S-M. Owner: delegate.

### GFX-12 Tree scale
- Where: `W3D_KINDS` tree models (Index 67); conifers and oaks.
- Finding: conifers measure about 65 px tall next to a 100 px house and 28 px characters (about 2.3 characters against 3.5 for buildings).
- Change: scale conifer and oak models by 1.15 (not 1.25: the forest edge already overlaps heavily). Keep dead trees and shrubs. The simplest edit is the scale in the tree draw call (`w3dDraw(..., {k:})`) or `w76Scale`-style factor on the part list.
- Effort: S. Owner: delegate. Check forest density afterwards (canopy overlap grows 32 %).

### GFX-13 Coin and gem pickups slightly large
- Where: line 4043 (coin `blit(..., 2.4)` of a 9x9 sprite).
- Change: scale 2.4 to 1.9; keep the bob and a 1 px pale highlight so it still reads as loot. Coins are "flat on purpose" (Index 76), so no 3D conversion.
- Effort: S. Owner: delegate.

### GFX-14 In-world overlay language (bubbles, labels, command ring)
- Where: speech bubbles in the camp, `drawNote`, command radius ring, label font sizes (Index 79).
- Problem: smooth anti-aliased vectors against a crisp world. Index 79 made text sharper; do not undo it.
- Change: keep fonts; make bubble borders 2 px hard-edged (`imageSmoothingEnabled = false`, integer coordinates), muted parchment fill `#e8dcc0` at 94 %, 1 px `#3a2c1a` outline, and give the tail 3 stepped pixel blocks. Command ring: dashed 6/4 at 1.5 px with integer-rounded centre, colour `#d8b860` at 0.7 alpha so it stops fighting the grass.
- Effort: S-M. Owner: delegate.

### GFX-15 Health bars for squad and friendly units
- Where: enemy bars at 4074-4084 (width at least 26, 1 px dark border, only if `B.boss || maxCon > 6`). I did not find the mate bar code in my pass.
- Change: if mate bars are 4-6 px wide, make them `max(20, r*2.2)` with the same border; draw only when `con < maxCon` or the unit is within the command radius and Alt is held.
- Effort: S. Owner: delegate (find the mate draw first).

### GFX-16 Corpses have no shadow and no ground blood
- Where: `r3dCorpse` (`shadow:false`).
- Change: after the collapse finishes (frame index 5) draw a dark blood stain ellipse (`rgba(70,10,10,.35)`, rx 9, ry 3) under the body, fading with the corpse; skip for undead and constructs.
- Effort: S. Owner: delegate.

### GFX-17 Camp: small clutter at the plot signs and construction frame
- Where: empty-plot signposts and the construction frame at the house.
- Finding: signs are about one character tall and read well; the plot signs look crisp. Not oversized (see Gemini leads).
- Change: none needed; optionally drop the sign shadow alpha a little to match the house shadow.
- Effort: S. Owner: delegate (optional).

### GFX-18 Atmospheric particles are not seasonal
- Where: the floating cyan/yellow sparkles in the camp and contracts (small crosses in both screenshots), `CAMP.drift`.
- Problem: tiny blue sparkles appear in winter too, which looks like magic dust, not snow or fireflies.
- Change: spring = pollen (pale yellow, slow), summer = fireflies at dusk only (warm yellow, pulse), autumn = drifting leaves (already?), winter = only snowflakes (white, 2 px, slow). Drop the blue sparkle outside special areas.
- Effort: S. Owner: delegate.

### GFX-19 Light direction on buildings vs characters
- Where: `r3dLights`/`r3dLightUp` (characters), `w3dDraw` baked light (buildings).
- Finding: characters take rim and fire light; buildings are lit from the upper left. The campfire adds warm tint only to characters. Add a small warm pool on the ground (additive radial, alpha .15, radius 70) around the fire and a shadow cast away from the fire for the bench logs and wagon.
- Effort: M. Owner: commander (needs the lighting pass) or delegate with a screenshot approval.

### GFX-20 Terrain tile seams
- Where: `t77Bake` / `terrain77`.
- Finding: baked ground is soft and uniform, no obvious seams in the views I looked at. The only visible repetition is the dark mottle spots, which repeat with a similar spacing across the whole lawn.
- Change: jitter spot density by 15 % per 256 px block using the hash already used for decor; low priority.
- Effort: S. Owner: delegate.

## Gemini leads

| Lead | Verdict | Evidence and proposal | Effort | Owner |
|---|---|---|---|---|
| Painted portraits vs in-world look | Not recommended | Portraits sit in UI chrome (parchment), not in the world; the contrast is intentional and the portrait set cost is high. | - | - |
| In-world overlays smooth vs crunchy | Confirmed (partly) | See GFX-14: hard-edged bubble border, muted fill, keep readable fonts. No pixel fonts. | S-M | delegate |
| Squad Leader look default | Confirmed with a view | Retro should be the default (GFX-10). Crisp shimmers more; Pixel sprite is a different system and clashes. | S | delegate |
| Camp idlers cluster | Confirmed | `separatePeople` skips pinned pairs (GFX-11). | S-M | delegate |
| Units stack in Brace, bars overlap | Confirmed | No mate separation exists (`separate()` is enemies only): GFX-02 with a shield-wall arc and R = 14-16 px. Risk to targeting and blast logic. | M | commander |
| Tavern clipping in Open Order | Not verified | I did not drive the tavern; `collide()` after the separation push (GFX-02) covers walls. | - | commander |
| Walk cycle vs speed | Confirmed | Fixed `tick/6` and `tick/4` in `r3dChoose` (GFX-01). Distance-based phase accumulator. | S | delegate |
| Instant left/right turns | Partly confirmed | Only 8 pre-rendered directions exist; tween would need new frames. Add hysteresis (GFX-09), not a blend. | S | delegate |
| Attackers lunge or recoil; struck enemies flash and stagger | Partly done | White flash (`flash`, `source-atop` in `r3dDraw`) and the 3D 'hit' clip exist (`u.flash`, 20075). Missing: positional knockback and lunge. GFX-07 (draw-only offset). | M | delegate |
| Enemies vanish when they die | Mostly done | Humanoid 3D units have a 6-frame death clip with fade, plus blood sparks and coin drops (2432-2440, 20189). Wolves, cinders, alpha, wyrm use the old flat rotated sprite (GFX-08). | M | delegate |
| Trees 20-25 % bigger | Partly confirmed | Conifers about 2.3 characters vs buildings 3.5. Use +15 % (GFX-12). | S | delegate |
| Signposts and coins oversized by 35-40 % | Signposts: not confirmed. Coins: partly | Sign is about one character tall (not half). Coin is 9x9 drawn at 2.4x; drop to 1.9x (GFX-13), not 40 %, or loot becomes hard to see. | S | delegate |
| Health bars 12-16 px with 1 px border | Mostly done | Enemy bars are at least 26 px wide with a 1 px dark border (4080-4082) and only for tough enemies. Mate bars to verify (GFX-15). | S | delegate |
| 1. Hit-stop and knockback | Partly done | Flash done; add draw-only knockback 3 px, decay x0.7, and a 2-3 frame hit-stop on crits/boss kills only (GFX-07). Hit-stop on every hit would make combat sticky with 20 units. | M | commander for hit-stop |
| 2. Ground shadows | Already done | `r3dDraw` calls `shadow(x, y+7s, 4.5s)` (rgba .28) for every unit; props carry baked shadows. Corpses are the exception (GFX-16). | - | - |
| 3. Staggered follow delay with spring slot tracking | Not recommended as stated | Mates already move toward slots with their own speed; a fixed delay makes the Brace response feel late and hurts positioning in fights. If wanted, add per-unit speed variance of +/-6 % in `updateMates` instead. | S | commander |
| 4. Death collapse and dust | Death mostly done; dust confirmed missing for combat | Construction dust and chimney smoke exist in camp. Sprint, Brace and bash dust missing: GFX-06. | M | delegate |
| 5. Camera lerp and decaying shake | Partly done | `G.shake` decays and has a setting (`settings().shake`, line 3986). Camera is locked to the Leader (`cx = L.x - VW/2`). A lerp toward the aim point by 10-12 % of speed would add feel, but changes input-to-world mapping for aiming and clicks (cx, cy are used for the mouse). Not recommended without a full pass over screen/world conversions. | M-L | commander |

## Outright bugs and oddities (not design)
- Winter puddles keep the liquid ripple and water colour (GFX-05) and roads lose their edge; counts as a seasonal-correctness bug.
- `r3dCorpse` returns false for wolf, cinder, alpha, wyrm, nest and engine, so those deaths fall back to a 70 % alpha rotated pixel sprite (`draw`, 4001-4006): a pixel-art leak into the 3D world that `audit.js` would not flag as it draws below the sc threshold. Verify in a contract with wolves.
- `pop()` text can overlap exactly (GFX-03).
- The contract fog rim shows a warm yellow band (GFX-04).
- Not covered: other holdings (barge, warehouse, waystation), the 15 other contract kinds, raid, bar fight and prologue. A follow-up pass with `AUD.campSweep`/`AUD.contractSweep` is recommended before the commander treats this list as complete.

## Implemented (Index 84, `js/graphics.js`)

Everything is done by wrapping game functions from `js/graphics.js`, except GFX-15, which needed one in-place line in `draw()`'s squad-mate loop (marked `/* Index 84 */`, falls back to the old pips if `gfxMateBar` is missing). Rollback: empty `js/graphics.js` and undo that one patch.

Checked in the browser: no page errors and no "Draw error" warnings across the camp (all four holdings x all four seasons via `SEASON_FORCE`), all 16 contract kinds (260 ticks each, seasons rotated), a raid and the bar fight. `draw()` averaged about 2 ms per frame in a winter hunt contract. I did not run `AUD.contractSweep` or watch the game live. The Draw-error check relies on console warnings, so a draw error that is only logged elsewhere would not show up. This save only had a fort layout, so the barge, warehouse and waystation layouts did not visibly change when I switched holding.

| Item | What changed | How to see it |
|---|---|---|
| GFX-01 walk cycle | `r3dChoose` wrapper. A per-unit phase advances by a rate that grows with the measured speed (walk 0.045 + 0.05 x px/frame, run 0.07 + 0.06 x px/frame). Synthetic test: 3.0 px/frame advances a frame about every 5.4 ticks (close to the old 6), 1.8 about every 8, 0.6 about every 14. | Walk the Leader in snow (`SEASON_FORCE='winter'`) or while trapped, versus sprinting with Shift. Slow units step slowly. |
| GFX-09 direction flicker | `r3dDirFor` wrapper. A new facing must hold 3 frames before it shows; one-frame flips never appear. No blending (only 8 pre-rendered directions). | Units pushed about in a melee no longer shimmer between facings. |
| GFX-03 text stacking | `pop` wrapper. A new label steps up 13 px for each younger label near it (max 4). | In a contract run `pop(L.x, L.y-30,'CRITICAL','#f0c96a'); pop(L.x, L.y-30,'MOMENTUM RANK 2','#9fd0f0'); pop(L.x, L.y-30,'STEADY','#fff')`. They stack in a column. The existing "MOMENTUM RANK" label that appeared twice in one fight is a separate duplicate message, not touched. |
| GFX-04 fog edge | `fogBlack` wrapper. The black unexplored mask is blurred about one cell, once per fog change (cached). The edge is now smooth instead of showing the cell grid. I could not reproduce the "yellow halo" as a fog colour issue; it looked like lit floor beside the dark. | Any contract: the edge of the black area is a soft ramp. |
| GFX-05 winter | `drawPuddleList`: in winter puddles are drawn frozen (pale ice, frost bloom, two cracks, glint, no ripple). `drawCampRoads`: in winter the fort's roads get a darker mud edge under the road. Contract roads (terrain bake) were not changed. | Camp or any contract with `SEASON_FORCE='winter'`. |
| GFX-12 trees +20% | `w3dTreeAt` wrapper scales `W3D.S` by 1.2 around the call (same trick as `w3dMapProp`). Forest density checked in a summer contract: canopies overlap more but the map stays readable. | Any camp forest edge and contract woods. |
| GFX-13 coins and gems | `simpleSprite` wrapper tags the coin and gem canvases; a `blit` wrapper draws them at 0.79x and 0.82x. | Kill an enemy and look at the coin. |
| GFX-15 squad bars | `gfxMateBar`: dark plate behind 4x4 pips (was 4x3, no plate), pips go green, amber, red as Constitution drops, a continuous bar when a unit has more than 8 pips. | Any contract or the bar fight; lower a mate's `con`. |
| GFX-16 corpse shadows | `r3dCorpse` wrapper draws a soft shadow under 3D corpses, fading with the corpse. Not for nests or engines. | Kill a unit and watch the body. |
| GFX-08 death collapse | Already done. My audit was wrong: `r3dCorpse` is wrapped later (Index 56 for wolf and alpha, Index 57 for the other special kinds), so those do get 3D death clips. I killed one each of wolf, alpha, cinder, wyrm, ogre, devil, nest, engine and enforcer; all drew 3D corpses. Small addition: for kinds that have 3D clips, nothing is drawn for the first 24 frames while the death frames render, instead of the old flat pixel flash. | Run `spawnEnemy(k, x, y, {noNem:true})` then `hurtEnemy(e, 50)`. |

### Skipped, with reasons
- **GFX-18 seasonal particles:** nothing to do. The cyan crosses I called "blue sparkles" are summer dragonflies and fireflies in `drawSeasonOverlay`; spring has pollen and bees, autumn leaves, winter rain streaks. My audit misread them.
- **GFX-20 terrain tile seams:** not changed. I found no visible seams in camp or contract terrain across the views checked, only a repeating mottle. Changing the bake without a defect to fix risks more than it gains. Reopen it if the user spots a seam.
- **Not approved, left alone:** GFX-02, 06, 07, 10, 11, 14, 17, 19.

### Corrections to the audit
- The bugs section said wolves, cinders, the alpha and the wyrm fall back to a flat pixel corpse. That is wrong; they are 3D (see GFX-08).
- GFX-15: mate bars are pip rows drawn inline in `draw()` (about line 4101), not 4-6 px bars.
