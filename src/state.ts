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
  x: number;
  tokens: number;
  hearts: number;
  shield: number;
  boost: number;
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
  x: 180,
  tokens: 0,
  hearts: 3,
  shield: 0,
  boost: 0,
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
