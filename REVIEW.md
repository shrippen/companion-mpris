# Review guide

Every PR is reviewed before it is merged (`RULES.md`). The reviewer knows nothing of the
session that wrote the change: it gets the PR's intent, its diff, the repository and this
file. The owner does not read code; this review is the second reader.

## What failure looks like here

Companion MPRIS lets Stream Deck buttons control the media players on this Linux machine over
D-Bus. A bug that matters is one the user notices on stage or at the desk:

- **Wrong player:** "Auto" picks a paused or stopped player while another one plays, a button
  set to a specific player that is running sends its command to another, a player that
  closed stays addressed, a player with an odd bus name is missing from the dropdown.
- **Wrong state:** a button lit as playing while the player is paused, a variable that keeps
  the last title after the player closed, an artist list (array) shown as `[object]` or not
  at all, a missing metadata key throwing instead of showing an empty text.
- **Stale buttons:** the state changes and `players-changed` does not refresh the actions,
  feedbacks or variables, so a button shows what was true two seconds ago.
- **Dead module:** a D-Bus error, a player that vanishes mid-call or a missing session bus
  address that rejects, crashes the module or leaves it "OK" while nothing works. Poll or
  timer left running after `destroy()`.
- **Broken package:** the demo in the `.tgz`, the D-Bus library bundled into `main.js`, a
  manifest that does not match `package.json`.
- **Lies:** `README.md`, `CHANGELOG.md`, `docs/index.html` or comments the code contradicts.

## What to check in particular

- Layers: as in `ARCHITECTURE.md`. Only `src/mpris.js` knows D-Bus and MPRIS names; `src/`
  never imports `demo/`.
- A new command, value or feedback touches every place the "Where new things go" table in
  `ARCHITECTURE.md` lists, including `demo/fakeMpris.js`.
- Player choice goes through `resolveBusName`: no second copy of the "Auto" rule.
- A change to `src/mpris.js` that the demo replaces (`demo/patch.js`) still fits it.
- There are no tests (`npm test` prints "no tests"): reason through the player-choice and
  metadata paths for every case above and name the input that breaks.
- GUI rule: the landing page `docs/index.html` uses Kante as it is, no own colours, fonts or
  sizes.
- Bug fixes: a test that failed before the fix, and the cause removed.

## What the owner confirms here

- A release (`RELEASE.md`) or a change to `.github/workflows/release.yml`.

## Skip

- `demo/world.cjs` (generated), images in `docs/`, `tools/structure-check.py` and
  `scripts/release-notes.sh` (synced copies); style and formatting.
- `package-lock.json`, except a dependency that was added or raised.

## How to report

- Every finding names file and line and the concrete input or state that goes wrong.
  No guess without evidence; if unsure, say so.
- Each finding gets one label: **Wichtig** (must be fixed or answered before the merge),
  **Kleinigkeit** (optional, at most five) or **Bestand** (was there before this PR; not
  blocking).
- The report starts with the count, e.g. "2 Wichtig, 1 Kleinigkeit, 0 Bestand" (the session
  puts the heading above it). The count of **Wichtig** holds every one still open, also from
  an earlier round, e.g. "1 Wichtig (offen aus Runde 1)". Only when none is open it says
  plainly: "Nichts zu beheben."
- In a later round: say for each open **Wichtig** of the last round whether it is fixed, or
  whether its answer is accepted, with the reason (skill `pr-review`).
- Findings in German, code names as they are.
