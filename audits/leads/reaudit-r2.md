# Re-audit round 2 — brief for every delegate

The build is at commit 554b965 (round 2 shipped: J-01…J-13, J-19…J-23). Please re-audit YOUR specialty on this build.

## Rules
- READ-ONLY this round: do not edit `index.html`, `js/*.js` or `game-bible.md`; your only file is your new report. Everyone is auditing at once.
- Test muted: load `.claude/audit.js` first (it mutes, and re-mutes when a save loads). `resize_window` 1280×800 (and 1920×1080 where layout matters); reset to desktop and close the pane when done. Back up and restore saves.
- Server: http://localhost:8765 (restart `.claude/serve.ps1` in the background if it is down).

## What to check
1. **Verify your own shipped work** from both rounds: does each item work as intended on the combined build, alongside everyone else's changes? Regressions and interactions first (for example, the HUD scaling against the graphics overlays, the new-player start against the Reeve's Hall changes, the continuous music against the debrief).
2. **New findings** in your specialty that the first audit missed, or that the new features created.
3. **Coverage gaps from round 1**: screens you did not reach last time (the graphics auditor covered only the fort and one contract; story did not play-test; balance used a crude bot).

## Report
Write `audits/<role>-r2.md` (bugs-r2, ux-r2, graphics-r2, story-r2, balance-r2, audio-r2):
- A five-line summary.
- **Regressions and bugs** (fix-as-found candidates): ID, where, how to reproduce, suggested fix, effort.
- **Verification table** of your shipped items: works / partly / broken.
- **New proposals**, prioritised (aim for 5–15): ID (e.g. UX2-01), change, effort S/M/L, owner delegate/commander.
End your turn with a three-line summary.
