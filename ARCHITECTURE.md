# Architecture

How this repository is meant to be built. Where the code differs today is listed under
"Known deviations". Change this file in the PR that changes the structure.

## What it does

A Bitfocus Companion module for Linux: buttons on a Stream Deck control the media players
on this machine (Spotify, VLC, browsers) and show what they play. It talks to the players
over MPRIS, the D-Bus interface desktop media players share.

## Building blocks

| Path | Its one task |
|---|---|
| `main.js` | Entry point Companion loads; hands over the instance class and its upgrade scripts, holds nothing of its own. |
| `src/index.js` | The instance: starts and stops the player block, registers the definitions with Companion, refreshes them when the players change. |
| `src/mpris.js` | The player block. The only file that talks to D-Bus: finds the players, keeps their state (name, playback state, title, artist, album), picks the player for "Auto", sends the commands. |
| `src/actions.js` | What a button can do (play, pause, play/pause, stop, next, previous). |
| `src/feedbacks.js` | How a button shows the playback state. |
| `src/variables.js` | The texts a button can show (player, title, artist, album, state). |
| `src/presets.js` | Ready-made buttons built from the actions, feedbacks and variables above. |
| `src/choices.js` | What the definitions share: the list of players to choose from. |
| `companion/` | The module's description for Companion (manifest). |
| `build-config.cjs` | Setting for building the package: keeps the D-Bus library out of the bundle. |
| `demo/` | Made-up players for screenshots. Replaces the player block from outside; never in the package. |
| `docs/` | The landing page. |
| `scripts/` | Release helpers: release notes, the check that the demo is not in the package. |
| `tools/` | The structure check, a synced copy from the rules repository. |

## Layers

```
 Companion ─► main.js ─► src/index.js            demo/  (screenshots only)
                            │      │                │ swaps its behaviour
                 registers  │      │ starts, stops  │ from outside
                            ▼      ▼                ▼
   definitions: actions, feedbacks,       src/mpris.js ─► D-Bus (the players)
   variables, presets, choices ─────────►  (the player block)
                  ask it and tell it what to do
```

- Only `src/mpris.js` knows D-Bus and MPRIS names: the metadata keys, the words for the
  playback states, the names of the commands. It hands out title, artist and album as
  fields of its own, the states and the commands as named values. Every other file asks
  it for players and state and tells it what to do, in these terms.
- A command is one entry in the player block's list of commands and goes through its one
  command function; there is no function per command.
- Only `src/index.js` knows the Companion lifecycle. It creates the player block and gives
  the definitions access to it.
- The definitions use the player block and `choices.js`, never D-Bus and never each other,
  except that presets name actions, feedbacks and variables by their ids.
- Which player "Auto" means, and what happens when no player is found, is decided once,
  in the player block.
- `src/` never imports `demo/`. The demo starts the real module and swaps the player
  block's behaviour before it runs; standing in for the player block, it may use MPRIS
  names too.
- Nothing from `demo/` reaches the package; `scripts/check-package.sh` checks that.

## Where new things go

| Change | Touch |
|---|---|
| A new transport command (e.g. shuffle) | `src/mpris.js` (the list of commands), `src/actions.js`, a preset in `src/presets.js`, `demo/fakeMpris.js` |
| A new value a button can show | `src/mpris.js` (read it), `src/variables.js`, `demo/fakeMpris.js` |
| A new way a button shows state | `src/feedbacks.js`, `src/index.js` (re-check it when the players change), a preset if useful |
| A new field shared by actions and feedbacks | `src/choices.js` |
| A module setting | `src/index.js` (the config fields) |
| Another way to find or read players | `src/mpris.js` only |
| A release | See `RELEASE.md` |

## Known deviations

- The player dropdown and the "resolve the wanted player, else stopped" path are written
  more than once in the definitions instead of once in `choices.js` and the player block
  (`AUDIT.md`, finding 1).
- The word for "Auto" and the playback states are loose strings in seven files
  (`AUDIT.md`, finding 2).
- `src/variables.js` reads the MPRIS metadata keys itself; the player block passes the
  metadata on unread (not in `AUDIT.md`).
- Every command has its own forwarding function in the player block, and the actions
  call it by its name as text (`AUDIT.md`, finding 3).
- The demo depends on the inner function names of the player block and does not check that
  they still exist (`AUDIT.md`, finding 6).
- There are no tests (`AUDIT.md`, finding 7).
