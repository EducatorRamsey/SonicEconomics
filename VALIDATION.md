# Validation · October 21, 2026

Tested in this cloud workspace using Node 24.19.0, npm 11.9.0, and installed Chromium 154.0.8037.57.

- `npm ci --cache /tmp/rr-npm-cache`: passed from the committed-format lockfile, replacing installed dependencies.
- `npm run build`: passed TypeScript checking and Vite production compilation. Vite reports a bundle-size warning for the Phaser game bundle (approximately 1.24 MB uncompressed / 344 KB gzip); this is a warning, not a failed build.
- `npm test`: **12 passed**, no failed or skipped cases, in 3.2 minutes. Six browser tests each ran at 1440 × 1000 and 1366 × 768.
- Production `vite preview` browser smoke check: title/start, ordinary keyboard movement, token collection, and pause passed; no uncaught JavaScript errors or HTTP asset failures.
- Chromebook visual review: title panel fits without internal overflow, and the game plus touch controls fit within the 768-pixel screen height. Menus with longer content scroll inside their panel.
- `git diff --check`: passed.

## Browser test coverage

1. Movement, jumping, ground/platform collisions, tokens, pause, and pointer-operated movement buttons.
2. All three questions: stopped hazards and timers, incorrect feedback, retries, complete narration text, Listen/Replay/Stop controls, one-time shield rewards, settings return without duplicate rewards, and completion summary.
3. Six-token initial shop budget, unaffordable second purchase, purchasing both upgrades after earning more tokens, actual higher-jump velocity, shield absorption, and frozen boost time in menus.
4. Heart loss, invulnerability, restoring hearts at a checkpoint, falling/recovery, local save/reload/Continue, comfort settings persistence, and resetting progress while preserving settings.
5. Keyboard title/start and pause/resume, loaded assets, and no failed asset responses.
6. The entire trail at gentle speed using ordinary keyboard movement, with no teleporting or diagnostic state changes beyond selecting gentle speed. All three questions and the finish are reachable without jumping.

Targeted tests opt into `?test=1` to place the player near interactions, inspect simulation state, and expire invulnerability for focused recovery checks. The full-trail test covers real traversal separately. Diagnostics are absent from the ordinary player flow.

## Not verified or published

- Actual audible speech and voice quality on the student's device. Tests spy on speech synthesis to verify the entire question and every answer, without requiring an installed voice. Browser/OS voice support varies.
- Audible music/effect quality on physical speakers, physical touch hardware, browsers other than Chromium, and performance on an actual Chromebook. Pointer controls and Chromebook viewport geometry were tested in Chromium.
- GitHub Actions execution or GitHub Pages deployment. Workflows and teacher instructions are supplied; publication is manual.
- A pull request: GitHub API access returned `Forbidden`. A later Git push dry run confirmed write access through the Git proxy; the deployment fix is delivered through Git rather than the API.
- Publication/restoration of the cloud environment in a new task. Reusable `install_script` and `start_skill` fields were saved as a configuration draft. Review/save and publish in environment settings to activate the updated environment.

An early Playwright-managed browser download was blocked by the network. All reported tests instead ran successfully against the existing `/usr/bin/chromium`; no verification protections were disabled for dependency installation.

## Deployment follow-up

The reported public page displayed the initial README because the game had not been pushed to GitHub. A self-contained generated root `index.html` and `.nojekyll` now support the existing branch-based Pages site without a build service or extra assets. Development uses `app/index.html` and the existing `src/` modules; `npm run build:single` reproduces the standalone artifact.

After this change, the production build and six desktop/Chromebook regression cases passed (movement/collisions, all questions and narration controls, keyboard menus/assets). A browser test also served the exact deployment artifact at the site's URL path using local request interception, started the game, moved the player, answered all three questions, and reached the ending. It required only the HTML request, with no uncaught errors or other file requests. This checks the artifact, not the live GitHub Pages deployment.

Live site checks from this workspace are blocked by the network proxy for educatorramsey.github.io, so deployment propagation must be confirmed by refreshing the public website.
