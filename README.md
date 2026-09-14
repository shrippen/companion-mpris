# Companion MPRIS Module

Controls MPRIS-capable media players on Linux (Spotify, VLC, Firefox, Chrome, rhythmbox, Feishin, ...)
from [Bitfocus Companion](https://bitfocus.io/companion) over D-Bus. No `playerctl` binary required -
it talks to MPRIS directly via [`dbus-next`](https://www.npmjs.com/package/dbus-next) (pure JS).

## Actions

- **Play/Pause** - toggles playback
- **Play**
- **Pause**
- **Stop**
- **Next track**
- **Previous track**

Every action has a "Player" dropdown. It defaults to **Auto**, which picks the
currently playing player automatically (or the first one found, if none is
playing). You can also target a specific player, e.g. when several are running
at once (Spotify + a browser tab, etc.).

## Feedback

- **Playback status** - colors the button based on whether the selected player
  is in a given state (Playing / Paused / Stopped).

## Variables

- `player_name` - name of the currently active player
- `playback_status` - Playing / Paused / Stopped
- `track_title`, `track_artist`, `track_album`

## Presets

The module ships ready-made presets under the **"MPRIS Transport Controls"**
category: Play/Pause (with live feedback), Previous, Next, Stop, Play, Pause.
Drag them onto a button from the connection's Presets tab.

## Installation

### Option A: Install a packaged release

1. Download the `.tgz` file from the [Releases](../../releases) page.
2. In Companion, go to **Settings → Modules → Import module package** and
   select the downloaded file.
3. Under **Connections → Add connection**, search for "MPRIS" and add it - no
   configuration required.

### Option B: Run from source (development)

Companion loads modules from a self-configured "Developer modules" folder;
every direct subdirectory of it is treated as its own module.

1. Clone this repo into a subfolder of a development folder, e.g.
   `~/companion-dev/mpris` (the folder name is up to you, what matters is that
   the repo itself sits one level below the dev folder).
2. Run `npm install` inside the module folder (installs `@companion-module/base`
   and `dbus-next`).
3. Open the Companion launcher → gear icon (Settings) → set **Developer
   modules path** to the development folder (the parent folder, not the module
   folder itself).
4. Restart Companion.
5. Under **Connections → Add connection**, search for "MPRIS" and add it.

More details: [Companion Docs - Setting up a Dev Folder](https://user.bitfocus.io/docs/companion/module-development).

## Requirements

- Linux with a running D-Bus session bus (standard on any desktop session).
- One or more MPRIS-capable players running (e.g. Spotify, VLC).
- Node.js 22+ (bundled with Companion itself; install separately for local
  testing/building).

### A note on the D-Bus address

Companion starts the module process with a heavily restricted environment (no
`DISPLAY`/`DBUS_SESSION_BUS_ADDRESS`). The module automatically falls back to
`unix:path=$XDG_RUNTIME_DIR/bus` in that case (the standard session bus path
under systemd/logind), which should work on most Linux desktops.

## Debugging outside of Companion

```bash
npm install
node -e "
import('./src/mpris.js').then(async ({ MprisManager }) => {
  const m = new MprisManager(console.log)
  await m.connect()
  setTimeout(() => console.log(m.listPlayers()), 1000)
})
"
```

## Project structure

```
companion/manifest.json   Module manifest (metadata, entrypoint)
main.js                   Entrypoint, re-exports the instance class (ESM default export)
src/index.js              InstanceBase subclass (lifecycle: init/destroy/configUpdated)
src/mpris.js              D-Bus/MPRIS communication (player discovery, transport commands)
src/actions.js            Action definitions (Play/Pause/Next/Previous/...)
src/feedbacks.js          Feedback definitions (playback status)
src/variables.js          Variable definitions and values
src/presets.js            Ready-made button presets
src/choices.js            Shared player dropdown choices
```

## Releasing a new version

This project uses [`@companion-module/tools`](https://github.com/bitfocus/companion-module-base/wiki/Module-packaging)
to build a distributable package:

1. Bump the `version` field in `package.json` (semver: `major.minor.patch`).
2. Run `npm run package`. This produces `pkg/` and a
   `companion-module-generic-mpris-<version>.tgz` archive in the project root -
   this file is what gets attached to a GitHub release and is what users import
   via **Import module package** in Companion.
3. Tag the commit: `git tag v<version>` and `git push --tags`.
4. Create a GitHub release for the tag and attach the `.tgz` file.
