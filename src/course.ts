/** Each destination now has three times its original playable distance. */
export const WORLD_WIDTH = 66200;
export const levels = [
  {
    id: 0,
    name: "Albuquerque",
    start: 180,
    left: 0,
    end: 21240,
    right: 22000,
    shop: 8200,
    safe: 13000,
    description:
      "A longer Sandia foothills trail: learn the tumbleweeds, visit the river store, then choose high ledges or the hazard-filled ground route.",
  },
  {
    id: 1,
    name: "Houston, Texas",
    start: 23180,
    left: 23000,
    end: 43640,
    right: 44400,
    shop: 31200,
    safe: 36000,
    description:
      "Cross construction steps and moving barriers before shopping. Explore elevated city routes on the way to the fictional Houston Launch Works.",
  },
  {
    id: 2,
    name: "The Moon",
    start: 45580,
    left: 45400,
    end: 65440,
    right: 66200,
    shop: 53600,
    safe: 58400,
    description:
      "A long low-gravity expedition: timed energy gates, meteorites, high lunar shelves and four moving-platform crossings.",
  },
];
export const FINISH_X = levels[2].end;
export const SHOP_X = levels[0].shop;
export const checkpoints = levels.map((l) => ({
  x: l.end,
  label: `Level ${l.id + 1} · Economics checkpoint`,
}));
export const loopTracks = levels.flatMap((l) =>
  [2200, 4800, 9000, 12600, 15900, 19000].map((x) => ({
    x: l.left + x,
    y: 315,
    radius: 150,
  })),
);
export const movingGaps = [10500, 13700, 17400, 19600].map((x, i) => ({
  left: levels[2].left + x,
  right: levels[2].left + x + 160 + i * 10,
}));
export const obstacles: {
  level: number;
  x: number;
  kind: "tumbleweed" | "boulder" | "wind";
}[] = [
  ...[3300, 6100, 10500, 11050, 14650, 17000, 18200, 20400].map((x) => ({
    level: 0,
    x,
    kind: "tumbleweed" as const,
  })),
  ...[1700, 3500, 6000, 10300, 11050, 14650, 17300, 19800].map((x) => ({
    level: 1,
    x: levels[1].left + x,
    kind: "boulder" as const,
  })),
  ...[1050, 2900, 6500, 11100, 14800, 18000].map((x) => ({
    level: 2,
    x: levels[2].left + x,
    kind: "wind" as const,
  })),
  ...[7500, 11900, 16800].map((x) => ({
    level: 2,
    x: levels[2].left + x,
    kind: "boulder" as const,
  })),
];
/** Compact introductory trails and six-coin crowns following every loop. */
export const coinPositions = levels.flatMap((level) => [
  ...[380, 1350].flatMap((start) =>
    Array.from({ length: 7 }, (_, i) => ({
      x: level.left + start + i * 35,
      y: 442,
    })),
  ),
  ...loopTracks
    .filter((t) => t.x > level.left && t.x < level.right)
    .flatMap((t) =>
      Array.from({ length: 6 }, (_, i) => {
        const angle = Math.PI + (i - 2.5) * 0.2;
        return {
          x: t.x + Math.sin(angle) * t.radius,
          y: t.y + Math.cos(angle) * t.radius,
        };
      }),
    ),
]);
export const ledgesFor = (id: number) => {
  const left = levels[id].left;
  const intro =
    id === 0
      ? [
          { x: 700, y: 407, w: 190 },
          { x: 3210, y: 410, w: 200 },
        ]
      : id === 1
        ? [
            { x: 800, y: 447, w: 190 },
            { x: 970, y: 399, w: 210 },
            { x: 1150, y: 353, w: 230 },
          ]
        : [
            { x: 700, y: 370, w: 160 },
            { x: 3200, y: 330, w: 210 },
          ];
  const routes = [10750, 14350].flatMap((x) => [
    { x: x - 350, y: id === 2 ? 380 : 425, w: 150 },
    { x, y: id === 2 ? 300 : 360, w: 500 },
  ]);
  const extra =
    id === 1
      ? [
          { x: 16500, y: 447, w: 190 },
          { x: 16670, y: 399, w: 210 },
          { x: 16850, y: 353, w: 230 },
        ]
      : [];
  return [...intro, ...routes, ...extra].map((p) => ({ ...p, x: left + p.x }));
};
