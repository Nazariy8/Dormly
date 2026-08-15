import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { HashLink } from "react-router-hash-link";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";

const Header = ({ user }) => {
  const navigate = useNavigate();
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
    window.dispatchEvent(new Event("themeChanged"));
  };

  return (
    <header className="py-2">
      {/* Додали p-2 для внутрішніх відступів */}
      <nav
        className={`navbar navbar-expand-lg rounded-4 p-2`}
        style={{ boxShadow:`${theme === 'light' ? '' : 'rgb(138, 79, 255) 0px 15px 40px -24px'}`}}
      >
        <div className="container-fluid">
          {/* ЛОГОТИП */}
          <h1 className="title m-0">
            <Link className="text-decoration-none" to="/">
              Dormly
            </Link>
          </h1>

          {/* МОБІЛЬНИЙ БЛОК (d-lg-none означає: сховати на великих екранах) */}
          <div className="d-flex align-items-center d-lg-none">
            <button
              onClick={toggleTheme}
              className="theme-btn border-0 fs-5 p-2 me-2 rounded-circle"
              title="Змінити тему"
            >
              {theme === "light" ? (
                <i className="bi bi-moon-stars"></i>
              ) : (
                <i className="bi bi-sun"></i>
              )}
            </button>
            <button
              className="navbar-toggler border-0 focus-ring focus-ring-light"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#navbarSupportedContent"
              aria-controls="navbarSupportedContent"
              aria-expanded="false"
              aria-label="Toggle navigation"
            >
              <span className="navbar-toggler-icon"></span>
            </button>
          </div>

          {/* МЕНЮ (згортається на телефоні) */}
          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            {/* ms-auto притискає всі лінки вправо */}
            <ul className="navbar-nav ms-auto text-center align-items-center mb-2 mb-lg-0 gap-2">
              <li className="nav-item">
                <Link className="nav-link link px-3" to="/aboutUs" smooth>
                  Питання
                </Link>
              </li>
              <li className="nav-item">
                <HashLink
                  className="nav-link link px-3"
                  to="/#advantage-heading"
                  smooth
                >
                  Переваги
                </HashLink>
              </li>
              <li className="nav-item">
                <HashLink
                  className="nav-link link px-3"
                  to="/#feedbacks-heading"
                  smooth
                >
                  Відгуки
                </HashLink>
              </li>

              {user ? (
                <>
                  <li className="nav-item">
                    <Link to="/chat" className="nav-link link px-3">
                      Чат
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link to="/search-roommate" className="nav-link link px-3">
                      Співжителі
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link
                      className="nav-link link px-4 rounded-pill fw-bold text-white bg-primary"
                      to="/profile"
                    >
                      Профіль
                    </Link>
                  </li>
                </>
              ) : (
                <>
                  <li className="nav-item">
                    <Link className="nav-link login link px-3" to="/login">
                      Ввійти
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link
                      className="nav-link signup link px-4 rounded-pill"
                      to="/regist"
                    >
                      Зареєструватись
                    </Link>
                  </li>
                </>
              )}
            </ul>

            {/* КОМП'ЮТЕРНИЙ БЛОК: Кнопка теми (d-none d-lg-block означає: показати ТІЛЬКИ на комп'ютерах) */}
            <button
              onClick={toggleTheme}
              className="theme-btn border-0 fs-5 p-2 ms-lg-3 rounded-circle d-none d-lg-block"
              title="Змінити тему"
            >
              {theme === "light" ? (
                <i className="bi bi-moon-stars"></i>
              ) : (
                <i className="bi bi-sun"></i>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Модалка залишилась на своєму місці */}
      <div
        className="modal fade"
        id="loginModal"
        tabIndex="-1"
        aria-hidden="true"
      ></div>
    </header>
  );
};

export default Header;
