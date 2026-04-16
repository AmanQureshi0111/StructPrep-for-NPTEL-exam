import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function HomePage() {
  const [randomQuestions, setRandomQuestions] = useState(false);
  const [randomAnswers, setRandomAnswers] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const navigate = useNavigate();

  return (
    <main className="page">
      <section className="card home-card">
        <h1>Structural Biology Practice Quiz</h1>
        <p className="muted">NPTEL exam preparation with weekly and full-length practice.</p>
        <p className="wish-message">Wishing you the very best for your Structural Biology exam prep!</p>

        <label className="checkbox-row" htmlFor="random-questions">
          <input
            id="random-questions"
            type="checkbox"
            checked={randomQuestions}
            onChange={(event) => setRandomQuestions(event.target.checked)}
          />
          Random Questions
        </label>

        <label className="checkbox-row" htmlFor="random-answers">
          <input
            id="random-answers"
            type="checkbox"
            checked={randomAnswers}
            onChange={(event) => setRandomAnswers(event.target.checked)}
          />
          Random Answers
        </label>

        <label className="checkbox-row" htmlFor="sound-enabled">
          <input
            id="sound-enabled"
            type="checkbox"
            checked={soundEnabled}
            onChange={(event) => setSoundEnabled(event.target.checked)}
          />
          Sound Effects
        </label>

        <div className="button-stack">
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => navigate("/weeks", { state: { randomQuestions, randomAnswers, soundEnabled } })}
          >
            Weekly Practice
          </button>
          <button
            type="button"
            className="btn btn-week"
            onClick={() =>
              navigate("/quiz", {
                state: { mode: "range", weekStart: 1, weekEnd: 6, randomQuestions, randomAnswers, soundEnabled }
              })
            }
          >
            Half Questions (Weeks 1-6)
          </button>
          <button
            type="button"
            className="btn btn-week"
            onClick={() =>
              navigate("/quiz", {
                state: { mode: "range", weekStart: 7, weekEnd: 12, randomQuestions, randomAnswers, soundEnabled }
              })
            }
          >
            Half Questions (Weeks 7-12)
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate("/quiz", { state: { mode: "all", randomQuestions, randomAnswers, soundEnabled } })}
          >
            All Questions Practice
          </button>
        </div>

        <section className="contact-box">
          <p className="muted">For updates, contact:</p>
          <div className="contact-links">
            <a className="link" href="https://www.linkedin.com/in/aman-qureshi-ab7811253/" target="_blank" rel="noreferrer">
              LinkedIn
            </a>
            <a className="link" href="mailto:amanq7362@gmail.com">
              amanq7362@gmail.com
            </a>
          </div>
        </section>
      </section>
    </main>
  );
}

export default HomePage;
