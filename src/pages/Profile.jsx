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
import { signOut } from "firebase/auth";

import Cropper from "react-easy-crop";
import { getCroppedImg } from "../utils/cropImage"; // Перевір, щоб шлях до файлу був правильним

// import functions //
import {
  deleteFile,
  handleFileChange,
  handleLogout,
  handleStatusChange,
  handleProfileUpdate,
  handleGoTest,
  handleToggleChange,
  onSaveCrop,
} from "../utils/functions.jsx";

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
                  onClick={() =>
                    deleteFile(setAvatar, setFileName, fileInputRef)
                  }
                >
                  Видалити
                </button>
                <label className="btn btn-action-primary fw-semibold rounded-pill px-3 px-sm-4 py-2 m-0 cursor-pointer flex-grow-1 flex-md-grow-0 text-center">
                  Завантажити фото
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(e) =>
                      handleFileChange(e, setImageToCrop, setShowCropper)
                    }
                    ref={fileInputRef}
                  />
                </label>
              </div>
            </div>
            <div className=" d-flex justify-content-center align-items-center w-100">
              <div className="logOut-block col-12 col-md-4 col-lg-3 col-xl-2 d-flex justify-content-start align-items-center ">
                <button
                  onClick={() => handleLogout(navigate)}
                  className="btn btn-link w-100 fw-semibold rounded-pill btn btn-action-primary_logOut border-0 p-2 rounded-4"
                  style={{ textDecoration: "none" }}
                >
                  Вийти
                </button>
              </div>
            </div>
          </div>

          {/* Особиста інформація */}
          <div className="mb-5">
            <h4 className="fw-bold mb-4">Особиста інформація</h4>

            <div className="row mb-4">
              <div className="col-12 col-md-6 col-xl-4">
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
                      onChange={(e) =>
                        handleStatusChange(e, setIsLookingForRoom)
                      }
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
                    handleProfileUpdate(
                      e.target.value,
                      "firstName",
                      setFirstName,
                      auth.currentUser,
                    )
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
                    handleProfileUpdate(
                      e.target.value,
                      "lastName",
                      setLastName,
                      auth.currentUser,
                    )
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
                    handleProfileUpdate(
                      e.target.value,
                      "telegram",
                      setTelegram,
                      auth.currentUser,
                    )
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
                    handleProfileUpdate(
                      e.target.value,
                      "instagram",
                      setInstagram,
                      auth.currentUser,
                    )
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
                    onClick={() => handleGoTest(navigate)}
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
            <h4 className="fw-bold text-xl-end mb-4">Мої фотографії:</h4>
            <div className="list-of-users custom-scroll"></div>
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
            <button
              className="btn btn-primary"
              onClick={() =>
                onSaveCrop(
                  imageToCrop,
                  croppedAreaPixels,
                  setAvatar,
                  setShowCropper,
                )
              }
            >
              Зберегти
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchRoommate;
