import React, { useState } from "react";
import { auth } from "../firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import "../css/resetPass.scss"
import Header from "../components/Header"
const ResetPass = () => {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleReset = async (e) => {
    e.preventDefault();
    if (!email) {
      alert("Будь ласка, введіть Email!");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      alert("Лист для відновлення надіслано на " + email + ". Перевірте пошту!");
      navigate("/login"); // Повертаємо користувача на вхід
    } catch (error) {
      console.error("Помилка:", error.code);
      alert("Не вдалося надіслати лист. Перевірте правильність Email.");
    }
  };

  return (
    <>
    <Header />
    <div className="container d-flex justify-content-center align-items-center">
      <div className="resetPass-card rounded-4 p-4" style={{background: "var(--bg-main)"}}>
        <h2>Відновлення пароля</h2>
        <p>Введіть Email, на який ми надішлемо посилання для скидання пароля.</p>
        <form onSubmit={handleReset}>
          <input
            type="email"
            placeholder="Ваш Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="form-control mb-3"
            required
          />
          <button type="submit" className="send-btn text-white w-100 py-2 rounded-2">
            Надіслати лист
          </button>
        </form>
        <button className="btn btn-primary text-white mt-3" onClick={() => navigate("/login")}>
          Назад до входу
        </button>
      </div>
    </div>
  </>
  );
};

export default ResetPass;