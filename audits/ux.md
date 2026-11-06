# UX graphics audit: Dust Cloaks (Index 80)

**Summary**
1. The game already has good bones for a new player: a guided founding (Linnet's five jobs), quick-start archetypes, hover previews, confirmation dialogs, camp hotkeys and a text-size setting.
2. The biggest problems are about too much at once: the splash and pause screens show every setting, the prologue's top bar and the Reeve's Hall show every menu on Day 1, and the planning table is 3,500px tall with SIGN AND MARCH about 1,500px down.
3. The contract HUD is fixed-size canvas art. It is fine at 1024–1366px, but at 1920×1080 it covers only a small part of the screen and its 10–11px print is hard to read. The leader card's "WOUNDS" row reads as damage taken, not health left.
4. Feedback has gaps: disabled buttons don't say why (their tooltips can't even show), "Show tips again" does nothing visible, and the confirm dialog styles destructive actions exactly like safe ones.
5. Gemini leads: the builder label (small fix) and progressive disclosure in the prologue are confirmed. Named save slots are recommended only in a smaller "rolling backups" form. The full cold-open rewrite is not recommended, because a much cheaper version gets most of the value (see the Gemini leads section).

Method: I walked the existing campaign (splash → camp → side panel → planning table → contract → pause) at 1024×768, then a blank save (splash → guided founding → prologue → leader creation → squad pick → Charter Kit → Reeve's Hall) at 1280×800, plus a contract at 1920×1080 and 375×812. The saves were backed up first and restored byte-for-byte afterwards. Note: the leader shown on the splash when I arrived (Brenna) differed from the one in storage (Godfrey), so another tab probably wrote the save while this page was open. Storage is back exactly as I found it.

---

## Prioritised proposals

### UX-01 Move settings off the splash and pause screens (High)
- **Where:** `showSplash` (`index.html:6326-6337`) appends `settingsHTML(true)`; the pause overlay (`#pause-inner`) does the same. `settingsHTML` is at `:4433`, extended by Index 79 at `:25124`.
- **Problem:** A first-time player sees two big CTAs followed by about 20 controls: Salvage "Detailed (dice)/Quick (10%)", Momentum "Pause/Slow/Real-time", Squad Leader look (with "No Squad Leader yet" placeholders), 3D world, Export/Import, and Sharp text. These are jargon they can't understand yet, and they push the prologue explanation into the noise. On the pause screen the same block (including Squad Leader look and Export save) pushes the contract map's title off the top at 1024×768.
- **Change:** Show on the splash only the title, the status line, the primary CTA, the secondary CTA and one small `SETTINGS` text button that opens the same `#tb-settings` popover the top bar uses. On pause, keep Volume, Game speed and Momentum inline, and put everything else behind a `More settings…` toggle. Group the popover into labelled sections: **Sound**, **Game**, **Display**, **Save**.
- **Effort:** S · **Owner:** delegate

### UX-02 Give the first run one obvious recommended path (High)
- **Where:** `showSplash` `:6333-6335`, first-run branch.
- **Problem:** With no save, FOUND YOUR CHAPTER and PLAY THE PROLOGUE are both gold, and the prologue button is wider. The note between them ("New here? … Or skip straight to founding") is 14px grey and asks the player to choose before they know anything.
- **Change:** On first run, make the prologue the single gold button, labelled `START HERE: THE PROLOGUE (about 20 min)`. Below it, a small plain button: `Skip to founding a Chapter`. Cut the note to one line: "The prologue teaches the game; its survivors become your Chapter."
- **Effort:** S · **Owner:** delegate

### UX-03 Planning table: put the decision on screen (High)
- **Where:** `renderTable` (`:6367`); grid at `:110`. The table measured 3,519px tall at 1024×768. "Who Marches" and the SIGN AND MARCH seal are around y=1,160–1,500. Rivals sits at 2,966 and the Prisoner Ledger at 3,415.
- **Problem:** The main loop (pick contract → council → squad → march) is split across a long scroll, mixed in with reference panels (Faction map, Doctrines, Rivals, Ledger). The player can't see the selected contract, the squad and the march button together.
- **Change:** (a) Add a sticky footer bar inside `.table-screen`, about 56px tall, showing: selected contract name · payout · `Squad 4/5` · gold `SIGN AND MARCH` button. Disable it with a reason when invalid. (b) Make the right column a tabbed scroll (`Ambition | Factions | Doctrines | Rivals | Prisoners`) so it is no taller than the left column. (c) `P` should land the scroll on Contracts.
- **Effort:** M · **Owner:** commander (layout plus behaviour across several patched renderers)

### UX-04 Disabled buttons must say why, and their tooltips must work (High)
- **Where:** `.btn:disabled{opacity:.4;pointer-events:none}` (`:25`) and `.mini button:disabled{…pointer-events:none}` (`:47`). The Advancement buttons put the reason in `title` (`:6252`), but `pointer-events:none` means the tooltip never appears. Leader creation's `CONTINUE: NAME THEM` is disabled at 40% opacity with no message until an ability is picked. Doctrine buttons show only a greyed "100gp".
- **Change:** Replace `pointer-events:none` with `cursor:not-allowed` and keep a click guard, so `title` shows. Add a one-line reason under every disabled primary button, e.g. "Pick an ability first", "Needs Ranger's Hut", "Treasury holds 40gp". Label doctrine buttons with a verb: `ADOPT · 100gp`.
- **Effort:** S · **Owner:** delegate

### UX-05 Scale the contract HUD with the window (High)
- **Where:** `drawHUD` `:4264-4355`. Fixed pixel panels: leader card 300×(76+rows·14), objective 300×54, coin/momentum 220×84, minimap 220 wide, bottom strip 760×40, row labels 9px (floored to 10.5px by Index 79).
- **Problem:** At 1920×1080 the HUD is small and its 10.5–11px grey (`#aaa`, `#c8bca8`) print is hard to read. At 1024×768 the 760px key strip nearly touches the minimap. Text size "Larger" scales canvas text by only 1.18×, not the panels.
- **Change:** Add `HUDK = clamp(VH/760, 1, 1.6) × textScale()`, and draw the HUD inside `ctx.save(); ctx.scale(HUDK,HUDK)` with layout in `VW/HUDK, VH/HUDK` units. Add a setting `HUD size: Auto / 100% / 125% / 150%`. Lift the small-print colour from `#aaa` to `#d8ccb4`.
- **Effort:** M · **Owner:** commander (every HUD overlay patch — alerts, braziers, Index 16 and others — must use the same transform)

### UX-06 Make the leader card's health rows unambiguous (High; Gemini tooltip lead)
- **Where:** `drawHUD` rows `:4268-4282`: WARDS (blue), SHIELD (gold), WOUNDS (salmon, `L.wounds / maxWounds`), CON (green), LUCK.
- **Problem:** "WOUNDS" with a full row of red pips reads as "badly wounded" when it actually means "all wounds left". Ward (temporary), Shield (pool), Wounds (health) and Con are told apart only by colour and a 9px label. Nothing says which one goes down first.
- **Change:** Put the rows in the order damage takes them (Wards → Shield → Wounds), add a numeric `6/6` after each row, and rename the row `HEALTH (Wounds)` or make empty pips read as wounds taken (dark red outline, filled = remaining). Make Ward pips diamond-shaped and Shield pips square, so the rows don't rely on colour. Flash the row that just lost a pip for 400ms.
- **Effort:** S–M · **Owner:** delegate (art-free canvas change), with the commander signing off the wording against the manual

### UX-07 Prologue: hide campaign menus until they matter (High; Gemini onboarding lead)
- **Where:** The prologue top bar showed `WORK ORDERS | ROSTER | MARKET | MANUAL | PORTRAITS | SETTINGS | MAIN MENU` during leader creation, and the main-campaign camp hint ("B build · P planning table · Q quartermaster · H hire · L ledger") on the Varnholt map.
- **Change:** In the story slot, show only `WORK ORDERS` (gold), `MANUAL`, `SETTINGS` and `MAIN MENU` until Day 1 ends. Add `ROSTER` after the first assault and `MARKET` when Smithy Row matters. During leader creation and the squad pick, hide the top-bar buttons entirely (keep the brand and stats). Give the prologue its own hint text listing only keys that work there.
- **Effort:** S · **Owner:** delegate

### UX-08 Reeve's Hall Day 1: fewer cards, a clear "next" (High; Gemini onboarding lead)
- **Where:** The Reeve's Hall table (prologue Work Orders screen). On Day 1 it shows 9 work orders, 4 fortifications, the town plan, the Intelligence card, the Morning Report and the Sergeant's Advice at once. RING THE BELL is at the very bottom.
- **Change:** On Day 1 of the Quick Prologue, show only the orders the Sergeant names (Rally the Town, Scout, Scrounge) plus Ditch and Stakes. Collapse the rest under `More orders (available)` and grey out the locked ones under `Unlocks later`. Add a pulsing gold outline on the next suggested card, and a fixed `RING THE BELL: END THE DAY` button in the header next to the candles, showing the candle count (`2 of 3 orders left`).
- **Effort:** M · **Owner:** commander (story flow)

### UX-09 Quick start should really be quick (Medium; Gemini onboarding lead)
- **Where:** Leader creation quick-start pills (`.qpill` `:17592`): The Shield / The Bow / The Medic / Surprise me.
- **Problem:** The pills are 12.5px and look like filters. Picking "The Shield" sets Specialty/Class/Race but still stops at "Pick 1 Ability" (7 cards) and then Name. Also, the Soldier's role is called "Vanguard" and one of its abilities is also called "Vanguard".
- **Change:** Show three 200px archetype cards above the specialty grid: portrait, name, one plain sentence ("Front line. Holds the gate, bashes crowds."). One click picks the archetype's recommended ability and a random name, and jumps to a summary with `SIGN CONTRACT` and `Change anything…`. Rename the role label or the ability so they don't collide (that one is for the commander or story).
- **Effort:** M · **Owner:** delegate (cards) and commander (the naming collision)

### UX-10 Squad pick: plain stat labels and a recommended four (Medium)
- **Where:** Prologue "Your First Squad" panel: lines like `Con 6 · Mv 5 · M 2 · R 0 · Mg 1`, and `THESE FOUR (0 / 4)`.
- **Change:** Swap the abbreviations for tiny icon + number chips with a `title` (Condition, Move, Melee, Ranged, Magic), and lead each row with the role word (Healer / Archer / Blaster / Knife / Front line). Add a `PICK A BALANCED FOUR` button above `OTHER FACES`.
- **Effort:** S · **Owner:** delegate

### UX-11 Danger styling and a safe default in confirm dialogs (Medium)
- **Where:** `askConfirm` `:11002-11010`. Every dialog uses a gold `SEAL IT`, and `[1] or [ENTER] confirm`. Used by Release from the company (`:5313`), New Campaign, Load save and Stand down.
- **Change:** Add `opts.danger`: a red-brown button (`#7a1e14`) with an explicit verb (`RELEASE BRENNA`, `ERASE THIS CAMPAIGN`). Focus `THINK AGAIN` by default so ENTER cancels, and require `[1]` to confirm. Pass `danger` from `gate()` callers that delete things. Separately, the side panel's full-width dark `STOP WORK` (`:24802`, made full width by `#camp-panel .btn`) is the most prominent thing on a construction panel. Make it an outlined secondary button.
- **Effort:** S · **Owner:** delegate

### UX-12 Feedback for silent actions (Medium)
- **Where:** `resetTips` `:4471` (sound only); `setSetting` `:4446`; Export save `:4449`.
- **Change:** Route these through `campNote` (`:24640`), or an equivalent in-contract toast: "Tips will show again", "Save written to DustCloaks_Godfrey_….json", "Text size: Large". Extend `campNote` with a `kind` (good / bad / info) so it shows a left border colour plus an icon (✓ / ! / i), not colour alone.
- **Effort:** S · **Owner:** delegate

### UX-13 Back contract messages and the scenario line with a panel (Medium)
- **Where:** `G.msgs` drawn at `VH-215` with a 1px shadow (`:4350-4352`), plus the scenario/season lines above the formation strip.
- **Problem:** Cream 13px text sits straight on bright grass and dirt, where it is hard to read (seen at 1024×768 over the dirt path).
- **Change:** Draw a `rgba(20,14,8,.7)` rounded strip behind the message stack (width = longest line + 20). Cap it at 4 lines, newest at the bottom.
- **Effort:** S · **Owner:** delegate

### UX-14 Top bar truncates the most useful chips first (Medium)
- **Where:** Index 79 CSS `:25119-25122`; Index 78 ledger chip. At 1024px the bar showed `No Amb…` and `Ledger: 2 building …`, while 7 nav buttons kept full width.
- **Change:** Below 1280px, fold `MANUAL`, `PORTRAITS` and `SETTINGS` into a `☰` menu button and keep the chips whole. Shorten the ledger chip to an icon + count (`🔨2`) with the full text in `title`.
- **Effort:** S · **Owner:** delegate

### UX-15 Camp hint strip is a wall of keys (Low–Medium)
- **Where:** `#camp-hint` (`:104`). Two lines across the full width at 1024px: "WASD or the arrow keys… Keys: B build · R roster · P planning table · Q quartermaster · H hire · L ledger · hold Alt for names."
- **Change:** Show the full text for the first 3 camp visits, then collapse it to `? Keys` (expand on hover or `?`). Since the Alt labels exist, add the hotkey letter to each top-bar button (`ROSTER [R]`), so the strip isn't needed.
- **Effort:** S · **Owner:** delegate

### UX-16 Builder and construction readability (Low; Gemini G-UI-07)
- See the Gemini leads section. The construction panel's progress bar is empty at "Ready in 1 season" (0% at the start of the only season) and reads as broken. Show a striped "under way" bar with the label `Season 1 of 1`.
- **Effort:** S · **Owner:** delegate

### UX-17 Keyboard focus is invisible on most controls (Low–Medium, accessibility)
- **Where:** Only `.hcard` defines `:focus-visible` (`:17580`). `.btn`, `.card`, the top-bar `.tb`, the `.dchk` replacement checkboxes and the `.dpips` volume pips have no focus style, and the volume pips aren't focusable at all (the real `<input type=range>` is `display:none`).
- **Change:** Add a global `:focus-visible{outline:3px solid #ffd860;outline-offset:2px}`. Make `.dpips` a `role="slider"` with arrow-key handling, or keep the native range visually hidden but focusable (`opacity:0;position:absolute`) instead of `display:none`.
- **Effort:** S · **Owner:** delegate

### UX-18 Don't rely on colour alone for status (Low, accessibility)
- **Where:** Faction seals: ally green / hostile red name only (`:160`). Dice: `.die.success/.partial/.miss` (`:135`) are colour only. HUD pip rows (UX-06). The Momentum card rarity is colour plus a small word.
- **Change:** Add a glyph: ally `▲`, hostile `▼`; dice get a small caption under the number (`HIT` / `PARTIAL` / `MISS`). This is already the case in some places, so make it consistent.
- **Effort:** S · **Owner:** delegate

### UX-19 Founding: top-bar exits stay live mid-flow (Low)
- **Where:** During "Found the Chapter", the top bar offers QUARTERMASTER, MANUAL, PORTRAITS and SETTINGS. Clicking one abandons the step with no prompt.
- **Change:** While `#screen-create` is open, show only MANUAL and SETTINGS, or open the others as overlays that return to the founding step.
- **Effort:** S · **Owner:** delegate

### UX-20 Faction map and Ambition scrolls: overlapping text (Low; also listed under bugs)
- See Bugs B-2 and B-3. As a UX change: give the map labels a minimum spacing pass (nudge collisions), or show names on hover only, with a legend list beside the map.
- **Effort:** S–M · **Owner:** delegate

---

## Gemini leads

| Lead | Verdict | My proposal | Effort | Owner |
|---|---|---|---|---|
| **G-UI-07 Builder label** ("Took / Builder: Tents, 1 season left") | **Confirmed, minor.** It renders cleanly (bold 15px name, 12px sub, `campLabel` `:6115`; text built at `:6073`). The words read like a data field, and it doesn't say that clicking opens the site (it does: the click opens the Tents construction panel). | Title: the building, not the person: **"Building the Tents"**. Sub: **"Dunstan · 1 season left · click for the site"**. Reuse the same wording for `Training:` and `Resting` ("Resting — sits out the next contract"). | S | delegate |
| **G-UI-08 Named save slots** | **Recommended in a smaller form.** The slot plumbing exists (`switchSlot` `:7397`, `STORY_SLOT`/`MAIN_SLOT`). The risk is the prologue-to-campaign handover (`:8814` writes `MAIN_SLOT` and deletes the story slot) and `resetSave` paths that assume one main slot. | Phase 1 (safe): **rolling backups**. On each season change, copy `SAVE_KEY` to `SAVE_KEY+'_bk'+n` (keep 3), and add `Restore a backup…` in Settings → Save, listing "Godfrey · Summer 625 · 2,850gp · 4 contracts". Phase 2 (only if wanted): 3 named campaign slots on the splash, reusing `switchSlot`, with Export/Import per slot. | Phase 1 M, Phase 2 L | commander |
| **Onboarding 1: cold-open skirmish with 3 archetypes** | **Not recommended as specified** (a new pre-town scene, hidden systems and a reordered prologue is an L rewrite of story code). Its two useful parts are cheap: archetype cards (UX-09) and fewer menus (UX-07). | Smallest valuable version: UX-09 archetype cards that skip Ability and Name, plus UX-10's balanced four. Let `BEGIN THE SIEGE` work without visiting the Market (it already does), with the note "The Standard Kit is already issued." The existing first-contract tips (`TIPS.move`, `abilities`, `:4477`) already teach WASD, Space and abilities in the first assault. | M | delegate (cards), commander (flow) |
| **Onboarding 2: Reeve asks for one action; animated die** | **Confirmed.** Day 1 shows everything (UX-08). The dice visuals already exist (`.die` `:133-135`). | UX-08 (Day 1 subset, suggested-next outline). When a Work Order resolves, show the existing `.die` row in a toast for 2.5s: die face(s), `+bonus`, `vs 4`, and the result word. | M | commander |
| **Onboarding 3: Luck spotlight on the first failed roll** | **Confirmed, cheap.** There is a setting "Offer Luck on failed rolls", and `TIPS` has no Luck entry (only `leaderdown` mentions burning Luck). | Add `TIPS.luck` ("Q spends 1 Luck: +1 to every die this roll, refills at camp. R burns Luck: a natural maximum, gone for good."), fired on the first failed roll where Luck could be offered, in camp and in contracts. `tip()` currently needs `G`, so add a `campNote` fallback outside contracts. | S | delegate |
| **Onboarding 4: Wounds/Ward slow-mo at first heavy hit** | **Confirmed in part.** Slow-motion is not recommended (it breaks the action, and time scaling touches the update loop). The explanation is needed. | Add `TIPS.wounds`, fired the first time the Leader loses a Wound pip: "Wards and Shield soak hits first. Lost Wounds stay after the contract until healed: Cure Wounds, or Tend the Wounded in camp." Pair it with UX-06's row flash. | S | delegate |
| **Onboarding 5: Condition and upkeep after the first battle** | **Confirmed.** Fits the existing debrief. | The first debrief in a story slot gets a short "Back in town" box: Condition, Supply, and what the tents/kitchen do, with one `Got it` button. | S | delegate |
| **Tooltips: one-line plain summaries before the dice maths** | **Confirmed.** Cards already lead with a role word ("Vanguard", "Support"), but gear and doctrine cards jump straight into rules terms ("Solid Hit", "1 step"). | Add an optional `plain` string to SPECS/gear/doctrine data, shown as the first line in italic 13px, with the rules text under a `Details` disclosure. Start with the 6 specialties, the armour list and the 12 doctrines. | M (content heavy) | delegate for plumbing; commander or story for wording |
| **Visual dice toast for background checks** | **Confirmed** (same as onboarding 2). | Reuse `.die`. Gold pip under the die = Luck spent, red = Wound penalty, green border = success. Make it one component, `diceToastHTML(rolls, target)`, used by Work Orders, Salvage (Detailed) and withdrawal. | M | delegate |
| **Squad cards separating Ward / HP / Wounds** | **Confirmed** for the HUD leader card (UX-06). Squad Mates in contracts show only tiny green bars under the sprites. | UX-06 first. Then add an optional 5-portrait strip (36px busts, one 4px health bar each, red X when down) on the left edge under the leader card, toggled with `[N]`. | M | commander (HUD layout) |

---

## Bugs for the bug finder
Not duplicating the clipping items already passed on (title screen, market cards, formation helper, Reeve's Hall bell).

- **B-1 Disabled-button tooltips can never show.** `.btn:disabled` and `.mini button:disabled` set `pointer-events:none` (`:25`, `:47`), so the `title` reasons on Advancement buttons (`:6252`) and other disabled controls are never seen. (UX-04 has the fix.)
- **B-2 Faction Standing map labels overlap.** On the planning table ("Arcadia: Faction Standing"), names such as "Imperial Arcana Guild", "Dwarves", "Reynard's Sk…" and "The Dust Cloaks Council" print over each other and over seals at 1024×768.
- **B-3 Charter Ambition wax seals cover text.** In the Ambition scrolls (Fame, Liberation), the 48px seal (`.cscroll .seal`, `:124`) sits over the last words of the perk lines ("…while the squad Charges", "…Ex-Slave recruits on the Hiring Line…"). Add `padding-right:56px` to `.cscroll` or move the seal.
- **B-4 Prologue shows main-campaign hotkey hint.** On the Varnholt map, `#camp-hint` still lists "B build · P planning table · Q quartermaster · H hire · L ledger", which don't apply in the story slot (UX-07).
- **B-5 Treasury jumps during the Charter Kit.** The prologue top bar showed 850gp at "The Charter Kit" and 890gp on Day 1 without any purchase. That is the Silver Pit's +40gp in the Morning Report, which is fine, but it was applied before the report was shown. Low priority: worth checking the order, or showing the +40 as it lands.
- **B-6 Splash showed a stale leader.** The splash said "Brenna" while `localStorage` held "Godfrey". The likely cause is two tabs on the same origin. If so, saving from the stale tab overwrites the other one. Consider a `storage` event listener that reloads META, or warns, when another tab writes `SAVE_KEY`. (Since done: the game now shows a "This save was changed in another tab" warning.)

---

## Implemented (Index 83, `js/ux.js`)

Everything is in `js/ux.js` and wraps game functions. Nothing in `index.html`, `js/graphics.js` or `js/story.js` was changed. To roll back, empty the file or remove its `<script>` tag.

**How it was tested.** Another tab was writing the shared save, so my test tab used its own storage keys (prefixed `ux83:`, seeded from a copy of the save). The real `dust_cloaks_v4` and `dust_cloaks_story1` were never written by my tests, and the `ux83:` copies were deleted afterwards. One exception: before I set this up, an early run of "Show tips again" on the real save cleared `tipsSeen`. I put `tipsSeen` back from my backup straight away. I checked at 1024×768 and 1920×1080. No console errors came from Index 83 (the one 400 in the log is my own test request to 127.0.0.1, which the local server rejects).

| Item | What changed | How to see it |
|---|---|---|
| UX-01 | The title screen shows one `SETTINGS` button that opens the top-bar popover. The popover is grouped into **Sound / Game / Display / Save**, with NEW CAMPAIGN under Save, and scrolls if it is tall. The pause screen keeps Volume, Game speed, Momentum and Music; the rest is under `More settings…` (grouped the same way). On the pause screen the map is capped at `100vh − 470px` and the overlay uses `safe center`, so the title and buttons fit at 1024×768 and 1920×1080. | Title screen → SETTINGS. In a contract press Esc. |
| UX-02 | With no Chapter yet: the only gold button is `START HERE: THE PROLOGUE` (one-line note above it), with a small `Skip the prologue: found a Chapter` under it. | New campaign → title screen. |
| UX-04 | Disabled `.btn`s get a red italic reason under them: on the creation steps "Pick 1 Ability to continue." (taken from the step's heading), on the squad pick "Choose 3 more.", and otherwise the button's `title`. Doctrine buttons read `ADOPT · 100gp`. The `pointer-events` CSS fix is left to the bug finder (B-1). | Leader creation, Ability step; Planning table → Book of Doctrines. |
| UX-10 | Prologue "Your First Squad": `Con / Mv / Melee / Ranged / Magic` chips with tooltips, a role word after the name (KNIFE, SUPPORT…), and `PICK A BALANCED FOUR`. It picks one each of Cleric, Soldier, Folk Hero, Mage, Witch and Scoundrel, skipping the Leader's own Specialty first, then fills by Condition. | Prologue → after SIGN CONTRACT. |
| UX-11 | Confirms that lose something (wording matches release, stand down, pull down, "replaced", start again, new campaign, concede, abandon, delete, "for good") get a red button with a verb (`RELEASE GRISHA`, `LOAD THIS SAVE`) and focus on THINK AGAIN. ENTER cancels, `[1]` confirms, and the hint line says so. Other confirms are unchanged. Construction `STOP WORK` is an outlined secondary button. | Roster → Release; a construction site panel. |
| UX-12 | `campNote(msg, kind)`: `good` ✓ green edge, `bad` ! red, `info` i gold. Without a kind it looks as before. Show tips again, Export save and Text size now confirm with a toast. | Settings → Show tips again. |
| UX-13 | Contract messages (bottom left) sit on a dark rounded strip, at most 5 lines. They fade and count down exactly as before. | Start any contract. |
| UX-14 | Below 1280px: MANUAL / PORTRAITS / SETTINGS fold into a `☰` menu, and the ledger chip shortens to `⚒ 1 · -60gp` (the full text stays in the tooltip). The bar redraws when the window is resized. | Camp at 1024px wide. |
| UX-15 | After 3 visits to the camp (`META.uxCampVisits`, counted in `renderTitle`, so closing a sheet back to the camp also counts; raise the threshold if it collapses too soon), the hint reads "WASD walks your Squad Leader · click buildings, plots and people · press ? for the camp keys". `?` toggles the full key list. The prologue hint is unchanged. | Enter the camp a fourth time; press `?`. |
| UX-16 | The construction bar is striped, animated (still when reduced motion is on) and labelled `Season k of N`. | Click a building site. |
| UX-17 | Global `:focus-visible` gold outline. The Volume and Music pips are a focusable `role="slider"` (arrows, Home, End). Custom checkboxes have `role="checkbox"` and `aria-checked`. | Tab through Settings. |
| UX-18 | Faction names: ▲ allied, ▼ hostile. Dice faces: ✓ / ~ / ✗ badges. | Planning table → Faction Standing; any dice result. |
| UX-19 | While a Leader is being made (founding or prologue), the top bar shows only MANUAL and SETTINGS and doesn't fold into ☰. | Found your Chapter. |
| G-UI-07 | The builder label reads "Building the Tents" / "Dunstan · 1 season left · click for the site" ("Building something new" when there's no site name). A resting mate's label reads "Resting · sits out the next contract". | Hover a builder in camp. |
| Onboarding 3 | The first time the Luck offer appears, a yellow "First failed roll?" box explains SPEND (Q) and BURN (R). It is marked seen in `tipsSeen.luck`, and respects the Tips setting. | First failed Leader roll. |
| Onboarding 4 | `TIPS.wounds` fires the first time the Leader loses a Wound in a contract: "A Wound lost. Hits take Wards, then Shield, then Wounds: at 0 the Leader is down. Healing and Poultices restore them." | Take a hit to Wounds. |
| Onboarding 5 | The first debrief in the prologue gets a "Back in Varnholt" box (Supply, the hurt and Tend the Wounded, Condition), shown once (`META.uxTown`). | Win the first prologue fight. |

**Skipped or changed from the proposals**
- The Gemini lead said Wounds "persist until healed". I couldn't confirm that from the code (Wounds live on the contract's Leader), so neither the tip nor the box claims it. The wording follows Manual §"Command Radius" and "Bleeding Out".
- UX-11: the verb on the red button comes from the dialog's text (first words of the question). A caller can still pass `opts.danger` or `opts.ok` to set it exactly.
- UX-04: reasons are added only where a reason can be known (creation steps, the squad pick, buttons with a `title`). Other disabled buttons are unchanged.
- Onboarding 5 couldn't be played through to a real first prologue victory in the time available. I checked it by calling `renderDebrief` in the story slot: the box appears on the first debrief, survives redraws once, and doesn't come back on the second.
- Not touched, as instructed: UX-03, 05, 06, 07, 08, 09, 20 and save backups.

---

## Implemented (round 2): Index 83b, `js/ux.js`

Appended to `js/ux.js` as "INDEX 83b". Nothing in `index.html` was changed. To roll back, delete from the 83b header comment to END INDEX 83b.

**Testing.** Run in the built-in browser at 1280×800 and 1920×1080, volume 0, `.claude/audit.js` loaded, with the campaign kept in separate storage keys (prefixed `ux83:`), removed afterwards; the real `dust_cloaks_v4` and the prologue slot were not written. The real save was a blank campaign when I started (someone else had reset it), so I made a small test campaign (leader plus four hires). No console errors. The pane is closed and the window is back to desktop size.

| Job | What changed | How to see it |
|---|---|---|
| J-03 | Planning table: a sticky footer (contract, pay, `Squad n / 5`, SIGN AND MARCH). It is off, with the reason, only when the roster is over capacity, and shows a hint when the War Council has not been rolled, Edges are unspent, or the squad is empty. The right column is tabs: Ambition · Factions · Doctrines · Rivals · Prisoners (n). The chosen tab is remembered. `openTable('ambition'/'ledger')` opens the right tab, and opening the table with no target (P, the top-bar button) scrolls to the top (Contracts). | Planning Table; press P. |
| J-04 | The contract HUD is drawn in a scaled frame: `HUDK = clamp(VH/760, 1, 1.6) × text size` (Auto, capped at 2), or a fixed 100 / 125 / 150% from **Settings → Display → HUD size**. Everything drawn inside `drawHUD` follows (leader card, objective, coin, minimap, key strip, alerts, carried items, brazier arrows, Momentum cards, message stack). The weather is drawn in the true frame. Momentum card clicks and hover still work (rects are converted to screen coordinates). Small grey print (`#aaa`, `#c8bca8` and similar) is brightened inside the HUD. Auto gives about 1.05× at 1280×800 and 1.42× at 1920×1080. | Start a contract at different window sizes. |
| J-05 | Leader card pips: Ward diamond, Shield and Mount squares, Wounds circle, Condition bar, Luck triangle. Filled means what is left, with `n/max` after each row. The row order is unchanged because the card already lists them in the order damage takes them (Wards, Shield, Mount, Wounds, then Condition and Luck). A row gets a red outline for about two-thirds of a second when it loses a pip. | Take a hit in a contract. |
| J-07 | Rolling backups: at each change of season (checked in `endDeployment`) the campaign is copied into three rotating slots (`dust_cloaks_v4_bk1…3`, newest first). **Settings → Save → Restore a backup…** lists leader · season · gold · contracts and when it was saved, with `Back up now`. Restoring asks first (red button), backs the current campaign up as "Before restoring", then loads the copy. Main campaign only: nothing happens in the prologue slot, and the prologue hand-over code is untouched. | Settings → Save. |
| J-11 | A squad portrait strip under the leader card: bust, Condition bar (green, amber, red), `DOWN` for bleeding mates, a red X when dead, up to 5. N hides or shows it (saved in settings). A one-time tip announces it. It scales with the HUD. | Any contract. |
| J-12 | Plain one-liners in the game's dry voice, with the rules text under `Details`. Specialties (leader creation and any Specialty card): six lines. Armour and shield cards (Quartermaster, Market): fourteen lines, with the stats left where they were. Doctrines: all twelve, with the rules text under `Details`. The story designer should review the wording. | Leader creation; Quartermaster; Planning Table → Doctrines. |

**Notes and limits**
- J-04: the HUD is not re-laid out, only scaled, so at HUD size 150% on a small window the panels grow but never leave the screen (layout is computed in the scaled space). The key strip at the bottom is 760 units wide, so at 150% on a 1024-wide window it takes most of the width.
- J-05: I did not rename the WOUNDS label. The circles, the numbers and the red flash are what make it unambiguous; renaming it would need a patch inside `drawHUD`.
- J-07: backups store the whole save text three times (about 4 KB each in my test; a late campaign is much larger). If storage is full, the oldest backup is dropped and the write is retried once.
- J-12: only cards whose title matches exactly are changed, so renamed or new gear gets no line until it is added to `PL_GEAR` in `js/ux.js`.
- Settings grouping was updated for the HUD size, Restore, and the new Effects slider (Sound).
- Not done in this round: the Gemini "cold open" ideas, UX-07/08/09/20 (still listed above as not yet approved).
