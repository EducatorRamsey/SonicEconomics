import { test, expect, Page } from "@playwright/test";
import { checkpoints, FINISH_X, SHOP_X, loopTracks } from "../src/course";
async function state(page: Page) {
  return page.evaluate(() => {
    const r = (window as any).rr;
    return {
      ...r.progress,
      x: r.scene.player.x,
      y: r.scene.player.y,
      vy: r.scene.player.body.velocity.y,
      ground: r.scene.player.body.blocked.down,
      active: r.scene.activePlay,
      screen: r.screen,
    };
  });
}
async function teleport(page: Page, x: number, y = 430) {
  await page.evaluate(({ x, y }) => (window as any).rr.teleport(x, y), {
    x,
    y,
  });
  await page.waitForTimeout(180);
}
async function start(page: Page) {
  await page.goto("/?test=1");
  await page.getByRole("button", { name: "Let’s hit the trail" }).click();
  await expect.poll(async () => (await state(page)).active).toBe(true);
  await page.waitForTimeout(500);
}
async function visitQuestion(page: Page, id: number) {
  await teleport(page, checkpoints[id].x);
  await expect(page.locator("#rest-open")).toBeVisible();
  expect((await state(page)).screen).toBe("play");
  await page.locator("#rest-open").click();
}
async function answer(page: Page, id: number) {
  await expect(page.getByRole("dialog")).toBeVisible();
  const correct = [0, 1, 1][id];
  await page.locator(`[data-answer="${correct}"]`).click();
  await expect(page.locator("#question-continue")).toBeEnabled();
  await page.locator("#question-continue").click();
}
test("movement, jump, ground/platform collision, tokens, pause and touch", async ({
  page,
}) => {
  await start(page);
  const a = await state(page);
  await page.keyboard.down("ArrowRight");
  await expect
    .poll(async () => (await state(page)).x)
    .toBeGreaterThan(a.x + 100);
  await page.keyboard.up("ArrowRight");
  const b = await state(page);
  await page.keyboard.press("Space");
  await expect
    .poll(async () => (await state(page)).y, { intervals: [40] })
    .toBeLessThan(b.y - 25);
  await expect.poll(async () => (await state(page)).ground).toBe(true);
  await teleport(page, 380);
  await expect.poll(async () => (await state(page)).tokens).toBeGreaterThan(0);
  await teleport(page, 770, 300);
  await expect.poll(async () => (await state(page)).ground).toBe(true);
  expect((await state(page)).y).toBeLessThan(410);
  await page.locator("#pause").click();
  const paused = await state(page);
  await page.keyboard.down("ArrowRight");
  await page.waitForTimeout(400);
  await page.keyboard.up("ArrowRight");
  expect((await state(page)).x).toBeCloseTo(paused.x, 0);
  await page.getByRole("button", { name: "Resume adventure" }).click();
  const touch = page.getByRole("button", { name: "Move right", exact: true });
  await touch.hover();
  await page.mouse.down();
  await expect
    .poll(async () => (await state(page)).x)
    .toBeGreaterThan(paused.x + 20);
  await page.mouse.up();
});
test("all questions pause hazards and timers, retries, narration, rewards, finish", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await start(page);
  await page.evaluate(() => {
    const r = (window as any).rr;
    r.settings.mode = "challenge";
    r.hud();
    const calls: string[] = [];
    Object.defineProperty(window, "__speech", { value: calls });
    window.speechSynthesis.speak = (u) => calls.push(u.text);
    window.speechSynthesis.cancel = () => calls.push("STOP");
  });
  for (let id = 0; id < 3; id++) {
    await visitQuestion(page, id);
    await expect(page.locator("#dialog-title")).toHaveText(
      [
        "A little water, many gardens",
        "One afternoon, two choices",
        "Supplies for the trail",
      ][id],
    );
    const before = await state(page);
    const hazard = await page.evaluate(
      () => (window as any).rr.scene.hazards.getChildren()[0].x,
    );
    await page.waitForTimeout(350);
    expect((await state(page)).elapsed).toBe(before.elapsed);
    expect(
      await page.evaluate(
        () => (window as any).rr.scene.hazards.getChildren()[0].x,
      ),
    ).toBe(hazard);
    await page.locator('[data-answer="2"]').click();
    await expect(page.locator("#feedback")).toContainText("Try another answer");
    expect((await state(page)).tokens).toBe(before.tokens);
    expect((await state(page)).hearts).toBe(before.hearts);
    await page.getByRole("button", { name: "▷ Listen" }).click();
    await page.getByRole("button", { name: "↻ Replay" }).click();
    await page.getByRole("button", { name: "■ Stop" }).click();
    const speech = await page.evaluate(() => (window as any).__speech);
    expect(
      speech.some(
        (s: string) =>
          s.includes("Answer A.") &&
          s.includes("Answer B.") &&
          s.includes("Answer C."),
      ),
    ).toBe(true);
    await page.locator(`[data-answer="${[0, 1, 1][id]}"]`).click();
    expect((await state(page)).shield).toBe(before.shield + 1);
    await page
      .getByRole("button", { name: "Settings", exact: true })
      .last()
      .click();
    await page.locator("#settings-done").click();
    expect((await state(page)).shield).toBe(before.shield + 1);
    await page.locator("#question-continue").click();
  }
  await teleport(page, FINISH_X + 10);
  await expect(page.locator("#dialog-title")).toHaveText(
    "A trail well traveled.",
  );
  expect((await state(page)).answered).toHaveLength(3);
  expect((await state(page)).helped).toHaveLength(3);
  expect((await state(page)).finished).toBe(true);
  expect(errors).toEqual([]);
});
test("shop trade-off and both functional upgrades", async ({ page }) => {
  await start(page);
  for (const x of [380, 470, 560, 650, 740, 830]) await teleport(page, x);
  expect((await state(page)).tokens).toBe(6);
  await visitQuestion(page, 0);
  await answer(page, 0);
  await teleport(page, SHOP_X);
  await page.locator("#shop-open").click();
  await page.locator("#buy-shield").click();
  expect((await state(page)).tokens).toBe(0);
  expect((await state(page)).shield).toBe(2);
  await expect(page.locator("#buy-boost")).toBeDisabled();
  await page.locator("#leave-shop").click();
  for (const x of [SHOP_X + 200, SHOP_X + 322, SHOP_X + 444, SHOP_X + 566])
    await teleport(page, x);
  await teleport(page, SHOP_X);
  await page.locator("#shop-open").click();
  await page.locator("#buy-boost").click();
  expect((await state(page)).boost).toBe(25);
  expect((await state(page)).purchases).toEqual(["shield", "boost"]);
  await page.waitForTimeout(350);
  expect((await state(page)).boost).toBe(25);
  await page.locator("#leave-shop").click();
  await page.waitForTimeout(450);
  const groundY = (await state(page)).y;
  await page.keyboard.down("Space");
  await page.waitForFunction(
    (y) => (window as any).rr.scene.player.y < y - 112,
    groundY,
  );
  await page.keyboard.up("Space");
  // Spawn above the ground, not inside the floor collider.
  await teleport(page, 8300, 430);
  await expect.poll(async () => (await state(page)).shield).toBe(1);
  expect((await state(page)).hearts).toBe(3);
});
test("hearts, invulnerability, fall recovery, save/continue and new game settings", async ({
  page,
}) => {
  await start(page);
  await visitQuestion(page, 0);
  await answer(page, 0);
  await page.evaluate(() => ((window as any).rr.progress.shield = 0));
  // Spawn above the ground, not inside the floor collider.
  await teleport(page, 8300, 430);
  await expect.poll(async () => (await state(page)).hearts).toBe(2);
  await page.waitForTimeout(350);
  expect((await state(page)).hearts).toBe(2);
  await page.evaluate(() => {
    const r = (window as any).rr;
    r.scene.invulnerable = 0;
    r.scene.hurt();
  });
  expect((await state(page)).hearts).toBe(1);
  await page.evaluate(() => {
    const r = (window as any).rr;
    r.scene.invulnerable = 0;
    r.scene.hurt();
  });
  expect((await state(page)).hearts).toBe(3);
  expect((await state(page)).x).toBeCloseTo(checkpoints[0].x + 70, 0);
  await teleport(page, 3000, 690);
  await expect
    .poll(async () => Math.abs((await state(page)).x - checkpoints[0].x - 70))
    .toBeLessThan(5);
  await page.locator("#global-settings").click();
  await page.locator("#setting-speed").selectOption("0.7");
  await page.locator("#setting-reduced").check();
  await page.locator("#setting-mode").selectOption("challenge");
  await page.locator("#mute").click();
  await page.locator("#settings-done").click();
  await page.reload();
  await page.getByRole("button", { name: "Continue adventure" }).click();
  expect((await state(page)).answered).toEqual([0]);
  expect((await state(page)).x).toBeCloseTo(checkpoints[0].x + 70, 0);
  expect(await page.evaluate(() => (window as any).rr.settings.speed)).toBe(
    0.7,
  );
  await page.locator("#pause").click();
  await page.getByRole("button", { name: "Restart · new game" }).click();
  await page
    .getByRole("button", { name: "Start new game", exact: true })
    .click();
  await expect.poll(async () => (await state(page)).active).toBe(true);
  expect((await state(page)).answered).toEqual([]);
  expect((await state(page)).tokens).toBe(0);
  expect(await page.evaluate(() => (window as any).rr.settings.reduced)).toBe(
    true,
  );
});
test("keyboard menu access and no missing local assets", async ({ page }) => {
  const failures: string[] = [];
  page.on("response", (r) => {
    if (r.status() >= 400) failures.push(r.url());
  });
  await page.goto("/?test=1");
  await page.keyboard.press("Enter");
  await expect.poll(async () => (await state(page)).screen).toBe("play");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  expect(failures).toEqual([]);
  await page.screenshot({
    path: `test-results/trail-${test.info().project.name}.png`,
  });
});
test("the whole gentle-speed trail flows through six loops without forced questions, then offers practice", async ({
  page,
}) => {
  test.setTimeout(180000);
  await start(page);
  await page.evaluate(() => {
    const r = (window as any).rr;
    r.settings.speed = 0.7;
  });
  await page.keyboard.down("ArrowRight");
  await expect(page.locator("#dialog-title")).toHaveText(
    "A trail well traveled.",
    { timeout: 150000 },
  );
  await page.keyboard.up("ArrowRight");
  expect((await state(page)).finished).toBe(true);
  expect((await state(page)).answered).toEqual([]);
  expect(
    await page.evaluate(() => (window as any).rr.scene.loops.completed.size),
  ).toBe(6);
  await expect(page.locator(".answer-summary")).toContainText(
    "not practiced yet",
  );
  await page.locator("#review-questions").click();
  for (let id = 0; id < 3; id++) await answer(page, id);
  await expect(page.locator("#dialog-title")).toHaveText(
    "A trail well traveled.",
  );
  expect((await state(page)).answered).toHaveLength(3);
  await expect(page.locator("#review-questions")).toHaveCount(0);
});

test("loop physics invert the runner, preserve pause, respond to braking and allow jumping out in both directions", async ({
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
  await page.waitForTimeout(300);
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
  await page.keyboard.up("ArrowRight");
  expect(
    await page.evaluate(() => (window as any).rr.scene.player.body.enable),
  ).toBe(true);
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
  await page.keyboard.press("Space");
  await expect
    .poll(() => page.evaluate(() => (window as any).rr.scene.loops.active))
    .toBe(null);
  await page.keyboard.up("ArrowRight");
  expect(
    await page.evaluate(() => (window as any).rr.scene.player.body.enable),
  ).toBe(true);
});

test("loop comfort setting keeps a continuous ground route", async ({
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
  expect(
    await page.evaluate(() => (window as any).rr.scene.player.rotation),
  ).toBe(0);
  await page.reload();
  expect(await page.evaluate(() => (window as any).rr.settings.loops)).toBe(
    false,
  );
});
