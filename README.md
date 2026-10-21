# Roadrunner Rush

A playable, original desert platformer for practicing **scarcity, opportunity cost, and trade-offs**. Built with Phaser 3, TypeScript, and Vite in SonicEconomics. This project does not use or modify Butterfly Effect.

## Preview the game

Install Node.js 22.12+ (Node 24 recommended), then open a terminal in this folder:

```sh
npm ci
npm run dev
```

Open the address Vite prints in a browser. To check the published version locally:

```sh
npm run build
npm run preview
```

In this cloud workspace, use `npm ci --cache /tmp/rr-npm-cache` if the default npm cache is not writable. The game uses no accounts, backend, remote fonts, analytics, or external APIs. All art and sound ship locally or are generated in the browser.

## Playing and adjusting comfort

- **Full screen:** click **Play in full screen** on the title menu or **Full screen** in the game toolbar. Press **F** to toggle it and **Esc** to exit. The game expands to fit the available screen while keeping touch controls, settings, and questions visible. If the browser blocks native fullscreen, the same button fills the browser window instead.

- **Move:** arrow keys or A / D. **Jump:** Space, W, or Up. Large labeled touch buttons are below the game.
- **Loop Trail v2:** six large surface-running loops, faster acceleration, coasting momentum, and active braking. Keep holding your direction to run around the walls and upside down. Press the opposite direction to brake, or jump off the track. A forgiving speed assist keeps the loop approachable at gentle speed. The camera stays upright. Turn off **Run the loop tracks** in Settings to use the ground route instead.
- Practice in the safe starting area. Travel right; there are no mandatory precision jumps. Low platforms and extra high tokens are optional. The ravine has a safe bridge.
- **Questions never open automatically.** The three optional rest stops are spread across a much longer trail (6,500, 14,200, and 21,800 pixels). Use the rest-stop button or E to practice; keep running to skip it. After the finish, **Practice the remaining questions** lets you do them together. Opening a question pauses movement, tumbleweeds, boost duration, and elapsed time. There is no answer deadline. Try again as often as needed; earned hearts and tokens are never taken for an answer. A correct answer gives one shield. Select **Continue** when ready.
- At the adobe village after the first optional rest stop, use **Visit trail shop** (or E). Six tokens are available before the shop, so you cannot initially buy both upgrades. A shield costs 6 and absorbs one hit; a boost costs 4 and raises jumps for 25 seconds of active play. Save tokens or return with more later. Neither purchase is required.
- Use **Settings** at any time: gentle/cruising/quick running, relaxed/challenge mode, separate music/effects volume, mute, reduced motion, narration speed, and alternative movement keys. Arrow keys and default jump keys remain available. Reduced motion disables decorative tumbleweed rotation and camera easing. There are no flashes or camera shakes in either mode.
- **Escape** pauses/resumes; menus also work with Tab, Shift+Tab, Enter, and Space. Questions have keyboard-focusable answers, Listen/Replay/Stop, and no timer. Narration reads the full question and every answer. Browser/OS voice availability varies; all content remains visible without narration. No voice or other information is sent by this application; browser-provided voices follow the browser/OS settings.
- Start with three hearts. A bump gives two seconds of protection (shown by a steady translucent character, never flashing). Shields absorb hits first. With zero hearts, all three return at the safe checkpoint, preserving tokens and answers. Falls return there too. Relaxed mode has no countdown and no game over. Challenge mode shows elapsed active play time, without ranking learning or imposing a deadline.
- Settings and progress save in this browser on this device. **Continue adventure** returns to the latest economics checkpoint. Collected tokens, purchases, answers, help used, and power-ups persist. **New game / Restart** resets progress while keeping settings. Pausing and returning to the title also saves. The optional ending reflection is not saved. Private browsing, cleared site data, or changing device/browser may remove the save.

## Edit questions

Open [`src/questions.ts`](src/questions.ts). Each question has a `prompt`, `answers`, `correct` (answer index starting at **0**), and `explanation`. Keep the three IDs `0`, `1`, and `2`. Short concrete wording works best. For opportunity cost, name the next-best alternative explicitly. Scarcity means limited resources compared with wants and needs, not simply a lack of money. Listen/Replay automatically includes every answer after edits.

The course has three optional question stops. Adding or removing stops also requires updating `checkpoints` in `src/course.ts`, safe checkpoint spacing in `src/main.ts`, and the ending review flow in `src/main.ts`. Finishing does not require answering questions.

## Adjust difficulty

Prefer the in-game Settings menu; changes are immediate on return and persist. For new default settings, edit `defaults` in `src/state.ts`. Existing saved settings take precedence. To change jump height/acceleration, edit `src/player.ts`; obstacle locations and level geometry are in `src/level.ts`. Keep the first 850 pixels safe, question approaches easy, and shop upgrades optional. Physics, hazards, and progress are separate from question content and HTML menus.

## Test

```sh
npm run build
# In this cloud environment, Chromium is already at /usr/bin/chromium:
npm test
# Else install Playwright's browser, then use it:
npx playwright install chromium
PLAYWRIGHT_USE_BUNDLED=1 npm test
```

On Windows PowerShell, use `$env:PLAYWRIGHT_USE_BUNDLED="1"; npm test`. Alternatively set `CHROMIUM_PATH` to an installed Chromium executable. CI installs Playwright Chromium with system dependencies.

Playwright runs the real game at desktop (1440 × 1000) and Chromebook (1366 × 768) sizes. It checks keyboard/touch movement, jumping, platforms, collecting and spending, both working upgrades, all question gates, timers/hazards paused, retries, duplicate reward protection, hearts/invulnerability, falls, saves/reloading, settings/restart, menus, and ending. Targeted cases use opt-in `?test=1` diagnostics to place the player near interactions and exercise specific state transitions. A separate full-trail test uses ordinary movement at gentle speed with no teleportation, completes all six loops without question interruptions, and then practices all three questions after the finish. Speech tests verify complete utterances and controls with a browser speech spy; they cannot verify the sound/quality of the installed voice. Try narration on the student's actual device.

## Current GitHub Pages site

The repository root `index.html` is a complete, self-contained game for the existing branch-based Pages site. `.nojekyll` ensures it is served directly. The development entry is `app/index.html`; keep editing TypeScript in `src/`, not the generated root HTML.

To refresh the branch-based site after source changes:

```sh
npm run build:single
cp dist/Roadrunner-Rush.html index.html
```

Commit and push `index.html` along with the source changes. The generated single-file game can also be downloaded and opened in a personal browser; this managed cloud browser blocks file-URL navigation, so validation here uses an HTTP-served copy.

## Optional: publish with GitHub Actions

1. Commit and push this project to GitHub.
2. In repository **Settings → Pages → Source**, select **GitHub Actions**.
3. In **Actions**, select **Publish Roadrunner Rush**, then **Run workflow** on your chosen branch.
4. When it finishes, open the Pages address shown by the deployment.

The included workflow publishes on pushes to `main` once Pages Source is set to GitHub Actions; it can also be run manually. Vite's relative base supports a project site under `/SonicEconomics/`. No keys or database are needed. The `dist` folder can also be hosted on any static web host; do not open `index.html` directly from the filesystem.

## Source map and original assets

- `src/player.ts`: momentum, acceleration/braking, jumping, and remapped keys.
- `src/loops.ts`: circular surface movement, inversion, assisted momentum, braking, and jumping off loops.
- `src/course.ts`: shared loop, rest-stop, shop, and finish positions.
- `src/level.ts`: safe trail geometry, locally drawn scenery, tokens, original three-frame roadrunner, and tumbleweed textures.
- `src/game.ts`: Phaser lifecycle, collisions, hearts, checkpoints, collection, paused simulation.
- `src/questions.ts`: teacher-editable economics content.
- `src/economics.ts`: answer evaluation, retry bookkeeping, and one-time rewards.
- `src/main.ts` / `src/style.css`: accessible HTML overlays, settings, shop, narration controls, ending, keyboard focus management, responsive presentation.
- `src/audio.ts`: original quiet synthesized cues and a simple original eight-note ambient motif; music starts muted.
- `src/state.ts`: local-only settings and progress.
- `public/roadrunner.svg` / `public/favicon.svg`: original vector artwork created for this game.

The New Mexico scenery uses prickly pear and flowering yucca, with mesas, mountains, and adobe buildings; there are no saguaros.

All artwork is original procedural/vector art, intentionally simple for this first release; no external or temporary licensed assets are required. The title illustration and animated game sprite depict the same turquoise bird with a swept crest, long striped tail, ivory throat, and amber beak. No Sonic characters, branding, assets, music, or levels are used.
