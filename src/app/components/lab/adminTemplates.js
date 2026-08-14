/**
 * Prebuilt role templates selectable in the create flow.
 */
export const roleTemplates = [
  {
    id: "backend",
    title: "Back-End Developer",
    icon: "globe",
    summary: "Problem Solving (Basic), SQL (Intermediate), REST API (Intermediate), Technical Communication, Code Quality, System Design",
    coreSkills: ["Problem Solving (Basic)", "SQL (Intermediate)", "REST API (Intermediate)", "Technical Communication", "Code Quality", "System Design"],
    durationMinutes: 105,
    problems: [
      {
        title: "Character Reprogramming",
        difficulty: "Easy",
        timeLimitMinutes: 25,
        points: 100,
        prompt:
          "A control device moves a character using U, D, L, and R instructions. Return the maximum number of instructions that can be deleted while preserving the same final destination.",
        starterCode:
          "'use strict';\n\nfunction getMaxDeletions(s) {\n  // Write your code here\n}\n\nfunction solve(input) {\n  return getMaxDeletions(String(input).trim());\n}",
        tests: [
          { name: "Test Case 1", inputJson: "\"URDR\"", expectedJson: "2", visible: true },
          { name: "Test Case 2", inputJson: "\"RRR\"", expectedJson: "0", visible: true },
          { name: "Test Case 3", inputJson: "\"UDLR\"", expectedJson: "4", visible: true },
        ],
      },
      {
        title: "REST API: Top Articles",
        difficulty: "Medium",
        timeLimitMinutes: 40,
        points: 125,
        prompt:
          "Given article records as JSON, sort by comment count descending and return the article titles that cross the supplied minimum threshold.",
        starterCode:
          "function solve(input) {\n  const payload = typeof input === 'string' ? JSON.parse(input) : input;\n  return [];\n}",
        tests: [
          {
            name: "Test Case 1",
            inputJson: "{\"minComments\":10,\"articles\":[{\"title\":\"A\",\"comments\":8},{\"title\":\"B\",\"comments\":14}]}",
            expectedJson: "[\"B\"]",
            visible: true,
          },
          {
            name: "Test Case 2",
            inputJson: "{\"minComments\":1,\"articles\":[{\"title\":\"API\",\"comments\":3},{\"title\":\"Cache\",\"comments\":7}]}",
            expectedJson: "[\"Cache\",\"API\"]",
            visible: true,
          },
        ],
      },
      {
        title: "SQL: Threat Detection Report",
        difficulty: "Medium",
        timeLimitMinutes: 40,
        points: 125,
        prompt:
          "Aggregate threat events by severity. Return an object with severity names as keys and event counts as values.",
        starterCode: "function solve(events) {\n  return {};\n}",
        tests: [
          {
            name: "Test Case 1",
            inputJson: "[{\"severity\":\"high\"},{\"severity\":\"low\"},{\"severity\":\"high\"}]",
            expectedJson: "{\"high\":2,\"low\":1}",
            visible: true,
          },
          { name: "Test Case 2", inputJson: "[]", expectedJson: "{}", visible: true },
        ],
      },
    ],
  },
  {
    id: "ios",
    title: "iOS Developer",
    icon: "code",
    summary: "Problem Solving (Basic), REST API (Intermediate), Technical Communication, Swift (Basic), Code Quality",
    coreSkills: ["Problem Solving (Basic)", "REST API (Intermediate)", "Technical Communication", "Swift (Basic)", "Code Quality"],
    durationMinutes: 75,
    problems: [
      {
        title: "Offline Sync Queue",
        difficulty: "Medium",
        timeLimitMinutes: 35,
        points: 100,
        prompt: "Given queued mobile actions, remove duplicates while preserving the latest action per entity.",
        starterCode: "function solve(actions) {\n  return [];\n}",
        tests: [
          {
            name: "Test Case 1",
            inputJson: "[{\"id\":\"a\",\"op\":\"save\"},{\"id\":\"a\",\"op\":\"delete\"}]",
            expectedJson: "[{\"id\":\"a\",\"op\":\"delete\"}]",
            visible: true,
          },
        ],
      },
      {
        title: "Session Stability",
        difficulty: "Easy",
        timeLimitMinutes: 40,
        points: 100,
        prompt: "Return the longest streak of successful app launches from a boolean array.",
        starterCode: "function solve(launches) {\n  return 0;\n}",
        tests: [{ name: "Test Case 1", inputJson: "[true,true,false,true]", expectedJson: "2", visible: true }],
      },
    ],
  },
  {
    id: "ai",
    title: "Applied AI Engineer",
    icon: "puzzle",
    summary: "Python (Intermediate), Machine Learning, Natural Language Processing (Intermediate), RAG (Basic)",
    coreSkills: ["Python (Intermediate)", "Machine Learning", "Natural Language Processing (Intermediate)", "RAG (Basic)"],
    durationMinutes: 90,
    problems: [
      {
        title: "Embedding Deduplication",
        difficulty: "Medium",
        timeLimitMinutes: 45,
        points: 150,
        prompt: "Cluster text chunks by similarity score and return one representative id per group.",
        starterCode: "function solve(chunks) {\n  return [];\n}",
        tests: [
          {
            name: "Test Case 1",
            inputJson: "[{\"id\":\"a\",\"group\":1},{\"id\":\"b\",\"group\":1},{\"id\":\"c\",\"group\":2}]",
            expectedJson: "[\"a\",\"c\"]",
            visible: true,
          },
        ],
      },
      {
        title: "Prompt Safety Labels",
        difficulty: "Easy",
        timeLimitMinutes: 45,
        points: 100,
        prompt: "Count prompt labels and return the most frequent label.",
        starterCode: "function solve(labels) {\n  return '';\n}",
        tests: [{ name: "Test Case 1", inputJson: "[\"safe\",\"review\",\"safe\"]", expectedJson: "\"safe\"", visible: true }],
      },
    ],
  },
];

/**
 * Factory for an empty builder problem.
 */
export const blankProblem = {
  title: "Custom Coding Question",
  difficulty: "Easy",
  timeLimitMinutes: 30,
  points: 100,
  prompt: "Describe the task, input shape, and expected return value.",
  starterCode: "// Keep this function name as solve. Array test input is spread into arguments.\nfunction solve(input) {\n  return null;\n}",
  tests: [
    { name: "Test Case 1", inputJson: "[1,2,3]", expectedJson: "6", visible: true },
    { name: "Test Case 2", inputJson: "[4,5]", expectedJson: "9", visible: true },
  ],
};

/**
 * The start-from-blank template entry.
 */
export const customTemplate = {
  id: "custom",
  title: "Custom Assessment",
  icon: "code",
  summary: "Start blank and build your own role, sections, prompts, starter code, and tests.",
  coreSkills: [],
  durationMinutes: 30,
  problems: [blankProblem],
};
