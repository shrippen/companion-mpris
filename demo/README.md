# Demo (internal)

Internal tool for screenshots, never part of the packaged module (`npm run package` checks that).
Uses the shared demo world of all shrippen projects (shrippen.github.io/demo).

`demo/main.js` is a second entry point: it swaps the MPRIS manager's behaviour for two made-up
players (`demo/patch.js`, `demo/fakeMpris.js`), then starts the module as usual. Elisa plays and VLC
is paused, both with the score of Studio Weber (`demo/world.cjs`, generated from
`shrippen.github.io/demo`; do not edit it here). Play, pause, next and previous work, so buttons,
feedbacks and variables can be shown without a media player. For a screenshot, point a Companion
dev module at `demo/main.js` (the manifest entrypoint stays `../main.js`).
