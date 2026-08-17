import React from "react";

const Advan = () => {
  return (
    <div>
      <section className="advantages-section" id="advantage-heading">
        <div
          className="container"
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            minHeight: "80vh",
            height: "auto",
          }}
        >
          {/* Заголовок секції */}
          <div className="text-center mb-5">
            <span className="section-badge mb-3">Переваги платформи</span>
            <h2 className="section-heading">Чому обирають Dormly?</h2>
            <p className="section-description">
              Ми створюємо прозоре, безпечне та комфортне середовище для
              студентського життя.
            </p>
          </div>

          {/* Сітка карток (Bento Grid) */}
          <div className="row g-4 justify-content-center">
            {/* Картка 1 */}
            <div className="col-12 col-md-6 col-lg-4">
              <div className="feature-card h-100">
                <div className="feature-icon-wrapper">
                  <i className="bi bi-shield-check"></i>
                </div>
                <h3 className="feature-title">Безпека та верифікація</h3>
                <p className="feature-text">
                  Перевірка студентських профілів та модерація для вашого спокою
                  і захисту особистого простору.
                </p>
              </div>
            </div>

            {/* Картка 2 */}
            <div className="col-12 col-md-6 col-lg-4">
              <div className="feature-card h-100">
                <div className="feature-icon-wrapper">
                  <i className="bi bi-sliders"></i>
                </div>
                <h3 className="feature-title">Точна сумісність</h3>
                <p className="feature-text">
                  Алгоритм зіставляє ваші біоритми, звички прибирання, графік
                  навчання та хобі для ідеального збігу.
                </p>
              </div>
            </div>

            {/* Картка 3 */}
            <div className="col-12 col-md-6 col-lg-4">
              <div className="feature-card h-100">
                <div className="feature-icon-wrapper">
                  <i className="bi bi-people"></i>
                </div>
                <h3 className="feature-title">Студентська спільнота</h3>
                <p className="feature-text">
                  Знаходьте однодумців зі свого факультету чи гуртожитку ще до
                  початку навчального семестру.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Advan;
