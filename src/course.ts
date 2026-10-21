/** Course positions shared by scenery, gameplay, menus, and browser tests. */
export const WORLD_WIDTH = 23200;
export const FINISH_X = 22800;
export const SHOP_X = 7500;
export const checkpoints = [
  { x: 6500, label: "01 · Water for the town" },
  { x: 14200, label: "02 · An afternoon choice" },
  { x: 21800, label: "03 · Trail supplies" },
];
export const loopTracks = [2200, 4800, 10000, 12500, 17500, 20000].map((x) => ({
  x,
  y: 315,
  radius: 150,
}));
