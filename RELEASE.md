# Release steps

In this order, from the version bump to done (paths from the repository root; this repo sits in `companion/`, so the neighbours are `../../`):

1. Version `X.Y.Z` (on a branch `release/X.Y.Z`) in `package.json`, `package-lock.json` (`npm install --package-lock-only`) and `companion/manifest.json`.
2. Release log in `CHANGELOG.md` (the single source), before the tag: a section `## [X.Y.Z] — YYYY-MM-DD` at the top with `### English` and `### Deutsch`, each a lead (what the release is about), the changes grouped as New, Improved, Fixed and Note (`####`; Neu, Verbessert, Behoben, Hinweis; breaking changes, steps the user must take) and the compare link to the previous tag (`https://github.com/shrippen/companion-mpris/compare/vA...vB`). Each point says what changed for the user and why, not which code moved. Check with `scripts/release-notes.sh --check` (there is no CI here) and read the notes with `scripts/release-notes.sh X.Y.Z`.
3. Landing page `docs/index.html`: the same text as a new entry at the top of `#changes` (Kante `.changelog`, both languages); from the fourth entry on, the oldest move into `details.changelog-more`. Bump the version in the footer. Graphics for visible changes from the demo world: the button page is a manual shot (`demo/shots.json` says how), saved as `docs/shots/release-X.Y.Z-<name>-<lang>.webp`. Screenshots are taken only now, for a tagged release.
4. PR with steps 1–3; review before the merge (no PR-Agent here: a new Claude agent reviews); the owner confirms the release in words (it publishes); merge on Gitea.
5. Tag the merge commit and push the tag to Gitea only (the mirror carries it to GitHub): `git tag -a vX.Y.Z -m "X.Y.Z" <merge commit> && git push origin vX.Y.Z`.
6. Gitea release, notes only, no files: `scripts/release-notes.sh X.Y.Z > notes.md && gt release create vX.Y.Z --repo shrippen/companion-mpris --title "Companion MPRIS X.Y.Z" --notes-file notes.md --no-input`.
7. GitHub, by hand (no release workflow yet): on the tag, `npm ci && npm run package` builds `generic-mpris-X.Y.Z.tgz` and checks that the demo is not in it (`scripts/check-package.sh`); then `gh release create vX.Y.Z generic-mpris-X.Y.Z.tgz -R shrippen/companion-mpris --title "Companion MPRIS X.Y.Z" --notes-file notes.md --verify-tag`. Check the release page shows the notes and the file (the landing page's download button opens the latest release).
8. `python3 ../../shrippen.github.io/overview/tools/build-versions.py`, then commit `docs/versions.json` in `shrippen.github.io` via a PR there.
9. No deploy or store step.
10. Done when https://shrippen.github.io/companion-mpris/ shows the release in `#changes` and the footer, and https://shrippen.github.io/versions.json has it.

The release-notes script is a copy of Kante's `tools/release-notes.sh`: change it only there, then sync with `../../Kante/tools/sync-release-notes.sh "$PWD"`.
