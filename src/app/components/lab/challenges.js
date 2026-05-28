export const assessmentDuration = 30 * 60;

export const problems = [
  {
    id: "pair-sum-signal",
    title: "Pair Sum Signal",
    level: "Warm-up",
    points: 100,
    time: "8 min",
    prompt:
      "Return the indexes of two numbers that add up to the target. Every input has one valid answer, and the same element cannot be used twice.",
    starter: `function solve(nums, target) {
  const seen = new Map();

  for (let i = 0; i < nums.length; i += 1) {
    const needed = target - nums[i];

    if (seen.has(needed)) {
      return [seen.get(needed), i];
    }

    seen.set(nums[i], i);
  }

  return [];
}`,
    tests: [
      { name: "sample", input: [[2, 7, 11, 15], 9], expected: [0, 1], visible: true },
      { name: "unsorted values", input: [[3, 2, 4], 6], expected: [1, 2], visible: true },
      { name: "duplicate numbers", input: [[3, 3], 6], expected: [0, 1], visible: true },
      { name: "hidden negative mix", input: [[-4, 12, 8, 1], 4], expected: [0, 2], visible: false },
      { name: "hidden late pair", input: [[5, 19, 1, 9, 14], 23], expected: [3, 4], visible: false },
    ],
  },
  {
    id: "clean-window",
    title: "Clean Window",
    level: "Core",
    points: 120,
    time: "12 min",
    prompt:
      "Return the length of the longest substring without repeated characters. The window should shrink only when a duplicate is inside the active range.",
    starter: `function solve(text) {
  let left = 0;
  let best = 0;
  const lastSeen = new Map();

  for (let right = 0; right < text.length; right += 1) {
    const char = text[right];

    if (lastSeen.has(char) && lastSeen.get(char) >= left) {
      left = lastSeen.get(char) + 1;
    }

    lastSeen.set(char, right);
    best = Math.max(best, right - left + 1);
  }

  return best;
}`,
    tests: [
      { name: "sample", input: ["abcabcbb"], expected: 3, visible: true },
      { name: "single repeated char", input: ["bbbbb"], expected: 1, visible: true },
      { name: "overlap reset", input: ["pwwkew"], expected: 3, visible: true },
      { name: "hidden empty string", input: [""], expected: 0, visible: false },
      { name: "hidden reset guard", input: ["abba"], expected: 2, visible: false },
    ],
  },
];
