import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
function UserInit(props) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  
  const navigate = useNavigate();

  function changeShowPassword() {
    setShowPassword(!showPassword);
  }

  function changeShowConfirmPassword() {
    setShowConfirmPassword(!showConfirmPassword);
  }

  // Прямий виклик через Popup
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

      navigate("/search-roommate");
    } catch (error) {
      console.error("Помилка Google Auth:", error);
      alert("Помилка авторизації через Google: " + error.message);
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
      setEmailError("Введіть коректний формат email (напр. example@mail.com)");
      isValid = false;
    }

    if (!password) {
      setPasswordError("Пароль не може бути порожнім");
      isValid = false;
    } else if (password.length < 8 || password.length > 20) {
      setPasswordError("Пароль має бути від 8 до 20 символів");
      isValid = false;
    }

    if (props.goal === "reg") {
      if (!confirmPassword) {
        setPasswordError("Будь ласка, підтвердіть пароль");
        isValid = false;
      } else if (password !== confirmPassword) {
        setPasswordError(
          <div className="text-danger">Паролі не співпадають</div>,
        );
        isValid = false;
      }
    }

    return isValid;
  };

  const handleResetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      alert("Лист для відновлення пароля надіслано! Перевірте пошту.");
    } catch (error) {
      console.error("Помилка:", error.code);
      alert("Не вдалося надіслати лист. Перевірте правильність Email.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isValid = validateInputs();

    if (isValid) {
      try {
        if (props.goal === "reg") {
          const userCredential = await createUserWithEmailAndPassword(
            auth,
            email,
            password,
          );
          const user = userCredential.user;

          await sendEmailVerification(user);
          await signOut(auth);

          alert(
            "Акаунт створено! Будь ласка, перевірте вашу пошту та перейдіть за посиланням для підтвердження.",
          );
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
            alert(
              "Будь ласка, підтвердіть вашу електронну пошту перед входом!",
            );
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
        console.error("Помилка Firebase:", error.code);
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
    }
  };

  return (
    <div>
      <section className="login-section px-1">
        <div>
          <Link
            to="/"
            className=" m-4 btn back-btn rounded-circle d-flex align-items-center justify-content-center"
            style={{
              width: "42px",
              height: "42px",
            }}
            title="На головну"
          >
            <i className="bi bi-arrow-left fs-5"></i>
          </Link>

          <form onSubmit={handleSubmit} className="init-form">
            <h3>Ласкаво просимо!</h3>
            <p className="mb-4">Знайди свого ідеального сусіда по кімнаті</p>
            {/* <span className="text-secondary">Email</span> */}
            <div className="floating-group mb-3">
              <input
                type="email"
                className="floating-input"
                id="emailInput"
                placeholder=""
                required
                maxLength="64"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <label className="floating-label" htmlFor="emailInput">
                Електронна адреса
              </label>
            </div>

            {emailError && <p className="error-message">{emailError}</p>}

            {/* <span className="text-secondary">Пароль</span> */}
            <div className="floating-group mb-2 w-100">
              <input
                type={showPassword ? "text" : "password"}
                placeholder=""
                className="w-100 floating-input"
                id="passwordInput"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <label className="floating-label" htmlFor="passwordInput">
                Пароль
              </label>
              <span
                className="showpass-btn-block"
                style={{ cursor: "pointer" }}
                onClick={changeShowPassword}
              >
                <i
                  className={`bi ${
                    showPassword ? "bi-eye" : "bi-eye-slash"
                  } fs-4 position-absolute`}
                  id="showpass-btn"
                ></i>
              </span>
            </div>

            <div className="row after-password-spans d-flex justify-content-between align-items-center">
              <span className="col-6 mb-4 range text-secondary">
                Має бути 8-20 символів
              </span>
              <span className="col-6 mb-4 range text-secondary text-end">
                <Link to="/resetPass" className="resetPass ms-2">
                  Забули пароль?
                </Link>
              </span>
            </div>

            {props.goal === "reg" && (
              <>
                <div className="floating-group w-100 mb-4">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder=""
                    className="w-100 floating-input"
                    id="confirmPasswordInput"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <label
                    className="floating-label"
                    htmlFor="confirmPasswordInput"
                  >
                    Підтвердіть пароль
                  </label>
                  <span
                    className="showpass-btn-block"
                    style={{ cursor: "pointer" }}
                    onClick={changeShowConfirmPassword}
                  >
                    <i
                      className={`bi ${
                        showConfirmPassword ? "bi-eye" : "bi-eye-slash"
                      } fs-4 position-absolute`}
                      id="showpass-btn"
                    ></i>
                  </span>
                </div>
              </>
            )}

            <button type="submit" className="w-100 init-btn">
              {props.goal === "log" ? "Увійти" : "Зареєструватися"}
            </button>

            <hr />
            <div className="or-span">
              <span className="fw-normal text-center">або</span>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              style={{
                color: "var(--text-main)",
                backgroundColor: "var(--bg-input)",
                border: "1px solid var(--border-color)",
                cursor: "pointer",
              }}
              className="google-init-btn p-2 w-100 d-flex justify-content-center align-items-center rounded-3 shadow-sm fw-medium"
            >
              <img
                src={googleicon}
                className="googleicon me-2"
                alt="Google"
                style={{ width: "20px", height: "20px" }}
              />
              Продовжити з Google
            </button>

            <p className="question mt-3">
              {props.goal === "log" ? (
                <>
                  Ще не маєте акаунту?
                  <Link to="/regist" className="regist-link ms-2">
                    Реєстрація
                  </Link>
                </>
              ) : (
                <>
                  Вже маєте акаунт?
                  <Link to="/login" className="regist-link ms-2">
                    Увійти
                  </Link>
                </>
              )}
            </p>
          </form>
        </div>
      </section>
    </div>
  );
}

export default UserInit;
