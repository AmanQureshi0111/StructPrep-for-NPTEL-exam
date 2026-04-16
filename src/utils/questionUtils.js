import rawQuestions from "../data/questions.json";

const citePattern = /\s*\[cite:\s*\d+\]/gi;

function cleanText(value) {
  if (typeof value !== "string") {
    return "";
  }
  return value.replace(citePattern, "").trim();
}

function getCorrectIndices(correctAnswer) {
  if (typeof correctAnswer === "number") {
    return [correctAnswer];
  }
  if (Array.isArray(correctAnswer)) {
    return [...new Set(correctAnswer.filter((index) => typeof index === "number" && Number.isInteger(index) && index >= 0))];
  }
  return [];
}

function toNormalizedQuestion(item) {
  const rawOptions = Array.isArray(item.options) ? item.options.map(cleanText).filter(Boolean) : [];
  const rawCorrectIndices = getCorrectIndices(item.correctAnswer);

  if (!item || !cleanText(item.question) || rawOptions.length < 2 || rawCorrectIndices.length === 0) {
    return null;
  }

  const correctSourceIndices = rawCorrectIndices.filter((index) => index < rawOptions.length);
  if (correctSourceIndices.length === 0) {
    return null;
  }

  return {
    question: cleanText(item.question),
    options: rawOptions,
    correctAnswer: [...new Set(correctSourceIndices)].sort((a, b) => a - b),
    week: Number(item.week) || 1
  };
}

export function getQuestions() {
  return rawQuestions.map(toNormalizedQuestion).filter(Boolean);
}

export function getAvailableWeeks() {
  const weeks = new Set(getQuestions().map((q) => q.week));
  return [...weeks].sort((a, b) => a - b);
}

export function shuffle(items) {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

export function getQuizQuestions({ mode, week, randomSequence }) {
  const allQuestions = getQuestions();
  const filtered =
    mode === "week"
      ? allQuestions.filter((question) => question.week === Number(week))
      : allQuestions;

  return randomSequence ? shuffle(filtered) : filtered;
}
