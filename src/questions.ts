export interface Question {
  id: number;
  level: number;
  concept: string;
  title: string;
  prompt: string;
  answers: string[];
  correct: number;
  explanation: string;
}
const bank: [string, string, string[], number, string][][] = [
  [
    [
      "Water for the gardens",
      "Four gardens need water, but the town has enough for two. Why is this scarcity?",
      [
        "Water is limited compared with the gardens’ needs.",
        "Water always costs money.",
        "Nobody wants a garden.",
      ],
      0,
      "Scarcity means resources are limited compared with wants and needs.",
    ],
    [
      "Seats on the bus",
      "Twenty-four students want to travel. The bus has twenty seats. What is scarce?",
      [
        "The number of students.",
        "Available bus seats compared with the students who need them.",
        "The color of the bus.",
      ],
      1,
      "There are fewer available seats than students who want to travel.",
    ],
    [
      "An afternoon of activities",
      "You want to finish three activities, but only have time for two. Which resource is limited?",
      ["Your time.", "Your ideas.", "Your interest in the activities."],
      0,
      "Time is a resource. You cannot fit every activity into the available time.",
    ],
    [
      "A busy bakery",
      "A baker has flour for six loaves. Customers want ten. What shows scarcity?",
      [
        "Bread must be free.",
        "The baker has no choices.",
        "There is not enough flour to meet every customer’s want.",
      ],
      2,
      "The available flour is limited compared with the demand for bread.",
    ],
    [
      "Classroom tablets",
      "Eight groups want tablets. The class has five working tablets. Why must the groups make a plan?",
      [
        "The available tablets cannot serve all eight groups at once.",
        "Tablets are never useful.",
        "Every group wants something different.",
      ],
      0,
      "The class has limited tablets compared with the groups who need them. Sharing time is one possible choice.",
    ],
    [
      "Building a playground",
      "A town wants a slide, swings and a climbing wall. Its budget covers only two. What creates scarcity?",
      [
        "The equipment has different colors.",
        "The budget is limited compared with what the town wants.",
        "Choosing is always impossible.",
      ],
      1,
      "A limited budget cannot cover every wanted piece of equipment.",
    ],
  ],
  [
    [
      "An afternoon in Austin",
      "You choose the skate park instead of helping a friend. Helping your friend was your next-best choice. What is your opportunity cost?",
      [
        "Every activity in the city.",
        "Helping your friend.",
        "The skate park you chose.",
      ],
      1,
      "Opportunity cost is the next-best alternative you give up.",
    ],
    [
      "A book or a ball",
      "You choose a book. A ball was the next-best thing you could buy with that money. What did you give up?",
      ["The book.", "All the things in the store.", "The ball."],
      2,
      "The ball was your next-best alternative, so it is the opportunity cost of buying the book.",
    ],
    [
      "Music practice",
      "You practice guitar for an hour. Reading was your next-best use of that hour. What is the opportunity cost?",
      [
        "The reading time you gave up.",
        "The guitar you already own.",
        "Every book ever written.",
      ],
      0,
      "Choosing guitar practice uses time you could have spent on your next-best alternative: reading.",
    ],
    [
      "One piece of land",
      "The city builds a park. A parking area was the next-best use of that land. What is the opportunity cost?",
      [
        "The new park.",
        "The parking area that was not built.",
        "The color of the park sign.",
      ],
      1,
      "The opportunity cost is the next-best use of the land that the city gave up.",
    ],
    [
      "Preparing a robot",
      "You use the last of your budget on a battery. Paint was your next-best purchase. What is the opportunity cost?",
      [
        "The battery you bought.",
        "Every robot part.",
        "The paint you could not buy.",
      ],
      2,
      "You gave up paint, the next-best purchase, when you chose the battery.",
    ],
    [
      "Choosing an upgrade",
      "You buy speed boots. A magnet was your next-best choice. What is your opportunity cost?",
      [
        "The magnet you passed up.",
        "The boots you now have.",
        "All the coins that exist.",
      ],
      0,
      "The magnet was the next-best alternative you gave up when you bought the boots.",
    ],
  ],
  [
    [
      "Supplies for the Moon",
      "You have 50 coins. Armor costs 50 and jump jets cost 49. Why must you choose?",
      [
        "You must buy both.",
        "Your coins are limited, so you compare the choices.",
        "The same item is always best for everyone.",
      ],
      1,
      "You cannot afford both. Compare their benefits, or save the coins.",
    ],
    [
      "Saving for later",
      "You save your coins instead of buying an upgrade now. What is the trade-off?",
      [
        "You get every upgrade for free.",
        "There is no trade-off.",
        "You give up using an upgrade now to keep money for later.",
      ],
      2,
      "Saving preserves future choices, but means giving up something you could use today.",
    ],
    [
      "Different players, different choices",
      "One player prefers armor; another prefers jump jets. Can both choices make sense?",
      [
        "Yes. Players can value protection and extra jumps differently.",
        "No. Everyone must want the same item.",
        "No. Only the most expensive item can be useful.",
      ],
      0,
      "People can make different choices because they value the benefits differently.",
    ],
    [
      "Limited rocket fuel",
      "Using fuel for an extra boost now leaves less for later. What is the trade-off?",
      [
        "Extra speed now in exchange for less fuel later.",
        "Fuel becomes unlimited.",
        "All boosts are free.",
      ],
      0,
      "Using a limited resource now gives up some of its future uses.",
    ],
    [
      "Protection or speed",
      "You choose armor instead of faster shoes. What benefit are you giving up?",
      [
        "The protection from armor.",
        "The extra speed the shoes would provide.",
        "Every possible benefit.",
      ],
      1,
      "Choosing protection means giving up the extra speed from the alternative shoes.",
    ],
    [
      "Making a plan",
      "Your money cannot buy every item you want. What is a useful next step?",
      [
        "Buy everything anyway.",
        "Choose the item with the longest name.",
        "Compare the benefits and decide what matters most to you.",
      ],
      2,
      "A budget asks you to compare benefits, choose priorities, or save for a later goal.",
    ],
  ],
];
export const questions: Question[] = bank.flatMap((rows, level) =>
  rows.map(([title, prompt, answers, correct, explanation], i) => ({
    id: level * 6 + i,
    level,
    concept: ["Scarcity", "Opportunity cost", "Choices & trade-offs"][level],
    title,
    prompt,
    answers,
    correct,
    explanation,
  })),
);
export interface QuizAttempt {
  level: number;
  ids: number[];
  orders: number[][];
  answers: (number | null)[];
  cursor: number;
}
function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
export function makeAttempt(
  level: number,
  previous: number[] = [],
): QuizAttempt {
  const pool = questions.filter(
    (q) => q.level === level && !previous.includes(q.id),
  );
  const ids = shuffle(pool)
    .slice(0, 3)
    .map((q) => q.id);
  return {
    level,
    ids,
    orders: ids.map((id) => shuffle(questions[id].answers.map((_, i) => i))),
    answers: [null, null, null],
    cursor: 0,
  };
}
export function score(attempt: QuizAttempt) {
  return attempt.ids.filter(
    (id, i) => attempt.answers[i] === questions[id].correct,
  ).length;
}
