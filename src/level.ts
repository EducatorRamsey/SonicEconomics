import { progress } from "./state";
import { stores } from "./inventory";
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
  const level = levels[progress.level],
    stage = level.id;
  const g = scene.add.graphics(),
    left = level.left,
    width = level.right - left;
  const ground = [0xf4cf97, 0x657784, 0x999eaf][stage];
  const trim = [0x9e694c, 0xf0be65, 0xd9e7ff][stage];
  const ink = stage === 2 ? "#e6efff" : "#294c49";
  g.fillStyle([0xf3ddaf, 0xbfe8f1, 0x101628][stage]);
  g.fillRect(left, -300, width, 1100);
  if (stage === 0) {
    g.fillStyle(0xfff5d5);
    g.fillCircle(left + 770, 92, 43);
    for (let x = left; x < level.right; x += 650) {
      g.fillStyle(0xbda3a2);
      g.fillTriangle(x - 80, 380, x + 280, 115, x + 620, 380);
      g.fillStyle(0xd0b6aa);
      g.fillTriangle(x + 150, 380, x + 490, 179, x + 800, 380);
    }
    g.fillStyle(0xe9b980);
    g.fillRect(left, 408, width, 140);
    for (let x = left + 140; x < level.right; x += 480) {
      g.fillStyle(0x6d8260);
      if (Math.floor(x / 480) % 2 === 0) {
        g.fillEllipse(x, 448, 24, 38);
        g.fillEllipse(x - 17, 430, 22, 31);
        g.fillEllipse(x + 18, 427, 24, 34);
      } else
        for (let n = -3; n <= 3; n++)
          g.fillTriangle(
            x - 3,
            466,
            x + 3,
            466,
            x + n * 13,
            416 + Math.abs(n) * 8,
          );
    }
    for (let x = left + 500; x < level.right; x += 1800) {
      g.fillStyle(0xbc795e);
      g.fillRoundedRect(x, 350, 160, 100, 8);
      g.fillStyle(0x457d86);
      g.fillRect(x + 30, 385, 28, 40);
      g.fillRect(x + 100, 385, 28, 40);
      g.fillStyle(0xcf7753);
      g.fillEllipse(x + 120, 95, 54, 67);
      g.lineStyle(2, 0x77694d);
      g.lineBetween(x + 100, 118, x + 112, 145);
      g.lineBetween(x + 140, 118, x + 128, 145);
      g.fillStyle(0x8d6649);
      g.fillRect(x + 110, 143, 20, 14);
    }
    g.fillStyle(0x4f98af);
    g.fillRect(3480, 455, 210, 45);
  } else if (stage === 1) {
    // Austin skyline, lake, oak trees, construction and a fictional launch site.
    for (let x = left; x < level.right; x += 180) {
      const height = 100 + (((x - left) / 180) % 5) * 34;
      g.fillStyle(0x7097ad);
      g.fillRect(x, 400 - height, 130, height);
      g.fillStyle(0xd0f1e7);
      for (let y = 420 - height; y < 390; y += 25)
        for (let n = 0; n < 3; n++) g.fillRect(x + 18 + n * 32, y, 14, 10);
    }
    g.fillStyle(0x478fa8);
    g.fillRect(left, 402, width, 65);
    g.fillStyle(0x94b88a);
    g.fillRect(left, 467, width, 33);
    for (let x = left + 400; x < level.right - 700; x += 900) {
      g.fillStyle(0x75634e);
      g.fillRect(x, 398, 13, 85);
      g.fillStyle(0x467e68);
      g.fillCircle(x + 7, 384, 47);
      g.fillCircle(x - 23, 401, 31);
      g.fillCircle(x + 38, 400, 32);
    }
    g.lineStyle(5, 0xe3a64e);
    g.lineBetween(left + 850, 235, left + 850, 410);
    g.lineBetween(left + 760, 240, left + 1120, 240);
    const rocket = level.end - 380;
    g.fillStyle(0x667d91);
    g.fillRect(rocket - 95, 210, 22, 290);
    g.lineStyle(3, 0xb9cfdf);
    for (let y = 230; y < 490; y += 40) g.strokeRect(rocket - 95, y, 85, 35);
    g.fillStyle(0xf3f2df);
    g.fillRoundedRect(rocket - 30, 320, 60, 165, 22);
    g.fillTriangle(rocket - 30, 340, rocket, 278, rocket + 30, 340);
    g.fillStyle(0xca6652);
    g.fillTriangle(rocket - 30, 445, rocket - 65, 495, rocket - 25, 480);
    g.fillTriangle(rocket + 30, 445, rocket + 65, 495, rocket + 25, 480);
    g.fillStyle(0x397ea0);
    g.fillCircle(rocket, 366, 15);
  } else {
    for (let x = left + 12; x < level.right; x += 83) {
      g.fillStyle(0xe4eaff, 0.7);
      g.fillCircle(x, 30 + (((x - left) * 37) % 320), 1.5);
    }
    g.fillStyle(0x4c95cd);
    g.fillCircle(left + 700, 115, 67);
    g.fillStyle(0x8cbe99);
    g.fillEllipse(left + 678, 100, 50, 25);
    g.fillEllipse(left + 717, 133, 31, 46);
    g.lineStyle(4, 0xe2eef7);
    g.strokeCircle(left + 700, 115, 67);
    for (let x = left - 50; x < level.right; x += 340) {
      g.fillStyle(0x5e657b);
      g.fillTriangle(x, 480, x + 140, 330, x + 380, 480);
    }
    g.fillStyle(0x8a90a1);
    g.fillRect(left, 453, width, 87);
    for (let x = left + 180; x < level.right; x += 410) {
      g.fillStyle(0x626c80);
      g.fillEllipse(x, 478, 100, 24);
      g.lineStyle(3, 0xb5bccd);
      g.strokeEllipse(x, 478, 104, 27);
    }
    const lander = left + 330;
    g.fillStyle(0xe6c778);
    g.fillRect(lander, 382, 70, 70);
    g.fillTriangle(lander, 382, lander + 35, 352, lander + 70, 382);
    g.lineStyle(5, 0xd8e0ef);
    g.lineBetween(lander + 5, 447, lander - 20, 496);
    g.lineBetween(lander + 65, 447, lander + 90, 496);
    g.fillStyle(0x4784aa);
    g.fillRect(lander + 20, 390, 30, 22);
  }
  // Only this destination is built into this scene. Each departure restarts it.
  const x = level.shop;
  g.fillStyle([0xcd8d67, 0x456f88, 0xc1c9d9][stage]);
  g.fillRoundedRect(x - 125, 325, 250, 175, stage === 2 ? 65 : 8);
  g.fillStyle(trim);
  g.fillRect(x - 135, 320, 270, 12);
  g.fillStyle(0x294c60);
  g.fillRoundedRect(x - 24, 411, 48, 89, 20);
  g.fillStyle(0xb9e6e7);
  g.fillRect(x - 98, 390, 45, 42);
  g.fillRect(x + 55, 390, 45, 42);
  scene.add
    .text(x, 350, stores[stage].toUpperCase(), {
      fontSize: "14px",
      color: stage === 2 ? "#20334b" : "#fff7df",
      fontStyle: "bold",
    })
    .setOrigin(0.5);
  scene.add
    .text(x, 400, "ENTER · E", { fontSize: "11px", color: "#fff7df" })
    .setOrigin(0.5);
  g.fillStyle(ground);
  g.fillRect(left, 500, width, 40);
  g.fillStyle(trim);
  g.fillRect(left, 500, width, 7);
  if (stage === 1)
    for (let x = left + 20; x < level.right; x += 110) {
      g.fillStyle(0xf1e7b6);
      g.fillRect(x, 521, 50, 4);
    }
  const platforms = scene.physics.add.staticGroup();
  function floor(x: number, w: number) {
    const p = scene.add.rectangle(x + w / 2, 525, w, 50, 0, 0);
    scene.physics.add.existing(p, true);
    platforms.add(p);
  }
  const gaps =
    stage === 2 ? movingGaps : stage === 0 ? [{ left: 3500, right: 3670 }] : [];
  let start = left;
  for (const gap of gaps) {
    floor(start, gap.left - start);
    start = gap.right;
    g.fillStyle(stage === 2 ? 0x222c43 : 0x478fa8);
    g.fillRect(gap.left, 500, gap.right - gap.left, 40);
  }
  floor(start, level.right - start);
  if (relaxed && stage === 2)
    for (const gap of gaps) {
      floor(gap.left, gap.right - gap.left);
      g.fillStyle(0xa2c0d9);
      g.fillRect(gap.left, 501, gap.right - gap.left, 7);
    }
  if (stage === 0) {
    g.fillStyle(0x6c8e7b);
    g.fillRect(3480, 485, 210, 14);
    floor(3480, 210);
  }
  const ledges =
    stage === 0
      ? [
          { x: 700, y: 407, w: 190 },
          { x: 3210, y: 410, w: 200 },
        ]
      : stage === 1
        ? [
            { x: 8600, y: 447, w: 190 },
            { x: 8770, y: 399, w: 210 },
            { x: 8950, y: 353, w: 230 },
          ]
        : [
            { x: 16300, y: 370, w: 160 },
            { x: 18800, y: 330, w: 210 },
          ];
  for (const p of ledges) {
    g.fillStyle(stage === 0 ? 0xb47955 : stage === 1 ? 0x47647a : 0x6c849f);
    g.fillRoundedRect(p.x, p.y, p.w, 19, 6);
    g.fillStyle(trim);
    g.fillRect(p.x + 4, p.y, p.w - 8, 5);
    const r = scene.add.rectangle(p.x + p.w / 2, p.y + 10, p.w, 20, 0, 0);
    scene.physics.add.existing(r, true);
    platforms.add(r);
  }
  const sign = (x: number, text: string) =>
    scene.add
      .text(x, 425, text, {
        fontFamily: "sans-serif",
        fontSize: "13px",
        color: "#fff8e3",
        backgroundColor: "#294c49",
        padding: { x: 11, y: 7 },
      })
      .setOrigin(0.5);
  sign(
    level.start + 190,
    stage === 2
      ? "LOW GRAVITY · Longer jumps"
      : stage === 1
        ? "AUSTIN · Jump construction steps"
        : "ALBUQUERQUE · Move & jump",
  );
  sign(level.shop - 240, "STORE AHEAD · Enter with E");
  sign(level.safe, "SAFE CHECKPOINT");
  for (const loop of loopTracks.filter(
    (t) => t.x > left && t.x < level.right,
  )) {
    g.lineStyle(43, stage === 0 ? 0x925d42 : 0x3f536e);
    g.strokeCircle(loop.x, loop.y, loop.radius + 33);
    g.lineStyle(32, stage === 0 ? 0xd9a36e : stage === 1 ? 0x6f9caa : 0x9fb6cf);
    g.strokeCircle(loop.x, loop.y, loop.radius + 33);
    g.lineStyle(6, trim);
    g.strokeCircle(loop.x, loop.y, loop.radius + 17);
    sign(loop.x - 330, "LOOP AHEAD · Keep running →");
  }
  sign(
    level.end - 180,
    stage === 1
      ? "AUSTIN LAUNCH WORKS · CHECKPOINT"
      : stage === 2
        ? "MOON BASE · ECONOMICS CHECKPOINT"
        : "BUS TO AUSTIN · ECONOMICS CHECKPOINT",
  );
  g.fillStyle(trim);
  g.fillRoundedRect(level.end - 22, 405, 44, 89, 14);
  scene.add
    .text(level.end, 420, String(stage + 1).padStart(2, "0"), {
      fontSize: "19px",
      color: "#294c49",
      fontStyle: "bold",
    })
    .setOrigin(0.5);
  scene.add
    .text(
      left + 30,
      35,
      stage === 0
        ? "ALBUQUERQUE · NEW MEXICO"
        : stage === 1
          ? "AUSTIN · TEXAS"
          : "TRANQUILITY TRAIL · THE MOON",
      { fontSize: "19px", color: ink, fontStyle: "bold" },
    )
    .setOrigin(0, 0.5);
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
  for (const [key, color] of [
    ["chip", 0x68c8d1],
    ["crystal", 0xc1a2ff],
  ] as const) {
    const item = scene.make.graphics({ x: 0, y: 0 });
    item.fillStyle(color);
    if (key === "chip") {
      item.fillRoundedRect(3, 3, 20, 20, 3);
      item.lineStyle(2, 0x22475f);
      item.strokeRect(7, 7, 12, 12);
    } else {
      item.fillTriangle(12, 0, 2, 13, 12, 25);
      item.fillStyle(0xe4d5ff);
      item.fillTriangle(12, 0, 22, 13, 12, 25);
    }
    item.generateTexture(key, 26, 26);
    item.destroy();
  }
  const barrier = scene.make.graphics({ x: 0, y: 0 });
  barrier.fillStyle(0xea9c47);
  barrier.fillRoundedRect(2, 5, 46, 38, 4);
  barrier.lineStyle(7, 0xffecc5);
  barrier.lineBetween(7, 33, 23, 13);
  barrier.lineBetween(28, 33, 43, 13);
  barrier.generateTexture("barrier", 50, 50);
  barrier.destroy();
  const laser = scene.make.graphics({ x: 0, y: 0 });
  laser.fillStyle(0x82cdda, 0.5);
  laser.fillRect(8, 8, 36, 72);
  laser.lineStyle(3, 0xc2f5ff);
  for (let y = 12; y < 80; y += 14) laser.lineBetween(8, y, 44, y);
  laser.fillStyle(0x899ab5);
  laser.fillRect(2, 0, 48, 8);
  laser.fillRect(2, 80, 48, 8);
  laser.generateTexture("energy", 52, 88);
  laser.destroy();
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
