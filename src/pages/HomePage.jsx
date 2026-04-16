import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function HomePage() {
  const [randomSequence, setRandomSequence] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const navigate = useNavigate();

  return (
    <main className="page">
      <section className="card home-card">
        <h1>Structural Biology Practice Quiz</h1>
        <p className="muted">NPTEL exam preparation with weekly and full-length practice.</p>
        <p className="wish-message">Wishing you the very best for your Structural Biology exam prep!</p>

        <label className="checkbox-row" htmlFor="random-sequence">
          <input
            id="random-sequence"
            type="checkbox"
            checked={randomSequence}
            onChange={(event) => setRandomSequence(event.target.checked)}
          />
          Random Sequence
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
            onClick={() => navigate("/weeks", { state: { randomSequence, soundEnabled } })}
          >
            Weekly Practice
          </button>
          <button
            type="button"
            className="btn btn-week"
            onClick={() =>
              navigate("/quiz", { state: { mode: "range", weekStart: 1, weekEnd: 6, randomSequence, soundEnabled } })
            }
          >
            Half Questions (Weeks 1-6)
          </button>
          <button
            type="button"
            className="btn btn-week"
            onClick={() =>
              navigate("/quiz", { state: { mode: "range", weekStart: 7, weekEnd: 12, randomSequence, soundEnabled } })
            }
          >
            Half Questions (Weeks 7-12)
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate("/quiz", { state: { mode: "all", randomSequence, soundEnabled } })}
          >
            All Questions Practice
          </button>
        </div>
      </section>
    </main>
  );
}

export default HomePage;
