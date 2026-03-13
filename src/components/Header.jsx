import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { HashLink } from "react-router-hash-link";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";

const Header = ({ user }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    alert("Було виконано вихід з аккаунту!");
    navigate("/");
  };

  return (
    <div>
      <header>
        <nav className="navbar navbar-expand-lg bg-body-tertiary rounded-4">
          <div className="container-fluid">
            <h1 className="title m-0">
              <Link className="" to="/">
                Dormly
              </Link>
            </h1>
            <button
              className="navbar-toggler"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#navbarSupportedContent"
              aria-controls="navbarSupportedContent"
              aria-expanded="false"
              aria-label="Toggle navigation"
            >
              <span className="navbar-toggler-icon"></span>
            </button>
            <div
              className="navbar-collapse collapse text-end"
              id="navbarSupportedContent"
            >
              <ul className="navbar-nav text-center mb-2 mb-lg-0">
                <li className="nav-item">
                  <Link
                    className="nav-link link px-3"
                    aria-current="page"
                    to="/aboutUs"
                  >
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
                      <Link
                        to="/chat"
                        className="nav-link btn btn-link link px-3 border-0"
                        style={{ textDecoration: "none" }}
                      >
                        Чат
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link
                        className="nav-link link px-3 fw-bold text-white bg-primary"
                        to="/profile"
                      >
                        Профіль
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link
                        to="/search-roommate"
                        className="nav-link btn btn-link link px-3 border-0"
                        style={{ textDecoration: "none" }}
                      >
                        Співжителі
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
                        className="nav-link signup link px-3 rounded-4"
                        to="/regist"
                      >
                        Зареєструватись
                      </Link>
                    </li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </nav>
        <div
          className="modal fade"
          id="loginModal"
          tabIndex="-1"
          aria-labelledby="exampleModalLabel"
          aria-hidden="true"
        ></div>
      </header>
    </div>
  );
};

export default Header;
