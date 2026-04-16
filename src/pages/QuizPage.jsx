import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getQuizQuestions } from "../utils/questionUtils";
import QuizProgress from "../components/QuizProgress";

const MAX_WRONG_ANSWERS = 3;
const FEEDBACK_DISPLAY_MS = 500;

function playSelectSound(enabled) {
  if (!enabled) {
    return;
  }
  const AudioContextClass = window.AudioContext || window["webkitAudioContext"];
  if (!AudioContextClass) {
    return;
  }
  const audioContext = new AudioContextClass();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  oscillator.type = "triangle";
  oscillator.frequency.value = 760;

  gainNode.gain.setValueAtTime(0.04, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.08);

  oscillator.start();
  oscillator.stop(audioContext.currentTime + 0.08);
}

function formatSeconds(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function parseSavedProgress(value) {
  try {
    return JSON.parse(value);
  } catch (error) {
    if (error instanceof SyntaxError) {
      return null;
    }
    throw error;
  }
}

function getSelectedOptions(answer) {
  if (Array.isArray(answer)) {
    return [...new Set(answer.filter((index) => typeof index === "number"))].sort((a, b) => a - b);
  }
  if (typeof answer === "number") {
    return [answer];
  }
  return [];
}

function isCorrectAnswer(selected, expected) {
  const selectedIndices = getSelectedOptions(selected);
  const expectedIndices = getSelectedOptions(expected);
  if (selectedIndices.length !== expectedIndices.length) {
    return false;
  }
  return selectedIndices.every((value, position) => value === expectedIndices[position]);
}

function QuizPage() {
  const navigate = useNavigate();
  const { state } = useLocation();

  const mode = state?.mode || "all";
  const week = state?.week;
  const randomSequence = Boolean(state?.randomSequence);
  const soundEnabled = state?.soundEnabled ?? true;
  const storageKey = `structprep-progress-${mode}-${week ?? "all"}-${randomSequence ? "random" : "ordered"}`;

  const questions = useMemo(() => getQuizQuestions({ mode, week, randomSequence }), [mode, randomSequence, week]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [savedEvaluations, setSavedEvaluations] = useState([]);
  const [wrongAnswerCount, setWrongAnswerCount] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [loadedFromStorage, setLoadedFromStorage] = useState(false);
  const [saveFeedbackPending, setSaveFeedbackPending] = useState(false);
  const saveFeedbackTimeoutRef = useRef(null);

  useEffect(() => {
    if (questions.length === 0) {
      navigate("/", { replace: true });
    }
  }, [navigate, questions.length]);

  useEffect(() => {
    const savedRaw = localStorage.getItem(storageKey);
    if (!savedRaw) {
      setLoadedFromStorage(true);
      return;
    }
    const saved = parseSavedProgress(savedRaw);
    if (!saved || !Array.isArray(saved.answers) || typeof saved.index !== "number") {
      setLoadedFromStorage(true);
      return;
    }
    setAnswers(saved.answers);
    setSavedEvaluations(Array.isArray(saved.savedEvaluations) ? saved.savedEvaluations : []);
    setWrongAnswerCount(Math.min(Math.max(Number(saved.wrongAnswerCount) || 0, 0), MAX_WRONG_ANSWERS));
    setIndex(saved.index);
    setElapsedSeconds(Number(saved.elapsedSeconds) || 0);
    setLoadedFromStorage(true);
  }, [storageKey]);

  useEffect(() => {
    if (!loadedFromStorage) {
      return;
    }
    localStorage.setItem(
      storageKey,
      JSON.stringify({
        index,
        answers,
        savedEvaluations,
        wrongAnswerCount,
        elapsedSeconds
      })
    );
  }, [answers, elapsedSeconds, index, loadedFromStorage, savedEvaluations, storageKey, wrongAnswerCount]);

  useEffect(() => {
    if (!loadedFromStorage) {
      return;
    }
    const timerId = window.setInterval(() => {
      setElapsedSeconds((value) => value + 1);
    }, 1000);
    return () => window.clearInterval(timerId);
  }, [loadedFromStorage]);

  useEffect(
    () => () => {
      if (saveFeedbackTimeoutRef.current) {
        window.clearTimeout(saveFeedbackTimeoutRef.current);
      }
    },
    []
  );

  const currentQuestion = questions[index];
  const selectedOptions = getSelectedOptions(answers[index]);
  const correctOptionSet = new Set(getSelectedOptions(currentQuestion.correctAnswer));
  const currentSavedEvaluation = typeof savedEvaluations[index] === "boolean" ? savedEvaluations[index] : null;

  function submitQuiz(finalAnswers, finalWrongAnswerCount = wrongAnswerCount) {
    localStorage.removeItem(storageKey);
    navigate("/result", {
      state: {
        questions,
        answers: finalAnswers,
        elapsedSeconds,
        wrongAnswerCount: finalWrongAnswerCount,
        config: { mode, week, randomSequence, soundEnabled }
      }
    });
  }

  function handleAnswer(optionIndex) {
    if (saveFeedbackPending) {
      return;
    }
    playSelectSound(soundEnabled);
    const nextAnswers = [...answers];
    const nextSavedEvaluations = [...savedEvaluations];
    const selectedSet = new Set(getSelectedOptions(nextAnswers[index]));
    if (selectedSet.has(optionIndex)) {
      selectedSet.delete(optionIndex);
    } else {
      selectedSet.add(optionIndex);
    }
    nextAnswers[index] = [...selectedSet].sort((a, b) => a - b);
    nextSavedEvaluations[index] = undefined;
    setAnswers(nextAnswers);
    setSavedEvaluations(nextSavedEvaluations);
  }

  function handleSaveAnswer() {
    if (selectedOptions.length === 0 || saveFeedbackPending) {
      return;
    }

    const isCurrentAnswerCorrect = isCorrectAnswer(selectedOptions, currentQuestion.correctAnswer);
    const nextWrongAnswerCount = isCurrentAnswerCorrect ? wrongAnswerCount : wrongAnswerCount + 1;
    const nextSavedEvaluations = [...savedEvaluations];
    nextSavedEvaluations[index] = isCurrentAnswerCorrect;
    setSavedEvaluations(nextSavedEvaluations);
    setWrongAnswerCount(nextWrongAnswerCount);
    setSaveFeedbackPending(true);

    if (saveFeedbackTimeoutRef.current) {
      window.clearTimeout(saveFeedbackTimeoutRef.current);
    }
    saveFeedbackTimeoutRef.current = window.setTimeout(() => {
      setSaveFeedbackPending(false);
      if (!isCurrentAnswerCorrect && nextWrongAnswerCount >= MAX_WRONG_ANSWERS) {
        submitQuiz(answers, nextWrongAnswerCount);
        return;
      }
      if (index < questions.length - 1) {
        setIndex((current) => current + 1);
        return;
      }
      submitQuiz(answers, nextWrongAnswerCount);
    }, FEEDBACK_DISPLAY_MS);
  }

  function handleBack() {
    if (saveFeedbackPending) {
      return;
    }
    if (index > 0) {
      setIndex((current) => current - 1);
    }
  }

  function handleNext() {
    if (saveFeedbackPending) {
      return;
    }
    if (index < questions.length - 1) {
      setIndex((current) => current + 1);
      return;
    }
    submitQuiz(answers);
  }

  if (!currentQuestion) {
    return null;
  }

  return (
    <main className="page">
      <section className="card quiz-card">
        <QuizProgress current={index + 1} total={questions.length} label={mode === "week" ? `Week ${week}` : "All Weeks"} />
        <p className="muted timer">Time: {formatSeconds(elapsedSeconds)}</p>
        <div className="hearts" aria-label={`Wrong answers ${wrongAnswerCount} out of ${MAX_WRONG_ANSWERS}`}>
          {[0, 1, 2].map((heartIndex) => (
            <span key={`heart-${heartIndex}`} className={`heart ${heartIndex < wrongAnswerCount ? "faded" : ""}`}>
              ❤
            </span>
          ))}
        </div>

        <h2 className="question">{currentQuestion.question}</h2>
        <p className="muted">
          Save Answer checks and tracks hearts. {index < questions.length - 1 ? "Next" : "Submit Quiz"} skips checking and just continues.
        </p>

        <div className="option-list">
          {currentQuestion.options.map((option, optionIndex) => {
            const isSelected = selectedOptions.includes(optionIndex);
            const isWrongSelection = currentSavedEvaluation === false && isSelected && !correctOptionSet.has(optionIndex);

            return (
              <button
                key={`${currentQuestion.question}-${option}`}
                type="button"
                className={`option ${isSelected ? "selected" : ""} ${isWrongSelection ? "wrong-selected" : ""}`.trim()}
                onClick={() => handleAnswer(optionIndex)}
                disabled={saveFeedbackPending}
              >
                {option}
              </button>
            );
          })}
        </div>
        {currentSavedEvaluation !== null ? (
          <p className={`answer-feedback ${currentSavedEvaluation ? "success" : "danger"}`}>
            {currentSavedEvaluation ? "Correct answer." : "Wrong answer."}
          </p>
        ) : null}

        <div className="row">
          <button type="button" className="btn btn-ghost" onClick={handleBack} disabled={index === 0}>
            Back
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleSaveAnswer}
            disabled={selectedOptions.length === 0 || saveFeedbackPending}
          >
            Save Answer
          </button>
          <button type="button" className="btn btn-primary" onClick={handleNext} disabled={saveFeedbackPending}>
            {index < questions.length - 1 ? "Next" : "Submit Quiz"}
          </button>
        </div>
      </section>
    </main>
  );
}

export default QuizPage;
