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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const navigate = useNavigate();

  function changeShowPassword() {
    setShowPassword(!showPassword);
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
      <section className="login-section px-3">
        <Link to="/" className="back-btn d-flex align-items-center">
          <i className="bi bi-arrow-left fs-5 me-2"></i>
          На головну
        </Link>

        <form onSubmit={handleSubmit}>
          <h3>Ласкаво просимо!</h3>
          <p>Знайди свого ідеального сусіда по кімнаті</p>
          <span>Email</span>
          <input
            type="email"
            className="mb-2"
            placeholder="Ваш email"
            required
            maxLength="64"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {emailError && <p className="error-message">{emailError}</p>}

          <span>Пароль</span>
          <div className="input-password w-100">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Пароль"
              className="mb-2 w-100"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <span
              className="text-dark showpass-btn-block"
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
              <span>Підтвердіть пароль</span>
              <div className="input-password w-100">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Підтвердіть пароль"
                  className="mb-2 w-100"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <span
                  className="text-dark showpass-btn-block"
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
            </>
          )}

          <button type="submit" className="w-100 log-reg-btn">
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
            className="googlelogin-btn p-2 w-100 d-flex justify-content-center align-items-center rounded-3 shadow-sm"
          >
            <img
              src={googleicon}
              className="googleicon me-2"
              alt="Google"
              style={{ width: "20px", height: "20px" }}
            />
            Продовжити з <span className="fw-bold ms-1">Google</span>
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
      </section>
    </div>
  );
}

export default UserInit;
