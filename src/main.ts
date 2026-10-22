import { stores, inventories, purchase } from "./inventory";
import Phaser from "phaser";
import { enableFullscreen } from "./fullscreen";
import { Desert } from "./game";
import { TradingPost } from "./store";
import {
  settings,
  progress,
  newGame,
  save,
  saveSettings,
  hasSave,
  storageAvailable,
  wardrobe,
  awardPrize,
} from "./state";
import { prizes, prizeArt } from "./prizes";
import { questions, makeAttempt, score } from "./questions";
import { checkpoints, levels } from "./course";
import { music, narrate, stopSpeech, cue } from "./audio";
import "./style.css";
const app = document.querySelector<HTMLDivElement>("#app")!;
app.innerHTML = `<header class="site-header"><a class="brand" href="./" aria-label="Roadrunner Rush home"><span class="brand-icon"><svg width="25" height="25" viewBox="0 0 32 32" aria-hidden="true"><path d="M7 25 25 7H12M25 7v13" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg></span><span>ROADRUNNER<span class="brand-light"> RUSH</span></span></a><span class="edition">ALBUQUERQUE → AUSTIN → THE MOON</span><button id="global-settings" class="quiet">⚙ <span>Settings</span></button></header>
<main><div class="page-intro"><div><span class="eyebrow">FROM THE SOUTHWEST TO SPACE</span><h1>Find your own way.</h1><p>A roadrunner, an open trail, and a few choices along the way.</p></div><span class="mode-pill" id="mode-pill">◉ Relaxed adventure</span></div>
<section class="game-shell" aria-label="Roadrunner Rush game"><div class="game-toolbar"><div class="trail-label"><span class="live-dot"></span> ROAD TO THE MOON <span class="divider">/</span> <span id="area">Practice trail</span></div><div class="stats"><span id="hearts" aria-label="3 hearts">♥ ♥ ♥</span><span class="token-stat">◈ <b id="tokens">0</b></span><span id="power"></span><span id="timer" hidden></span><button id="fullscreen" class="toolbar-btn" aria-pressed="false" title="Full screen (F)">Full screen</button><button id="game-settings" class="toolbar-btn">Settings</button><button id="pause" class="toolbar-btn" aria-label="Pause game"><span aria-hidden="true" class="pause-icon"></span><span>Pause</span></button></div></div><div id="stage"><div id="canvas" role="img" aria-label="Side-scrolling Earth-to-Moon platformer. Use arrow keys or A and D to move, Space to jump."></div><div class="trail-progress" aria-label="Economics checkpoints"><span id="gate-0">01 <i>Scarcity</i></span><span id="gate-1">02 <i>Opportunity cost</i></span><span id="gate-2">03 <i>Trade-offs</i></span></div><div id="notice" role="status" aria-live="polite"></div><button id="rest-open" class="primary rest-prompt" hidden>Optional question · E</button><button id="shop-open" class="primary shop-prompt" hidden>Enter store · E</button><div id="store-controls" role="region" aria-label="Store controls" hidden><span>SUNSTONE SUPPLY · Walk with ← → · E at the counter or door</span><button id="store-browse" class="secondary">Browse upgrades</button><button id="store-exit" class="primary">Leave store</button></div><div id="overlay"></div></div>
<div class="control-bar"><div class="keyboard-guide"><kbd>←</kbd><kbd>→</kbd><span>or A / D to move</span><kbd>SPACE</kbd><span>to jump</span></div><span class="comfort-note">Build momentum. Find your flow.</span><div class="touch-controls" aria-label="Touch controls"><button data-hold="left" aria-label="Move left">← Left</button><button data-hold="right" aria-label="Move right">Right →</button><button data-hold="jump" aria-label="Jump">↑ Jump</button></div></div></section>
<section class="below-game"><div><span class="mini-icon">✦</span><div><h2>Small choices. Big discoveries.</h2><p>Albuquerque, Austin, then the Moon. A three-question prize challenge at the end of each level.</p></div></div><div class="privacy-note"><span>⌂</span> Progress stays on this device.<br>No accounts. Just adventure.</div></section><p class="save-note" id="save-note">Roadrunner Rush v6.1 · Original art & sound · Play with keyboard, mouse, or touch</p></main>`;
const $ = <T extends HTMLElement = HTMLElement>(id: string) =>
  document.getElementById(id) as T;
const scene = new Desert();
let screen = "title";
let engineReady = false;
let nearbyRest: number | null = null;
const store = new TradingPost({
  ready: () => {
    if (screen === "store") showStore();
    else store.setPlaying(false);
  },
});
let previous = "title";
let flightNumber = 0;
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
    `${progress.shield ? `◌ Shield ×${progress.shield} ` : ""}${progress.boost > 0 ? "↑ Spring " : ""}${progress.magnet > 0 ? "⌁ Magnet " : ""}${progress.boots > 0 ? "» Speed " : ""}${progress.jets ? `⇧ Jets ×${progress.jets}` : ""}`;
  $("timer").hidden = settings.mode !== "challenge";
  $("timer").textContent =
    `${Math.floor(progress.elapsed / 60)}:${String(Math.floor(progress.elapsed % 60)).padStart(2, "0")}`;
  $("mode-pill").textContent =
    settings.mode === "relaxed"
      ? "◉ Relaxed adventure"
      : "◷ Challenge · elapsed time";
  levels.forEach((_, i) =>
    $("gate-" + i).classList.toggle(
      "done",
      progress.completedLevels.includes(i),
    ),
  );
  $("area").textContent =
    `Level ${progress.level + 1}/3 · ${levels[progress.level].name}`;
  if (!storageAvailable)
    $("save-note").textContent =
      "Storage is unavailable. You can play, but progress will not persist after closing.";
}
function notice(message: string, tone: "neutral" | "urgent" = "neutral") {
  $("notice").dataset.tone = tone;
  $("notice").setAttribute("role", tone === "urgent" ? "alert" : "status");
  $("notice").setAttribute(
    "aria-live",
    tone === "urgent" ? "assertive" : "polite",
  );
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
      if (progress.over) gameOverDialog();
      else title();
      hud();
    }
  },
  question: question,
  finish: ending,
  gameOver,
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
  scene: [scene, store],
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
  if (game.scene.isActive("store-interior")) store.setPlaying(false);
  stopSpeech();
  $("overlay").innerHTML =
    `<div class="modal-shade ${kind === "title" ? "title-shade" : ""}"><section role="dialog" aria-modal="true" aria-labelledby="dialog-title" class="panel ${wide ? "wide" : ""} ${kind === "title" ? "title-panel" : ""}">${html}</section>${kind === "title" ? '<img class="hero-bird" src="./roadrunner.svg" alt="An original turquoise roadrunner with a swept crest, long tail, and curious eyes">' : ""}</div>`;
  $("overlay").hidden = false;
  scene.input?.keyboard?.disableGlobalCapture();
  requestAnimationFrame(() => {
    const dialog = $("overlay").querySelector<HTMLElement>('[role="dialog"]');
    if (dialog) {
      dialog.tabIndex = -1;
      dialog.focus({ preventScroll: true });
    }
  });
}
function play() {
  if (progress.over) {
    gameOverDialog();
    return;
  }
  $("canvas").setAttribute(
    "aria-label",
    `Level ${progress.level + 1}: ${levels[progress.level].name}. Move with arrows or your selected keys; Space to jump.`,
  );
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
  clearTimeout(noticeTimer);
  $("notice").textContent = "";
  modal(
    "title",
    `<div class="eyebrow">ALBUQUERQUE → AUSTIN → THE MOON</div><h2 id="dialog-title">Roadrunner<br><em>Rush.</em></h2><p class="lead">Run. Leap. Explore.</p><div class="title-actions"><button class="primary" id="start">${hasSave() ? "New game" : "Let’s hit the trail"} <span>→</span></button>${hasSave() && !progress.over ? '<button class="secondary" id="continue-save">Continue adventure</button>' : ""}<button class="text-btn" id="title-settings">Settings</button><button class="text-btn" id="title-prizes">Your prizes</button><button class="text-btn" id="title-fullscreen">Play in full screen</button></div>`,
  );
  button("start", () => {
    if (hasSave() && !progress.over) confirmNew();
    else begin();
  });
  if (hasSave() && !progress.over)
    button("continue-save", () => {
      if (progress.finished) ending();
      else if (progress.completedLevels.includes(progress.level))
        levelComplete();
      else if (progress.pendingGate !== null) question(progress.level);
      else play();
    });
  button("title-settings", openSettings);
  button("title-prizes", collection);
  button("title-fullscreen", () => void toggleFullscreen());
}
function begin() {
  game.scene.stop("store-interior");
  $("store-controls").hidden = true;
  newGame();
  scene.reset();
  play();
  notice(
    "Run the loops and reach the prize challenge. Watch your three hearts!",
  );
}
function confirmNew() {
  const back = screen;
  modal(
    "confirm",
    `<span class="eyebrow">A FRESH TRAIL</span><h2 id="dialog-title">Start a new adventure?</h2><p>Start again in Albuquerque with three hearts and an empty wallet. Prizes must be earned again. Your settings stay.</p><button id="confirm-new" class="primary">Start new game</button><button id="cancel-new" class="secondary">Keep my adventure</button>`,
  );
  button("confirm-new", begin);
  button("cancel-new", () =>
    back === "title"
      ? title()
      : back === "ending"
        ? ending()
        : back.startsWith("store")
          ? storePause()
          : pause(),
  );
}
function pause() {
  if (screen === "dying") return;
  if (progress.over) {
    gameOverDialog();
    return;
  }
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
function prizePreview(id: number, earned = false) {
  const prize = prizes[id];
  return `<div class="prize-preview ${earned ? "earned" : ""}"><span class="prize-art">${prizeArt(id)}</span><div><strong>${prize.name}</strong><p>${prize.description}</p></div></div>`;
}
function question(level: number) {
  currentQuestion = level;
  if (!progress.attempt || progress.attempt.level !== level)
    progress.attempt = makeAttempt(level);
  const attempt = progress.attempt;
  save();
  if (attempt.cursor >= 3) {
    quizResult();
    return;
  }
  const index = attempt.cursor,
    q = questions[attempt.ids[index]],
    selected = attempt.answers[index];
  modal(
    "question",
    `<div class="question-top"><span class="eyebrow">${levels[level].name} · Question ${index + 1} of 3</span><span class="time-badge">No time limit</span></div>${prizePreview(level, wardrobe.includes(level))}<p class="prize-goal">Get all three right in one try to win this prize.</p><h2 id="dialog-title">${q.title}</h2><p class="question-prompt">${q.prompt}</p><div class="narration"><button id="listen" class="small-btn">▷ Listen</button><button id="replay" class="small-btn">↻ Replay</button><button id="stop-speech" class="small-btn">■ Stop</button><label>Voice speed <select id="voice-speed"><option value="0.7">Slower</option><option value="0.9">Gentle</option><option value="1.1">Faster</option></select></label></div><div class="answers">${attempt.orders[index].map((original, i) => `<button class="answer" data-answer="${original}"><span>${String.fromCharCode(65 + i)}</span>${q.answers[original]}</button>`).join("")}</div><div id="feedback" role="status">Choose your answer. You can try a new set after all three questions.</div><div class="question-footer"><button id="question-settings" class="text-btn">Settings</button><button id="question-continue" class="primary" disabled>${index < 2 ? "Next question →" : "See your result →"}</button></div>`,
    true,
  );
  const spoken = `${q.title}. ${q.prompt}. ${attempt.orders[index].map((answer, i) => `Answer ${String.fromCharCode(65 + i)}. ${q.answers[answer]}`).join(". ")}`;
  button("listen", () => narrate(spoken));
  button("replay", () => narrate(spoken));
  button("stop-speech", stopSpeech);
  ($("voice-speed") as HTMLSelectElement).value = String(settings.speechRate);
  $("voice-speed").addEventListener("change", () => {
    settings.speechRate = Number(($("voice-speed") as HTMLSelectElement).value);
    saveSettings();
  });
  if (!("speechSynthesis" in window))
    ["listen", "replay", "stop-speech"].forEach(
      (id) => (($(id) as HTMLButtonElement).disabled = true),
    );
  const feedback = () => {
    const correct = attempt.answers[index] === q.correct;
    $("feedback").textContent =
      `${correct ? "Correct!" : "Not quite."} ${q.explanation}`;
    $("feedback").className = correct ? "correct" : "hint";
    document
      .querySelectorAll<HTMLButtonElement>("[data-answer]")
      .forEach((b) => (b.disabled = true));
    ($("question-continue") as HTMLButtonElement).disabled = false;
  };
  document.querySelectorAll<HTMLButtonElement>("[data-answer]").forEach(
    (b) =>
      (b.onclick = () => {
        if (attempt.answers[index] !== null) return;
        const chosen = Number(b.dataset.answer);
        attempt.answers[index] = chosen;
        const list = chosen === q.correct ? progress.answered : progress.helped;
        if (!list.includes(q.id)) list.push(q.id);
        save();
        feedback();
        $("question-continue").focus();
      }),
  );
  if (selected !== null) feedback();
  button("question-continue", () => {
    if (attempt.answers[index] === null) return;
    attempt.cursor++;
    save();
    question(level);
  });
  button("question-settings", openSettings);
}
function quizResult() {
  const attempt = progress.attempt!;
  const level = attempt.level,
    points = score(attempt);
  progress.scores[level] = Math.max(progress.scores[level], points);
  const newlyWon = points === 3 ? awardPrize(level) : false;
  save();
  hud();
  if (newlyWon) cue("reward");
  modal(
    "quiz-result",
    `<span class="eyebrow">${levels[level].name} · Quiz result</span><h2 id="dialog-title">${points === 3 ? "Three out of three!" : `${points} out of three`}</h2>${prizePreview(level, wardrobe.includes(level))}<p>${points === 3 ? `${newlyWon ? "You won" : "You already own"} the ${prizes[level].name}. Your roadrunner wears earned prizes automatically.` : "Try a new set of three questions to win the prize, or continue without winning it this time."}</p>${points < 3 ? '<button id="quiz-retry" class="primary">Try again for the prize</button>' : ""}<button id="question-continue" class="${points === 3 ? "primary" : "secondary"}">${points === 3 ? "Continue adventure →" : "Continue without the prize →"}</button><button id="result-settings" class="text-btn">Settings</button>`,
    true,
  );
  if (points < 3)
    button("quiz-retry", () => {
      progress.attempt = makeAttempt(level, attempt.ids);
      save();
      question(level);
    });
  button("question-continue", () => {
    if (!progress.completedLevels.includes(level))
      progress.completedLevels.push(level);
    progress.pendingGate = null;
    progress.attempt = null;
    save();
    if (level === 2) {
      progress.finished = true;
      save();
      ending();
    } else levelComplete();
  });
  button("result-settings", openSettings);
}
function collection() {
  modal(
    "collection",
    `<span class="eyebrow">YOUR PRIZES</span><h2 id="dialog-title">Dress for adventure.</h2><p>Win a stage’s three-question challenge to earn its prize. Prizes stay with you for this adventure. Start a new game to earn them again.</p>${prizes.map((p) => `${prizePreview(p.id, wardrobe.includes(p.id))}<p class="collection-status">${wardrobe.includes(p.id) ? "✓ Earned and equipped" : "Not earned yet"}</p>`).join("")}<button id="collection-back" class="primary">Back to title</button>`,
    true,
  );
  button("collection-back", title);
}
function gameOver() {
  screen = "dying";
  $("overlay").hidden = true;
  $("overlay").innerHTML = "";
  $("shop-open").hidden = true;
  setTimeout(() => {
    if (progress.over && screen === "dying") gameOverDialog();
  }, 950);
}
function gameOverDialog() {
  modal(
    "gameover",
    `<span class="eyebrow">ALL THREE HEARTS LOST</span><h2 id="dialog-title">Game over</h2><p>You must start again in Albuquerque. You must earn your prizes again. Your settings stay with you.</p><button id="start-again" class="primary">Start again</button><button id="gameover-title" class="secondary">Back to title</button><button id="gameover-settings" class="text-btn">Settings</button>`,
  );
  button("start-again", begin);
  button("gameover-title", title);
  button("gameover-settings", openSettings);
}
function shop() {
  if (screen !== "play") return;
  scene.loops.reset();
  scene.player.setVelocity(0, 0);
  scene.setPlaying(false);
  progress.x = Math.max(progress.x, levels[progress.level].shop);
  save();
  screen = "store";
  scene.scene.launch("store-interior");
  game.scene.bringToTop("store-interior");
  $("shop-open").hidden = true;
  $("rest-open").hidden = true;
}
function showStore() {
  $("canvas").setAttribute(
    "aria-label",
    `Inside ${stores[progress.level]}. Walk to the counter or door and press E, or use Browse upgrades and Leave store buttons.`,
  );
  screen = "store";
  $("overlay").hidden = true;
  $("overlay").innerHTML = "";
  $("store-controls").hidden = false;
  $("store-controls").querySelector("span")!.textContent =
    `${stores[progress.level].toUpperCase()} · Walk with ← → · E at the counter or door`;
  store.input?.keyboard?.enableGlobalCapture();
  store.setPlaying(true);
  hud();
  $("store-browse").focus();
}
function leaveStore() {
  store.setPlaying(false);
  game.scene.stop("store-interior");
  $("store-controls").hidden = true;
  $("shop-open").hidden = false;
  (scene.player.body as Phaser.Physics.Arcade.Body).reset(
    levels[progress.level].shop + 100,
    430,
  );
  scene.player.setVelocity(0, 0);
  play();
}
function storePause() {
  modal(
    "store-pause",
    `<span class="eyebrow">${stores[progress.level]}</span><h2 id="dialog-title">Take your time.</h2><div class="stack"><button id="store-resume" class="primary">Resume in the store</button><button id="store-settings" class="secondary">Settings</button><button id="store-leave-pause" class="secondary">Leave store</button></div>`,
  );
  button("store-resume", showStore);
  button("store-settings", openSettings);
  button("store-leave-pause", leaveStore);
}
function levelComplete() {
  const next = levels[progress.level + 1];
  modal(
    "level-complete",
    `<span class="eyebrow">LEVEL ${progress.level + 1} OF 3 COMPLETE</span><h2 id="dialog-title">${levels[progress.level].name} complete.</h2><p>Your quiz, coins, and prizes are saved.</p><div class="next-level-card"><h3>Next: ${next.name}</h3><p>${next.description}</p><p>Three hearts for the next trail. Your tokens and upgrades come with you.</p></div><button id="next-level" class="primary">${progress.level === 1 ? "Board the rocket →" : "Travel to Austin →"}</button><button id="level-settings" class="secondary">Settings</button>`,
  );
  button("next-level", () => {
    if (progress.level === 1) {
      rocketFlight();
      return;
    }
    scene.advanceLevel();
    play();
    notice(`Level ${next.id + 1} · ${next.name}. ${next.description}`);
  });
  button("level-settings", openSettings);
}
function rocketFlight() {
  const flight = ++flightNumber;
  modal(
    "rocket",
    `<span class="eyebrow">AUSTIN LAUNCH WORKS · FICTIONAL SPACEPORT</span><h2 id="dialog-title">Next stop: the Moon!</h2><div class="rocket-flight ${settings.reduced ? "still" : ""}" aria-hidden="true"><span class="flight-earth"><svg width="65" height="65" viewBox="0 0 65 65"><circle cx="32" cy="32" r="30" fill="#5b9ccb"/><path d="m17 9 20 4-4 17-18-3-6-11m28 22 17-4-4 18-12 8-9-15" fill="#9ac49b"/></svg></span><span class="flight-rocket"><svg width="48" height="56" viewBox="0 0 48 56"><path d="m8 39 8-22L37 3l-2 25-15 17Z" fill="#f4eddb"/><path d="m8 27-6 17 14-6m11 0-2 16 13-19" fill="#ca6c58"/><circle cx="29" cy="19" r="6" fill="#5faec7"/><path d="m10 43-6 10 12-6" fill="#e7ba70"/></svg></span><span class="flight-moon">☾</span></div><p role="status">Launch from Austin. Leave Earth behind. Touch down at Tranquility Trail.</p><button id="land-now" class="primary">Skip flight · Land on the Moon</button>`,
  );
  const land = () => {
    if (screen !== "rocket" || flight !== flightNumber) return;
    scene.advanceLevel();
    play();
    notice(
      "Welcome to the Moon! Lower gravity makes jumps last longer. The same gold coins work everywhere; watch for timed energy gates.",
    );
  };
  button("land-now", land);
  setTimeout(land, settings.reduced ? 500 : 3200);
}
function browseStore() {
  if (screen !== "store") return;
  store.approachCounter();
  const stock = inventories[progress.level];
  modal(
    "shop",
    `<span class="eyebrow">${stores[progress.level].toUpperCase()}</span><h2 id="dialog-title">A choice for this world.</h2><p>You have <strong id="shop-balance">${progress.tokens}</strong> tokens. Choose equipment or save for the next shop. There is one of each item in stock.</p><div class="shop-cards">${stock.map((item) => `<article><span class="upgrade-icon">${item.icon}</span><h3>${item.name}</h3><p>${item.description}</p><button id="buy-${item.id}" class="secondary">Buy ${item.name} · ${item.price} tokens</button></article>`).join("")}</div><p id="shop-feedback" role="status">Stage equipment lasts until the next destination. Shields and unused jet fuel stay until used.</p><button id="leave-shop" class="primary">Back to the store</button>`,
    true,
  );
  const refresh = () => {
    for (const item of stock)
      ($("buy-" + item.id) as HTMLButtonElement).disabled =
        progress.tokens < item.price || progress.purchases.includes(item.id);
    for (const item of stock)
      if (progress.purchases.includes(item.id))
        $("buy-" + item.id).textContent = `${item.name} · Sold out`;
    $("shop-balance").textContent = String(progress.tokens);
  };
  for (const item of stock)
    button("buy-" + item.id, () => {
      if (!purchase(item.id)) return;
      save();
      hud();
      refresh();
      cue("reward");
      $("shop-feedback").textContent =
        `${item.name} ready. ${item.description}`;
    });
  button("leave-shop", showStore);
  refresh();
}
function ending() {
  modal(
    "ending",
    `<span class="eyebrow">EARTH TO THE MOON · ALL THREE STAGES COMPLETED</span><div class="finish-art">✦</div><h2 id="dialog-title">A trail well traveled.</h2><p>You crossed Albuquerque, reached the launch site in Austin, and explored the Moon.</p><div class="result-grid"><div><b>${progress.tokens}</b><span>tokens saved</span></div><div><b>${progress.scores.reduce((a, b) => a + b, 0)} / 9</b><span>best quiz points</span></div><div><b>${wardrobe.length}</b><span>prizes collected</span></div></div><p>Explore your prizes and try for a perfect score on your next adventure.</p>${prizes
      .filter((p) => wardrobe.includes(p.id))
      .map((p) => prizePreview(p.id, true))
      .join(
        "",
      )}<label class="reflection">Optional reflection: What did you give up when you spent your tokens?<textarea placeholder="Think about it, say it aloud, or write here…" rows="2"></textarea></label><p class="fine-print">Your reflection is not saved or sent anywhere.</p><button id="again" class="primary">Explore again →</button><button id="end-home" class="secondary">Return to title</button>`,
    true,
  );
  button("again", confirmNew);
  button("end-home", title);
}
function openSettings() {
  if (screen === "dying") return;
  previous = screen;
  modal(
    "settings",
    `<span class="eyebrow">MAKE IT YOURS</span><h2 id="dialog-title">Your kind of adventure.</h2><p>Change these anytime. Your choices stay on this device.</p><div class="settings-grid"><label>Adventure mode<select id="setting-mode"><option value="relaxed">Relaxed · no countdown or game over</option><option value="challenge">Challenge · timer & bridge gaps</option></select></label><label>Running speed<select id="setting-speed"><option value="0.7">Gentle</option><option value="1">Cruising</option><option value="1.3">Quick</option></select></label><label>Sound effects <input id="setting-sound" type="range" min="0" max="1" step="0.1" value="${settings.sound}"></label><label>Music <input id="setting-music" type="range" min="0" max="1" step="0.1" value="${settings.music}"></label><label class="check-label"><input id="setting-loops" type="checkbox" ${settings.loops ? "checked" : ""}> Run the loop tracks<br><small>Turn off to keep running along the ground.</small></label><label class="check-label"><input id="setting-reduced" type="checkbox" ${settings.reduced ? "checked" : ""}> Reduced motion<br><small>Immediate camera following; no decorative rotation.</small></label><button id="mute" class="secondary">Mute all audio</button><label>Move left key<select id="setting-left"><option>A</option><option>J</option></select></label><label>Move right key<select id="setting-right"><option>D</option><option>L</option></select></label><label>Jump key<select id="setting-jump"><option value="SPACE">Space</option><option value="K">K</option><option value="W">W</option></select></label><label>Narration speed<select id="setting-speech"><option value="0.7">Slower</option><option value="0.9">Gentle</option><option value="1.1">Faster</option></select></label></div><p class="fine-print">Arrow keys, W, Up, and Space also work. Music and effects can each be set to zero. Challenge time never runs inside the store or while a menu or question is open. Bridge safety paths follow the mode chosen when a level starts.</p><button id="settings-done" class="primary">Save settings & return →</button>`,
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
    scene.refreshCoins();
    hud();
    if (previous === "title") title();
    else if (previous === "question") question(currentQuestion);
    else if (previous === "quiz-result") quizResult();
    else if (previous === "gameover") gameOverDialog();
    else if (previous === "collection") collection();
    else if (previous === "ending") ending();
    else if (previous === "shop") {
      screen = "store";
      browseStore();
    } else if (previous === "store") showStore();
    else if (previous === "store-pause") storePause();
    else if (previous === "level-complete" || previous === "rocket")
      levelComplete();
    else pause();
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
  else if (screen === "store") storePause();
});
button("shop-open", shop);
button("store-browse", browseStore);
button("store-exit", leaveStore);
button("rest-open", () => {
  if (screen === "play" && nearbyRest !== null) question(nearbyRest);
});
document.querySelectorAll<HTMLButtonElement>("[data-hold]").forEach((b) => {
  const key = b.dataset.hold as "left" | "right" | "jump";
  b.onpointerdown = (e) => {
    e.preventDefault();
    b.setPointerCapture(e.pointerId);
    if (screen === "play") scene.player.held[key] = true;
    else if (screen === "store" && store.player) store.player.held[key] = true;
  };
  b.onpointerup = b.onpointercancel = () => {
    if (scene.player) scene.player.held[key] = false;
    if (store.player) store.player.held[key] = false;
  };
});
window.addEventListener("keydown", (e) => {
  if (e.code === "Escape") {
    if (screen === "play") pause();
    else if (screen === "pause") play();
    else if (screen === "store") storePause();
    else if (screen === "store-pause") showStore();
  }
  if (e.code === "KeyE" && !e.repeat && screen === "store") {
    if (store.atCounter()) browseStore();
    else if (store.atDoor()) leaveStore();
    return;
  }
  if (e.code === "KeyE" && !e.repeat && screen === "play") {
    if (nearbyRest !== null) question(nearbyRest);
    else if (!$("shop-open").hidden) shop();
  }
  if (e.key === "Tab" && screen !== "play" && screen !== "store") {
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
  else if (screen === "store") storePause();
});
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    if (screen === "play") pause();
    else if (screen === "store") storePause();
  }
});
window.addEventListener("beforeunload", () => save());
// Opt-in diagnostics for browser tests; never included in the ordinary player flow.
if (new URLSearchParams(location.search).has("test"))
  Object.assign(window, {
    rr: {
      scene,
      store,
      get progress() {
        return progress;
      },
      settings,
      wardrobe,
      get quizAnswer() {
        const a = progress.attempt;
        return a && a.cursor < 3 ? questions[a.ids[a.cursor]].correct : null;
      },
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
