import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../css/test.scss"; // Переконайся, що оновив цей файл (код нижче)
import { db, auth } from "../firebase";
import { doc, updateDoc } from "firebase/firestore";

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

  // Словник назв категорій для відображення
  const categoryLabels = {
    cleanliness: "🧹 Чистота і порядок",
    routine: "⏰ Режим дня і шум",
    social: "🍕 Соціальна поведінка",
    rules: "🤝 Правила і відповідальність",
    comfort: "🛋️ Побут і комфорт",
  };

  // --- ДАНІ (Питання) ---
  // --- ДАНІ (Питання: 5 категорій по 3 питання) ---
  const questions = [
    // === КАТЕГОРІЯ 1: Чистота і порядок ===
    {
      id: 1,
      category: "cleanliness",
      type: "radio",
      questionText: "Як часто ви прибираєте свій власний простір (ліжко, стіл)?",
      options: [
        { id: "1.1", text: "Щоденне прибирання / Перфекціоніст." },
        { id: "1.2", text: "Раз на кілька днів / Коли помітний безлад." },
        { id: "1.3", text: "Рідко, я схильний до творчого безладу." },
      ],
    },
    {
      id: 2,
      category: "cleanliness",
      type: "radio",
      questionText: "Як ви ставитеся до брудного посуду?",
      options: [
        { id: "2.1", text: "Мию одразу після їжі." },
        { id: "2.2", text: "Можу залишити в раковині до вечора/ранку." },
        { id: "2.3", text: "Мию, коли закінчується чистий посуд." },
      ],
    },
    {
      id: 3,
      category: "cleanliness",
      type: "radio",
      questionText: "Як краще організувати прибирання спільних зон?",
      options: [
        { id: "3.1", text: "Скласти суворий графік чергувань." },
        { id: "3.2", text: "Прибирати разом в один визначений день." },
        { id: "3.3", text: "Кожен прибирає за собою, коли бачить бруд." },
      ],
    },

    // === КАТЕГОРІЯ 2: Режим дня і шум ===
    {
      id: 4,
      category: "routine",
      type: "radio",
      questionText: "Який ваш типовий режим сну у будні дні?",
      options: [
        { id: "4.1", text: "Жайворонок: Лягаю до 23:00, встаю до 8:00." },
        { id: "4.2", text: "Сова: Лягаю після 00:00, встаю після 9:00." },
        { id: "4.3", text: "Гнучкий: Графік нестабільний." },
      ],
    },
    {
      id: 5,
      category: "routine",
      type: "radio",
      questionText: "Які ваші умови для ідеального сну?",
      options: [
        { id: "5.1", text: "Темрява і абсолютна тиша." },
        { id: "5.2", text: "Темрява, але легкий фоновий шум не заважає." },
        { id: "5.3", text: "Сплю міцно: можу спати при світлі і шумі." },
      ],
    },
    {
      id: 6,
      category: "routine",
      type: "radio",
      questionText: "Ставлення до музики чи відео без навушників у кімнаті?",
      options: [
        { id: "6.1", text: "Слухати тільки в навушниках." },
        { id: "6.2", text: "Можна тихо, якщо це нікому не заважає." },
        { id: "6.3", text: "Люблю слухати гучно, не бачу в цьому проблеми." },
      ],
    },

    // === КАТЕГОРІЯ 3: Соціальна поведінка ===
    {
      id: 7,
      category: "social",
      type: "radio",
      questionText: "Як часто ви плануєте запрошувати гостей (друзів, знайомих)?",
      options: [
        { id: "7.1", text: "Дуже рідко або ніколи." },
        { id: "7.2", text: "Кілька разів на місяць (за домовленістю)." },
        { id: "7.3", text: "Досить часто, люблю компанії." },
      ],
    },
    {
      id: 8,
      category: "social",
      type: "radio",
      questionText: "Ваш ідеальний вечір у кімнаті після пар?",
      options: [
        { id: "8.1", text: "Кожен займається своїми справами в тиші." },
        { id: "8.2", text: "Спільні розмови, ігри або перегляд фільмів." },
        { id: "8.3", text: "Залежить від настрою." },
      ],
    },
    {
      id: 9,
      category: "social",
      type: "radio",
      questionText: "Як ви ставитеся до ночівель сторонніх людей (друзів, других половинок)?",
      options: [
        { id: "9.1", text: "Категорично проти." },
        { id: "9.2", text: "Рідко і тільки за попередньою згодою всіх сусідів." },
        { id: "9.3", text: "Це цілком нормально, якщо не занадто часто." },
      ],
    },

    // === КАТЕГОРІЯ 4: Правила і відповідальність ===
    {
      id: 10,
      category: "rules",
      type: "radio",
      questionText: "Як ви ставитеся до спільних витрат на побутові речі (мило, туалетний папір)?",
      options: [
        { id: "10.1", text: "Скидаємось порівну у спільний бюджет." },
        { id: "10.2", text: "Купуємо по черзі (сьогодні я, завтра ти)." },
        { id: "10.3", text: "Кожен купує своє і користується тільки своїм." },
      ],
    },
    {
      id: 11,
      category: "rules",
      type: "radio",
      questionText: "Як ви ставитеся до використання ваших особистих речей сусідом?",
      options: [
        { id: "11.1", text: "Категорично проти, нічого мого брати не можна." },
        { id: "11.2", text: "Тільки з дозволу кожного окремого разу." },
        { id: "11.3", text: "Можна брати дрібниці (сіль, посуд) без попиту." },
      ],
    },
    {
      id: 12,
      category: "rules",
      type: "radio",
      questionText: "Як ви зазвичай вирішуєте конфлікти чи непорозуміння?",
      options: [
        { id: "12.1", text: "Одразу говорю прямо, що мені не подобається." },
        { id: "12.2", text: "Чекаю слушного моменту для спокійної розмови." },
        { id: "12.3", text: "Уникаю конфліктів, намагаюся промовчати." },
      ],
    },

    // === КАТЕГОРІЯ 5: Побут і комфорт ===
    {
      id: 13,
      category: "comfort",
      type: "radio",
      questionText: "Яка температура в кімнаті для вас найбільш комфортна?",
      options: [
        { id: "13.1", text: "Люблю прохолоду, часто відкриваю вікно на провітрювання." },
        { id: "13.2", text: "Тепло, вікна краще тримати закритими." },
        { id: "13.3", text: "Мені байдуже, легко адаптуюсь." },
      ],
    },
    {
      id: 14,
      category: "comfort",
      type: "radio",
      questionText: "Ваше ставлення до розмов по телефону/відеозв'язку в кімнаті?",
      options: [
        { id: "14.1", text: "Завжди виходжу в коридор, щоб не заважати." },
        { id: "14.2", text: "Говорю в кімнаті, але тихо і недовго." },
        { id: "14.3", text: "Говорю вільно, це ж і моя кімната." },
      ],
    },
    {
      id: 15,
      category: "comfort",
      type: "radio",
      questionText: "Як ви зазвичай харчуєтеся?",
      options: [
        { id: "15.1", text: "Регулярно готую складні страви (проводжу багато часу на кухні)." },
        { id: "15.2", text: "Готую щось просте та швидке або напівфабрикати." },
        { id: "15.3", text: "Частіше їм в їдальні / замовляю доставку." },
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

    const questionIdStr = String(questionId); // ✅ Перетворення ID на рядок

    // ✅ ОГОЛОШЕННЯ ПОВИННО БУТИ З const/let

    const cleanedValue = inputValue.replace(sentenceRegex, "");

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

    setAnswerIds((prev) => ({
      ...prev,
      [questionIdStr]: idValue,
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
      if (event.key === "Enter") {
        event.preventDefault();
        handleNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleNext]);

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

  const handleSubmit = async () => {
    const currentUser = auth.currentUser;

    if (currentUser) {
      try {
        const userRef = doc(db, "users", currentUser.uid);

        // Записуємо дані в Firestore
        await updateDoc(userRef, {
          answers: answers, // Використовуємо 'answers' замість 'testResults'
          answerIds: answerIds,
          hasPassedTest: true,
          lastTestDate: new Date(),
        });
        console.log("Результати успішно збережено в Firestore!");
      } catch (error) {
        console.error("Помилка при збереженні в базу:", error);
      }
    }

    // Переходимо на результати
    navigate("/resultoftest", {
      state: { userAnswers: answers, userAnswerIds: answerIds, questions: questions, },
    });
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

        <div className="category-indicator">
            {categoryLabels[currentQ.category]}
          </div>
          
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
