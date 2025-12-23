import React from "react";
import Header from "../components/Header";
import "../css/about.scss";
import { Navigate, useNavigate } from "react-router-dom";
import nazar from "../img/team/nazar.webp"
import olena from "../img/team/olena.webp"
import julia from "../img/team/julia.webp"
import zlata from "../img/team/zlata.webp"
import maks from "../img/team/maks.webp"

const AboutUs = () => {
  const navigate = useNavigate();
  return (
    <div className="container-fluid">
      <Header />
      <h1 className="text-center mt-3 fw-bolder help-header-text mx-auto">
        Чим ми можемо вам допомогти?
      </h1>
      <div className="askquest mx-auto">
        <p className="text-center text-secondary fw-bold mt-3 askquest-text">
          Знаходьте відповіді на свої запитання нижче або скористайтеся пошуком.
        </p>
      </div>
      <div className=" align-items-center search-input-block text-center">
        <i class="bi bi-search"></i>
        <input
          type="text"
          name=""
          className="ps-5 px-3 py-3 rounded-5 search-quest"
          placeholder="Як знайти відповідь на своє запитання"
          id=""
        />
      </div>
      <div className="row mx-5 mt-5 justify-content-center">
        <div className="col-12 col-xxl-3 col-xl-3 col-lg-6 col-md-6 col-sm-12">
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
                <i className="bi bi-question-circle fs-5 me-2"></i> Часті
                запитання
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
                onClick={() => navigate("/regist")}
              >
                <i className="bi bi-person fs-5 me-2"></i> Реєстрація та профіль
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
                onClick={() => navigate("/test")}
              >
                <i className="bi bi-person-check-fill fs-5 me-2"></i> Тест на
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
                <i className="bi bi-shield-check fs-5 me-2"></i> Безпека та
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
                <i className="bi bi-wrench fs-5 me-2"></i> Технічні питання
              </label>
            </div>
          </div>

          <div className="not-found-quest bg-white d-flex flex-column text-center rounded-5 mb-5 p-4">
            <i className="bi bi-patch-question fs-4"></i>
            <h5>Не знайшли відповідь?</h5>
            <p>Наша команда підтримки завжди готова допомогти.</p>
            <button className="text-center rounded-5 py-2 text-white connect-to-us">
              Зв'язатися з нами
            </button>
          </div>
        </div>

        <div className="col-12 col-xxl-7 col-xl-9 col-lg-6 col-md-6 col-sm-12 ">
          <div className="accordion" id="accordionPanelsStayOpenExample">
            <div className="accordion-item mb-4 rounded-5">
              <h2 className="accordion-header">
                <button
                  className="accordion-button rounded-5"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target="#panelsStayOpen-collapseOne"
                  aria-expanded="true"
                  aria-controls="panelsStayOpen-collapseOne"
                >
                  Що таке Dormly?
                </button>
              </h2>
              <div
                id="panelsStayOpen-collapseOne"
                className="accordion-collapse collapse show"
              >
                <div className="accordion-body">
                  Dormly — це платформа, створена, щоб допомогти студентам
                  знайти ідеального сусіда по кімнаті в гуртожитку на основі
                  тесту на сумісність особистості та способу життя, забезпечуючи
                  кращий досвід спільного проживання.
                </div>
              </div>
            </div>
            <div className="accordion-item mb-4 rounded-5">
              <h2 className="accordion-header">
                <button
                  className="accordion-button collapsed rounded-5"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target="#panelsStayOpen-collapseTwo"
                  aria-expanded="false"
                  aria-controls="panelsStayOpen-collapseTwo"
                >
                  Як працює тест на сумісність?
                </button>
              </h2>
              <div
                id="panelsStayOpen-collapseTwo"
                className="accordion-collapse collapse"
              >
                <div className="accordion-body">
                  Наш тест аналізує ваші відповіді на питання про звички, стиль
                  життя, соціальну активність та особисті вподобання, щоб знайти
                  користувачів з найвищим відсотком сумісності.
                </div>
              </div>
            </div>
            <div className="accordion-item mb-4 rounded-5">
              <h2 className="accordion-header">
                <button
                  className="accordion-button collapsed rounded-5"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target="#panelsStayOpen-collapseThree"
                  aria-expanded="false"
                  aria-controls="panelsStayOpen-collapseThree"
                >
                  Чи є Dormly безкоштовним?
                </button>
              </h2>
              <div
                id="panelsStayOpen-collapseThree"
                className="accordion-collapse collapse"
              >
                <div className="accordion-body">
                  Так, базові функції Dormly, включаючи створення профілю,
                  проходження тесту та пошук сусідів, є абсолютно безкоштовними.
                  Ми можемо запропонувати додаткові преміум-функції в
                  майбутньому.
                </div>
              </div>
            </div>
            <div className="accordion-item mb-4 rounded-5">
              <h2 className="accordion-header">
                <button
                  className="accordion-button collapsed rounded-5"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target="#panelsStayOpen-collapseFour"
                  aria-expanded="false"
                  aria-controls="panelsStayOpen-collapseFour"
                >
                  Як створити обліковий запис?
                </button>
              </h2>
              <div
                id="panelsStayOpen-collapseFour"
                className="accordion-collapse collapse"
              >
                <div className="accordion-body">
                  Просто натисніть кнопку "Реєстрація" у верхньому правому куті,
                  заповніть необхідні поля, і ви готові розпочати пошук
                  ідеального сусіда!
                </div>
              </div>
            </div>
            <div className="accordion-item mb-4 rounded-5">
              <h2 className="accordion-header">
                <button
                  className="accordion-button collapsed rounded-5"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target="#panelsStayOpen-collapseFive"
                  aria-expanded="false"
                  aria-controls="panelsStayOpen-collapseFive"
                >
                  Чи можу я змінити інформацію профілю пізніше?
                </button>
              </h2>
              <div
                id="panelsStayOpen-collapseFive"
                className="accordion-collapse collapse"
              >
                <div className="accordion-body">
                  Звісно! Ви можете будь-коли оновити свою інформацію,
                  фотографії та відповіді на тест у налаштуваннях свого профілю,
                  щоб вони завжди були актуальними.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="about-us text-center ">
        <h1 className="bg-white p-3 rounded-5 title mx-auto mb-5">Про нас</h1>
        <h4 className="fw-bold">Наша команда</h4>
        <h6 className="text-secondary mb-5">Ми команда інтузіастів, студентів та розробників, які прагнули зробити ваше життя в гуртожитку кращим.</h6>
        <div className="row justify-content-center d-flex">

          <div className="d-flex col-xxl-3 col-xl-3 col-lg-4 col-sm-12 col-12 col-md-6  mb-3 justify-content-center text-center">
            <div className="teammate-card">
              <img className="" src={julia} alt="" />
              <h4>Матвіїшин Юля</h4>
              <h6>Бізнес-аналітик</h6>
            </div>
          </div>
          <div className="d-flex col-xxl-3 col-xl-3 col-lg-4 col-sm-12 col-12 col-md-6  mb-3 justify-content-center text-center">
            {" "}
            <div className="teammate-card">
              <img className="" src={olena} alt="" />
              <h4>Козак Олена</h4>
              <h6>Керівник проекту</h6>
            </div>
          </div>
          <div className="d-flex col-xxl-3 col-xl-3 col-lg-4 col-sm-12 col-12 col-md-6  mb-3 justify-content-center text-center">
            {" "}
            <div className="teammate-card">
              <img className="" src={zlata} alt="" />
              <h4>Нисинець Златослава</h4>
              <h6>UX/UI дизайнер</h6>
            </div>
          </div>
        </div>
        <div className="row justify-content-center mb-5">
          <div className="d-flex col-xxl-3 col-xl-3 col-lg-4 col-sm-12 col-12 col-md-6  mb-3 justify-content-center text-center">
            <div className="teammate-card">
              <img className="" src={nazar} alt="" />
              <h4>Яворський Назарій</h4>
              <h6>Головний розробник</h6>
            </div>
          </div>
          <div className="d-flex col-xxl-3 col-xl-3 col-lg-4 col-sm-12 col-12 col-md-6  mb-3 justify-content-center text-center">
            {" "}
            <div className="teammate-card">
              <img className="" src={maks} alt="" />
              <h4>Плечій Максим</h4>
              <h6>Тестувальник</h6>
            </div>
          </div>
        </div>
      <button className="ready-to-find" onClick={()=> {
        navigate("/test")
      }}>
        Готові знайти свого ідеального сусіда?
      </button>
      </div>

    </div>
  );
};

export default AboutUs;
