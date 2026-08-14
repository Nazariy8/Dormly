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
  getDocs
} from "firebase/firestore";
import { db } from "../firebase";
import defaultUser from "../img/profile/user.jpg";
import { Wheel } from "react-custom-roulette";
import Header from "../components/Header";
import { useNavigate } from "react-router-dom"; // Додано для переходу на сторінку тесту
import "../css/roommate.scss"
const Roommates = ({ user }) => {
  const navigate = useNavigate();

  // --- СТАНИ ДЛЯ ДАНИХ З БАЗИ ---
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

  // --- СИНХРОНІЗАЦІЯ ПРОФІЛЮ КОРИСТУВАЧА ---
  useEffect(() => {
    if (!user) return;
    const userRef = doc(db, "users", user.uid);

    const unsubscribe = onSnapshot(userRef, async (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.tasks) setTasks(data.tasks);
        
        // Зберігаємо відповіді користувача на тест
        if (data.answers) setCurrentUserAnswers(data.answers);

        if (data.friends && data.friends.length > 0) {
          const friendsData = await Promise.all(
            data.friends.map(async (friendId) => {
              const fSnap = await getDoc(doc(db, "users", friendId));
              return { id: fSnap.id, ...fSnap.data() };
            })
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
            })
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
          // Шукаємо всіх користувачів, які пройшли тест
          const q = query(collection(db, "users"), where("hasPassedTest", "==", true));
          const snapshot = await getDocs(q);
          const usersList = [];
          snapshot.forEach((docSnap) => {
            // Не додаємо самого себе
            if (docSnap.id !== user.uid) {
              usersList.push({ id: docSnap.id, ...docSnap.data() });
            }
          });
          setPotentialMatches(usersList);
        } catch (error) {
          console.error("Помилка завантаження кандидатів:", error);
        } finally {
          setIsLoadingMatches(false);
        }
      };
      fetchMatches();
    }
  }, [activeTab, currentUserAnswers, user]);

  // --- НАЛАШТУВАННЯ КАТЕГОРІЙ ТЕСТУ ---
  const matchCategories = [
    { key: "cleanliness", ids: ["1", "2", "3"], icon: "🧹", label: "Чистота і порядок" },
    { key: "routine", ids: ["4", "5", "6"], icon: "⏰", label: "Режим дня і шум" },
    { key: "social", ids: ["7", "8", "9"], icon: "🍕", label: "Соціальна поведінка" },
    { key: "rules", ids: ["10", "11", "12"], icon: "🤝", label: "Правила і відповідальність" },
    { key: "comfort", ids: ["13", "14", "15"], icon: "🛋️", label: "Побут і комфорт" },
  ];

  // --- ФУНКЦІЯ ПІДРАХУНКУ СУМІСНОСТІ ---
  const calculateBlockStatus = (myAnswers, theirAnswers, questionIds) => {
    if (!myAnswers || !theirAnswers) return "red";
    let matchCount = 0;
    questionIds.forEach((id) => {
      // Якщо відповіді абсолютно однакові — зараховуємо збіг
      if (myAnswers[id] && theirAnswers[id] && myAnswers[id] === theirAnswers[id]) {
        matchCount++;
      }
    });
    // Логіка: 2 або більше збігів = зелений, менше 2 = червоний
    return matchCount >= 2 ? "green" : "red";
  };


  const filteredFriends = myFriends.filter(
    (friend) =>
      friend.firstName?.toLowerCase().includes(searchFriendTerm.toLowerCase()) &&
      !roommates.some((rm) => rm.id === friend.id)
  );

  // --- ФУНКЦІЇ ДОДАВАННЯ ТА ВИДАЛЕННЯ ---
  const handleAddRoommate = async (friendId) => {
    try {
      await updateDoc(doc(db, "users", user.uid), { roommates: arrayUnion(friendId) });
      setSearchFriendTerm("");
    } catch (error) { console.error(error); }
  };
  const handleDeleteRoommate = async (friendId) => {
    try { await updateDoc(doc(db, "users", user.uid), { roommates: arrayRemove(friendId) }); } 
    catch (error) { console.error(error); }
  };
  const handleAddTask = async () => {
    if (!newTask.trim()) return;
    try {
      await updateDoc(doc(db, "users", user.uid), { tasks: arrayUnion(newTask.trim()) });
      setNewTask("");
    } catch (error) { console.error(error); }
  };
  const handleDeleteTask = async (taskText) => {
    try { await updateDoc(doc(db, "users", user.uid), { tasks: arrayRemove(taskText) }); } 
    catch (error) { console.error(error); }
  };

  // --- ЛОГІКА КОЛЕСА ---
  const wheelData = tasks.length > 0 ? tasks.map((task) => ({ option: task })) : [{ option: "Додайте завдання" }];
  const handleSpinClick = () => {
    if (tasks.length === 0 || roommates.length === 0 || mustSpin) return;
    setWinner(null);
    setPrizeNumber(Math.floor(Math.random() * tasks.length));
    setMustSpin(true);
  };
  const handleStopSpinning = () => {
    setMustSpin(false);
    const randomRoommateIndex = Math.floor(Math.random() * roommates.length);
    setWinner({ person: roommates[randomRoommateIndex], task: tasks[prizeNumber] });
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
      {/* --- КІНЕЦЬ МІНІ-МЕНЮ --- */}

      {/* ВКЛАДКА "КІМНАТА" (КОЛЕСО)         */}
      {activeTab === "room" && (
        <div className="container mt-4 text-center">
          <h2 className="fw-bold mb-2">
            Колесо фортуни для сусідів по кімнаті
          </h2>
          <p className="mb-5 fw-bold text-secondary">
            Не можете вирішити хто що робить? Нехай колесо вирішить!
          </p>

          <div
            className="card roommates-block shadow-sm mb-4 border-0 rounded-4 mx-auto"
            style={{ maxWidth: "800px" }}
          >
            <div
              className="card-header d-flex justify-content-between align-items-center p-3 rounded-4"
              style={{
                cursor: "pointer",
                borderBottom: isRoommatesOpen ? "1px solid #eee" : "none",
              }}
              onClick={() => setIsRoommatesOpen(!isRoommatesOpen)}
            >
              <span className="fw-bold">Сусіди по кімнаті</span>
              <button
                className="btn btn-sm rounded-pill"
                style={{ backgroundColor: "#f3f0fb", color: "#666" }}
              >
                {isRoommatesOpen
                  ? `Сховати сусідів (${roommates.length})`
                  : `Показати сусідів (${roommates.length})`}
              </button>
            </div>
            {isRoommatesOpen && (
              <div className="card-body rounded-bottom-4 overflow-visible">
                <div className=" position-relative mb-3 text-start">
                  <input
                    type="text"
                    className="form-control text-white"
                    placeholder="Почніть вводити ім'я друга..."
                    value={searchFriendTerm}
                    onChange={(e) => setSearchFriendTerm(e.target.value)}
                  />
                  {searchFriendTerm.length > 0 && (
                    <div
                      className="position-absolute w-100 bg-white shadow rounded-3 mt-1"
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
                                "#f8f9fa")
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
                              style={{ fontSize: "14px" }}
                            >
                              {friend.firstName} {friend.lastName}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="p-2 text-muted small">
                          Друзів не знайдено або вони вже в кімнаті
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <ul className="list-group list-group-flush text-start">
                  {roommates.length === 0 && (
                    <p className="text-muted small text-center mt-2">
                      Ви ще не додали сусідів
                    </p>
                  )}
                  {roommates.map((rm) => (
                    <li
                      key={rm.id}
                      className="list-group-item d-flex justify-content-between align-items-center border rounded mb-2 py-2 px-3 bg-light"
                    >
                      <div className="d-flex align-items-center">
                        <img
                          src={rm.avatar || defaultUser}
                          alt="avatar"
                          className="rounded-circle me-2"
                          style={{
                            width: "35px",
                            height: "35px",
                            objectFit: "cover",
                          }}
                        />
                        <span className="fw-bold">{rm.firstName}</span>
                      </div>
                      <button
                        className="btn border-0 text-danger p-0"
                        onClick={() => handleDeleteRoommate(rm.id)}
                      >
                        <i className="bi bi-trash fs-5"></i>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div
            className="card shadow-sm tasks-block mb-5 border-0 rounded-4 mx-auto"
            style={{ maxWidth: "800px" }}
          >
            <div
              className="card-header d-flex justify-content-between align-items-center p-3 rounded-4"
              style={{
                cursor: "pointer",
                borderBottom: isTasksOpen ? "1px solid #eee" : "none",
              }}
              onClick={() => setIsTasksOpen(!isTasksOpen)}
            >
              <span className="fw-bold">Завдання</span>
              <button
                className="btn btn-sm rounded-pill"
                style={{ backgroundColor: "#f3f0fb", color: "#666" }}
              >
                {isTasksOpen
                  ? `Сховати завдання (${tasks.length})`
                  : `Показати завдання (${tasks.length})`}
              </button>
            </div>
            {isTasksOpen && (
              <div className="card-body rounded-bottom-4">
                <div className="input-group mb-3">
                  <input
                    type="text"
                    className="form-control bg-light border-0"
                    placeholder="Додати завдання (наприклад: Винести сміття)"
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddTask()}
                  />
                  <button
                    className="btn fw-bold text-white"
                    style={{ backgroundColor: "#8a4fff" }}
                    onClick={handleAddTask}
                  >
                    <i className="bi bi-plus-lg"></i>
                  </button>
                </div>
                <ul className="list-group list-group-flush text-start">
                  {tasks.length === 0 && (
                    <p className="small text-center mt-2">
                      Список завдань порожній
                    </p>
                  )}
                  {tasks.map((task, index) => (
                    <li
                      key={index}
                      className="list-group-item d-flex justify-content-between align-items-center border rounded mb-2 py-2 px-3 bg-light"
                    >
                      <span className="fw-bold text-secondary">{task}</span>
                      <button
                        className="btn border-0 text-danger p-0"
                        onClick={() => handleDeleteTask(task)}
                      >
                        <i className="bi bi-trash fs-5"></i>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div
            className="d-flex flex-column flex-md-row justify-content-center align-items-center gap-5 mx-auto mt-5"
            style={{ maxWidth: "900px" }}
          >
            <div className="d-flex justify-content-center align-items-center">
              <Wheel
                mustStartSpinning={mustSpin}
                prizeNumber={prizeNumber}
                data={wheelData}
                backgroundColors={["#8a4fff", "#20c997"]}
                textColors={["#ffffff"]}
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
            <div className="game-controls text-center text-md-start">
              <h6 className="fw-bold mb-3">
                Хто буде виконувати завдання прямо зараз?
              </h6>
              <div className="d-flex flex-column gap-2 mb-4">
                {roommates.length === 0 && (
                  <p className="text-muted small">Додайте сусідів зверху</p>
                )}
                {roommates.map((rm) => (
                  <button
                    key={rm.id}
                    className="btn shadow-sm fw-bold px-4 py-2"
                    style={{
                      backgroundColor: "var(--bg-main)",
                      borderRadius: "10px",
                      color: "var(--text-main)",
                      border:
                        winner && winner.person.id === rm.id
                          ? "2px solid #8a4fff"
                          : "none",
                    }}
                  >
                    {rm.firstName}
                  </button>
                ))}
              </div>
              <button
                className="btn fw-bold text-white px-5 py-3 shadow"
                style={{
                  backgroundColor: "#8a4fff",
                  borderRadius: "15px",
                  width: "100%",
                }}
                disabled={
                  roommates.length === 0 || tasks.length === 0 || mustSpin
                }
                onClick={handleSpinClick}
              >
                {mustSpin ? "Крутимо..." : "Покрутіть колесо!"}
              </button>
              {winner && !mustSpin && (
                <div
                  className="mt-4 p-3 bg-white rounded-4 shadow-sm text-center border"
                  style={{ borderColor: "#20c997" }}
                >
                  <h5 className="mb-1 fw-bold" style={{ color: "#8a4fff" }}>
                    Вітаємо, {winner.person.firstName}! 🎉
                  </h5>
                  <p className="mb-0">
                    Твоє завдання: <strong>{winner.task}</strong>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ВКЛАДКА "ЗНАЙТИ СПІВЖИТЕЛЯ" (МЕТЧИНГ)   */}
      {activeTab === "search" && (
        <div className="container mt-4">
          <h2 className="fw-bold mb-2 text-center">Пошук ідеального сусіда</h2>
          <p className="text-center mb-5">
            Аналізуємо сумісність за 5 основними категоріями побуту
          </p>

          {/* Якщо користувач сам не пройшов тест */}
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
            /* Сітка карток користувачів */
            <div className="row justify-content-center">
              {potentialMatches.map((candidate) => {
                // Відповіді кандидата
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

                        {/* Блок з 5 індикаторами */}
                        <div className="d-flex justify-content-center gap-2 mb-3">
                          {matchCategories.map((cat) => {
                            // Перевіряємо сумісність саме для цього блоку
                            const status = calculateBlockStatus(
                              currentUserAnswers,
                              theirAnswers,
                              cat.ids,
                            );
                            // Зелений або червоний колір
                            const bgColor =
                              status === "green" ? "#20c997" : "#ff6b6b";

                            return (
                              <div
                                key={cat.key}
                                className="rounded-circle d-flex justify-content-center align-items-center shadow-sm"
                                title={`${cat.label} (${status === "green" ? "Сумісно" : "Різні погляди"})`} // Tooltip при наведенні
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

                        {/* Кнопка написати */}
                        <button
                          className="btn btn-light w-100 mt-4 rounded-pill fw-bold text-secondary"
                          onClick={() =>
                            navigate("/chat", {
                              state: { startChatWith: candidate },
                            })
                          } // Або може відкрити модалку профілю
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
}


export default Roommates;