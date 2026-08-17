import React, { useState } from "react";
import user1 from "../img/main-feedback-users/user1.png"
import user2 from "../img/main-feedback-users/user2.png"
import user3 from "../img/main-feedback-users/user3.png"

const Feedbacks = () => {

	
	return (
    <div>
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
            <span className="section-badge mb-3">Відгуки</span>
            <h2 className="section-heading">Що кажуть наші користувачі</h2>
            <p className="section-description">
              Історії студентів, які знайшли ідеальних сусідів завдяки Dormly.
            </p>
          </div>

          {/* Сітка відгуків */}
          <div className="row g-4 justify-content-center">
            {/* Відгук 1 */}
            <div className="col-12 col-md-6 col-lg-4">
              <div className="feedback-card h-100">
                <p className="feedback-quote">
                  «Dormly допоміг мені знайти не просто сусідку, а справжню
                  подругу! Ми чудово ладнаємо, а спільне проживання стало
                  суцільним задоволенням.»
                </p>
                <div className="feedback-user-info">
                  <div className="feedback-avatar-placeholder">ОК</div>
                  <div>
                    <h4 className="user-name">Олена К.</h4>
                    <span className="user-role">Студентка, 1-й курс</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Відгук 2 */}
            <div className="col-12 col-md-6 col-lg-4">
              <div className="feedback-card h-100">
                <p className="feedback-quote">
                  «Був скептично налаштований, але алгоритм дійсно спрацював.
                  Мій співмешканець — спокійна й охайна людина, саме те, що я
                  шукав для комфортного навчання.»
                </p>
                <div className="feedback-user-info">
                  <div className="feedback-avatar-placeholder">МП</div>
                  <div>
                    <h4 className="user-name">Максим П.</h4>
                    <span className="user-role">Студент, 2-й курс</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Відгук 3 */}
            <div className="col-12 col-md-6 col-lg-4">
              <div className="feedback-card h-100">
                <p className="feedback-quote">
                  «Завдяки платформі уникнула побутових конфліктів, які часто
                  бувають на початку року. Дуже рекомендую всім першокурсникам
                  перед заселенням!»
                </p>
                <div className="feedback-user-info">
                  <div className="feedback-avatar-placeholder">ІЛ</div>
                  <div>
                    <h4 className="user-name">Ірина Л.</h4>
                    <span className="user-role">Студентка, 3-й курс</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Feedbacks;
