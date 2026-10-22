import { progress } from "./state";
export const stores = [
  "Sunstone Supply",
  "Houston Launch Outfitters",
  "Tranquility Trading Post",
];
export const inventories = [
  [
    {
      id: "shield",
      name: "Trail shield",
      icon: "◌",
      price: 26,
      description:
        "Absorbs three hazard hits. Useful on the longer ground route; unused shields carry onward.",
    },
    {
      id: "boost",
      name: "Spring step",
      icon: "↑",
      price: 25,
      description:
        "Higher jumps for the rest of this stage. Reach the high route directly instead of climbing the lower steps.",
    },
  ],
  [
    {
      id: "magnet",
      name: "Coin magnet",
      icon: "⌁",
      price: 38,
      description:
        "Collects coins within 340 pixels for the rest of this stage. Collect loop-crown coins from the ground route.",
    },
    {
      id: "boots",
      name: "Speed boots",
      icon: "»",
      price: 37,
      description:
        "Run 25% faster for the rest of this stage. Clear elevated route gaps more easily; assisted loops keep their safe speed.",
    },
  ],
  [
    {
      id: "armor",
      name: "Meteor armor",
      icon: "◇",
      price: 50,
      description:
        "Adds five shields against meteorites and energy gates. Stays until used.",
    },
    {
      id: "jets",
      name: "Lunar jump jets",
      icon: "⇧",
      price: 49,
      description:
        "Eight midair boosts. Release Jump, then press it again in the air to use one.",
    },
  ],
];
export function purchase(id: string): boolean {
  const item = inventories[progress.level].find((item) => item.id === id);
  if (!item || progress.tokens < item.price || progress.purchases.includes(id))
    return false;
  progress.tokens -= item.price;
  if (id === "shield") progress.shield += 3;
  if (id === "boost") progress.boost = 1;
  if (id === "magnet") progress.magnet = 1;
  if (id === "boots") progress.boots = 1;
  if (id === "armor") progress.shield += 5;
  if (id === "jets") progress.jets += 8;
  progress.purchases.push(id);
  return true;
}
