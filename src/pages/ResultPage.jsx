import React, { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function formatSeconds(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function getPerformanceMessage(percentage) {
  if (percentage >= 90) return "Outstanding work! You are exam-ready.";
  if (percentage >= 75) return "Great job! You are on a strong track.";
  if (percentage >= 50) return "Good effort! Keep practicing to level up.";
  return "Keep going! Every attempt makes you stronger.";
}

function toAnswerArray(answer) {
  if (Array.isArray(answer)) {
    return [...new Set(answer.filter((index) => typeof index === "number"))].sort((a, b) => a - b);
  }
  if (typeof answer === "number") {
    return [answer];
  }
  return [];
}

function isCorrectAnswer(selected, expected) {
  const selectedIndices = toAnswerArray(selected);
  const expectedIndices = toAnswerArray(expected);
  if (selectedIndices.length !== expectedIndices.length) {
    return false;
  }
  return selectedIndices.every((value, index) => value === expectedIndices[index]);
}

function formatAnswer(options, answer) {
  const answerIndices = toAnswerArray(answer);
  if (answerIndices.length === 0) {
    return "Not answered";
  }
  return answerIndices.map((index) => options[index]).filter(Boolean).join(", ");
}

function ResultPage() {
  const navigate = useNavigate();
  const { state } = useLocation();

  const questions = state?.questions ?? [];
  const answers = state?.answers ?? [];
  const elapsedSeconds = Number(state?.elapsedSeconds) || 0;
  const config = state?.config ?? { mode: "all", randomQuestions: false, randomAnswers: false };

  const result = useMemo(() => {
    let correct = 0;
    const wrongQuestions = [];

    questions.forEach((question, index) => {
      const selected = answers[index];
      if (isCorrectAnswer(selected, question.correctAnswer)) {
        correct += 1;
      } else {
        wrongQuestions.push({
          question: question.question,
          options: question.options,
          selected,
          correctAnswer: question.correctAnswer
        });
      }
    });

    const total = questions.length;
    const wrong = total - correct;
    const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;

    return { total, correct, wrong, percentage, wrongQuestions };
  }, [answers, questions]);

  if (questions.length === 0) {
    return (
      <main className="page">
        <section className="card">
          <h2>No quiz session found.</h2>
          <button type="button" className="btn btn-primary" onClick={() => navigate("/")}>
            Go Home
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="page">
      <section className="card result-card">
        <h2>Quiz Result</h2>
        <p className="wish-message">{getPerformanceMessage(result.percentage)}</p>
        <div className="score-grid">
          <article>
            <strong>{result.total}</strong>
            <span>Total</span>
          </article>
          <article>
            <strong>{result.correct}</strong>
            <span>Correct</span>
          </article>
          <article>
            <strong>{result.wrong}</strong>
            <span>Wrong</span>
          </article>
          <article>
            <strong>{result.percentage}%</strong>
            <span>Score</span>
          </article>
        </div>
        <p className="muted timer">Completion Time: {formatSeconds(elapsedSeconds)}</p>

        <h3>Wrong Questions</h3>
        {result.wrongQuestions.length === 0 ? (
          <p className="correct-banner">Great job! No wrong answers.</p>
        ) : (
          <div className="wrong-list">
            {result.wrongQuestions.map((item) => (
              <article key={item.question} className="wrong-item">
                <p className="wrong-question">{item.question}</p>
                <p>
                  Your answer: <span className="danger">{formatAnswer(item.options, item.selected)}</span>
                </p>
                <p>
                  Correct answer: <span className="success">{formatAnswer(item.options, item.correctAnswer)}</span>
                </p>
              </article>
            ))}
          </div>
        )}

        <div className="row">
          <button type="button" className="btn btn-primary" onClick={() => navigate("/quiz", { state: config })}>
            Retry Quiz
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => navigate("/")}>
            Home
          </button>
        </div>
      </section>
    </main>
  );
}

export default ResultPage;
