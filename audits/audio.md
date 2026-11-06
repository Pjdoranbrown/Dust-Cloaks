# Audio review: sound effects and music

Reviewer: sound-designer delegate. Review only; no game files were changed. Demo: `audits/audio-demo.html`.

## Summary
1. The grating comes from the **`pipe` voice**: a pure sine plus an octave triangle with vibrato, sitting at 440-1000 Hz (up to 1.3 kHz in the reel), loud (peak 0.36, the loudest voice), bone dry, and doubled an octave up in battle. It is a whistle held at constant volume right where the ear is most sensitive.
2. The game already has a lute (`pluck`, `lute`) and a hand drum (`thump`/`tick`), but the lute only accompanies; the melody is the pipe. The fix is mostly **swapping who carries the melody** and adding a little room reverb.
3. Town and contract are two separate arrangements that **cut to each other** (fade out, new song, restart at bar 0, different tempo). Nothing carries across, so there is no "same tune building up" and no live tempo.
4. Battle tempo follows Game speed only as a fixed multiplier read per bar; it does not respond to danger, momentum or slow-mo. Layers do respond (levels 0/1/2), so the building blocks exist.
5. SFX are short and mostly fine, but they use a **second AudioContext**, have no music ducking, no pitch variation, and a handful (coin, pick, horn, nope) are bright square/saw beeps heard dozens of times. The mix is mono and dry.

## How the audio works now (index.html line numbers)
| Piece | Where | What it does |
|---|---|---|
| `SFX` | 4359-4416 | Own `AudioContext` + master gain (volume x 0.5). `tone()` oscillator beep, `noise()` band-passed noise (0.5 s buffer, not looped). 27 sounds in `SOUNDS`. `GAP` rate-limits a few names (hit 45 ms, coin 40 ms ...). Unlocked on first `pointerdown`. |
| Settings | 4417-4436, 14294 | `settings().volume` (SFX and music master), `music` slider (added at 14294). No SFX-only or music-off-per-context control. |
| `MUS` | 13674-14292 | Own **second** `AudioContext`; `out` gain, compressor (-16 dB, 4:1) on a shared bus. Scheduler `schedule()` runs from a 120 ms `setInterval`, looks 0.7 s ahead, builds a bar of note events (`{t,k,m,d,v}`) and calls `V[k]`. |
| Camp tunes (5) | 13700-14040 | `jig` (A minor 6/8, 0.2 s eighth = 100 BPM dotted), `embers` (4/4, eighth 0.42 = 71 BPM), `party` (reel, fiddle), `iron` and `march` (battle melody plucked slowly, `makeBard`). Melody is on `pipe`/`fiddle` in jig, embers, party; on `lute` in iron/march. One pass (16-32 bars) then a rest of 2-16 s of silence. Per-pass random tempo +-8% (pipe tunes) or +-16% (lute tunes), `passTempo()` 14077. |
| Combat arrangements | 13930-14000, `makeCombat` | Same notes with kick/snare/hat/taiko/bass/saw+square `lead`; levels 0-2 from `fightLevel()` (14152): 0 nobody near, 1 contact, 2 boss or 7+ near or Leader hurt. Rises instantly, falls after 5 s. |
| Tempo | `fightK()` 14090 | Contract bar length x `100/speed%` (Normal 1.0, Steady 85%, Slow 70%). Read per bar. Camp ignores it. |
| Track change | `switchTo()` 14099 | Fades old bus (0.5 s into a fight, 1.2 s out of it), starts a new bus at bar 0 after 0.12 s (fight). No shared phrase, key is the same but bar 0 restarts. |
| Voices | 13906-14000 | `pipe` (sine+tri 2f, LP 3400, vib 5.3 Hz, chiff+breath noise = 3 oscs + 2 noise nodes per note), `pluck` (tri+sine, LP 2300, 0.55 s), `lute` (tri+sine 2f+saw, LP 4200 sweeping to 1500, 4 nodes + noise), `lead` (saw + square detuned, LP 2700), `bass`, `pad`, `fiddle` (2 saws), drums are sine + noise. |
| Bard sync (camp) | 14653 `bardFrame`, 14699 `bardNotes` | Animation frame toggles every `MUS.beat()` seconds (a lookup of the song's eighth/quarter, **not** the playing tempo `pk`, so it drifts when `passTempo` is not 1). Floating notes come from `takeNotes()`, melody events only (`pipe/fiddle/lute`, v>=0.6). |
| Bard at the bar fight | 16955-17033 `danceBeat` | Uses `MUS.barNow()` phase, so it is already tied to the real bar clock. This is the model to copy. |

## Prioritised proposals

### AUD-01 Replace the pipe as melody carrier with a plucked lute (the fix for "grating")
**Found:** `V.pipe` (14000s): sine+triangle, constant level, vibrato, narrow band 400-1300 Hz, no attack transient beyond a 35 ms swell, chiff at 3x. Pure partials with sustain = whistle/recorder fatigue. In levels 0 and 1 it is also doubled at +12.
**Change:** new `V.lute2` for the town melody. Recipe (as in the demo): pre-render a Karplus-Strong string per pitch into an AudioBuffer (damped delay line, `y[n]=0.997*0.5*(y[n-D]+y[n-D-1])`, D = sr/f - 0.5, fractional-interpolated, seed = noise one-pole softened at 0.55, normalise, 2.4 s). Play with one `BufferSource` -> lowpass 3600 Hz sweeping to 900 Hz over 0.7 s -> peaking +5 dB at 230 Hz (body, Q 1.2) -> gain 0.5 with an exponential release at ~0.6 x note length. Add a 20 ms band-pass noise click (f x 3, gain 0.03) for the finger. Notes of 5+ eighths are re-plucked at their halfway point (already done in `makeBard`). Keep `pipe` only as a rare solo for the Jig and as a 0.15 gain "breath" layer.
**Effort:** M. **Owner:** delegate (`js/audio.js`, override `V.pipe`/`V.lute` by name or set `MELODY` kind).

### AUD-02 Mellow the pipe itself (quick win if the lute swap is delayed)
**Change:** cut peak 0.36 -> 0.22, lowpass 3400 -> 2000 Hz, remove vibrato on notes under 0.6 s, slow attack to 60 ms, remove the +12 doubling in battle level 1 (`variant&1` branches in `fightBar`/`makeCombat`), shift the Embers/Jig melody a 4th down only if needed (lead lives at A4-A5; ear fatigue peaks above ~1 kHz). Doing only this takes the edge off but does not fix the character.
**Effort:** S. **Owner:** delegate.

### AUD-03 One continuous theme: town to contract is the same tune, with layers added
**Found:** town (`camp.fn`) and contract (`combat.fn`) are different arrays built from the same notes but both restart at bar 0 on `switchTo`, with a fade and a re-seeded tempo.
**Change:** keep one transport (`M.bar`, `M.nextT`). On entering a contract do **not** reset `bar`; keep the same song, swap the bus trim, and let the layers join on the next bar line: camp = lute melody + 1 low thumb/bar + soft frame drum (embers tempo ~71 BPM); contract start = + bass (sine+tri LP 360 Hz) + lute arpeggio at gain 0.28 + hand-drum groove + shaker; danger/momentum = + pad + big drum + octave lute. The demo section 2 does exactly this with one 8-bar loop. Replace the saw+square `lead` with this stack for the **Embers and Jig** pair first (the user's town tune), leave Dust and Iron's hard synth as the battle-only option. Fade only the voices that leave (hat, kick, arp), never the melody.
**Effort:** L. **Owner:** commander for the transport change in `MUS`; delegate for arrangement and voices.

### AUD-04 Tempo follows game state, smoothly (Humanity-style)
**Found:** `fightK()` is a static multiplier; camp tempo is a random +-8-16%; nothing responds to slow-mo, pause (pause only drops volume) or danger.
**Change:** a single `tempoTarget = base x gameSpeed/100 x (1 + 0.15 x level)` (level 0/1/2 -> x1.0 / 1.15 / 1.3, plus up to +0.1 for momentum), eased per bar `speed += (target-speed)*0.55` so it glides over about 2 bars. Town base 71 BPM, contract base ~100 BPM, boss up to ~140. Slow-mo (the game's slow-mo moment, if used) scales the tempo down with the same easing; pause eases to 0.6x and ducks, rather than stopping abruptly. Remove the random per-pass tempo drift from the lute tunes (it fights the sync with the bard).
**Effort:** M. **Owner:** delegate (wrap `schedule()` or expose `MUS.setTempoTarget`), commander to choose the numbers.

### AUD-05 Add a small reverb and a gentle mix chain (warmth, glue)
**Found:** every voice is dry into a compressor; `bus.g -> comp -> out`. Dry synths sound thin and "close", which exaggerates the pipe's harshness.
**Change:** one `ConvolverNode` (generated impulse: 1.7 s of low-passed decaying stereo noise, exponent 3.2) as a send; wet 0.16 on lute, 0.4 on pad, 0.3 on big drum, 0 on bass and hats. Add a gentle high shelf -2 dB at 6 kHz on the music bus. Make the compressor threshold -18, knee 12, ratio 3, release 0.3 so it glues rather than pumps. One reverb for the whole game (cost ~1 node).
**Effort:** S. **Owner:** delegate.

### AUD-06 Frame drum and hand-drum recipes (replace thump/tick for the town)
**Change:** `dum` = sine 130 -> 68 Hz in 0.14 s, gain 0.55 -> 0.0001 in 0.3 s, plus 50 ms low-passed (700 Hz) noise at 0.1 for the skin. `tek` (rim) = sine 320 -> 220 Hz, 70 ms, plus 45 ms band-pass noise at 1.8 kHz, Q 1.1. Town pattern (eighth = 0.42 s): dum on 0 (0.45) and 4 (0.25), tek on 2 and 6 (0.2). Contract: dum on 0,3,4,7 + tek on 2,6 + 16th shaker (band-pass 6 kHz, 60 ms, gain 0.07). Danger: big drum (sine 92 -> 48 Hz over 0.4 s, 0.6 s tail, + 420 Hz LP noise) on 0 and 4. Vary velocity +-10% per hit so it breathes.
**Effort:** S. **Owner:** delegate.

### AUD-07 Bard animation synced to the real tempo
**Found:** `bardFrame()` uses `MUS.beat()` (the table value) not the playing tempo (`pk` or the new tempo target), and swaps frames by `CAMP.t` frames; with AUD-04 this would drift further.
**Change:** expose `MUS.beatNow()` returning `{ph, id, tempo}` from the same event clock as `barNow()` (the bar-fight dance already does this correctly); `bardFrame` = strum frame at the start of each lute melody or bass note (`takeNotes` already supplies them) and the "down" frame on every drum `dum`. With the lute arrangement the strum is naturally on the melody note onsets.
**Effort:** S-M. **Owner:** commander (touches `INDEX 31` in `index.html`) or delegate if wrapped via `js/audio.js`.

### AUD-08 Single AudioContext for SFX and music
**Found:** `SFX` creates its own `AudioContext` (4366) and `MUS` another (14286). Two contexts mean two output threads, no shared limiter (loud SFX plus music can clip at the device), no way to duck music under SFX, and two separate suspend/resume paths (MUS suspends on a hidden tab, SFX does not).
**Change:** in `js/audio.js` create one context, route SFX to a `sfxBus`, music to `musicBus`, both into one soft limiter (compressor threshold -3, ratio 12, attack 1 ms). Point `SFX` and `MUS` at it by replacing their `ac`/`master` fields at unlock.
**Effort:** M. **Owner:** commander (touches both modules) or delegate with care.

### AUD-09 Duck the music under important SFX
**Change:** a `duck(depth, hold, release)` helper on `musicBus` (demo: `duckG.gain` to 0.4 in 40 ms, back with `setTargetAtTime(1, +0.12, 0.35)`). Trigger from `blast`, `boss`, `bossdie`, `horn`, `win`, `down`, `level` (depth 0.4-0.6); leave small SFX alone. Needs AUD-08.
**Effort:** S (after AUD-08). **Owner:** delegate.

### AUD-10 Fix the fatiguing SFX (coin, pick, horn, nope, level, win)
**Found:** `coin` is two square beeps at 1.3 and 1.8 kHz (17 uses), `pick` an 880 Hz triangle beep (40 uses), `nope` a 140 Hz square (34 uses), `horn` two sawtooths (29 uses). They are always identical and bright.
**Change:**
- `coin`: sine ping, base from [784, 988, 1175] Hz (pick at random), partials x1 (0.09, 280 ms) and x2.76 (0.03, 120 ms), a little room send.
- `pick`: triangle 420 Hz -> 335 Hz over 50 ms, LP 1800, gain 0.12, 70 ms, pitch +-6%, plus a 20 ms 2.2 kHz click.
- `horn`: three saws at 110/165/220 Hz, LP 300 -> 900 -> 500 Hz, 100 ms attack, 0.3 s hold, 0.45 s release; the demo has it.
- `nope`: sine 150 -> 110 Hz, 120 ms, LP 700.
- `hurt`: sine 150 -> 70 Hz thump plus LP 900 Hz noise 90 ms plus a 50 ms 2.5 kHz click, instead of the saw.
- Add `rate` pitch jitter +-4-6% (and +-1.5 dB gain) to anything that repeats: `hit`, `swing`, `coin`, `pick`, `block`, `shoot`, `bow`.
**Effort:** S. **Owner:** delegate.

### AUD-11 Missing feedback sounds
**Found:** 27 sounds exist but nothing for: building placed / construction tick / demolish, a contract starting (only the horn), enemy death (`hit` is called from one site only; likely absent in most hits), low-health warning, leader down / revive heartbeat, pause / unpause, momentum gained, the coin total at the debrief, a quiet UI hover, level-up fanfare vs normal pick.
**Proposed (all short synth recipes):** `build` (wood knock: 2 x LP 600 Hz noise 40 ms + sine 180 Hz 60 ms), `demolish` (noise 300 Hz 250 ms + sine 90 -> 50 Hz), `kill` (soft sine 600 -> 300 Hz 60 ms + noise 1 kHz 40 ms, round-robin), `lowhp` (heartbeat dum-dum 70 Hz when Leader <= 1/3 Con, only while true, max 1 per 1.2 s, ducks nothing), `pause` (LP sweep 4 kHz -> 600 Hz on the music bus, 150 ms, mirrored on resume), `momentum` (rising 3-note lute pluck, quiet).
**Effort:** M. **Owner:** delegate (needs commander to confirm the call sites).

### AUD-12 Mix levels and the settings sliders
**Found:** SFX peak gains 0.07-0.45 times master 0.5; music `out` = volume x music x 0.5 and bus trim 0.46-1.2 (iron/march lute tunes trim 1.2), so loudness varies by song; a blast at 0.45 is about 10 dB hotter than a hit at 0.18. There is one Music slider but no separate SFX slider; setting `volume` to 0 also silences music with no way to keep only effects.
**Change:** add "Effects" and "Music" sliders (keep the main as master), default music 45, effects 60. Normalise tune trims to equal loudness (target about -18 LUFS-ish; practically: pick one reference tune and scale others so peaks sit at the same bus level, a delegate can do it by ear plus an `AnalyserNode` RMS read). Cap loudest SFX (blast, bossdie) at 0.3.
**Effort:** M. **Owner:** commander (touches `settingsHTML`).

### AUD-13 Performance: node counts and cleanup
**Found:** a `pipe` note builds 3 oscillators (+2 with vibrato) + 2 noise sources + 2 filters + 3 gains, about 10 nodes; `lute` ~8; battle level 2 with taiko, hats on every 16th and lead+octave puts 30-60 nodes in flight per second. Nodes are stopped with `start/stop` so they are collected, but: (a) `SFX.noise` fills a 0.5 s buffer without `loop`, so `bossdie` (0.8 s) is clipped and silent at the end; (b) `fadeBus` disconnects after fade, but the three drone oscillators on a bus are only stopped for fades that go through `fadeBus` (a path where `M.bus` is replaced without a fade would leak them); (c) an `AudioContext` is created per tab for both `SFX` and `MUS` and never closed; (d) the 120 ms `setInterval` throttles in background tabs, and `schedule()` skips ahead (`M.nextT < now - 0.4`) so music can stutter after the tab returns.
**Change:** KS buffers (one `BufferSource` per lute note, cached per pitch; about 6 s of mono audio for the whole range = 1 MB), shared hat/noise buffers, no per-note vibrato LFO oscillators (use one shared LFO feeding `detune` of all currently sounding pipe notes), cap voices at 48 (drop the quietest `hat`/`tick` first), loop the SFX noise buffer. Consider a `visibilitychange` handler that re-aligns `nextT` rather than skipping.
**Effort:** M. **Owner:** delegate.

### AUD-14 Title screen, prologue, debrief, raid, bar fight: give each a context
**Found:** `MUS.wantTrack()` returns only `fight` (a live `G`) or `camp`. So the title, the prologue town, the debrief and the Rank'n minigame all get the camp bard music (or silence between verses), raids and bosses are the same tune with a higher level. The bar fight (Index 41) uses the fight track and `danceBeat`.
**Change:** (a) title = one sustained lute note per 4 bars plus pad, slow; (b) prologue town = the town arrangement, no gaps; (c) debrief = victory: the town melody on lute resolved, then silence, defeat: a single low lute note and fade; (d) raid = contract arrangement pitched to a minor-key variant (Dm) and layers fixed at level 1+; (e) boss = same tune, level 2 permanently, plus the horn sting once. Add `MUS.setContext(name)` so screens can request one.
**Effort:** M. **Owner:** commander picks contexts, delegate builds.

### AUD-15 Silence between verses and bard "off"
**Found:** camp plays one pass (16-32 bars) then rests 2-16 s (8-16 s if never chosen). A rest is good, but a gap of up to 16 s after a long 2-minute pass makes the camp feel dead and the camp ambience has nothing underneath.
**Change:** add a very quiet ambience bed (looping brown noise LP 300 Hz at 0.01 for wind, occasional fire crackle: a 20 ms band-pass noise at random 0.3-3 s) in the gaps; cap rests at 6 s; and mute it with the Music slider. Optional but cheap.
**Effort:** S. **Owner:** delegate.

### AUD-16 Accessibility and safety
**Change:** a "Reduce bright/high sounds" toggle (low-passes the SFX bus at 3 kHz), a mute-on-blur already exists for music (extend to SFX with AUD-08), and show a one-time "Click to enable sound" hint because the first click is currently silent for both contexts (`pointerdown` unlock only).
**Effort:** S. **Owner:** delegate.

## How to use the demo (`audits/audio-demo.html`)
Open http://localhost:8765/audits/audio-demo.html (or double-click the file). Press **Start audio** first, then:
1. **Timbre:** four buttons play the same two bars: the game's current pipe, the game's current pluck, my lute, and lute plus frame drum. Compare 1 against 3.
2. **Theme:** Play, then press **Town / camp** (lute, one thump, soft drum, 71 BPM), **Contract starts** (+ bass, lute arpeggio, hand-drum groove, shaker), **Danger** (+ pad, big drum, octave lute) and **Boss**. The layers and tempo ease in over about two bars. Toggle "Current pipe" to hear the same arrangement with the grating voice; toggle "Old (dry)" to hear the reverb difference. The **Tempo slider** (60-210%, shows BPM) is the Humanity-style speed-up; the four buttons beside it are slow-mo / normal / contract / rush.
3. **SFX:** left = current, right = proposed, "x8" / "Spam x8" plays it eight times in quick succession (the proposed ones vary slightly each time). Start the theme and press Blast (proposed) with "Duck the music" on to hear the music dip under it.

Notes for building: all numbers in the demo (gains, filter freqs, decay times, BPMs, layer sets) are the values to port. The melody is the game's own "Embers" section A (A minor, 8 bars, eighth = 0.42 s).

## Implemented (J-19) - `js/audio.js` (Index 87)
Built from AUD-01, 02, 05, 06, 07, 10, 15, 16. Not built: AUD-03/04 (J-20), AUD-08/09/12 (J-21), AUD-11/14 (J-22), AUD-13 partly (lute buffers are cached; the rest waits for J-21).

**Reaching the voices.** `V` (MUS voice table) and `SFX`'s context were private, so `index.html` got two one-line marked patches: `_V:V /* Index 87 */` in the `MUS` return object and `_g:() => ({ac, master, noiseBuf})` in the `SFX` return object. Both are harmless on their own. Everything else is in `js/audio.js`, which wraps/overrides by name.

| Item | Old | New | Roll back |
|---|---|---|---|
| AUD-01 town melody | `pipe`: sine + octave triangle, peak 0.36, vibrato, chiff | Karplus-Strong lute, peak 0.24, lowpass 3600->900 Hz over 0.7 s, +5 dB body at 230 Hz, 20 ms finger click 0.02; notes >= 1.5 s re-plucked at half; grace notes ("cut") become a 0.35x lute pluck. Applies to Jig, Embers, Dust and Iron, March. The Full Tankard keeps its fiddle. Floating bard notes unaffected (they read the event list). | delete the `V.pipe`, `V.cut`, `V.lute` assignments |
| AUD-02 pipe elsewhere (battle level 0 whistle, +12 doubling, Tankard doubling) | peak 0.36, lowpass 3400, attack 35 ms, release 90 ms, 2nd harmonic 0.13, vibrato 7 cents, chiff 0.05 | peak 0.24, lowpass 2100, attack 70 ms, release 150 ms, harmonic 0.06, vibrato 4 cents after 0.25 s, chiff 0.02 | delete `mellowPipe` and its use in `V.pipe` (falls back to `pipe0`) |
| AUD-05 music bus | compressor -16 dB / ratio 4 / release 0.25, dry | compressor -18 dB / knee 12 / ratio 3 / release 0.3, high shelf -2 dB at 6 kHz, room reverb 1.6 s wet 0.14, all tracks | delete `installMix` (and its call in the poll) |
| AUD-06 town drums | `thump` sine 118->52 Hz, `tick` noise 2.3 kHz | camp only: `dum` sine 130->68 Hz, 0.3 s, gain 0.42; `tek` sine 320->220 Hz + 1.8 kHz noise; velocity +-10 %, pitch +-3 %. Contract drums are the old ones (`M.track` test). | delete `V.thump`/`V.tick` overrides |
| AUD-07 bard strum | frames from `CAMP.t` (screen frames) | frame flips every `MUS.beat()` seconds counted from the logged start of the current audio bar (same idea as `barNow`); falls back to the old function if no bar is logged | delete the `barLog` block and the `window.bardFrame` assignment |
| AUD-10 SFX | coin: 2 squares 1.3/1.8 kHz; pick: 880 Hz triangle 0.15; horn: 2 saws 220/330 Hz 0.15/0.1; nope: 140 Hz square; level/win: triangle arpeggios 0.15-0.18 | coin: sine ping from 784/988/1175 +-3 % (0.08 + 0.025 partial); pick: triangle 420->336 Hz, lowpass 1800, 0.12, +-6 %; horn: 3 lowpassed saws 110/165/220 Hz, 100 ms attack, peaks 0.07-0.05; nope: sine 150->110 Hz, lowpass 700, 0.12; level/win: sine bells 0.10-0.11 + faint octave, +-1 % pitch | delete `SOFT.*` and the `SFX.play` wrapper |
| AUD-15 rests | 8-16 s of silence (when the bard has never chosen) | rest capped at 5.5 s plus the 2.4 s fade; wind bed (lowpass 280 Hz noise, gain 0.15 of the music bus) and a fire crackle every 0.4-3 s while resting; none when the bard is "off" (stays silent) | delete `capRest` and `ambience` |
| AUD-16 | no soft setting; SFX kept playing in a hidden tab; first click silent with no hint | Settings "Soft sounds" (effects lowpass 20 kHz -> 3 kHz, music shelf -2 -> -5 dB); SFX context suspends when the tab is hidden; "Click anywhere to turn the sound on" hint for 9 s or until the first input | delete the settingsHTML wrapper, `installSfxChain`, the visibilitychange listener, `showHint` |

**Tested** (browser pane, 1280x800, camp and contract, no console errors): all 5 camp songs play on the new voices and the bard frame toggles; a contract starts the fight track with the old battle arrangement (plus reverb and a mellower whistle); back to camp; rest cap and wind bed appear (gap about 7 s including fade) and are absent when the bard is "off"; Soft sounds on/off; prologue (`openStory`) opens without errors. Live audio source nodes stayed flat over 30 s (peaks 34-39, back to 8-24; 15 cached lute buffers, about 5 MB). **Not tested:** the four holdings individually (the music does not depend on them), the bar fight scene itself (same fight track, only the old drums/leads), and actual listening, since nobody here can hear it. Levels are deliberately lower than before: lute peak 0.24 vs pipe 0.36 at the melody.

**Demo.** Section 4 of `audits/audio-demo.html` ("J-19 as built") has "Old town", "J-19 town (as built)" and a rest-ambience button.

## Implemented (J-20) - `js/audio.js`, block "INDEX 87b" (AUD-03 + AUD-04)
**What changed.** Before: a contract faded the camp tune out and started the "combat" arrangement at bar 0 at its own fixed tempo (`switchTo`, `fightK`). Now, when a contract starts while the bard is playing, the same tune, bus and bar counter carry straight on; the old switch is not used.

| | Old | New |
|---|---|---|
| Transport | camp bus fades out, fight bus starts at bar 0 | one bus, one clock, `M.bar` keeps counting; layers chosen at each bar line |
| Level 0 (nobody near) | whistle + drone, heartbeat drum, separate tune | the camp arrangement unchanged (lute melody, arpeggio, soft frame drum) |
| Level 1 (contact) | kick/snare/hat/bass/lead synths | camp arrangement + combat bass + the combat drum part on soft hand drums (kick -> frame drum, snare -> rim, hat x0.45), camp's own thump/tick dropped, gains x0.6 |
| Level 2 (boss, 7+ near, Leader hurt) | full synth kit + lead + taiko | + real kick, snare, hats, taiko, bass and the synth lead (x0.75), gains x0.8; the lute melody keeps playing under the lead |
| Combat material | its own bar length (1.25-2.2x faster than camp) | same notes, stretched onto the camp bar (`camp.len / combat.len`), so one key, one tempo grid |
| Tempo | fixed `100/speed%` per fight, random per camp pass | each bar eases toward `target = camp tempo x m`, time constant 2.5 s, ramped inside the bar (no steps). `m = clamp(0.7, 1.35, (1.10 + 0.08 x level + min(0.08, 0.01 x Momentum rank)) x gameSpeed x (slow-mo 0.6) x (Momentum choice open 0.8) x (paused 0.85))`. Level 0 about 1.10, level 2 about 1.26, Slow (70 %) about 0.77-0.89. Camp is exactly 1.0 |
| Leaving a contract | fade, new camp tune at bar 0 | layers drop at the next bar line, tempo eases back (about 10 s), then the camp scheduler takes the transport back at the same point in the tune (`M.bar % camp.bars`) |
| Bar fight dance / bard | `barNow()` from fight bars | still `barNow()`: each unified bar is logged with its real (eased) length, so the dance follows the changing tempo; `M.track` is `fight` during a contract |

**Fallbacks (old behaviour, exactly):** bard resting between verses, set to Off, music muted, tab hidden at contract start, or a song without combat material. **Kill switch:** `window.AUDIO_CLASSIC = true` (set before load, or in the console and start a new contract) restores the old switching and timer. **Rollback:** delete the "INDEX 87b" block in `js/audio.js` (and the one-word `camp()` change in the J-19 helper is harmless).

**Tests** (muted: output routed through a zero-gain node, nothing reached the speakers): camp -> contract -> levels 0/1/2 -> slow-mo -> Game speed Slow -> back to camp: log shows bar numbers counting 10..46 without a gap, layers changing only on bar lines (L0 -> L1 at bar 23, L2 at 29), tempo k easing 1.06 -> 0.87 -> 1.38 (slow-mo) -> 0.92 -> back to 1.04 with no step larger than 0.2 in one bar (about 16 %), then handoff to the camp scheduler. Three camp<->contract trips: live audio sources camp 28-45, L2 35-117 (embers, the busiest), no growth; the log is capped at 300 entries. Kill switch, bard Off and bard resting fall back to the old track correctly. `barNow()` returns a rising phase and a stable bar id during a contract. Prologue opens; no console errors. **Not tested:** a raid or the bar fight scene by name (same `G`/fight track), the four holdings, listening.

**Demo.** Section 5 of `audits/audio-demo.html`: "Run the outing" plays camp -> contract -> contact -> boss -> calm -> camp (7 steps, about 25 bars) with the layers joining on bar lines and the BPM readout easing; or drag the Danger slider.

## Bugs fixed

### BUG-A1 "Music cuts out when a sound effect plays" (reported against J-19, commit 19dc610)
**Measured, muted** (an analyser on the music output, plus the music bus gain, both AudioContext states and the scheduler, sampled every 300-500 ms):
- Firing coin, hit, pick, horn, level, win, blast, hurt and the rest repeatedly (24-45 effects, 120-250 ms apart) in camp and in a contract changed **nothing** in the music: output level steady, bus gain 0.5/1.0, both contexts `running`, scheduler 0.6-1.9 s ahead, no exceptions in any voice, no stall in either audio clock (worst lag 0.01 s). So no SFX code touches the music bus, the mix chain, the hidden-tab logic, the soft filter or the ambience gain.
- **What does drop the music at an effect:** the end of a contract. `G.over = true` plays `win` / `down` / `level` at the same instant the music engine sees "camp wanted", and `switchTo` fades the fight bus (0.5 s), waits 1.0 s, then fades the camp tune in over 1.6 s. Measured output level (x1000): about 12-30 before, **2 at the trough, about 2.5 s later back to normal** - the music vanishes right as the fanfare sounds. The same happens at a contract start with the fight bus fade, and when a pause overlay (parlay, dice, momentum choice) ducks the music to 35 % while its 'pick'/'nope' sound plays (by design in `tick`, not changed).
- Not reproduced (and not ruled out): a dropout inside the browser/OS when two AudioContexts play together (music and SFX are separate contexts; J-21's shared context would remove that class of problem).

**Fix:** J-20 (Index 87b). The tune keeps playing through the end of a contract: no fade, no restart; the layers leave on the bar line and the tempo eases back. Measured the same way: output level steady (9-26) through `G.over` + `win`, no trough. **Still the old path** (and still dips) only where J-20 deliberately falls back: a contract that starts while the bard is resting, set to Off, or the music is muted, or `AUDIO_CLASSIC = true`. **Rollback:** the J-20 block (see "Implemented (J-20)"). **Needs committing to reach players:** the committed J-19 build (without 87b) still has the cut.
