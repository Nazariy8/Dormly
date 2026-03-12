import React, { useState, useEffect, useRef } from "react";
import Header from "../components/Header";
import { useLocation, useNavigate } from "react-router-dom";
import "../css/profile.scss";
import defaultUser from "../img/profile/user.jpg";
import UserForRoom from "../components/UserForRoom";
import { Link } from "react-router-dom";

import { auth, db } from "../firebase"; // Перевір, щоб шлях був правильним
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

import Cropper from "react-easy-crop";
import { getCroppedImg } from "../utils/cropImage"; // Перевір, щоб шлях до файлу був правильним
const users = [
  {
    id: 101,
    name: "Олександр",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
    bio: "Студент, люблю спокій та порядок. Класичний інтроверт.",
    instagram: "@sashko_study",
    telegram: "@Alex_Order",
    answers: {
      1: "Гризти ручку",
      2: "Все має бути розділене, нічого не беру без дозволу.", // 2.1
      3: "Практик: Зберігаю лише необхідне.", // 3.2
      4: "Раз на тиждень / Генеральне прибирання.", // 4.3
      5: "Жайворонок: Лягаю до 23:00, встаю до 8:00.", // 5.1
      6: "Ні",
      7: "Абсолютна тиша і лежання у ліжку.", // 7.1
      8: "Дуже рідко.", // 8.1
      9: "Чіткий графік чергувань.", // 9.1
      10: "Кожен купує своє.", // 10.3
      11: "Це дратує, треба виходити.", // 11.3
      12: "Класика / Джаз", // 12.4
      13: "Абсолютна тиша.", // 13.1
      14: "Темрява і повна тиша.", // 14.1
      15: "Читання.", // 15.3
    },
  },
  {
    id: 102,
    name: "Максим",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Max",
    bio: "Люблю музику та компанії. Шукаю веселого сусіда.",
    instagram: "@max_party_vibe",
    telegram: "@MaxMusicLover",
    answers: {
      1: "Голосно сміюся",
      2: "Мені подобається ділитися майже всім.", // 2.3
      3: "Колекціонер: Мені потрібен простір для своїх речей.", // 3.3
      4: "Рідко, я схильний до творчого безладу.", // 4.4
      5: "Сова: Лягаю після 00:00, встаю після 9:00.", // 5.2
      6: "Пилюка",
      7: "Спілкування з друзями.", // 7.3
      8: "Досить часто.", // 8.4
      9: "Хто вільний, той і прибирає.", // 9.3
      10: "Скидатися 50/50.", // Змінено на 10.1
      11: "Це нормально.", // Змінено на 11.1
      12: "Хіп-хоп / Реп", // 12.3
      13: "Фоновий шум не заважає.", // 13.3
      14: "Сплю в будь-яких умовах.", // 14.4
      15: "Спілкування з друзями.", // 15.5
    },
  },
  {
    id: 103,
    name: "Ірина",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Irina",
    bio: "Адаптуюся до будь-яких умов, головне — взаємоповага.",
    instagram: "@irina_easy_life",
    telegram: "@Irina_Flex",
    answers: {
      1: "Немає",
      2: "Дрібниці можна ділити, більшість — ні.", // 2.2
      3: "Мінімаліст: Не люблю зайвого.", // 3.1
      4: "Раз на кілька днів / Коли помітний безлад.", // 4.2
      5: "Гнучкий: Адаптуюся.", // 5.3
      6: "Шерсть котів",
      7: "Активне хобі (тренування, ігри).", // 7.2
      8: "Кілька разів на місяць.", // 8.2
      9: "Разом, коли бачимо бруд.", // 9.2
      10: "Домовляємося по ситуації.", // 10.2
      11: "Тільки короткі розмови.", // 11.2
      12: "Поп / Електроніка", // Змінено на 12.1
      13: "Фоновий шум не заважає.", // 13.3
      14: "Темрява, але шум не заважає.", // 14.2
      15: "Спорт / Прогулянка.", // Змінено на 15.4
    },
  },
  {
    id: 104,
    name: "Дмитро",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Dmytro",
    bio: "Програміст, сиджу за компом 24/7. Поважаю тишу.",
    instagram: "@dmytro_dev_life",
    telegram: "@DmytroCode",
    answers: {
      1: "Клацаю клавіатурою вночі",
      2: "Все має бути розділене, нічого не беру без дозволу.", // 2.1
      3: "Практик: Зберігаю лише необхідне.", // 3.2
      4: "Раз на кілька днів / Коли помітний безлад.", // 4.2
      5: "Сова: Лягаю після 00:00, встаю після 9:00.", // 5.2
      6: "Ні",
      7: "Активне хобі (тренування, ігри).", // 7.2
      8: "Дуже рідко.", // 8.1
      9: "Хто вільний, той і прибирає.", // 9.3
      10: "Кожен купує своє.", // 10.3
      11: "Це дратує, треба виходити.", // 11.3
      12: "Рок / Метал", // 12.2
      13: "Абсолютна тиша.", // 13.1
      14: "Темрява і повна тиша.", // 14.1
      15: "Фільми / Ігри.", // Змінено на 15.2
    },
  },
  {
    id: 105,
    name: "Наталія",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Natalia",
    bio: "Еколог. Ціннісне споживання та мінімум відходів.",
    instagram: "@natalka_green",
    telegram: "@EcoNat",
    answers: {
      1: "Залишаю відкритими двері шафи/тумбочок",
      2: "Дрібниці можна ділити, більшість — ні.", // 2.2
      3: "Мінімаліст: Не люблю зайвого.", // 3.1
      4: "Щоденне прибирання / Перфекціоніст.", // 4.1
      5: "Жайворонок: Лягаю до 23:00, встаю до 8:00.", // 5.1
      6: "Неприємні запахи (їжа, сміття)",
      7: "Читання.", // Змінено на 7.1
      8: "Кілька разів на місяць.", // 8.2
      9: "Чіткий графік чергувань.", // 9.1
      10: "Скидатися 50/50.", // 10.1
      11: "Тільки короткі розмови.", // 11.2
      12: "Інді / Фолк", // 12.5
      13: "Абсолютна тиша.", // 13.1
      14: "Темрява і повна тиша.", // 14.1
      15: "Хобі.", // 15.6
    },
  },
  {
    id: 106,
    name: "Сергій",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sergiy",
    bio: "Музикант. Часто граю на інструментах (з навушниками).",
    instagram: "@sergiy_sound",
    telegram: "@SergiyMusic",
    answers: {
      1: "Граю на інструменті (тихо/в навушниках)",
      2: "Мені подобається ділитися майже всім.", // 2.3
      3: "Колекціонер: Мені потрібен простір для своїх речей.", // 3.3
      4: "Рідко, я схильний до творчого безладу.", // 4.4
      5: "Гнучкий: Адаптуюся.", // 5.3
      6: "Залишений брудний посуд",
      7: "Спілкування з друзями.", // 7.3
      8: "1-2 рази на тиждень.", // 8.3
      9: "Хто вільний, той і прибирає.", // 9.3
      10: "Домовляємося по ситуації.", // 10.2
      11: "Це нормально.", // 11.1
      12: "Я всеїдний", // 12.6
      13: "Тиха музика.", // 13.2
      14: "Сплю в будь-яких умовах.", // 14.4
      15: "Хобі.", // 15.6
    },
  },
  {
    id: 107,
    name: "Олена",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Olena",
    bio: "Маркетолог, працюю з дому. Потрібен комфорт.",
    instagram: "@olena_comfort",
    telegram: "@OlenaHomeWork",
    answers: {
      1: "Немає",
      2: "Дрібниці можна ділити, більшість — ні.", // 2.2
      3: "Практик: Зберігаю лише необхідне.", // 3.2
      4: "Щоденне прибирання / Перфекціоніст.", // 4.1
      5: "Гнучкий: Адаптуюся.", // 5.3
      6: "Гучні розмови по телефону",
      7: "Абсолютна тиша і лежання у ліжку.", // 7.1
      8: "Дуже рідко.", // 8.1
      9: "Разом, коли бачимо бруд.", // 9.2
      10: "Кожен купує своє.", // 10.3
      11: "Тільки короткі розмови.", // 11.2
      12: "Слухаю тільки в навушниках", // 12.7
      13: "Тиха музика.", // 13.2
      14: "Тиша, але можна зі світлом.", // 14.3
      15: "Навчання / Робота.", // 15.1
    },
  },
  {
    id: 108,
    name: "Роман",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Roman",
    bio: "Бармен. Працюю до пізньої ночі, сплю вдень.",
    instagram: "@roman_night_life",
    telegram: "@RomanBar",
    answers: {
      1: "Ходжу вночі/зранку",
      2: "Мені подобається ділитися майже всім.", // 2.3
      3: "Колекціонер: Мені потрібен простір для своїх речей.", // 3.3
      4: "Раз на тиждень / Генеральне прибирання.", // 4.3
      5: "Сова: Лягаю після 00:00, встаю після 9:00.", // 5.2
      6: "Хропіння",
      7: "Активне хобі (тренування, ігри).", // 7.2
      8: "Досить часто.", // 8.4
      9: "Хто вільний, той і прибирає.", // 9.3
      10: "Скидатися 50/50.", // 10.1
      11: "Це нормально.", // 11.1
      12: "Хіп-хоп / Реп", // 12.3
      13: "Фоновий шум не заважає.", // 13.3
      14: "Темрява, але шум не заважає.", // 14.2
      15: "Спілкування з друзями.", // 15.5
    },
  },
  {
    id: 109,
    name: "Юлія",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Yulia",
    bio: "Художниця. Люблю затишок, але можу бути розсіяною.",
    instagram: "@yulia_art_space",
    telegram: "@YuliaDraws",
    answers: {
      1: "Розмовляю сама з собою",
      2: "Дрібниці можна ділити, більшість — ні.", // 2.2
      3: "Колекціонер: Мені потрібен простір для своїх речей.", // 3.3
      4: "Рідко, я схильна до творчого безладу.", // 4.4
      5: "Гнучкий: Адаптуюся.", // 5.3
      6: "Пилюка",
      7: "Абсолютна тиша і лежання у ліжку.", // 7.1
      8: "Кілька разів на місяць.", // 8.2
      9: "Разом, коли бачимо бруд.", // 9.2
      10: "Домовляємося по ситуації.", // 10.2
      11: "Тільки короткі розмови.", // 11.2
      12: "Класика / Джаз", // 12.4
      13: "Абсолютна тиша.", // 13.1
      14: "Темрява і повна тиша.", // 14.1
      15: "Читання.", // 15.3
    },
  },
  {
    id: 110,
    name: "Володимир",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Volodymyr",
    bio: "Спортсмен. Дисциплінований, рано встаю.",
    instagram: "@vova_fit",
    telegram: "@VovaSport",
    answers: {
      1: "Дуже рано встаю і роблю зарядку",
      2: "Все має бути розділене, нічого не беру без дозволу.", // 2.1
      3: "Мінімаліст: Не люблю зайвого.", // 3.1
      4: "Щоденне прибирання / Перфекціоніст.", // 4.1
      5: "Жайворонок: Лягаю до 23:00, встаю до 8:00.", // 5.1
      6: "Ні",
      7: "Активне хобі (тренування, ігри).", // 7.2
      8: "1-2 рази на тиждень.", // 8.3
      9: "Чіткий графік чергувань.", // 9.1
      10: "Кожен купує своє.", // 10.3
      11: "Це дратує, треба виходити.", // 11.3
      12: "Рок / Метал", // 12.2
      13: "Фоновий шум не заважає.", // 13.3
      14: "Темрява, але шум не заважає.", // 14.2
      15: "Спорт / Прогулянка.", // 15.4
    },
  },
  {
    id: 111,
    name: "Христина",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Khrystyna",
    bio: "Фрилансер-дизайнер. Люблю працювати під фонову музику.",
    instagram: "@khrystyna_design",
    telegram: "@KhrystynaFrelance",
    answers: {
      1: "Перекладаю речі з місця на місце",
      2: "Дрібниці можна ділити, більшість — ні.", // 2.2
      3: "Практик: Зберігаю лише необхідне.", // 3.2
      4: "Раз на кілька днів / Коли помітний безлад.", // 4.2
      5: "Сова: Лягаю після 00:00, встаю після 9:00.", // 5.2
      6: "Шерсть тварин",
      7: "Фільми / Ігри.", // 7.1
      8: "Кілька разів на місяць.", // 8.2
      9: "Разом, коли бачимо бруд.", // 9.2
      10: "Домовляємося по ситуації.", // 10.2
      11: "Телефон не заважає.", // 11.1
      12: "Поп / Електроніка", // 12.1
      13: "Тиха музика.", // 13.2
      14: "Тиша, але можна зі світлом.", // 14.3
      15: "Фільми / Ігри.", // 15.2
    },
  },
  {
    id: 112,
    name: "Олег",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Oleg",
    bio: "Студент-іноземець. Дуже відкритий до нового та спілкування.",
    instagram: "@oleg_international",
    telegram: "@OlegNewComer",
    answers: {
      1: "Розмовляю уві сні",
      2: "Мені подобається ділитися майже всім.", // 2.3
      3: "Мінімаліст: Не люблю зайвого.", // 3.1
      4: "Раз на тиждень / Генеральне прибирання.", // 4.3
      5: "Гнучкий: Адаптуюся.", // 5.3
      6: "Пилюка",
      7: "Спілкування з друзями.", // 7.3
      8: "Досить часто.", // 8.4
      9: "Хто вільний, той і прибирає.", // 9.3
      10: "Скидатися 50/50.", // 10.1
      11: "Це нормально.", // 11.1
      12: "Я всеїдний", // 12.6
      13: "Фоновий шум не заважає.", // 13.3
      14: "Сплю в будь-яких умовах.", // 14.4
      15: "Спілкування з друзями.", // 15.5
    },
  },
  {
    id: 113,
    name: "Зоряна",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Zoryana",
    bio: "Любителька порядку і природи. Займаюся йогою.",
    instagram: "@zoryana_yoga",
    telegram: "@ZoryanaPeace",
    answers: {
      1: "Переставляю предмети в кімнаті",
      2: "Все має бути розділене, нічого не беру без дозволу.", // 2.1
      3: "Практик: Зберігаю лише необхідне.", // 3.2
      4: "Щоденне прибирання / Перфекціоніст.", // 4.1
      5: "Жайворонок: Лягаю до 23:00, встаю до 8:00.", // 5.1
      6: "Гучні звуки",
      7: "Активне хобі (тренування, ігри).", // 7.2
      8: "Дуже рідко.", // 8.1
      9: "Чіткий графік чергувань.", // 9.1
      10: "Кожен купує своє.", // 10.3
      11: "Це дратує, треба виходити.", // 11.3
      12: "Класика / Джаз", // 12.4
      13: "Абсолютна тиша.", // 13.1
      14: "Темрява і повна тиша.", // 14.1
      15: "Спорт / Прогулянка.", // 15.4
    },
  },
  {
    id: 114,
    name: "Артем",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Artem",
    bio: "Геймер та кіноман. Цікавлюся ІТ та новинками.",
    instagram: "@artem_tech_geek",
    telegram: "@ArtemGame",
    answers: {
      1: "Клацаю клавіатурою вночі",
      2: "Дрібниці можна ділити, більшість — ні.", // 2.2
      3: "Колекціонер: Мені потрібен простір для своїх речей.", // 3.3
      4: "Раз на кілька днів / Коли помітний безлад.", // 4.2
      5: "Сова: Лягаю після 00:00, встаю після 9:00.", // 5.2
      6: "Неприємні запахи (їжа, сміття)",
      7: "Фільми / Ігри.", // 7.1
      8: "Кілька разів на місяць.", // 8.2
      9: "Хто вільний, той і прибирає.", // 9.3
      10: "Домовляємося по ситуації.", // 10.2
      11: "Телефон не заважає.", // 11.1
      12: "Рок / Метал", // 12.2
      13: "Фоновий шум не заважає.", // 13.3
      14: "Тиша, але можна зі світлом.", // 14.3
      15: "Фільми / Ігри.", // 15.2
    },
  },
];

const questions = [
  {
    id: 1,
    questionText:
      "Чи є у вас якась звичка, яка може бути незвичною/дратівливою для інших?",
  },
  {
    id: 2,
    questionText: "Як ви ставитеся до поділу/спільного використання продуктів?",
  },
  {
    id: 3,
    questionText:
      "Як ви ставитеся до накопичення особистих речей та одягу у кімнаті?",
  },
  { id: 4, questionText: "Яка ваша частота прибирання власного простору?" },
  { id: 5, questionText: "Який ваш типовий режим сну у будні дні?" },
  { id: 6, questionText: "Чи є у вас підтверджена алергія на щось?" },
  { id: 7, questionText: "Який ваш улюблений спосіб релаксу?" },
  { id: 8, questionText: "Як часто ви плануєте запрошувати гостей?" },
  { id: 9, questionText: "Як організувати прибирання спільних зон?" },
  { id: 10, questionText: "Спільні витрати на побутові речі?" },
  { id: 11, questionText: "Ставлення до розмов по телефону в кімнаті?" },
  { id: 12, questionText: "Улюблений жанр музики?" },
  { id: 13, questionText: "Атмосфера для навчання?" },
  { id: 14, questionText: "Умови для сну?" },
  { id: 15, questionText: "Вільний вечір у будній день?" },
];

const SearchRoommate = ({ user }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [userAnswers, setUserAnswers] = useState(
    location.state?.userAnswers || null,
  );
  const [loading, setLoading] = useState(true);

  // 1. Стан для аватара
  const [avatar, setAvatar] = useState("");
  // 2. Стан для імені та прізвища
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [instagram, setInstagram] = useState("");
  const [telegram, setTelegram] = useState("");
  const [isLookingForRoom, setIsLookingForRoom] = useState(false);

  const [fileName, setFileName] = useState("");

  const [photoAccess, setPhotoAccess] = useState("");
  const [sendAllow, setSendAllow] = useState("");
  const [hideActivity, setHideActivity] = useState("");

  const [friendsQuery, setFriendsQuery] = useState("");
  const [friendsActivity, setFriendsActivity] = useState("");
  const [showMessages, setShowMessages] = useState("");

  const [imageToCrop, setImageToCrop] = useState(null); // Фото, яке обрізаємо
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null); // Координати
  const [showCropper, setShowCropper] = useState(false); // Чи показувати модалку

  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);

  // Заміни свої useEffect на цей один цілісний блок завантаження
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setLoading(true);
        try {
          const userDoc = await getDoc(doc(db, "users", currentUser.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();

            // Завжди оновлюємо ці поля, незалежно від того, чи прийшли ми з тесту
            setFirstName(data.firstName || "");
            setLastName(data.lastName || "");
            setInstagram(data.instagram || "");
            setTelegram(data.telegram || "");
            setAvatar(data.avatar || null);
            setIsLookingForRoom(data.status || "");

            // Конфіденційність
            setPhotoAccess(data.photoAccess ?? false);
            setSendAllow(data.sendAllow ?? false);
            setHideActivity(data.hideActivity ?? false);

            // Повідомлення
            setFriendsQuery(data.friendsQuery ?? false);
            setFriendsActivity(data.friendsActivity ?? false);
            setShowMessages(data.showMessages ?? false);

            // Якщо в location.state є нові відповіді з тесту - беремо їх,
            // якщо немає - беремо старі з бази
            if (location.state?.userAnswers) {
              setUserAnswers(location.state.userAnswers);
            } else if (data.answers) {
              setUserAnswers(data.answers);
            }
          }
        } catch (error) {
          console.error("Помилка завантаження даних:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [location.state]); // Додаємо залежність від location, щоб реагувати на повернення з тесту

  useEffect(() => {
    if (window.bootstrap) {
      let tooltipList = [];

      // Даємо React трохи часу, щоб відмалювати елементи в DOM
      const timeout = setTimeout(() => {
        const tooltipTriggerList = document.querySelectorAll(
          '[data-bs-toggle="tooltip"]',
        );
        tooltipList = [...tooltipTriggerList].map(
          (tooltipTriggerEl) => new window.bootstrap.Tooltip(tooltipTriggerEl),
        );
      }, 100); // 100 мілісекунд зазвичай достатньо

      return () => {
        clearTimeout(timeout);
        tooltipList.forEach((instance) => instance.dispose());
      };
    }
  }, [userAnswers]); // Запускаємо, коли змінюються дані userAnswers (і відповідно перемальовується HTML)

  // Видаляч файлу аватара профілю
  const deleteFile = () => {
    setAvatar(null);
    setFileName("Файл не вибрано"); // Повертаємо текст за замовчуванням
    localStorage.removeItem("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleProfileUpdate = async (event, setter, fieldName) => {
    const inputValue = event.target.value;
    let cleanedValue = inputValue;

    if (fieldName === "firstName" || fieldName === "lastName") {
      const cyrillicRegex = /[^А-Яа-яЄєІіЇїҐґ'\s-]/g;
      cleanedValue = inputValue.replace(cyrillicRegex, "");
    }

    setter(cleanedValue);

    const currentUser = auth.currentUser;
    if (currentUser) {
      try {
        const userRef = doc(db, "users", currentUser.uid);
        await updateDoc(userRef, {
          [fieldName]: cleanedValue,
        });
      } catch (error) {
        console.error("Помилка збереження в Firestore:", error);
      }
    }
  };

  // Обробник зміни файлу (оновлено для збереження назви)
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImageToCrop(reader.result);
        setShowCropper(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSaveCrop = async () => {
    const croppedImage = await getCroppedImg(imageToCrop, croppedAreaPixels);
    setAvatar(croppedImage);
    setShowCropper(false);

    // Зберігаємо в Firestore
    const currentUser = auth.currentUser;
    if (currentUser) {
      const userRef = doc(db, "users", currentUser.uid);
      await updateDoc(userRef, { avatar: croppedImage });
    }
  };

  const handleToggleChange = async (setter, fieldName, value) => {
    // 1. Оновлюємо стан у React
    setter(value);

    // 2. Зберігаємо у Firebase
    const currentUser = auth.currentUser;
    if (currentUser) {
      try {
        const userRef = doc(db, "users", currentUser.uid);
        await updateDoc(userRef, {
          [fieldName]: value,
        });
      } catch (error) {
        console.error(`Помилка збереження налаштування ${fieldName}:`, error);
      }
    }
  };

  const handleGoTest = () => {
    navigate("/test");
  };

  const handleStatusChange = async (e) => {
    const isLooking = e.target.checked;

    // 1. Оновлюємо локальний стейт (щоб текст на сайті змінився відразу)
    setIsLookingForRoom(isLooking);

    const currentUser = auth.currentUser;
    if (currentUser) {
      const newStatusString = isLooking ? "Шукаю кімнату" : "Не шукаю";
      try {
        const userRef = doc(db, "users", currentUser.uid);
        // 2. Оновлюємо саме в базі даних
        await updateDoc(userRef, {
          status: newStatusString,
        });
        console.log("Статус оновлено в БД на:", newStatusString);
      } catch (error) {
        console.error("Помилка збереження статусу в Firebase:", error);
        // Якщо в базі не збереглося — повертаємо стейт назад
        setIsLookingForRoom(!isLooking);
      }
    }
  };

  return (
    <div>
      <Header user={user} />

      <div className="profile rounded-5 p-4 p-md-5 mb-5 mt-4 custom-shadow">
        <div className="col-12">
          <h1 className="mb-5 fw-bold text-start">Налаштування профілю</h1>

          {/* Блок Аватара як на макеті */}
          {/* Блок Аватара з адаптивними кнопками */}
          <div className="row align-items-center mb-5 gy-4">
            {/* Ліва частина: Аватар та Ім'я */}
            <div className="col-12 col-md-auto d-flex align-items-center gap-4">
              <img
                src={avatar || defaultUser}
                alt="Фото користувача"
                className="rounded-circle custom-avatar border"
              />
              <div>
                <h3 className="mb-1 fw-bold">
                  {firstName || "Ім'я"} {lastName || "Прізвище"}
                </h3>
                <span className="text-secondary">Змініть фото профілю</span>
              </div>
            </div>

            {/* Права частина: Кнопки (на десктопі справа, на мобілці - знизу) */}
            <div className="col-12 col-md d-flex justify-content-md-end ">
              <div className="d-flex flex-wrap gap-2 w-100 w-md-auto justify-content-end">
                <button
                  className="btn btn-action-light fw-semibold rounded-pill px-3 px-sm-4 py-2 flex-grow-1 flex-md-grow-0"
                  onClick={deleteFile}
                >
                  Видалити
                </button>
                <label className="btn btn-action-primary fw-semibold rounded-pill px-3 px-sm-4 py-2 m-0 cursor-pointer flex-grow-1 flex-md-grow-0 text-center">
                  Завантажити фото
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={handleFileChange}
                    ref={fileInputRef}
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Особиста інформація */}
          <div className="mb-5">
            <h4 className="fw-bold mb-4">Особиста інформація</h4>

            <div className="row mb-4">
              <div className="col-12 col-md-6 col-xl-5">
                <div className="set-card d-flex justify-content-between align-items-center m-0">
                  <div>
                    <h6 className="mb-1">Мій статус пошуку</h6>
                    <span
                      className={
                        isLookingForRoom
                          ? "text-success fw-bold"
                          : "text-secondary"
                      }
                    >
                      {isLookingForRoom ? "Шукаю кімнату" : "Не шукаю"}
                    </span>
                  </div>
                  <div className="form-check form-switch m-0">
                    <input
                      className="form-check-input custom-switch"
                      type="checkbox"
                      checked={isLookingForRoom}
                      onChange={handleStatusChange}
                      style={{ cursor: "pointer" }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="row g-4">
              <div className="col-md-6">
                <label className="form-label text-secondary">Ім'я</label>
                <input
                  type="text"
                  className="form-control rounded-4 p-3"
                  value={firstName}
                  onChange={(e) =>
                    handleProfileUpdate(e, setFirstName, "firstName")
                  }
                />
              </div>
              <div className="col-md-6">
                <label className="form-label text-secondary">Прізвище</label>
                <input
                  type="text"
                  className="form-control rounded-4 p-3"
                  value={lastName}
                  onChange={(e) =>
                    handleProfileUpdate(e, setLastName, "lastName")
                  }
                />
              </div>
              <div className="col-md-6">
                <label className="form-label text-secondary">Телеграм</label>
                <input
                  type="text"
                  className="form-control rounded-4 p-3"
                  value={telegram}
                  onChange={(e) =>
                    handleProfileUpdate(e, setTelegram, "telegram")
                  }
                />
              </div>
              <div className="col-md-6">
                <label className="form-label text-secondary">Інстаграм</label>
                <input
                  type="text"
                  className="form-control rounded-4 p-3"
                  value={instagram}
                  onChange={(e) =>
                    handleProfileUpdate(e, setInstagram, "instagram")
                  }
                />
              </div>
            </div>
          </div>
        </div>

        <div className="row my-features p-2">
          {/* Звички та налаштування */}
          <div className="col-12 col-xxl-6 col-xl-6 col-md-12 col-sm-12 flex-wrap mb-4 ">
            <div className="mb-5">
              <h4 className="fw-bold mb-3">Мої звички:</h4>
              {userAnswers ? (
                <div className="d-flex flex-wrap gap-2">
                  {Object.keys(userAnswers).map((questionId) => {
                    const answer = userAnswers[questionId];
                    const currentQuestion = questions.find(
                      (q) => q.id == questionId,
                    );
                    return (
                      <div key={questionId} className="m-1 d-inline-block">
                        <span
                          className="badge badge-custom fs-6 px-3 py-2 text-wrap fw-normal"
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
                  <div className="w-100 mt-4">
                    <Link className="btn btn-dark rounded-pill px-4" to="/test">
                      Перепройти тест
                    </Link>
                  </div>
                </div>
              ) : (
                <div>
                  <h5 className="text-warning mb-3">
                    Ви не пройшли тест на звички
                  </h5>
                  <button
                    className="btn btn-action-primary rounded-pill px-4 py-2"
                    onClick={handleGoTest}
                  >
                    Пройти тест
                  </button>
                </div>
              )}
            </div>

            <div className="user-settings">
              {/* Налаштування конфіденційності */}
              <div className="privacy-sets mb-5">
                <div className="d-flex align-items-center gap-3 mb-4">
                  <div className="icon-block">
                    <i className="bi bi-file-lock fs-5"></i>
                  </div>
                  <h4 className="m-0 fw-bold">Налаштування конфіденційності</h4>
                </div>

                <div className="set-card d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="mb-1">Хто може бачити мої фотографії</h6>
                    <small className="text-secondary">
                      {photoAccess ? "Всі користувачі" : "Ніхто"}
                    </small>
                  </div>
                  <div className="form-check form-switch">
                    <input
                      className="form-check-input custom-switch"
                      type="checkbox"
                      checked={photoAccess}
                      onChange={(e) =>
                        handleToggleChange(
                          setPhotoAccess,
                          "photoAccess",
                          e.target.checked,
                        )
                      }
                    />
                  </div>
                </div>

                <div className="set-card d-flex justify-content-between align-items-center mt-3">
                  <div>
                    <h6 className="mb-1">
                      Хто може надсилати мені повідомлення
                    </h6>
                    <small className="text-secondary">
                      {sendAllow ? "Всі" : "Лише взаємні контакти"}
                    </small>
                  </div>
                  <div className="form-check form-switch">
                    <input
                      className="form-check-input custom-switch"
                      type="checkbox"
                      checked={sendAllow}
                      onChange={(e) =>
                        handleToggleChange(
                          setSendAllow,
                          "sendAllow",
                          e.target.checked,
                        )
                      }
                    />
                  </div>
                </div>

                <div className="set-card d-flex justify-content-between align-items-center mt-3">
                  <div>
                    <h6 className="mb-1">Приховати мою активність</h6>
                    <small className="text-secondary">
                      {hideActivity ? "Статус невидимий" : "Статус видимий"}
                    </small>
                  </div>
                  <div className="form-check form-switch">
                    <input
                      className="form-check-input custom-switch"
                      type="checkbox"
                      checked={hideActivity}
                      onChange={(e) =>
                        handleToggleChange(
                          setHideActivity,
                          "hideActivity",
                          e.target.checked,
                        )
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Налаштування повідомлень */}
              <div className="message-sets">
                <div className="d-flex align-items-center gap-3 mb-4">
                  <div className="icon-block">
                    <i className="bi bi-bell fs-5"></i>
                  </div>
                  <h4 className="m-0 fw-bold">Налаштування повідомлень</h4>
                </div>

                <div className="set-card d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="mb-1">Нові повідомлення в чаті</h6>
                    <small className="text-secondary">
                      Push-сповіщення, E-mail
                    </small>
                  </div>
                  <div className="form-check form-switch">
                    <input
                      className="form-check-input custom-switch"
                      type="checkbox"
                      checked={showMessages}
                      onChange={(e) =>
                        handleToggleChange(
                          setShowMessages,
                          "showMessages",
                          e.target.checked,
                        )
                      }
                    />
                  </div>
                </div>

                <div className="set-card d-flex justify-content-between align-items-center mt-3">
                  <div>
                    <h6 className="mb-1">Запити на додавання в друзі</h6>
                    <small className="text-secondary">Push-сповіщення</small>
                  </div>
                  <div className="form-check form-switch">
                    <input
                      className="form-check-input custom-switch"
                      type="checkbox"
                      checked={friendsQuery}
                      onChange={(e) =>
                        handleToggleChange(
                          setFriendsQuery,
                          "friendsQuery",
                          e.target.checked,
                        )
                      }
                    />
                  </div>
                </div>

                <div className="set-card d-flex justify-content-between align-items-center mt-3">
                  <div>
                    <h6 className="mb-1">Активність друзів</h6>
                    <small className="text-secondary">
                      {friendsActivity ? "Увімкнено" : "Вимкнено"}
                    </small>
                  </div>
                  <div className="form-check form-switch">
                    <input
                      className="form-check-input custom-switch"
                      type="checkbox"
                      checked={friendsActivity}
                      onChange={(e) =>
                        handleToggleChange(
                          setFriendsActivity,
                          "friendsActivity",
                          e.target.checked,
                        )
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Спільні інтереси */}
          <div className="col-12 col-xxl-6 col-xl-6 col-md-12 col-sm-12 simil-block mt-5 mt-xl-0 ">
            <h4 className="fw-bold text-xl-end mb-4">Спільні інтереси:</h4>
            <div className="list-of-users custom-scroll">
              {userAnswers ? (
                <div className="w-100 pe-2">
                  {users.map((user) => (
                    <UserForRoom
                      key={user.id}
                      userAnswers={userAnswers}
                      user={user}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-xl-end">
                  <h5 className="text-secondary mb-3">
                    У вас немає спільних інтересів, так як ви не пройшли тест!
                  </h5>
                  <button
                    className="btn btn-action-primary rounded-pill px-4 py-2"
                    onClick={handleGoTest}
                  >
                    Пройти тест
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showCropper && (
        <div className="custom-cropper-modal">
          <div className="cropper-container">
            <Cropper
              image={imageToCrop}
              crop={crop}
              zoom={zoom}
              aspect={1}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={(_, pixels) => setCroppedAreaPixels(pixels)}
            />
          </div>
          <div className="cropper-controls">
            <button
              className="btn btn-secondary"
              onClick={() => setShowCropper(false)}
            >
              Скасувати
            </button>
            <button className="btn btn-primary" onClick={onSaveCrop}>
              Зберегти
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchRoommate;
