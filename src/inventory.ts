import { progress } from "./state";
export const stores = [
  "Sunstone Supply",
  "Austin Launch Outfitters",
  "Tranquility Trading Post",
];
export const inventories = [
  [
    {
      id: "shield",
      name: "Trail shield",
      icon: "◌",
      price: 6,
      description: "Protects one heart from a hazard. Stays until used.",
    },
    {
      id: "boost",
      name: "Spring step",
      icon: "↑",
      price: 4,
      description: "Higher jumps for 25 seconds of outdoor play.",
    },
  ],
  [
    {
      id: "magnet",
      name: "Chip magnet",
      icon: "⌁",
      price: 8,
      description:
        "Collects currency within 150 pixels for 40 seconds of outdoor play.",
    },
    {
      id: "boots",
      name: "Speed boots",
      icon: "»",
      price: 10,
      description:
        "Run 25% faster for 35 seconds of outdoor play. Loops keep their safe speed.",
    },
  ],
  [
    {
      id: "armor",
      name: "Meteor armor",
      icon: "◇",
      price: 12,
      description:
        "Adds three shields against meteorites and energy gates. Stays until used.",
    },
    {
      id: "jets",
      name: "Lunar jump jets",
      icon: "⇧",
      price: 9,
      description:
        "Three midair boosts. Release Jump, then press it again in the air to use one.",
    },
  ],
];
export function purchase(id: string): boolean {
  const item = inventories[progress.level].find((item) => item.id === id);
  if (!item || progress.tokens < item.price) return false;
  progress.tokens -= item.price;
  if (id === "shield") progress.shield++;
  if (id === "boost") progress.boost = 25;
  if (id === "magnet") progress.magnet = 40;
  if (id === "boots") progress.boots = 35;
  if (id === "armor") progress.shield += 3;
  if (id === "jets") progress.jets += 3;
  progress.purchases.push(id);
  return true;
}
