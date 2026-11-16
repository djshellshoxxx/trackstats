# Developer Guide

The app is static HTML, CSS and JavaScript with no build step. Serve the repository root with any static HTTP server for browser testing.

```bash
node tests/core.test.mjs
node --input-type=module --check < core.js
```

CI runs these checks in `.github/workflows/qa.yml`. `pages.yml` runs the core tests before publishing. Browser behaviour is not covered by automated tests.
