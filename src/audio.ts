import { settings } from "./state";
let context: AudioContext | undefined;
let musicTimer: ReturnType<typeof setInterval> | undefined;
let step = 0;
function tone(
  frequency: number,
  duration: number,
  volume: number,
  type: OscillatorType = "sine",
) {
  if (!volume) return;
  try {
    context ??= new AudioContext();
    void context.resume();
    const o = context.createOscillator(),
      g = context.createGain();
    o.type = type;
    o.frequency.value = frequency;
    g.gain.setValueAtTime(0, context.currentTime);
    g.gain.linearRampToValueAtTime(volume * 0.12, context.currentTime + 0.025);
    g.gain.exponentialRampToValueAtTime(0.001, context.currentTime + duration);
    o.connect(g);
    g.connect(context.destination);
    o.start();
    o.stop(context.currentTime + duration);
  } catch {
    /* audio is optional */
  }
}
export function cue(kind: "token" | "jump" | "reward" | "hit") {
  const f = { token: 660, jump: 330, reward: 880, hit: 165 }[kind];
  tone(f, 0.18, settings.sound);
}
export function music(active: boolean) {
  clearInterval(musicTimer);
  musicTimer = undefined;
  if (active && settings.music > 0) {
    const notes = [220, 277.18, 329.63, 277.18, 246.94, 329.63, 369.99, 329.63];
    musicTimer = setInterval(
      () =>
        tone(
          notes[step++ % notes.length],
          0.65,
          settings.music * 0.35,
          "triangle",
        ),
      700,
    );
  }
}
export function stopSpeech() {
  window.speechSynthesis?.cancel();
}
export function narrate(text: string) {
  stopSpeech();
  if ("speechSynthesis" in window) {
    const u = new SpeechSynthesisUtterance(text);
    u.rate = settings.speechRate;
    window.speechSynthesis.speak(u);
  }
}
