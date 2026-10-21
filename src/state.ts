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
const fresh = (): Progress => ({
  campaign: 4,
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
// Restart older routes with the new destinations, retaining earned supplies.
if (raw && raw.campaign !== 4) {
  progress = {
    ...fresh(),
    tokens: progress.tokens,
    hearts: progress.hearts,
    shield: progress.shield,
    boost: progress.boost,
    purchases: progress.purchases,
  };
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
  progress = fresh();
  save();
  return progress;
}
