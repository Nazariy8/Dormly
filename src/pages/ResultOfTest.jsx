import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../css/test.scss";

const ResultOfTest = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { userAnswers, userAnswerIds, questions } = location.state || {};

  const handleSubmitForSearch = () => {
    navigate("/profile", {
      state: {
        userAnswers: userAnswers,
        userAnswerIds: userAnswerIds,
        questions: questions,
      },
    });
  };

  if (!userAnswers || !questions) {
    return (
      <main className="results-page-wrapper d-flex align-items-center justify-content-center">
        <section className="empty-results-card">
          <i className="bi bi-clipboard-x empty-icon"></i>
          <h2>Результатів немає</h2>
          <p>Будь ласка, пройдіть тест для отримання рекомендацій.</p>
          <button className="btn-profile-go" onClick={() => navigate("/test")}>
            Пройти тест
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="results-page-wrapper">
      <div className="results-container">
        <header className="results-header">
          <div className="results-badge">
            <i className="bi bi-check2-circle"></i> Тест завершено
          </div>
          <h1 className="results-title">Ваші звички та вподобання</h1>
          <p className="results-subtitle">
            Ось сформовані параметри, які допоможуть знайти найбільш сумісного
            сусіда
          </p>
        </header>

        <section className="results-list" aria-label="Список відповідей">
          {questions.map((q) => (
            <article key={q.id} className="result-card">
              <h2 className="result-question">
                {q.id}. {q.questionText}
              </h2>
              <div className="result-answer-box">
                <span>Відповідь:</span>
                <span className="answer-pill">{userAnswers[q.id]}</span>
              </div>
            </article>
          ))}
        </section>

        <footer className="results-actions">
          <button
            type="button"
            className="btn-retest"
            onClick={() => navigate("/test")}
          >
            Пройти знову
          </button>

          <button
            type="button"
            className="btn-profile-go"
            onClick={handleSubmitForSearch}
          >
            Перейти до профілю
          </button>
        </footer>
      </div>
    </main>
  );
};

export default ResultOfTest;
