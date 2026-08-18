import React from "react";
import { Link } from "react-router-dom";
import { HashLink } from "react-router-hash-link";
import { useTranslation } from "react-i18next";

const Header = ({ user }) => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language?.startsWith("en") ? "en" : "ua";

  const toggleLanguage = (lang) => {
    i18n.changeLanguage(lang);
  };

  return (
    <header className="custom-header sticky-top">
      <nav className="navbar navbar-expand-lg custom-navbar">
        <div className="container-xl d-flex align-items-center justify-content-between">
          {/* ЛОГОТИП */}
          <Link className="navbar-brand p-0 logo-link" to="/" title="logo">
            Dormly
          </Link>

          {/* МОБІЛЬНА КНОПКА (БУРГЕР) */}
          <button
            className="navbar-toggler border-0 text-white shadow-none"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarSupportedContent"
            aria-controls="navbarSupportedContent"
            aria-expanded="false"
            aria-label="Toggle navigation"
            title="navbar-toggler"
          >
            <i className="bi bi-list fs-2 text-white"></i>
          </button>

          {/* НАВІГАЦІЯ ТА КНОПКИ */}
          <div
            className="collapse navbar-collapse justify-content-end"
            id="navbarSupportedContent"
          >
            <ul className="navbar-nav align-items-lg-center gap-lg-2 my-3 my-lg-0">
              <li className="nav-item">
                <Link className="nav-link px-3" to="/faq">
                  {t("header.questions")}
                </Link>
              </li>

              {!user ? (
                <>
                  <li className="nav-item">
                    <HashLink
                      className="nav-link px-3"
                      to="/#advantage-heading"
                      smooth
                    >
                      {t("header.advantages")}
                    </HashLink>
                  </li>
                  <li className="nav-item">
                    <HashLink
                      className="nav-link px-3"
                      to="/#feedbacks-heading"
                      smooth
                    >
                      {t("header.feedbacks")}
                    </HashLink>
                  </li>

                  {/* Кнопки авторизації */}
                  <li className="nav-item ms-lg-2 mt-2 mt-lg-0">
                    <Link
                      className="btn-auth-outline d-inline-block text-center w-100"
                      to="/login"
                    >
                      {t("header.login")}
                    </Link>
                  </li>
                  <li className="nav-item ms-lg-1 mt-2 mt-lg-0">
                    <Link
                      className="btn-auth-solid d-inline-block text-center w-100"
                      to="/regist"
                    >
                      {t("header.register")}
                    </Link>
                  </li>
                </>
              ) : (
                <>
                  <li className="nav-item">
                    <Link to="/chat" className="nav-link px-3">
                      {t("header.chat")}
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link to="/roommates" className="nav-link px-3">
                      {t("header.roommates")}
                    </Link>
                  </li>
                  <li className="nav-item ms-lg-2 mt-2 mt-lg-0">
                    <Link
                      className="btn-auth-solid d-inline-block text-center px-4"
                      to="/profile"
                    >
                      {t("header.profile")}
                    </Link>
                  </li>
                </>
              )}

              {/* ПОВЗУНОК МОВИ UA / EN */}
              <li className="nav-item ms-lg-3 mt-3 mt-lg-0 d-flex justify-content-center">
                <div className="lang-switcher">
                  <button
                    type="button"
                    className={`lang-btn ${currentLang === "ua" ? "active" : ""}`}
                    onClick={() => toggleLanguage("ua")}
                  >
                    UA
                  </button>
                  <button
                    type="button"
                    className={`lang-btn ${currentLang === "en" ? "active" : ""}`}
                    onClick={() => toggleLanguage("en")}
                  >
                    EN
                  </button>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
