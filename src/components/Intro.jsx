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
      <section className="hero-section text-center">
        <div className="container d-flex flex-column align-items-center">
          {/* Акуратний бейдж Vercel */}
          <div className="hero-badge mb-4">
            <span className="badge-dot"></span>
            <span>Dormly 2.0 для студентів</span>
          </div>

          {/* Заголовок */}
          <h1 className="hero-title mb-3">
            Знайди свого ідеального сусіда по кімнаті
          </h1>

          {/* Підзаголовок */}
          <p className="hero-subtitle mb-4">
            Алгоритм підбору співмешканців за спільними інтересами, звичками та
            графіком навчання.
          </p>

          {/* Кнопки дій */}
          <div className="hero-actions d-flex gap-3 justify-content-center flex-wrap">
            <Link to="/test" className="btn btn-hero-primary">
              Пройти тест
            </Link>
            <a href="#advantage-heading" className="btn btn-hero-secondary">
              Як це працює
            </a>
          </div>

          {/* Інтерактивне прев'ю інтерфейсу Dormly (ТЕПЕР ВОНО ТУТ, ПІД КНОПКАМИ) */}
          <div className="hero-preview-card mt-5 text-start">
            <div className="preview-header d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center gap-2">
                <span className="dot dot-red"></span>
                <span className="dot dot-yellow"></span>
                <span className="dot dot-green"></span>
                <span className="preview-tag ms-2">
                  Метч знайдено • 98% сумісності
                </span>
              </div>
              <span className="badge-match">Ідеальний збіг</span>
            </div>

            <div className="preview-body d-flex flex-column flex-md-row align-items-center gap-4 mt-3">
              <div className="preview-avatar">ДН</div>
              <div className="flex-grow-1">
                <h4 className="m-0 text-white fw-bold">Денис, 19 років</h4>
                <p className="m-0 text-secondary small">
                  ІКНІ • 2 курс • Жайворонок
                </p>
                <div className="d-flex gap-2 mt-2 flex-wrap">
                  <span className="tag-pill">🎮 Ігри</span>
                  <span className="tag-pill">💻 Розробка</span>
                  <span className="tag-pill">🔇 Любить тишу ввечері</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Intro;
