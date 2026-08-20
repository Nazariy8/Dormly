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
import { useTranslation } from "react-i18next";
import "../css/roommate.scss";

const matchCategories = [
  { key: "cleanliness", ids: ["1", "2", "3"], icon: "🧹" },
  { key: "routine", ids: ["4", "5", "6"], icon: "⏰" },
  { key: "social", ids: ["7", "8", "9"], icon: "🍕" },
  { key: "rules", ids: ["10", "11", "12"], icon: "🤝" },
  { key: "comfort", ids: ["13", "14", "15"], icon: "🛋️" },
];

const Roommates = ({ user }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [currentUserData, setCurrentUserData] = useState(null);
  const [roommates, setRoommates] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [myFriends, setMyFriends] = useState([]);

  const [currentUserAnswers, setCurrentUserAnswers] = useState(null);
  const [potentialMatches, setPotentialMatches] = useState([]);
  const [isLoadingMatches, setIsLoadingMatches] = useState(false);

  const [activeTab, setActiveTab] = useState("room");
  const [isRoommatesOpen, setIsRoommatesOpen] = useState(true);
  const [isTasksOpen, setIsTasksOpen] = useState(true);
  const [searchFriendTerm, setSearchFriendTerm] = useState("");
  const [newTask, setNewTask] = useState("");

  const [spinStage, setSpinStage] = useState("task");
  const [selectedTask, setSelectedTask] = useState(null);
  const [mustSpin, setMustSpin] = useState(false);
  const [prizeNumber, setPrizeNumber] = useState(0);
  const [winner, setWinner] = useState(null);

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

  // Метчинг за ідентифікаторами варіантів (1.1, 1.2 тощо)
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

    if (tasks.length === 0) {
      return [{ option: "Додайте завдання" }, { option: "Додайте завдання" }];
    }
    const mappedTasks = tasks.map((t) => ({ option: t }));
    return mappedTasks.length === 1
      ? [...mappedTasks, ...mappedTasks]
      : mappedTasks;
  }, [spinStage, allParticipants, tasks, user]);

  const handleSpinClick = () => {
    if (tasks.length === 0 || allParticipants.length === 0 || mustSpin) return;
    setWinner(null);
    setSelectedTask(null);
    setSpinStage("task");
    const targetIndex = Math.floor(Math.random() * wheelData.length);
    setPrizeNumber(targetIndex);
    setMustSpin(true);
  };

  const handleStopSpinning = () => {
    setMustSpin(false);
    if (spinStage === "task") {
      const chosenTask = wheelData[prizeNumber]?.option || tasks[0];
      setSelectedTask(chosenTask);

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
      setSpinStage("task");
    }
  };

  return (
    <div className="roommates-page">

      <div className="d-flex justify-content-center mt-4 mb-4">
        <div className="tabs-wrapper">
          <button
            onClick={() => setActiveTab("room")}
            className={`tab-btn ${activeTab === "room" ? "active" : ""}`}
          >
            {t("roommates.tabRoom")}
          </button>
          <button
            onClick={() => setActiveTab("search")}
            className={`tab-btn ${activeTab === "search" ? "active" : ""}`}
          >
            {t("roommates.tabSearch")}
          </button>
        </div>
      </div>

      {activeTab === "room" && (
        <div className="container text-center">
          <h1 className="h3 fw-bold text-white mb-2">Колесо фортуни кімнати</h1>
          <p className="text-secondary small mb-5">
            Справедливий розподіл домашніх обов'язків між сусідами
          </p>

          <div
            className="row justify-content-center g-4 mb-5 mx-auto"
            style={{ maxWidth: "1100px" }}
          >
            <div className="col-12 col-lg-6 text-start">
              <section className="roommate-card-block">
                <div
                  className="card-toggle-header"
                  onClick={() => setIsRoommatesOpen(!isRoommatesOpen)}
                >
                  <span className="block-title">
                    Сусіди по кімнаті ({roommates.length})
                  </span>
                  <button type="button" className="toggle-btn">
                    <i
                      className={`bi ${isRoommatesOpen ? "bi-dash" : "bi-plus"}`}
                    ></i>
                  </button>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateRows: isRoommatesOpen ? "1fr" : "0fr",
                    transition: "grid-template-rows 0.25s ease",
                  }}
                >
                  <div className="overflow-hidden">
                    <div className="card-inner-body">
                      <div className="position-relative mb-3">
                        <input
                          type="text"
                          className="custom-input w-100"
                          placeholder="Пошук серед ваших друзів..."
                          value={searchFriendTerm}
                          onChange={(e) => setSearchFriendTerm(e.target.value)}
                        />
                        {searchFriendTerm.length > 0 && (
                          <div className="friend-search-dropdown">
                            {filteredFriends.length > 0 ? (
                              filteredFriends.map((friend) => (
                                <div
                                  key={friend.id}
                                  className="friend-search-item"
                                  onClick={() => handleAddRoommate(friend.id)}
                                >
                                  <img
                                    src={friend.avatar || defaultUser}
                                    alt="avatar"
                                    className="rounded-circle me-2"
                                    style={{
                                      width: "26px",
                                      height: "26px",
                                      objectFit: "cover",
                                    }}
                                  />
                                  <span className="small fw-semibold text-white">
                                    {friend.firstName} {friend.lastName}
                                  </span>
                                </div>
                              ))
                            ) : (
                              <div className="p-2 text-secondary small">
                                Друзів не знайдено
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="d-flex flex-wrap gap-2">
                        {roommates.length === 0 && (
                          <p className="text-secondary small mb-0">
                            Сусідів ще не додано
                          </p>
                        )}
                        {roommates.map((rm) => (
                          <div key={rm.id} className="tag-pill-item">
                            <img
                              src={rm.avatar || defaultUser}
                              alt="avatar"
                              className="rounded-circle me-2"
                              style={{
                                width: "20px",
                                height: "20px",
                                objectFit: "cover",
                              }}
                            />
                            <span>{rm.firstName}</span>
                            <i
                              className="bi bi-x tag-close-icon"
                              onClick={() => handleDeleteRoommate(rm.id)}
                            ></i>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            <div className="col-12 col-lg-6 text-start">
              <section className="roommate-card-block">
                <div
                  className="card-toggle-header"
                  onClick={() => setIsTasksOpen(!isTasksOpen)}
                >
                  <span className="block-title">Завдання ({tasks.length})</span>
                  <button type="button" className="toggle-btn">
                    <i
                      className={`bi ${isTasksOpen ? "bi-dash" : "bi-plus"}`}
                    ></i>
                  </button>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateRows: isTasksOpen ? "1fr" : "0fr",
                    transition: "grid-template-rows 0.25s ease",
                  }}
                >
                  <div style={{ overflow: "hidden" }}>
                    <div className="card-inner-body">
                      <div className="d-flex mb-3">
                        <input
                          type="text"
                          className="custom-input flex-grow-1"
                          style={{ borderRadius: "8px 0 0 8px" }}
                          placeholder="Нове завдання..."
                          value={newTask}
                          onChange={(e) => setNewTask(e.target.value)}
                          onKeyDown={(e) =>
                            e.key === "Enter" && handleAddTask()
                          }
                        />
                        <button
                          className="btn-add-task"
                          onClick={handleAddTask}
                        >
                          +
                        </button>
                      </div>

                      <div className="d-flex flex-wrap gap-2">
                        {tasks.length === 0 && (
                          <p className="text-secondary small mb-0">
                            Список завдань порожній
                          </p>
                        )}
                        {tasks.map((task, index) => (
                          <div key={index} className="tag-pill-item">
                            <span>{task}</span>
                            <i
                              className="bi bi-x tag-close-icon"
                              onClick={() => handleDeleteTask(task)}
                            ></i>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>

          <div
            className="d-flex flex-column flex-md-row justify-content-center align-items-center gap-5 mx-auto"
            style={{ maxWidth: "950px" }}
          >
            <div style={{ width: "380px", height: "380px", flexShrink: 0 }}>
              <Wheel
                mustStartSpinning={mustSpin}
                prizeNumber={prizeNumber}
                data={wheelData}
                backgroundColors={
                  spinStage === "person"
                    ? ["#1a1a1a", "#262626", "#333333", "#404040"]
                    : ["#6930c3", "#5390d9", "#48bfe3", "#64dfdf"]
                }
                textColors={["#ffffff"]}
                outerBorderColor="#262626"
                outerBorderWidth={6}
                innerBorderColor="#121212"
                innerBorderWidth={14}
                innerRadius={15}
                radiusLineColor="#262626"
                radiusLineWidth={1}
                fontSize={13}
                onStopSpinning={handleStopSpinning}
              />
            </div>

            <div className="game-controls-panel text-start">
              {selectedTask && (
                <div className="selected-task-banner">
                  <span className="small text-secondary d-block mb-1">
                    📌 Обране завдання:
                  </span>
                  <strong className="text-white fs-6">{selectedTask}</strong>
                </div>
              )}

              <div className="small text-secondary mb-2">Учасники кімнати:</div>
              <div className="d-flex flex-wrap gap-2 mb-4">
                {allParticipants.map((p) => (
                  <span key={p.id} className="tag-pill-item">
                    {p.firstName} {p.id === user.uid && "(Ви)"}
                  </span>
                ))}
              </div>

              <button
                className="btn-spin-wheel"
                disabled={
                  allParticipants.length === 0 || tasks.length === 0 || mustSpin
                }
                onClick={handleSpinClick}
              >
                {mustSpin
                  ? spinStage === "task"
                    ? "Обираємо завдання..."
                    : "Обираємо сусіда..."
                  : "Крутити колесо"}
              </button>
            </div>
          </div>
        </div>
      )}

      {winner && !mustSpin && (
        <div className="congr-modal-overlay" onClick={() => setWinner(null)}>
          <div
            className="congr-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 fs-1">🎯</div>
            <h2 className="h4 fw-bold text-white mb-2">
              Вибір зроблено: {winner?.person?.firstName}!
            </h2>
            <p className="text-secondary mb-4">
              Завдання:{" "}
              <span className="winner-task-highlight">{winner?.task}</span>
            </p>
            <button
              className="btn-spin-wheel"
              style={{ height: "42px" }}
              onClick={() => {
                setWinner(null);
                setSelectedTask(null);
              }}
            >
              Зрозуміло
            </button>
          </div>
        </div>
      )}

      {activeTab === "search" && (
        <div className="container mt-2">
          <div className="text-center mb-5">
            <h1 className="h3 fw-bold text-white mb-2">
              {t("roommates.searchTitle")}
            </h1>
            <p className="text-secondary small m-0">
              {t("roommates.searchSubtitle")}
            </p>
          </div>

          {!currentUserAnswers ? (
            <div
              className="roommate-card-block text-center p-5 mx-auto"
              style={{ maxWidth: "500px" }}
            >
              <i className="bi bi-clipboard2-check fs-1 text-secondary mb-3 d-block"></i>
              <h2 className="h5 fw-bold text-white mb-2">
                {t("roommates.notPassedTest")}
              </h2>
              <p className="text-secondary small mb-4">
                {t("roommates.notPassedTestDesc")}
              </p>
              <button
                className="btn-spin-wheel"
                style={{ height: "42px" }}
                onClick={() => navigate("/test")}
              >
                {t("roommates.passTestBtn")}
              </button>
            </div>
          ) : isLoadingMatches ? (
            <div className="text-center py-5">
              <div
                className="spinner-border text-light mb-3"
                role="status"
              ></div>
              <p className="text-secondary small">
                {t("roommates.loadingMatches")}
              </p>
            </div>
          ) : potentialMatches.length === 0 ? (
            <div className="text-center py-5 text-secondary">
              <p>{t("roommates.noCandidates")}</p>
            </div>
          ) : (
            <div className="row g-4 justify-content-center">
              {potentialMatches.map((candidate) => {
                const theirAnswers = candidate.answers || {};
                return (
                  <div
                    key={candidate.id}
                    className="col-12 col-sm-6 col-lg-4 col-xl-3"
                  >
                    <article className="candidate-card">
                      <img
                        src={candidate.avatar || defaultUser}
                        alt="avatar"
                        className="candidate-avatar"
                      />
                      <h2 className="candidate-name text-truncate">
                        {candidate.firstName} {candidate.lastName}
                      </h2>

                      <div className="d-flex justify-content-center gap-2 mb-4">
                        {matchCategories.map((cat) => {
                          const status = calculateBlockStatus(
                            currentUserAnswers,
                            theirAnswers,
                            cat.ids,
                          );
                          const categoryTitle = t(`test.categories.${cat.key}`);
                          const matchVerdict =
                            status === "green"
                              ? t("roommates.compatible")
                              : t("roommates.incompatible");

                          return (
                            <div
                              key={cat.key}
                              className={`compat-icon-badge ${status === "green" ? "compat-green" : "compat-red"}`}
                              title={`${categoryTitle}: ${matchVerdict}`}
                            >
                              <span>{cat.icon}</span>
                            </div>
                          );
                        })}
                      </div>

                      <button
                        type="button"
                        className="btn-message-candidate"
                        onClick={() =>
                          navigate("/chat", {
                            state: { startChatWith: candidate },
                          })
                        }
                      >
                        <i className="bi bi-chat-text"></i>{" "}
                        {t("roommates.writeMessage")}
                      </button>
                    </article>
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
