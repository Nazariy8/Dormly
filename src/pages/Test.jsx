import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "../css/test.scss";
import { db, auth } from "../firebase";
import { doc, updateDoc } from "firebase/firestore";

// Структура зберігає тільки ідентифікатори (контент береться з i18n)
const testSchema = [
  { id: 1, category: "cleanliness", optionIds: ["1.1", "1.2", "1.3"] },
  { id: 2, category: "cleanliness", optionIds: ["2.1", "2.2", "2.3"] },
  { id: 3, category: "cleanliness", optionIds: ["3.1", "3.2", "3.3"] },
  { id: 4, category: "routine", optionIds: ["4.1", "4.2", "4.3"] },
  { id: 5, category: "routine", optionIds: ["5.1", "5.2", "5.3"] },
  { id: 6, category: "routine", optionIds: ["6.1", "6.2", "6.3"] },
  { id: 7, category: "social", optionIds: ["7.1", "7.2", "7.3"] },
  { id: 8, category: "social", optionIds: ["8.1", "8.2", "8.3"] },
  { id: 9, category: "social", optionIds: ["9.1", "9.2", "9.3"] },
  { id: 10, category: "rules", optionIds: ["10.1", "10.2", "10.3"] },
  { id: 11, category: "rules", optionIds: ["11.1", "11.2", "11.3"] },
  { id: 12, category: "rules", optionIds: ["12.1", "12.2", "12.3"] },
  { id: 13, category: "comfort", optionIds: ["13.1", "13.2", "13.3"] },
  { id: 14, category: "comfort", optionIds: ["14.1", "14.2", "14.3"] },
  { id: 15, category: "comfort", optionIds: ["15.1", "15.2", "15.3"] },
];

const Test = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptionIds, setSelectedOptionIds] = useState({});
  const [isExiting, setIsExiting] = useState(false);

  const currentQ = testSchema[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === testSchema.length - 1;

  const handleSelect = (optId) => {
    setSelectedOptionIds((prev) => ({
      ...prev,
      [String(currentQ.id)]: optId,
    }));
  };

  const handleSubmit = useCallback(async () => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      try {
        const userRef = doc(db, "users", currentUser.uid);
        await updateDoc(userRef, {
          // Зберігаємо виключно ID варіантів для коректного метчингу
          answers: selectedOptionIds,
          hasPassedTest: true,
          lastTestDate: new Date(),
        });
      } catch (error) {
        console.error("Помилка збереження результатів:", error);
      }
    }

    navigate("/resultoftest", {
      state: {
        userAnswerIds: selectedOptionIds,
        testSchema: testSchema,
      },
    });
  }, [selectedOptionIds, navigate]);

  const handleNext = useCallback(() => {
    if (!selectedOptionIds[currentQ.id]) {
      alert(t("test.alertSelect"));
      return;
    }

    if (isLastQuestion) {
      handleSubmit();
    } else {
      setIsExiting(true);
      setTimeout(() => {
        setCurrentQuestionIndex((prev) => prev + 1);
        setIsExiting(false);
      }, 250);
    }
  }, [selectedOptionIds, currentQ.id, isLastQuestion, handleSubmit, t]);

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setIsExiting(true);
      setTimeout(() => {
        setCurrentQuestionIndex((prev) => prev - 1);
        setIsExiting(false);
      }, 250);
    }
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        handleNext();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNext]);

  const progressPercentage =
    ((currentQuestionIndex + 1) / testSchema.length) * 100;

  return (
    <main className="test-page-wrapper">
      <Link
        to="/"
        className="auth-back-btn d-flex align-items-center justify-content-center mb-4"
        title={t("test.backHome")}
      >
        <i className="bi bi-arrow-left"></i>
      </Link>

      <section className="test-container-card" aria-label="Habit Test">
        <div
          className="progress-bar-container"
          role="progressbar"
          aria-valuenow={progressPercentage}
          aria-valuemin="0"
          aria-valuemax="100"
        >
          <div
            className="progress-bar-fill"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>

        <div
          className={`question-content ${isExiting ? "fade-out" : "fade-in"}`}
        >
          <div className="category-badge">
            {t(`test.categories.${currentQ.category}`)}
          </div>

          <h1 className="question-title">
            {t(`test.questions.${currentQ.id}.text`)}
          </h1>

          <div className="options-area">
            <div className="options-grid">
              {currentQ.optionIds.map((optId) => {
                const isSelected = selectedOptionIds[currentQ.id] === optId;
                return (
                  <div
                    key={optId}
                    className={`option-card ${isSelected ? "selected" : ""}`}
                    onClick={() => handleSelect(optId)}
                    role="button"
                    tabIndex={0}
                  >
                    <span>
                      {t(`test.questions.${currentQ.id}.options.${optId}`)}
                    </span>
                    {isSelected && (
                      <i className="bi bi-check-lg check-icon"></i>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div>
          <footer className="navigation-buttons">
            <button
              type="button"
              className="btn-prev"
              onClick={handlePrev}
              disabled={currentQuestionIndex === 0}
            >
              {t("test.btnBack")}
            </button>

            <button type="button" className="btn-next" onClick={handleNext}>
              {isLastQuestion ? t("test.btnFinish") : t("test.btnNext")}
            </button>
          </footer>

          <div className="step-indicator">
            {t("test.stepIndicator", {
              current: currentQuestionIndex + 1,
              total: testSchema.length,
            })}
          </div>
        </div>
      </section>
    </main>
  );
};

export default Test;
