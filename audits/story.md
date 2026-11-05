# Story audit: Dust Cloaks (story designer)

Read-only audit. Line numbers refer to `index.html` as of this session. Tabletop source: the Players Manual (2026-10) opened fine (Chapters 8, 13, 14 and the setting notes); the GDD v1.4 (2025-03) opened but contains none of the setting names (no Varnholt, Kalloon, Orsolt, Reeve), so the Manual is the lore authority. I did not play-test; I read the code and text. Not reviewed in depth: Ambition milestone wording, the 16-race bark pools beyond a skim, and every Index 49 rival string.

## Summary
1. The voice is good where it is deliberate (the intro, the Scribe's Epilogue, "They are exactly what they look like"). It breaks in the Bard's chirpy guide intro and in dozens of purely numeric screens.
2. The prologue's story is a good skeleton (siege, fall, road, charter) but is told almost only on the title and ending panels. Between them (Days 1 to 14, twelve nights) the player sees mechanics, not people. The Reeve, Orsolt and Ilvaryn barely speak.
3. Biggest cheap wins: one line per assault, one line per contract result, one line per finished building, and state-aware barks. All are text in existing hooks.
4. Lore conflicts worth a decision: Cayde's title "Reynard, Grand Master of the Dust Cloaks" contradicts the Manual (Grand Master of the Grey Cloaks; Reynard is a secret), and Orsolt/Ilvaryn are reused as generic bosses after the prologue kills them.
5. The Gemini cold-open idea fits well if it is built as "companions arrive with you, hires wait at the mill". Smallest version below; the game already has the pieces (three archetypes, the Sortie fight, the Sergeant, tips).

---

## Onboarding cold open (verdict on `audits/leads/story.md`)

**Name check first.** Gemini's "Reeve Hallinan" is wrong. In the game the Reeve is **Reeve Aldous Harl** (`index.html:7415`, also set as the prologue's Chapter Master). The Manual never names him. "Hallinan" is **Cayde Hallinan**, a different person (the hero Chapter Master, Grand Master of the Grey Cloaks). Anyone writing new lines should use "the Reeve" or "Aldous Harl".

**Does a cold open fit?** Yes, with two adjustments to the existing text.
- The intro (`7426-7428`) says the company was "camped by the mill when the smoke rose in the north". The mill is inside the palisade (`DISTRICTS.mill`, `7310`), so an ambush on the road outside the gates needs the company to be *coming back* rather than camped. A one-line change: they were out on the north road when the smoke rose.
- The Manual's setup (13.3) gives each squad "two companions and two hires". That maps neatly onto a cold open: the **two companions** are the people who were on the road with the Leader (they fight the ambush); the **two hires** are who the Leader picks up at the mill after the Reeve opens his purse (the existing muster screen, `7434`, but picking two instead of four). This turns an onboarding fix into a story beat that matches the tabletop.
- The ambush enemy already exists: the Sortie ("a band of enemy foragers outside the walls", `launchSortie` at `7702`). Day 3's first wave comes down the same north road, so a small forager party on Day 0 is consistent ("the vanguard arrives early").

**Draft framing (game voice, plain and dry).**

Cold open card, before the fight:
> *Year 616. You were two days out on the north road when the smoke went up. You are an hour from Varnholt's gate, and so are they.*
>
> *There are only three of you who can fight, and a cart. The road is the road. Move.*

Sergeant's tip during the fight (reuse the `TIPS` system, `4477`): "WASD moves. Your people fight on their own. Keep them near you."

After the fight (victory):
> *The palisade is close enough to hear the gate-bar drop. A man in a good coat is standing on the step with a lantern, counting you.*
> *"The Reeve will see you now," says the man in the good coat. "He says he has a purse, a mill, and no soldiers. He says you are a beginning."*

After the fight (if the squad was beaten, so it cannot end the campaign):
> *The Reeve's riders find you in the ditch. Nobody says whose fault it was. The gate shuts behind you.*

The Reeve's first request (shown on arrival at Varnholt, Day 1):
> **Reeve Aldous Harl:** "I'll be plain. The garrison is in Kalloon and my wall is wood. I need three things from you before dusk: someone to look up the north road and tell me what is coming, someone to put a spear in the hands of the people who will stand behind you, and a plan for my gate. In that order, if you please."

This points to the three most important Work Orders: **Scout, Rally the Town, Fortify** (`workOrder`, `7525`). The panel can highlight them on Day 1.

**What can reuse existing text and events.**
- Beat 1 (ambush): the Sortie fight and map, `STARTERS` (three ready-made leaders: Shield, Bow, Medic, `17270`, which are exactly Gemini's three archetypes), `TIPS`, `coachLines`.
- Beat 2 (Reeve): Day 1 panel, Work Orders, the `C.cellar` line at `8033` (the Reeve is already a character with a pettiness joke).
- Beat 5 (camp, market): the existing Charter Kit / Market panel (`8314`), moved to after the ambush.
- Beats 3 and 4 (Luck, Wounds): the Luck prompt exists (Index 32, dice tray offers Spend or Burn on a Leader's failed roll), but its listed coverage is retreat, parley, War Council and prisoners. **Verify whether Work Order rolls (`cpRoll`, `7467`) go through it.** If not, "first failed roll teaches Luck" needs a small code change (commander). Wounds already teach themselves through the injury checks in the debrief.

**What needs new writing.** The two cold-open cards, a Reeve greeting per day, and the "two hires at the mill" intro line. About 15 short lines in total.

**Risks (what the restructure could break).**
1. **The Leader must not be able to die or be removed in the ambush.** A Leader death sets `META.leader = null` (`5541`) and strands a campaign that has not started. The ambush needs a no-death flag (or the story must rescue them), and no XP tick (`G.noTick` already exists).
2. **State flow.** `CP().part` runs `create, kit, siege, retreat, road...` (`8339`) and `storyAfterFight` (`8091`) only knows assault and night fights. A new `ambush` part and a `lastFight === 'ambush'` branch that returns to the muster screen are needed. Save slot, `syncStoryFacilities` and `marketOpen` (`7466`, which treats `kit` as open) must still agree.
3. **Squad build order.** `storySquad` (`7696`) takes mates from `META.roster`. The two companions must exist before the fight; today the mates are chosen after the Leader (`7444`). Companions can be auto-rolled (`rollRecruit`), hires chosen after.
4. **Gear.** Gear bought "now ignores facility requirements" (`8314`). If the market opens after the ambush, the ambush squad fights in whatever the Standard Charter Kit auto-equips; that default has to be sensible.
5. **Quick versus Full Chronicle.** The Quick card (`11285`) is the tutorial; the cold open should go on both, or only Quick. Recommend both, with a "skip the road" link for veterans.
6. **Custom build.** Keep today's build screen as an "advanced: build your own Leader" link so veterans lose nothing.
7. Day 1 `dayNews` and the coach text assume the squad has just come out of the kit screen.

**Smallest version worth doing first (text-only, no new fight).** Without touching the flow: add the Reeve's arrival panel as the first screen of Day 1 (`openStory`'s `startSiege` calls `nextDay` then renders the day panel) with the speech above, a one-line "You were two days out on the north road" change in the intro, and highlight Scout, Rally and Fortify on Day 1. That is a few text lines and a coach tweak, and it gives the player a first request and a character at the start of the game. **Version two:** add the three-archetype quick start for the prologue (`STARTERS` already exists) and auto-pick the four mates, leaving the build-your-own path as a link. **Version three:** the actual ambush, using the Sortie fight with the no-death flag. I would not start with version three: it is the only one that touches state flow, and the first two already remove most of the "all systems at once" problem.

Effort: version one S, version two M, version three L. Owner: version one *delegate*; versions two and three *commander*.

---

## Prioritised findings

### STORY-01. The Reeve is a quote, not a character (S/M, delegate)
- **Found:** Aldous Harl appears only as the intro quote (`7424`, from the Manual), as the Chapter Master name (`7415`) and in one joke (`8033`, the cellar). Days 1 to 14 have no voice at all; `storyDayHTML` (`8248`) opens with "The town eats: -2 Supply."
- **Why it matters:** the stakes of the siege are the town, and the town has no face. The cellar line shows exactly the right tone, but it happens once.
- **Change:** a `REEVE_DAYS` table (one dry line per day shown above the Work Orders), plus short reactions to events in `dayNews`. Samples:
  - Day 1: "I have a purse, a mill, and no soldiers. You will do."
  - After Assault 1 holds: "I had planned a speech. I have lost the speech. Thank you."
  - After the Mill is lost: "That was my grain. I will mention it."
  - Day 14, before the last wall: "If this fails, Varnholt was a silver town for eleven generations. Write that down somewhere."
  - Starving: "The cellar is empty. So is my patience, and I had a lot."

### STORY-02. Each assault ends with a status line, not a story beat (S, delegate)
- **Found:** `8038` gives "Assault N is over: the town holds." The assaults (`ASSAULTS`, `7327`) have an `intel` card but no `after` text.
- **Change:** add `after:{win, loss}` strings to each `ASSAULTS` entry and print one of them. Samples:
  - A1 win: "They came in a line and went away in pieces. The gate has a new scar and the Mill still turns."
  - A2 (Orsolt slain): "Orsolt the Hollow Reeve is dead. The levy that were driving at the gate stop where they are and stand. Somebody gives them bread."
  - A2 (Orsolt fled): "Orsolt is gone down the mill road. He will be back, and he knows now where the wall is thin."
  - A3 (ram): "The ram burned. The Overseer is still deciding whether to be brave."
  - A6 win: "The orc horns on the ridge are the best sound anyone has heard all year. Varnholt still has a keep."
- **Why:** it makes each fight feel as if it happened, and it is free text in a table.

### STORY-03. Named enemies have no voice (S, delegate)
- **Found:** Orsolt (`418`) and Strategos Ilvaryn (`425`) get an intel-card line and `note('X has seen you.')` (`2388`), nothing more. In `7350` Duruk's orc riders arrive at "Round 3" as a mechanic line.
- **Change:** one line when each named commander spawns and when they fall, via the existing `note()` calls. Samples:
  - Orsolt spawns: "Orsolt the Hollow Reeve walks to the front of his own levy and does not look back at them."
  - Ilvaryn spawns: "Strategos Ilvaryn has brought a banner and a proper line. He is the first one tonight who looks like he is enjoying it."
  - Duruk arrives: "Horns, from behind the host. Khan Duruk has kept his promise."
  - Ilvaryn falls: "The Strategos goes down. His line does not break; it simply stops, as if someone had put down the pen."

### STORY-04. Orsolt and Ilvaryn are reused as ordinary bosses after the prologue (M, commander)
- **Found:** `BOSS_POOL` (`440`) and `HOSTS.hollow.bosses` (`3014`) include `orsolt` for Hollow-dead contracts, `ilvaryn` for deserters tier 3. The prologue kills Orsolt; the epilogue finales reuse `ilvaryn` as "Captain-General of the Grey Keep" (`9404`). A player who killed Orsolt in Varnholt can meet "Orsolt the Hollow Reeve" again in a random contract.
- **Why:** it spoils the Varnholt kill, and the Chronicle will say "Orsolt is struck down" twice.
- **Change (choose):** (a) rename generics: the Hollow host's boss becomes "A Hollow Reeve" with a rolled name ("Aldric the Hollow Reeve") while the prologue's `orsolt` key stays unique; or (b) have the Scribe say it ("Another Reeve. Same tithe, different coat."). Option (a) is cleaner but touches the BESTIARY/nemesis name lookup (`ename`, `3108`; `recordNemesis`, `3811`), hence *commander*.

### STORY-05. Lore conflict: "Reynard" (M, commander + user decision)
- **Found:** `HEROES.cayde.title` = "Reynard, Grand Master of the Dust Cloaks" (`13583`). The Manual (Table 8.3, `Cayde Hallinan, Grand Master of the Grey Cloaks & Marshal of the Marches`) keeps Reynard as a different, **secret** figure ("Part Two tells the world as its people believe it... Reynard: Cayde created the alter-ego"). The game both gives away the secret on the Chapter Master card and puts him at the head of the wrong company. FACTIONS also has "Reynard's Skulk" as a patron the player can fight for and against, and `RIVAL_DEFS.knives` says "Cayde's word keeps them in check" (`rivalHeroHolds`).
- **Why:** the user wrote this setting; the Manual says the Reynard identity is a reward for the table that earns it. The game is a video game with no GM to hold it back.
- **Change:** drop "Reynard" from the card title ("Grand Master of the Grey Cloaks") and keep Skulk text as is, or decide on purpose to reveal it (e.g. after Standing +2 with the Skulk, the Scribe notes it). Needs the user's call.

### STORY-06. Where do Varnholt's people go? (S, delegate)
- **Found:** the retreat text (`8057`) says the company gets "the townsfolk out through the sally gate and onto the carts" and the road column is the Tarim elves (`14.1`). `startRoad` (`8066`) sets `aux:[]`, and the intro tells the player "twelve nights... with the refugees" without ever saying the Varnholt carts join them. The 300 townsfolk simply vanish.
- **Change:** one line in `retreatHTML` and in the first road-day text: "Varnholt's carts reach the forest road at midnight and fall in behind the elves. Nobody says much. Everyone counts the same number twice." And the Manual's +1 Standing with the Grey Cloaks (13.7) is not given in `startRoad`; the faction does not exist in `FACTIONS`. Mention only if Grey Cloaks becomes a faction.

### STORY-07. Contract results are silent (S/M, delegate)
- **Found:** `contractDebrief` (`3378`) writes a line only for rescue victories. Every other result is figures: pay, kills, standing. The Chronicle's contract entry is a formula ("Victory: 31 slain, 2 commanders", `14514`).
- **Change:** add one Scribe-voice line per objective and result (success, withdrawn, fled, overrun) in `contractDebrief`, and have the Chronicle append one random clause. Samples:
  - Hold the Redoubt, win: "The relief column arrived and found a fort. The patron's thanks arrived a week later."
  - Extraction, win: "Three strongboxes, one road, and nobody left to ask where the coin came from."
  - Escort, win: "The wagon arrived dented. The patron said it was fine. The patron has not looked at the wagon."
  - Headhunter, win: "Every commander is accounted for. Nobody thought to ask the dead for a receipt."
  - Fled: "The Scribe has written 'withdrew in good order'. He has written it in pencil."
  - Overrun: "Nobody was happy with the result, including the Scribe, who wrote it down anyway."

### STORY-08. A finished building has no moment (S, delegate)
- **Found:** the Works debrief (`24939`) writes "<b>X</b> is finished" and nothing else. `campNote` (`24968`) covers moves and demolitions only.
- **Change:** a generic pool plus a handful of per-building lines, appended to the Works line and shown once as a `campNote`. Samples:
  - generic: "The builders have gone. The Scribe has counted the nails."
  - Blacksmith: "The forge is lit. Everyone suddenly has something that needs mending."
  - Chapel / Wayshrine: "A small roof and a small bell. The camp is quieter than it was."
  - Tavern: "The first barrel is tapped. The Bard has already moved his log."
  - Palisade: "The gate has a bar now. The first thing the squad does is lean on it."
  - Graveyard fence: "It is only a fence. Nobody walks across it."

### STORY-09. Camp barks and the Chapter Master line never react to what happened (M, delegate)
- **Found:** `masterLine` (`6271`) rotates five lines by time, plus three early-game states (no Leader, no roster, no ambition). `BARK_RACE` / `BARK_CLS` / `BARK_REGION` (`18087-18121`) give each person 2 lines per race and class, picked at random, with `BARK_VET` a single line. Nobody reacts to a death, a nemesis, a building, the season or the prologue.
- **Why:** this is where the Chapter's identity should build. After 20 contracts the camp talks like it did on day one.
- **Change:** a small state layer ahead of the random pick:
  - After a death in the last contract: the Master says "We lost [name]. The ledger has the line. The stone will have the name." Mates: "Is somebody going to say something? No? I will."
  - A nemesis alive: "[Name] is still out there. I am not sleeping well."
  - After the prologue (`p.militia`, `makeMilitiaman` `7579`): "Used to farm barley. Now I farm bandits."
  - Treasury under 50gp: "Our coffers hold [N]gp. That is not a figure, that is an apology."
  - Winter: "Wet wood, cold boots, no one talks about the war. Good."
  - Finale due (`finaleDue`): "The charter is almost done. Nobody is brave enough to say so."
  Roughly 20 lines, used first when their condition holds.

### STORY-10. The Bard's guide intro breaks the voice (S, delegate)
- **Found:** `guideLines.intro` (`17278`): "Hello there! I'm X. Every company needs someone to sing about it, so I've volunteered..." Exclamation mark, bright greeting, "I've volunteered". The Scribe and the Master are dry; the guide is the first thing a new player reads in the main game.
- **Change:** keep it friendly but plain: "I'm X. Every company needs someone to sing about it, and I was the only one who put my hand up. Five short jobs, in any order you can manage." Also recheck `hero` (`17284`, long and instructional) and `banner` ("Raise it and the road is open") which is fine.

### STORY-11. Contract briefs are templated, with no patron voice (M, delegate)
- **Found:** `CONTRACTS.*.desc` (`3041`) is one sentence per objective with place/host substituted. Patrons (`PATRONS`, `446`) are labels. Over 20 contracts the player reads the same ten sentences.
- **Change:** 2 or 3 phrasings per objective, plus a patron line prefixed to the brief. Samples:
  - Minor Imperial Noble: "The Marshal's office wants this done quietly and on paper."
  - Suderian Freeman Merchant: "Their purse is open, their questions are closed."
  - Mendorian Order Prelate: "The Prelate has prayed on it. You are the answer."
  - Dwarven Syndicate Factor: "Payment on delivery, by weight."
  - Reprobate Collective: "Don't ask what's in the crate."
  - Shadowy Broker: "A note, a coin, no signature."
  Also tie `PLACES` (`3032`, invented names) to the Manual's six regions that `BARK_REGION` already uses, so briefs and barks agree.

### STORY-12. The dead get a list entry, not a moment (S/M, delegate)
- **Found:** a fallen Squad Mate is "<name> died in the field." (`5484`). The Epilogue is strong ("None of them is a footnote", `15081`) but the moment itself carries no weight, and the Leader-death line is a rules sentence (`5541`, "A Leader killed in the field leaves no Legacy").
- **Change:** one Scribe line per death in the debrief and the graveyard entry: "[Name] is cut into the stone. The Scribe has spelled it correctly." For the veterans (adv >= 3 or level >= 3): "[Name] was with the Chapter since [year]. The stone has room." The Epilogue ends well; make the debrief earn it.

### STORY-13. The prologue ending and the Chronicle's first entry do not connect (M, commander)
- **Found:** the ending (`8100-8106`) is one sentence per tier (Triumph, Survival, Remnant, Ruin) plus the line "The cloaks are the colour of the road now" (the best line in the section). `finishFound` writes the survivors into the main game, but the Chronicle opens with "the earlier years were not kept" (`14507`) and starts in Spring, Year 625. Varnholt, the road and the dead of the prologue are not recorded anywhere the Scribe will ever read.
- **Change:** when founding from the story, seed the Chronicle with 2 or 3 "earlier years" entries from `META.cp` outcome data: "Year 616: the company held Varnholt for [N] days. [Orsolt fell / escaped]." "Autumn 616: walked [N] elves to Kalloon over twelve nights. Column Strength at the ford: [N]." "The cloaks went the colour of the road." Seed the first graves with the prologue's casualties. Also make the Kalloon text specific: the number of elves saved, and the name of anyone who died on the road.

### STORY-14. The enemy is never explained to the player (S, delegate)
- **Found:** the player hears "Frost-Vault legions" and "Hollow Levy Mobs". The Manual (13.1 and a sidebar on `3535`) says the levies are conquered, starved farmers and that "a table that finds a way to free them has played the setting well". That moral edge is gone: the intel card says "exactly what they look like" (good), but nothing says what they look like.
- **Change:** in the Assault 1 `after` text: "Hollow Levy: field-hands with a tithe-mark on the wrist. The Overseers are at the back. The Reeve says it quietly: 'Those are somebody's farmers.'" And the Orsolt-slain line in STORY-02. That makes Orsolt's death a relief, not a stat.

### STORY-15. Nemesis moments are one-line notes (S, delegate)
- **Found:** `note('X remembers the Chapter. Your nemesis is here.')` (`2781`) and the debrief "got away, and will remember the Chapter". Taunts are not host-specific.
- **Change:** 3 lines per host (`HOSTS`, `3014`). Samples: bandits "You owe me a camp." Hollow "The tithe is never paid in full." Deserters "I drew my last pay from your patron." Nemesis slain: "The Scribe closes a page he was fond of."

### STORY-16. Repetition: barks and briefs share the same few jokes (S, delegate)
- **Found:** `BARK_REGION` has one line per region; `BARK_VET` has one line; `BARK_RACE` / `BARK_CLS` two each; the Bard has six lines (`14604`); `masterLine` has five. The jokes are good ("Same as any war. Mud, waiting, then a lot of shouting.") but the pool is small, and several lines refer to lore (Jinx, Cracked Keg, Grey Keep, Artemis) that a new player cannot place.
- **Change:** double the pools to 4 per race and class, and add the missing lore anchors (Cayde, Zenif, Kalloon, Varnholt) once the player has met them. Keep lore references light and untitled ("the woman at the Cracked Keg") so they read as camp talk, not exposition.

### STORY-17. Rules/story consistency to check (S, delegate)
- Manual 13.5: "each player squad takes 2 Work Orders" per day; the game gives 3 (`ordersPerDay`, `7470`). Probably a deliberate balance change; if so, a one-line note in the intro or Manual text avoids a mismatch.
- Manual 13.1 calls the town "seven districts" (the gate counts as one); the game has six districts plus eight wall structures. Fine in game, but the intro text should not repeat "seven".
- Manual 13.7 gives +1 Standing with the Grey Cloaks as well; `startRoad` gives only Suderia.
- The Ending's four tiers (`8100`) use Column Strength cut-offs (13, 9, 5) that differ from Manual 14.8 only if the Manual changed; check the Print Pack PDF (not opened, PDF skipped).

### STORY-18. Epilogue and Legacy are excellent; carry their tone back into the middle (M, commander)
- **Found:** the Epilogue pools (`15073-15090`) are the best writing in the game: "has checked the sums twice and does not round up", "Mind the ink." Milestones at 3, 6, 9 have a perk but no Scribe line.
- **Change:** one short Scribe entry in the Chronicle at each milestone (3, 6, 9) and when the finale appears on the table ("The Scribe notes that the next page is the last one, and has bought more ink."). Reuses `chronAdd`; cheap and builds the arc over a 20-hour campaign.

---

## What to leave alone
- The intro (`7421-7431`) and the Manual quote at the top of it.
- The Scribe's Epilogue voice. Use it as the style reference for everything above.
- The Orsolt flee/return mechanic. It is a good story engine; it only needs words.

## Suggested order
1. Onboarding version one (Reeve's Day 1 panel) + STORY-01, 02, 03, 14: text in the prologue panels.
2. STORY-07, 08, 12: one-line results, buildings, deaths (all small hooks).
3. STORY-09, 10, 15, 16: barks, Bard intro, nemesis lines.
4. STORY-05 and STORY-04: need the user's call on Reynard and on how generic bosses are named.
5. STORY-13 and the larger onboarding versions: touch the Chronicle and the prologue state flow.

---

## Implemented (Index 85, `js/story.js`)

Tested in the browser at localhost:8765 (saves backed up and restored): prologue Day 1/2/road days, retreat panel, assault debriefs, all ten contract results, a real `startDeployment`/`endDeployment('victory')`, a construction finishing, in-fight `note()` voices. No errors logged. Not tested end to end: a full played assault with Orsolt actually spawning (the spawn/fall/Duruk lines are triggered by exact `note()` texts; Duruk's was confirmed, Orsolt/Ilvaryn "has seen you" confirmed by pattern only).

| Item | What it does | Where it shows |
|---|---|---|
| STORY-01 | Reeve line on Day 1 ("I have a purse, a mill and no soldiers... In that order, if you please."), on the last day ("If this fails, Varnholt was a silver town for eleven generations."), on starvation, once on losing the Mill ("That was my grain. I will mention it."), and after Assault 1 and the Quick finale | Day panel news (`dayNews`) |
| STORY-02 | A win/loss line per assault, Full and Quick ("They came in a line and went away in pieces...", "Horns from the ridge are the best sound anyone has heard all year.") plus Orsolt slain/fled lines | Field Report after an assault |
| STORY-14 | Assault 1 line explains the levy ("field-hands with a tithe-mark on the wrist... “Those are somebody’s farmers.”") | Same debrief |
| STORY-03 | Orsolt and Ilvaryn when they see you and when they fall, and a Duruk line when his riders hit ("Horns, from behind the host. Khan Duruk has kept his promise.") | In-fight message feed |
| STORY-06 | Varnholt's carts join the elves' column; a Grey Cloaks ledger note on a held Keep (text only, no Standing, STORY-17) | Retreat panel; road Night 1 news |
| STORY-07 | One dry line per objective and result (victory, withdrawn, fled, fallen) | Field Report after a contract |
| STORY-08 | Per-building and generic finished lines ("The forge is lit. Everyone suddenly has something that needs mending."), appended to the camp note, and under the Scribe's Works line in the debrief (shown once, not duplicated) | Camp note; debrief |
| STORY-10 | Bard intro: "I'm X. Every company needs someone to sing about it, and I was the only one who put a hand up. Five short jobs..." | Guided start; small patch in `index.html` marked `Index 85` |
| STORY-15 | Nemesis arrival taunt by host ("You owe me a camp.", "The tithe is never paid in full.") and slain line ("The Scribe closes a page he was fond of.") | In-fight message feed |
| STORY-16 | Extra bark lines (race, class, region, veteran), extra Bard lines, and a second phrasing for each of the ten contract briefs (50% each; same mechanics text) | Camp chatter; contract board |
| STORY-17 | Only the text-only part done (Grey Cloaks ledger note). Left as is: Work Orders 3/day vs Manual 2 (probably deliberate balance), "seven districts" (the game has six districts plus walls) | n/a |

Notes: the in-fight feed keeps only four messages, so a voice line can push an older note off sooner. Rollback: remove the `js/story.js` script tag and restore the Bard intro line marked `Index 85`.
