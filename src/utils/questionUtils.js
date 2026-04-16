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

function shuffleQuestionOptions(question) {
  const optionEntries = question.options.map((option, originalIndex) => ({ option, originalIndex }));
  const shuffledEntries = shuffle(optionEntries);
  const remapIndexBySource = new Map(shuffledEntries.map((entry, index) => [entry.originalIndex, index]));
  const remappedCorrectAnswers = question.correctAnswer
    .map((sourceIndex) => remapIndexBySource.get(sourceIndex))
    .filter((index) => typeof index === "number")
    .filter((index) => index >= 0)
    .sort((a, b) => a - b);

  return {
    ...question,
    options: shuffledEntries.map((entry) => entry.option),
    correctAnswer: remappedCorrectAnswers
  };
}

export function getQuizQuestions({ mode, week, weekStart, weekEnd, randomQuestions, randomAnswers }) {
  const allQuestions = getQuestions();
  let filtered = allQuestions;

  if (mode === "week") {
    filtered = allQuestions.filter((question) => question.week === Number(week));
  } else if (mode === "range") {
    const start = Number(weekStart);
    const end = Number(weekEnd);
    filtered = allQuestions.filter((question) => question.week >= start && question.week <= end);
  }

  const orderedQuestions = randomQuestions ? shuffle(filtered) : filtered;
  return randomAnswers ? orderedQuestions.map(shuffleQuestionOptions) : orderedQuestions;
}
