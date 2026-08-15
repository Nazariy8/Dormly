import React from "react";
import findimg from "../img/findmate.png";
import { Link } from "react-router-dom";
import { HashLink } from "react-router-hash-link";
import { useNavigate } from "react-router-dom";

const Intro = ({ user }) => {
  const navigate = useNavigate();

  const handleStartTest = () => {
    // Перевіряємо, чи є об'єкт user (чи здійснено вхід)
    if (user) {
      navigate("/test"); // Перекидаємо на сторінку тесту, якщо авторизований
    } else {
      // Якщо не авторизований - перекидаємо на сторінку входу
      navigate("/login");

      // АБО можна просто показати попередження:
      // alert("Будь ласка, увійдіть в акаунт, щоб пройти тест!");
    }
  };

  return (
    <div>
      <section className="intro-section">
        <div className="container-fluid">
          <div className="row mx-auto d-flex justify-content-center">
            <div className="col-12 col-md-12 col-lg-12 col-xl-6 col-xxl-5 d-flex justify-content-center">
              <div className="text">
                <h1 className="section-title"
                id="intro-title">
                  Знайди свого ідеального співжителя
                </h1>
                <p className="text-descr">
                  Dormly використовує особистісний тест, щоб підібрати вам
                  сумісних сусідів для кращого досвіду спільного проживання.
                  Попрощайтеся з проблемами і привітайте гармонійне життя в
                  гуртожитку.
                </p>

                <button
                  type="button"
                  className="button-test test-btn text-white border-0 text-nowrap"
                  onClick={handleStartTest}
                >
                  Почати тест
                </button>
              </div>
            </div>
            <div className="col-12 col-xxl-4 col-xl-5 col-lg-12 col-md-12 findmate-col rounded-5 d-flex justify-content-center">
              <img src={findimg} className="w-100 h-100 rounded-4" alt="" />
            </div>
          </div>
        </div>
        <div className="arrow-down">
          <HashLink to="/#advantage-heading" className="text-dark">
            <i className="bi bi-arrow-down fs-1"></i>
          </HashLink>
        </div>
      </section>
    </div>
  );
};

export default Intro;
