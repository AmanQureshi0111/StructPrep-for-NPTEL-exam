import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getQuizQuestions } from "../utils/questionUtils";
import QuizProgress from "../components/QuizProgress";

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
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [loadedFromStorage, setLoadedFromStorage] = useState(false);

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
        elapsedSeconds
      })
    );
  }, [answers, elapsedSeconds, index, loadedFromStorage, storageKey]);

  useEffect(() => {
    if (!loadedFromStorage) {
      return;
    }
    const timerId = window.setInterval(() => {
      setElapsedSeconds((value) => value + 1);
    }, 1000);
    return () => window.clearInterval(timerId);
  }, [loadedFromStorage]);

  const currentQuestion = questions[index];

  function handleAnswer(optionIndex) {
    playSelectSound(soundEnabled);
    const nextAnswers = [...answers];
    nextAnswers[index] = optionIndex;
    setAnswers(nextAnswers);

    if (index < questions.length - 1) {
      setIndex((current) => current + 1);
      return;
    }

    localStorage.removeItem(storageKey);
    navigate("/result", {
      state: {
        questions,
        answers: nextAnswers,
        elapsedSeconds,
        config: { mode, week, randomSequence, soundEnabled }
      }
    });
  }

  function handleBack() {
    if (index > 0) {
      setIndex((current) => current - 1);
    }
  }

  if (!currentQuestion) {
    return null;
  }

  return (
    <main className="page">
      <section className="card quiz-card">
        <QuizProgress current={index + 1} total={questions.length} label={mode === "week" ? `Week ${week}` : "All Weeks"} />
        <p className="muted timer">Time: {formatSeconds(elapsedSeconds)}</p>

        <h2 className="question">{currentQuestion.question}</h2>

        <div className="option-list">
          {currentQuestion.options.map((option, optionIndex) => (
            <button
              key={`${currentQuestion.question}-${option}`}
              type="button"
              className={`option ${answers[index] === optionIndex ? "selected" : ""}`}
              onClick={() => handleAnswer(optionIndex)}
            >
              {option}
            </button>
          ))}
        </div>

        <div className="row">
          <button type="button" className="btn btn-ghost" onClick={handleBack} disabled={index === 0}>
            Back
          </button>
        </div>
      </section>
    </main>
  );
}

export default QuizPage;
