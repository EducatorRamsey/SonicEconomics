/** Campaign geometry shared by scenery, game rules, menus, and tests. */
export const WORLD_WIDTH = 23200;
export const levels = [
  {
    id: 0,
    name: "Albuquerque",
    start: 180,
    left: 0,
    end: 7200,
    right: 7600,
    shop: 1200,
    safe: 3900,
    description:
      "Run beneath the Sandia Mountains, cross the Rio Grande, and loop through Albuquerque.",
  },
  {
    id: 1,
    name: "Austin, Texas",
    start: 7980,
    left: 7800,
    end: 14800,
    right: 15200,
    shop: 8200,
    safe: 11600,
    description:
      "Road trip to Austin! Jump construction barriers, race through the skyline, and reach the fictional Austin Launch Works.",
  },
  {
    id: 2,
    name: "The Moon",
    start: 15780,
    left: 15600,
    end: 22400,
    right: 23200,
    shop: 16000,
    safe: 20500,
    description:
      "Touch down on the Moon! Float through low gravity, dodge timed energy gates and rolling meteorites, and cross lunar platforms. Relaxed mode adds safety paths.",
  },
];
export const FINISH_X = levels[2].end;
export const SHOP_X = levels[0].shop;
export const checkpoints = levels.map((l) => ({
  x: l.end,
  label: `Level ${l.id + 1} · Economics checkpoint`,
}));
export const loopTracks = [2200, 4800, 10000, 12500, 17500, 20000].map((x) => ({
  x,
  y: 315,
  radius: 150,
}));
export const movingGaps = [
  { left: 20750, right: 20910 },
  { left: 21900, right: 22080 },
];
export const obstacles = [
  { level: 0, x: 3300, kind: "tumbleweed" },
  { level: 0, x: 5900, kind: "tumbleweed" },
  { level: 1, x: 9500, kind: "boulder" },
  { level: 1, x: 11300, kind: "boulder" },
  { level: 1, x: 13700, kind: "boulder" },
  { level: 2, x: 16650, kind: "wind" },
  { level: 2, x: 18500, kind: "wind" },
  { level: 2, x: 21300, kind: "wind" },
  { level: 2, x: 19800, kind: "boulder" },
] as const;
