import React, { useState, useEffect, useRef } from "react";
import Header from "../components/Header";
import { useLocation, useNavigate } from "react-router-dom";
import "../css/profile.scss";
import defaultUser from "../img/profile/user.jpg";
import UserForRoom from "../components/UserForRoom";
import "../css/forms.scss";
import { Link } from "react-router-dom";
const users = [
  // ІСНУЮЧІ КОРИСТУВАЧІ (З НЕЗНАЧНИМИ КОРЕКЦІЯМИ ВІДПОВІДЕЙ)
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
  // НОВІ КОРИСТУВАЧІ ДЛЯ МАКСИМАЛЬНОЇ РІЗНОМАНІТНОСТІ
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
// Ключі для localStorage

const STORAGE_KEY_AVATAR = "userAvatarBase64";
const STORAGE_KEY_FIRST_NAME = "userFirstName";
const STORAGE_KEY_LAST_NAME = "userLastName";

const STORAGE_KEY_PHOTO_ACCESS = "userPhotoAccess";
const STORAGE_KEY_SEND_ALLOW = "userSendAllow";
const STORAGE_KEY_HIDE_ACTIVITY = "userHideActivity";

const STORAGE_KEY_FRIENDS_ACTIVITY = "userFriendsActivity";
const STORAGE_KEY_FRIENDS_QUERY = "userFriendsQuery";
const STORAGE_KEY_SHOW_MESSAGES = "userShowMessages";

// Новий ключ для збереження назви файлу
const STORAGE_KEY_FILE_NAME = "userFileName";


const STORAGE_KEY_INST = "instagram";
const STORAGE_KEY_TG = "telegram";

const SearchRoommate = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const fileInputRef = useRef(null);

  const { userAnswers, questions } = location.state || {};

  const [instagram, setInstagram] = useState(
    localStorage.getItem(STORAGE_KEY_INST)
  );
  const [telegram, setTelegram] = useState(
    localStorage.getItem(STORAGE_KEY_TG)
  );



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

  // стан тумблерів налаштувань сповіщень
  const [photoAccess, setPhotoAccess] = useState(
    localStorage.getItem(STORAGE_KEY_PHOTO_ACCESS) === "true"
  );
  const [sendAllow, setSendAllow] = useState(
    localStorage.getItem(STORAGE_KEY_SEND_ALLOW) === "true"
  );
  const [hideActivity, setHideActivity] = useState(
    localStorage.getItem(STORAGE_KEY_HIDE_ACTIVITY) === "true"
  );

  // стан тумблерів налаштувань сповіщень
  const [friendsQuery, setFriendsQuery] = useState(
    localStorage.getItem(STORAGE_KEY_FRIENDS_QUERY) === "true"
  );
  const [friendsActivity, setFriendsActivity] = useState(
    localStorage.getItem(STORAGE_KEY_FRIENDS_ACTIVITY) === "true"
  );
  const [showMessages, setShowMessages] = useState(
    localStorage.getItem(STORAGE_KEY_SHOW_MESSAGES) === "true"
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

  // Хук для автоматичного збереження при зміні стану
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PHOTO_ACCESS, photoAccess);
  }, [photoAccess]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SEND_ALLOW, sendAllow);
  }, [sendAllow]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_HIDE_ACTIVITY, hideActivity);
  }, [hideActivity]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_FRIENDS_ACTIVITY, friendsActivity);
  }, [friendsActivity]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_FRIENDS_QUERY, friendsQuery);
  }, [friendsQuery]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SHOW_MESSAGES, showMessages);
  }, [showMessages]);


  
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_TG, telegram);
  }, [telegram]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_INST, instagram);
  }, [instagram]);

  // Видаляч файлу аватара профілю
  const deleteFile = () => {
    setAvatar(null);
    localStorage.removeItem(STORAGE_KEY_AVATAR);
    setFileName("Файл не вибрано"); // Повертаємо текст за замовчуванням
    localStorage.removeItem(STORAGE_KEY_FILE_NAME);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };
  // Обробник змін для текстових інпутів
  const handleNameChange = (event, setter) => {
    const inputValue = event.target.value;

    const cyrillicRegex = /[^А-Яа-яЄєІіЇїҐґ'\s-]/g;

    const cleanedValue = inputValue.replace(cyrillicRegex, "");

    setter(cleanedValue);
  };

  // Обробник зміни файлу (оновлено для збереження назви)
  const handleFileChange = (event) => {
    const files = event.target.files;

    if (files.length === 0) {
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
      deleteFile();
    }
  };

  const handleGoTest = () => {
    navigate("/test");
  };

  // Функція для зміни стану при кліку
  const handlePhotoAccessChange = (e) => {
    setPhotoAccess(e.target.checked);
  };

  const handleSendAllowChange = (e) => {
    setSendAllow(e.target.checked);
  };

  const handleHideActivityChange = (e) => {
    setHideActivity(e.target.checked);
  };


  const handleActivityChange = (e) => {
    setFriendsActivity(e.target.checked);
  };

  const handleFriendsQueryChange = (e) => {
    setFriendsQuery(e.target.checked);
  };

  const handleShowMessagesChange = (e) => {
    setShowMessages(e.target.checked);
  };


  const handleTelegram = (e) => {
    setTelegram(e.target.value);
  };
  const handleInstagram = (e) => {
    setInstagram(e.target.value);
  };
  return (
    <div>
      <Header />

      <div className="profile row rounded-4 p-3 mb-5">
        <div className="col-12 d-flex justify-content-center flex-column">
          <h1 className="mb-3">Ваш профіль</h1>

          <div className="user-avatar-block mb-3">
            <img src={avatar || defaultUser} alt="Фото користувача" />
          </div>
          {/* 4. Оновлена верстка для поля вводу файлу */}

          <div className="row d-flex justify-content-center ">
            <div className="col-12 file-choose">
              <div className="input-group  mb-3">
                <input
                  type="file"
                  accept="image/*"
                  className="form-control" // Ховаємо стандартне поле
                  onChange={handleFileChange}
                  id="inputGroupFile02"
                  ref={fileInputRef}
                />
                <button
                  className="btn btn-outline-secondary"
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
          <div className="row">
            <div className="col-12 col-xxl-3 col-xl-5 col-lg-6 col-md-6 col-sm-7 mb-3 mx-auto">
              <div className="input-group mx-auto">
                <span className="input-group-text">Телеграм</span>
                <input
                  type="text"
                  aria-label="Last name"
                  className="form-control"
                  value={telegram}
                  onChange={(e) => handleTelegram(e, setTelegram)}
                />
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-12 col-xxl-3 col-xl-5 col-lg-6 col-md-6 col-sm-7 mb-3 mx-auto">
              <div className="input-group mx-auto">
                <span className="input-group-text">Інстаграм</span>
                <input
                  type="text"
                  aria-label="Last name"
                  className="form-control"
                  value={instagram}
                  onChange={(e) => handleInstagram(e, setInstagram)}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="row my-features p-2">
          <div className="col-12 col-xxl-6 col-xl-6 col-md-12 col-sm-12 flex-wrap mb-4">
            <>
              <h3>Мої звички:</h3>
              {userAnswers ? (
                <div className="d-flex flex-wrap">
                  {/* ✅ ЗМІНЕНО: Ітеруємо по ключах (ID питань) userAnswers */}
                  {Object.keys(userAnswers).map((questionId) => {
                    const answer = userAnswers[questionId];
                    // Знаходимо повний об'єкт питання за його ID
                    const currentQuestion = questions.find(
                      (q) => q.id == questionId
                    );

                    return (
                      // Використовуємо questionId як ключ
                      <div key={questionId} className="m-1">
                        <span
                          className="badge fs-6 text-wrap"
                          data-bs-toggle="tooltip"
                          data-bs-title={
                            currentQuestion
                              ? currentQuestion.questionText
                              : "Питання"
                          }
                        >
                          {answer} {/* Тут виводиться текст відповіді */}
                        </span>
                      </div>
                    );
                  })}
                  <div className="w-100 mt-3">
                    <h4 className="mb-3">Не подобається результат?</h4>
                    <Link
                      className="rounded-3 test-again fs-5 pe-auto"
                      to="/test"
                    >
                      Перепройти тест
                    </Link>
                  </div>
                </div> /* <--- КІНЕЦЬ ОБГОРТКИ */
              ) : (
                // Блок, якщо відповідей немає (else)
                <div>
                  <h5 className="text-warning">
                    Ви не пройшли тест на звички{" "}
                    <i className="bi bi-arrow-down"></i>
                  </h5>
                  <button className="start-test" onClick={handleGoTest}>
                    Пройти тест
                  </button>
                </div>
              )}
            </>

            <div className="user-settings mt-5">
              <div className="privacy-sets">
                <div className="message-sets-header gap-2 d-flex align-items-center align-items-center">
                  <div className="icon-block p-0 m-0 flex-shrink-0">
                    <i className="bi bi-file-lock fs-4"></i>
                  </div>
                  <h3 className="m-0">Налаштування конфіденційності</h3>
                </div>

                <div className="set">
                  <div className="form-check form-switch form-check-reverse d-flex gap-3 justify-content-between align-items-center">
                    <div className="d-flex flex-column text-start">
                      <label className="form-check-label" htmlFor="switch4">
                        Хто може бачити мої фотографії
                      </label>
                      <p className="p-0 m-0 text-secondary">
                        {photoAccess ? "Всі користувачі" : "Ніхто"}
                      </p>
                    </div>
                    <input
                      className="form-check-input fs-5"
                      type="checkbox"
                      role="switch"
                      id="switch4"
                      checked={photoAccess}
                      onChange={handlePhotoAccessChange}
                    />
                  </div>
                </div>
                <div className="set">
                  <div className="form-check form-switch form-check-reverse d-flex gap-3 justify-content-between align-items-center">
                    <div className="d-flex flex-column text-start">
                      <label className="form-check-label" htmlFor="switch5">
                        Хто може надсилати мені повідомлення
                      </label>
                      <p className="p-0 m-0 text-secondary">
                        {sendAllow
                          ? "Всі можуть надсилати"
                          : "Лише взаємні контакти"}
                      </p>
                    </div>
                    <input
                      className="form-check-input fs-5"
                      type="checkbox"
                      role="switch"
                      id="switch5"
                      checked={sendAllow}
                      onChange={handleSendAllowChange}
                    />
                  </div>
                </div>
                <div className="set">
                  <div className="form-check form-switch form-check-reverse d-flex gap-3 justify-content-between align-items-center">
                    <div className="d-flex flex-column text-start">
                      <label className="form-check-label" htmlFor="switch6">
                        Приховати мою активність
                      </label>
                      <p className="p-0 m-0 text-secondary">
                        {hideActivity
                          ? "Ваш статус буде невидимим"
                          : "Ваш статус буде видимим"}
                      </p>
                    </div>
                    <input
                      className="form-check-input fs-5"
                      type="checkbox"
                      role="switch"
                      id="switch6"
                      checked={hideActivity}
                      onChange={handleHideActivityChange}
                    />
                  </div>
                </div>
              </div>

              <div className="message-sets">
                <div className="message-sets-header gap-2 d-flex align-items-center">
                  <div className="icon-block p-0 m-0">
                    <i className="bi bi-chat-dots fs-4"></i>
                  </div>
                  <h3 className="m-0">Налаштування сповіщень</h3>
                </div>

                <div className="set">
                  <div className="form-check form-switch form-check-reverse d-flex gap-3 justify-content-between align-items-center">
                    <div className="d-flex flex-column text-start">
                      <label className="form-check-label" htmlFor="switch1">
                        Нові повідомлення в чаті
                      </label>
                      <p className="m-0 p-0 text-secondary">
                        Push-сповіщення, E-mail
                      </p>
                    </div>

                    <input
                      className="form-check-input fs-5"
                      type="checkbox"
                      role="switch"
                      id="switch1"
                      checked={showMessages}
                      onChange={handleShowMessagesChange}
                    />
                  </div>
                </div>
                <div className="set">
                  <div className="form-check form-switch form-check-reverse d-flex gap-3 justify-content-between align-items-center">
                    <div className="d-flex flex-column text-start">
                      <label className="form-check-label" htmlFor="switch2">
                        Запити на додавання в друзі
                      </label>
                      <p className="p-0 m-0 text-secondary">Push-сповіщення</p>
                    </div>
                    <input
                      className="form-check-input fs-5"
                      type="checkbox"
                      role="switch"
                      id="switch2"
                      checked={friendsQuery}
                      onChange={handleFriendsQueryChange}
                    />
                  </div>
                </div>
                <div className="set">
                  <div className="form-check form-switch form-check-reverse d-flex gap-3 justify-content-between align-items-center">
                    <div className="d-flex flex-column text-start">
                      <label className="form-check-label" htmlFor="switch3">
                        Активність друзів
                      </label>
                      <p className="p-0 m-0 text-secondary">
                        {friendsActivity ? "Увімкнено" : "Вимкнено"}
                      </p>
                    </div>
                    <input
                      className="form-check-input fs-5"
                      type="checkbox"
                      role="switch"
                      id="switch3"
                      checked={friendsActivity}
                      onChange={handleActivityChange}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-12 col-xxl-6 col-xl-6 col-md-12 col-sm-12 simil-block">
            <h3 className="text-end">Спільні інтереси:</h3>
            <div className="list-of-users">
              <>
              {
               userAnswers ? (<div className="border border-dark border-top-0 border-bottom-0">
                 {users.map((user) => (
                <UserForRoom
                  key={user.id}
                  userAnswers={userAnswers}
                  user={user}
                />
              ))}
               </div>) : (

                <div className="text-end">
                  <h5>У вас немає спільних інтересів, так як ви не пройшли тест!</h5>
                   <button className="start-test w-50" onClick={handleGoTest}>
                    Пройти тест
                  </button>
                </div>

               )
              }
              
              </>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchRoommate;
