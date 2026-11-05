# Leads for the bug finder (from an external Gemini playtest of Index 80)

These came from another AI's playtest. Treat every item as a LEAD: reproduce it first, then fix it (Index 81) or record "not reproduced" / "works as designed" with a reason. Do not trust the suggested fix blindly.

## Gameplay bugs
- **G-BUG-01 Battlefield gold drops (High).** During siege assaults and sorties, defeated enemies drop coin sprites, but walking over them does not collect them and the top-right counter stays at "0 coin". Check pickup radius/collision for `G.pickups` (kind 'coin'), whether the prologue siege uses a different pickup path, and whether coin is meant to auto-collect (magnet) or bank only at the end.
- **G-BUG-02 Prologue village shortcuts (Medium).** The bottom hint bar (`#camp-hint`, text appended in Index 78's `startCamp` wrapper) advertises "Keys: B build · R roster · P planning table · Q quartermaster · H hire · L ledger", but none work on the Varnholt prologue map (Index 78's key handler returns early when `inStoryNow()`). Either show the keys only in the main camp, or make the ones that make sense work in the prologue.
- **G-BUG-03 Q and R mean two things (Medium).** In camp, Q = quartermaster and R = roster; in combat, Q = spend Luck and R = burn Luck (HUD and Manual). The camp handler is inactive during contracts, so it is a clarity problem more than a functional one. Confirm there is no case where a camp key fires during combat (or vice versa), and make the hint and Manual text unambiguous (for example, the hint only lists camp keys while in camp).
- **G-BUG-04 West palisade pathfinding (Low).** In the prologue Varnholt siege, small groups attacking the West Palisade snag and stack on outer tree/fence corners. Investigate the enemy steering near blocked cells; a small sliding/steering fix is fine if contained, otherwise describe it for the commander.
- (G-BUG-05 — builder hover blanking the camp — is already fixed in Index 80. Just confirm.)

## Layout defects (clipping and overlap — fix if clear)
- **G-UI-01 Title screen.** The helper text under "Found your Chapter" ("New here? The prologue teaches the game…") overlaps the top border of the "Continue the Prologue" button. Add spacing.
- **G-UI-02 Title screen, Squad Leader look.** The "No Squad Leader yet" placeholder overlaps the portrait frame border. Centre it inside the box with padding.
- **G-UI-03 Market, Infantry Spears card.** The green EQUIPPED badge clips the description text. Reserve space for the badge or move it to the card header.
- **G-UI-04 Market, Imperial Siege Arbalest card.** A long SOURCE value wraps and collides with the COST label. Use a flex/grid footer row instead of fixed positions.
- **G-UI-05 Combat HUD, formation helper.** The yellow "Open Order…" helper text at the bottom left clips its last line ("catch fewer of you.") against its container. Note: it is drawn on the canvas — check the wrapping/box height logic, especially with Index 79's 10.5px font floor and text-size setting, which may have caused it.
- **G-UI-06 Prologue village map and the Reeve's Hall.** The "Reeve's Keep" map label (bottom right) is partly hidden by the bottom hint bar, and the red "Ring the Bell" day-end button in the Reeve's Hall is partly cut off at the bottom. Move them clear of the footer (24–32px) or make the footer not cover them.
