import React, { useState, useEffect, useRef } from "react";
import Header from "../components/Header";
import { useLocation, useNavigate } from "react-router-dom";
import "../css/profile.scss";
import defaultUser from "../img/profile/user.jpg";
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
  deleteGalleryImage,
  handleGalleryUpload,
  handleUsernameBlur,
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

  // Десь біля інших станів
  const [username, setUsername] = useState("");
  const [usernameError, setUsernameError] = useState("");

  // Не забудь імпортувати handleUsernameBlur з functions.jsx!

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [gender, setGender] = useState("");
  const [bio, setBio] = useState("");

  const [instagram, setInstagram] = useState("");
  const [telegram, setTelegram] = useState("");
  const [isLookingForRoom, setIsLookingForRoom] = useState(false);

  const [fileName, setFileName] = useState("");

  const [gallery, setGallery] = useState([]);

  const [photoAccess, setPhotoAccess] = useState("");
  const [sendAllow, setSendAllow] = useState("");
  const [hideActivity, setHideActivity] = useState("");

  const [friendsQuery, setFriendsQuery] = useState("");
  const [friendsActivity, setFriendsActivity] = useState("");
  const [showMessages, setShowMessages] = useState("");

  const [isHabitsOpen, setIsHabitsOpen] = useState(false);
  const [isPhotosOpen, setIsPhotosOpen] = useState(false);

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
            setUsername(data.username || "");

            setFirstName(data.firstName || "");
            setLastName(data.lastName || "");
            setGender(data.gender || "male");
            setBio(data.bio || "");

            setInstagram(data.instagram || "");
            setTelegram(data.telegram || "");
            setAvatar(data.avatar || null);
            setIsLookingForRoom(data.status || "");

            setGallery(data.gallery || []);

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
      <div className="profile rounded-5 p-4 p-md-5 mb-5 mt-4 custom-shadow">
        <div className="w-100">
          <div className="d-flex justify-content-between align-items-center mb-4 m-0">
            <h2 className="fw-bold m-0">Налаштування профілю</h2>
            <button
              onClick={() => handleLogout(navigate)}
              className="btn btn-outline-primary btn-sm rounded-pill px-3 py-1 fw-semibold"
            >
              Вийти
            </button>
          </div>

          
          <div
            className="d-flex flex-wrap justify-content-between align-items-center p-3 rounded-4 mb-4 gap-3"
            style={{
              backgroundColor: "var(--bg-secondary, #1a1a1e)",
              border:
                "var(--custom-card-border, 1px solid rgba(255, 255, 255, 0.08))",
            }}
          >
            <div className="d-flex align-items-center gap-3">
              <img
                src={avatar || defaultUser}
                alt="Аватар"
                className="rounded-circle object-fit-cover shadow-sm"
                style={{
                  width: "66px",
                  height: "66px",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              />
              <div>
                <div
                  className="fw-bold text-truncate"
                  style={{ maxWidth: "220px" }}
                >
                  @{username || "username"}
                </div>
                <div className="small text-secondary">
                  {firstName || lastName
                    ? `${firstName} ${lastName}`.trim()
                    : "Ім'я не вказано"}
                </div>
              </div>
            </div>

            <div className="d-flex align-items-center gap-2 new-ava-btn">
              {/* {avatar && (
                <button
                  className="btn-action-light fw-semibold rounded-pill px-3 px-sm-4 py-2 flex-grow-1 flex-md-grow-0"
                  onClick={() =>
                    deleteFile(setAvatar, setFileName, fileInputRef)
                  }
                >
                  Видалити
                </button>
              )} */}
              <label className="btn btn-action-primary fw-semibold rounded-pill px-3 px-sm-4 py-2 m-0 cursor-pointer flex-grow-1 flex-md-grow-0 text-center text-white">
                Нове фото
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

          {/* Форма налаштувань профілю */}
          <div className="mb-5">
            <h5 className="fw-bold mb-3">Особисті дані</h5>

            <div className="row g-3 mb-3">
              {/* Логін */}
              <div className="col-12 col-md-6">
                <label className="form-label small fw-bold text-secondary mb-1">
                  Унікальний логін <span className="text-danger">*</span>
                </label>
                <div className="input-group">
                  <span
                    className="input-group-text border-0 text-secondary rounded-start-3"
                    style={{ backgroundColor: "var(--bg-input, #232328)" }}
                  >
                    @
                  </span>
                  <input
                    type="text"
                    className={`form-control border-0 px-3 py-2 rounded-end-3 ${usernameError ? "is-invalid" : ""}`}
                    style={{
                      backgroundColor: "var(--bg-input, #232328)",
                      color: "var(--text-main)",
                    }}
                    placeholder="username"
                    value={username}
                    onChange={(e) => {
                      const validValue = e.target.value
                        .toLowerCase()
                        .replace(/[^a-z0-9_]/g, "");
                      setUsername(validValue);
                      setUsernameError("");
                    }}
                    onBlur={() =>
                      handleUsernameBlur(
                        username,
                        auth.currentUser,
                        setUsernameError,
                      )
                    }
                  />
                </div>
                {usernameError && (
                  <div className="text-danger mt-1 small">{usernameError}</div>
                )}
              </div>

              {/* Стать (Gender) */}
              <div className="col-12 col-md-6">
                <label className="form-label small fw-bold text-secondary mb-1">
                  Стать
                </label>
                <select
                  className="form-select border-0 px-3 py-2 rounded-3"
                  style={{
                    backgroundColor: "var(--bg-input, #232328)",
                    color: "var(--text-main)",
                    cursor: "pointer",
                    boxShadow: "none",
                  }}
                  value={gender}
                  onChange={(e) =>
                    handleProfileUpdate(
                      e.target.value,
                      "gender",
                      setGender,
                      auth.currentUser,
                    )
                  }
                >
                  <option value="male">Чоловіча</option>
                  <option value="female">Жіноча</option>
                  <option value="other">Інша / Не вказувати</option>
                </select>
              </div>

              {/* Ім'я */}
              <div className="col-12 col-md-6">
                <label className="form-label small fw-bold text-secondary mb-1">
                  Ім'я
                </label>
                <input
                  type="text"
                  className="form-control border-0 px-3 py-2 rounded-3"
                  style={{
                    backgroundColor: "var(--bg-input, #232328)",
                    color: "var(--text-main)",
                  }}
                  value={firstName}
                  placeholder="Введіть ім'я"
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

              {/* Прізвище */}
              <div className="col-12 col-md-6">
                <label className="form-label small fw-bold text-secondary mb-1">
                  Прізвище
                </label>
                <input
                  type="text"
                  className="form-control border-0 px-3 py-2 rounded-3"
                  style={{
                    backgroundColor: "var(--bg-input, #232328)",
                    color: "var(--text-main)",
                  }}
                  value={lastName}
                  placeholder="Введіть прізвище"
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

              {/* Поле Про себе (Bio) */}
              <div className="col-12 mt-4 mb-2">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <label className="form-label small fw-bold text-secondary mb-0">
                    Про себе
                  </label>
                  <span
                    className="small text-secondary"
                    style={{ fontSize: "12px" }}
                  >
                    {bio.length} / 300
                  </span>
                </div>
                <textarea
                  className="form-control border-0 p-3 rounded-3"
                  rows="3"
                  maxLength={300}
                  style={{
                    backgroundColor: "var(--bg-input, #232328)",
                    color: "var(--text-main)",
                    resize: "none",
                  }}
                  placeholder="Розкажіть трохи про себе, свої хобі, навчання або звички..."
                  value={bio}
                  onChange={(e) =>
                    handleProfileUpdate(
                      e.target.value,
                      "bio",
                      setBio,
                      auth.currentUser,
                    )
                  }
                />
              </div>
            </div>

            {/* Статус пошуку кімнати */}
            <div
              className="d-flex justify-content-between align-items-center p-3 rounded-3 mb-4"
              style={{ backgroundColor: "var(--bg-input, #232328)" }}
            >
              <div>
                <div className="fw-semibold small">Статус пошуку кімнати</div>
                <div className="small text-secondary">
                  {isLookingForRoom ? "Шукаю кімнату" : "Не шукаю"}
                </div>
              </div>
              <div className="form-check form-switch m-0">
                <input
                  className="form-check-input custom-switch"
                  type="checkbox"
                  checked={isLookingForRoom}
                  onChange={(e) => handleStatusChange(e, setIsLookingForRoom)}
                  style={{ cursor: "pointer" }}
                />
              </div>
            </div>

            {/* Контакти та соціальні мережі */}
            <h5 className="fw-bold mb-3">Контакти та соціальні мережі</h5>
            <div className="row g-3">
              <div className="col-12 col-md-6">
                <label className="form-label small fw-bold text-secondary mb-1">
                  Telegram
                </label>
                <div className="input-group">
                  <span
                    className="input-group-text border-0 text-secondary rounded-start-3"
                    style={{ backgroundColor: "var(--bg-input, #232328)" }}
                  >
                    <i className="bi bi-telegram fs-3"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control border-0 py-3 px-2 rounded-end-3"
                    style={{
                      backgroundColor: "var(--bg-input, #232328)",
                      color: "var(--text-main)",
                    }}
                    placeholder="@username або посилання"
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
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label small fw-bold text-secondary mb-1">
                  Instagram
                </label>
                <div className="input-group">
                  <span
                    className="input-group-text border-0 text-secondary rounded-start-3"
                    style={{ backgroundColor: "var(--bg-input, #232328)" }}
                  >
                    <i className="bi bi-instagram fs-4"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control border-0 py-3 px-2 rounded-end-3"
                    style={{
                      backgroundColor: "var(--bg-input, #232328)",
                      color: "var(--text-main)",
                    }}
                    placeholder="@username або посилання"
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
        </div>

        <div className="row my-features p-2 mb-5">
          {/* СЕКЦІЯ "МОЇ ЗВИЧКИ" */}
          <div className="col-12 col-xl-6 mb-4 mb-xl-0 align-self-start">
            <div className="card w-100 rounded-4 ">
              <div
                className="card-header d-flex habits-header justify-content-between align-items-center p-3 rounded-4"
                style={{
                  cursor: "pointer",
                }}
                onClick={() => setIsHabitsOpen(!isHabitsOpen)}
              >
                <span className="fw-bold card-header-title">Мої звички</span>
                <button
                  className="btn btn-sm rounded-pill border-1 border-secondary"
                  style={{
                    backgroundColor: "var(--bg-input)",
                    color: "var(--text-main)",
                  }}
                >
                  {isHabitsOpen ? (
                    <i class="bi bi-dash"></i>
                  ) : (
                    <i class="bi bi-plus"></i>
                  )}
                </button>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateRows: isHabitsOpen ? "1fr" : "0fr",
                  transition: "grid-template-rows 0.5s ease-out",
                }}
              >
                <div style={{ overflow: "hidden" }}>
                  <div className="card-body habits-body rounded-bottom-4">
                    {userAnswers ? (
                      <div className="d-flex flex-wrap gap-2">
                        {Object.keys(userAnswers).map((questionId) => {
                          const answer = userAnswers[questionId];
                          const currentQuestion = questions.find(
                            (q) => q.id == questionId,
                          );
                          return (
                            <div
                              key={questionId}
                              className="m-1 d-inline-block"
                            >
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
                          <Link
                            className="btn retest-btn rounded-pill px-4"
                            to="/test"
                          >
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
                </div>
              </div>
            </div>
          </div>

          {/* СЕКЦІЯ "МОЇ ФОТОГРАФІЇ" */}
          <div className="col-12 col-xl-6 align-self-start">
            <div className="card rounded-4 w-100">
              <div
                className="card-header photos-header d-flex justify-content-between align-items-center p-3 rounded-4"
                style={{
                  cursor: "pointer",
                }}
                onClick={() => setIsPhotosOpen(!isPhotosOpen)}
              >
                <span className="fw-bold card-header-title">
                  Мої фото ({gallery ? gallery.length : 0})
                </span>
                <div className="d-flex align-items-center gap-2">
                  {" "}
                  <label
                    className="btn add-photo rounded-pill px-3 py-1 m-0 d-flex align-items-center gap-1 btn-sm"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <i className="bi bi-plus-lg"></i>
                    <span className="fw-bold add-text">Додати</span>
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={(e) =>
                        handleGalleryUpload(e, auth.currentUser, setGallery)
                      }
                    />
                  </label>
                  <button
                    className="btn btn-sm rounded-pill border-1 border-secondary"
                    style={{
                      backgroundColor: "var(--bg-input)",
                      color: "var(--text-main)",
                    }}
                  >
                    {isPhotosOpen ? (
                      <i class="bi bi-dash"></i>
                    ) : (
                      <i class="bi bi-plus"></i>
                    )}
                  </button>
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateRows: isPhotosOpen ? "1fr" : "0fr",
                  transition: "grid-template-rows 0.3s ease-out",
                }}
              >
                <div style={{ overflow: "hidden" }}>
                  <div className="card-body rounded-bottom-4">
                    <div className="list-of-users custom-scroll p-1">
                      <div className="d-flex flex-wrap gap-3 justify-content-start">
                        {gallery && gallery.length > 0 ? (
                          gallery.map((url, index) => (
                            <div
                              key={index}
                              className="position-relative gallery-item-wrapper shadow-sm"
                            >
                              <img
                                src={url}
                                alt={`Gallery item ${index}`}
                                className="rounded-4 border"
                                style={{
                                  width: "130px",
                                  height: "130px",
                                  objectFit: "cover",
                                }}
                              />
                              <button
                                className="btn btn-danger position-absolute top-0 end-0 m-1 rounded-circle p-0 d-flex align-items-center justify-content-center"
                                style={{
                                  width: "22px",
                                  height: "22px",
                                  fontSize: "12px",
                                  border: "2px solid white",
                                }}
                                onClick={() =>
                                  deleteGalleryImage(
                                    url,
                                    auth.currentUser,
                                    setGallery,
                                  )
                                }
                              >
                                ✕
                              </button>
                            </div>
                          ))
                        ) : (
                          <div className="text-center w-100 py-3">
                            <p className="text-secondary small mb-0">
                              У вас ще немає доданих фотографій
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="user-settings row p-2">
          {/* Налаштування конфіденційності */}
          <div className="privacy-sets col-xl-6 col-lg-6 col-md-12 col-sm-12">
            <div className="d-flex align-items-center gap-3 mb-4 w-100">
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
                <h6 className="mb-1">Хто може надсилати мені повідомлення</h6>
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
          <div className="message-sets col-xl-6 col-lg-6 col-md-12 col-sm-12">
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
