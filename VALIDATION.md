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

## Loop Trail v2 · October 21, 2026

- Added six surface-running loops with inverted character orientation, gravity-dependent speed, held-direction acceleration, opposite-direction braking, jump exits, paused simulation, and a ground-route comfort toggle.
- Increased top running speed from 280 to 600 units/second with gentler coasting and active braking. Extended the course to 23,200 units.
- Question stops at 6,500 / 14,200 / 21,800 are opt-in. Full runs never open a question automatically, and finishing offers a separate review of unanswered questions. Safe progress still saves at rest stops.
- Replaced the branched saguaro silhouettes with prickly pear and flowering yucca. Visually inspected the rendered loop with the runner upside down and the revised vegetation.
- Production build and TypeScript check pass. The existing Phaser bundle-size warning remains.
- Sixteen browser scenarios verified across desktop and Chromebook configurations: the original six per viewport, updated for optional questions and the longer course, plus loop mechanics and the persisted ground-route preference.
- Both full gentle-speed traversals passed, completing all six loops without question interruptions and then answering all three questions after the finish.
- The initial full run had 15 passes and one shop-check failure caused by a diagnostic teleport into the floor. The diagnostic helper now resets the physics body, and hazard checks spawn above the ground. Eight affected movement/physics checks were rerun; after correcting the invalid spawn height, all four final shop/recovery checks passed across both sizes. Assertions and gameplay checks were retained.
- Live GitHub Pages propagation remains outside this workspace's network access. The committed root HTML and the Actions build both contain the updated course. The visible footer/header identify it as Loop Trail v2 / New Mexico Loop Trail Edition.

## Full-screen controls · October 21, 2026

- Added a Full screen / Exit full screen toolbar button, a title-menu entry, F shortcut, and Esc exit. The complete game shell enters fullscreen, keeping settings, question dialogs, pause, and touch controls inside it.
- Added a fixed viewport-filling fallback when native fullscreen is blocked/unavailable. A ResizeObserver refreshes Phaser's FIT scaling so artwork keeps its proportions while the canvas enlarges.
- Eight selected Playwright checks passed in 50.8 seconds: native and fallback fullscreen at desktop and Chromebook sizes, plus existing movement/platform/touch and keyboard-menu checks on both sizes. Tests assert canvas width increases by more than 100 pixels, wrapper matches the viewport, settings/questions remain usable, and button/F/Esc exits restore normal mode.
- TypeScript and production build pass. Existing Phaser bundle-size warning remains; no new runtime dependencies were added.

## Three Trails v3 · October 21, 2026

The continuous optional-quiz course is now three bounded levels: Sunstone Flats (slow tumbleweeds), Copper Mesa (faster boulders and stepped ledges), and Windbreak Canyon (timed wind, a boulder, and horizontally moving bridges). Each keeps two upside-down loops. Relaxed mode retains safety paths under bridge gaps; Challenge mode opens the gaps at level entry.

Each level ends at one automatic, mandatory economics gate. Physics, hazards, moving bridges, outdoor elapsed time, and boost duration pause. Wrong answers never take currency/hearts or unlock the next stage. Correct answers grant one shield once; explicit Continue saves completion, then a stage card starts the next level. All three completions are prerequisites for the ending. Pending/correct-but-uncontinued questions and stage cards survive reloads.

Each level has an enterable adobe store with a separate playable Phaser room, shelves, a counter, a shopkeeper, and a door. Tests walk to the counter and use E, buy both working upgrades over repeated visits, use Settings/pause indoors, walk back to the door and exit with E, immediately re-enter, and return outside. Outdoor timers and boosts stay paused indoors. Stores, menus, level cards, and questions remain in the existing full-screen shell.

Validation outcomes:

- TypeScript and production build pass. No additional runtime dependencies; inherited Phaser bundle-size warning remains.
- Twenty-two distinct browser scenarios verified across desktop and Chromebook sizes: four fullscreen/fallback cases and eighteen campaign cases (movement, physical store/purchases, mandatory gate/retry/narration/reward rules, pending-gate and progression saves, full campaign traversal, timed wind/platform carry/Challenge jumps, loop surface mechanics, ground-route comfort settings, old-save migration).
- Initial straight-line traversal automation stopped at the new level-two stairs. The full-campaign driver was updated to use ordinary keyboard jumps on stairs and moving bridges, preserving the actual obstacle difficulty. Both complete three-level/six-loop runs then passed in 2.6 minutes total, with no diagnostic repositioning.
- Focused bridge checks verify platform carrying, active versus calm wind collisions, and normal jumps across both open Challenge gaps. The new stair/bridge routes are reachable with normal jump physics; upgrades remain optional.
- The final strengthened indoor-store cases, including E door exit and immediate re-entry, passed on both sizes in 1.1 minutes.
- Old continuous-trail saves retain earned currency, upgrades, hearts, and comfort settings while starting the new mandatory campaign at level one.
- Reviewed the rendered store interior at Chromebook-sized fullscreen; no uncaught errors in that check.

Existing limitations remain: actual device voice/audio quality, physical touch hardware, non-Chromium browsers, and live GitHub Pages deployment propagation are not verified here. GitHub Pages checks from the workspace remain network-blocked. The release artifact and build are independently tested before the Git push.

## Moonbound v4 · October 21, 2026

Replaced the shared desert backdrop with three destination-specific scene builds: Albuquerque (Sandia Mountains, adobe buildings, balloons, Rio Grande bridge, local vegetation), Austin (skyline, lake, oaks, construction steps and barriers, fictional Austin Launch Works), and the Moon (starfield, Earth, craters, lander, habitat, meteorites and timed energy gates). Each stage is rebuilt on arrival with only its own art, terrain, pickups, hazards and camera/world bounds. Moon gravity is 650 rather than Earth's 1120; loops retain their assisted surface controls. No wind or vegetation appears on the Moon.

Currency changes from coins to electronic chips to lunar crystals, with a shared balance. Store names, interiors, counter labels, inventory, prices and effects change by destination. Austin introduces a 150-pixel collection magnet and 25% speed boots. Moon inventory provides three-hit armor and three consumable midair jump jets. Timed effects pause indoors and at all menus/questions/travel; equipment carries between stages. The Moon question now uses the lunar equipment prices.

Austin's mandatory question unlocks a rocket departure card and original vector rocket animation. The flight lands automatically or can be skipped with an accessible button. Reduced motion uses a static flight view. The saved departure card remains available after reloading during travel. Austin's launch facility is explicitly fictional; the game does not relocate NASA's Houston space center.

The campaign save version advances to 4. Earlier saves start the new journey in Albuquerque, preserving earned currency, shields, spring-step time, purchase history and comfort settings.

Initial focused desktop validation: five checks passed, including a complete gentle-speed three-stage/six-loop traversal using normal inputs, mandatory question/retry/reward rules, timed energy gates/platform carry/Challenge jumps, old-save migration, and new destination/inventory/rocket mechanics. The new equipment check verifies actual currency attraction, faster movement, paused timers, armor charges and a consumed midair jet with upward velocity, along with distinct pickup/hazard textures and active-scene labels. TypeScript and production/standalone builds pass, with the existing Phaser bundle-size advisory.

Visually reviewed all three starting areas at Chromebook resolution. A final layout adjustment keeps destination names clear of the checkpoint badges and moves notices away from the runner's ground path.

Final regression suite: **24 passed (6.7 minutes)** across desktop and Chromebook viewports, including full ordinary-input runs through all three stages, automatic rocket arrival, all six loops, both native/fallback fullscreen modes, physical store interactions, mandatory gates, saves, new equipment and lunar collision/platform physics. No failed cases. After the label/notice positioning adjustment, regenerated the standalone release and checked it separately at both viewport sizes, including fullscreen, all destination labels, lunar purchases and saved equipment after reload. Live GitHub Pages propagation remains unverified because this workspace cannot fetch the public site.

## Moonbound v5 · longer stages, scarce money and useful equipment · October 21, 2026

Stores now follow an actual introductory hazard section rather than appearing at spawn. Each is 8,200 units into its destination, after two loops and multiple hazards, with a safe storefront and most of the stage remaining. Store-ahead signs appear after those introductory hazards.

Playable distance is exactly tripled relative to v4: Albuquerque 7,020 → 21,060; Austin 6,820 → 20,460; Moon 6,620 → 19,860. Each destination now has six loops (eighteen total), more hazard encounters, and two optional elevated routes with lower approach steps. Austin includes additional construction steps. The Moon has four moving-platform gaps, retaining relaxed-mode safety paths and jumpable Challenge gaps. Austin's last barrier leaves room to land after the last loop.

All pickups use the same original gold coin texture in every world. Each stage contains exactly 16 coins: twelve introductory ground coins and four elevated-route coins. Total campaign income is capped at 48; buying every item costs 81. Store prices are 10/9 in Albuquerque, 13/14 in Austin, 18/17 on the Moon. Buying both later is possible only by saving resources instead of earlier purchases. Each item has one in stock per journey; sold-out status and collected coins persist on reload/recovery.

Trail shield now absorbs three hits; meteor armor adds five shields; jump jets provide eight midair boosts. Spring step reaches high ledges more easily, coin magnet collects within 240 pixels (including route coins from below), and speed boots add 25% running speed. These three stage movement upgrades persist until traveling to the next destination rather than expiring midway through the longer course. Careful normal jumps and lower steps provide an alternative to purchases. Existing question rewards remain single-use shields; questions still occur only at the three stage finishes.

Campaign save version is 5. Old surplus wallets/equipment would bypass the new budget, so older saves are backed up locally as `rr-previous-campaign` and the new course starts fresh. Comfort settings remain. This reset is documented in the player guide.

Validation so far: production/TypeScript/standalone builds pass. A full ordinary-input gentle-speed three-stage run completed all eighteen loops with no purchases or diagnostic repositioning in 3.4 minutes. Lunar energy timing, platform carry and normal jumps across all four open Challenge gaps also passed. The standalone release was checked separately at Chromebook resolution: all three destination builds contain exactly sixteen active gold-coin pickups, with no uncaught page errors.

The first effects-only test fixture could no longer afford both Moon items after the price increase; it now explicitly funds that mechanics test while the separate scarcity test uses the actual finite budget. Earlier store checks were updated to account for a real coin at the relocated first store and to use E while moving rather than relying on a click after coasting past the entrance. No gameplay checks were weakened.

Final coverage: **27 distinct browser scenarios verified**—all fourteen desktop cases (four early checks plus the ten-case final campaign run) and thirteen Chromebook cases. Chromebook's non-traversal suite passed in 2.9 minutes; the full extended traversal was run on desktop. Coverage includes the finite budget and sold-out persistence, stronger spring/shield/armor/jet effects, later-store approach with normal controls, identical coins across all three destinations, mandatory gates, all eighteen loops, rocket travel, saves/backup migration, moving platforms and Challenge gaps, fullscreen/fallback, touch buttons and settings. An early batch was intentionally interrupted to move Austin's last barrier away from the last loop's landing; the affected remaining checks then passed in the final campaign run.

The final standalone artifact was also exercised in native fullscreen at Chromebook resolution: collected the twelve introductory coins, entered the relocated store, bought the nine-coin Spring step, verified three coins remained and both purchase buttons were disabled (sold out versus insufficient funds), and visually reviewed the complete readable shop panel. Regenerated root `index.html` matches the production standalone output. Live Pages propagation remains unverified due to the workspace network restriction.

## Roadrunner Rush v6 · student UI, game over, coin trails and prize challenges · October 21, 2026

- Simplified the title to the destination line, game name, short invitation and play/settings/fullscreen/prize controls; the three-heart rule appears during play and at game over. Removed update-note copy and the old “No game over” promise. Increased title and student-message typography instead of squeezing explanatory text into tiny fonts.
- Neutral notices, sign messages and dialog panels now use gray. Damage/fall notices use a distinct pale coral background, dark red text/border, and an assertive alert role. Quiz explanations use plain correct/incorrect wording; no flashing urgency effects.
- Losing the last heart persists a terminal game-over state, stops controls and physics, plays an original descending three-tone cue, and shows a 650 ms sideways fall with an original X-eye bird texture. Reduced motion immediately shows the final pose. Afterward, the game-over dialog requires a new campaign in Albuquerque. Reload, Escape and Settings cannot resume a dead run. Falling also costs one heart instead of restoring health.
- Replaced scattered pickups with two seven-coin introductory trails and six closely spaced coins tracing the crown of every loop: fifty identical gold coins per stage, twenty-six available before the store. Loop coins move to the ground route when loop traversal is disabled, including mid-stage setting changes. Prices rose to 26/25, 38/37 and 50/49; total income 150 versus 225 for all stock. Limited stock and saved collected IDs remain in force.
- Each stage finish now requires a three-question attempt drawn from that stage’s six-question bank (eighteen authored questions total). Both question and answer order randomize. A failed attempt offers three different questions on retry or continuation without a prize. Submitted answers/cursor/order persist through Settings/reload, with feedback and narration matching the displayed answer order.
- A 3/3 attempt earns an original wearable prize, previewed before answering and at the result. Shoes visibly attach to the bird and add 10% straight-path speed; a golden cap grants one shield on award and at stage/new-game entry; the Moon helmet visibly appears on the Moon and grants four jet charges on award/future Moon entry. The separate local collection survives game over and new runs. Awards cannot be duplicated by reloading results or retrying an owned prize.
- Campaign version is 6; prior runs are backed up locally before a fresh run with the changed coin IDs, quiz schema and death rules. Settings remain independent; rewards persist in `rr-prizes`.

Initial focused desktop checks: five passed, covering finite spending/sold-out stock, three-question scoring and fresh retries, persistent awards/attempts/narration, optional continuation without a prize, terminal game over with X texture/rotation/descending oscillator frequencies/reload/restart, and readable title/gray neutral messages. The larger desktop interaction regression and Chromebook checks are recorded below when complete.

Final validation: **33 distinct browser scenarios verified**—all seventeen desktop cases and sixteen Chromebook cases (the complete three-stage traversal ran on desktop). The extended ordinary-input campaign passed in 3.3 minutes with the new terminal-death rule, all eighteen loops, all nine checkpoint questions and the three prizes. The fifteen-case desktop interaction run passed in 3.1 minutes; Chromebook's sixteen non-traversal cases passed in 3.6 minutes. Final title/readability checks passed on both sizes after removing the extra title line and clearing stale gameplay notices when returning home.

Visually reviewed the readable fresh/saved title, six-coin crowns, red shoes/golden cap, Moon helmet, gray dialogs, coral damage/game-over notice, and the fallen X-eye pose. TypeScript, production and standalone builds pass; inherited Phaser bundle advisory remains. The final self-contained release was separately tested at Chromebook resolution in native fullscreen: a clean returning title, randomized three-question award, 10% shoe speed, persisted game over after reload, forced fresh restart, empty restarted wallet and retained prize collection, with no uncaught page errors. Root HTML was regenerated from that artifact. Actual speakers/browser voice quality, physical touch devices, non-Chromium browsers and live GitHub Pages propagation remain unverified here.

## v6.1 — prizes belong to the current adventure

Corrected New Game and game-over restart carrying over and automatically equipping previous prizes. A fresh adventure now clears the saved wardrobe before creating progress, starts at base speed with no bonus shield or jet charges, and requires earning every prize again. Continue/reload and stage transitions preserve current-adventure prizes. Updated title collection, restart and game-over copy to explain this rule; campaign schema remains 6 to preserve existing saves.

Validation: all eight focused desktop/Chromebook browser cases passed (1.8 minutes), covering randomized awards and saved rewards, partial quiz/settings persistence, terminal death/restart, and a regression seeded with all three saved prizes that verifies empty wardrobe, no outfit drawing, base speed, zero shield/fuel and persisted clearing after reload. TypeScript, production and standalone builds passed; generated root HTML updated. The standalone artifact served locally showed v6.1, empty wardrobe, speed 600, zero shield/fuel and no uncaught page errors. Direct file navigation was blocked by browser policy, so the artifact was checked through the local preview server. Live Pages propagation remains unverified.

## v6.2 — Houston destination correction

Renamed stage 2 from Austin to Houston throughout the title/header, route descriptions, stage and checkpoint signs, bus destination, shop name/interior, quiz scenario, transition/rocket story and ending. Documentation now identifies Houston as home to Johnson Space Center and Mission Control while retaining the game's fictional launch facility. Existing campaign IDs and saves remain compatible.

TypeScript, production and standalone builds passed; regenerated root HTML. The existing destination/store/rocket/Moon integration scenario passed on desktop and Chromebook. Chromebook's first run passed the destination assertions but missed the later Moon double-jump input; an unchanged rerun passed in 26.9 seconds. Local standalone preview confirmed the Houston route, v6.2 footer and no remaining Austin text in the document. Source, current tests, documentation and generated root HTML contain no Austin references. Historical validation entries above retain the previous release history. Live Pages propagation was not verified.
