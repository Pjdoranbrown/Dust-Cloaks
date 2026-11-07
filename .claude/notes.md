# Working notes (read first in a fresh chat or after /compact)

Keep this current at the end of every task: what changed, what's in flight, where things are. Short facts only.

Last updated: 2026-11-06, after commit 790b303 (audio review).

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
- Latest (index.html): Index 76 3D props · 77 baked soft terrain, tavern, build-anywhere + construction + builders · 78 Scribe's ledger, move/demolish, camp keys · 79 high-DPI sharp text, text size · 80 per-object draw guards · 81–82 audit bug fixes · 83 UX · 84 graphics · 85 story · 86 balance (js/balance.js) · 87 audio (js/audio.js).
- Calendar: one contract = one season (`chron().turn`). Construction uses that clock (`buildNow`).

## Running and testing
- Local server: `powershell -NoProfile -ExecutionPolicy Bypass -File .claude\serve.ps1 -Root "<this folder>"` → http://localhost:8765.
- Built-in browser pane is often hidden → `requestAnimationFrame` pauses; drive frames by hand (camp `updatePeople(); drawCamp();`, contracts `update(); draw();`). A hidden pane also reports a 0x0 window: call resize_window (e.g. 1280x800) before sweeps, then reset it to desktop.
- `.claude/audit.js`: `AUD.campSweep(label)`, `AUD.contractSweep(label, contract, {ticks, setup})`, `AUD.run`, drawImage recorder. Load with a script tag (see its header).
- Standard regression: camp in 4 holdings × seasons (`window.SEASON_FORCE`), all `CONTRACT_KEYS`, a raid (`makeRaidContract`), bar fight, prologue (`openStory()`); trap `error` events and check the console for "Draw error".
- Always test muted (the in-app browser plays through the user's speakers): `.claude/audit.js` mutes on load; otherwise set `settings().volume = 0; settings().music = 0;` without saving. Stop audio after testing.
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

## In flight (as of commit 790b303)
- J-19 shipped (Index 87, js/audio.js). Demo section 4 "J-19 as built" lets the user compare old and new town audio.
- J-20 shipped (Index 87b); the user confirmed the music cut is gone.
- sound-designer is building J-21 (shared AudioContext, ducking, Effects/Music sliders, node cleanup) then J-22 (title, prologue, debrief, raid, bar-fight contexts; feedback sounds) in `js/audio.js` (Index 87c, 87d); uncommitted until reviewed.
- Waiting on the user:
  - **Audio:** J-19 shipped; next audio jobs J-20 (continuous theme + Humanity-style tempo), J-21 (audio plumbing), J-22 (more music contexts and feedback sounds) await approval. Demo: https://pjdoranbrown.github.io/Dust-Cloaks/audits/audio-demo.html
  - **Jobs J-01…J-13** (new-player start, Reeve's Hall Day 1, planning-table sticky bar, HUD scaling, health rows, squad spacing, save backups, game feel, visual polish, mid-size story, portrait strip, plain tooltips, bible fill).
- Shipped this run: Index 81–82 bugs, 83 UX, 84 graphics, 85/85b-d story, 86 balance; decisions D-01…D-10 (see bible).

## History in brief (what this chat did, so it isn't lost)
- Set up Git/GitHub (Pjdoranbrown/Dust-Cloaks), moved image data to `assets/*.js`, then Index 76–80 (3D props, baked terrain, tavern, build-anywhere + construction + builders, Scribe's ledger, move/demolish, camp keys, sharp high-DPI text, draw guards).
- Ran a five-auditor Sonnet team (bugs, story, balance, UX, graphics), then a sixth (sound). Reports in `audits/`.
- A Gemini playtest report ("Dust Cloaks — Beta Test & Polish Report") was pasted in by the user (the Google Doc at `G:\My Drive\…gdoc` can't be read locally: Google Docs are placeholders). It was sliced per role into `audits/leads/*.md`; several of its claims were out of date (verify Gemini claims before acting). Its co-op multiplayer design (§8) is parked (D-09).
- Things declined or deferred: D-03 small rule fixes; facility upgrades as gold sinks (too heavy); GFX-18/20 (not real problems); full cold-open rewrite (only v1 built).

## Rules and environment quirks
- Commit messages end with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`; PR bodies end with `🤖 Generated with [Claude Code](https://claude.com/claude-code)`.
- Commit only reviewed, tested work; never commit a delegate's unreviewed changes. Don't commit if a delegate is mid-edit on `index.html`.
- The local server dies between sessions: restart `.claude/serve.ps1` (background) before browser testing.
- Hidden browser pane → `innerWidth` 0: `resize_window` to 1280x800 before sweeps, `preset: desktop` after. Its timers are throttled; long scripts time out at 45s, so use `AUD.run` and poll.
- Shells: PowerShell 5.1 (no `&&`); Git Bash also available. Node is not installed. Git at `C:\Program Files\Git\cmd\git.exe`.
- Test browser saves (e.g. "Godfrey") are test data in the pane, not the user's campaign. Delegates back up and restore saves when testing.
- `CLAUDE.md` and `game-bible.md` were created by the user (via another tool) and are now part of the system.

## User preferences
- Plain, non-technical summaries; leads with the outcome. Australian English is fine (the game uses it).
- Wants iteration via GitHub (commits per change), not new HTML files.
- Likes decisions put as short multiple-choice questions with a recommended option first (2–4 per round).
- Bugs: fix as found. Improvements: ask first; once approved, delegate to Sonnet if confident without re-asking.
- Uses Gemini for outside playtests; feed findings to the right delegate, verify first.
- Watches usage limits: keep delegates focused; a usage-limit stop leaves delegates idle (resume them by SendMessage with their id).
- Audio taste: Humanity-style synth tempo that follows game speed; mellow lute and hand drums in town, not synth pipes; the same theme builds into contracts.

## Recently fixed from user testing (2026-11-06) — user confirmed both fixed
- Music cut at effects: cause measured at contract end (fade/restart) → fixed by J-20; if the user still hears cuts, J-21's single shared AudioContext is the next step.
- Palisade gates: missing only with the 3D world off (or the Pixel sprite look) → fixed in Index 88; not reproducible with 3D on — ask the user which look they use if it recurs.
- Fixed build plots for palisade and watchtowers (J-23, Index 88; extend via FIXED_SITE).

## Round 2 build (dispatched 2026-11-06)
- All jobs J-01…J-13 approved and in progress, split by file: ux → `js/ux.js` (J-03, 04, 05, 07, 11, 12); graphics → `js/graphics.js` (J-06, 08, 09); balancer → `js/balance.js` (J-01); story → `js/story.js` (J-02, J-10); bug-finder → `game-bible.md` (J-13); sound → `js/audio.js` (J-21, J-22).
- Next: as each reports, review + muted regression + commit. When all are in, send every delegate a re-audit of its specialty on the new build (write `audits/<role>-r2.md`), then triage.
- Round 2 COMPLETE: J-01…J-13 and J-19…J-23 all shipped (round-2 code committed after the usage-limit pause; full muted regression clean). Next: re-audit round — each delegate writes `audits/<role>-r2.md` on the new build.
- Re-audit round 2 DONE: all six reports are in, at `audits/<role>-r2.md`.
- R2 fixes IN FLIGHT (2026-11-07). Each delegate edits only its own file, in a new sub-section, and logs its fixes under "Fixed" in its r2 report:
  - bug finder: R2-01 (old prologue saves), R2-03 (the debrief +gp figure) and STORY2-05 (Orsolt standing), in `index.html` Index 89. It also switches `audit.js` to mute through the master gains (AUD2-B5).
  - UX: R2-02…08 plus the Large-text HUD bug, in `ux.js` 83c.
  - Graphics: GFX2-R1…R3 plus the builder-label wording, in 84c.
  - Story: STORY2-01…04 and 06…10 plus the `campNote` kind argument, in 85g.
  - Balance: BAL2-01 (Elven Mail) and BAL2-02 (the prologue kit charge), in 86c. Any number changes need user sign-off.
  - Audio: AUD2-B1…B4 and B6, in 87e.
  - ALL DONE and committed 2026-11-07 (Elven Mail AC 6 approved; GFX2-R3 was by design: in the bar fight mates chase brawlers). Muted regression: camp + 3 contracts, no errors.
  - audit.js now mutes with a gain node after Index 87's limiter (settings untouched); `AUD.unmute()` undoes it.
  - Round 2 proposals are in backlog.md as bundles A–G, waiting for the user's OK.
  - Next (old note): put the r2 proposals in the backlog and ask the user.
