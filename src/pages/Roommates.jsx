import React, { useState, useEffect } from "react";
import {
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  onSnapshot,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "../firebase";
import defaultUser from "../img/profile/user.jpg";
import { Wheel } from "react-custom-roulette";
import Header from "../components/Header";
import { useNavigate } from "react-router-dom";
import "../css/roommate.scss";

const Roommates = ({ user }) => {
  const navigate = useNavigate();

  // --- СТАНИ ДЛЯ ДАНИХ З БАЗИ ---
  const [currentUserData, setCurrentUserData] = useState(null); // НОВЕ: Дані самого користувача (себе)
  const [roommates, setRoommates] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [myFriends, setMyFriends] = useState([]);

  // Нові стани для системи метчингу
  const [currentUserAnswers, setCurrentUserAnswers] = useState(null);
  const [potentialMatches, setPotentialMatches] = useState([]);
  const [isLoadingMatches, setIsLoadingMatches] = useState(false);

  // --- СТАНИ ДЛЯ UI ---
  const [activeTab, setActiveTab] = useState("room"); // 'room' або 'search'
  const [isRoommatesOpen, setIsRoommatesOpen] = useState(false);
  const [isTasksOpen, setIsTasksOpen] = useState(false);
  const [searchFriendTerm, setSearchFriendTerm] = useState("");
  const [newTask, setNewTask] = useState("");

  // --- СТАНИ ДЛЯ КОЛЕСА ФОРТУНИ ---
  const [mustSpin, setMustSpin] = useState(false);
  const [prizeNumber, setPrizeNumber] = useState(0);
  const [winner, setWinner] = useState(null);


  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  // --- СИНХРОНІЗАЦІЯ ПРОФІЛЮ КОРИСТУВАЧА ---
  useEffect(() => {
    if (!user) return;
    const userRef = doc(db, "users", user.uid);

    const unsubscribe = onSnapshot(userRef, async (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();

        // Зберігаємо дані самого себе для рулетки
        setCurrentUserData({ id: user.uid, ...data });

        if (data.tasks) setTasks(data.tasks);
        if (data.answers) setCurrentUserAnswers(data.answers);

        if (data.friends && data.friends.length > 0) {
          const friendsData = await Promise.all(
            data.friends.map(async (friendId) => {
              const fSnap = await getDoc(doc(db, "users", friendId));
              return { id: fSnap.id, ...fSnap.data() };
            }),
          );
          setMyFriends(friendsData);
        } else {
          setMyFriends([]);
        }

        if (data.roommates && data.roommates.length > 0) {
          const roommatesData = await Promise.all(
            data.roommates.map(async (rmId) => {
              const rSnap = await getDoc(doc(db, "users", rmId));
              return { id: rSnap.id, ...rSnap.data() };
            }),
          );
          setRoommates(roommatesData);
        } else {
          setRoommates([]);
        }
      }
    });
    return () => unsubscribe();
  }, [user]);

  // --- ЗАВАНТАЖЕННЯ КАНДИДАТІВ ДЛЯ МЕТЧИНГУ ---
  useEffect(() => {
    if (activeTab === "search" && currentUserAnswers) {
      const fetchMatches = async () => {
        setIsLoadingMatches(true);
        try {
          const q = query(
            collection(db, "users"),
            where("hasPassedTest", "==", true),
          );
          const snapshot = await getDocs(q);
          const usersList = [];
          snapshot.forEach((docSnap) => {
            if (docSnap.id !== user.uid) {
              usersList.push({ id: docSnap.id, ...docSnap.data() });
            }
          });
          setPotentialMatches(usersList);
        } catch (error) {
          console.error("Помилка завантаження:", error);
        } finally {
          setIsLoadingMatches(false);
        }
      };
      fetchMatches();
    }
  }, [activeTab, currentUserAnswers, user]);

  const matchCategories = [
    {
      key: "cleanliness",
      ids: ["1", "2", "3"],
      icon: "🧹",
      label: "Чистота і порядок",
    },
    {
      key: "routine",
      ids: ["4", "5", "6"],
      icon: "⏰",
      label: "Режим дня і шум",
    },
    {
      key: "social",
      ids: ["7", "8", "9"],
      icon: "🍕",
      label: "Соціальна поведінка",
    },
    {
      key: "rules",
      ids: ["10", "11", "12"],
      icon: "🤝",
      label: "Правила і відповідальність",
    },
    {
      key: "comfort",
      ids: ["13", "14", "15"],
      icon: "🛋️",
      label: "Побут і комфорт",
    },
  ];

  const calculateBlockStatus = (myAnswers, theirAnswers, questionIds) => {
    if (!myAnswers || !theirAnswers) return "red";
    let matchCount = 0;
    questionIds.forEach((id) => {
      if (
        myAnswers[id] &&
        theirAnswers[id] &&
        myAnswers[id] === theirAnswers[id]
      ) {
        matchCount++;
      }
    });
    return matchCount >= 2 ? "green" : "red";
  };

  const filteredFriends = myFriends.filter(
    (friend) =>
      friend.firstName
        ?.toLowerCase()
        .includes(searchFriendTerm.toLowerCase()) &&
      !roommates.some((rm) => rm.id === friend.id),
  );

  const handleAddRoommate = async (friendId) => {
    try {
      await updateDoc(doc(db, "users", user.uid), {
        roommates: arrayUnion(friendId),
      });
      setSearchFriendTerm("");
    } catch (error) {
      console.error(error);
    }
  };
  const handleDeleteRoommate = async (friendId) => {
    try {
      await updateDoc(doc(db, "users", user.uid), {
        roommates: arrayRemove(friendId),
      });
    } catch (error) {
      console.error(error);
    }
  };
  const handleAddTask = async () => {
    if (!newTask.trim()) return;
    try {
      await updateDoc(doc(db, "users", user.uid), {
        tasks: arrayUnion(newTask.trim()),
      });
      setNewTask("");
    } catch (error) {
      console.error(error);
    }
  };
  const handleDeleteTask = async (taskText) => {
    try {
      await updateDoc(doc(db, "users", user.uid), {
        tasks: arrayRemove(taskText),
      });
    } catch (error) {
      console.error(error);
    }
  };

  // --- ЛОГІКА КОЛЕСА (ТЕПЕР ІЗ ТОБОЮ) ---
  const wheelData =
    tasks.length > 0
      ? tasks.map((task) => ({ option: task }))
      : [{ option: "Додайте завдання" }];

  // Додаємо себе в загальний список учасників!
  const allParticipants = currentUserData
    ? [currentUserData, ...roommates]
    : roommates;

  const handleSpinClick = () => {
    if (tasks.length === 0 || allParticipants.length === 0 || mustSpin) return;
    setWinner(null);
    setPrizeNumber(Math.floor(Math.random() * tasks.length));
    setMustSpin(true);
  };

  const handleStopSpinning = () => {
    setMustSpin(false);
    const randomParticipantIndex = Math.floor(
      Math.random() * allParticipants.length,
    );
    setWinner({
      person: allParticipants[randomParticipantIndex],
      task: tasks[prizeNumber],
    });
  };

  return (
    <div
      className="roommates-page"
      style={{ minHeight: "100vh", paddingBottom: "40px" }}
    >
      <Header user={user} />

      {/* --- МІНІ-МЕНЮ (ТАБИ) --- */}
      <div className="d-flex justify-content-center mt-4 mb-2">
        <div
          className="tabs p-1 rounded-pill shadow-sm d-inline-flex"
          style={{ border: "1px solid #eee" }}
        >
          <button
            onClick={() => setActiveTab("search")}
            className={`btn rounded-pill px-4 py-2 fw-bold ${activeTab === "search" ? "active" : ""}`}
            style={{
              backgroundColor:
                activeTab === "search" ? "#8a4fff" : "transparent",
              transition: "all 0.3s ease",
              border: "none",
            }}
          >
            Знайти співжителя
          </button>
          <button
            onClick={() => setActiveTab("room")}
            className={`btn rounded-pill px-4 py-2 fw-bold ${activeTab === "room" ? "active" : ""}`}
            style={{
              backgroundColor: activeTab === "room" ? "#8a4fff" : "transparent",
              transition: "all 0.3s ease",
              border: "none",
            }}
          >
            Кімната
          </button>
        </div>
      </div>

      {/* ВКЛАДКА "КІМНАТА" (КОЛЕСО) */}
      {activeTab === "room" && (
        <div className="container mt-4 text-center">
          <h2 className="fw-bold mb-2">
            Колесо фортуни для сусідів по кімнаті
          </h2>
          <p className="mb-5 fw-bold text-secondary">
            Не можете вирішити хто що робить? Нехай колесо вирішить!
          </p>

          {/* === ОБГОРТКА ДЛЯ БЛОКІВ У ДВІ КОЛОНКИ === */}
          <div
            className="row justify-content-center mx-auto mb-5"
            style={{ maxWidth: "1200px" }}
          >
            {/* --- БЛОК СУСІДІВ (ЛІВА КОЛОНКА) --- */}
            <div className="col-12 col-lg-6 mb-4 mb-lg-0 align-self-start">
              <div className="card roommates-block rounded-4 w-100">
                <div
                  className="card-header border-0 d-flex justify-content-between align-items-center p-3 rounded-4"
                  style={{
                    cursor: "pointer",
                  }}
                  onClick={() => setIsRoommatesOpen(!isRoommatesOpen)}
                >
                  <span className="fw-bold">Сусіди ({roommates.length})</span>
                  <button
                    className="btn btn-sm border-1 border-secondary rounded-pill"
                    style={{
                      backgroundColor: "var(--bg-input)",
                      color: "var(--text-main)",
                    }}
                  >
                    {isRoommatesOpen ? (
                      <i class="bi bi-dash"></i>
                    ) : (
                      <i class="bi bi-plus"></i>
                    )}
                  </button>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateRows: isRoommatesOpen ? "1fr" : "0fr",
                    transition: "grid-template-rows 0.3s ease-out",
                  }}
                >
                  <div style={{ overflow: "hidden" }}>
                    <div className="card-body rounded-bottom-4">
                      <div className="position-relative mb-3 text-start">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Введіть ім'я..."
                          value={searchFriendTerm}
                          onChange={(e) => setSearchFriendTerm(e.target.value)}
                        />
                        {searchFriendTerm.length > 0 && (
                          <div
                            className="position-absolute w-100 shadow rounded-3 mt-1 bg-white"
                            style={{
                              zIndex: 1000,
                              maxHeight: "200px",
                              overflowY: "auto",
                            }}
                          >
                            {filteredFriends.length > 0 ? (
                              filteredFriends.map((friend) => (
                                <div
                                  key={friend.id}
                                  className="d-flex align-items-center p-2 border-bottom"
                                  style={{ cursor: "pointer" }}
                                  onClick={() => handleAddRoommate(friend.id)}
                                  onMouseEnter={(e) =>
                                    (e.currentTarget.style.backgroundColor =
                                      "#e9ecef")
                                  }
                                  onMouseLeave={(e) =>
                                    (e.currentTarget.style.backgroundColor =
                                      "transparent")
                                  }
                                >
                                  <img
                                    src={friend.avatar || defaultUser}
                                    alt="avatar"
                                    className="rounded-circle me-2"
                                    style={{
                                      width: "30px",
                                      height: "30px",
                                      objectFit: "cover",
                                    }}
                                  />
                                  <span
                                    className="fw-bold"
                                    style={{ fontSize: "14px", color: "#333" }}
                                  >
                                    {friend.firstName} {friend.lastName}
                                  </span>
                                </div>
                              ))
                            ) : (
                              <div className="p-2 text-muted small">
                                Друзів не знайдено
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <h6 className="text-start mt-2 fw-bold">Ваша кімната</h6>
                      <div className="d-flex flex-wrap gap-2 mt-2">
                        {roommates.length === 0 && (
                          <p className="small w-100 mb-0 empty-roommates-text text-start">
                            Ви ще не додали сусідів
                          </p>
                        )}
                        {roommates.map((rm) => (
                          <div
                            key={rm.id}
                            className="badge rounded-pill d-flex align-items-center px-3 py-2"
                            style={{
                              backgroundColor: "var(--bg-input)",
                              color: "var(--text-main)",
                              border: "1px solid var(--border-color)",
                            }}
                          >
                            <img
                              src={rm.avatar || defaultUser}
                              alt="avatar"
                              className="rounded-circle me-2"
                              style={{
                                width: "24px",
                                height: "24px",
                                objectFit: "cover",
                              }}
                            />
                            <span
                              className="fw-bold me-2"
                              style={{ fontSize: "13px" }}
                            >
                              {rm.firstName}
                            </span>
                            <i
                              className="bi bi-x-circle-fill text-danger"
                              style={{ cursor: "pointer", fontSize: "16px" }}
                              onClick={() => handleDeleteRoommate(rm.id)}
                            ></i>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* --- БЛОК ЗАВДАНЬ (ПРАВА КОЛОНКА) --- */}
            <div className="col-12 col-lg-6 align-self-start">
              <div className="card tasks-block  rounded-4 w-100">
                <div
                  className="card-header border-0 d-flex justify-content-between align-items-center p-3 rounded-4"
                  style={{
                    cursor: "pointer",
                  }}
                  onClick={() => setIsTasksOpen(!isTasksOpen)}
                >
                  <span className="fw-bold">Завдання ({tasks.length})</span>
                  <button
                    className="btn btn-sm rounded-pill border-1 border-secondary"
                    style={{
                      backgroundColor: "var(--bg-input)",
                      color: "var(--text-main)",
                    }}
                  >
                    {isTasksOpen ? (
                      <i class="bi bi-dash"></i>
                    ) : (
                      <i class="bi bi-plus"></i>
                    )}
                  </button>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateRows: isTasksOpen ? "1fr" : "0fr",
                    transition: "grid-template-rows 0.3s ease-out",
                  }}
                >
                  <div style={{ overflow: "hidden" }}>
                    <div className="card-body rounded-bottom-4">
                      <div className="input-group mb-3">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Додати завдання..."
                          value={newTask}
                          onChange={(e) => setNewTask(e.target.value)}
                          onKeyDown={(e) =>
                            e.key === "Enter" && handleAddTask()
                          }
                        />
                        <button
                          className="btn fw-bold text-white"
                          style={{ backgroundColor: "#8a4fff" }}
                          onClick={handleAddTask}
                        >
                          <i className="bi bi-plus-lg"></i>
                        </button>
                      </div>

                      <h6 className="text-start mt-2 fw-bold">Ваші завдання</h6>
                      <div className="d-flex flex-wrap gap-2 mt-2">
                        {tasks.length === 0 && (
                          <p className="small w-100 text-muted text-start mb-0 empty-roommates-text">
                            Список завдань порожній
                          </p>
                        )}
                        {tasks.map((task, index) => (
                          <div
                            key={index}
                            className="badge rounded-pill d-flex align-items-center px-3 py-2"
                            style={{
                              backgroundColor: "var(--bg-input)",
                              color: "var(--text-main)",
                              border: "1px solid var(--border-color)",
                            }}
                          >
                            <span
                              className="fw-bold me-2 text-wrap text-start"
                              style={{ fontSize: "13px" }}
                            >
                              {task}
                            </span>
                            <i
                              className="bi bi-x-circle-fill text-danger"
                              style={{ cursor: "pointer", fontSize: "16px" }}
                              onClick={() => handleDeleteTask(task)}
                            ></i>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* === КІНЕЦЬ ОБГОРТКИ === */}

          {/* КОНТЕЙНЕР КОЛЕСА ТА КНОПОК */}
          <div
            className="d-flex flex-column flex-md-row justify-content-center align-items-center gap-5 mx-auto "
            style={{ maxWidth: "1000px" }}
          >
            {/* 1. ФІКС КОЛЕСА: Жорстко фіксуємо розмір, щоб обертання не міняло габарити */}
            <div
              className="d-flex justify-content-center align-items-center"
              style={{
                width: "450px",
                height: "450px",
                flexShrink: 0,
                overflow: "hidden",
              }}
            >
              <Wheel
                pointerProps={{
                  style: {
                    filter:
                      "invert(40%) sepia(90%) saturate(3000%) hue-rotate(245deg) drop-shadow(0 2px 4px rgba(0,0,0,0.3))",
                  },
                }}
                mustStartSpinning={mustSpin}
                prizeNumber={prizeNumber}
                data={wheelData}
                backgroundColors={["#8a4fff", "#20c997", "#ffcc00"]}
                textColors={["#ffffff", "#ffffff", "#1a1a1a"]}
                outerBorderColor="#ffffff"
                outerBorderWidth={10}
                innerBorderColor="#ffffff"
                innerBorderWidth={20}
                innerRadius={20}
                radiusLineColor="#ffffff"
                radiusLineWidth={2}
                fontSize={14}
                onStopSpinning={handleStopSpinning}
              />
            </div>

            {/* Права панель з кнопками */}
            <div
              className="game-controls text-center text-md-start"
              style={{ flexGrow: 1, maxWidth: "450px", width: "100%" }}
            >
              <h6 className="fw-bold mb-3">
                Хто буде виконувати завдання прямо зараз?
              </h6>

              <div className="d-flex flex-wrap gap-2 mb-4 justify-content-center justify-content-md-start">
                {allParticipants.length === 0 && (
                  <p className="small text-muted">Нікого немає</p>
                )}
                {allParticipants.map((participant) => (
                  <button
                    key={participant.id}
                    className="btn shadow-sm fw-bold px-4 py-2"
                    style={{
                      backgroundColor: "var(--bg-secondary)",
                      borderRadius: "10px",
                      color: "var(--text-main)",
                      border:
                        winner && winner.person.id === participant.id
                          ? "2px solid #8a4fff"
                          : "1px solid var(--border-color, rgba(255,255,255,0.1))",
                      boxShadow:
                        winner && winner.person.id === participant.id
                          ? "0 4px 15px rgba(138, 79, 255, 0.35)"
                          : "none",
                    }}
                  >
                    {participant.firstName}{" "}
                    {participant.id === user.uid && "(Ви)"}
                  </button>
                ))}
              </div>

              <button
                className="btn fw-bold text-white px-5 py-3 shadow"
                style={{
                  backgroundColor: "#8a4fff",
                  borderRadius: "15px",
                  width: "100%",
                  fontSize: "20px",
                }}
                disabled={
                  allParticipants.length === 0 || tasks.length === 0 || mustSpin
                }
                onClick={handleSpinClick}
              >
                {mustSpin ? "Крутимо..." : "Покрутіть колесо!"}
              </button>

              {/* 2. ФІКС ПЛАШКИ: Задаємо сувору висоту height: 120px замість minHeight */}
              <div style={{ marginTop: "1.5rem", height: "120px" }}>
                <div
                  className="p-3 congr-block rounded-4 shadow-sm text-center border d-flex flex-column justify-content-center"
                  style={{
                    borderColor: "#20c997",
                    backgroundColor: "var(--bg-secondary)",
                    opacity: winner && !mustSpin ? 1 : 0,
                    visibility: winner && !mustSpin ? "visible" : "hidden",
                    transition: "opacity 0.3s ease",
                    height: "100%", // Плашка завжди займає рівно 120px
                  }}
                >
                  <h5
                    className="mb-1 fw-bold text-truncate"
                    style={{ color: "#8a4fff" }}
                  >
                    Вітаємо, {winner?.person?.firstName || "\u00A0"}! 🎉
                  </h5>
                  <p className="mb-0 text-main text-truncate">
                    Твоє завдання: <strong>{winner?.task || "\u00A0"}</strong>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ВКЛАДКА "ЗНАЙТИ СПІВЖИТЕЛЯ" (МЕТЧИНГ) */}
      {activeTab === "search" && (
        <div className="container mt-4">
          <h2 className="fw-bold mb-2 text-center">Пошук ідеального сусіда</h2>
          <p className="text-center mb-5">
            Аналізуємо сумісність за 5 основними категоріями побуту
          </p>

          {!currentUserAnswers ? (
            <div
              className="text-center mt-5 p-5 bg-white rounded-4 shadow-sm mx-auto"
              style={{ maxWidth: "600px" }}
            >
              <i
                className="bi bi-ui-checks-grid text-muted mb-3 d-block"
                style={{ fontSize: "3rem" }}
              ></i>
              <h4 className="fw-bold">Ви ще не пройшли тест!</h4>
              <p className="text-secondary mb-4">
                Щоб ми могли підібрати вам ідеального сусіда, потрібно дізнатися
                про ваші побутові звички.
              </p>
              <button
                className="btn text-white fw-bold px-4 py-2 rounded-pill shadow-sm"
                style={{ backgroundColor: "#8a4fff" }}
                onClick={() => navigate("/test")}
              >
                Пройти тест на сумісність
              </button>
            </div>
          ) : isLoadingMatches ? (
            <div className="text-center mt-5">
              <div
                className="spinner-border"
                style={{ color: "#8a4fff" }}
                role="status"
              ></div>
              <p className="mt-2 fw-bold">Шукаємо кандидатів...</p>
            </div>
          ) : potentialMatches.length === 0 ? (
            <div className="text-center mt-5">
              <p>
                Поки немає користувачів, які пройшли тест. Запросіть друзів!
              </p>
            </div>
          ) : (
            <div className="row justify-content-center">
              {potentialMatches.map((candidate) => {
                const theirAnswers = candidate.answers || {};
                return (
                  <div
                    key={candidate.id}
                    className="candidates col-12 col-md-6 col-lg-4 mb-4"
                  >
                    <div className="card border-0 shadow-sm rounded-4 h-100">
                      <div className="card-body text-center p-4">
                        <img
                          src={candidate.avatar || defaultUser}
                          alt="avatar"
                          className="rounded-circle mb-3 shadow-sm"
                          style={{
                            width: "90px",
                            height: "90px",
                            objectFit: "cover",
                            border: "3px solid #eae4f9",
                          }}
                        />
                        <h4 className="fw-bold mb-1">
                          {candidate.firstName} {candidate.lastName}
                        </h4>
                        <p className="small mb-4">Можливий співмешканець</p>
                        <div className="d-flex justify-content-center gap-2 mb-3">
                          {matchCategories.map((cat) => {
                            const status = calculateBlockStatus(
                              currentUserAnswers,
                              theirAnswers,
                              cat.ids,
                            );
                            const bgColor =
                              status === "green" ? "#20c997" : "#ff6b6b";
                            return (
                              <div
                                key={cat.key}
                                className="rounded-circle d-flex justify-content-center align-items-center shadow-sm"
                                title={`${cat.label} (${status === "green" ? "Сумісно" : "Різні погляди"})`}
                                style={{
                                  width: "40px",
                                  height: "40px",
                                  backgroundColor: bgColor,
                                  cursor: "help",
                                  transition: "transform 0.2s",
                                }}
                                onMouseEnter={(e) =>
                                  (e.currentTarget.style.transform =
                                    "scale(1.1)")
                                }
                                onMouseLeave={(e) =>
                                  (e.currentTarget.style.transform = "scale(1)")
                                }
                              >
                                <span style={{ fontSize: "1.1rem" }}>
                                  {cat.icon}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                        <p className="small mb-0">
                          Наведіть на іконку для деталей
                        </p>
                        <button
                          className="btn btn-light w-100 mt-4 rounded-pill fw-bold text-secondary"
                          onClick={() =>
                            navigate("/chat", {
                              state: { startChatWith: candidate },
                            })
                          }
                        >
                          <i className="bi bi-chat-dots me-2"></i>Написати
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Roommates;
