import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "../css/test.scss";

// Схема питань за замовчуванням на випадок прямого рендеру
const defaultSchema = [
  { id: 1 },
  { id: 2 },
  { id: 3 },
  { id: 4 },
  { id: 5 },
  { id: 6 },
  { id: 7 },
  { id: 8 },
  { id: 9 },
  { id: 10 },
  { id: 11 },
  { id: 12 },
  { id: 13 },
  { id: 14 },
  { id: 15 },
];

const ResultOfTest = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  // Підтримуємо як новий формат (userAnswerIds, testSchema), так і старий (userAnswers, questions)
  const { userAnswerIds, userAnswers, testSchema, questions } =
    location.state || {};

  const answers = userAnswerIds || userAnswers;
  const items = testSchema || questions || (answers ? defaultSchema : null);

  const handleSubmitForSearch = () => {
    navigate("/profile", {
      state: {
        userAnswerIds: answers,
      },
    });
  };

  if (!answers) {
    return (
      <main className="results-page-wrapper d-flex align-items-center justify-content-center">
        <section className="empty-results-card">
          <i className="bi bi-clipboard-x empty-icon"></i>
          <h2>{t("test.noResultsTitle", "Результатів немає")}</h2>
          <p>
            {t(
              "test.noResultsSubtitle",
              "Будь ласка, пройдіть тест для отримання рекомендацій.",
            )}
          </p>
          <button className="btn-profile-go" onClick={() => navigate("/test")}>
            {t("test.passTestBtn", "Пройти тест")}
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
            <i className="bi bi-check2-circle"></i>{" "}
            {t("test.completedBadge", "Тест завершено")}
          </div>
          <h1 className="results-title">
            {t("test.resultsTitle", "Ваші звички та вподобання")}
          </h1>
          <p className="results-subtitle">
            {t(
              "test.resultsSubtitle",
              "Ось сформовані параметри, які допоможуть знайти найбільш сумісного сусіда",
            )}
          </p>
        </header>

        <section className="results-list" aria-label="Список відповідей">
          {items.map((q) => {
            const rawAnswer = answers[q.id];
            // Якщо значення — це ключ варіанту ("1.1", "4.2"), витягуємо переклад
            const isKeyFormat =
              typeof rawAnswer === "string" && rawAnswer.includes(".");
            const displayedText = isKeyFormat
              ? t(`test.questions.${q.id}.options.${rawAnswer}`, {
                  defaultValue: rawAnswer,
                })
              : rawAnswer || q.questionText;

            return (
              <article key={q.id} className="result-card">
                <h2 className="result-question">
                  {q.id}.{" "}
                  {t(`test.questions.${q.id}.text`, {
                    defaultValue: q.questionText,
                  })}
                </h2>
                <div className="result-answer-box">
                  <span>{t("test.answerLabel", "Відповідь")}:</span>
                  <span className="answer-pill">{displayedText}</span>
                </div>
              </article>
            );
          })}
        </section>

        <footer className="results-actions">
          <button
            type="button"
            className="btn-retest"
            onClick={() => navigate("/test")}
          >
            {t("test.retestBtn", "Пройти знову")}
          </button>

          <button
            type="button"
            className="btn-profile-go"
            onClick={handleSubmitForSearch}
          >
            {t("test.toProfileBtn", "Перейти до профілю")}
          </button>
        </footer>
      </div>
    </main>
  );
};

export default ResultOfTest;
