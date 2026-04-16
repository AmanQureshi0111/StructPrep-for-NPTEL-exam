import React from "react";

function QuizProgress({ current, total, label }) {
  return (
    <div className="row space-between">
      <p className="muted">
        Question {current}/{total}
      </p>
      <p className="tag">{label}</p>
    </div>
  );
}

export default QuizProgress;
