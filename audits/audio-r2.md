# Audio re-audit, round 2 (build 554b965)

Read-only. Tested muted by measurement, not by ear: every output was routed through a zero-gain node, with analysers on the music and effects buses, the ducking gain, the context states and live source-node counts. (I used my own zero-gain routing instead of `.claude/audit.js` because the music scheduler needs a non-zero music volume to run.) Saves were backed up and restored afterwards.

## Summary
1. J-19 to J-22 all work on the combined build; no console errors in any run; one shared context, the same one the whistle now uses.
2. **One real bug:** the debrief stinger fires on every `win`/`down`/`level` sound while the finished contract is still open (the `G` object stays until you leave the debrief), so promoting a veteran after a lost contract plays the defeat dirge.
3. Two ducking problems: a Momentum choice stacks the level-up duck on the pause duck (about -14 dB), and sustained Leader damage pumps the music every second.
4. A contract that starts in the bard's rest between verses (or with the bard Off) still takes the old path: different tune, old fade and gap.
5. Node counts and arrays are flat over 6 camp-contract trips (about 5 minutes of play); the hit-stop and new game-feel hits do not touch audio.

## Regressions and bugs
| ID | Where | Reproduce | Fix | Effort |
|---|---|---|---|---|
| AUD2-B1 | `js/audio.js` 87d `SFX.play` wrapper | Lose a contract (`G.over`, result fallen), open the debrief, then trigger any `level`, `win` or `down` sound (progression 5009/5123, rank'n, council seats). Measured: each call plays two stinger notes: the defeat dirge after a loss, the victory cadence again after a win. The real sound never plays | Play the stinger once per finished contract: set `G.stung = true` (or compare `G.overAt`) and only intercept within about 2 s of the first win/down/level after `G.over`; later calls fall through to the normal SFX | S |
| AUD2-B2 | 87c ducking + `tick` pause duck | Level up with the Momentum choice open (`G.momChoice`, paused): `level` ducks the music to 0.56 and the pause duck holds it at 0.35, together 0.20 (-14 dB) at the moment of choosing. The brief asked for -4 to -6 dB | Skip the SFX duck while `G.paused` or `G.momChoice` is set (the pause duck already covers it), or make the level duck 0 when the choice opens | S |
| AUD2-B3 | 87c `DUCK.hurt` | Take damage continuously for 3 s: six hurts, the duck re-triggers every second and the music sits at about 0.71 (-3 dB) with an audible dip each second | Duck on hurt only if none for 3 s, or only when the Leader drops below half Con; keep hits and chip damage out | S |
| AUD2-B4 | `tick87` fallback | Start a contract while the bard is resting between verses (2-3.5 s, or 5.5 s when never chosen) or set to Off: the game takes the classic path (`iron` tune, old 0.5 s fade and gap, no layers; same cut as before J-20). Measured: `active` false, `fsong` iron | When a fight is wanted and the bard is resting (not Off): set `M.restartAt = 0`, let the camp bus start, then enter the unified path next tick. For Off, keep the old behaviour (no camp tune to continue) | M |
| AUD2-B5 | environment | The dev save `dust_cloaks_v4` in this browser profile has `volume: 0` (left by earlier audit/balance runs); with it the music engine is silent and SFX master stays at 0 even after `settings().volume` is raised in memory (`SFX.setVol()` is needed) | Not a game bug; restore volume from the `ux83:` backup copy before playtesting by ear. Consider `audit.js` restoring volume when a run ends | S |
| AUD2-B6 | `M.barQ` | After a contract ends, stale entries stay in `M.barQ` (6 max). Harmless: `barNow()` returns null unless the track is `fight` | none needed | - |

## Verification of shipped items
| Item | Result |
|---|---|
| J-19 AUD-01 lute melody (Jig, Embers, Dust and Iron, March) | works; Tankard keeps fiddle |
| AUD-02 mellow pipe | works (battle whistle, party doubling) |
| AUD-05 mix chain (shelf, reverb, compressor) | works; music steady, no errors |
| AUD-06 town drums (dum/tek) | works; contract drums unchanged |
| AUD-07 bard strum on the audio clock | works in all five songs; `barNow` correct during unified contracts |
| AUD-10 softened SFX | works; `bossdie` rumble now full length |
| AUD-15 rests + wind bed | works: rest 7.9 s incl. fade when never chosen, bed present; absent when Off |
| AUD-16 Soft sounds, hidden-tab, hint | works (Soft sounds checkbox present; hint seen earlier) |
| J-20 continuous theme | works: camp -> contract -> levels -> camp, 6 trips, no cut, easing within range, raid x1.08 measured |
| J-21 shared context | works: `AudioContext` identical for SFX, music and whistle |
| J-21 ducking | works per design: `hit crit coin pick swing block bash heal chest` = no duck (1.0); `hurt` 0.71, `horn level win` 0.56, `boss down` 0.5; but see B2, B3 |
| J-21 Effects slider | works (present in Settings, `sfx=0` silences effects) |
| J-21 voice cap / node cleanup | works; voices stay 25-32 in camp and under 62 at level 2 |
| J-22 title (solo lute, slower, quieter) | works: only `pipe`/`cut` events, `pk` 1.06 -> 1.22, mood 0.6; restores after the title closes |
| J-22 prologue (Varnholt) | works: story camp tune, then a sortie builds from it (`active` true, song jig) and ends cleanly |
| J-22 debrief stinger | partly: fires correctly at contract end (music bumps, no dip), but see B1 |
| J-22 raid tempo | works (x1.08 on the target) |
| J-22 new sounds | works: build/demolish/pause/luck are wrapped on the live functions; low-health heartbeat fires about every 1.4 s |
| Hit-stop / new game-feel (graphics 84b) | no interaction: it freezes game frames only, the audio clock and scheduler are unaffected; no SFX are attached to those hits |

## Long-session counts (muted, 6 camp<->contract trips plus rests, about 5 minutes)
Live audio sources at camp: 35, 36, 26, 52, 52, 45, 38 (no trend); contract level 2 peak 118 -> 131; voices 29-32; `ksCache` 12; `barLog` 8; J-20 log capped (300); `noteQ` under 30; `barQ` 6 (cap). Nothing grows. A full 15-minute run is still not covered (timer throttling in a hidden pane makes it slow); the structures are all capped.

## New proposals
| ID | Change | Effort | Owner |
|---|---|---|---|
| AUD2-01 | Fix B1: stinger once per finished contract | S | delegate |
| AUD2-02 | Fix B2 and B3: no SFX duck while paused or Momentum choice; hurt duck only after 3 s quiet | S | delegate |
| AUD2-03 | Fix B4: contract started in a rest continues the camp tune (restart the bus, then unify) | M | delegate |
| AUD2-04 | A soft "thud" (sine 60 -> 45 Hz, 80 ms, gain 0.10, no duck) tied to the hit-stop big hits (`n >= 5`), so the freeze has a sound; keep it off the 1-2 hit cases | S | delegate |
| AUD2-05 | Low-health heartbeat is the loudest of the new sounds relative to the music (peak about 0.007 vs music 0.011); check by ear and lower to 0.06 / 0.04 if it competes | S | commander (ears) |
| AUD2-06 | Title uses the bard's chosen tune; with The Full Tankard the title stays a fiddle reel. Force Embers (or the Jig) as the title tune when the choice is Party | S | delegate |
| AUD2-07 | Debrief music: after a defeat, let the camp tune start 2 s late and 3 dB quieter ("a hush") before it comes back to full over 8 s | S | delegate |
| AUD2-08 | Persist `settings().sfx`/`softSound` defaults check on import of old saves (keys missing = defaults; verified for Effects, to be checked for Export/Import) | S | commander |
| AUD2-09 | Add an audio self-test to `.claude/audit.js` (shared context, ducking values, node counts) so a regression is caught without ears | M | commander |
| AUD2-10 | Run one true 15-minute soak (visible pane, real timers) before release | S | commander |

## Fixed (js/audio.js, block "INDEX 87e")
Measured muted, same method as above. Rollback for all: delete the 87e block and the `!A.noStinger` test in 87d.
| ID | Fix | Measured |
|---|---|---|
| AUD2-B1 | the stinger plays only for the first win/down/level after a contract ends (within 2.5 s); later ones are the normal sounds | first call: 2 stinger notes; `level` and `win` afterwards: 0 stinger notes, the real effect is heard |
| AUD2-B2 | no music duck while paused, or on a level-up that opens the Momentum choice (`G.levelQueue`) | level with a choice pending: duck 1.0 (was 0.56 stacked to 0.20); horn while paused: 1.0; ordinary level-up still 0.56 |
| AUD2-B3 | Leader hurt ducks at most once every 3 s | 6 hurts in 3 s: 1 dip, music below 0.95 for 13 % of the time (was held at 0.71 with a dip every second) |
| AUD2-B4 | `startDeployment` first restarts the camp bus if the bard is between verses (not Off, music on), so the tune carries into the contract | contract started in a rest: `resume-from-rest` logged, J-20 unified path active, same song (march), music level climbs 3 -> 15 smoothly, no `iron` switch |
| AUD2-B5 | not mine (bug finder, `.claude/audit.js`) | - |
| AUD2-B6 | stale `M.barQ` cleared once back in camp | length 0 |
