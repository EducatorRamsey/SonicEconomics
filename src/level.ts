import Phaser from "phaser";
export const WORLD_WIDTH = 5580;
export const checkpoints = [
  { x: 940, label: "01 · Water for the town" },
  { x: 2440, label: "02 · An afternoon choice" },
  { x: 4390, label: "03 · Trail supplies" },
];
export const hazardPositions = [1330, 2790, 4010, 4770];
export const tokenPositions = [
  ...Array.from({ length: 6 }, (_, i) => ({ x: 380 + i * 90, y: 442 })),
  ...Array.from({ length: 34 }, (_, i) => ({
    x: 1880 + i * 94,
    y: i % 9 === 4 ? 365 : 442,
  })),
];
export function drawLevel(scene: Phaser.Scene) {
  const g = scene.add.graphics();
  g.fillGradientStyle(0xf3ddaf, 0xf3ddaf, 0xffeed0, 0xffeed0, 1);
  g.fillRect(0, 0, WORLD_WIDTH, 540);
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
  for (let x = 140; x < WORLD_WIDTH; x += 480) {
    g.fillStyle(0x708764);
    g.fillRoundedRect(x, 361, 14, 98, 6);
    g.fillRoundedRect(x - 24, 388, 12, 39, 5);
    g.fillRoundedRect(x - 24, 415, 30, 12, 5);
    g.fillRoundedRect(x + 24, 372, 12, 42, 5);
    g.fillRoundedRect(x + 8, 402, 28, 12, 5);
  }
  // Adobe village, a locally drawn landmark at the safe shop.
  for (let i = 0; i < 3; i++) {
    const x = 1560 + i * 92;
    g.fillStyle([0xd38c65, 0xe4ae7c, 0xcb805e][i]);
    g.fillRect(x, 355 - i * 13, 86, 109 + i * 13);
    g.fillStyle(0x855744);
    g.fillRect(x - 5, 351 - i * 13, 96, 9);
    g.fillStyle(0x49605b);
    g.fillRoundedRect(x + 28, 402, 29, 62, 12);
    g.fillStyle(0xf7d69a);
    g.fillRect(x + 12, 376, 15, 19);
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
  floor(0, 3500);
  floor(3670, WORLD_WIDTH - 3670);
  // Small optional ravine, with a broad bridge requiring no jump.
  g.fillStyle(0x805d4d);
  g.fillRect(3500, 507, 170, 33);
  g.fillStyle(0x6c8e7b);
  g.fillRect(3480, 485, 210, 14);
  floor(3480, 210);
  for (const p of [
    { x: 700, y: 407, w: 190 },
    { x: 2070, y: 411, w: 220 },
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
  sign(1710, "TRAIL SHOP");
  sign(3600, "EASY BRIDGE");
  checkpoints.forEach((c, i) => {
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
  g.fillRect(5215, 350, 8, 150);
  g.fillStyle(0xfaf0d4);
  g.fillTriangle(5223, 352, 5320, 377, 5223, 405);
  scene.add
    .text(5210, 319, "TRAIL’S END", {
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
