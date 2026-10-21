# Architecture

- `index.html` loads `styles.css`, `enhancements.css`, then the modules `app-v2.js` and `ui-assistance.js`.
- `core.js` holds the analysis logic that `tests/core.test.mjs` exercises.
- Design and implementation notes are in `docs/superpowers/specs/` and `docs/superpowers/plans/`.
- Data stays on the device. There is no account system or upload path.
