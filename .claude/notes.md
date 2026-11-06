# Working notes (read first in a fresh chat or after /compact)

Keep this current at the end of every task: what changed, what's in flight, where things are. Short facts only.

Last updated: 2026-11-06, after commit 9d0b481 (Index 85b-d).

## Where things are
- Repo: this folder; GitHub `Pjdoranbrown/Dust-Cloaks` (branch `main`); live: https://pjdoranbrown.github.io/Dust-Cloaks/ (GitHub Pages, updates a minute after push).
- `index.html` (~25k lines, ~2 MB): CSS, screens and the game script. **Never read it whole** — grep `INDEX \d+ -` to map sections, then read only the lines needed (or ask `game-drafter`).
- `assets/*.js`: base64 image data (portraits, Rank'n art). Never read.
- `js/ux.js` (Index 83), `js/graphics.js` (Index 84), `js/story.js` (Index 85): improvement modules loaded after the main script. New work by delegates goes in these (or a new `js/*.js`) to avoid edit clashes in `index.html`.
- `audits/`: auditor reports (bugs, ux, graphics, story, balance) and `audits/leads/` (Gemini report sliced per role).
- `.claude/backlog.md`: bigger jobs and open decisions — the to-do list. `game-bible.md`: design source of truth + Decisions log.
- Design docs (tabletop): `..\Game Design Document\Current`, `..\Rules and Manuals\Current`; the Players Manual is the lore authority.

## Code conventions
- Each change is an "INDEX N" section with a header comment (what, why, ROLLBACK). Later sections wrap earlier functions: `{ const f = fn; fn = function(){ ... f() ... }; }`. In-place patches are tiny and marked `/* Index N */`.
- Latest (index.html): Index 76 3D props · 77 baked soft terrain, tavern, build-anywhere + construction + builders · 78 Scribe's ledger, move/demolish, camp keys · 79 high-DPI sharp text, text size · 80 per-object draw guards · 81–82 audit bug fixes · 83 UX · 84 graphics · 85 story · 86 balance (js/balance.js).
- Calendar: one contract = one season (`chron().turn`). Construction uses that clock (`buildNow`).

## Running and testing
- Local server: `powershell -NoProfile -ExecutionPolicy Bypass -File .claude\serve.ps1 -Root "<this folder>"` → http://localhost:8765.
- Built-in browser pane is often hidden → `requestAnimationFrame` pauses; drive frames by hand (camp `updatePeople(); drawCamp();`, contracts `update(); draw();`). A hidden pane also reports a 0x0 window: call resize_window (e.g. 1280x800) before sweeps, then reset it to desktop.
- `.claude/audit.js`: `AUD.campSweep(label)`, `AUD.contractSweep(label, contract, {ticks, setup})`, `AUD.run`, drawImage recorder. Load with a script tag (see its header).
- Standard regression: camp in 4 holdings × seasons (`window.SEASON_FORCE`), all `CONTRACT_KEYS`, a raid (`makeRaidContract`), bar fight, prologue (`openStory()`); trap `error` events and check the console for "Draw error".
- Git: `C:\Program Files\Git\cmd\git.exe` (not on PATH in older shells); `gh` at `C:\Program Files\GitHub CLI\gh.exe`, signed in as Pjdoranbrown.

## How we work (commander + delegates)
- The main chat is the **commander**: triages, does hard work itself, delegates the rest, reviews and commits everything (delegates never commit).
- **Bugs**: fix as found. **Improvements**: ask the user first (via the backlog), then delegate if confident or do it here.
- Delegate Sonnet sessions (Claude Desktop, linked to the commander; message with SendMessage `to` = id):
  - bug-finder `local_2503b785-2354-4c88-bc2a-cb3360938856` — the only one allowed to edit `index.html` freely (Index 81–82).
  - ux-graphics `local_401dbc2c-9c28-4ff1-aa29-8ca2b44dbe3f` — `js/ux.js`.
  - game-graphics `local_c7b7b6e4-c3eb-4429-8389-0acac45ab847` — `js/graphics.js`.
  - story-designer `local_f57aa233-9ce1-47b6-bc71-47f1599d89a4` — `js/story.js`.
  - game-balancer `local_90755013-6a51-4dc2-9076-1d1d037c2b84` — `js/balance.js` (Index 86).
  - sound-designer `local_c09b4f98-2340-447d-a424-ae1e42c0b183` — audio review (`audits/audio.md`, demo `audits/audio-demo.html`); future code in `js/audio.js`. Role card: `.claude/agents/sound-designer.md`.
- For one-off heavy reading or drafting inside a chat, use the `game-drafter` subagent (`.claude/agents/game-drafter.md`). For audio work, the `sound-designer` subagent (`.claude/agents/sound-designer.md`).

## In flight
- story-designer: J-16/17/18 shipped (Index 85b-d, commit 9d0b481).
- game-balancer: J-14 (Tier 1 softening via speed x0.9 and -1 Skill for Greenskins, Monsters, Orcs, Arcana) and J-15 (5 gear sinks) shipped in Index 86.
- sound-designer started 2026-11-06: reviewing SFX and music (user wants a mellow lute-and-drum town theme that carries into contracts and speeds up, Humanity-style). Results go into the backlog for the user to approve.
- Still waiting on the user: approval of jobs J-01..J-13.

## User preferences
- Plain, non-technical summaries; leads with the outcome.
- Wants iteration via GitHub (commits per change), not new HTML files.
- Uses Gemini for outside playtests; feed its findings to the right delegate, verify first.
