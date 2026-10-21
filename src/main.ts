import Phaser from "phaser";
import { enableFullscreen } from "./fullscreen";
import { Desert } from "./game";
import {
  settings,
  progress,
  newGame,
  save,
  saveSettings,
  hasSave,
  storageAvailable,
} from "./state";
import { questions } from "./questions";
import { answerQuestion } from "./economics";
import { checkpoints } from "./course";
import { music, narrate, stopSpeech, cue } from "./audio";
import "./style.css";
const app = document.querySelector<HTMLDivElement>("#app")!;
app.innerHTML = `<header class="site-header"><a class="brand" href="./" aria-label="Roadrunner Rush home"><span class="brand-icon"><svg width="25" height="25" viewBox="0 0 32 32" aria-hidden="true"><path d="M7 25 25 7H12M25 7v13" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg></span><span>ROADRUNNER<span class="brand-light"> RUSH</span></span></a><span class="edition">NEW MEXICO · LOOP TRAIL EDITION</span><button id="global-settings" class="quiet">⚙ <span>Settings</span></button></header>
<main><div class="page-intro"><div><span class="eyebrow">THE DESERT TRAIL · FIRST ADVENTURE</span><h1>Find your own way.</h1><p>A roadrunner, an open trail, and a few choices along the way.</p></div><span class="mode-pill" id="mode-pill">◉ Relaxed adventure</span></div>
<section class="game-shell" aria-label="Roadrunner Rush game"><div class="game-toolbar"><div class="trail-label"><span class="live-dot"></span> NEW MEXICO TRAIL <span class="divider">/</span> <span id="area">Practice trail</span></div><div class="stats"><span id="hearts" aria-label="3 hearts">♥ ♥ ♥</span><span class="token-stat">◈ <b id="tokens">0</b></span><span id="power"></span><span id="timer" hidden></span><button id="fullscreen" class="toolbar-btn" aria-pressed="false" title="Full screen (F)">Full screen</button><button id="game-settings" class="toolbar-btn">Settings</button><button id="pause" class="toolbar-btn" aria-label="Pause game"><span aria-hidden="true" class="pause-icon"></span><span>Pause</span></button></div></div><div id="stage"><div id="canvas" role="img" aria-label="Side-scrolling desert platformer. Use arrow keys or A and D to move, Space to jump."></div><div class="trail-progress" aria-label="Economics checkpoints"><span id="gate-0">01 <i>Scarcity</i></span><span id="gate-1">02 <i>Opportunity cost</i></span><span id="gate-2">03 <i>Trade-offs</i></span></div><div id="notice" role="status" aria-live="polite"></div><button id="rest-open" class="primary rest-prompt" hidden>Optional question · E</button><button id="shop-open" class="primary shop-prompt" hidden>Visit trail shop · E</button><div id="overlay"></div></div>
<div class="control-bar"><div class="keyboard-guide"><kbd>←</kbd><kbd>→</kbd><span>or A / D to move</span><kbd>SPACE</kbd><span>to jump</span></div><span class="comfort-note">Build momentum. Find your flow.</span><div class="touch-controls" aria-label="Touch controls"><button data-hold="left" aria-label="Move left">← Left</button><button data-hold="right" aria-label="Move right">Right →</button><button data-hold="jump" aria-label="Jump">↑ Jump</button></div></div></section>
<section class="below-game"><div><span class="mini-icon">✦</span><div><h2>Small choices. Big discoveries.</h2><p>Run the loops. Stop for economics when you choose, or practice after the finish.</p></div></div><div class="privacy-note"><span>⌂</span> Progress stays on this device.<br>No accounts. Just adventure.</div></section><p class="save-note" id="save-note">Loop Trail v2 · Original art & sound · Play with keyboard, mouse, or touch</p></main>`;
const $ = <T extends HTMLElement = HTMLElement>(id: string) =>
  document.getElementById(id) as T;
const scene = new Desert();
let screen = "title";
let engineReady = false;
let nearbyRest: number | null = null;
let reviewing = false;
let previous = "title";
let noticeTimer: ReturnType<typeof setTimeout>;
function hud() {
  document.querySelector(".keyboard-guide span")!.textContent =
    `or ${settings.left} / ${settings.right} to move`;
  document.querySelectorAll(".keyboard-guide kbd")[2].textContent =
    settings.jump;
  $("tokens").textContent = String(progress.tokens);
  $("hearts").textContent =
    "♥ ".repeat(progress.hearts) + "♡ ".repeat(3 - progress.hearts);
  $("hearts").setAttribute("aria-label", `${progress.hearts} hearts`);
  $("power").textContent =
    `${progress.shield ? `◌ Shield ×${progress.shield} ` : ""}${progress.boost > 0 ? `↑ ${Math.ceil(progress.boost)}s` : ""}`;
  $("timer").hidden = settings.mode !== "challenge";
  $("timer").textContent =
    `${Math.floor(progress.elapsed / 60)}:${String(Math.floor(progress.elapsed % 60)).padStart(2, "0")}`;
  $("mode-pill").textContent =
    settings.mode === "relaxed"
      ? "◉ Relaxed adventure"
      : "◷ Challenge · elapsed time";
  questions.forEach((_, i) =>
    $("gate-" + i).classList.toggle("done", progress.answered.includes(i)),
  );
  $("area").textContent =
    progress.answered.length === 0
      ? "Practice trail"
      : progress.answered.length === 3
        ? "The home stretch"
        : `Checkpoint ${progress.answered.length} complete`;
  if (!storageAvailable)
    $("save-note").textContent =
      "Storage is unavailable. You can play, but progress will not persist after closing.";
}
function notice(message: string) {
  $("notice").textContent = message;
  clearTimeout(noticeTimer);
  noticeTimer = setTimeout(() => ($("notice").textContent = ""), 6500);
}
scene.connect({
  rest: (id) => {
    nearbyRest = id;
    $("rest-open").hidden = id === null;
    if (id !== null)
      $("rest-open").textContent =
        `Optional rest stop ${id + 1} · Question · E`;
  },
  ready: () => {
    if (!engineReady) {
      engineReady = true;
      title();
      hud();
    }
  },
  question: question,
  finish: ending,
  hud,
  nearby: (yes) => {
    $("shop-open").hidden = !yes;
  },
  notice,
});
const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: "canvas",
  width: 960,
  height: 540,
  backgroundColor: "#f3ddaf",
  physics: {
    default: "arcade",
    arcade: { gravity: { x: 0, y: 1120 }, debug: false },
  },
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  scene: [scene],
  render: { antialias: true },
  input: { keyboard: true },
});
const toggleFullscreen = enableFullscreen(
  document.querySelector<HTMLElement>(".game-shell")!,
  $("fullscreen") as HTMLButtonElement,
  () => {
    if (game.isBooted) game.scale.refresh();
  },
);
function modal(kind: string, html: string, wide = false) {
  screen = kind;
  scene.setPlaying(false);
  stopSpeech();
  $("overlay").innerHTML =
    `<div class="modal-shade ${kind === "title" ? "title-shade" : ""}"><section role="dialog" aria-modal="true" aria-labelledby="dialog-title" class="panel ${wide ? "wide" : ""} ${kind === "title" ? "title-panel" : ""}">${html}</section>${kind === "title" ? '<img class="hero-bird" src="./roadrunner.svg" alt="An original turquoise roadrunner with a swept crest, long tail, and curious eyes">' : ""}</div>`;
  $("overlay").hidden = false;
  scene.input?.keyboard?.disableGlobalCapture();
  requestAnimationFrame(() => {
    $("overlay").querySelector<HTMLElement>("button, input, select")?.focus();
  });
}
function play() {
  screen = "play";
  stopSpeech();
  $("overlay").hidden = true;
  $("overlay").innerHTML = "";
  scene.input?.keyboard?.enableGlobalCapture();
  scene.player?.bind();
  scene.setPlaying(true);
  hud();
  $("pause").focus();
}
function button(id: string, fn: () => void) {
  $(id).addEventListener("click", fn);
}
function title() {
  modal(
    "title",
    `<div class="eyebrow">WELCOME TO SUNSTONE VALLEY</div><h2 id="dialog-title">Roadrunner<br><em>Rush.</em></h2><p class="lead">A wide-open trail.<br>A little curiosity. Your next adventure.</p><p class="title-detail">Collect tokens, explore the desert, and discover the economics of everyday choices.</p><div class="title-actions"><button class="primary" id="start">${hasSave() ? "New game" : "Let’s hit the trail"} <span>→</span></button>${hasSave() ? '<button class="secondary" id="continue-save">Continue adventure</button>' : ""}<button class="text-btn" id="title-settings">Adjust your experience</button><button class="text-btn" id="title-fullscreen">Play in full screen</button></div><div class="gentle-label">♡ No countdown. No game over. Just keep exploring.</div>`,
  );
  button("start", () => {
    if (hasSave()) confirmNew();
    else begin();
  });
  if (hasSave())
    button("continue-save", () => {
      if (progress.finished) ending();
      else play();
    });
  button("title-settings", openSettings);
  button("title-fullscreen", () => void toggleFullscreen());
}
function begin() {
  reviewing = false;
  newGame();
  scene.reset();
  play();
  notice(
    "Practice, then build speed → Hold a direction through the loops. Questions are optional at rest stops.",
  );
}
function confirmNew() {
  const back = screen;
  modal(
    "confirm",
    `<span class="eyebrow">A FRESH TRAIL</span><h2 id="dialog-title">Start a new adventure?</h2><p>This resets tokens, answers, and checkpoint progress. Your comfort settings stay the same.</p><button id="confirm-new" class="primary">Start new game</button><button id="cancel-new" class="secondary">Keep my adventure</button>`,
  );
  button("confirm-new", begin);
  button("cancel-new", () =>
    back === "title" ? title() : back === "ending" ? ending() : pause(),
  );
}
function pause() {
  if (screen === "question") return;
  modal(
    "pause",
    `<span class="eyebrow">TAKE YOUR TIME</span><h2 id="dialog-title">A moment in the shade.</h2><p>Your adventure is paused. Everything will be right here.</p><div class="stack"><button id="resume" class="primary">Resume adventure →</button><button id="pause-settings" class="secondary">Settings & accessibility</button><button id="restart" class="secondary">Restart · new game</button><button id="home" class="text-btn">Save & return to title</button></div>`,
  );
  button("resume", play);
  button("pause-settings", openSettings);
  button("restart", confirmNew);
  button("home", () => {
    save();
    title();
  });
}
let currentQuestion = -1;
function question(id: number) {
  currentQuestion = id;
  const q = questions[id];
  modal(
    "question",
    `<div class="question-top"><span class="eyebrow">TRAIL STOP ${id + 1} OF 3 · ${q.concept}</span><span class="time-badge">No time limit</span></div><h2 id="dialog-title">${q.title}</h2><p class="question-prompt">${q.prompt}</p><div class="narration"><button id="listen" class="small-btn">▷ Listen</button><button id="replay" class="small-btn">↻ Replay</button><button id="stop-speech" class="small-btn">■ Stop</button><label>Voice speed <select id="voice-speed"><option value="0.7">Slower</option><option value="0.9">Gentle</option><option value="1.1">Faster</option></select></label></div><div class="answers">${q.answers.map((a, i) => `<button class="answer" data-answer="${i}"><span>${String.fromCharCode(65 + i)}</span>${a}</button>`).join("")}</div><div id="feedback" role="status" aria-live="polite">Choose an answer. You can try as many times as you like.</div><div class="question-footer"><button id="question-settings" class="text-btn">Settings</button><button id="question-continue" class="primary" disabled>Continue along the trail →</button></div>`,
    true,
  );
  const text = `${q.title}. ${q.prompt}. ${q.answers.map((a, i) => `Answer ${String.fromCharCode(65 + i)}. ${a}`).join(". ")}`;
  button("listen", () => narrate(text));
  button("replay", () => narrate(text));
  button("stop-speech", stopSpeech);
  ($("voice-speed") as HTMLSelectElement).value = String(settings.speechRate);
  $("voice-speed").addEventListener("change", () => {
    settings.speechRate = Number(($("voice-speed") as HTMLSelectElement).value);
    saveSettings();
  });
  if (!("speechSynthesis" in window)) {
    ["listen", "replay", "stop-speech"].forEach(
      (id) => (($(id) as HTMLButtonElement).disabled = true),
    );
    $("feedback").textContent =
      "Browser narration is unavailable. All question text is shown above.";
  }
  document.querySelectorAll<HTMLButtonElement>("[data-answer]").forEach(
    (b) =>
      (b.onclick = () => {
        const outcome = answerQuestion(
          progress,
          id,
          Number(b.dataset.answer),
          checkpoints[id].x + 70,
        );
        if (outcome === "already") return;
        save();
        if (outcome === "correct") {
          cue("reward");
          $("feedback").textContent =
            `That’s it! ${q.explanation} Bonus: one shield added.`;
          $("feedback").className = "correct";
          document
            .querySelectorAll<HTMLButtonElement>("[data-answer]")
            .forEach((a) => (a.disabled = true));
          ($("question-continue") as HTMLButtonElement).disabled = false;
          $("question-continue").focus();
          hud();
        } else {
          $("feedback").textContent =
            `Let’s look again. ${q.explanation} Try another answer.`;
          $("feedback").className = "hint";
        }
      }),
  );
  button("question-continue", () => {
    if (reviewing) {
      const next = questions.find((q) => !progress.answered.includes(q.id));
      if (next) question(next.id);
      else {
        reviewing = false;
        ending();
      }
      return;
    }
    scene.player.setX(Math.max(scene.player.x, progress.x));
    play();
    notice("Checkpoint saved. A shield is ready for your next bump.");
  });
  button("question-settings", openSettings);
}
function shop() {
  if (screen !== "play") return;
  modal(
    "shop",
    `<span class="eyebrow">SUNSTONE SUPPLY CO.</span><h2 id="dialog-title">A choice for the trail.</h2><p>You have <strong id="shop-balance">${progress.tokens}</strong> tokens. Compare the upgrades, or save for later. Neither is needed to finish.</p><div class="shop-cards"><article><span class="upgrade-icon">◌</span><h3>Trail shield</h3><p>Protects you from one hazard hit. Stays until used.</p><button id="buy-shield" class="secondary">Buy shield · 6 tokens</button></article><article><span class="upgrade-icon">↑</span><h3>Spring step</h3><p>Jump higher for 25 seconds of play. Pauses at every stop.</p><button id="buy-boost" class="secondary">Buy jump boost · 4 tokens</button></article></div><p id="shop-feedback" role="status">Limited tokens mean making a choice.</p><button id="leave-shop" class="primary">Save my tokens & continue →</button>`,
    true,
  );
  function refresh() {
    ($("buy-shield") as HTMLButtonElement).disabled = progress.tokens < 6;
    ($("buy-boost") as HTMLButtonElement).disabled = progress.tokens < 4;
    $("shop-balance").textContent = String(progress.tokens);
  }
  function buy(kind: "shield" | "boost") {
    const price = kind === "shield" ? 6 : 4;
    if (progress.tokens < price) return;
    progress.tokens -= price;
    if (kind === "shield") progress.shield++;
    else progress.boost = 25;
    progress.purchases.push(kind);
    save();
    hud();
    refresh();
    $("shop-feedback").textContent =
      kind === "shield"
        ? "Shield ready. It will protect one heart."
        : "Jump boost ready. Enjoy 25 seconds of higher jumps!";
    $("leave-shop").textContent = "Continue along the trail →";
    cue("reward");
  }
  button("buy-shield", () => buy("shield"));
  button("buy-boost", () => buy("boost"));
  button("leave-shop", play);
  refresh();
}
function ending() {
  modal(
    "ending",
    `<span class="eyebrow">SUNSTONE VALLEY · LEVEL COMPLETED</span><div class="finish-art">✦</div><h2 id="dialog-title">A trail well traveled.</h2><p>You finished the New Mexico trail. Choose whether to practice or explore again.</p><div class="result-grid"><div><b>${progress.tokens}</b><span>tokens saved</span></div><div><b>${progress.answered.length} / 3</b><span>questions answered</span></div><div><b>${progress.helped.filter((id) => progress.answered.includes(id)).length}</b><span>answered after help</span></div></div><p><strong>Trail ideas:</strong> scarcity, opportunity cost, and trade-offs. ${progress.answered.length < 3 ? "Practice when you are ready below." : "All three ideas practiced."}</p><ul class="answer-summary">${questions.map((q) => `<li>${q.concept} · ${progress.answered.includes(q.id) ? (progress.helped.includes(q.id) ? "answered after help" : "answered") : "not practiced yet"}</li>`).join("")}</ul><label class="reflection">Optional reflection: What did you give up when you spent your tokens?<textarea placeholder="Think about it, say it aloud, or write here…" rows="2"></textarea></label><p class="fine-print">Your reflection is not saved or sent anywhere.</p>${progress.answered.length < 3 ? '<button id="review-questions" class="primary">Practice the remaining questions</button>' : ""}<button id="again" class="primary">Explore again →</button><button id="end-home" class="secondary">Return to title</button>`,
    true,
  );
  if (progress.answered.length < 3)
    button("review-questions", () => {
      reviewing = true;
      question(questions.find((q) => !progress.answered.includes(q.id))!.id);
    });
  button("again", confirmNew);
  button("end-home", title);
}
function openSettings() {
  previous = screen;
  modal(
    "settings",
    `<span class="eyebrow">MAKE IT YOURS</span><h2 id="dialog-title">Your kind of adventure.</h2><p>Change these anytime. Your choices stay on this device.</p><div class="settings-grid"><label>Adventure mode<select id="setting-mode"><option value="relaxed">Relaxed · no countdown or game over</option><option value="challenge">Challenge · show elapsed time</option></select></label><label>Running speed<select id="setting-speed"><option value="0.7">Gentle</option><option value="1">Cruising</option><option value="1.3">Quick</option></select></label><label>Sound effects <input id="setting-sound" type="range" min="0" max="1" step="0.1" value="${settings.sound}"></label><label>Music <input id="setting-music" type="range" min="0" max="1" step="0.1" value="${settings.music}"></label><label class="check-label"><input id="setting-loops" type="checkbox" ${settings.loops ? "checked" : ""}> Run the loop tracks<br><small>Turn off to keep running along the ground.</small></label><label class="check-label"><input id="setting-reduced" type="checkbox" ${settings.reduced ? "checked" : ""}> Reduced motion<br><small>Immediate camera following; no decorative rotation.</small></label><button id="mute" class="secondary">Mute all audio</button><label>Move left key<select id="setting-left"><option>A</option><option>J</option></select></label><label>Move right key<select id="setting-right"><option>D</option><option>L</option></select></label><label>Jump key<select id="setting-jump"><option value="SPACE">Space</option><option value="K">K</option><option value="W">W</option></select></label><label>Narration speed<select id="setting-speech"><option value="0.7">Slower</option><option value="0.9">Gentle</option><option value="1.1">Faster</option></select></label></div><p class="fine-print">Arrow keys, W, Up, and Space also work. Music and effects can each be set to zero. Challenge time never runs while a menu or question is open.</p><button id="settings-done" class="primary">Save settings & return →</button>`,
    true,
  );
  const values: Record<string, string> = {
    mode: settings.mode,
    speed: String(settings.speed),
    left: settings.left,
    right: settings.right,
    jump: settings.jump,
    speech: String(settings.speechRate),
  };
  Object.entries(values).forEach(
    ([k, v]) => (($("setting-" + k) as HTMLInputElement).value = v),
  );
  button("mute", () => {
    ($("setting-sound") as HTMLInputElement).value = "0";
    ($("setting-music") as HTMLInputElement).value = "0";
    settings.sound = 0;
    settings.music = 0;
    saveSettings();
    stopSpeech();
    music(false);
  });
  button("settings-done", () => {
    settings.mode = ($("setting-mode") as HTMLSelectElement)
      .value as typeof settings.mode;
    settings.speed = Number(($("setting-speed") as HTMLSelectElement).value);
    settings.sound = Number(($("setting-sound") as HTMLInputElement).value);
    settings.music = Number(($("setting-music") as HTMLInputElement).value);
    settings.reduced = ($("setting-reduced") as HTMLInputElement).checked;
    settings.loops = ($("setting-loops") as HTMLInputElement).checked;
    settings.speechRate = Number(
      ($("setting-speech") as HTMLSelectElement).value,
    );
    settings.left = ($("setting-left") as HTMLSelectElement).value;
    settings.right = ($("setting-right") as HTMLSelectElement).value;
    settings.jump = ($("setting-jump") as HTMLSelectElement).value;
    saveSettings();
    scene.cameras.main?.setLerp(settings.reduced ? 1 : 0.09, 1);
    hud();
    if (previous === "title") title();
    else if (previous === "question") {
      // Restore the same question without granting a second reward.
      const id = currentQuestion;
      question(id);
      if (progress.answered.includes(id)) {
        document
          .querySelectorAll<HTMLButtonElement>("[data-answer]")
          .forEach((b) => (b.disabled = true));
        ($("question-continue") as HTMLButtonElement).disabled = false;
        $("feedback").textContent =
          "Answer saved. Your shield reward is already added. Select Continue when you are ready.";
      }
    } else if (previous === "ending") ending();
    else if (previous === "shop") {
      screen = "play";
      shop();
    } else pause();
  });
}
button("game-settings", () => {
  if (screen !== "settings") openSettings();
});
button("global-settings", () => {
  if (screen !== "settings") openSettings();
});
button("pause", () => {
  if (screen === "play") pause();
});
button("shop-open", shop);
button("rest-open", () => {
  if (screen === "play" && nearbyRest !== null) question(nearbyRest);
});
document.querySelectorAll<HTMLButtonElement>("[data-hold]").forEach((b) => {
  const key = b.dataset.hold as "left" | "right" | "jump";
  b.onpointerdown = (e) => {
    e.preventDefault();
    b.setPointerCapture(e.pointerId);
    if (screen === "play") scene.player.held[key] = true;
  };
  b.onpointerup = b.onpointercancel = () => {
    if (scene.player) scene.player.held[key] = false;
  };
});
window.addEventListener("keydown", (e) => {
  if (e.code === "Escape") {
    if (screen === "play") pause();
    else if (screen === "pause") play();
  }
  if (e.code === "KeyE" && screen === "play") {
    if (nearbyRest !== null) question(nearbyRest);
    else if (!$("shop-open").hidden) shop();
  }
  if (e.key === "Tab" && screen !== "play") {
    const focusable = [
      ...$("overlay").querySelectorAll<HTMLElement>(
        "button:not(:disabled), select, input, textarea",
      ),
    ];
    const first = focusable[0],
      last = focusable.at(-1);
    if (!$("overlay").contains(document.activeElement)) {
      e.preventDefault();
      (e.shiftKey ? last : first)?.focus();
    } else if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last?.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first?.focus();
    }
  }
});
window.addEventListener("blur", () => {
  if (screen === "play") pause();
});
document.addEventListener("visibilitychange", () => {
  if (document.hidden && screen === "play") pause();
});
window.addEventListener("beforeunload", () => save());
// Opt-in diagnostics for browser tests; never included in the ordinary player flow.
if (new URLSearchParams(location.search).has("test"))
  Object.assign(window, {
    rr: {
      scene,
      get progress() {
        return progress;
      },
      settings,
      get screen() {
        return screen;
      },
      teleport: (x: number, y = 430) => {
        scene.loops.reset();
        (scene.player.body as Phaser.Physics.Arcade.Body).reset(x, y);
        scene.player.setVelocity(0, 0);
      },
      shop,
      question,
      hud,
    },
  });
