import React from "react";
import { Link } from "react-router-dom";
import { HashLink } from "react-router-hash-link";

const Header = ({ user }) => {
  return (
    <header className="custom-header sticky-top">
      <nav className="navbar navbar-expand-lg custom-navbar">
        <div className="container-xl d-flex align-items-center justify-content-between">
          {/* ЛОГОТИП */}
          <Link className="navbar-brand p-0 logo-link" to="/">
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
                <Link className="nav-link px-3" to="/aboutUs">
                  Питання
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
                      Переваги
                    </HashLink>
                  </li>
                  <li className="nav-item">
                    <HashLink
                      className="nav-link px-3"
                      to="/#feedbacks-heading"
                      smooth
                    >
                      Відгуки
                    </HashLink>
                  </li>

                  {/* Кнопки авторизації для гостей */}
                  <li className="nav-item ms-lg-2 mt-2 mt-lg-0">
                    <Link
                      className="btn-auth-outline d-inline-block text-center w-100"
                      to="/login"
                    >
                      Увійти
                    </Link>
                  </li>
                  <li className="nav-item ms-lg-1 mt-2 mt-lg-0">
                    <Link
                      className="btn-auth-solid d-inline-block text-center w-100"
                      to="/regist"
                    >
                      Зареєструватись
                    </Link>
                  </li>
                </>
              ) : (
                <>
                  <li className="nav-item">
                    <Link to="/chat" className="nav-link px-3">
                      Чат
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link to="/search-roommate" className="nav-link px-3">
                      Співжителі
                    </Link>
                  </li>
                  <li className="nav-item ms-lg-2 mt-2 mt-lg-0">
                    <Link
                      className="btn-auth-solid d-inline-block text-center px-4"
                      to="/profile"
                    >
                      Профіль
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
