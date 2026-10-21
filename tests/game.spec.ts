import { test, expect } from "@playwright/test";
import {
  levels,
  loopTracks,
  movingGaps,
  obstacles,
  coinPositions,
  ledgesFor,
} from "../src/course";
import {
  start,
  state,
  teleport,
  visitGate,
  answer,
  advanceTo,
  enterStore,
} from "./helpers";

test("movement, jumping, platforms, collection, pause, and touch controls", async ({
  page,
}) => {
  await start(page);
  const initial = await state(page);
  await page.keyboard.down("ArrowRight");
  await expect
    .poll(async () => (await state(page)).x)
    .toBeGreaterThan(initial.x + 100);
  await page.keyboard.up("ArrowRight");
  const y = (await state(page)).y;
  await page.keyboard.down("Space");
  await expect
    .poll(async () => (await state(page)).y, { intervals: [40] })
    .toBeLessThan(y - 25);
  await page.keyboard.up("Space");
  await expect.poll(async () => (await state(page)).ground).toBe(true);
  await teleport(page, 380);
  await expect.poll(async () => (await state(page)).tokens).toBeGreaterThan(0);
  await teleport(page, 770, 300);
  await expect.poll(async () => (await state(page)).ground).toBe(true);
  expect((await state(page)).y).toBeLessThan(410);
  await page.locator("#pause").click();
  const paused = await state(page);
  await page.keyboard.down("ArrowRight");
  await page.waitForTimeout(250);
  await page.keyboard.up("ArrowRight");
  expect((await state(page)).x).toBe(paused.x);
  await page.locator("#resume").click();
  await page.getByRole("button", { name: "Move right", exact: true }).hover();
  await page.mouse.down();
  await expect
    .poll(async () => (await state(page)).x)
    .toBeGreaterThan(paused.x + 20);
  await page.mouse.up();
});

test("enter the later store, choose a shield over spring step, and keep the choice after reload", async ({
  page,
}) => {
  await start(page);
  for (const coin of coinPositions.filter((c) => c.x < levels[0].shop))
    await teleport(page, coin.x, coin.y);
  expect((await state(page)).tokens).toBe(26);
  await enterStore(page);
  const storeBalance = (await state(page)).tokens;
  const time = (await state(page)).elapsed;
  const firstX = await page.evaluate(() => (window as any).rr.store.player.x);
  await page.keyboard.down("ArrowRight");
  await expect
    .poll(() => page.evaluate(() => (window as any).rr.store.player.x), {
      timeout: 8000,
    })
    .toBeGreaterThan(firstX + 310);
  await page.keyboard.up("ArrowRight");
  await page.keyboard.press("e");
  await expect(page.locator("#buy-shield")).toBeVisible();
  expect((await state(page)).elapsed).toBe(time);
  await page.locator("#buy-shield").click();
  expect((await state(page)).shield).toBe(3);
  expect((await state(page)).tokens).toBe(storeBalance - 26);
  await expect(page.locator("#buy-boost")).toBeDisabled();
  await page.locator("#leave-shop").click();
  await expect(page.locator("#store-controls")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.locator("#store-resume")).toBeVisible();
  await page.locator("#store-resume").click();
  await page.locator("#game-settings").click();
  await page.locator("#settings-done").click();
  await expect(page.locator("#store-controls")).toBeVisible();
  await page.keyboard.down("ArrowLeft");
  await expect
    .poll(() => page.evaluate(() => (window as any).rr.store.player.x), {
      timeout: 8000,
    })
    .toBeLessThan(170);
  await page.keyboard.up("ArrowLeft");
  await page.keyboard.press("e");
  expect((await state(page)).screen).toBe("play");
  await expect(page.locator("#shop-open")).toBeVisible();
  await page.keyboard.press("e");
  await expect(page.locator("#store-controls")).toBeVisible();
  await page.locator("#store-exit").click();
  expect((await state(page)).screen).toBe("play");
  await teleport(page, 10500);
  await expect.poll(async () => (await state(page)).shield).toBe(2);
  expect((await state(page)).hearts).toBe(3);
  await page.reload();
  await page.locator("#continue-save").click();
  expect((await state(page)).purchases).toEqual(["shield"]);
});

test("save a partial quiz, restore its answered question, and keep settings after a fall and restart", async ({
  page,
}) => {
  await start(page);
  await visitGate(page, 0);
  const correct = await page.evaluate(() => (window as any).rr.quizAnswer);
  await page.locator(`[data-answer="${correct}"]`).click();
  const ids = (await state(page)).attempt.ids;
  await page.reload();
  await page.locator("#continue-save").click();
  expect((await state(page)).attempt.ids).toEqual(ids);
  expect((await state(page)).attempt.cursor).toBe(0);
  await expect(page.locator("#question-continue")).toBeEnabled();
  await page.locator("#question-settings").click();
  await page.locator("#settings-done").click();
  expect((await state(page)).attempt.cursor).toBe(0);
  await answer(page, 0);
  await teleport(page, levels[1].safe + 10);
  await teleport(page, levels[1].safe + 500, 690);
  await expect.poll(async () => (await state(page)).hearts).toBe(2);
  await expect
    .poll(async () => Math.abs((await state(page)).x - levels[1].safe))
    .toBeLessThan(5);
  await page.locator("#global-settings").click();
  await page.locator("#setting-reduced").check();
  await page.locator("#settings-done").click();
  await page.reload();
  await page.locator("#continue-save").click();
  expect((await state(page)).hearts).toBe(2);
  await page.locator("#pause").click();
  await page.locator("#restart").click();
  await page.locator("#confirm-new").click();
  expect((await state(page)).level).toBe(0);
  expect((await state(page)).tokens).toBe(0);
  expect(await page.evaluate(() => (window as any).rr.wardrobe)).toContain(0);
  expect(await page.evaluate(() => (window as any).rr.settings.reduced)).toBe(
    true,
  );
});

test("complete all three levels with ordinary gentle-speed movement, different hazards, and three-question prize checkpoints", async ({
  page,
}) => {
  test.setTimeout(420000);
  await start(page);
  await page.evaluate(() => ((window as any).rr.settings.speed = 0.7));
  for (let id = 0; id < 3; id++) {
    const kinds = await page.evaluate(() =>
      (window as any).rr.scene.hazards
        .getChildren()
        .map((h: any) => h.getData("kind")),
    );
    expect(kinds).toContain(["tumbleweed", "boulder", "wind"][id]);
    await page.keyboard.down("ArrowRight");
    const deadline = Date.now() + 130000;
    while ((await state(page)).screen === "play" && Date.now() < deadline) {
      const current = await state(page);
      // Use ordinary jumps on level-two stairs and level-three moving bridges.
      const jumpSection =
        obstacles.some(
          (o) =>
            o.level === id && current.x > o.x - 270 && current.x < o.x + 100,
        ) ||
        ledgesFor(id).some(
          (p) => current.x > p.x - 240 && current.x < p.x + p.w && p.y >= 350,
        ) ||
        (id === 2 &&
          movingGaps.some(
            (gap) => current.x > gap.left - 300 && current.x < gap.right + 220,
          ));
      if (jumpSection && current.ground) {
        await page.keyboard.down("Space");
        await page.waitForTimeout(140);
        await page.keyboard.up("Space");
      }
      await page.waitForTimeout(120);
    }
    await expect(page.locator("[data-answer]")).toHaveCount(3);
    expect((await state(page)).over).toBe(false);
    await page.keyboard.up("ArrowRight");
    expect((await state(page)).level).toBe(id);
    expect(
      await page.evaluate(() => (window as any).rr.scene.loops.completed.size),
    ).toBe(6);
    await answer(page, id);
  }
  expect((await state(page)).finished).toBe(true);
  expect((await state(page)).completedLevels).toEqual([0, 1, 2]);
});

test("lunar energy warnings change collision danger, moving bridges carry the player, and challenge gaps can be jumped", async ({
  page,
}) => {
  await start(page);
  await advanceTo(page, 1);
  await visitGate(page, 1);
  await answer(page, 1, false);
  await page.locator("#level-settings").click();
  await page.locator("#setting-mode").selectOption("challenge");
  await page.locator("#settings-done").click();
  await page.locator("#next-level").click();
  await expect.poll(async () => (await state(page)).level).toBe(2);
  await expect.poll(async () => (await state(page)).active).toBe(true);
  await page.evaluate(() => ((window as any).rr.scene.runTime = 3100));
  await teleport(
    page,
    obstacles.find((o) => o.level === 2 && o.kind === "wind")!.x,
  );
  const before = await state(page);
  await page.waitForTimeout(200);
  expect((await state(page)).shield).toBe(before.shield);
  expect((await state(page)).hearts).toBe(before.hearts);
  await page.evaluate(() => ((window as any).rr.scene.runTime = 1700));
  await expect
    .poll(async () => (await state(page)).shield)
    .toBe(before.shield - 1);
  const platform = await page.evaluate(() => {
    const p = (window as any).rr.scene.movingPlatforms.getChildren()[0];
    return { x: p.x, y: p.y };
  });
  await teleport(page, platform.x, 390);
  await expect.poll(async () => (await state(page)).ground).toBe(true);
  expect((await state(page)).y).toBeCloseTo(platform.y - 8 - 32, 0);
  const px = (await state(page)).x;
  await expect
    .poll(async () => Math.abs((await state(page)).x - px))
    .toBeGreaterThan(15);
  for (const gap of movingGaps) {
    await teleport(page, gap.left - 240);
    await expect.poll(async () => (await state(page)).ground).toBe(true);
    await page.keyboard.down("ArrowRight");
    await page.waitForFunction(
      (x) => (window as any).rr.scene.player.x > x - 135,
      gap.left,
    );
    await page.keyboard.down("Space");
    await page.waitForFunction(
      (x) => (window as any).rr.scene.player.x > x + 50,
      gap.right,
    );
    await page.keyboard.up("Space");
    await page.keyboard.up("ArrowRight");
  }
});

test("loop inversion, pause, braking, and jump exits work in both directions", async ({
  page,
}) => {
  await start(page);
  await teleport(page, loopTracks[0].x - 450);
  await page.keyboard.down("ArrowRight");
  await expect
    .poll(() =>
      page.evaluate(() => (window as any).rr.scene.loops.active !== null),
    )
    .toBe(true);
  await expect
    .poll(
      () =>
        page.evaluate(() => Math.abs((window as any).rr.scene.player.rotation)),
      { intervals: [40] },
    )
    .toBeGreaterThan(2.4);
  expect((await state(page)).y).toBeLessThan(220);
  await page.locator("#pause").click();
  const angle = await page.evaluate(
    () => (window as any).rr.scene.loops.active.angle,
  );
  await page.waitForTimeout(200);
  expect(
    await page.evaluate(() => (window as any).rr.scene.loops.active.angle),
  ).toBe(angle);
  await page.keyboard.up("ArrowRight");
  await page.locator("#resume").click();
  await page.keyboard.down("ArrowRight");
  await expect
    .poll(() =>
      page.evaluate(() => (window as any).rr.scene.loops.completed.size),
    )
    .toBe(1);
  expect((await state(page)).tokens).toBe(6);
  await page.keyboard.up("ArrowRight");
  await teleport(page, loopTracks[0].x + 430);
  await page.keyboard.down("ArrowLeft");
  await expect
    .poll(() =>
      page.evaluate(() => (window as any).rr.scene.loops.active?.direction),
    )
    .toBe(-1);
  await page.keyboard.up("ArrowLeft");
  const speed = await page.evaluate(
    () => (window as any).rr.scene.loops.active.speed,
  );
  await page.keyboard.down("ArrowRight");
  await expect
    .poll(
      () =>
        page.evaluate(
          () => (window as any).rr.scene.loops.active?.speed ?? Infinity,
        ),
      { intervals: [40] },
    )
    .toBeLessThan(speed - 20);
  await page.keyboard.down("Space");
  await expect
    .poll(() => page.evaluate(() => (window as any).rr.scene.loops.active))
    .toBe(null);
  await page.keyboard.up("Space");
  await page.keyboard.up("ArrowRight");
  expect(
    await page.evaluate(() => (window as any).rr.scene.player.body.enable),
  ).toBe(true);
});

test("loop comfort setting preserves a continuous ground route and keyboard menus", async ({
  page,
}) => {
  await start(page);
  await page.locator("#global-settings").click();
  await page.locator("#setting-loops").uncheck();
  await page.locator("#settings-done").click();
  await page.locator("#resume").click();
  await teleport(page, loopTracks[0].x - 400);
  await page.keyboard.down("ArrowRight");
  await expect
    .poll(async () => (await state(page)).x, { timeout: 8000 })
    .toBeGreaterThan(loopTracks[0].x + 350);
  await page.keyboard.up("ArrowRight");
  expect(
    await page.evaluate(() => (window as any).rr.scene.loops.completed.size),
  ).toBe(0);
  await page.keyboard.press("Escape");
  await expect(page.locator("#resume")).toBeVisible();
  await page.keyboard.press("Escape");
  expect((await state(page)).screen).toBe("play");
  await page.reload();
  expect(await page.evaluate(() => (window as any).rr.settings.loops)).toBe(
    false,
  );
});

test("old wallets are backed up while the longer balanced campaign starts fresh with comfort settings", async ({
  page,
}) => {
  await page.addInitScript(() => {
    localStorage.setItem(
      "rr-progress",
      JSON.stringify({
        x: 20000,
        tokens: 17,
        hearts: 2,
        shield: 2,
        boost: 8,
        elapsed: 100,
        answered: [0, 1, 2],
        helped: [1],
        collected: [0, 1],
        finished: true,
        purchases: ["shield"],
      }),
    );
    localStorage.setItem(
      "rr-settings",
      JSON.stringify({ speed: 0.7, reduced: true }),
    );
  });
  await page.goto("/?test=1");
  await page.locator("#continue-save").click();
  await expect.poll(async () => (await state(page)).active).toBe(true);
  const s = await state(page);
  expect(s.level).toBe(0);
  expect(s.tokens).toBe(0);
  expect(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem("rr-previous-campaign")!).tokens,
    ),
  ).toBe(17);
  expect(s.shield).toBe(0);
  expect(s.answered).toEqual([]);
  expect(s.completedLevels).toEqual([]);
  expect(s.finished).toBe(false);
  expect(await page.evaluate(() => (window as any).rr.settings.reduced)).toBe(
    true,
  );
});
