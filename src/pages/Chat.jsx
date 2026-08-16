import React, { useState, useEffect, useRef, setContextMenu } from "react";
import Header from "../components/Header";

import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase";

import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  addDoc,
  serverTimestamp,
  onSnapshot,
  orderBy,
  deleteDoc,
  increment,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { db } from "../firebase"; // Перевір шлях до файлу firebase
import "../css/chat.scss";
import defaultUser from "../img/profile/user.jpg"; // Перевір шлях до дефолтної аватарки

const Chat = ({ user }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const [activeChatUser, setActiveChatUser] = useState(null);

  // Стан для збереження чернеток (беремо з localStorage, якщо вони там є)
  const [drafts, setDrafts] = useState(() => {
    const savedDrafts = localStorage.getItem("chat_drafts");
    return savedDrafts ? JSON.parse(savedDrafts) : {};
  });

  const [messages, setMessages] = useState([]); // Стан для масиву повідомлень
  const messagesEndRef = useRef(null);

  const [chatHistory, setChatHistory] = useState([]);

  const [friendStatus, setFriendStatus] = useState("none");

  const [editingMessage, setEditingMessage] = useState(null); // Зберігає об'єкт повідомлення, яке ми зараз редагуємо
  const [editDraft, setEditDraft] = useState(""); // Текст, який ми змінюємо

  const [contextMenu, setContextMenu] = useState(null);

  const [showSocialModal, setShowSocialModal] = useState(false);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [myFriends, setMyFriends] = useState([]);

  const [isUploading, setIsUploading] = useState(false);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !activeChatUser) return;

    setIsUploading(true); // Вмикаємо крутилку

    const storageRef = ref(storage, `chat_images/${Date.now()}_${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      null,
      (error) => {
        console.error("Помилка завантаження:", error);
        alert("Помилка завантаження! Перевір консоль.");
        setIsUploading(false); // Вимикаємо крутилку при помилці
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        
        await sendImageMessage(downloadURL);
        
        setIsUploading(false); // Вимикаємо крутилку
        
        // НАДІЙНЕ очищення інпуту, щоб можна було скинути те саме фото ще раз
        const fileInput = document.getElementById("image-input");
        if (fileInput) fileInput.value = "";
      }
    );
  };

  const sendImageMessage = async (url) => {
    const combinedId =
      user.uid > activeChatUser.id
        ? user.uid + activeChatUser.id
        : activeChatUser.id + user.uid;

    const messageData = {
      senderId: user.uid,
      createdAt: serverTimestamp(),
      image: url,
      text: "",
    };

    // Додаємо повідомлення
    await addDoc(collection(db, "chats", combinedId, "messages"), messageData);

    // Оновлюємо кімнату (ДОДАЛИ ЛІЧИЛЬНИКИ!)
    await updateDoc(doc(db, "chats", combinedId), {
      lastMessage: "📷 Фотографія",
      lastMessageSender: user.uid,
      updatedAt: serverTimestamp(),
      [`unreadCounts.${activeChatUser.id}`]: increment(1), // Співрозмовнику +1
      [`unreadCounts.${user.uid}`]: 0 // Собі 0
    });
  };

  useEffect(() => {
    if (!user) return;

    // 1. Слухаємо вхідні запити
    const qReq = query(
      collection(db, "friend_requests"),
      where("receiverId", "==", user.uid),
      where("status", "==", "pending"),
    );

    const unsubReq = onSnapshot(qReq, async (snapshot) => {
      const reqs = await Promise.all(
        snapshot.docs.map(async (d) => {
          const data = d.data();
          const userSnap = await getDoc(doc(db, "users", data.senderId));
          return { id: d.id, ...data, senderData: userSnap.data() };
        }),
      );
      setIncomingRequests(reqs);
    });

    // 2. Слухаємо список друзів (припустимо, вони в документі юзера в масиві friends)
    const unsubFriends = onSnapshot(doc(db, "users", user.uid), async (d) => {
      if (d.exists() && d.data().friends) {
        const friendsIds = d.data().friends;
        const friendsData = await Promise.all(
          friendsIds.map(async (id) => {
            const fSnap = await getDoc(doc(db, "users", id));
            return { id: fSnap.id, ...fSnap.data() };
          }),
        );
        setMyFriends(friendsData);
      }
    });

    return () => {
      unsubReq();
      unsubFriends();
    };
  }, [user]);
  // Магія пошуку в реальному часі
  // Магія точного пошуку
  useEffect(() => {
    const searchUsers = async () => {
      // Чекаємо, поки користувач введе хоча б 3 символи
      const cleanSearch = searchTerm.trim().toLowerCase();
      if (cleanSearch.length < 3) {
        setSearchResults([]);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      try {
        const usersRef = collection(db, "users");

        // МАГІЯ ТУТ: Шукаємо ТОЧНИЙ збіг (==)
        const q = query(usersRef, where("username", "==", cleanSearch));

        const querySnapshot = await getDocs(q);
        const users = [];

        querySnapshot.forEach((doc) => {
          // Не виводимо самого себе
          if (user && doc.id !== user.uid) {
            users.push({ id: doc.id, ...doc.data() });
          }
        });

        setSearchResults(users);
      } catch (error) {
        console.error("Помилка точного пошуку:", error);
      } finally {
        setIsSearching(false);
      }
    };

    // Затримка 500мс
    const timeoutId = setTimeout(() => {
      searchUsers();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, user]);

  // Функція відправки повідомлення
  const handleSendMessage = async () => {
    // Беремо текст із нашої чернетки для активного користувача
    const text = drafts[activeChatUser?.id];

    // Якщо тексту немає або там самі пробіли - нічого не робимо
    if (!text || text.trim() === "") return;

    // Створюємо унікальний ID кімнати
    const combinedId =
      user.uid > activeChatUser.id
        ? user.uid + activeChatUser.id
        : activeChatUser.id + user.uid;

    try {
      const chatRef = doc(db, "chats", combinedId);
      const chatSnap = await getDoc(chatRef);

      // Якщо це перше повідомлення і кімнати ще немає - створюємо її
      if (!chatSnap.exists()) {
        await setDoc(chatRef, {
          participants: [user.uid, activeChatUser.id],
        });
      }

      // 1. Додаємо саме повідомлення у підколекцію "messages"
      await addDoc(collection(db, "chats", combinedId, "messages"), {
        text: text,
        senderId: user.uid,
        createdAt: serverTimestamp(), // Точний час сервера Firebase
      });

      // 2. Оновлюємо "Останнє повідомлення" ТА ЛІЧИЛЬНИКИ у самій кімнаті
      await updateDoc(chatRef, {
        lastMessage: text,
        lastMessageSender: user.uid,
        updatedAt: serverTimestamp(),
        // НОВЕ: Додаємо логіку непрочитаних повідомлень
        [`unreadCounts.${activeChatUser.id}`]: increment(1), // Співрозмовнику +1
        [`unreadCounts.${user.uid}`]: 0, // Собі ставимо 0, бо ми зараз в цьому чаті
      });

      // 3. Очищаємо поле вводу та видаляємо чернетку з пам'яті
      setDrafts((prev) => {
        const newDrafts = { ...prev, [activeChatUser.id]: "" };
        localStorage.setItem("chat_drafts", JSON.stringify(newDrafts));
        return newDrafts;
      });
    } catch (error) {
      console.error("Помилка відправки повідомлення:", error);
    }
  };

  // Функція відправки заявки в друзі
  const handleAddFriend = async () => {
    if (!activeChatUser || !user) return;

    try {
      // Створюємо новий документ у колекції friend_requests
      await addDoc(collection(db, "friend_requests"), {
        senderId: user.uid,
        receiverId: activeChatUser.id,
        status: "pending",
        createdAt: serverTimestamp(),
      });

      // Миттєво оновлюємо кнопку на екрані
      setFriendStatus("pending");
    } catch (error) {
      console.error("Помилка при додаванні в друзі:", error);
    }
  };

  // Функція скасування заявки в друзі
  const handleCancelRequest = async () => {
    if (!activeChatUser || !user) return;

    try {
      // 1. Шукаємо нашу заявку в базі
      const q = query(
        collection(db, "friend_requests"),
        where("senderId", "==", user.uid),
        where("receiverId", "==", activeChatUser.id),
        where("status", "==", "pending"),
      );

      const querySnapshot = await getDocs(q);

      // 2. Видаляємо знайдений документ (зазвичай він там один)
      querySnapshot.forEach(async (docSnapshot) => {
        await deleteDoc(doc(db, "friend_requests", docSnapshot.id));
      });

      // 3. Миттєво оновлюємо кнопку назад на "Додати"
      setFriendStatus("none");
    } catch (error) {
      console.error("Помилка при скасуванні заявки:", error);
    }
  };
  // Слухач повідомлень у реальному часі
  useEffect(() => {
    if (!activeChatUser || !user) return;

    // Знову генеруємо спільний ID кімнати
    const combinedId =
      user.uid > activeChatUser.id
        ? user.uid + activeChatUser.id
        : activeChatUser.id + user.uid;

    // Створюємо запит: дістаємо всі повідомлення і сортуємо їх за часом створення
    const q = query(
      collection(db, "chats", combinedId, "messages"),
      orderBy("createdAt", "asc"),
    );

    // Підключаємо onSnapshot (слухач)
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = [];
      snapshot.forEach((doc) => {
        msgs.push({ id: doc.id, ...doc.data() });
      });
      setMessages(msgs); // Оновлюємо масив повідомлень на екрані
    });

    // Очищаємо слухач, коли виходимо з чату (щоб не було витоку пам'яті)
    return () => unsubscribe();
  }, [activeChatUser, user]);

  // Автоматичний скрол вниз при появі нового повідомлення
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Слухач для історії чатів (ліва панель)
  useEffect(() => {
    if (!user) return;

    // Шукаємо всі чати, де ми є в масиві participants
    // Сортуємо їх за часом оновлення, щоб нові були зверху
    const q = query(
      collection(db, "chats"),
      where("participants", "array-contains", user.uid),
      orderBy("updatedAt", "desc"), // Сортування від найновіших
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      // Оскільки нам треба ще й дістати імена та аватарки співрозмовників,
      // ми використовуємо Promise.all для кожного знайденого чату
      const chatsPromises = snapshot.docs.map(async (chatDoc) => {
        const chatData = chatDoc.data();

        // Знаходимо ID іншої людини (не мій)
        const otherUserId = chatData.participants.find((id) => id !== user.uid);

        // Йдемо в колекцію users і беремо її дані
        let otherUserData = {};
        if (otherUserId) {
          const userSnap = await getDoc(doc(db, "users", otherUserId));
          if (userSnap.exists()) {
            otherUserData = userSnap.data();
          }
        }

        return {
          id: chatDoc.id, // ID самої кімнати чату
          ...chatData,
          // Створюємо готовий об'єкт співрозмовника для відмальовки
          otherUser: { id: otherUserId, ...otherUserData },
        };
      });

      // Чекаємо, поки завантажаться всі профілі, і оновлюємо стан
      const resolvedChats = await Promise.all(chatsPromises);
      setChatHistory(resolvedChats);
    });

    return () => unsubscribe();
  }, [user]);

  // Функція для перетворення часу
  const formatTime = (timestamp) => {
    if (!timestamp) return ""; // Якщо повідомлення щойно відправлено і ще летить на сервер
    const date = timestamp.toDate();
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Перевірка статусу дружби при виборі чату
  useEffect(() => {
    const checkFriendStatus = async () => {
      if (!activeChatUser || !user) return;

      setFriendStatus("none"); // Скидаємо статус при зміні юзера

      // 1. Спочатку перевіряємо, чи ми вже не друзі (припустимо, друзі зберігаються в масиві friends у твоєму профілі)
      const currentUserSnap = await getDoc(doc(db, "users", user.uid));
      if (currentUserSnap.exists()) {
        const userData = currentUserSnap.data();
        if (userData.friends && userData.friends.includes(activeChatUser.id)) {
          setFriendStatus("friends");
          return;
        }
      }

      // 2. Якщо не друзі, перевіряємо, чи немає активної заявки ВІД нас ДО нього
      const q = query(
        collection(db, "friend_requests"),
        where("senderId", "==", user.uid),
        where("receiverId", "==", activeChatUser.id),
        where("status", "==", "pending"),
      );

      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        setFriendStatus("pending");
      }
    };

    checkFriendStatus();
  }, [activeChatUser, user]);

  // Функція видалення повідомлення
  const handleDeleteMessage = async (msgId) => {
    if (!activeChatUser || !user) return;

    // Питаємо підтвердження
    if (!window.confirm("Видалити це повідомлення?")) return;

    const combinedId =
      user.uid > activeChatUser.id
        ? user.uid + activeChatUser.id
        : activeChatUser.id + user.uid;

    try {
      await deleteDoc(doc(db, "chats", combinedId, "messages", msgId));
    } catch (error) {
      console.error("Помилка видалення:", error);
    }
  };

  // Функція збереження відредагованого повідомлення
  const handleSaveEdit = async () => {
    if (!editDraft.trim() || !editingMessage) return;

    const combinedId =
      user.uid > activeChatUser.id
        ? user.uid + activeChatUser.id
        : activeChatUser.id + user.uid;

    try {
      // Оновлюємо конкретний документ повідомлення
      await updateDoc(
        doc(db, "chats", combinedId, "messages", editingMessage.id),
        {
          text: editDraft,
          isEdited: true, // Додаємо прапорець, що воно відредаговане
        },
      );

      // Закриваємо режим редагування
      setEditingMessage(null);
      setEditDraft("");
    } catch (error) {
      console.error("Помилка редагування:", error);
    }
  };

  // Обробник кліку по повідомленню (і правий клік, і звичайний тап)
  const handleMessageOptions = (e, msg) => {
    e.preventDefault();
    if (msg.senderId !== user.uid) return;

    // Отримуємо розміри всього вікна
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    // Приблизні розміри твого меню (краще трохи з запасом)
    const menuWidth = 170;
    const menuHeight = 90;

    let posX = e.clientX;
    let posY = e.clientY;

    // Перевірка правого краю: якщо меню вилазить за ширину екрана,
    // зміщуємо його вліво від курсора
    if (posX + menuWidth > screenWidth) {
      posX = posX - menuWidth;
    }

    // Перевірка нижнього краю: якщо меню вилазить вниз,
    // зміщуємо його вгору від курсора
    if (posY + menuHeight > screenHeight) {
      posY = posY - menuHeight;
    }

    setContextMenu({
      mouseX: posX,
      mouseY: posY,
      msg: msg,
    });
  };

  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, []);

  // Функція вибору чату (відкриває чат і скидає лічильник непрочитаних)
  const handleChatClick = async (chat) => {
    setActiveChatUser(chat.otherUser); // Відкриваємо чат

    // Якщо в нас є непрочитані повідомлення, обнуляємо їх в базі
    if (chat.unreadCounts && chat.unreadCounts[user.uid] > 0) {
      try {
        await updateDoc(doc(db, "chats", chat.id), {
          [`unreadCounts.${user.uid}`]: 0,
        });
      } catch (error) {
        console.error("Помилка оновлення статусу прочитання:", error);
      }
    }
  };

  // Функція для гарного відображення дати у розділювачі
  const formatDateDivider = (timestamp) => {
    if (!timestamp) return "";

    const messageDate = timestamp.toDate();
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Допоміжна функція порівняння днів
    const isSameDay = (d1, d2) =>
      d1.getDate() === d2.getDate() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getFullYear() === d2.getFullYear();

    if (isSameDay(messageDate, today)) {
      return "Сьогодні";
    } else if (isSameDay(messageDate, yesterday)) {
      return "Вчора";
    } else {
      // Формат: "28 березня"
      return messageDate.toLocaleDateString("uk-UA", {
        day: "numeric",
        month: "long",
      });
    }
  };

  const acceptFriendRequest = async (requestId, senderId) => {
    try {
      // 1. Оновлюємо статус самого запиту на "accepted"
      await updateDoc(doc(db, "friend_requests", requestId), {
        status: "accepted",
      });

      // 2. Додаємо senderId у ТВІЙ масив друзів
      await updateDoc(doc(db, "users", user.uid), {
        friends: arrayUnion(senderId),
      });

      // 3. Додаємо ТВІЙ ID у масив друзів ТОГО, хто скидав запит
      await updateDoc(doc(db, "users", senderId), {
        friends: arrayUnion(user.uid),
      });

      console.log("Запит прийнято, ви тепер друзі!");
    } catch (error) {
      console.error("Помилка при прийнятті запиту:", error);
      alert("Не вдалося прийняти запит. Перевір консоль.");
    }
  };

  const rejectFriendRequest = async (requestId) => {
    try {
      // Просто видаляємо документ запиту
      await deleteDoc(doc(db, "friend_requests", requestId));
      console.log("Запит відхилено та видалено");
    } catch (error) {
      console.error("Помилка при відхиленні запиту:", error);
    }
  };

  const removeFriend = async (friendId) => {
    // Питаємо підтвердження, щоб не видалити випадково
    if (
      !window.confirm(
        "Ви впевнені, що хочете видалити цього користувача з друзів?",
      )
    )
      return;

    try {
      // 1. Видаляємо friendId з ТВОГО масиву friends
      await updateDoc(doc(db, "users", user.uid), {
        friends: arrayRemove(friendId),
      });

      // 2. Видаляємо ТВІЙ ID з масиву friends ТОГО користувача
      await updateDoc(doc(db, "users", friendId), {
        friends: arrayRemove(user.uid),
      });

      console.log("Користувача видалено з друзів");
    } catch (error) {
      console.error("Помилка при видаленні з друзів:", error);
    }
  };
  return (
    <div className="chat-page-wrapper">
      <Header user={user} />

      <div
        className={`chat-container ${activeChatUser ? "mobile-chat-active" : ""}`}
      >
        {/* ЛІВА ЧАСТИНА: Список чатів та пошук */}
        <div className="chat-sidebar">
          <div className="sidebar-header">
            <h2>Чати</h2>
            <div className="actions">
              <div className="position-relative d-inline-block">
                <i
                  className="bi bi-person-lines-fill"
                  onClick={() => setShowSocialModal(true)}
                  style={{ cursor: "pointer", color: "var(--text-main)" }}
                ></i>
                {incomingRequests.length > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle p-1 bg-danger border border-light rounded-circle"></span>
                )}
              </div>
              <i className="bi bi-three-dots" style={{ color: "var(--text-main)" }}></i>
            </div>
          </div>

          <div className="search-box">
            <div className="search-input-wrapper">
              <i className="bi bi-search"></i>
              <input
                type="text"
                placeholder="Пошук за логіном..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="chat-list custom-scroll p-2">
            {/* РЕЖИМ 1: Якщо користувач щось шукає (є текст в інпуті) */}
            {searchTerm.length > 0 ? (
              <>
                <h6
                  className="text-secondary ms-2 mb-3 mt-2"
                  style={{ fontSize: "12px", textTransform: "uppercase" }}
                >
                  Результати пошуку
                </h6>
                {searchTerm.length < 3 ? (
                  <p
                    className="text-secondary text-center mt-4"
                    style={{ fontSize: "14px" }}
                  >
                    Введіть точний логін користувача...
                  </p>
                ) : isSearching ? (
                  <p className="text-secondary text-center mt-4">Шукаємо...</p>
                ) : searchResults.length > 0 ? (
                  searchResults.map((u) => (
                    <div
                      key={u.id}
                      className="user-search-card d-flex align-items-center p-2 mb-2"
                      onClick={() => {
                        setActiveChatUser(u);
                        setSearchTerm(""); // Очищаємо пошук після вибору
                      }}
                    >
                      <img
                        src={u.avatar || defaultUser}
                        alt="avatar"
                        className="rounded-circle object-fit-cover"
                        style={{ width: "50px", height: "50px" }}
                      />
                      <div className="ms-3 overflow-hidden">
                        <h6
                          className="m-0 text-truncate"
                          style={{ color: "var(--text-main)" }}
                        >
                          {u.firstName} {u.lastName}
                        </h6>
                        <small className="text-secondary">@{u.username}</small>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-secondary text-center mt-4">
                    Користувачів не знайдено 😕
                  </p>
                )}
              </>
            ) : (
              /* РЕЖИМ 2: Якщо пошук порожній - показуємо історію чатів */
              <>
                {chatHistory.length === 0 ? (
                  <p
                    className="text-secondary text-center mt-4"
                    style={{ fontSize: "14px" }}
                  >
                    У вас ще немає активних чатів. Знайдіть когось через пошук!
                  </p>
                ) : (
                  chatHistory.map((chat) => (
                    <div
                      key={chat.id}
                      className={`user-search-card d-flex align-items-center p-2 mb-2 ${activeChatUser?.id === chat.otherUser.id ? "active-chat" : ""}`}
                      onClick={() => handleChatClick(chat)}
                    >
                      <img
                        src={chat.otherUser.avatar || defaultUser}
                        alt="avatar"
                        className="rounded-circle object-fit-cover flex-shrink-0"
                        style={{ width: "50px", height: "50px" }}
                      />
                      <div className="ms-3 overflow-hidden flex-grow-1">
                        <div className="d-flex justify-content-between align-items-center">
                          <h6
                            className="m-0 text-truncate fw-bold"
                            style={{ color: "var(--text-main)" }}
                          >
                            {chat.otherUser.firstName} {chat.otherUser.lastName}
                          </h6>

                          {chat.unreadCounts?.[user.uid] > 0 && (
                            <span
                              className="badge rounded-pill d-flex justify-content-center align-items-center ms-2"
                              style={{
                                backgroundColor: "var(--primary-puple)",
                                minWidth: "22px",
                                height: "22px",
                                fontSize: "11px",
                              }}
                            >
                              {chat.unreadCounts[user.uid]}
                            </span>
                          )}
                        </div>

                        {/* Вивід останнього повідомлення */}
                        <small
                          className="text-secondary text-truncate d-block mt-1"
                          style={{ fontSize: "13px" }}
                        >
                          {chat.lastMessageSender === user.uid ? (
                            <span className="text-primary">Ви: </span>
                          ) : (
                            ""
                          )}
                          {chat.lastMessage || "Немає повідомлень"}
                        </small>
                      </div>
                    </div>
                  ))
                )}
              </>
            )}
          </div>
        </div>

        {/* ПРАВА ЧАСТИНА: Вікно діалогу */}

        {/* ПРАВА ЧАСТИНА: Вікно діалогу */}
        <div className="chat-main">
          {activeChatUser ? (
            <>
              {/* 1. Хедер активного чату */}
              <div
                className="chat-main-header d-flex align-items-center p-3 border-bottom"
                style={{ borderColor: "var(--border-color)" }}
              >
                {/* Кнопка "Назад" - показується ТІЛЬКИ на мобільних (d-md-none) */}
                <button
                  className="btn btn-link text-secondary p-0 me-3 d-md-none"
                  onClick={() => setActiveChatUser(null)}
                >
                  <i className="bi bi-arrow-left fs-3"></i>
                </button>

                {/* Інформація про співрозмовника */}
                <img
                  src={activeChatUser.avatar || defaultUser}
                  alt="avatar"
                  className="rounded-circle object-fit-cover"
                  style={{ width: "45px", height: "45px" }}
                />
                <div className="ms-3">
                  <h6
                    className="m-0 fw-bold"
                    style={{ color: "var(--text-main)" }}
                  >
                    {activeChatUser.firstName} {activeChatUser.lastName}
                  </h6>
                  <small className="text-secondary">
                    @{activeChatUser.username}
                  </small>
                </div>

                {/* Додаткові кнопки (дзвінок, налаштування) - притиснуті вправо */}

                <div className="ms-auto d-flex align-items-center">
                  {/* Розумна кнопка "Додати в друзі" */}
                  {friendStatus === "none" && (
                    <button
                      className="btn btn-sm btn-outline-primary rounded-pill px-3 me-2 d-flex align-items-center gap-2"
                      onClick={handleAddFriend}
                    >
                      <i className="bi bi-person-plus"></i> Додати
                    </button>
                  )}

                  {friendStatus === "pending" && (
                    <button
                      className="btn btn-sm btn-outline-danger rounded-pill px-3 me-2 d-flex align-items-center gap-2"
                      onClick={handleCancelRequest}
                      title="Натисніть, щоб скасувати"
                    >
                      <i className="bi bi-x-circle"></i> Відмінити запит
                    </button>
                  )}

                  {friendStatus === "friends" && (
                    <button className="btn btn-sm btn-success rounded-pill px-3 me-2 disabled d-flex align-items-center gap-2">
                      <i className="bi bi-person-check"></i> Друзі
                    </button>
                  )}

                  {/* Кнопка інформації/налаштувань чату */}
                  <button className="btn border-0 text-secondary p-1 fs-5">
                    <i className="bi bi-three-dots-vertical"></i>
                  </button>
                </div>
              </div>

              {/* 2. Зона для повідомлень */}
              <div
                className="chat-messages flex-grow-1 p-4 custom-scroll"
                style={{
                  overflowY: "auto",
                  backgroundColor: "var(--bg-main)",
                }}
              >
                <div className="text-center mt-3 mb-4">
                  <span
                    className="px-3 py-1 rounded-pill small"
                    style={{
                      backgroundColor: "var(--bg-input)",
                      color: "var(--text-muted)",
                    }}
                  >
                    Початок вашої історії з {activeChatUser.firstName}
                  </span>
                </div>

                {/* МАЛЮЄМО ПОВІДОМЛЕННЯ */}
                {/* МАЛЮЄМО ПОВІДОМЛЕННЯ */}
                {messages.map((msg, index) => {
                  const isMine = msg.senderId === user.uid;

                  // ЛОГІКА РОЗДІЛЮВАЧА
                  let showDateDivider = false;
                  let dateString = "";

                  if (msg.createdAt) {
                    dateString = formatDateDivider(msg.createdAt);

                    if (index === 0) {
                      // Перше повідомлення завжди має дату зверху
                      showDateDivider = true;
                    } else {
                      const prevMsg = messages[index - 1];
                      if (prevMsg?.createdAt) {
                        const prevDateString = formatDateDivider(
                          prevMsg.createdAt,
                        );
                        // Якщо дата змінилася порівняно з попереднім повідомленням
                        if (dateString !== prevDateString) {
                          showDateDivider = true;
                        }
                      }
                    }
                  }

                  return (
                    <div key={msg.id}>
                      {/* САМ РОЗДІЛЮВАЧ */}
                      {showDateDivider && (
                        <div className="d-flex justify-content-center my-4">
                          <span
                            className="px-3 py-1 rounded-pill small fw-bold"
                            style={{
                              backgroundColor: "var(--bg-input)",
                              color: "var(--text-muted)",
                              fontSize: "12px",
                            }}
                          >
                            {dateString}
                          </span>
                        </div>
                      )}

                      {/* ТВОЯ БУЛЬБАШКА ПОВІДОМЛЕННЯ */}
                      <div
                        className={`d-flex mb-3 ${isMine ? "justify-content-end" : "justify-content-start"}`}
                      >
                        <div
                          className="px-3 py-2 position-relative"
                          onContextMenu={(e) => handleMessageOptions(e, msg)}
                          onClick={(e) => handleMessageOptions(e, msg)}
                          style={{
                            maxWidth: "75%",
                            wordBreak: "break-word",
                            backgroundColor: isMine
                              ? "var(--primary-puple)"
                              : "var(--bg-input)",
                            color: isMine ? "#ffffff" : "var(--text-main)",
                            borderRadius: isMine
                              ? "18px 18px 0px 18px"
                              : "18px 18px 18px 0px",
                            cursor: isMine ? "pointer" : "default",
                          }}
                        >
                          <div>
                            {/* Усередині повідомлення, перед або замість msg.text */}
                            {msg.image && (
                              <img
                                src={msg.image}
                                alt="sent"
                                className="rounded-3 mb-2 w-100"
                                style={{
                                  cursor: "pointer",
                                  maxHeight: "300px",
                                  objectFit: "cover",
                                }}
                                onClick={() => window.open(msg.image, "_blank")} // Простий перегляд при кліку
                              />
                            )}
                            {msg.text && <div>{msg.text}</div>}
                          </div>
                          <div
                            className={`d-flex align-items-center mt-1 gap-2 ${isMine ? "justify-content-end text-light" : "justify-content-start text-secondary"}`}
                            style={{ fontSize: "11px", opacity: 0.8 }}
                          >
                            {msg.isEdited && (
                              <span className="fst-italic">
                                (відредаговано)
                              </span>
                            )}
                            <span>{formatTime(msg.createdAt)}</span>
                            {isMine && <i className="bi bi-check2-all"></i>}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Невидимий якір, до якого сторінка буде скролитися */}
                <div ref={messagesEndRef} />
              </div>

              {/* 3. Зона вводу повідомлення */}
              {/* 3. Зона вводу повідомлення */}
              <div
                className="chat-input-area p-3"
                style={{
                  backgroundColor: "var(--bg-main)",
                  borderTop: "1px solid var(--border-color)",
                }}
              >
                {/* Якщо ввімкнено режим редагування - показуємо плашку зверху */}
                {editingMessage && (
                  <div
                    className="d-flex justify-content-between align-items-center mb-2 px-2"
                    style={{ color: "var(--primary-puple)" }}
                  >
                    <small>
                      <i className="bi bi-pencil"></i> Редагування повідомлення
                    </small>
                    <i
                      className="bi bi-x-lg"
                      style={{ cursor: "pointer" }}
                      onClick={() => setEditingMessage(null)}
                    ></i>
                  </div>
                )}

                <div
                  className="input-group align-items-center rounded-pill px-2 py-1"
                  style={{ backgroundColor: "var(--bg-input)" }}
                >
                  <label
                    htmlFor="image-input"
                    className="btn border-0 text-secondary rounded-circle p-0 d-flex align-items-center justify-content-center"
                    style={{
                      width: "40px",
                      height: "40px",
                      cursor: isUploading ? "not-allowed" : "pointer",
                    }}
                  >
                    {/* Якщо вантажиться - показуємо Bootstrap спіннер, інакше - скріпку */}
                    {isUploading ? (
                      <div
                        className="spinner-border spinner-border-sm text-primary"
                        role="status"
                      ></div>
                    ) : (
                      <i className="bi bi-paperclip fs-5"></i>
                    )}
                    <input
                      type="file"
                      id="image-input"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={handleImageUpload}
                      disabled={isUploading} // Блокуємо інпут, поки йде завантаження
                    />
                  </label>

                  <input
                    type="text"
                    className="form-control chat-input border-0 bg-transparent shadow-none"
                    placeholder={
                      editingMessage
                        ? "Відредагуйте текст..."
                        : "Напишіть повідомлення..."
                    }
                    style={{ color: "var(--text-main)" }}
                    // Якщо редагуємо - показуємо editDraft, інакше - звичайну чернетку
                    value={
                      editingMessage
                        ? editDraft
                        : drafts[activeChatUser.id] || ""
                    }
                    onChange={(e) => {
                      const text = e.target.value;
                      if (editingMessage) {
                        setEditDraft(text);
                      } else {
                        // Оновлюємо стан і відразу записуємо в localStorage
                        setDrafts((prev) => {
                          const newDrafts = {
                            ...prev,
                            [activeChatUser.id]: text,
                          };
                          localStorage.setItem(
                            "chat_drafts",
                            JSON.stringify(newDrafts),
                          );
                          return newDrafts;
                        });
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        editingMessage ? handleSaveEdit() : handleSendMessage();
                      }
                    }}
                  />

                  <button className="btn border-0 text-secondary rounded-circle">
                    <i className="bi bi-emoji-smile fs-5"></i>
                  </button>

                  {/* Кнопка: Відправити або Зберегти */}
                  <button
                    className="btn rounded-circle d-flex align-items-center justify-content-center ms-1"
                    style={{
                      width: "40px",
                      height: "40px",
                      backgroundColor: "var(--primary-puple)",
                      color: "#fff",
                    }}
                    onClick={
                      editingMessage ? handleSaveEdit : handleSendMessage
                    }
                  >
                    {editingMessage ? (
                      <i className="bi bi-check-lg fs-5"></i>
                    ) : (
                      <i className="bi bi-send-fill"></i>
                    )}
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* Стан "Чат не вибрано" (показується за замовчуванням на ПК) */
            <div className="d-flex h-100 justify-content-center align-items-center">
              <span
                className="text-secondary px-3 py-1 rounded-pill"
                style={{ background: "var(--bg-input)" }}
              >
                Виберіть чат або знайдіть користувача
              </span>
            </div>
          )}
        </div>
      </div>

      {/* КАСТОМНЕ МЕНЮ НА ПРАВИЙ КЛІК */}
      {contextMenu && (
        <div
          className="custom-context-menu shadow rounded-3 overflow-hidden py-1"
          style={{
            position: "fixed",
            top: contextMenu.mouseY,
            left: contextMenu.mouseX,
            zIndex: 1050, // Щоб було поверх усього
            backgroundColor: "var(--bg-main)",
            border: "1px solid var(--border-color)",
            minWidth: "160px",
          }}
        >
          <div
            className="context-menu-item px-3 py-2"
            onClick={() => {
              setEditingMessage(contextMenu.msg);
              setEditDraft(contextMenu.msg.text);
            }}
          >
            <i className="bi bi-pencil me-2"></i> Редагувати
          </div>
          <div
            className="context-menu-item px-3 py-2 text-danger"
            onClick={() => handleDeleteMessage(contextMenu.msg.id)}
          >
            <i className="bi bi-trash me-2"></i> Видалити
          </div>
        </div>
      )}

      {showSocialModal && (
        <div
          className="modal d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
          onClick={() => setShowSocialModal(false)}
        >
          <div
            className="modal-dialog modal-dialog-centered"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="modal-content"
              style={{
                backgroundColor: "var(--bg-secondary)",
                color: "var(--text-main)",
                borderRadius: "20px",
              }}
            >
              <div className="modal-header border-0">
                <h5 className="fw-bold">Друзі та запити</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowSocialModal(false)}
                ></button>
              </div>
              <div
                className="modal-body custom-scroll"
                style={{ maxHeight: "400px", overflowY: "auto" }}
              >
                {/* СЕКЦІЯ ЗАПИТІВ */}
                <h6 className="text-secondary small text-uppercase mb-3">
                  Запити ({incomingRequests.length})
                </h6>
                {incomingRequests.length === 0 && (
                  <p className="small text-main">Немає нових запитів</p>
                )}
                {/* СЕКЦІЯ ЗАПИТІВ */}

                {incomingRequests.map((req) => (
                  <div
                    key={req.id}
                    className="d-flex align-items-center justify-content-between mb-2 p-2 rounded"
                    style={{
                      border: "1px solid var(--border-color)",
                      background: "var(--bg-input)",
                    }}
                  >
                    <div className="d-flex align-items-center overflow-hidden">
                      <img
                        src={req.senderData?.avatar || defaultUser}
                        width="45"
                        height="45"
                        className="rounded-circle object-fit-cover flex-shrink-0"
                        alt="avatar"
                      />
                      <div className="ms-3 overflow-hidden">
                        {/* Виводимо повне ім'я та прізвище */}
                        <div
                          className="fw-bold text-truncate"
                          style={{ fontSize: "14px" }}
                        >
                          {req.senderData?.firstName} {req.senderData?.lastName}
                        </div>
                        {/* Виводимо логін */}
                        <div
                          className="small text-main"
                          style={{ fontSize: "12px" }}
                        >
                          @{req.senderData?.username}
                        </div>
                      </div>
                    </div>

                    <div className="ms-2 d-flex gap-2">
                      <button
                        className="btn btn-sm btn-primary rounded-pill px-3"
                        onClick={() =>
                          acceptFriendRequest(req.id, req.senderId)
                        }
                        style={{ fontSize: "12px" }}
                      >
                        Прийняти
                      </button>
                      <button
                        className="btn btn-sm btn-outline-secondary rounded-pill"
                        onClick={() => rejectFriendRequest(req.id)}
                        style={{ fontSize: "12px" }}
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>
                  </div>
                ))}

                <hr
                  className="my-4"
                  style={{ borderColor: "var(--border-color)" }}
                />

                {/* СЕКЦІЯ ДРУЗІВ */}
                <h6 className="text-secondary small text-uppercase mb-3">
                  Мої друзі ({myFriends.length})
                </h6>
                {myFriends.length === 0 && (
                  <p className="small text-main">Список порожній</p>
                )}
                {myFriends.map((friend) => (
                  <div
                    key={friend.id}
                    className="d-flex align-items-center justify-content-between mb-2 p-2 rounded"
                    style={{ border: "1px solid var(--border-color)" }}
                  >
                    <div className="d-flex align-items-center">
                      <img
                        src={friend.avatar || defaultUser}
                        width="35"
                        height="35"
                        className="rounded-circle"
                        alt="avatar"
                      />
                      <div className="ms-2">
                        <div className="fw-bold" style={{ fontSize: "14px" }}>
                          {friend.firstName} {friend.lastName}
                        </div>
                        <div
                          className="small text-main"
                          style={{ fontSize: "12px" }}
                        >
                          @{friend.username}
                        </div>
                      </div>
                    </div>

                    {/* Кнопка видалення */}
                    <button
                      className="btn btn-sm btn-outline-danger border-0"
                      onClick={() => removeFriend(friend.id)}
                      title="Видалити з друзів"
                    >
                      <i className="bi bi-person-x fs-5"></i>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;
