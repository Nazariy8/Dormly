import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
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

const Profile = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [userAnswers, setUserAnswers] = useState(
    location.state?.userAnswers || location.state?.userAnswerIds || null,
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

            if (location.state?.userAnswerIds) {
              setUserAnswers(location.state.userAnswerIds);
            } else if (location.state?.userAnswers) {
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

  // Функція для отримання локалізованого тексту відповіді за ключем/ID
  const getLocalizedAnswer = (questionId, value) => {
    // Якщо збережено як ID ("1.1", "4.2")
    if (value && value.includes(".")) {
      return t(`test.questions.${questionId}.options.${value}`, {
        defaultValue: value,
      });
    }
    return value;
  };

  return (
    <div className="profile-page-wrapper">
      <main className="profile-container mt-4">
        {/* Заголовок і кнопка виходу */}
        <header className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className="h3 fw-bold text-white m-0">{t("profile.title")}</h1>
            <p className="text-secondary small m-0 mt-1">
              {t("profile.subtitle")}
            </p>
          </div>
          <button
            onClick={() => handleLogout(navigate)}
            className="btn-outline-custom"
          >
            {t("profile.logoutBtn")}
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
                  : t("profile.noName")}
              </div>
            </div>
          </div>

          <label className="btn-solid-light m-0">
            {t("profile.changePhoto")}
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
          <h2 className="section-title">{t("profile.personalData")}</h2>

          <div className="row g-3">
            <div className="col-12 col-md-6">
              <div className="form-group-custom">
                <label className="form-label-custom" htmlFor="usernameField">
                  {t("profile.username")} <span className="text-danger">*</span>
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
                  {t("profile.gender")}
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
                  <option value="male">{t("profile.genderMale")}</option>
                  <option value="female">{t("profile.genderFemale")}</option>
                  <option value="other">{t("profile.genderOther")}</option>
                </select>
              </div>
            </div>

            <div className="col-12 col-md-6">
              <div className="form-group-custom">
                <label className="form-label-custom" htmlFor="firstNameField">
                  {t("profile.firstName")}
                </label>
                <input
                  id="firstNameField"
                  type="text"
                  className="custom-input"
                  placeholder={t("profile.firstName")}
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
                  {t("profile.lastName")}
                </label>
                <input
                  id="lastNameField"
                  type="text"
                  className="custom-input"
                  placeholder={t("profile.lastName")}
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
                    {t("profile.bio")}
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
                  placeholder={t("profile.bioPlaceholder")}
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
              <div className="setting-title">{t("profile.roomStatus")}</div>
              <div className="setting-desc">
                {isLookingForRoom
                  ? t("profile.statusLooking")
                  : t("profile.statusNotLooking")}
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
          <h2 className="section-title">{t("profile.contactsTitle")}</h2>
          <div className="row g-3">
            <div className="col-12 col-md-6">
              <div className="form-group-custom">
                <label className="form-label-custom">
                  {t("profile.telegram")}
                </label>
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
                <label className="form-label-custom">
                  {t("profile.instagram")}
                </label>
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
                <span className="accordion-title">{t("profile.myHabits")}</span>
                <button type="button" className="toggle-icon-btn">
                  <i
                    className={`bi ${isHabitsOpen ? "bi-dash" : "bi-plus"}`}
                  ></i>
                </button>
              </div>

              <div
                className="d-grid"
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
                              {getLocalizedAnswer(
                                questionId,
                                userAnswers[questionId],
                              )}
                            </span>
                          ))}
                        </div>
                        <Link
                          to="/test"
                          className="btn-outline-custom d-inline-block"
                        >
                          {t("profile.retestBtn")}
                        </Link>
                      </div>
                    ) : (
                      <div>
                        <p className="text-secondary small mb-3">
                          {t("profile.noHabits")}
                        </p>
                        <button
                          className="btn-solid-light"
                          onClick={() => handleGoTest(navigate)}
                        >
                          {t("profile.passTestBtn")}
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
                  {t("profile.myPhotos")} ({gallery ? gallery.length : 0})
                </span>
                <div className="d-flex align-items-center gap-2">
                  <label
                    className="btn-outline-custom m-0 cursor-pointer"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {t("profile.addPhoto")}
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
                        {t("profile.noPhotos")}
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
              <h2 className="section-title">{t("profile.privacyTitle")}</h2>

              <div className="setting-row">
                <div>
                  <div className="setting-title">
                    {t("profile.photoAccess")}
                  </div>
                  <div className="setting-desc">
                    {photoAccess ? t("profile.allUsers") : t("profile.nobody")}
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
                  <div className="setting-title">{t("profile.sendAllow")}</div>
                  <div className="setting-desc">
                    {sendAllow ? t("profile.all") : t("profile.contactsOnly")}
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
                  <div className="setting-title">
                    {t("profile.hideActivity")}
                  </div>
                  <div className="setting-desc">
                    {hideActivity
                      ? t("profile.statusHidden")
                      : t("profile.statusVisible")}
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
              <h2 className="section-title">
                {t("profile.notificationsTitle")}
              </h2>

              <div className="setting-row">
                <div>
                  <div className="setting-title">
                    {t("profile.chatMessages")}
                  </div>
                  <div className="setting-desc">{t("profile.push")}</div>
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
                    {t("profile.friendRequests")}
                  </div>
                  <div className="setting-desc">{t("profile.push")}</div>
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
                  <div className="setting-title">
                    {t("profile.friendActivity")}
                  </div>
                  <div className="setting-desc">
                    {friendsActivity
                      ? t("profile.enabled")
                      : t("profile.disabled")}
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
              {t("profile.cropper.cancel")}
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
              {t("profile.cropper.save")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
