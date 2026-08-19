import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import nazar from "../img/team/nazar.webp";
import olena from "../img/team/olena.webp";
import julia from "../img/team/julia.webp";
import zlata from "../img/team/zlata.webp";
import maks from "../img/team/maks.webp";
import "../css/about.scss";

const teamMembers = [
  { id: "nazar", img: nazar },
  { id: "olena", img: olena },
  { id: "julia", img: julia },
  { id: "zlata", img: zlata },
  { id: "maks", img: maks },
];

const AboutUs = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="about-page py-5">
      <div className="container">
        <div className="text-center mb-5">
          <span className="section-badge mb-3">{t("about.badge")}</span>
          <h1 className="section-heading">{t("about.title")}</h1>
          <p className="section-description">{t("about.subtitle")}</p>
        </div>

        {/* Сітка карток команди */}
        <div className="row g-4 justify-content-center mb-5">
          {teamMembers.map((member, index) => (
            <div key={index} className="col-12 col-sm-6 col-lg-4 col-xl-3">
              <div className="team-card text-center h-100">
                <div className="team-avatar-wrapper mb-3">
                  <img
                    src={member.img}
                    alt={t(`about.team.${member.id}.name`)}
                    className="team-img"
                  />
                </div>
                <h4 className="team-name">
                  {t(`about.team.${member.id}.name`)}
                </h4>
                <p className="team-role">{t(`about.team.${member.id}.role`)}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Заклик до дії */}
        <div className="cta-box text-center p-5 mt-4">
          <h3 className="text-white fw-bold mb-3">{t("about.cta.title")}</h3>
          <button
            className="btn btn-hero-primary px-4 py-2"
            onClick={() => navigate("/test")}
          >
            {t("about.cta.button")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
