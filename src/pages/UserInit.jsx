import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import googleicon from "../img/icons/google.png";
import Advan from "./../components/Advan";

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

  // --- 4. Функція, що викликається при відправці форми ---
  const handleSubmit = (e) => {
    e.preventDefault(); // Забороняємо сторінці перезавантажуватись

    // Запускаємо валідацію
    const isValid = validateInputs();

    if (isValid) {
      // ВАЛІДАЦІЯ УСПІШНА!
      // Тут була б ваша логіка setIsInited(true)

      // Тут ви б відправили дані на сервер (fetch, axios...)
      console.log("Валідація успішна, відправляємо дані:", { email, password });

      // 5. Перенаправляємо користувача на сторінку профілю
      navigate("/search-roommate");
    } else {
      // Якщо валідація не пройдена, помилки (emailError, passwordError)
      // автоматично з'являться на сторінці
      console.log("Валідація провалена");
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
          </div>
          {/* 8. Повідомлення про помилку для Пароля */}
          {passwordError && <p className="error-message">{passwordError}</p>}

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
          <Link to="" className="text-dark googlelogin-btn p-2">
            <span className="p-0 m-0">
              <img src={googleicon} className="googleicon" alt="" />
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
