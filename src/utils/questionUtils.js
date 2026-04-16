import rawQuestions from "../data/questions.json";

const citePattern = /\s*\[cite:\s*\d+\]/gi;

function cleanText(value) {
  if (typeof value !== "string") {
    return "";
  }
  return value.replace(citePattern, "").trim();
}

function getSingleCorrectIndex(correctAnswer) {
  if (typeof correctAnswer === "number") {
    return correctAnswer;
  }
  if (Array.isArray(correctAnswer) && correctAnswer.length > 0) {
    return correctAnswer.find((index) => typeof index === "number") ?? -1;
  }
  return -1;
}

function toStrictFourOptionQuestion(item) {
  const rawOptions = Array.isArray(item.options) ? item.options.map(cleanText).filter(Boolean) : [];
  const rawCorrect = getSingleCorrectIndex(item.correctAnswer);

  if (!item || !cleanText(item.question) || rawOptions.length < 4 || rawCorrect < 0 || rawCorrect >= rawOptions.length) {
    return null;
  }

  const correctOptionText = rawOptions[rawCorrect];
  let options = rawOptions.slice(0, 4);

  if (!options.includes(correctOptionText)) {
    options[3] = correctOptionText;
  }

  const correctAnswer = options.indexOf(correctOptionText);
  if (correctAnswer < 0) {
    return null;
  }

  return {
    question: cleanText(item.question),
    options,
    correctAnswer,
    week: Number(item.week) || 1
  };
}

export function getQuestions() {
  return rawQuestions.map(toStrictFourOptionQuestion).filter(Boolean);
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
