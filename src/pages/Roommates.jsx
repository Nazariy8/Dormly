import React, { useState, useEffect, useMemo } from "react";
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
  const [currentUserData, setCurrentUserData] = useState(null);
  const [roommates, setRoommates] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [myFriends, setMyFriends] = useState([]);

  // Нові стани для системи метчингу
  const [currentUserAnswers, setCurrentUserAnswers] = useState(null);
  const [potentialMatches, setPotentialMatches] = useState([]);
  const [isLoadingMatches, setIsLoadingMatches] = useState(false);

  // --- СТАНИ ДЛЯ UI ---
  const [activeTab, setActiveTab] = useState("room");
  const [isRoommatesOpen, setIsRoommatesOpen] = useState(false);
  const [isTasksOpen, setIsTasksOpen] = useState(false);
  const [searchFriendTerm, setSearchFriendTerm] = useState("");
  const [newTask, setNewTask] = useState("");

  // --- СТАНИ ДЛЯ КОЛЕСА ФОРТУНИ ---
  const [spinStage, setSpinStage] = useState("task"); // 'task' | 'person'
  const [selectedTask, setSelectedTask] = useState(null);
  const [mustSpin, setMustSpin] = useState(false);
  const [prizeNumber, setPrizeNumber] = useState(0);
  const [winner, setWinner] = useState(null);

  // --- СИНХРОНІЗАЦІЯ ПРОФІЛЮ КОРИСТУВАЧА ---
  useEffect(() => {
    if (!user) return;
    const userRef = doc(db, "users", user.uid);

    const unsubscribe = onSnapshot(userRef, async (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();

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

  const allParticipants = useMemo(() => {
    return currentUserData ? [currentUserData, ...roommates] : roommates;
  }, [currentUserData, roommates]);

  // Безпечне формування списку секторів (завжди >= 2 елементів)
  const wheelData = useMemo(() => {
    if (spinStage === "person") {
      if (allParticipants.length === 0) {
        return [{ option: "Додайте сусідів" }, { option: "Додайте сусідів" }];
      }
      const mapped = allParticipants.map((p) => ({
        option: p.id === user.uid ? `${p.firstName} (Ви)` : p.firstName,
      }));
      return mapped.length === 1 ? [...mapped, ...mapped] : mapped;
    }

    // Для стадії "task"
    if (tasks.length === 0) {
      return [{ option: "Додайте завдання" }, { option: "Додайте завдання" }];
    }
    const mappedTasks = tasks.map((t) => ({ option: t }));
    return mappedTasks.length === 1
      ? [...mappedTasks, ...mappedTasks]
      : mappedTasks;
  }, [spinStage, allParticipants, tasks, user]);

  // 1. Старт першого раунду (Завдання)
  const handleSpinClick = () => {
    if (tasks.length === 0 || allParticipants.length === 0 || mustSpin) return;

    setWinner(null);
    setSelectedTask(null);
    setSpinStage("task");

    const targetIndex = Math.floor(Math.random() * wheelData.length);
    setPrizeNumber(targetIndex);
    setMustSpin(true);
  };

  // 2. Зупинка обертання
  const handleStopSpinning = () => {
    setMustSpin(false);

    if (spinStage === "task") {
      const chosenTask = wheelData[prizeNumber]?.option || tasks[0];
      setSelectedTask(chosenTask);

      // Перемикаємось на етап людей через невелику паузу
      setTimeout(() => {
        setSpinStage("person");

        setTimeout(() => {
          const personDataLength =
            allParticipants.length === 1
              ? 2
              : Math.max(allParticipants.length, 2);
          const nextIndex = Math.floor(Math.random() * personDataLength);
          setPrizeNumber(nextIndex);
          setMustSpin(true);
        }, 150);
      }, 700);
    } else if (spinStage === "person") {
      const actualIndex = prizeNumber % Math.max(allParticipants.length, 1);
      const chosenPerson = allParticipants[actualIndex] || allParticipants[0];

      setWinner({
        person: chosenPerson,
        task: selectedTask,
      });
      setSpinStage("task"); // скидання для наступного разу
    }
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
            className={`btn rounded-pill px-4 py-2 fw-bold ${
              activeTab === "search" ? "active" : ""
            }`}
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
            className={`btn rounded-pill px-4 py-2 fw-bold ${
              activeTab === "room" ? "active" : ""
            }`}
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
                  style={{ cursor: "pointer" }}
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
                      <i className="bi bi-dash"></i>
                    ) : (
                      <i className="bi bi-plus"></i>
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
              <div className="card tasks-block rounded-4 w-100">
                <div
                  className="card-header border-0 d-flex justify-content-between align-items-center p-3 rounded-4"
                  style={{ cursor: "pointer" }}
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
                      <i className="bi bi-dash"></i>
                    ) : (
                      <i className="bi bi-plus"></i>
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
            className="d-flex flex-column flex-md-row justify-content-center align-items-center gap-5 mx-auto"
            style={{ maxWidth: "1000px" }}
          >
            {/* КОЛЕСО */}
            <div
              className="d-flex justify-content-center align-items-center position-relative"
              style={{
                width: "450px",
                height: "450px",
                flexShrink: 0,
                overflow: "hidden",
              }}
            >
              <Wheel
                mustStartSpinning={mustSpin}
                prizeNumber={prizeNumber}
                data={wheelData}
                backgroundColors={
                  spinStage === "person"
                    ? ["#3b82f6", "#10b981", "#f59e0b", "#ec4899"]
                    : ["#8a4fff", "#20c997", "#ffcc00"]
                }
                textColors={["#ffffff", "#ffffff", "#1a1a1a", "#ffffff"]}
                outerBorderColor="#ffffff"
                outerBorderWidth={10}
                innerBorderColor="#ffffff"
                innerBorderWidth={20}
                innerRadius={20}
                radiusLineColor="#ffffff"
                radiusLineWidth={2}
                fontSize={13}
                onStopSpinning={handleStopSpinning}
              />
            </div>

            {/* ПРАВА ПАНЕЛЬ */}
            <div
              className="game-controls text-center text-md-start"
              style={{ flexGrow: 1, maxWidth: "450px", width: "100%" }}
            >
              {selectedTask && (
                <div
                  className="p-3 mb-3 rounded-4 shadow-sm border text-center"
                  style={{
                    backgroundColor: "var(--bg-secondary)",
                    borderColor: "#8a4fff",
                    animation: "modalFadeIn 0.3s ease",
                  }}
                >
                  <span className="small text-secondary d-block fw-bold mb-1">
                    📌 Обране завдання:
                  </span>
                  <strong className="text-primary fs-5">{selectedTask}</strong>
                </div>
              )}

              <h6 className="fw-bold mb-3">Учасники кімнати:</h6>

              <div className="d-flex flex-wrap gap-2 mb-4 justify-content-center justify-content-md-start">
                {allParticipants.map((participant) => (
                  <span
                    key={participant.id}
                    className="badge rounded-pill px-3 py-2 fw-bold"
                    style={{
                      fontSize: "15px",
                      backgroundColor: "var(--bg-input)",
                      color: "var(--text-main)",
                      border: "1px solid var(--border-color)",
                    }}
                  >
                    {participant.firstName}{" "}
                    {participant.id === user.uid && "(Ви)"}
                  </span>
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
                {mustSpin
                  ? spinStage === "task"
                    ? "Обираємо завдання..."
                    : "Обираємо людину..."
                  : "Покрутити колесо!"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- МОДАЛЬНЕ ВІКНО ПЕРЕМОЖЦЯ --- */}
      {winner && !mustSpin && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.65)",
            backdropFilter: "blur(4px)",
            zIndex: 1050,
          }}
          onClick={() => {
            setWinner(null);
            setSelectedTask(null);
          }}
        >
          <div
            className="congr-modal card  rounded-4 p-4 text-center mx-3"
            style={{
              maxWidth: "420px",
              width: "100%",
              backgroundColor: "var(--bg-secondary)",
              color: "var(--text-main)",
              animation: "modalFadeIn 0.3s ease-out",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-2" style={{ fontSize: "3rem" }}>
              🎉
            </div>

            <h4 className="fw-bold mb-2" style={{ color: "#8a4fff" }}>
              Вітаємо, {winner?.person?.firstName}!
            </h4>

            <p className="fs-5 mb-4 text-break">
              Твоє завдання:{" "}
              <strong className="text-decoration-underline">
                {winner?.task}
              </strong>
            </p>

            <button
              className="btn text-white fw-bold py-2 px-4 rounded-pill shadow-sm"
              style={{ backgroundColor: "#8a4fff" }}
              onClick={() => {
                setWinner(null);
                setSelectedTask(null);
              }}
            >
              Зрозуміло!
            </button>
          </div>
        </div>
      )}

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
                    className="candidates col-12 col-md-6 col-lg-3 mb-4"
                  >
                    <div className="card border-0 shadow-sm rounded-4 h-100">
                      <div className="card-body text-center p-4">
                        <div className=" card-main-info mb-4">
                          <img
                            src={candidate.avatar || defaultUser}
                            alt="avatar"
                            className="rounded-circle shadow-s mb-3"
                            style={{
                              width: "90px",
                              height: "90px",
                              objectFit: "cover",
                            }}
                          />
                          <h4
                            className="fw-bold m-0 text-truncate"
                            title={`${candidate.firstName} ${candidate.lastName}`} // підказка при наведенні
                            style={{ fontSize: "1.1rem" }}
                          >
                            {candidate.firstName} {candidate.lastName}
                          </h4>
                        </div>

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
                                title={`${cat.label} (${
                                  status === "green"
                                    ? "Сумісно"
                                    : "Різні погляди"
                                })`}
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
                        <button
                          className="btn btn-outline-purple text-btn w-100 mt-2 rounded-pill fw-bold"
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
