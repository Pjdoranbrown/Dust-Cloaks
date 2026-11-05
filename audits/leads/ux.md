# Leads for UX graphics (from an external Gemini playtest of Index 80)

These came from another AI's playtest. Treat each as a LEAD: check it against the current game, then fold it into your report as confirmed (with your own proposal), already done, or not recommended (say why). Clipping/overlap defects (title screen, market cards, formation helper, Reeve's Hall bell) have gone to the bug finder — don't duplicate them.

## Specific items
- **G-UI-07 Builder label.** Clicking/hovering a builder shows "Took / Builder: Tents, 1 season left" (name + subtitle in the standard camp label). Gemini read it as a raw debug string. Decide whether the camp label style needs a clearer layout for builders (for example "Building the Tents — 1 season left") or is fine.
- **G-UI-08 Save slots.** Saving is browser auto-resume plus Export/Import of a JSON file. Proposal: 3–4 named in-menu save slots with timestamps and a chapter/day summary. Evaluate value vs risk (the save lives in `localStorage` under `SAVE_KEY`; the prologue uses its own slot via `switchSlot`).

## Onboarding (new player experience)
Gemini found the prologue front-loads five layers of menus before the player moves: campaign length, Squad Leader build (6 specialties × 6 classes × many races, abilities), picking 4 companions, an 850gp charter-kit shop, then the Varnholt map with every menu, Work Orders, dice targets, Luck, Condition and Wounds visible at once. Its proposed "play first, menus later" path:
1. **Cold open road skirmish (minute 0).** Pick one of three pre-built archetype cards (Vanguard Soldier, Folk Archer, Battle Cleric; "Advanced custom build" for veterans), then a 45-second ambush on the road outside Varnholt teaching WASD, Shift, Space (Brace/Open Order) and auto-attack. Hide the character sheet, market, Work Orders, Luck, Condition and Wounds until later.
2. **Entering Varnholt and the dice (Day 1 morning).** The Reeve asks for one action (Scout or Rally); show an animated die roll (die + bonus vs target). Hide specialist kits, ledger, hiring and other Work Orders until then.
3. **Luck on the first failed roll.** A spotlight explaining Q = spend Luck (+1 to all dice, refreshes at camp) vs R = burn Luck (natural maximum, permanent). Builds on the existing "Offer Luck on failed rolls" setting.
4. **Wounds and Ward/Armour at the first heavy hit.** Slow time for 2 seconds, highlight the portrait, explain Wounds persist until healed (Cure Wounds or Tend the Wounded).
5. **Condition and camp upkeep after the first battle.** Introduce Condition, supplies, tents, kitchen, then the market.

## Tooltips and readability
- One-line plain-English summaries on hover before the dice maths (specialty, class, gear), e.g. "Heavy armour: blocks the first hit each wave, but slows you 10%".
- A compact visual dice toast whenever a background check resolves (gold pips = Luck, red = Wound penalty, green = success).
- Squad portrait cards that separate Ward (temporary), HP and Wounds (lasting) visually so they are never confused.

For each onboarding/tooltip idea: say whether it fits the existing Index 45 guided start and the prologue, what the smallest valuable version is, effort, and whether a Sonnet delegate could build it or it needs the commander.
