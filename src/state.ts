import type { QuizAttempt } from "./questions";
import { levels } from "./course";
export interface Settings {
  loops: boolean;
  mode: "relaxed" | "challenge";
  speed: number;
  sound: number;
  music: number;
  reduced: boolean;
  speechRate: number;
  left: string;
  right: string;
  jump: string;
}
export interface Progress {
  campaign: number;
  over: boolean;
  attempt: QuizAttempt | null;
  scores: number[];
  pendingGate: number | null;
  level: number;
  completedLevels: number[];
  x: number;
  tokens: number;
  hearts: number;
  shield: number;
  boost: number;
  magnet: number;
  boots: number;
  jets: number;
  elapsed: number;
  answered: number[];
  helped: number[];
  collected: number[];
  finished: boolean;
  purchases: string[];
}
export const defaults: Settings = {
  loops: true,
  mode: "relaxed",
  speed: 1,
  sound: 0.3,
  music: 0,
  reduced: false,
  speechRate: 0.9,
  left: "A",
  right: "D",
  jump: "SPACE",
};
const storedPrizes = read("rr-prizes");
export const wardrobe: number[] = Array.isArray(storedPrizes)
  ? storedPrizes.filter((id) => [0, 1, 2].includes(id))
  : [];
const fresh = (): Progress => ({
  campaign: 6,
  over: false,
  attempt: null,
  scores: [0, 0, 0],
  level: 0,
  completedLevels: [],
  pendingGate: null,
  x: 180,
  tokens: 0,
  hearts: 3,
  shield: 0,
  boost: 0,
  magnet: 0,
  boots: 0,
  jets: 0,
  elapsed: 0,
  answered: [],
  helped: [],
  collected: [],
  finished: false,
  purchases: [],
});
function read(key: string): unknown {
  try {
    return JSON.parse(localStorage.getItem(key) || "null");
  } catch {
    return null;
  }
}
export let storageAvailable = true;
export const settings: Settings = Object.assign(
  {},
  defaults,
  read("rr-settings"),
);
// Ignore malformed or obsolete saves rather than preventing play.
const raw = read("rr-progress") as Partial<Progress> | null;
export let progress: Progress =
  raw &&
  typeof raw.x === "number" &&
  Array.isArray(raw.answered) &&
  Array.isArray(raw.collected)
    ? { ...fresh(), ...raw }
    : fresh();
// Old wallets would bypass the new scarcity balance. Keep a local backup and
// start the longer campaign fresh; comfort settings are independent.
if (raw && raw.campaign !== 6) {
  try {
    localStorage.setItem("rr-previous-campaign", JSON.stringify(raw));
  } catch {}
  progress = fresh();
}
progress.level = Math.min(2, Math.max(0, Math.floor(progress.level)));
progress.x = Math.min(
  levels[progress.level].end - 80,
  Math.max(levels[progress.level].start, progress.x),
);
export function hasSave() {
  return !!raw || !!read("rr-progress");
}
export function save() {
  try {
    localStorage.setItem("rr-settings", JSON.stringify(settings));
    localStorage.setItem("rr-progress", JSON.stringify(progress));
    localStorage.setItem("rr-prizes", JSON.stringify(wardrobe));
  } catch {
    storageAvailable = false;
  }
}
export function saveSettings() {
  try {
    localStorage.setItem("rr-settings", JSON.stringify(settings));
  } catch {
    storageAvailable = false;
  }
}
export function newGame() {
  wardrobe.length = 0;
  progress = fresh();
  save();
  return progress;
}

export function awardPrize(id: number) {
  if (wardrobe.includes(id)) return false;
  wardrobe.push(id);
  if (id === 1) progress.shield++;
  if (id === 2) progress.jets += 4;
  save();
  return true;
}
