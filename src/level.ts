import Phaser from "phaser";
import {
  WORLD_WIDTH,
  FINISH_X,
  SHOP_X,
  checkpoints,
  loopTracks,
  levels,
  movingGaps,
  obstacles,
} from "./course";
export { WORLD_WIDTH, FINISH_X, SHOP_X, checkpoints } from "./course";
export const hazardPositions = obstacles.map((o) => o.x);
export const tokenPositions = [
  ...Array.from({ length: 6 }, (_, i) => ({ x: 380 + i * 90, y: 442 })),
  ...Array.from({ length: 175 }, (_, i) => ({
    x: SHOP_X + 200 + i * 122,
    y: i % 13 === 4 ? 365 : 442,
  })),
  ...loopTracks
    .filter((t) => t.x > SHOP_X)
    .flatMap((t) =>
      Array.from({ length: 9 }, (_, i) => {
        const a = ((i + 1) * Math.PI * 2) / 10;
        return {
          x: t.x + Math.sin(a) * t.radius,
          y: t.y + Math.cos(a) * t.radius,
        };
      }),
    ),
];
export function drawLevel(scene: Phaser.Scene, relaxed = true) {
  const g = scene.add.graphics();
  g.fillGradientStyle(0xf3ddaf, 0xf3ddaf, 0xffeed0, 0xffeed0, 1);
  g.fillRect(0, 0, WORLD_WIDTH, 540);
  g.fillStyle(0xe6c5a2);
  g.fillRect(levels[1].left, 0, levels[1].right - levels[1].left, 540);
  g.fillStyle(0xcbd9cf);
  g.fillRect(levels[2].left, 0, levels[2].right - levels[2].left, 540);
  g.fillStyle(0xfff5d5);
  g.fillCircle(770, 92, 43);
  for (let x = 0; x < WORLD_WIDTH; x += 650) {
    g.fillStyle(0xc9c3ac);
    g.fillTriangle(x - 80, 350, x + 280, 115, x + 620, 350);
    g.fillStyle(0xd9cfb6);
    g.fillTriangle(x + 150, 350, x + 490, 179, x + 800, 350);
  }
  for (let x = 130; x < WORLD_WIDTH; x += 950) {
    g.fillStyle(0xc58467);
    g.fillPoints(
      [
        { x: x - 100, y: 410 },
        { x: x - 40, y: 280 },
        { x: x + 15, y: 280 },
        { x: x + 38, y: 215 },
        { x: x + 190, y: 215 },
        { x: x + 220, y: 295 },
        { x: x + 310, y: 310 },
        { x: x + 365, y: 410 },
      ],
      true,
    );
    g.fillStyle(0xe0a17c);
    g.fillRect(x + 40, 215, 145, 14);
    g.lineStyle(3, 0xb57660, 0.45);
    g.lineBetween(x + 5, 327, x + 290, 327);
    g.lineBetween(x + 40, 352, x + 310, 352);
  }
  g.fillStyle(0xe9b980);
  g.fillRect(0, 408, WORLD_WIDTH, 140);
  // New Mexico vegetation: low prickly-pear pads and narrow-leaved yucca.
  for (let x = 140; x < WORLD_WIDTH; x += 480) {
    g.fillStyle(0x6d8260);
    if (Math.floor(x / 480) % 2 === 0) {
      g.fillEllipse(x, 448, 24, 38);
      g.fillEllipse(x - 17, 430, 22, 31);
      g.fillEllipse(x + 18, 427, 24, 34);
      g.fillStyle(0xb77657);
      g.fillEllipse(x + 19, 409, 6, 7);
      g.lineStyle(1, 0xe2d5a3);
      for (let n = 0; n < 3; n++)
        g.lineBetween(x - 5 + n * 5, 436, x - 5 + n * 5, 445);
    } else {
      g.fillStyle(0x79825b);
      for (let n = -3; n <= 3; n++)
        g.fillTriangle(
          x - 3,
          466,
          x + 3,
          466,
          x + n * 13,
          416 + Math.abs(n) * 8,
        );
      g.lineStyle(3, 0x8c7852);
      g.lineBetween(x, 449, x, 383);
      g.fillStyle(0xf4e4b5);
      for (let n = 0; n < 5; n++)
        g.fillEllipse(x + (n % 2 ? 7 : -5), 390 + n * 8, 10, 7);
    }
  }
  // Enterable adobe outposts, one safe store in each level.
  for (const level of levels) {
    const x = level.shop;
    g.fillStyle(0xcd8d67);
    g.fillRoundedRect(x - 125, 325, 250, 175, 8);
    g.fillStyle(0x88553e);
    g.fillRect(x - 135, 320, 270, 12);
    g.fillStyle(0x355c54);
    g.fillRoundedRect(x - 24, 411, 48, 89, 20);
    g.fillStyle(0xf9dd9b);
    g.fillRect(x - 98, 390, 45, 42);
    g.fillRect(x + 55, 390, 45, 42);
    g.fillStyle(0x396c60);
    g.fillRect(x - 140, 368, 280, 15);
    scene.add
      .text(x, 343, "SUNSTONE SUPPLY", {
        fontFamily: "sans-serif",
        fontSize: "17px",
        color: "#fff7df",
        fontStyle: "bold",
      })
      .setOrigin(0.5);
    scene.add
      .text(x, 400, "ENTER · E", { fontSize: "11px", color: "#fff7df" })
      .setOrigin(0.5);
  }
  g.fillStyle(0xf4cf97);
  g.fillRect(0, 500, WORLD_WIDTH, 40);
  g.fillStyle(0x9e694c);
  g.fillRect(0, 500, WORLD_WIDTH, 7);
  g.fillStyle(0xe3ac73);
  g.fillRect(0, 507, WORLD_WIDTH, 6);
  for (let x = 20; x < WORLD_WIDTH; x += 69) {
    g.fillStyle(0xc58e5f, 0.55);
    g.fillEllipse(x, 525, 12, 3);
  }
  const platforms = scene.physics.add.staticGroup();
  function floor(x: number, w: number) {
    const p = scene.add.rectangle(x + w / 2, 525, w, 50, 0x000000, 0);
    scene.physics.add.existing(p, true);
    platforms.add(p);
  }
  const gaps = [{ left: 3500, right: 3670 }, ...movingGaps];
  let start = 0;
  for (const gap of gaps) {
    floor(start, gap.left - start);
    start = gap.right;
    g.fillStyle(0x805d4d);
    g.fillRect(gap.left, 500, gap.right - gap.left, 40);
  }
  floor(start, WORLD_WIDTH - start);
  if (relaxed)
    for (const gap of movingGaps) {
      floor(gap.left, gap.right - gap.left);
      g.fillStyle(0x9eac91);
      g.fillRect(gap.left, 501, gap.right - gap.left, 7);
    }

  // Small optional ravine, with a broad bridge requiring no jump.
  g.fillStyle(0x805d4d);
  g.fillRect(3500, 507, 170, 33);
  g.fillStyle(0x6c8e7b);
  g.fillRect(3480, 485, 210, 14);
  floor(3480, 210);
  for (const p of [
    { x: 700, y: 407, w: 190 },
    { x: 8600, y: 447, w: 190 },
    { x: 8770, y: 399, w: 210 },
    { x: 8950, y: 353, w: 230 },
    { x: 3210, y: 410, w: 200 },
  ]) {
    g.fillStyle(0xb47955);
    g.fillRoundedRect(p.x, p.y, p.w, 19, 6);
    g.fillStyle(0xf0ce94);
    g.fillRect(p.x + 4, p.y, p.w - 8, 5);
    const r = scene.add.rectangle(p.x + p.w / 2, p.y + 10, p.w, 20, 0, 0);
    scene.physics.add.existing(r, true);
    platforms.add(r);
  }
  const sign = (x: number, text: string) => {
    g.fillStyle(0x8f654b);
    g.fillRect(x - 3, 442, 6, 58);
    scene.add
      .text(x, 425, text, {
        fontFamily: "sans-serif",
        fontSize: "13px",
        color: "#fff8e3",
        backgroundColor: "#294c49",
        padding: { x: 11, y: 7 },
      })
      .setOrigin(0.5);
  };
  sign(370, "PRACTICE · Move & jump");
  levels.forEach((l) => {
    sign(l.shop - 240, "STORE AHEAD · Enter with E");
    sign(l.safe, "SAFE CHECKPOINT");
  });
  sign(3600, "EASY BRIDGE");
  sign(8370, "STEP UP · Jump the ledges");
  for (const loop of loopTracks) {
    // The visible track matches the runner's constrained circular surface.
    g.lineStyle(43, 0x925d42);
    g.strokeCircle(loop.x, loop.y, loop.radius + 33);
    g.lineStyle(32, 0xd9a36e);
    g.strokeCircle(loop.x, loop.y, loop.radius + 33);
    g.lineStyle(6, 0xf8dfaa);
    g.strokeCircle(loop.x, loop.y, loop.radius + 17);
    g.lineStyle(3, 0x648273);
    g.strokeCircle(loop.x, loop.y, loop.radius + 47);
    sign(loop.x - 330, "LOOP AHEAD · Keep running →");
  }
  checkpoints.forEach((c, i) => {
    sign(c.x - 180, `LEVEL ${i + 1} FINISH · ECONOMICS CHECKPOINT`);
    g.fillStyle(0xfaf2d7);
    g.fillRoundedRect(c.x - 22, 405, 44, 89, 14);
    g.lineStyle(3, 0x2c706b);
    g.strokeRoundedRect(c.x - 22, 405, 44, 89, 14);
    scene.add
      .text(c.x, 420, String(i + 1).padStart(2, "0"), {
        fontSize: "19px",
        color: "#2b655e",
        fontStyle: "bold",
      })
      .setOrigin(0.5);
    g.fillStyle(0x2c706b);
    g.fillCircle(c.x, 454, 7);
  });
  g.fillStyle(0x496c62);
  g.fillRect(FINISH_X, 350, 8, 150);
  g.fillStyle(0xfaf0d4);
  g.fillTriangle(FINISH_X + 8, 352, FINISH_X + 105, 377, FINISH_X + 8, 405);
  scene.add
    .text(FINISH_X - 5, 319, "TRAIL’S END", {
      fontSize: "16px",
      color: "#294c49",
      fontStyle: "bold",
    })
    .setOrigin(0.5);
  return platforms;
}
export function makeTextures(scene: Phaser.Scene) {
  if (scene.textures.exists("bird0")) return;
  for (let frame = 0; frame < 3; frame++) {
    const g = scene.make.graphics({ x: 0, y: 0 });
    // Original turquoise roadrunner: swept crest, ivory throat, long striped tail.
    g.fillStyle(0x173f49);
    g.fillTriangle(40, 38, 1, 18, 14, 47);
    g.fillStyle(0x39858a);
    g.fillTriangle(39, 38, 4, 29, 25, 49);
    g.lineStyle(2, 0xe6ca86);
    g.lineBetween(9, 29, 32, 41);
    g.fillStyle(0x308a91);
    g.fillEllipse(46, 43, 38, 27);
    g.fillStyle(0xf6e5bb);
    g.fillEllipse(52, 46, 22, 20);
    g.fillStyle(0x287c86);
    g.fillRoundedRect(51, 14, 15, 34, 8);
    g.fillCircle(62, 18, 14);
    g.fillStyle(0x16434e);
    g.fillTriangle(53, 9, 47, 0, 63, 7);
    g.fillTriangle(59, 7, 61, 0, 70, 9);
    g.fillStyle(0xd89946);
    g.fillTriangle(71, 17, 88, 22, 70, 25);
    g.fillStyle(0xfffcdf);
    g.fillCircle(66, 16, 5);
    g.fillStyle(0x142e37);
    g.fillCircle(68, 16, 2.6);
    g.fillStyle(0x21616f);
    g.fillEllipse(41, 39, 24, 12);
    g.lineStyle(3, 0x9b593d);
    const stride = frame === 1 ? 10 : frame === 2 ? -9 : 0;
    g.lineBetween(42, 54, 40 + stride, 67);
    g.lineBetween(52, 54, 56 - stride, 67);
    g.lineBetween(40 + stride, 67, 48 + stride, 67);
    g.lineBetween(56 - stride, 67, 64 - stride, 67);
    g.generateTexture(`bird${frame}`, 92, 72);
    g.destroy();
  }
  const t = scene.make.graphics({ x: 0, y: 0 });
  t.fillStyle(0xf4c15f);
  t.fillCircle(12, 12, 11);
  t.lineStyle(2, 0x9b6934);
  t.strokeCircle(12, 12, 10);
  t.lineStyle(2, 0xffedba);
  t.lineBetween(12, 6, 12, 18);
  t.generateTexture("token", 24, 24);
  t.destroy();
  const rock = scene.make.graphics({ x: 0, y: 0 });
  rock.fillStyle(0x877663);
  rock.fillCircle(25, 25, 24);
  rock.lineStyle(3, 0xb9a184);
  rock.strokeCircle(25, 25, 21);
  rock.lineBetween(12, 15, 30, 8);
  rock.lineBetween(30, 8, 41, 29);
  rock.lineBetween(41, 29, 20, 41);
  rock.generateTexture("boulder", 50, 50);
  rock.destroy();
  const wind = scene.make.graphics({ x: 0, y: 0 });
  wind.lineStyle(3, 0x638b8b);
  for (let i = 0; i < 4; i++) {
    wind.beginPath();
    wind.arc(24, 14 + i * 17, 16, Math.PI * 0.2, Math.PI * 1.7);
    wind.strokePath();
  }
  wind.generateTexture("wind", 52, 88);
  wind.destroy();
  const h = scene.make.graphics({ x: 0, y: 0 });
  h.lineStyle(3, 0x9d694b);
  h.strokeCircle(18, 18, 16);
  for (let i = 0; i < 7; i++) {
    const a = (i * Math.PI) / 3.5;
    h.lineBetween(
      18 + Math.cos(a) * 16,
      18 + Math.sin(a) * 16,
      18 - Math.cos(a) * 13,
      18 - Math.sin(a) * 13,
    );
  }
  h.generateTexture("tumbleweed", 36, 36);
  h.destroy();
}
