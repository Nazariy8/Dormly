import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "../css/faq.scss";

const FAQ = ({ user }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");

  const faqItems = t("faq.items", { returnObjects: true }) || [];

  const filteredItems = Array.isArray(faqItems)
    ? faqItems.filter(
        (item) =>
          item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.answer.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : [];

  return (
    <main className="faq-page py-5">
      <div className="container">
        <header className="text-center mb-5">
          <span className="section-badge mb-3">{t("faq.badge")}</span>
          <h1 className="section-heading">{t("faq.title")}</h1>
          <p className="section-description">{t("faq.subtitle")}</p>

          <div className="faq-search-wrapper mt-4 mx-auto">
            <i className="bi bi-search search-icon"></i>
            <input
              type="text"
              className="faq-search-input"
              placeholder={t("faq.searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </header>

        <div className="row g-4 justify-content-center mt-2">
          {/* Ліва колонка: Швидкі дії + Підтримка */}
          <aside className="col-12 col-lg-4">
            <div className="faq-sidebar">
              <div className="quick-links mb-4">
                <button
                  type="button"
                  className="quick-link-btn"
                  onClick={() =>
                    user ? navigate("/profile") : navigate("/regist")
                  }
                >
                  <i className="bi bi-person me-2"></i>{" "}
                  {t("faq.sidebar.profileLink")}
                </button>
                <button
                  type="button"
                  className="quick-link-btn"
                  onClick={() => navigate("/test")}
                >
                  <i className="bi bi-person-check-fill me-2"></i>{" "}
                  {t("faq.sidebar.testLink")}
                </button>
              </div>

              <div className="support-card text-center p-4">
                <div className="support-icon-wrapper mb-3">
                  <i className="bi bi-patch-question fs-4"></i>
                </div>
                <h2 className="support-title h5 mb-2">
                  {t("faq.sidebar.supportTitle")}
                </h2>
                <p className="support-text mb-3">
                  {t("faq.sidebar.supportText")}
                </p>
                <a
                  href="mailto:support@dormly.app"
                  className="btn btn-support w-100"
                >
                  {t("faq.sidebar.contactBtn")}
                </a>
              </div>
            </div>
          </aside>

          {/* Права колонка: Акордеон питань */}
          <section className="col-12 col-lg-8" aria-label="FAQ Accordion">
            {filteredItems.length === 0 ? (
              <div className="text-center py-5 text-secondary">
                <p>{t("faq.noResults")}</p>
              </div>
            ) : (
              <div className="accordion custom-faq-accordion" id="faqAccordion">
                {filteredItems.map((item, index) => (
                  <div className="accordion-item" key={item.id}>
                    <h2 className="accordion-header">
                      <button
                        className={`accordion-button ${index !== 0 ? "collapsed" : ""}`}
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target={`#${item.id}`}
                        aria-expanded={index === 0 ? "true" : "false"}
                        aria-controls={item.id}
                      >
                        {item.question}
                      </button>
                    </h2>
                    <div
                      id={item.id}
                      className={`accordion-collapse collapse ${index === 0 ? "show" : ""}`}
                      data-bs-parent="#faqAccordion"
                    >
                      <div className="accordion-body">{item.answer}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
};

export default FAQ;
