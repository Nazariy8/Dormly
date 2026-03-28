import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import googleicon from "../img/icons/google.png";
import { auth, db } from '../firebase'; 
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification, signOut, sendPasswordResetEmail } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { signInWithPopup } from "firebase/auth";
import { googleProvider } from "../firebase";

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


  const [emailInput, setEmailInput] = useState('');
  const [status, setStatus] = useState('idle'); // idle, valid, invalid

  const handleGoogleSignIn = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    // Перевіряємо, чи є користувач у базі, якщо немає — створюємо профіль
    const userDocRef = doc(db, "users", user.uid);
    const userDocSnap = await getDoc(userDocRef);

    if (!userDocSnap.exists()) {
      await setDoc(userDocRef, {
        uid: user.uid,
        email: user.email,
        name: user.displayName || "Студент",
        photoURL: user.photoURL || "",
        status: "Шукаю кімнату",
        createdAt: new Date()
      });
    }

    navigate("/profile");
  } catch (error) {
    console.error("Помилка входу через Google:", error);
    alert("Не вдалося увійти через Google. Спробуйте ще раз.");
  }
};



  const validateEmail = (input) => {
    setEmailInput(input);
    
    if (!input) {
      setStatus('idle');
      return;
    }

    // Regex to match strictly @gmail.com or @lpnu.ua at the end
    const pattern = /^[a-zA-Z0-9._%+-]+@(gmail\.com|lpnu\.ua)$/i;

    if (pattern.test(input)) {
      setStatus('valid');
    } else {
      setStatus('invalid');
    }
  };

  // --- 3. Потужна функція валідації ---
  const validateInputs = () => {
    // Скидаємо старі помилки
    setEmailError("");
    setPasswordError("");
    let isValid = true;

    // A. Валідація Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Стандартний RegEx для email
    if (!email) {
      setEmailError("Email не може бути порожнім");
      isValid = false;
    } else if (!emailRegex.test(email)) {
      setEmailError("Введіть коректний формат email (напр. example@mail.com)");
      isValid = false;
    }

    // Б. Валідація Пароля
    if (!password) {
      setPasswordError("Пароль не може бути порожнім");
      isValid = false;
    } else if (password.length < 8 || password.length > 20) {
      setPasswordError("Пароль має бути від 8 до 20 символів");
      isValid = false;
    }

    // В. Валідація для Реєстрації (перевірка співпадіння паролів)
    if (props.goal === "reg") {
      if (!confirmPassword) {
        setPasswordError("Будь ласка, підтвердіть пароль");
        isValid = false;
      } else if (password !== confirmPassword) {
        setPasswordError(<div className="text-danger">Паролі не співпадають</div>);
        isValid = false;
      }
    }

    return isValid;
  };

  const handleResetPassword = async (email) => {
  try {
    // Firebase сам згенерує унікальне посилання і відправить його
    await sendPasswordResetEmail(auth, email);
    alert("Лист для відновлення пароля надіслано! Перевірте пошту.");
  } catch (error) {
    console.error("Помилка:", error.code);
    alert("Не вдалося надіслати лист. Перевірте правильність Email.");
  }
};

  // --- 4. Функція, що викликається при відправці форми ---
 const handleSubmit = async (e) => {
  e.preventDefault();
  const isValid = validateInputs();

  if (isValid) {
    try {
      if (props.goal === "reg") {
        // === РЕЄСТРАЦІЯ ===
        // 1. Створюємо технічний акаунт у Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // 2. Відправляємо лист підтвердження
        await sendEmailVerification(user);

        // 3. Одразу "викидаємо" користувача (розлогінюємо), щоб він не пройшов далі без підтвердження
        await signOut(auth);

        // 4. Показуємо повідомлення користувачу
        alert("Акаунт створено! Будь ласка, перевірте вашу пошту та перейдіть за посиланням для підтвердження.");
        
        // Перекидаємо на сторінку логіну
        navigate("/login");

      } else {
        // === ЛОГІН (ВХІД) ===
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // 1. Перевіряємо, чи підтверджена пошта
        if (!user.emailVerified) {
          await signOut(auth); // Викидаємо назад
          alert("Будь ласка, підтвердіть вашу електронну пошту перед входом!");
          return; // Зупиняємо виконання коду
        }

        // 2. Якщо пошта підтверджена, перевіряємо чи є вже профіль у базі даних (Firestore)
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);

        // 3. Якщо профілю ще немає (перший вхід після підтвердження) — створюємо його
        if (!userDocSnap.exists()) {
          await setDoc(userDocRef, {
            uid: user.uid,
            email: user.email,
            name: "Студент", 
            status: "Не шукаю",
            photoURL: "",
            createdAt: new Date()
          });
        }

        console.log("Успішний вхід:", user.email);
        navigate("/search-roommate"); // Пускаємо на сайт
      }
    } catch (error) {
      console.error("Помилка Firebase:", error.code);
      if (error.code === 'auth/email-already-in-use') {
        alert("Користувач з таким email вже існує");
      } else if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
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

        {/* 6. Використовуємо onSubmit для форми */}
        <form onSubmit={handleSubmit} className="">
          <h3>Ласкаво просимо!</h3>
          <p>Знайди свого ідеального сусіда по кімнаті</p>
          <span>Email</span>
          <input
            type="email"
            className="mb-2"
            name=""
            // id=""
            placeholder="Ваш email"
            required
            // title="Please provide only a Best Startup Ever corporate email address"
            maxLength="64"
            // 7. ВИПРАВЛЕНІ БАГИ: Додано value та правильний onChange
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {/* 8. Повідомлення про помилку для Email */}
          {emailError && <p className="error-message">{emailError}</p>}

          <span>Пароль</span>
          <div className="input-password w-100">
            <input
              type={showPassword ? "text" : "password"}
              name=""
              id=""
              placeholder="Пароль"
              className="mb-2 w-100"
              required
              // 7. ВИПРАВЛЕНІ БАГИ: Додано value та правильний onChange
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Link to="#" className="text-dark showpass-btn-block">
              <i
                className={`bi ${
                  showPassword ? "bi-eye" : "bi-eye-slash"
                } fs-4 position-absolute`}
                id="showpass-btn"
                onClick={changeShowPassword}
              ></i>
            </Link>
          </div>
          <div className="row after-password-spans d-flex justify-content-between align-items-center">
            <span className="col-6 mb-4 range text-secondary">
              Має бути 8-20 символів{" "}
            </span>
            <span className="col-6 mb-4 range text-secondary text-end">
                <Link to="/resetPass"
                 className="resetPass ms-2">
                  Забули пароль?
                </Link>
              
            </span>
            
          </div>
          {/* 8. Повідомлення про помилку для Пароля */}
          

          {/* --- 9. Блок для підтвердження пароля при реєстрації --- */}
          {props.goal === "reg" ? (
            <>
              <span>Підтвердіть пароль</span>
              <div className="input-password w-100">
                <input
                  type={showPassword ? "text" : "password"} 
                  name=""
                  // id=""
                  placeholder="Підтвердіть пароль"
                  className="mb-2 w-100"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <Link to="#" className="text-dark showpass-btn-block">
                  <i
                    className={`bi ${
                      showPassword ? "bi-eye" : "bi-eye-slash"
                    } fs-4 position-absolute`}
                    id="showpass-btn"
                    onClick={changeShowPassword}
                  ></i>
                </Link>
              </div>
            </>
          ) : (
            <></>
          )}

          {/* 10. Кнопка тепер має тип "submit" і не має onClick */}
          <button type="submit" className="w-100 log-reg-btn w-100">
            {props.goal === "log" ? "Увійти" : "Зареєструватися"}
          </button>


          <hr></hr>
          <div className="or-span">
            <span className="fw-normal text-center ">або</span>
          </div>


          <Link to="#" onClick={handleGoogleSignIn} style={{color: "var(--text-main)"}} className="googlelogin-btn p-2">
            <span className="p-0 m-0">
              <img src={googleicon} className="googleicon" alt="Google" />
            </span>
            Продовжити з <span className="p-0 m-0 ms-1">Google</span>
          </Link>


          <p className="question">
            {props.goal === "log" ? (
              <>
                Ще немаєте аккаунту?
                <Link to="/regist" className="regist-link ms-2">
                  Реєстрація
                </Link>
              </>
            ) : (
              <>
                Вже маєте аккаунт?
                <Link to="/login" className="regist-link ms-2">
                  Увійти
                </Link>
              </>
            )}
          </p>
        </form>
        {props.goal === "reg" ? (
          <>
            <div className="row d-flex justify-content-center">
              <div className="col-8">
                <p className="terms">
                  Реєструючись, ви погоджуєтесь з нашими{" "}
                  <span className="accent">Умовами використання</span> та{" "}
                  <span className="accent">Політикою конфіденційності.</span>
                </p>
              </div>
            </div>
          </>
        ) : (
          ""
        )}
      </section>
    </div>
  );
}

export default UserInit;
