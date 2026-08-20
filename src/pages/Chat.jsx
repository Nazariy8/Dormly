import React, { useState, useEffect, useRef } from "react";
import Header from "../components/Header";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

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
import { db } from "../firebase";
import "../css/chat.scss";
import defaultUser from "../img/profile/user.jpg";

const Chat = ({ user }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const [activeChatUser, setActiveChatUser] = useState(null);

  const [drafts, setDrafts] = useState(() => {
    const savedDrafts = localStorage.getItem("chat_drafts");
    return savedDrafts ? JSON.parse(savedDrafts) : {};
  });

  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [friendStatus, setFriendStatus] = useState("none");
  const [editingMessage, setEditingMessage] = useState(null);
  const [editDraft, setEditDraft] = useState("");
  const [contextMenu, setContextMenu] = useState(null);
  const [showSocialModal, setShowSocialModal] = useState(false);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [myFriends, setMyFriends] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  const inputRef = useRef(null);

  // Ловець активного чату з переходу з Roommates
  useEffect(() => {
    if (location.state && location.state.startChatWith) {
      const targetUser = location.state.startChatWith;
      setActiveChatUser(targetUser);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, location.pathname]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !activeChatUser) return;

    setIsUploading(true);
    const storageRef = ref(storage, `chat_images/${Date.now()}_${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      null,
      (error) => {
        console.error("Помилка завантаження:", error);
        setIsUploading(false);
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        await sendImageMessage(downloadURL);
        setIsUploading(false);
        const fileInput = document.getElementById("image-input");
        if (fileInput) fileInput.value = "";
      },
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

    await addDoc(collection(db, "chats", combinedId, "messages"), messageData);

    await updateDoc(doc(db, "chats", combinedId), {
      lastMessage: t("chat.photoAttachment"),
      lastMessageSender: user.uid,
      updatedAt: serverTimestamp(),
      [`unreadCounts.${activeChatUser.id}`]: increment(1),
      [`unreadCounts.${user.uid}`]: 0,
    });
  };

  useEffect(() => {
    if (!user) return;

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

  useEffect(() => {
    const searchUsers = async () => {
      const cleanSearch = searchTerm.trim().toLowerCase();
      if (cleanSearch.length < 3) {
        setSearchResults([]);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      try {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("username", "==", cleanSearch));
        const querySnapshot = await getDocs(q);
        const users = [];

        querySnapshot.forEach((d) => {
          if (user && d.id !== user.uid) {
            users.push({ id: d.id, ...d.data() });
          }
        });

        setSearchResults(users);
      } catch (error) {
        console.error("Помилка точного пошуку:", error);
      } finally {
        setIsSearching(false);
      }
    };

    const timeoutId = setTimeout(() => {
      searchUsers();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, user]);

  const handleSendMessage = async () => {
    const text = drafts[activeChatUser?.id];
    if (!text || text.trim() === "") return;

    const combinedId =
      user.uid > activeChatUser.id
        ? user.uid + activeChatUser.id
        : activeChatUser.id + user.uid;

    try {
      const chatRef = doc(db, "chats", combinedId);
      const chatSnap = await getDoc(chatRef);

      if (!chatSnap.exists()) {
        await setDoc(chatRef, {
          participants: [user.uid, activeChatUser.id],
        });
      }

      await addDoc(collection(db, "chats", combinedId, "messages"), {
        text: text,
        senderId: user.uid,
        createdAt: serverTimestamp(),
      });

      await updateDoc(chatRef, {
        lastMessage: text,
        lastMessageSender: user.uid,
        updatedAt: serverTimestamp(),
        [`unreadCounts.${activeChatUser.id}`]: increment(1),
        [`unreadCounts.${user.uid}`]: 0,
      });

      setDrafts((prev) => {
        const newDrafts = { ...prev, [activeChatUser.id]: "" };
        localStorage.setItem("chat_drafts", JSON.stringify(newDrafts));
        return newDrafts;
      });
    } catch (error) {
      console.error("Помилка відправки повідомлення:", error);
    }

    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  const handleAddFriend = async () => {
    if (!activeChatUser || !user) return;
    try {
      await addDoc(collection(db, "friend_requests"), {
        senderId: user.uid,
        receiverId: activeChatUser.id,
        status: "pending",
        createdAt: serverTimestamp(),
      });
      setFriendStatus("pending");
    } catch (error) {
      console.error("Помилка при додаванні в друзі:", error);
    }
  };

  const handleCancelRequest = async () => {
    if (!activeChatUser || !user) return;
    try {
      const q = query(
        collection(db, "friend_requests"),
        where("senderId", "==", user.uid),
        where("receiverId", "==", activeChatUser.id),
        where("status", "==", "pending"),
      );
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach(async (d) => {
        await deleteDoc(doc(db, "friend_requests", d.id));
      });
      setFriendStatus("none");
    } catch (error) {
      console.error("Помилка при скасуванні заявки:", error);
    }
  };

  useEffect(() => {
    if (!activeChatUser || !user) return;

    const combinedId =
      user.uid > activeChatUser.id
        ? user.uid + activeChatUser.id
        : activeChatUser.id + user.uid;

    const q = query(
      collection(db, "chats", combinedId, "messages"),
      orderBy("createdAt", "asc"),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = [];
      snapshot.forEach((d) => {
        msgs.push({ id: d.id, ...d.data() });
      });
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [activeChatUser, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "chats"),
      where("participants", "array-contains", user.uid),
      orderBy("updatedAt", "desc"),
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const chatsPromises = snapshot.docs.map(async (chatDoc) => {
        const chatData = chatDoc.data();
        const otherUserId = chatData.participants.find((id) => id !== user.uid);
        let otherUserData = {};
        if (otherUserId) {
          const userSnap = await getDoc(doc(db, "users", otherUserId));
          if (userSnap.exists()) {
            otherUserData = userSnap.data();
          }
        }

        return {
          id: chatDoc.id,
          ...chatData,
          otherUser: { id: otherUserId, ...otherUserData },
        };
      });

      const resolvedChats = await Promise.all(chatsPromises);
      setChatHistory(resolvedChats);
    });

    return () => unsubscribe();
  }, [user]);

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = timestamp.toDate();
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  useEffect(() => {
    const checkFriendStatus = async () => {
      if (!activeChatUser || !user) return;
      setFriendStatus("none");

      const currentUserSnap = await getDoc(doc(db, "users", user.uid));
      if (currentUserSnap.exists()) {
        const userData = currentUserSnap.data();
        if (userData.friends && userData.friends.includes(activeChatUser.id)) {
          setFriendStatus("friends");
          return;
        }
      }

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

  const handleDeleteMessage = async (msgId) => {
    if (!activeChatUser || !user) return;
    if (!window.confirm(t("chat.deleteConfirm"))) return;

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

  const handleSaveEdit = async () => {
    if (!editDraft.trim() || !editingMessage) return;

    const combinedId =
      user.uid > activeChatUser.id
        ? user.uid + activeChatUser.id
        : activeChatUser.id + user.uid;

    try {
      await updateDoc(
        doc(db, "chats", combinedId, "messages", editingMessage.id),
        {
          text: editDraft,
          isEdited: true,
        },
      );
      setEditingMessage(null);
      setEditDraft("");
    } catch (error) {
      console.error("Помилка редагування:", error);
    }
  };

  const handleMessageOptions = (e, msg) => {
    e.preventDefault();
    if (msg.senderId !== user.uid) return;

    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const menuWidth = 160;
    const menuHeight = 85;

    let posX = e.clientX;
    let posY = e.clientY;

    if (posX + menuWidth > screenWidth) posX -= menuWidth;
    if (posY + menuHeight > screenHeight) posY -= menuHeight;

    setContextMenu({ mouseX: posX, mouseY: posY, msg });
  };

  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, []);

  const handleChatClick = async (chat) => {
    setActiveChatUser(chat.otherUser);
    if (chat.unreadCounts && chat.unreadCounts[user.uid] > 0) {
      try {
        await updateDoc(doc(db, "chats", chat.id), {
          [`unreadCounts.${user.uid}`]: 0,
        });
      } catch (error) {
        console.error("Помилка оновлення статусу:", error);
      }
    }
  };

  const formatDateDivider = (timestamp) => {
    if (!timestamp) return "";
    const messageDate = timestamp.toDate();
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const isSameDay = (d1, d2) =>
      d1.getDate() === d2.getDate() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getFullYear() === d2.getFullYear();

    if (isSameDay(messageDate, today)) {
      return t("chat.today");
    } else if (isSameDay(messageDate, yesterday)) {
      return t("chat.yesterday");
    } else {
      return messageDate.toLocaleDateString([], {
        day: "numeric",
        month: "long",
      });
    }
  };

  const acceptFriendRequest = async (requestId, senderId) => {
    try {
      await updateDoc(doc(db, "friend_requests", requestId), {
        status: "accepted",
      });
      await updateDoc(doc(db, "users", user.uid), {
        friends: arrayUnion(senderId),
      });
      await updateDoc(doc(db, "users", senderId), {
        friends: arrayUnion(user.uid),
      });
    } catch (error) {
      console.error("Помилка при прийнятті запиту:", error);
    }
  };

  const rejectFriendRequest = async (requestId) => {
    try {
      await deleteDoc(doc(db, "friend_requests", requestId));
    } catch (error) {
      console.error("Помилка при відхиленні запиту:", error);
    }
  };

  const removeFriend = async (friendId) => {
    if (!window.confirm(t("chat.deleteFriendConfirm"))) return;
    try {
      await updateDoc(doc(db, "users", user.uid), {
        friends: arrayRemove(friendId),
      });
      await updateDoc(doc(db, "users", friendId), {
        friends: arrayRemove(user.uid),
      });
    } catch (error) {
      console.error("Помилка при видаленні з друзів:", error);
    }
  };

  return (
    <>
      <main
        className={`chat-page-wrapper ${activeChatUser ? "mobile-chat-active" : ""}`}
      >
        <div className="chat-container">
          {/* ЛІВА ПАНЕЛЬ: Список чатів */}
          <aside className="chat-sidebar">
            <div className="sidebar-header">
              <h2>{t("chat.title")}</h2>
              <div className="actions">
                <div className="position-relative d-inline-block">
                  <i
                    className="bi bi-person-lines-fill"
                    onClick={() => setShowSocialModal(true)}
                    title={t("chat.modalTitle")}
                  ></i>
                  {incomingRequests.length > 0 && (
                    <span className="position-absolute top-0 start-100 translate-middle p-1 bg-danger rounded-circle"></span>
                  )}
                </div>
              </div>
            </div>

            <div className="search-box">
              <div className="search-input-wrapper">
                <i className="bi bi-search"></i>
                <input
                  type="text"
                  placeholder={t("chat.searchPlaceholder")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="chat-list custom-scroll">
              {searchTerm.length > 0 ? (
                <>
                  <div className="text-secondary px-2 mb-2 mt-2 small fw-semibold text-uppercase">
                    {t("chat.searchResults")}
                  </div>
                  {searchTerm.length < 3 ? (
                    <p className="text-secondary text-center mt-4 small">
                      {t("chat.searchMinChars")}
                    </p>
                  ) : isSearching ? (
                    <p className="text-secondary text-center mt-4 small">
                      {t("chat.searching")}
                    </p>
                  ) : searchResults.length > 0 ? (
                    searchResults.map((u) => (
                      <div
                        key={u.id}
                        className="user-search-card d-flex align-items-center"
                        onClick={() => {
                          setActiveChatUser(u);
                          setSearchTerm("");
                        }}
                      >
                        <img
                          src={u.avatar || defaultUser}
                          alt="avatar"
                          className="rounded-circle object-fit-cover"
                          style={{ width: "42px", height: "42px" }}
                        />
                        <div className="ms-3 overflow-hidden">
                          <h6 className="m-0 text-truncate text-white fs-6">
                            {u.firstName} {u.lastName}
                          </h6>
                          <small className="text-secondary">
                            @{u.username}
                          </small>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-secondary text-center mt-4 small">
                      {t("chat.noUsersFound")}
                    </p>
                  )}
                </>
              ) : chatHistory.length === 0 ? (
                <p className="text-secondary text-center mt-5 px-3 small">
                  {t("chat.noChatsYet")}
                </p>
              ) : (
                chatHistory.map((chat) => (
                  <div
                    key={chat.id}
                    className={`user-search-card d-flex align-items-center ${
                      activeChatUser?.id === chat.otherUser.id
                        ? "active-chat"
                        : ""
                    }`}
                    onClick={() => handleChatClick(chat)}
                  >
                    <img
                      src={chat.otherUser.avatar || defaultUser}
                      alt="avatar"
                      className="rounded-circle object-fit-cover flex-shrink-0"
                      style={{ width: "44px", height: "44px" }}
                    />
                    <div className="ms-3 overflow-hidden flex-grow-1">
                      <div className="d-flex justify-content-between align-items-center">
                        <span
                          className="text-white fw-semibold text-truncate"
                          style={{ fontSize: "14.5px" }}
                        >
                          {chat.otherUser.firstName} {chat.otherUser.lastName}
                        </span>

                        {chat.unreadCounts?.[user.uid] > 0 && (
                          <span
                            className="badge rounded-pill bg-danger ms-2"
                            style={{ fontSize: "10.5px" }}
                          >
                            {chat.unreadCounts[user.uid]}
                          </span>
                        )}
                      </div>

                      <small
                        className="text-secondary text-truncate d-block mt-1"
                        style={{ fontSize: "12.5px" }}
                      >
                        {chat.lastMessageSender === user.uid && (
                          <span className="text-white fw-medium">
                            {t("chat.you")}{" "}
                          </span>
                        )}
                        {chat.lastMessage || t("chat.noMessages")}
                      </small>
                    </div>
                  </div>
                ))
              )}
            </div>
          </aside>

          {/* ПРАВА ЧАСТИНА: Вікно діалогу */}
          <section className="chat-main">
            {activeChatUser ? (
              <>
                <header className="chat-main-header">
                  <button
                    className="btn btn-link text-secondary p-0 me-3 d-md-none"
                    onClick={() => setActiveChatUser(null)}
                  >
                    <i className="bi bi-arrow-left fs-4"></i>
                  </button>

                  <img
                    src={activeChatUser.avatar || defaultUser}
                    alt="avatar"
                    className="rounded-circle object-fit-cover"
                    style={{ width: "40px", height: "40px" }}
                  />
                  <div className="ms-3">
                    <h1 className="h6 m-0 fw-bold text-white">
                      {activeChatUser.firstName} {activeChatUser.lastName}
                    </h1>
                    <small className="text-secondary">
                      @{activeChatUser.username}
                    </small>
                  </div>

                  <div className="ms-auto d-flex align-items-center">
                    {friendStatus === "none" && (
                      <button
                        className="btn btn-sm btn-outline-light rounded-pill px-3 me-2"
                        onClick={handleAddFriend}
                      >
                        <i className="bi bi-person-plus"></i>{" "}
                        {t("chat.addFriend")}
                      </button>
                    )}

                    {friendStatus === "pending" && (
                      <button
                        className="btn btn-sm btn-outline-danger rounded-pill px-3 me-2"
                        onClick={handleCancelRequest}
                      >
                        <i className="bi bi-x-circle"></i>{" "}
                        {t("chat.cancelRequest")}
                      </button>
                    )}

                    {friendStatus === "friends" && (
                      <span className="badge rounded-pill bg-success-subtle text-success px-3 py-2 me-2">
                        <i className="bi bi-person-check me-1"></i>{" "}
                        {t("chat.friends")}
                      </span>
                    )}
                  </div>
                </header>

                <div className="chat-messages custom-scroll">
                  <div className="text-center my-3">
                    <span
                      className="px-3 py-1 rounded-pill small"
                      style={{
                        backgroundColor: "#161616",
                        color: "#888888",
                        border: "1px solid #262626",
                      }}
                    >
                      {t("chat.chatHistoryStart", {
                        name: activeChatUser.firstName,
                      })}
                    </span>
                  </div>

                  {messages.map((msg, index) => {
                    const isMine = msg.senderId === user.uid;
                    let showDateDivider = false;
                    let dateString = "";

                    if (msg.createdAt) {
                      dateString = formatDateDivider(msg.createdAt);
                      if (index === 0) {
                        showDateDivider = true;
                      } else {
                        const prevMsg = messages[index - 1];
                        if (
                          prevMsg?.createdAt &&
                          dateString !== formatDateDivider(prevMsg.createdAt)
                        ) {
                          showDateDivider = true;
                        }
                      }
                    }

                    return (
                      <div key={msg.id}>
                        {showDateDivider && (
                          <div className="d-flex justify-content-center my-3">
                            <span
                              className="px-3 py-1 rounded-pill small fw-medium"
                              style={{
                                backgroundColor: "#141414",
                                color: "#777777",
                                border: "1px solid #222222",
                              }}
                            >
                              {dateString}
                            </span>
                          </div>
                        )}

                        <div
                          className={`d-flex mb-2 ${isMine ? "justify-content-end" : "justify-content-start"}`}
                        >
                          <div
                            className="px-3 py-2 position-relative"
                            onContextMenu={(e) => handleMessageOptions(e, msg)}
                            onClick={(e) => handleMessageOptions(e, msg)}
                            style={{
                              maxWidth: "75%",
                              wordBreak: "break-word",
                              backgroundColor: isMine ? "#ffffff" : "#161616",
                              color: isMine ? "#000000" : "#ededed",
                              border: isMine
                                ? "1px solid #ffffff"
                                : "1px solid #262626",
                              borderRadius: isMine
                                ? "16px 16px 2px 16px"
                                : "16px 16px 16px 2px",
                              cursor: isMine ? "pointer" : "default",
                            }}
                          >
                            {msg.image && (
                              <img
                                src={msg.image}
                                alt="attachment"
                                className="rounded-3 mb-2 w-100"
                                style={{
                                  maxHeight: "280px",
                                  objectFit: "cover",
                                  cursor: "pointer",
                                }}
                                onClick={() => window.open(msg.image, "_blank")}
                              />
                            )}
                            {msg.text && (
                              <div
                                style={{ fontSize: "14px", lineHeight: "1.4" }}
                              >
                                {msg.text}
                              </div>
                            )}

                            <div
                              className={`d-flex align-items-center mt-1 gap-1 ${
                                isMine
                                  ? "justify-content-end text-muted"
                                  : "justify-content-start text-secondary"
                              }`}
                              style={{ fontSize: "11px" }}
                            >
                              {msg.isEdited && (
                                <span className="fst-italic">
                                  ({t("chat.edited")})
                                </span>
                              )}
                              <span>{formatTime(msg.createdAt)}</span>
                              {isMine && (
                                <i className="bi bi-check2-all ms-1"></i>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                <footer className="chat-input-area">
                  {editingMessage && (
                    <div className="d-flex justify-content-between align-items-center mb-2 px-2 text-warning small">
                      <span>
                        <i className="bi bi-pencil me-1"></i>{" "}
                        {t("chat.editMessage")}
                      </span>
                      <i
                        className="bi bi-x-lg cursor-pointer"
                        onClick={() => setEditingMessage(null)}
                      ></i>
                    </div>
                  )}

                  <div className="chat-input-box">
                    <label
                      htmlFor="image-input"
                      className="btn border-0 text-secondary p-0 d-flex align-items-center justify-content-center"
                      style={{
                        width: "36px",
                        height: "36px",
                        cursor: isUploading ? "not-allowed" : "pointer",
                      }}
                    >
                      {isUploading ? (
                        <div
                          className="spinner-border spinner-border-sm text-light"
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
                        disabled={isUploading}
                      />
                    </label>

                    <input
                      ref={inputRef}
                      type="text"
                      placeholder={
                        editingMessage
                          ? t("chat.editInputPlaceholder")
                          : t("chat.inputPlaceholder")
                      }
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
                          editingMessage
                            ? handleSaveEdit()
                            : handleSendMessage();
                        }
                      }}
                    />

                    <button
                      className="btn-send"
                      onClick={
                        editingMessage ? handleSaveEdit : handleSendMessage
                      }
                      aria-label="Send"
                    >
                      {editingMessage ? (
                        <i className="bi bi-check-lg fs-5"></i>
                      ) : (
                        <i className="bi bi-arrow-up fs-5"></i>
                      )}
                    </button>
                  </div>
                </footer>
              </>
            ) : (
              <div className="d-flex h-100 justify-content-center align-items-center">
                <span
                  className="text-secondary px-4 py-2 rounded-pill small"
                  style={{ background: "#121212", border: "1px solid #262626" }}
                >
                  {t("chat.noChatSelected")}
                </span>
              </div>
            )}
          </section>
        </div>

        {/* Контекстне меню */}
        {contextMenu && (
          <div
            className="custom-context-menu"
            style={{ top: contextMenu.mouseY, left: contextMenu.mouseX }}
          >
            <div
              className="context-menu-item"
              onClick={() => {
                setEditingMessage(contextMenu.msg);
                setEditDraft(contextMenu.msg.text);
              }}
            >
              <i className="bi bi-pencil"></i> {t("chat.edit")}
            </div>
            <div
              className="context-menu-item text-danger"
              onClick={() => handleDeleteMessage(contextMenu.msg.id)}
            >
              <i className="bi bi-trash"></i> {t("chat.delete")}
            </div>
          </div>
        )}

        {/* Модалка друзів та запитів */}
        {showSocialModal && (
          <div
            className="modal d-block"
            style={{
              backgroundColor: "rgba(0,0,0,0.75)",
              backdropFilter: "blur(6px)",
            }}
            onClick={() => setShowSocialModal(false)}
          >
            <div
              className="modal-dialog modal-dialog-centered"
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className="modal-content"
                style={{
                  backgroundColor: "#121212",
                  color: "#ffffff",
                  border: "1px solid #262626",
                  borderRadius: "16px",
                }}
              >
                <div className="modal-header border-0 pb-0">
                  <h2 className="h5 fw-bold m-0">{t("chat.modalTitle")}</h2>
                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    onClick={() => setShowSocialModal(false)}
                  ></button>
                </div>

                <div
                  className="modal-body custom-scroll"
                  style={{ maxHeight: "380px", overflowY: "auto" }}
                >
                  <div className="text-secondary small text-uppercase fw-semibold mb-3">
                    {t("chat.requests")} ({incomingRequests.length})
                  </div>
                  {incomingRequests.length === 0 && (
                    <p className="text-secondary small mb-4">
                      {t("chat.noRequests")}
                    </p>
                  )}

                  {incomingRequests.map((req) => (
                    <div
                      key={req.id}
                      className="d-flex align-items-center justify-content-between mb-2 p-2 rounded-3"
                      style={{
                        border: "1px solid #262626",
                        background: "#0a0a0a",
                      }}
                    >
                      <div className="d-flex align-items-center overflow-hidden">
                        <img
                          src={req.senderData?.avatar || defaultUser}
                          width="38"
                          height="38"
                          className="rounded-circle object-fit-cover flex-shrink-0"
                          alt="avatar"
                        />
                        <div className="ms-3 overflow-hidden">
                          <div className="fw-semibold text-truncate small">
                            {req.senderData?.firstName}{" "}
                            {req.senderData?.lastName}
                          </div>
                          <div
                            className="text-secondary"
                            style={{ fontSize: "11.5px" }}
                          >
                            @{req.senderData?.username}
                          </div>
                        </div>
                      </div>

                      <div className="ms-2 d-flex gap-2">
                        <button
                          className="btn btn-sm btn-light rounded-pill px-3"
                          onClick={() =>
                            acceptFriendRequest(req.id, req.senderId)
                          }
                          style={{ fontSize: "12px", fontWeight: 600 }}
                        >
                          {t("chat.accept")}
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

                  <hr className="my-4" style={{ borderColor: "#262626" }} />

                  <div className="text-secondary small text-uppercase fw-semibold mb-3">
                    {t("chat.myFriends")} ({myFriends.length})
                  </div>
                  {myFriends.length === 0 && (
                    <p className="text-secondary small mb-0">
                      {t("chat.noFriends")}
                    </p>
                  )}

                  {myFriends.map((friend) => (
                    <div
                      key={friend.id}
                      className="d-flex align-items-center justify-content-between mb-2 p-2 rounded-3"
                      style={{
                        border: "1px solid #262626",
                        background: "#0a0a0a",
                      }}
                    >
                      <div className="d-flex align-items-center">
                        <img
                          src={friend.avatar || defaultUser}
                          width="34"
                          height="34"
                          className="rounded-circle object-fit-cover"
                          alt="avatar"
                        />
                        <div className="ms-2">
                          <div className="fw-semibold small">
                            {friend.firstName} {friend.lastName}
                          </div>
                          <div
                            className="text-secondary"
                            style={{ fontSize: "11.5px" }}
                          >
                            @{friend.username}
                          </div>
                        </div>
                      </div>

                      <button
                        className="btn btn-sm text-secondary border-0"
                        onClick={() => removeFriend(friend.id)}
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
      </main>
    </>
  );
};

export default Chat;
