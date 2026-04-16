import React, { useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getAvailableWeeks } from "../utils/questionUtils";

function WeekSelectPage() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const randomSequence = Boolean(state?.randomSequence);
  const soundEnabled = state?.soundEnabled ?? true;
  const weeks = useMemo(() => getAvailableWeeks(), []);

  return (
    <main className="page">
      <section className="card">
        <h2>Select Week</h2>
        <p className="muted">Choose a week to start focused practice.</p>

        <div className="week-grid">
          {weeks.map((week) => (
            <button
              key={week}
              type="button"
              className="btn btn-week"
              onClick={() => navigate("/quiz", { state: { mode: "week", week, randomSequence, soundEnabled } })}
            >
              Week {week}
            </button>
          ))}
        </div>

        <Link className="link" to="/">
          Back to Home
        </Link>
      </section>
    </main>
  );
}

export default WeekSelectPage;
