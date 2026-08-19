import React, { useState, useEffect, useRef } from "react";
import Header from "../components/Header";
import { useLocation, useNavigate, Link } from "react-router-dom";
import "../css/profile.scss";
import defaultUser from "../img/profile/user.jpg";

import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

import Cropper from "react-easy-crop";
import { getCroppedImg } from "../utils/cropImage";

import {
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

const Profile = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [userAnswers, setUserAnswers] = useState(
    location.state?.userAnswers || null,
  );
  const [loading, setLoading] = useState(true);

  const [avatar, setAvatar] = useState("");
  const [username, setUsername] = useState("");
  const [usernameError, setUsernameError] = useState("");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [gender, setGender] = useState("male");
  const [bio, setBio] = useState("");

  const [instagram, setInstagram] = useState("");
  const [telegram, setTelegram] = useState("");
  const [isLookingForRoom, setIsLookingForRoom] = useState(false);

  const [gallery, setGallery] = useState([]);

  const [photoAccess, setPhotoAccess] = useState(false);
  const [sendAllow, setSendAllow] = useState(false);
  const [hideActivity, setHideActivity] = useState(false);

  const [friendsQuery, setFriendsQuery] = useState(false);
  const [friendsActivity, setFriendsActivity] = useState(false);
  const [showMessages, setShowMessages] = useState(false);

  const [isHabitsOpen, setIsHabitsOpen] = useState(false);
  const [isPhotosOpen, setIsPhotosOpen] = useState(false);

  const [imageToCrop, setImageToCrop] = useState(null);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [showCropper, setShowCropper] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);


  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setLoading(true);
        try {
          const userDoc = await getDoc(doc(db, "users", currentUser.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setUsername(data.username || "");
            setFirstName(data.firstName || "");
            setLastName(data.lastName || "");
            setGender(data.gender || "male");
            setBio(data.bio || "");
            setInstagram(data.instagram || "");
            setTelegram(data.telegram || "");
            setAvatar(data.avatar || null);
            setIsLookingForRoom(data.status === "Шукаю кімнату");
            setGallery(data.gallery || []);

            setPhotoAccess(data.photoAccess ?? false);
            setSendAllow(data.sendAllow ?? false);
            setHideActivity(data.hideActivity ?? false);

            setFriendsQuery(data.friendsQuery ?? false);
            setFriendsActivity(data.friendsActivity ?? false);
            setShowMessages(data.showMessages ?? false);

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
  }, [location.state]);

  return (
    <div className="profile-page-wrapper">
      <main className="profile-container mt-4">
        {/* Заголовок і кнопка виходу */}
        <header className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className="h3 fw-bold text-white m-0">Налаштування профілю</h1>
            <p className="text-secondary small m-0 mt-1">
              Керуйте своїми персональними даними та видимістю
            </p>
          </div>
          <button
            onClick={() => handleLogout(navigate)}
            className="btn-outline-custom"
          >
            Вийти
          </button>
        </header>

        {/* Картка Аватара */}
        <section className="profile-card profile-header-card">
          <div className="d-flex align-items-center gap-3">
            <div className="avatar-wrapper">
              <img
                src={avatar || defaultUser}
                alt="Аватар"
                className="profile-avatar-img"
              />
            </div>
            <div className="user-meta">
              <div className="user-handle">@{username || "username"}</div>
              <div className="user-fullname">
                {firstName || lastName
                  ? `${firstName} ${lastName}`.trim()
                  : "Ім'я не вказано"}
              </div>
            </div>
          </div>

          <label className="btn-solid-light m-0">
            Змінити фото
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
        </section>

        {/* Особисті дані */}
        <section className="profile-card">
          <h2 className="section-title">Особисті дані</h2>

          <div className="row g-3">
            <div className="col-12 col-md-6">
              <div className="form-group-custom">
                <label className="form-label-custom" htmlFor="usernameField">
                  Унікальний логін <span className="text-danger">*</span>
                </label>
                <div className="input-prefix-group">
                  <span className="prefix-icon">@</span>
                  <input
                    id="usernameField"
                    type="text"
                    className="custom-input"
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
                  <small className="text-danger mt-1">{usernameError}</small>
                )}
              </div>
            </div>

            <div className="col-12 col-md-6">
              <div className="form-group-custom">
                <label className="form-label-custom" htmlFor="genderField">
                  Стать
                </label>
                <select
                  id="genderField"
                  className="custom-select"
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
            </div>

            <div className="col-12 col-md-6">
              <div className="form-group-custom">
                <label className="form-label-custom" htmlFor="firstNameField">
                  Ім'я
                </label>
                <input
                  id="firstNameField"
                  type="text"
                  className="custom-input"
                  placeholder="Ім'я"
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
            </div>

            <div className="col-12 col-md-6">
              <div className="form-group-custom">
                <label className="form-label-custom" htmlFor="lastNameField">
                  Прізвище
                </label>
                <input
                  id="lastNameField"
                  type="text"
                  className="custom-input"
                  placeholder="Прізвище"
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
            </div>

            <div className="col-12 mt-3">
              <div className="form-group-custom">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <label className="form-label-custom m-0" htmlFor="bioField">
                    Про себе
                  </label>
                  <span className="text-secondary small">
                    {bio.length} / 300
                  </span>
                </div>
                <textarea
                  id="bioField"
                  className="custom-textarea"
                  rows="3"
                  maxLength={300}
                  placeholder="Розкажіть про себе, хобі, графік навчання або звички..."
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
          </div>

          <div className="setting-row mt-4">
            <div>
              <div className="setting-title">Статус пошуку кімнати</div>
              <div className="setting-desc">
                {isLookingForRoom ? "Шукаю кімнату" : "Не шукаю"}
              </div>
            </div>
            <div className="form-check form-switch m-0">
              <input
                className="form-check-input"
                type="checkbox"
                checked={isLookingForRoom}
                onChange={(e) => handleStatusChange(e, setIsLookingForRoom)}
              />
            </div>
          </div>
        </section>

        {/* Контакти */}
        <section className="profile-card">
          <h2 className="section-title">Контакти та соцмережі</h2>
          <div className="row g-3">
            <div className="col-12 col-md-6">
              <div className="form-group-custom">
                <label className="form-label-custom">Telegram</label>
                <div className="input-prefix-group">
                  <span className="prefix-icon">
                    <i className="bi bi-telegram"></i>
                  </span>
                  <input
                    type="text"
                    className="custom-input"
                    placeholder="@username"
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
            </div>

            <div className="col-12 col-md-6">
              <div className="form-group-custom">
                <label className="form-label-custom">Instagram</label>
                <div className="input-prefix-group">
                  <span className="prefix-icon">
                    <i className="bi bi-instagram"></i>
                  </span>
                  <input
                    type="text"
                    className="custom-input"
                    placeholder="@username"
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
        </section>

        {/* Звички та Фото */}
        <div className="row g-4 mb-4">
          <div className="col-12 col-lg-6">
            <section className="profile-card">
              <div
                className="accordion-custom-header"
                onClick={() => setIsHabitsOpen(!isHabitsOpen)}
              >
                <span className="accordion-title">Мої звички</span>
                <button type="button" className="toggle-icon-btn">
                  <i
                    className={`bi ${isHabitsOpen ? "bi-dash" : "bi-plus"}`}
                  ></i>
                </button>
              </div>

              <div className="d-grid"
                style={{
                  gridTemplateRows: isHabitsOpen ? "1fr" : "0fr",
                  transition: "grid-template-rows 0.3s ease",
                }}
              >
                <div className="overflow-hidden">
                  <div className="pt-4">
                    {userAnswers ? (
                      <div>
                        <div className="d-flex flex-wrap gap-2 mb-4">
                          {Object.keys(userAnswers).map((questionId) => (
                            <span key={questionId} className="habit-pill">
                              {userAnswers[questionId]}
                            </span>
                          ))}
                        </div>
                        <Link
                          to="/test"
                          className="btn-outline-custom d-inline-block"
                        >
                          Перепройти тест
                        </Link>
                      </div>
                    ) : (
                      <div>
                        <p className="text-secondary small mb-3">
                          Ви ще не пройшли опитування про звички.
                        </p>
                        <button
                          className="btn-solid-light"
                          onClick={() => handleGoTest(navigate)}
                        >
                          Пройти тест
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>
          </div>

          <div className="col-12 col-lg-6">
            <section className="profile-card">
              <div
                className="accordion-custom-header"
                onClick={() => setIsPhotosOpen(!isPhotosOpen)}
              >
                <span className="accordion-title">
                  Мої фото ({gallery ? gallery.length : 0})
                </span>
                <div className="d-flex align-items-center gap-2">
                  <label
                    className="btn-outline-custom m-0 cursor-pointer"
                    onClick={(e) => e.stopPropagation()}
                  >
                    + Додати
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={(e) =>
                        handleGalleryUpload(e, auth.currentUser, setGallery)
                      }
                    />
                  </label>
                  <button type="button" className="toggle-icon-btn">
                    <i
                      className={`bi ${isPhotosOpen ? "bi-dash" : "bi-plus"}`}
                    ></i>
                  </button>
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateRows: isPhotosOpen ? "1fr" : "0fr",
                  transition: "grid-template-rows 0.3s ease",
                }}
              >
                <div style={{ overflow: "hidden" }}>
                  <div className="pt-4">
                    {gallery && gallery.length > 0 ? (
                      <div className="gallery-grid">
                        {gallery.map((url, index) => (
                          <div key={index} className="gallery-item">
                            <img src={url} alt={`Gallery item ${index}`} />
                            <button
                              type="button"
                              className="btn-del-photo"
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
                        ))}
                      </div>
                    ) : (
                      <p className="text-secondary small m-0">
                        У вас ще немає доданих фотографій.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* Налаштування приватності та повідомлень */}
        <div className="row g-4">
          <div className="col-12 col-lg-6">
            <section className="profile-card h-100">
              <h2 className="section-title">Конфіденційність</h2>

              <div className="setting-row">
                <div>
                  <div className="setting-title">Хто бачить мої фото</div>
                  <div className="setting-desc">
                    {photoAccess ? "Всі користувачі" : "Ніхто"}
                  </div>
                </div>
                <div className="form-check form-switch m-0">
                  <input
                    className="form-check-input"
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

              <div className="setting-row">
                <div>
                  <div className="setting-title">
                    Хто може писати повідомлення
                  </div>
                  <div className="setting-desc">
                    {sendAllow ? "Всі" : "Лише контакти"}
                  </div>
                </div>
                <div className="form-check form-switch m-0">
                  <input
                    className="form-check-input"
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

              <div className="setting-row mb-0">
                <div>
                  <div className="setting-title">Приховати активність</div>
                  <div className="setting-desc">
                    {hideActivity ? "Статус невидимий" : "Статус видимий"}
                  </div>
                </div>
                <div className="form-check form-switch m-0">
                  <input
                    className="form-check-input"
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
            </section>
          </div>

          <div className="col-12 col-lg-6">
            <section className="profile-card h-100">
              <h2 className="section-title">Повідомлення</h2>

              <div className="setting-row">
                <div>
                  <div className="setting-title">Нові повідомлення в чаті</div>
                  <div className="setting-desc">Push-сповіщення</div>
                </div>
                <div className="form-check form-switch m-0">
                  <input
                    className="form-check-input"
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

              <div className="setting-row">
                <div>
                  <div className="setting-title">
                    Запити на додавання в друзі
                  </div>
                  <div className="setting-desc">Push-сповіщення</div>
                </div>
                <div className="form-check form-switch m-0">
                  <input
                    className="form-check-input"
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

              <div className="setting-row mb-0">
                <div>
                  <div className="setting-title">Активність друзів</div>
                  <div className="setting-desc">
                    {friendsActivity ? "Увімкнено" : "Вимкнено"}
                  </div>
                </div>
                <div className="form-check form-switch m-0">
                  <input
                    className="form-check-input"
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
            </section>
          </div>
        </div>
      </main>

      {/* Модалка кропера аватара */}
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
              className="btn-outline-custom"
              onClick={() => setShowCropper(false)}
            >
              Скасувати
            </button>
            <button
              className="btn-solid-light"
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

export default Profile;
