import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import googleicon from "../img/icons/google.png";
import { auth, db, googleProvider } from "../firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  signOut,
  sendPasswordResetEmail,
  signInWithPopup,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

function Auth({ goal }) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const handleGoogleSignIn = async (e) => {
    e.preventDefault();
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (!userDocSnap.exists()) {
        const nameParts = (user.displayName || "Студент").split(" ");
        await setDoc(userDocRef, {
          uid: user.uid,
          email: user.email,
          firstName: nameParts[0] || "Студент",
          lastName: nameParts.slice(1).join(" ") || "",
          photoURL: user.photoURL || "",
          status: "Шукаю кімнату",
          createdAt: new Date(),
        });
      }

      navigate("/profile");
    } catch (error) {
      // Ігноруємо закриття попапу або конфлікт паралельних запитів
      if (
        error.code === "auth/popup-closed-by-user" ||
        error.code === "auth/cancelled-popup-request"
      ) {
        return;
      }
      console.error("Google Auth Error:", error);
      alert("Помилка авторизації: " + error.message);
    }
  };

  const validateInputs = () => {
    setEmailError("");
    setPasswordError("");
    let isValid = true;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError("Email не може бути порожнім");
      isValid = false;
    } else if (!emailRegex.test(email)) {
      setEmailError("Введіть коректний формат email");
      isValid = false;
    }

    if (!password) {
      setPasswordError("Пароль не може бути порожнім");
      isValid = false;
    } else if (password.length < 8 || password.length > 20) {
      setPasswordError("Пароль має бути від 8 до 20 символів");
      isValid = false;
    }

    if (goal === "reg") {
      if (!confirmPassword) {
        setPasswordError("Будь ласка, підтвердіть пароль");
        isValid = false;
      } else if (password !== confirmPassword) {
        setPasswordError("Паролі не співпадають");
        isValid = false;
      }
    }

    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateInputs()) return;

    try {
      if (goal === "reg") {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password,
        );
        await sendEmailVerification(userCredential.user);
        await signOut(auth);
        alert("Акаунт створено! Перевірте пошту для підтвердження.");
        navigate("/login");
      } else {
        const userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password,
        );
        const user = userCredential.user;

        if (!user.emailVerified) {
          await signOut(auth);
          alert("Будь ласка, підтвердіть пошту перед входом!");
          return;
        }

        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (!userDocSnap.exists()) {
          await setDoc(userDocRef, {
            uid: user.uid,
            email: user.email,
            firstName: "Студент",
            lastName: "",
            status: "Не шукаю",
            photoURL: "",
            createdAt: new Date(),
          });
        }

        navigate("/search-roommate");
      }
    } catch (error) {
      if (error.code === "auth/email-already-in-use") {
        alert("Користувач з таким email вже існує");
      } else if (
        error.code === "auth/invalid-credential" ||
        error.code === "auth/wrong-password"
      ) {
        alert("Неправильний email або пароль");
      } else {
        alert("Сталася помилка. Спробуйте ще раз.");
      }
    }
  };

  return (
    <main className="auth-wrapper">
      <Link to="/" className="auth-back-btn d-flex align-items-center justify-content-center mb-4" title="На головну">
        <i className="bi bi-arrow-left"></i>
      </Link>

      <section className="auth-card" aria-labelledby="auth-heading">
        <header className="auth-header text-center">
          <h1 id="auth-heading" className="auth-title">
            {goal === "log" ? t("auth.welcome") : t("auth.createAccount")}
          </h1>
          <p className="auth-subtitle">
            {goal === "log" ? t("auth.subtitleLogin") : t("auth.subtitleReg")}
          </p>
        </header>

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className="auth-field mb-3">
            <label className="auth-label" htmlFor="emailInput">
              {t("auth.emailLabel")}
            </label>
            <input
              type="email"
              id="emailInput"
              name="email"
              autoComplete="email"
              className="auth-input"
              placeholder="student@lpnu.ua"
              required
              maxLength="64"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {emailError && <p className="auth-error">{emailError}</p>}
          </div>

          <div className="auth-field mb-2">
            <div className="d-flex justify-content-between align-items-center mb-1">
              <label className="auth-label m-0" htmlFor="passwordInput">
                {t("auth.passwordLabel")}
              </label>
              {goal === "log" && (
                <Link to="/resetPass" className="auth-link">
                  {t("auth.forgotPassword")}
                </Link>
              )}
            </div>
            <div className="auth-input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                id="passwordInput"
                name="password"
                autoComplete={
                  goal === "log" ? "current-password" : "new-password"
                }
                className="auth-input pe-5"
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="auth-eye-btn"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Сховати пароль" : "Показати пароль"}
              >
                <i
                  className={`bi ${showPassword ? "bi-eye" : "bi-eye-slash"}`}
                ></i>
              </button>
            </div>
            <span className="auth-hint">{t("auth.passwordHint")}</span>
          </div>

          {goal === "reg" && (
            <div className="auth-field mb-3 mt-3">
              <label className="auth-label" htmlFor="confirmPasswordInput">
                {t("auth.confirmPasswordLabel")}
              </label>
              <div className="auth-input-wrapper">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPasswordInput"
                  name="confirmPassword"
                  autoComplete="new-password"
                  className="auth-input pe-5"
                  placeholder="••••••••"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="auth-eye-btn"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={
                    showConfirmPassword
                      ? "Сховати підтвердження"
                      : "Показати підтвердження"
                  }
                >
                  <i
                    className={`bi ${showConfirmPassword ? "bi-eye" : "bi-eye-slash"}`}
                  ></i>
                </button>
              </div>
            </div>
          )}

          {passwordError && <p className="auth-error mb-2">{passwordError}</p>}

          <button type="submit" className="btn-auth-submit w-100 mt-2">
            {goal === "log" ? t("auth.loginBtn") : t("auth.registerBtn")}
          </button>

          <div className="auth-divider my-4">
            <span>{t("auth.or")}</span>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="btn-google-auth w-100"
          >
            <img src={googleicon} alt="Google" className="google-icon" />
            {t("auth.googleBtn")}
          </button>
        </form>

        <footer className="auth-footer text-center mt-4">
          <p className="auth-footer-text m-0">
            {goal === "log" ? (
              <>
                {t("auth.noAccount")}{" "}
                <Link to="/regist" className="auth-link-bold">
                  {t("auth.toRegister")}
                </Link>
              </>
            ) : (
              <>
                {t("auth.haveAccount")}{" "}
                <Link to="/login" className="auth-link-bold">
                  {t("auth.toLogin")}
                </Link>
              </>
            )}
          </p>
        </footer>
      </section>
    </main>
  );
}

export default Auth;
