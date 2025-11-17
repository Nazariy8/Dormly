import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../css/test.scss"; // Можна використати ті самі стилі або створити нові

const ResultOfTest = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Дістаємо дані, які ми передали через navigate
  // Використовуємо "через або" (|| {}), щоб код не впав, якщо хтось зайде на сторінку напряму
  const { userAnswers, questions } = location.state || {};

  // Якщо даних немає (наприклад, користувач просто ввів посилання в браузер)
  if (!userAnswers || !questions) {
    return (
      <div
        className="test-container"
        style={{ textAlign: "center", marginTop: "50px" }}
      >
        <h2>Результатів немає</h2>
        <p>Будь ласка, спочатку пройдіть тест.</p>
        <button onClick={() => navigate("/")}>Пройти тест</button>
      </div>
    );
  }

  return (
    <div
      className="test-container"
      style={{ maxWidth: "800px", margin: "0 auto", padding: "20px" }}
    >
      <h1 style={{ textAlign: "center", marginBottom: "30px" }}>
        Результати вашого тесту
      </h1>

      <div className="results-list">
        {questions.map((q) => (
          <div
            key={q.id}
            className="result-item"
            style={{
              marginBottom: "15px",
              padding: "15px",
              borderBottom: "1px solid #eee",
              backgroundColor: "#f9f9f9",
              borderRadius: "8px",
            }}
          >
            <h4 style={{ margin: "0 0 10px 0", color: "#333" }}>
              {q.id}. {q.questionText}
            </h4>
            <div style={{ color: "#007bff", fontWeight: "bold" }}>
              Ваша відповідь:
              <span
                style={{
                  color: "#000",
                  fontWeight: "normal",
                  marginLeft: "10px",
                }}
              >
                {userAnswers[q.id]}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="row">
        <div className="col-6  d-flex justify-content-start">
          <button
            className="testagain-btn"
            onClick={() => navigate("/test")} // Кнопка, щоб пройти тест заново
          >
            Пройти знову
          </button>
        </div>

        <div className="col-6 d-flex justify-content-end">
          <button
            className="gotoprofile-btn"
            onClick={() => {

              // if()

            }} // Кнопка, щоб пройти тест заново
          >
            До профілю
          </button>
        </div>


      </div>
    </div>
  );
};

export default ResultOfTest;
