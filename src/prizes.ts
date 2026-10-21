export const prizes = [
  {
    id: 0,
    name: "Desert dash shoes",
    description: "Red shoes make you run 10% faster on straight paths.",
    svg: '<path d="M6 22h13l5 10 17 4v10H6zM39 14h12l4 10 17 5v10H39z" fill="#c74636"/><path d="M6 43h35M39 36h33" stroke="#fff" stroke-width="5"/><path d="m14 26 7 1m25-9 8 2" stroke="#fff" stroke-width="3"/>',
  },
  {
    id: 1,
    name: "Launch cap",
    description:
      "A golden cap gives you one shield now and when each stage starts.",
    svg: '<path d="M17 35V22a21 21 0 0 1 42 0v13z" fill="#e5b94f"/><path d="M9 35h60v9H9z" fill="#ad752d"/><path d="M39 5v27" stroke="#fff0bb" stroke-width="4"/>',
  },
  {
    id: 2,
    name: "Moon explorer helmet",
    description:
      "Wear a Moon helmet and get four extra jump boosts on the Moon.",
    svg: '<circle cx="40" cy="27" r="24" fill="#d2e1ef" stroke="#607b9a" stroke-width="3"/><path d="M20 16h40v20H20z" fill="#498fae"/><path d="m25 20 11-1" stroke="#dcf7ff" stroke-width="4"/><path d="M24 46h32v8H24z" fill="#607b9a"/>',
  },
];
export function prizeArt(id: number) {
  return `<svg viewBox="0 0 80 60" aria-hidden="true">${prizes[id].svg}</svg>`;
}
