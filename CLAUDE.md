# Dust Cloaks game — working rules

## Context
- Read `.claude/notes.md` first: the working state (where things are, conventions, testing, delegates, what's in flight).
- Then `game-bible.md`: the source of truth for design decisions.
- Bigger jobs and open decisions live in `.claude/backlog.md`. Jobs need the user's OK before starting; decisions are the user's call. Bugs are fixed as found.
- Detailed reviews live in `audits/` (balance, graphics, story, ux). Read only the one the task needs.
- `index.html` is about 2 MB. Never read it whole: search for the function or section you need and read only those lines.

## Keep the notes current (so /compact or a fresh chat loses nothing)
- At the end of every task, update `.claude/notes.md` (what changed, what's in flight) and the Status column in `.claude/backlog.md`.
- New proposals from audits or playtests go into the backlog with a source and an owner.

## Keep the bible current
- When a design decision is made, add one line to the bible's Decisions log (date — decision — why) and update the relevant section.
- Keep the bible concise; move long detail into `audits/`.

## Token-efficient working
- For bulk drafting (level layouts, item lists, balance tables, enemy rosters) or wide searches through `index.html`, delegate to the `game-drafter` subagent and keep only its result.
- Lead replies with the outcome; keep them short.
- Make small, targeted edits to `index.html`; never rewrite it.
