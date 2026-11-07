# Story re-audit, round 2 (build 554b965 + notes commit)

Read-only. Played in the browser at 1280x800, muted (`.claude/audit.js`): the Quick Prologue from the intro through the ready-made Leader, muster, kit, arrival card, Day 1 orders, both assaults (simulated fights, Orsolt included), the retreat, the road and Night 1, the Kalloon ending, the founding and the Chronicle; then the new-player guide with the ready-made Leaders; then twelve contracts with debriefs (every objective, every result, two with deaths). No console errors. Saves backed up and restored (the browser's saves are shared test data).

## Summary
1. My round 1 and 2 lines mostly work where intended: the intro and arrival card, the Reeve's Day 1 and last-day lines, the assault lines, patron voices, contract results, death lines, Master and bark reactions, and the prologue entries in the Chronicle.
2. Four things I shipped do not fire or misfire: the Orsolt/Ilvaryn "has seen you" voices never fire in the prologue; the Quick ending shows the wrong tier text; the Chronicle's prologue entries get the wrong season and sit under an "earlier years were not kept" line; the Master's reaction to a death outlasts the next contracts.
3. The biggest story faults are old ones the new work exposes: every fight opens with "for a the Reeve. Enemy: Frost-Vault deserters.", the post-first-fight tutorial text repeats after the last assault and on the road ("Back in Varnholt... first fight"), and killing Orsolt costs -1 Mendorian Order standing that carries into the new Chapter.
4. Voice holds up. Repetition is starting to show: contract-result and death line pools are one to three lines each and repeat within a dozen contracts, and the Reeve's first request appears three times on Day 1.
5. The new-player flow reads well: the Bard's calmer intro, the three ready-made Leaders, the Cayde card ("Grand Master of the Grey Cloaks"), and the arrival card all land.

## Regressions and bugs

**STORY2-01. Fight opening note reads "for a the Reeve. Enemy: Frost-Vault deserters." (S, delegate)**
- Where: first line of every prologue fight (assault and road night), from `storyContract` (`patron:'the Reeve'`, `host:'deserters'`) and the note at `index.html:2032` (`for a ${contract.patron}. Enemy: ${HST.name}`).
- Repro: play any prologue fight, or read `G.msgs`. Night 1 says "The Long Road for a the Reeve. Enemy: Frost-Vault deserters."
- Fix: in `js/story.js` wrap `note()` for that exact pattern when the story is active: "The Siege of Varnholt, for the Reeve. Against the Hollow levy and the Frost-Vault host." and "The Long Road: guard the column from the host that follows." (The enemy label "deserters" is also wrong lore for the levy and Dark Elf host.)

**STORY2-02. The Orsolt and Ilvaryn spawn voices never fire in the prologue (S, delegate)**
- Where: `spawnGroup` (`index.html` ~7740) sets `e.seen = true` on spawn, so the game's "has seen you" note, which my voice lines hook, never appears. Only the "falls" lines work (checked: "The levy go still. For a moment nobody is driving them.").
- Repro: play Quick Day 3; Orsolt arrives from the west with no message.
- Fix: from `js/story.js` wrap `spawnEnemy` (or `spawnGroup`): when `k` is `orsolt` or `ilvaryn` and the story is active, `note()` the spawn line once. The same applies to lieutenants in later contracts only if they spawn pre-seen; those I did test via `wake`.

**STORY2-03. The Quick ending panel shows the wrong tier text (S, delegate)**
- Where: `endingHTML` Quick wrapper (`index.html` ~8800) swaps the heading and gold using Quick thresholds (15/11/7) but the body text comes from the Full thresholds (13/9/5).
- Repro: Column Strength 14 gives the heading "Kalloon: Survival" with "Kalloon offers the company three charters and a seat on the Free Cities' council" (that is the Triumph text). Strength 11 or 12 gives the same kind of mismatch the other way.
- Fix: in the wrapper, also replace the body sentence with the matching Quick-tier sentence.

**STORY2-04. Chronicle: prologue entries land in the wrong seasons, under a contradictory opening (S, delegate)**
- Where: my 85f code uses `T0 - 35` and `T0 - 34`, where `T0` is the Chronicle turn at founding. In a real run the Chronicle already exists (the prologue's fights call `chron()`), so `T0` is 1 or more and the entries read "Autumn" and "Winter, Year 616". The existing entry also still says "The Chapter had by now served 3 contracts, and the earlier years were not kept", counting the prologue's fights as contracts.
- Repro: finish the Quick prologue, found, open the Chronicle: Year 625 Summer "Founded"; Opened: "...served 3 contracts, and the earlier years were not kept"; Year 616 Winter and Autumn.
- Fix: use absolute turns (-35 for Summer 616, -34 for Autumn 616), set the existing `open` entry's `earlier` to false and drop its contract count when prologue entries are present, and reset the founding to turn 0 (Spring, Year 625).

**STORY2-05. Killing Orsolt gives -1 Standing with the Mendorian Order, and it carries into the main game (M, commander)**
- Where: `COMMANDER_FACTION` has `orsolt:'mendor'`; the prologue debrief shows "Standing with the Mendorian Order: 0 to -1". `META.standing` is `{mendor:-1, suderia:1}` after founding.
- Why it matters: nothing in the story explains it, and the first Chapter starts on a penalty for the very kill the Reeve's lines celebrate.
- Fix options: skip the standing change in the prologue, or give it a line ("The Order does not forgive a dead Reeve, even a Hollow one"), or reset Mendor standing when founding. Needs a lore decision.

**STORY2-06. The post-first-fight tutorial text repeats after later fights and on the road (S, delegate)**
- Where: the debrief of Assault 2 and of Road Night 1 both end with "Back in Varnholt. Three things to watch now the first fight is over: Supply... The hurt rest... Condition...". On the road it says "Back in Varnholt" (wrong place) and "the first fight" (wrong fight).
- Fix: show it once, only after the first siege assault (flag on `CP()`), and skip it on the road.

**STORY2-07. The Master's reaction to a death outlasts the next contracts (S, delegate)**
- Where: 85f `mood()` scans the last 8 Chronicle entries. In the twelve-contract run the Master said "We lost Maud. The ledger has the line..." two contracts after Maud died.
- Fix: look back only to the most recent contract entry (the reaction covers the last result and deaths since the contract before it), or expire a reaction after one contract.

**STORY2-08. Two of my Reeve lines never appear (S, delegate)**
- Where: in the Quick prologue Day 3 is also the last day, so the "I had planned a speech" line after Assault 1 is overwritten by the last-day line; the Quick "Load the carts" line after the last assault has no screen to show on.
- Fix: for Quick, say the speech line on Day 2's board and keep the last-day line for Day 3; show "Load the carts" on the retreat panel.

**STORY2-09. Orsolt's death is announced twice in a row (S, delegate)**
- Where: the debrief says "Orsolt the Hollow Reeve is dead. Every levy that comes after will lose its frenzy." and my line "Orsolt the Hollow Reeve is dead, and no one pretends to be sorry." two lines apart; the Quick A2 win line also repeats the retreat panel ("The host draws back to wait for its engines. Varnholt cannot take another.").
- Fix: drop the redundant "is dead" sentence from the added line (use a reaction instead: "The levy stand where they are. Somebody brings them bread.") and write the Quick A2 line differently from the retreat panel.

**STORY2-10. Contract briefs: place names double up (S, delegate)**
- Where: "the ruins of the Ruins of Mordheim", "travelling through the Teradosi..." (new place names from the world-depth pass make several brief templates read badly with their "the" and "ruins of").
- Fix: tag places with their own article and form in `PLACES`, or have the brief templates take a pre-formatted place phrase.

## Verification of my shipped items

| Item | Result | Notes |
|---|---|---|
| STORY-01 Reeve lines (Day 1, last day, starving, mill) | works | Day 1 and last day verified; Quick loses the post-A1 line (STORY2-08) |
| STORY-02 assault lines, STORY-14 levy explained | works | A1 line good; Orsolt line doubled (STORY2-09) |
| STORY-03 named enemy voices | partly | "falls" works; spawn voices do not fire in the prologue (STORY2-02) |
| STORY-06 carts join the column | works | Shown on Night 1 and the retreat panel |
| STORY-07 contract result lines | works | Pools too small (see STORY2-11) |
| STORY-08 building finished line | works | Not re-tested this round beyond the round-2 pass |
| STORY-10 Bard intro | works | |
| STORY-15 nemesis taunts | works | Master line for a living nemesis seen |
| STORY-16 barks and brief variants | works | |
| STORY-17 Grey Cloaks note | works | |
| J-16 Cayde's title | works | Chair screen shows "Grand Master of the Grey Cloaks" |
| J-17 Orsolt and Ilvaryn | partly | Prologue names fixed (Orsolt is now "Orsolt the Hollow Reeve" each time); lieutenants named; spawn voice gap (STORY2-02) |
| J-18 cold open v1 | works | Intro line, muster line, arrival card and Day 1 coach all show |
| J-02 Reeve's Hall Day 1 + bell + toast | works | Seen in round 2; the bell and header coexist with the new top bar |
| J-10 reactions | partly | Master and barks react; staleness (STORY2-07) |
| J-10 patron voices | works | All ten patrons |
| J-10 dead line | works | Debrief and graveyard |
| J-10 prologue in Chronicle | partly | Wrong seasons and a contradicting opening (STORY2-04) |
| J-10 milestone lines | works | Verified by forcing milestone 3 |

## New proposals

**STORY2-11. Grow the small pools (S, delegate).** Contract results have one to three lines per objective and result, deaths three, the fallen-squad line two. In twelve contracts the "last in the day's ledger" line came up twice and "The squad was overrun. The Scribe has begun a new page." twice. Aim for 4 to 5 per slot, and let results with commanders slain or gold earned add a second clause.

**STORY2-12. Say "the Reeve asked for X" once, not three times (S, delegate).** On Day 1 the player reads the same first request in the arrival card, the Reeve's board line and the Sergeant's advice, and the Sergeant's other bullets repeat Rally and Scout again. Keep the arrival card; make the board line the Reeve's thanks or a different instruction; trim the Sergeant to one pointer.

**STORY2-13. Make the Quick muster honour "two companions, two hires" (M, delegate/commander).** The text now says two came with you and two are hires from the mill, but the player still picks any four of six. Option: roll two companions automatically, offer six hires for two picks.

**STORY2-14. The Kalloon ending needs its numbers and names (M, delegate).** Say how many elves lived, who of the squad died on the road, and name the Reeve's fate (STORY-13 follow-up). The panel is still two generic paragraphs after twelve nights of play.

**STORY2-15. Give the Quick prologue its missing refugee beat (S, delegate).** The Tarim elves are mentioned in the retreat text and never seen; Night 1's "On the Road" scroll could carry one line about them ("A High Elf girl asks if the stars are the same in Kalloon.") per night.

**STORY2-16. Bard voice in the prologue creation screen (S, delegate).** The Bard hosts the prologue's Leader screens as "Void Three-Chords, the Chapter's bard" with no Chapter yet. Fine, but his line there ("A name for the songs. Then the road.") is better than the guided start lines; use that register for the "chair" and "holding" lines too, which still sound like a help screen.

**STORY2-17. A fallen Leader needs a line in the Chronicle's text (S, delegate).** The `death` entry reads "X, Human, Squad Leader: fell"; add the Scribe's closing line from the debrief so the two agree.

**STORY2-18. A second look at the Hollow levy (S, delegate).** The A1 line ("Those are somebody's farmers") is the best idea in the prologue; echo it once more on Night 1 when the chain-gangs appear, since they are the same people driven by a different master.

Priorities: STORY2-01, 02, 03, 04, 06 first (small and visible), then 07, 09, 11, 12; STORY2-05 needs a lore decision.

---

## Fixed (Index 85g, `js/story.js`)

Each fix play-tested muted: Quick Prologue through both assaults, the retreat, a road night, the four ending tiers, the founding and Chronicle, and contract briefs. No console errors; saves restored.

| ID | Fix | Result |
|---|---|---|
| STORY2-01 | Fight-opening note rewritten for the story: "The Siege of Varnholt, for the Reeve. The levy come first, and the host behind them." / "The Long Road: keep the column alive until morning." | seen at the start of both assaults |
| STORY2-02 | Orsolt and Ilvaryn speak when they spawn in the prologue (the story spawns them already "seen") | "Orsolt walks to the front of his own levy and does not look back at them." appears in Assault 2 |
| STORY2-03 | Quick ending body now matches its tier | checked Column 16 / 12 / 8 / 2: Triumph, Survival, A Remnant, Ruin each with its own sentence |
| STORY2-04 | Chronicle: prologue entries at absolute Summer and Autumn 616; the prologue's other entries dropped (deaths kept); the "earlier years were not kept" line replaced by a plain opening; founding at Spring 625 | verified after founding |
| STORY2-06 | The "Back in Varnholt... first fight" tutorial shows once (first siege fight or sortie), never on later fights or the road | shown after Assault 1 only |
| STORY2-07 | The Master's reactions look back only to the contract before the latest | a death was mentioned in 3 of 30 draws right after it and 0 of 30 two contracts later |
| STORY2-08 | Quick: Day 3 shows both the "I had planned a speech" and the last-day Reeve lines; the retreat panel carries "Load the carts..." | seen |
| STORY2-09 | Orsolt's death line no longer repeats "is dead" (it now reads "...someone brings them bread."); the Full A2 and Quick A2 win lines no longer repeat other text | seen |
| STORY2-10 | Briefs no longer say "the ruins of the Ruins of ..." | "in the Ruins of Mordheim" |
| UX R2-02 | My `campNote` wrapper passed only the message; it now passes every argument | "✓  Test note" with the green edge |

Not touched: STORY2-05 (Mendorian Order standing, with the bug finder), and the new proposals STORY2-11 to 18.
