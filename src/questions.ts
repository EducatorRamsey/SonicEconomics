export interface Question {
  id: number;
  concept: string;
  title: string;
  prompt: string;
  answers: string[];
  correct: number;
  explanation: string;
}
export const questions: Question[] = [
  {
    id: 0,
    concept: "Scarcity",
    title: "A little water, many gardens",
    prompt:
      "The town has enough water for two gardens. Four gardens need water. Why is this scarcity?",
    answers: [
      "Water is limited compared with what the gardens need.",
      "Water always costs money.",
      "Nobody wants a garden.",
    ],
    correct: 0,
    explanation:
      "Scarcity means resources are limited compared with wants and needs. Here, four gardens need the water available for two.",
  },
  {
    id: 1,
    concept: "Opportunity cost",
    title: "One afternoon, two choices",
    prompt:
      "You can visit the skate park or help a friend. Helping your friend is your next-best choice. You choose the skate park. What is your opportunity cost?",
    answers: [
      "Everything you could ever do.",
      "Helping your friend, which you gave up.",
      "The skate park you chose.",
    ],
    correct: 1,
    explanation:
      "Opportunity cost is the next-best alternative you give up. You gave up helping your friend.",
  },
  {
    id: 2,
    concept: "Choices & trade-offs",
    title: "Supplies for the trail",
    prompt:
      "You have 6 tokens. A shield costs 6, and a jump boost costs 4. You cannot buy both. What makes you choose?",
    answers: [
      "You must buy both upgrades.",
      "Your tokens are limited, so you compare the choices.",
      "One choice is always best for everyone.",
    ],
    correct: 1,
    explanation:
      "Limited tokens create a trade-off. Compare the effects, then choose an upgrade or save. Different players can prefer different choices.",
  },
];
