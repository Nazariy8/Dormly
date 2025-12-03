import React, { useEffect } from "react";
import Header from "../components/Header";
import Questions from "../components/Questions";
import "../css/about.scss";

const AboutUs = () => {
  return (
    <div>
      <Header />
      <h1 className="text-center mt-3 fw-bolder help-header-text mx-auto">
        Чим ми можемо вам допомогти?
      </h1>
      <div className="askquest mx-auto">
        <p className="text-center text-secondary fw-bold mt-3 askquest-text">
          Знаходьте відповіді на свої запитання нижче або скористайтеся пошуком.
        </p>
      </div>
      <div className="d-flex justify-content-center">
        <input
          type="text"
          name=""
          className="ps-5 px-3 py-3 rounded-5 border border-0 search-quest"
          placeholder="Як знайти відповідь на своє запитання"
          id=""
        />
      </div>
      <div className="row mx-5 mt-5">
        <div className="col-3 border">
          <div className="list-of-btns w-100">
            <div
              className="btn-group-vertical w-100"
              role="group"
              aria-label="Vertical radio toggle button group"
            >
              <input
                type="radio"
                className="btn-check"
                name="vbtn-radio"
                id="vbtn-radio1"
                autoComplete="off"
                defaultChecked
              />
              <label
                className="btn btn-light mb-3 text-start rounded-5 align-items-center"
                htmlFor="vbtn-radio1"
              >
                <i class="bi bi-question-circle fs-5 me-2"></i> Часті запитання
              </label>

              <input
                type="radio"
                className="btn-check"
                name="vbtn-radio"
                id="vbtn-radio2"
                autoComplete="off"
              />
              <label
                className="btn btn-light mb-3 text-start rounded-5 align-items-center"
                htmlFor="vbtn-radio2"
              >
                <i class="bi bi-person fs-5 me-2"></i> Реєстрація та профіль
              </label>

              <input
                type="radio"
                className="btn-check"
                name="vbtn-radio"
                id="vbtn-radio3"
                autoComplete="off"
              />
              <label
                className="btn btn-light mb-3 text-start rounded-5 align-items-center"
                htmlFor="vbtn-radio3"
              >
                <i class="bi bi-person-check-fill fs-5 me-2"></i> Тест на
                сумісність
              </label>

              <input
                type="radio"
                className="btn-check"
                name="vbtn-radio"
                id="vbtn-radio4"
                autoComplete="off"
              />
              <label
                className="btn btn-light mb-3 text-start rounded-5 align-items-center"
                htmlFor="vbtn-radio4"
              >
                <i class="bi bi-shield-check fs-5 me-2"></i> Безпека та
                конфінденційність
              </label>

              <input
                type="radio"
                className="btn-check"
                name="vbtn-radio"
                id="vbtn-radio5"
                autoComplete="off"
              />
              <label
                className="btn btn-light mb-3 text-start rounded-5 align-items-center"
                htmlFor="vbtn-radio5"
              >
                <i class="bi bi-wrench fs-5 me-2"></i> Технічні питання
              </label>
            </div>
          </div>

          <div className="not-found-quest bg-white d-flex flex-column text-center rounded-5 mb-5 p-4">
              <i class="bi bi-patch-question fs-4"></i>
              <h5>Не знайшли відповідь?</h5>
              <p>Наша команда підтримки завжди готова допомогти.</p>
              <button className="text-center rounded-5 py-2 text-white connect-to-us">
                Зв'язатися з нами
              </button>
          </div>
        </div>
        <Questions />
      </div>
    </div>
  );
};

export default AboutUs;
