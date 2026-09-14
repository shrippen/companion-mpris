# Companion MPRIS Module

Steuert MPRIS-fähige Mediaplayer unter Linux (Spotify, VLC, Firefox, Chrome, rhythmbox, Feishin, ...)
über D-Bus aus [Bitfocus Companion](https://bitfocus.io/companion) heraus. Benötigt kein `playerctl` -
die Kommunikation läuft direkt über [`dbus-next`](https://www.npmjs.com/package/dbus-next) (reines JS).

## Aktionen

- **Play/Pause** – toggelt Wiedergabe
- **Play**
- **Pause**
- **Stop**
- **Next track**
- **Previous track**

Jede Aktion hat ein "Player"-Dropdown. Standardmäßig steht es auf **Auto**, das
automatisch den aktuell spielenden Player wählt (oder den ersten gefundenen,
falls keiner spielt). Alternativ kann ein bestimmter Player ausgewählt werden,
z. B. wenn mehrere Player gleichzeitig laufen (Spotify + Browser-Tab etc.).

## Feedback

- **Playback status** – färbt den Button ein, wenn der gewählte Player einen
  bestimmten Status hat (Playing / Paused / Stopped).

## Variablen

- `player_name` – Name des aktuell aktiven Players
- `playback_status` – Playing / Paused / Stopped
- `track_title`, `track_artist`, `track_album`

## Presets

Das Modul liefert fertige Presets unter der Kategorie **"MPRIS Transport Controls"**:
Play/Pause (mit Live-Feedback), Previous, Next, Stop, Play, Pause. Einfach im
Presets-Tab der Connection per Drag & Drop auf einen Button ziehen.

## Installation als Companion-Modul (lokale Entwicklung)

Companion lädt Module aus einem selbst konfigurierten "Developer modules"-Ordner;
jedes direkte Unterverzeichnis davon wird als eigenständiges Modul erkannt.

1. Repo in einen Unterordner eines Development-Ordners klonen, z. B.
   `~/companion-dev/mpris` (der Ordnername `mpris` ist frei wählbar, wichtig ist
   nur, dass das Repo selbst eine Ebene unterhalb des Dev-Ordners liegt).
2. `npm install` im Modulordner ausführen (installiert `@companion-module/base`
   und `dbus-next`).
3. Companion Launcher öffnen → Zahnrad (Einstellungen) → **Developer modules
   path** auf den Development-Ordner (den Elternordner, nicht den Modulordner
   selbst) setzen.
4. Companion neu starten.
5. Unter **Connections → Add connection** nach "MPRIS" suchen und hinzufügen –
   es ist keine Konfiguration nötig.

Mehr Details: [Companion Docs – Setting up a Dev Folder](https://user.bitfocus.io/docs/companion/module-development).

## Voraussetzungen

- Linux mit laufendem D-Bus Session Bus (Standard bei jeder Desktop-Session).
- Ein oder mehrere MPRIS-fähige Player müssen laufen (z. B. Spotify, VLC).
- Node.js 22+ (wird von Companion selbst mitgebracht, für lokale Tests separat
  installieren).

### Hinweis zur D-Bus-Adresse

Companion startet den Modul-Prozess mit einer stark eingeschränkten Umgebung
(ohne `DISPLAY`/`DBUS_SESSION_BUS_ADDRESS`). Das Modul fällt in diesem Fall
automatisch auf `unix:path=$XDG_RUNTIME_DIR/bus` zurück (den Standardpfad des
Session-Bus unter systemd/logind), das sollte auf den allermeisten Linux-Desktops
funktionieren.

## Debugging außerhalb von Companion

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

## Projektstruktur

```
companion/manifest.json   Modul-Manifest (Metadaten, Entrypoint)
main.js                   Entrypoint, re-exportiert die Instanzklasse (ESM default export)
src/index.js              InstanceBase-Subklasse (Lifecycle: init/destroy/configUpdated)
src/mpris.js              D-Bus/MPRIS-Kommunikation (Player-Erkennung, Steuerbefehle)
src/actions.js            Action-Definitionen (Play/Pause/Next/Previous/...)
src/feedbacks.js          Feedback-Definitionen (Playback-Status)
src/variables.js          Variablen-Definitionen und -Werte
src/presets.js            Fertige Button-Presets
src/choices.js            Gemeinsame Player-Dropdown-Choices
```
