import React, { useState, useEffect, useRef } from "react";
import Header from "../components/Header";
import { useLocation, useNavigate } from "react-router-dom";
import "../css/profile.css";
import defaultUser from "../img/profile/user.jpg"
const users = [
  {
    
  },
  {

  }
];
const questions = [
  {
    id: 1,
    type: "text",
    questionText:
      "Чи є у вас якась звичка, яка може бути незвичною/дратівливою для інших?",
    placeholder: "Вкажіть свою звичку...",
  },
  {
    id: 2,
    type: "radio",
    questionText: "Як ви ставитеся до поділу/спільного використання продуктів?",
    options: [
      {
        id: "2.1",
        text: "Все має бути розділене, нічого не беру без дозволу.",
      },
      {
        id: "2.2",
        text: "Дрібниці (сіль, цукор, мило) можна ділити, більшість — ні.",
      },
      { id: "2.3", text: "Мені подобається ділитися майже всім." },
    ],
  },
  {
    id: 3,
    type: "radio",
    questionText:
      "Як ви ставитеся до накопичення особистих речей та одягу у кімнаті?",
    options: [
      { id: "3.1", text: "Мінімаліст: Не люблю зайвого." },
      { id: "3.2", text: "Практик: Зберігаю лише необхідне." },
      {
        id: "3.3",
        text: "Колекціонер: Мені потрібен простір для своїх речей.",
      },
    ],
  },
  {
    id: 4,
    type: "radio",
    questionText: "Яка ваша частота прибирання власного простору?",
    options: [
      { id: "4.1", text: "Щоденне прибирання / Перфекціоніст." },
      { id: "4.2", text: "Раз на кілька днів / Коли помітний безлад." },
      { id: "4.3", text: "Раз на тиждень / Генеральне прибирання." },
      { id: "4.4", text: "Рідко, я схильний до творчого безладу." },
    ],
  },
  {
    id: 5,
    type: "radio",
    questionText: "Який ваш типовий режим сну у будні дні?",
    options: [
      { id: "5.1", text: "Жайворонок: Лягаю до 23:00, встаю до 8:00." },
      { id: "5.2", text: "Сова: Лягаю після 00:00, встаю після 9:00." },
      { id: "5.3", text: "Гнучкий: Адаптуюся." },
    ],
  },
  {
    id: 6,
    type: "text",
    questionText: "Чи є у вас підтверджена алергія на щось?",
    placeholder: "Напишіть 'Ні' або вкажіть на що...",
  },
  {
    id: 7,
    type: "radio",
    questionText: "Який ваш улюблений спосіб релаксу?",
    options: [
      { id: "7.1", text: "Абсолютна тиша і лежання у ліжку." },
      { id: "7.2", text: "Активне хобі (тренування, ігри)." },
      { id: "7.3", text: "Спілкування з друзями." },
    ],
  },
  {
    id: 8,
    type: "radio",
    questionText: "Як часто ви плануєте запрошувати гостей?",
    options: [
      { id: "8.1", text: "Дуже рідко." },
      { id: "8.2", text: "Кілька разів на місяць." },
      { id: "8.3", text: "1-2 рази на тиждень." },
      { id: "8.4", text: "Досить часто." },
    ],
  },
  {
    id: 9,
    type: "radio",
    questionText: "Як організувати прибирання спільних зон?",
    options: [
      { id: "9.1", text: "Чіткий графік чергувань." },
      { id: "9.2", text: "Разом, коли бачимо бруд." },
      { id: "9.3", text: "Хто вільний, той і прибирає." },
    ],
  },
  {
    id: 10,
    type: "radio",
    questionText: "Спільні витрати на побутові речі?",
    options: [
      { id: "10.1", text: "Скидатися 50/50." },
      { id: "10.2", text: "Домовляємося по ситуації." },
      { id: "10.3", text: "Кожен купує своє." },
    ],
  },
  {
    id: 11,
    type: "radio",
    questionText: "Ставлення до розмов по телефону в кімнаті?",
    options: [
      { id: "11.1", text: "Це нормально." },
      { id: "11.2", text: "Тільки короткі розмови." },
      { id: "11.3", text: "Це дратує, треба виходити." },
    ],
  },
  {
    id: 12,
    type: "radio",
    questionText: "Улюблений жанр музики?",
    options: [
      { id: "12.1", text: "Поп / Електроніка" },
      { id: "12.2", text: "Рок / Метал" },
      { id: "12.3", text: "Хіп-хоп / Реп" },
      { id: "12.4", text: "Класика / Джаз" },
      { id: "12.5", text: "Інді / Фолк" },
      { id: "12.6", text: "Я всеїдний" },
      { id: "12.7", text: "Слухаю тільки в навушниках" },
    ],
  },
  {
    id: 13,
    type: "radio",
    questionText: "Атмосфера для навчання?",
    options: [
      { id: "13.1", text: "Абсолютна тиша." },
      { id: "13.2", text: "Тиха музика." },
      { id: "13.3", text: "Фоновий шум не заважає." },
    ],
  },
  {
    id: 14,
    type: "radio",
    questionText: "Умови для сну?",
    options: [
      { id: "14.1", text: "Темрява і повна тиша." },
      { id: "14.2", text: "Темрява, але шум не заважає." },
      { id: "14.3", text: "Тиша, але можна зі світлом." },
      { id: "14.4", text: "Сплю в будь-яких умовах." },
    ],
  },
  {
    id: 15,
    type: "radio",
    questionText: "Вільний вечір у будній день?",
    options: [
      { id: "15.1", text: "Навчання / Робота." },
      { id: "15.2", text: "Фільми / Ігри." },
      { id: "15.3", text: "Читання." },
      { id: "15.4", text: "Спорт / Прогулянка." },
      { id: "15.5", text: "Спілкування з друзями." },
      { id: "15.6", text: "Хобі." },
    ],
  },
];
// Ключі для localStorage
const STORAGE_KEY_AVATAR = "userAvatarBase64";
const STORAGE_KEY_FIRST_NAME = "userFirstName";
const STORAGE_KEY_LAST_NAME = "userLastName";
// Новий ключ для збереження назви файлу
const STORAGE_KEY_FILE_NAME = "userFileName";

const SearchRoommate = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const fileInputRef = useRef(null);

  const { userAnswers, questions } = location.state || {};

  // 1. Стан для аватара
  const [avatar, setAvatar] = useState(
    localStorage.getItem(STORAGE_KEY_AVATAR)
  );
  // 2. Стан для імені та прізвища
  const [firstName, setFirstName] = useState(
    localStorage.getItem(STORAGE_KEY_FIRST_NAME) || ""
  );
  const [lastName, setLastName] = useState(
    localStorage.getItem(STORAGE_KEY_LAST_NAME) || ""
  );
  // 3. Стан для назви файлу (тепер читаємо з localStorage)
  const [fileName, setFileName] = useState(
    localStorage.getItem(STORAGE_KEY_FILE_NAME) || "Файл не вибрано"
  );

  useEffect(() => {
    // Перевіряємо, чи є глобальний об'єкт bootstrap (з CDN)
    if (window.bootstrap) {
      // Знаходимо всі елементи з атрибутом data-bs-toggle="tooltip"
      const tooltipTriggerList = document.querySelectorAll(
        '[data-bs-toggle="tooltip"]'
      );

      // Ініціалізуємо їх
      const tooltipList = [...tooltipTriggerList].map(
        (tooltipTriggerEl) => new window.bootstrap.Tooltip(tooltipTriggerEl)
      );

      // Функція очищення (Cleanup function)
      // Важливо видаляти тултіпи при розмонтуванні компонента, щоб не було "привидів"
      return () => {
        tooltipList.forEach((instance) => instance.dispose());
      };
    }
  }, [userAnswers]); // Запускаємо, коли змінюються дані userAnswers (і відповідно перемальовується HTML)

  // Хуки для синхронізації імені/прізвища
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_FIRST_NAME, firstName);
  }, [firstName]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_LAST_NAME, lastName);
  }, [lastName]);


  const deleteFile = () => {
     setAvatar(null);
      localStorage.removeItem(STORAGE_KEY_AVATAR);
      setFileName("Файл не вибрано"); // Повертаємо текст за замовчуванням
      localStorage.removeItem(STORAGE_KEY_FILE_NAME);

      if (fileInputRef.current){
        fileInputRef.current.value = "";
      }
  }
  // Обробник змін для текстових інпутів
  const handleNameChange = (event, setter) => {
    const inputValue = event.target.value;

    const cyrillicRegex = /[^А-Яа-яЄєІіЇїҐґ'\s-]/g;

    const cleanedValue = inputValue.replace(cyrillicRegex, "");

    setter (cleanedValue);
  };

  // Обробник зміни файлу (оновлено для збереження назви)
  const handleFileChange = (event) => {
    const files = event.target.files;

  if (files.length === 0){
    return;
  }


  const file = files[0];

    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();

      // 1. Оновлюємо стан назви файлу та зберігаємо її
      setFileName(file.name);
      localStorage.setItem(STORAGE_KEY_FILE_NAME, file.name);

      reader.readAsDataURL(file);

      reader.onload = () => {
        const base64String = reader.result;
        setAvatar(base64String);
        localStorage.setItem(STORAGE_KEY_AVATAR, base64String);
      };

      reader.onerror = (error) => {
        console.error("Помилка читання файлу:", error);
        setFileName("Помилка завантаження");
        localStorage.removeItem(STORAGE_KEY_FILE_NAME);
      };
    } else {
      // У випадку помилки або якщо файл скасовано/видалено
      deleteFile()
    }
  };

  const handleGoTest = () => {
    navigate("/test");
  };
  return (
    <div>
      <Header />

      <div className="profile row rounded-4 p-3 m">
        <div className="col-12 d-flex justify-content-center flex-column">
          <h1 className="mb-3">Ваш профіль</h1>

          <div className="user-avatar-block mb-3">
            <img
              src={avatar || defaultUser}
              alt="Фото користувача"
            />
          </div>
          {/* 4. Оновлена верстка для поля вводу файлу */}
          
          <div className="row d-flex justify-content-center ">
            <div className="col-4 ">
              <div class="input-group  mb-3">
                <input
                   type="file"
                  accept="image/*"
                  className="form-control" // Ховаємо стандартне поле
                  onChange={handleFileChange}
                  id="inputGroupFile02"
                  ref={fileInputRef}
                />
                <button
                  class="btn btn-outline-secondary"
                  type="button"
                  id="inputGroupFileAddon04"
                  onClick={deleteFile}
                >
                  Видалити фото
                </button>
              </div>
            </div>
          </div>

          {/* Ввід прізвища */}
          <div className="row mb-3">
            <div className="col-12 col-xxl-3 col-xl-5 col-lg-6 col-md-6 col-sm-7 mx-auto">
              <div className="input-group mx-auto">
                <span className="input-group-text">Прізвище</span>
                <input
                  pattern="[А-Яа-яЄєІіЇїҐґ'-\s]+"
                  title="Можна вводити лише українські літери, пробіл, апостроф або дефіс."
                  type="text"
                  aria-label="First name"
                  className="form-control"
                  value={firstName}
                  onChange={(e) => handleNameChange(e, setFirstName)}
                />
              </div>
            </div>
          </div>

          {/* Ввід імя */}
          <div className="row">
            <div className="col-12 col-xxl-3 col-xl-5 col-lg-6 col-md-6 col-sm-7 mb-3 mx-auto">
              <div className="input-group mx-auto">
                <span className="input-group-text">Ім'я</span>
                <input
                  pattern="[А-Яа-яЄєІіЇїҐґ'-\s]+"
                  title="Можна вводити лише українські літери, пробіл, апостроф або дефіс."
                  type="text"
                  aria-label="Last name"
                  className="form-control"
                  value={lastName}
                  onChange={(e) => handleNameChange(e, setLastName)}
                />
              </div>
            </div>
          </div>
        </div>

        <h3>Мої особливості</h3>
        <div className="row my-features  p-2">
          <div className="col-12 col-xxl-6 col-xl-6 col-md-12 col-sm-12 d-flex flex-wrap mb-4">
            <>
              {userAnswers ? (
                <>
                  {Object.values(userAnswers).map((answer, index) => {
                    const currentQuestion = questions[index];
                    return (
                      <div key={index} className="m-1">
                        <span
                          className="badge fs-6"
                          data-bs-toggle="tooltip"
                          data-bs-title={
                            currentQuestion
                              ? currentQuestion.questionText
                              : "Питання"
                          }
                        >
                          {answer}
                        </span>
                      </div>
                    );
                  })}
                  <div className="w-100 mt-3">
                    <h4 className="mb-3">Не подобається результат?</h4>
                    <a
                      className="rounded-3 test-again fs-5 pe-auto"
                      href="#"
                      onClick={handleGoTest}
                    >
                      Перепройти тест
                    </a>
                  </div>
                </> /* <--- КІНЕЦЬ ОБГОРТКИ */
              ) : (
                // Блок, якщо відповідей немає (else)
                <div>
                  <h5 className="text-warning">
                    Ви не пройшли тест на особливості{" "}
                    <i className="bi bi-arrow-down"></i>
                  </h5>
                  <button className="start-test" onClick={handleGoTest}>
                    Пройти тест
                  </button>
                </div>
              )}
            </>
          </div>
          <div className="col-12 col-xxl-6 col-xl-6 col-md-12 col-sm-12 text-end">
            <h3>Ваша сумісність за результатами тесту:</h3>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchRoommate;
