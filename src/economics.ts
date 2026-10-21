import type { Progress } from "./state";
import { questions } from "./questions";

/** Domain rules independent of menus, narration, or the Phaser simulation. */
export function answerQuestion(
  state: Progress,
  id: number,
  answer: number,
  safeX: number,
): "already" | "correct" | "retry" {
  if (state.answered.includes(id)) return "already";
  if (answer === questions[id].correct) {
    state.answered.push(id);
    state.shield += 1;
    state.x = safeX;
    return "correct";
  }
  if (!state.helped.includes(id)) state.helped.push(id);
  return "retry";
}
