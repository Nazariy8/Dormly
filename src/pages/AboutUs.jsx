import React from "react";
import { useNavigate } from "react-router-dom";
import nazar from "../img/team/nazar.webp";
import olena from "../img/team/olena.webp";
import julia from "../img/team/julia.webp";
import zlata from "../img/team/zlata.webp";
import maks from "../img/team/maks.webp";
import { useTranslation } from "react-i18next";
import "../css/about.scss"
const teamMembers = [
  { name: "Яворський Назарій", role: "Головний розробник", img: nazar },
  { name: "Козак Олена", role: "Керівник проєкту", img: olena },
  { name: "Матвіїшин Юля", role: "Бізнес-аналітик", img: julia },
  { name: "Нисинець Златослава", role: "UX/UI дизайнер", img: zlata },
  { name: "Плечій Максим", role: "QA інженер", img: maks },
];

const AboutUs = () => {
  const navigate = useNavigate();

  const { t } = useTranslation();

  return (
    <div className="about-page py-5">
      <div className="container">
        <div className="text-center mb-5">
          <span className="section-badge mb-3">Команда</span>
          <h1 className="section-heading">Про нас</h1>
          <p className="section-description">
            Ми команда студентів та розробників, які прагнуть зробити проживання
            в гуртожитку комфортним та безпечним для кожного.
          </p>
        </div>

        {/* Сітка карток команди */}
        <div className="row g-4 justify-content-center mb-5">
          {teamMembers.map((member, index) => (
            <div key={index} className="col-12 col-sm-6 col-lg-4 col-xl-3">
              <div className="team-card text-center h-100">
                <div className="team-avatar-wrapper mb-3">
                  <img
                    src={member.img}
                    alt={member.name}
                    className="team-img"
                  />
                </div>
                <h4 className="team-name">{member.name}</h4>
                <p className="team-role">{member.role}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Заклик до дії */}
        <div className="cta-box text-center p-5 mt-4">
          <h3 className="text-white fw-bold mb-3">
            Готові знайти свого ідеального сусіда?
          </h3>
          <button
            className="btn btn-hero-primary px-4 py-2"
            onClick={() => navigate("/test")}
          >
            Пройти тест зараз
          </button>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
