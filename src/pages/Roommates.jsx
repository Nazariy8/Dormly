// import React, { useState, useEffect } from "react";
// import {
//   doc,
//   updateDoc,
//   arrayUnion,
//   arrayRemove,
//   onSnapshot,
//   getDoc,
// } from "firebase/firestore";
// import { db } from "../firebase";
// import defaultUser from "../img/profile/user.jpg";
// import { Wheel } from "react-custom-roulette"; // Імпортуємо наше колесо!
// import Header from "../components/Header";

// const Roommates = ({ user }) => {
//   // --- СТАНИ ДЛЯ ДАНИХ З БАЗИ ---
//   const [roommates, setRoommates] = useState([]);
//   const [tasks, setTasks] = useState([]);
//   const [myFriends, setMyFriends] = useState([]);

//   // --- СТАНИ ДЛЯ UI ---
//   const [isRoommatesOpen, setIsRoommatesOpen] = useState(false);
//   const [isTasksOpen, setIsTasksOpen] = useState(false);
//   const [searchFriendTerm, setSearchFriendTerm] = useState("");
//   const [newTask, setNewTask] = useState("");

//   // --- СТАНИ ДЛЯ КОЛЕСА ФОРТУНИ ---
//   const [mustSpin, setMustSpin] = useState(false);
//   const [prizeNumber, setPrizeNumber] = useState(0);
//   const [winner, setWinner] = useState(null); // Хто виграв завдання

//   // --- СИНХРОНІЗАЦІЯ З БАЗОЮ ---
//   useEffect(() => {
//     if (!user) return;
//     const userRef = doc(db, "users", user.uid);

//     const unsubscribe = onSnapshot(userRef, async (docSnap) => {
//       if (docSnap.exists()) {
//         const data = docSnap.data();
//         if (data.tasks) setTasks(data.tasks);

//         if (data.friends && data.friends.length > 0) {
//           const friendsData = await Promise.all(
//             data.friends.map(async (friendId) => {
//               const fSnap = await getDoc(doc(db, "users", friendId));
//               return { id: fSnap.id, ...fSnap.data() };
//             }),
//           );
//           setMyFriends(friendsData);
//         } else {
//           setMyFriends([]);
//         }

//         if (data.roommates && data.roommates.length > 0) {
//           const roommatesData = await Promise.all(
//             data.roommates.map(async (rmId) => {
//               const rSnap = await getDoc(doc(db, "users", rmId));
//               return { id: rSnap.id, ...rSnap.data() };
//             }),
//           );
//           setRoommates(roommatesData);
//         } else {
//           setRoommates([]);
//         }
//       }
//     });
//     return () => unsubscribe();
//   }, [user]);

//   const filteredFriends = myFriends.filter(
//     (friend) =>
//       friend.firstName.toLowerCase().includes(searchFriendTerm.toLowerCase()) &&
//       !roommates.some((rm) => rm.id === friend.id),
//   );

//   // --- ФУНКЦІЇ ДОДАВАННЯ ТА ВИДАЛЕННЯ ---
//   const handleAddRoommate = async (friendId) => {
//     try {
//       await updateDoc(doc(db, "users", user.uid), {
//         roommates: arrayUnion(friendId),
//       });
//       setSearchFriendTerm("");
//     } catch (error) {
//       console.error("Помилка додавання сусіда:", error);
//     }
//   };

//   const handleDeleteRoommate = async (friendId) => {
//     try {
//       await updateDoc(doc(db, "users", user.uid), {
//         roommates: arrayRemove(friendId),
//       });
//     } catch (error) {
//       console.error("Помилка видалення сусіда:", error);
//     }
//   };

//   const handleAddTask = async () => {
//     if (!newTask.trim()) return;
//     try {
//       await updateDoc(doc(db, "users", user.uid), {
//         tasks: arrayUnion(newTask.trim()),
//       });
//       setNewTask("");
//     } catch (error) {
//       console.error("Помилка додавання завдання:", error);
//     }
//   };

//   const handleDeleteTask = async (taskText) => {
//     try {
//       await updateDoc(doc(db, "users", user.uid), {
//         tasks: arrayRemove(taskText),
//       });
//     } catch (error) {
//       console.error("Помилка видалення завдання:", error);
//     }
//   };

//   // --- ЛОГІКА КОЛЕСА ---
//   // Форматуємо дані для бібліотеки
//   const wheelData =
//     tasks.length > 0
//       ? tasks.map((task) => ({ option: task }))
//       : [{ option: "Додайте завдання" }];

//   const handleSpinClick = () => {
//     if (tasks.length === 0 || roommates.length === 0 || mustSpin) return;

//     setWinner(null); // Ховаємо попереднього переможця

//     // Вибираємо випадкове завдання
//     const newPrizeNumber = Math.floor(Math.random() * tasks.length);
//     setPrizeNumber(newPrizeNumber);

//     // Запускаємо анімацію
//     setMustSpin(true);
//   };

//   const handleStopSpinning = () => {
//     setMustSpin(false);
//     // Вибираємо випадкового сусіда
//     const randomRoommateIndex = Math.floor(Math.random() * roommates.length);
//     setWinner({
//       person: roommates[randomRoommateIndex],
//       task: tasks[prizeNumber],
//     });
//   };

//   return (
//     <div
//       className="roommates-page"
//       style={{ minHeight: "100vh", padding: "20px" }}
//     >
//       <Header user={user} />
//       <div className="container mt-5 text-center">
//         <h2 className="fw-bold mb-2">Колесо фортуни для сусідів по кімнаті</h2>
//         <p className="mb-5 fw-bold">
//           Не можете вирішити хто що робить? Нехай колесо вирішить!
//         </p>

//         {/* --- АКОРДЕОН СУСІДІВ --- */}
//         <div
//           className="card shadow-sm mb-4 border-0 rounded-4 mx-auto"
//           style={{ maxWidth: "800px" }}
//         >
//           <div
//             className="card-header bg-white d-flex justify-content-between align-items-center p-3 rounded-4"
//             style={{
//               cursor: "pointer",
//               borderBottom: isRoommatesOpen ? "1px solid #eee" : "none",
//             }}
//             onClick={() => setIsRoommatesOpen(!isRoommatesOpen)}
//           >
//             <span className="fw-bold">Сусіди по кімнаті</span>
//             <button
//               className="btn btn-sm rounded-pill"
//               style={{ backgroundColor: "#f3f0fb", color: "#666" }}
//             >
//               {isRoommatesOpen
//                 ? `Сховати сусідів (${roommates.length})`
//                 : `Показати сусідів (${roommates.length})`}
//             </button>
//           </div>

//           {isRoommatesOpen && (
//             <div className="card-body bg-white rounded-bottom-4 overflow-visible">
//               <div className="position-relative mb-3 text-start">
//                 <div className="input-group">
//                   <input
//                     type="text"
//                     className="form-control bg-light border-0"
//                     placeholder="Почніть вводити ім'я друга..."
//                     value={searchFriendTerm}
//                     onChange={(e) => setSearchFriendTerm(e.target.value)}
//                   />
//                   <span className="input-group-text bg-light border-0">
//                     <i className="bi bi-search"></i>
//                   </span>
//                 </div>

//                 {searchFriendTerm.length > 0 && (
//                   <div
//                     className="position-absolute w-100 bg-white shadow rounded-3 mt-1"
//                     style={{
//                       zIndex: 1000,
//                       maxHeight: "200px",
//                       overflowY: "auto",
//                     }}
//                   >
//                     {filteredFriends.length > 0 ? (
//                       filteredFriends.map((friend) => (
//                         <div
//                           key={friend.id}
//                           className="d-flex align-items-center p-2 border-bottom"
//                           style={{ cursor: "pointer" }}
//                           onClick={() => handleAddRoommate(friend.id)}
//                           onMouseEnter={(e) =>
//                             (e.currentTarget.style.backgroundColor = "#f8f9fa")
//                           }
//                           onMouseLeave={(e) =>
//                             (e.currentTarget.style.backgroundColor =
//                               "transparent")
//                           }
//                         >
//                           <img
//                             src={friend.avatar || defaultUser}
//                             alt="avatar"
//                             className="rounded-circle me-2"
//                             style={{
//                               width: "30px",
//                               height: "30px",
//                               objectFit: "cover",
//                             }}
//                           />
//                           <span
//                             className="fw-bold"
//                             style={{ fontSize: "14px" }}
//                           >
//                             {friend.firstName} {friend.lastName}
//                           </span>
//                         </div>
//                       ))
//                     ) : (
//                       <div className="p-2 text-muted small">
//                         Друзів не знайдено або вони вже в кімнаті
//                       </div>
//                     )}
//                   </div>
//                 )}
//               </div>

//               <ul className="list-group list-group-flush text-start">
//                 {roommates.length === 0 && (
//                   <p className="text-muted small text-center mt-2">
//                     Ви ще не додали сусідів
//                   </p>
//                 )}
//                 {roommates.map((rm) => (
//                   <li
//                     key={rm.id}
//                     className="list-group-item d-flex justify-content-between align-items-center border rounded mb-2 py-2 px-3 bg-light"
//                   >
//                     <div className="d-flex align-items-center">
//                       <img
//                         src={rm.avatar || defaultUser}
//                         alt="avatar"
//                         className="rounded-circle me-2"
//                         style={{
//                           width: "35px",
//                           height: "35px",
//                           objectFit: "cover",
//                         }}
//                       />
//                       <span className="fw-bold">{rm.firstName}</span>
//                     </div>
//                     <button
//                       className="btn border-0 text-danger p-0"
//                       onClick={() => handleDeleteRoommate(rm.id)}
//                     >
//                       <i className="bi bi-trash fs-5"></i>
//                     </button>
//                   </li>
//                 ))}
//               </ul>
//             </div>
//           )}
//         </div>

//         {/* --- АКОРДЕОН ЗАВДАНЬ --- */}
//         <div
//           className="card shadow-sm mb-5 border-0 rounded-4 mx-auto"
//           style={{ maxWidth: "800px" }}
//         >
//           <div
//             className="card-header bg-white d-flex justify-content-between align-items-center p-3 rounded-4"
//             style={{
//               cursor: "pointer",
//               borderBottom: isTasksOpen ? "1px solid #eee" : "none",
//             }}
//             onClick={() => setIsTasksOpen(!isTasksOpen)}
//           >
//             <span className="fw-bold">Завдання</span>
//             <button
//               className="btn btn-sm rounded-pill"
//               style={{ backgroundColor: "#f3f0fb", color: "#666" }}
//             >
//               {isTasksOpen
//                 ? `Сховати завдання (${tasks.length})`
//                 : `Показати завдання (${tasks.length})`}
//             </button>
//           </div>

//           {isTasksOpen && (
//             <div className="card-body bg-white rounded-bottom-4">
//               <div className="input-group mb-3">
//                 <input
//                   type="text"
//                   className="form-control bg-light border-0"
//                   placeholder="Додати завдання (наприклад: Винести сміття)"
//                   value={newTask}
//                   onChange={(e) => setNewTask(e.target.value)}
//                   onKeyDown={(e) => e.key === "Enter" && handleAddTask()}
//                 />
//                 <button
//                   className="btn fw-bold text-white"
//                   style={{ backgroundColor: "#8a4fff" }}
//                   onClick={handleAddTask}
//                 >
//                   <i className="bi bi-plus-lg"></i>
//                 </button>
//               </div>

//               <ul className="list-group list-group-flush text-start">
//                 {tasks.length === 0 && (
//                   <p className="text-muted small text-center mt-2">
//                     Список завдань порожній
//                   </p>
//                 )}
//                 {tasks.map((task, index) => (
//                   <li
//                     key={index}
//                     className="list-group-item d-flex justify-content-between align-items-center border rounded mb-2 py-2 px-3 bg-light"
//                   >
//                     <span className="fw-bold text-secondary">{task}</span>
//                     <button
//                       className="btn border-0 text-danger p-0"
//                       onClick={() => handleDeleteTask(task)}
//                     >
//                       <i className="bi bi-trash fs-5"></i>
//                     </button>
//                   </li>
//                 ))}
//               </ul>
//             </div>
//           )}
//         </div>

//         {/* --- ЗОНА КОЛЕСА ТА КНОПОК --- */}
//         <div
//           className="d-flex flex-column flex-md-row justify-content-center align-items-center gap-5 mx-auto mt-5"
//           style={{ maxWidth: "900px" }}
//         >
//           {/* Саме колесо */}
//           <div className="d-flex justify-content-center align-items-center">
//             <Wheel
//               mustStartSpinning={mustSpin}
//               prizeNumber={prizeNumber}
//               data={wheelData}
//               backgroundColors={["#8a4fff", "#20c997"]} // Твої кольори з макету
//               textColors={["#ffffff"]}
//               outerBorderColor="#ffffff"
//               outerBorderWidth={10}
//               innerBorderColor="#ffffff"
//               innerBorderWidth={20}
//               innerRadius={20}
//               radiusLineColor="#ffffff"
//               radiusLineWidth={2}
//               fontSize={14}
//               onStopSpinning={handleStopSpinning}
//             />
//           </div>

//           {/* Панель керування грою */}
//           <div className="game-controls text-center text-md-start">
//             <h6 className="fw-bold mb-3">
//               Хто буде виконувати завдання прямо зараз?
//             </h6>

//             <div className="d-flex flex-column gap-2 mb-4">
//               {roommates.length === 0 && (
//                 <p className="text-muted small">Додайте сусідів зверху</p>
//               )}
//               {roommates.map((rm) => (
//                 <button
//                   key={rm.id}
//                   className="btn bg-white shadow-sm fw-bold px-4 py-2"
//                   style={{
//                     borderRadius: "10px",
//                     color: "var(--text-main)",
//                     border:
//                       winner && winner.person.id === rm.id
//                         ? "2px solid #8a4fff"
//                         : "none", // Підсвічуємо переможця
//                   }}
//                 >
//                   {rm.firstName}
//                 </button>
//               ))}
//             </div>

//             <button
//               className="btn fw-bold text-white px-5 py-3 shadow"
//               style={{
//                 backgroundColor: "#8a4fff",
//                 borderRadius: "15px",
//                 width: "100%",
//               }}
//               disabled={
//                 roommates.length === 0 || tasks.length === 0 || mustSpin
//               }
//               onClick={handleSpinClick}
//             >
//               {mustSpin ? "Крутимо..." : "Покрутіть колесо!"}
//             </button>

//             {/* Блок результату */}
//             {winner && !mustSpin && (
//               <div
//                 className="mt-4 p-3 bg-white rounded-4 shadow-sm text-center border"
//                 style={{ borderColor: "#20c997" }}
//               >
//                 <h5 className="mb-1 fw-bold" style={{ color: "#8a4fff" }}>
//                   Вітаємо, {winner.person.firstName}! 🎉
//                 </h5>
//                 <p className="mb-0 text-secondary">
//                   Твоє завдання: <strong>{winner.task}</strong>
//                 </p>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Roommates;
