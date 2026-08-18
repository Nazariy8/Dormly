import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "../css/faq.scss"
const FAQ = ({ user }) => {
    
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="faq-page py-5">
      <div className="container">
        <div className="text-center mb-5">
          <span className="section-badge mb-3">
            {t("faq.badge", "Допомога")}
          </span>
          <h1 className="section-heading">
            {t("faq.title", "Чим ми можемо вам допомогти?")}
          </h1>
          <p className="section-description">
            {t(
              "faq.subtitle",
              "Знаходьте відповіді на свої запитання нижче або зв'яжіться з нашою підтримкою.",
            )}
          </p>

          {/* Поле пошуку */}
          <div className="faq-search-wrapper mt-4 mx-auto">
            <i className="bi bi-search search-icon"></i>
            <input
              type="text"
              className="faq-search-input"
              placeholder={t("faq.searchPlaceholder", "Пошук запитання...")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="row g-4 justify-content-center mt-2">
          {/* Ліва колонка: Швидкі дії + Підтримка */}
          <div className="col-12 col-lg-4">
            <div className="faq-sidebar">
              <div className="quick-links mb-4">
                <button
                  type="button"
                  className="quick-link-btn"
                  onClick={() =>
                    user ? navigate("/profile") : navigate("/regist")
                  }
                >
                  <i className="bi bi-person me-2"></i> Реєстрація та профіль
                </button>
                <button
                  type="button"
                  className="quick-link-btn"
                  onClick={() => navigate("/test")}
                >
                  <i className="bi bi-person-check-fill me-2"></i> Тест на
                  сумісність
                </button>
              </div>

              {/* Блок підтримки */}
              <div className="support-card text-center p-4">
                <div className="support-icon-wrapper mb-3">
                  <i className="bi bi-patch-question fs-4"></i>
                </div>
                <h4 className="support-title mb-2">Не знайшли відповідь?</h4>
                <p className="support-text mb-3">
                  Наша команда підтримки завжди готова допомогти вирішити
                  будь-які труднощі.
                </p>
                <a
                  href="mailto:support@dormly.app"
                  className="btn btn-support w-100"
                >
                  Зв'язатися з нами
                </a>
              </div>
            </div>
          </div>

          {/* Права колонка: Акордеон питань */}
          <div className="col-12 col-lg-8">
            <div className="accordion custom-faq-accordion" id="faqAccordion">
              <div className="accordion-item">
                <h2 className="accordion-header">
                  <button
                    className="accordion-button"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#faq-1"
                    aria-expanded="true"
                  >
                    Що таке Dormly?
                  </button>
                </h2>
                <div
                  id="faq-1"
                  className="accordion-collapse collapse show"
                  data-bs-parent="#faqAccordion"
                >
                  <div className="accordion-body">
                    Dormly — це платформа, створена, щоб допомогти студентам
                    знайти ідеального сусіда по кімнаті в гуртожитку на основі
                    тесту на сумісність особистості та способу життя.
                  </div>
                </div>
              </div>

              <div className="accordion-item">
                <h2 className="accordion-header">
                  <button
                    className="accordion-button collapsed"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#faq-2"
                  >
                    Як працює тест на сумісність?
                  </button>
                </h2>
                <div
                  id="faq-2"
                  className="accordion-collapse collapse"
                  data-bs-parent="#faqAccordion"
                >
                  <div className="accordion-body">
                    Наш тест аналізує ваші відповіді на питання про звички,
                    стиль життя, соціальну активність та особисті вподобання,
                    щоб знайти співмешканців з найвищим відсотком сумісності.
                  </div>
                </div>
              </div>

              <div className="accordion-item">
                <h2 className="accordion-header">
                  <button
                    className="accordion-button collapsed"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#faq-3"
                  >
                    Чи є Dormly безкоштовним?
                  </button>
                </h2>
                <div
                  id="faq-3"
                  className="accordion-collapse collapse"
                  data-bs-parent="#faqAccordion"
                >
                  <div className="accordion-body">
                    Так, базові функції Dormly (створення профілю, проходження
                    тесту та пошук сусідів) є повністю безкоштовними для
                    студентів.
                  </div>
                </div>
              </div>

              <div className="accordion-item">
                <h2 className="accordion-header">
                  <button
                    className="accordion-button collapsed"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#faq-4"
                  >
                    Чи можу я змінити відповіді на тест пізніше?
                  </button>
                </h2>
                <div
                  id="faq-4"
                  className="accordion-collapse collapse"
                  data-bs-parent="#faqAccordion"
                >
                  <div className="accordion-body">
                    Звісно! Ви можете будь-коли перепройти тест або змінити дані
                    профілю у налаштуваннях.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
