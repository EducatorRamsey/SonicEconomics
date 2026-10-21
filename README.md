# Roadrunner Rush · Three Trails v3

An original New Mexico platformer built with Phaser 3, TypeScript, and Vite. Run six upside-down loops, visit enterable stores, and practice scarcity, opportunity cost, and trade-offs. This repository is separate from Butterfly Effect.

## Play

On the published site, choose **New game** for a fresh three-level adventure or **Continue adventure** to resume your saved checkpoint. The header/footer show **Three Trails v3**.

- **Move:** arrows or A / D. **Jump:** Space, W, or Up. Labeled touch buttons work too.
- **Full screen:** the toolbar or title-menu button; **F** toggles and **Esc** exits. If native fullscreen is unavailable, the game fills the browser window. All menus, store controls, and questions remain inside the full-screen game.
- **Pause:** toolbar button or Esc when not already in fullscreen. Settings are available during play and inside the store.
- Hold a direction to build momentum and run around loops. Press the opposite direction to brake or jump off the loop. A speed assist keeps loops forgiving. **Run the loop tracks** can be turned off to use the ground route.

## Three levels

| Level                | Main obstacles                        | What changes                                                                     |
| -------------------- | ------------------------------------- | -------------------------------------------------------------------------------- |
| 1 · Sunstone Flats   | Slow tumbleweeds                      | Safe practice area, broad paths, two loops, and a store before the first hazard. |
| 2 · Copper Mesa      | Faster rolling boulders               | Wider moving hazards and stepped ledges with optional higher routes.             |
| 3 · Windbreak Canyon | Timed wind columns and moving bridges | Read the wind warnings, jump active gusts, and cross the moving bridge sections. |

Each level has two loops, a store, a midpoint recovery checkpoint, and **one mandatory economics question at the finish**. Questions do not appear in the middle of a level. The next level stays locked until the question is answered correctly and the player selects **Continue**, then **Start level 2/3**. The completion card explains the next obstacles. The final question leads to the ending screen.

Questions pause hazards, moving bridges, the challenge timer, and jump-boost duration. There is no answer deadline. An incorrect answer gives a short explanation and another try, without taking hearts or tokens. A correct answer gives one shield, only once—even after reloading or visiting Settings.

## Enter the stores

Approach the adobe **Sunstone Supply** building in any level. Click **Enter store** or press **E**. The roadrunner enters a separate, walkable room with shelves, a counter, a tortoise shopkeeper, and an exit door.

- Walk to the counter and press **E**, or click **Browse upgrades**.
- A **shield costs 6 tokens** and absorbs one hazard hit.
- **Spring step costs 4 tokens** and gives 25 seconds of higher jumps during outdoor play. Time does not expire inside the store, menus, or questions.
- Compare effects before purchasing, or save tokens. Six tokens are available before the first store in a fresh game, so the player cannot initially buy both upgrades.
- **Back to the store** closes the inventory. Walk to the door and press E, or click **Leave store**, to return outside.
- The room supports keyboard and touch movement, pause, Settings, and full screen. Store visits are optional; neither upgrade is required to finish.

## Comfort, difficulty, and progress

Relaxed mode is the default: no countdown and no game-over screen. It includes safety paths under the moving bridges. Challenge mode shows elapsed active outdoor play time and opens the bridge gaps. Choose the mode before starting a level; bridge safety paths use the mode selected at level entry. All bridge gaps are short enough for a normal jump, and falling returns to the saved checkpoint.

Settings also include gentle/cruising/quick running speed, loop traversal on/off, reduced motion, separate sound/music volumes and mute, narration speed, and alternative movement keys. Music starts muted. Reduced motion removes camera easing and decorative hazard rotation; essential loop orientation remains unless loop traversal is turned off. No flashing effects or camera shakes are used.

Start with three hearts. Hazards cost one heart or one shield and give brief, steady translucent invulnerability. Running out of hearts restores three at the checkpoint, preserving tokens and answers. Each new level also starts with three hearts. Coins, purchased upgrades, and remaining boost time carry forward.

**Listen / Replay / Stop** on each question use optional browser narration of the entire question and every answer. Text remains visible without a voice. Browser/OS voice availability varies; try narration on the student's actual device. This application does not send question text or personal information to an external API; browser-provided voices follow browser/OS settings.

Settings and campaign progress save locally in the browser. Reloading at a pending question restores that checkpoint; a saved correct answer does not unlock the next level until Continue is selected. The next-level card is saved too. New Game resets campaign progress but keeps comfort settings. Old continuous-trail saves start the new three-level campaign while preserving earned currency, upgrades, hearts, and comfort settings. The optional ending reflection is not saved.

No accounts, database, analytics, external fonts, or external APIs are needed. Clearing browser data or changing browser/device can remove the local save.

## Preview and develop

Install Node.js 22.12+ (Node 24 recommended). From this repository folder:

```sh
npm ci
npm run dev
```

Open the address Vite prints. In the cloud workspace, use `npm ci --cache /tmp/rr-npm-cache` if the default cache is not writable. Use the existing checkout; no separate worktree is needed.

```sh
npm run build
npm run preview
```

The editable development entry is `app/index.html`, with application source in `src/`. The root `index.html` is a generated self-contained release for branch-based GitHub Pages; edit the source files, not that generated bundle.

## Edit questions and difficulty

Edit `src/questions.ts`: `prompt`, `answers`, `correct` (an answer index starting at **0**), and `explanation`. Keep three IDs: `0`, `1`, `2`, one for each level. Narration automatically includes every edited answer. Keep wording concrete; name the next-best alternative explicitly for opportunity cost. Scarcity means limited resources compared with wants and needs, not simply lack of money.

Level boundaries, store positions, midpoint checkpoints, loops, gaps, and hazard types are in `src/course.ts`. Scenery and fixed collision geometry are in `src/level.ts`; moving hazards, bridges, gate enforcement, recovery, and stage transitions are in `src/game.ts`. Movement tuning is in `src/player.ts`, and loop surface movement is in `src/loops.ts`. Change default comfort settings in `src/state.ts`; existing saved settings take precedence.

## Test

```sh
npm run build
npm test
```

This cloud environment uses Chromium at `/usr/bin/chromium`. Else install Playwright's browser and use it:

```sh
npx playwright install chromium
PLAYWRIGHT_USE_BUNDLED=1 npm test
```

On PowerShell: `$env:PLAYWRIGHT_USE_BUNDLED="1"; npm test`. `CHROMIUM_PATH` can select another installed Chromium executable. CI installs the bundled browser with system dependencies.

Playwright tests desktop (1440 × 1000) and Chromebook (1366 × 768) viewports. Coverage includes the actual store room/counter/exit, purchases and effects, all mandatory questions and transition locks, narration/retries/rewards, paused hazards/timers/bridges, saves and reloads at an answered checkpoint, old-save migration, hearts/recovery, motion settings, loops, gust timing, moving-platform carry, challenge-gap jumps, full-screen/fallback controls, and normal input.

The full-campaign test uses ordinary gentle-speed movement and jumps through all three levels and six loops, with no teleportation. Focused interaction tests use opt-in `?test=1` diagnostics to place the player near a target; these are absent from ordinary play. Speech tests inspect complete utterances, not audible voice quality. Physical touch hardware and actual Chromebook performance require a device check. See `VALIDATION.md` for recorded outcomes.

## Publish with GitHub Pages

The **Publish Roadrunner Rush** workflow builds and deploys on pushes to `main` when repository **Settings → Pages → Source** is **GitHub Actions**. It can also be run manually from **Actions → Publish Roadrunner Rush → Run workflow**. Wait for the deployment's green checkmark before checking the public site.

The existing branch-based site is supported too. Regenerate its self-contained HTML after source edits:

```sh
npm run build:single
cp dist/Roadrunner-Rush.html index.html
```

Commit/push the generated root `index.html` with the source changes. `.nojekyll` makes it directly servable. The single-file output can also be downloaded and opened in a personal browser; this managed browser blocks file-URL navigation, so artifact checks here use an HTTP-served copy.

## Source and original art

`src/store.ts` draws and runs the walkable store interior. `src/main.ts` and `src/style.css` provide accessible HTML menus and the purchasing interface. `src/economics.ts` holds answer/reward rules; `src/audio.ts` generates quiet original cues and an eight-note ambient motif; `src/fullscreen.ts` manages native/full-window expansion.

All art is original local procedural/vector artwork, including the animated turquoise roadrunner, tortoise shopkeeper, adobe stores, and desert tracks. New Mexico vegetation uses prickly pear and flowering yucca, with no saguaros. No Sonic characters, branding, assets, music, or levels are used. No temporary licensed art or remote asset services are required.
