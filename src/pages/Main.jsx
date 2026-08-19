import React, { useEffect } from "react";
import Header from "../components/Header";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { HashLink } from "react-router-hash-link";

const Main = ({ user }) => {
  const { t } = useTranslation();

  const navigate = useNavigate();

  useEffect(() => {
    alert("Product is on the beta-test. Full version will be soon!")
  }, [])

  return (
    <main>
      <section className="hero-section text-center">
        <div
          className="container d-flex flex-column align-items-center"
          style={{
            display: "flex",
            flexDirection: "column",
            minHeight: "80vh",
            height: "auto",
          }}
        >
          <span className="hero-subtitle mb-4 bg-warning text-black fw-bold px-2 rounded-pill">
            Product is in beta testing. Full version coming soon!
          </span>
          {/* Акуратний бейдж Vercel */}
          <div className="hero-badge mb-4">
            <span className="badge-dot"></span>
            <span>{t("hero.badge", "Dormly 2.0 для студентів")}</span>
          </div>

          {/* Заголовок */}
          <h1 className="hero-title mb-3">
            {t("hero.title", "Знайди свого ідеального сусіда по кімнаті")}
          </h1>

          {/* Підзаголовок */}
          <p className="hero-subtitle mb-4">
            {t(
              "hero.subtitle",
              "Алгоритм підбору співмешканців за спільними інтересами, звичками та графіком навчання.",
            )}
          </p>

          {/* Кнопки дій */}
          <div className="hero-actions d-flex gap-3 justify-content-center flex-wrap">
            <Link
              to={user ? "/test" : "login"}
              className="btn btn-hero-primary"
            >
              {t("hero.passTest", "Пройти тест")}
            </Link>
            <HashLink
              to="#advantage-heading"
              className="btn btn-hero-secondary"
            >
              {t("hero.howItWorks", "Як це працює")}
            </HashLink>
          </div>

          {/* Інтерактивне прев'ю інтерфейсу Dormly (ТЕПЕР ВОНО ТУТ, ПІД КНОПКАМИ) */}
          <div className="hero-preview-card mt-5 text-start">
            <div className="preview-header d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center gap-2">
                <span className="dot dot-red"></span>
                <span className="dot dot-yellow"></span>
                <span className="dot dot-green"></span>
                <span className="preview-tag ms-2">
                  {t("hero.preview.matchFound")}
                </span>
              </div>
              <span className="badge-match text-center">
                {t("hero.preview.perfectMatch")}
              </span>
            </div>

            <div className="preview-body d-flex flex-column flex-md-row align-items-center gap-4 mt-3">
              <div className="preview-avatar">{t("hero.preview.avatar")}</div>
              <div className="flex-grow-1">
                <h4 className="m-0 text-white fw-bold">
                  {t("hero.preview.name")}
                </h4>
                <p className="m-0 text-secondary small">
                  {t("hero.preview.meta")}
                </p>
                <div className="d-flex gap-2 mt-2 flex-wrap preview-tags">
                  <span className="tag-pill">{t("hero.preview.tagGames")}</span>
                  <span className="tag-pill">{t("hero.preview.tagDev")}</span>
                  <span className="tag-pill">{t("hero.preview.tagQuiet")}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
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
            <span className="section-badge mb-3">{t("advantages.badge")}</span>
            <h2 className="section-heading">{t("advantages.title")}</h2>
            <p className="section-description">{t("advantages.subtitle")}</p>
          </div>

          {/* Сітка карток (Bento Grid) */}
          <div className="row g-4 justify-content-center">
            {/* Картка 1 */}
            <div className="col-12 col-md-6 col-lg-4">
              <div className="feature-card h-100">
                <div className="feature-icon-wrapper">
                  <i className="bi bi-shield-check"></i>
                </div>
                <h3 className="feature-title">
                  {t("advantages.cards.security.title")}
                </h3>
                <p className="feature-text">
                  {t("advantages.cards.security.description")}
                </p>
              </div>
            </div>

            {/* Картка 2 */}
            <div className="col-12 col-md-6 col-lg-4">
              <div className="feature-card h-100">
                <div className="feature-icon-wrapper">
                  <i className="bi bi-sliders"></i>
                </div>
                <h3 className="feature-title">
                  {t("advantages.cards.match.title")}
                </h3>
                <p className="feature-text">
                  {t("advantages.cards.match.description")}
                </p>
              </div>
            </div>

            {/* Картка 3 */}
            <div className="col-12 col-md-6 col-lg-4">
              <div className="feature-card h-100">
                <div className="feature-icon-wrapper">
                  <i className="bi bi-people"></i>
                </div>
                <h3 className="feature-title">
                  {t("advantages.cards.community.title")}
                </h3>
                <p className="feature-text">
                  {t("advantages.cards.community.description")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="feedbacks-section" id="feedbacks-heading">
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
          {/* Заголовок */}
          <div className="text-center mb-5">
            <span className="section-badge mb-3">{t("feedbacks.badge")}</span>
            <h2 className="section-heading">{t("feedbacks.title")}</h2>
            <p className="section-description">{t("feedbacks.subtitle")}</p>
          </div>

          {/* Сітка відгуків */}
          <div className="row g-4 justify-content-center">
            {/* Відгук 1 */}
            <div className="col-12 col-md-6 col-lg-4">
              <div className="feedback-card h-100">
                <p className="feedback-quote">
                  {t("feedbacks.reviews.user1.quote")}
                </p>
                <div className="feedback-user-info">
                  <div className="feedback-avatar-placeholder">
                    {t("feedbacks.reviews.user1.avatar")}
                  </div>
                  <div>
                    <h4 className="user-name">
                      {t("feedbacks.reviews.user1.name")}
                    </h4>
                    <span className="user-role">
                      {t("feedbacks.reviews.user1.role")}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Відгук 2 */}
            <div className="col-12 col-md-6 col-lg-4">
              <div className="feedback-card h-100">
                <p className="feedback-quote">
                  {t("feedbacks.reviews.user2.quote")}
                </p>
                <div className="feedback-user-info">
                  <div className="feedback-avatar-placeholder">
                    {t("feedbacks.reviews.user2.avatar")}
                  </div>
                  <div>
                    <h4 className="user-name">
                      {t("feedbacks.reviews.user2.name")}
                    </h4>
                    <span className="user-role">
                      {t("feedbacks.reviews.user2.role")}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Відгук 3 */}
            <div className="col-12 col-md-6 col-lg-4">
              <div className="feedback-card h-100">
                <p className="feedback-quote">
                  {t("feedbacks.reviews.user3.quote")}
                </p>
                <div className="feedback-user-info">
                  <div className="feedback-avatar-placeholder">
                    {t("feedbacks.reviews.user3.avatar")}
                  </div>
                  <div>
                    <h4 className="user-name">
                      {t("feedbacks.reviews.user3.name")}
                    </h4>
                    <span className="user-role">
                      {t("feedbacks.reviews.user3.role")}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Main;
