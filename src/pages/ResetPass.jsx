import React, { useState } from "react";
import { auth } from "../firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "../css/resetPass.scss";
import Header from "../components/Header";

const ResetPass = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleReset = async (e) => {
    e.preventDefault();
    if (!email) {
      alert(t("resetPass.alertEmpty"));
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      alert(t("resetPass.alertSuccess", { email }));
      navigate("/login");
    } catch (error) {
      console.error("Помилка:", error.code);
      alert(t("resetPass.alertError"));
    }
  };

  return (
    <>
      <main className="reset-pass-wrapper d-flex flex-column justify-content-center align-items-center">
        <button
          className="back-btn px-3 py-2 rounded-3 mb-3 d-flex gap-1"
          onClick={() => navigate("/")}
        >
          <i className="bi bi-house"></i>
          {t("test.backHome")}
        </button>
        <section className="reset-pass-card" aria-labelledby="reset-heading">
          <header className="text-center">
            <h1 id="reset-heading" className="reset-title">
              {t("resetPass.title")}
            </h1>
            <p className="reset-subtitle">{t("resetPass.subtitle")}</p>
          </header>

          <form onSubmit={handleReset} noValidate>
            <div className="form-group-custom">
              <label className="form-label-custom" htmlFor="resetEmail">
                {t("resetPass.emailLabel")}
              </label>
              <input
                id="resetEmail"
                type="email"
                placeholder={t("resetPass.placeholder")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="reset-input"
                required
                autoComplete="email"
              />
            </div>

            <button type="submit" className="btn-reset-submit">
              {t("resetPass.sendBtn")}
            </button>
          </form>

          <button
            type="button"
            className="btn-back-login mt-3"
            onClick={() => navigate("/login")}
          >
            <i className="bi bi-arrow-left"></i> {t("resetPass.backBtn")}
          </button>
        </section>
      </main>
    </>
  );
};

export default ResetPass;
