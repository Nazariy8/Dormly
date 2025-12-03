import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../css/test.scss"; // Переконайся, що оновив цей файл (код нижче)

const Test = () => {
  const navigate = useNavigate();


  

  


  // --- СТАН ---
  // Індекс поточного питання (починаємо з 0)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  // Збережені відповіді
  const [answers, setAnswers] = useState({});

  const [answerIds, setAnswerIds] = useState({});
  // Анімація переходу (опціонально)
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    document.body.classList.add("body-test-page");
    return () => {
      document.body.classList.remove("body-test-page");
    };
  }, []);

  // --- ДАНІ (Питання) ---
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
      questionText:
        "Як ви ставитеся до поділу/спільного використання продуктів?",
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

  // --- ЛОГІКА ---

  // Поточне питання
  const currentQ = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  const handleInputText = (event, questionId) => {
    // ... (cleanedValue)
    const inputValue = event.target.value;

    const sentenceRegex = /[^А-Яа-яЄєІіЇїҐґ\s.,:;!?'"-]/g; 

    // ✅ ОГОЛОШЕННЯ ПОВИННО БУТИ З const/let
    const cleanedValue = inputValue.replace(sentenceRegex, "");

    const questionIdStr = String(questionId); // ✅ Перетворення ID на рядок

    setAnswers((prev) => ({
      ...prev,
      [questionIdStr]: cleanedValue, // Використовуємо рядок
    }));
  };

  // Оновлення відповіді
  const handleAnswerSelect = (textValue, idValue, questionId) => {
    const questionIdStr = String(questionId); // ✅ Перетворення ID на рядок
    
    setAnswers((prev) => ({
      ...prev,
      [questionIdStr]: textValue, // Використовуємо рядок
    }));


  };

  // Перехід до наступного
  const handleNext = () => {
    // Валідація: чи дали відповідь?
    if (!answers[currentQ.id] || answers[currentQ.id].trim() === "") {
      alert("Будь ласка, дайте відповідь, щоб продовжити!");
      return;
    }

    if (isLastQuestion) {
      handleSubmit();
    } else {
      setIsExiting(true);
      setTimeout(() => {
        setCurrentQuestionIndex((prev) => prev + 1);
        setIsExiting(false);
      }, 300); // Затримка для анімації (має співпадати з CSS transition)
    }
  };


  useEffect(() => {
    const handleKeyDown = (event) => {
        if (event.key === "Enter"){
          event.preventDefault();
          handleNext();
        }
    }
    
    window.addEventListener("keydown", handleKeyDown);

  return () => {
    window.removeEventListener("keydown", handleKeyDown)
  }
  }, [handleNext])
  
  // Перехід назад
  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setIsExiting(true);
      setTimeout(() => {
        setCurrentQuestionIndex((prev) => prev - 1);
        setIsExiting(false);
      }, 300);
    }
  };

  const handleSubmit = () => {
    // ✅ ЗМІНЕНО: Передаємо обидва об'єкти через state
    navigate("/resultoftest", {
      state: {
        userAnswers: answers, // ТЕКСТ (для відображення)
        userAnswerIds: answerIds, // ID (для обчислення)
        questions: questions,
      },
    });
    console.log("Всі відповіді (Текст):", answers);
    console.log("Всі відповіді (ID):", answerIds);
  };

  // Обчислення прогресу (для смужки зверху)
  const progressPercentage =
    ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="test-page-wrapper">
      <div className="link-to-index ">
        <Link to="/" className="link-to-index-btn">
          На головну
        </Link>
      </div>
      <div className="test-container-card">
        {/* Смужка прогресу */}
        <div className="progress-bar-container">
          <div
            className="progress-bar-fill"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>

        <div
          className={`question-content ${isExiting ? "fade-out" : "fade-in"}`}
        >
          <h2 className="question-title">{currentQ.questionText}</h2>

          <div className="options-area">
            {currentQ.type === "text" ? (
              <input
                pattern="[А-Яа-яЄєІіЇїҐґ'-\s]+"
                title="Можна вводити лише українські літери, пробіл, апостроф або дефіс."
                type="text"
                className="text-input-styled"
                placeholder={currentQ.placeholder}
                value={answers[currentQ.id] || ""}
                onChange={(e) => handleInputText(e, currentQ.id)}
                autoFocus
              />
            ) : (
              <div className="options-grid">
                {currentQ.options.map((opt) => {
                  const isSelected = answers[currentQ.id] === opt.text;
                  return (
                    <div
                      key={opt.id}
                      className={`option-card ${isSelected ? "selected" : ""}`}
                      onClick={() =>
                        handleAnswerSelect(opt.text, opt.id, currentQ.id)
                      }
                    >
                      <span className="option-text">{opt.text}</span>
                      {isSelected && <span className="check-icon">✔</span>}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Кнопки навігації */}
        <div className="navigation-buttons">
          <button
            className="nav-btn prev-btn"
            onClick={handlePrev}
            disabled={currentQuestionIndex === 0}
          >
            Назад
          </button>

          <button className="nav-btn next-btn" onClick={handleNext}>
            {isLastQuestion ? "Завершити" : "Далі"}
          </button>
        </div>

        <div className="step-indicator">
          Питання {currentQuestionIndex + 1} з {questions.length}
        </div>
      </div>
    </div>
  );
};

export default Test;
