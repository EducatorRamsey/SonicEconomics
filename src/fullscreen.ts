/** Fullscreen the complete game UI, with a page-filling fallback for browsers
 * or embedded previews that do not allow the Fullscreen API. */
export function enableFullscreen(
  shell: HTMLElement,
  button: HTMLButtonElement,
  resize: () => void,
) {
  let fallback = false;
  let expanded = false;
  const sync = () => {
    expanded = document.fullscreenElement === shell || fallback;
    shell.classList.toggle("is-expanded", expanded);
    document.body.classList.toggle("game-expanded", expanded);
    button.textContent = expanded ? "Exit full screen" : "Full screen";
    button.setAttribute("aria-pressed", String(expanded));
    button.title = expanded ? "Exit full screen (Esc or F)" : "Full screen (F)";
    requestAnimationFrame(resize);
  };
  const exit = async () => {
    fallback = false;
    if (document.fullscreenElement === shell) await document.exitFullscreen();
    sync();
  };
  const toggle = async () => {
    if (expanded) {
      await exit();
      return;
    }
    try {
      if (!shell.requestFullscreen || !document.fullscreenEnabled)
        throw new Error("Fullscreen unavailable");
      await shell.requestFullscreen();
    } catch {
      fallback = true;
    }
    sync();
  };
  button.addEventListener("click", () => void toggle());
  document.addEventListener("fullscreenchange", sync);
  window.addEventListener(
    "keydown",
    (event) => {
      if (event.code === "Escape" && expanded) {
        event.preventDefault();
        event.stopImmediatePropagation();
        void exit();
      } else if (
        event.code === "KeyF" &&
        !event.repeat &&
        !event.ctrlKey &&
        !event.metaKey &&
        !event.altKey &&
        !(
          event.target instanceof Element &&
          event.target.closest(
            'input, textarea, select, [contenteditable="true"]',
          )
        )
      ) {
        event.preventDefault();
        event.stopImmediatePropagation();
        void toggle();
      }
    },
    true,
  );
  // CSS expansion does not always dispatch a window resize, notably in embeds.
  new ResizeObserver(() => requestAnimationFrame(resize)).observe(
    shell.querySelector("#stage")!,
  );
  sync();
  return toggle;
}
