import React from "react";

const Questions = () => {
  return (
      <div className="col-9">
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
                Dormly — це платформа, створена, щоб допомогти студентам знайти
                ідеального сусіда по кімнаті в гуртожитку на основі тесту на
                сумісність особистості та способу життя, забезпечуючи кращий
                досвід спільного проживання.
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
                Ми можемо запропонувати додаткові преміум-функції в майбутньому.
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
                заповніть необхідні поля, і ви готові розпочати пошук ідеального
                сусіда!
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
                Звісно! Ви можете будь-коли оновити свою інформацію, фотографії
                та відповіді на тест у налаштуваннях свого профілю, щоб вони
                завжди були актуальними.
              </div>
            </div>
          </div>
        </div>
      </div>
  );
};

export default Questions;
