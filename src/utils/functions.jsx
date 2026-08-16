import { auth, db } from "../firebase"; // Перевір, щоб шлях був правильним
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove, collection, query, where, getDocs } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { signOut } from "firebase/auth";

import { useLocation, useNavigate } from "react-router-dom";

import { getCroppedImg } from "./cropImage";
import React from "react";

export const deleteFile = (setAvatar, setFileName, fileInputRef) => {
  setAvatar(null);
  setFileName("Файл не вибрано"); // Повертаємо текст за замовчуванням
  localStorage.removeItem("");

  if (fileInputRef.current) {
    fileInputRef.current.value = "";
  }
};

export const handleProfileUpdate = async (
  inputValue,
  fieldName,
  setter,
  currentUser,
) => {
  let cleanedValue = inputValue;

  if (fieldName === "firstName" || fieldName === "lastName") {
    const cyrillicRegex = /[^А-Яа-яЄєІіЇїҐґ'\s-]/g;
    cleanedValue = inputValue.replace(cyrillicRegex, "");
  }

  setter(cleanedValue);

  if (currentUser) {
    try {
      const userRef = doc(db, "users", currentUser.uid);
      await updateDoc(userRef, {
        [fieldName]: cleanedValue,
      });
    } catch (error) {
      console.error("Помилка збереження в Firestore:", error);
    }
  }
};

// Обробник зміни файлу (оновлено для збереження назви)
export const handleFileChange = (e, setImageToCrop, setShowCropper) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = () => {
      setImageToCrop(reader.result);
      setShowCropper(true);
    };
    reader.readAsDataURL(file);
  }
};

export const onSaveCrop = async (
  imageToCrop,
  croppedAreaPixels,
  setAvatar,
  setShowCropper,
) => {
  const croppedImage = await getCroppedImg(imageToCrop, croppedAreaPixels);
  setAvatar(croppedImage);
  setShowCropper(false);

  // Зберігаємо в Firestore
  const currentUser = auth.currentUser;
  if (currentUser) {
    const userRef = doc(db, "users", currentUser.uid);
    await updateDoc(userRef, { avatar: croppedImage });
  }
};

export const handleToggleChange = async (setter, fieldName, value) => {
  // 1. Оновлюємо стан у React
  setter(value);

  // 2. Зберігаємо у Firebase
  const currentUser = auth.currentUser;
  if (currentUser) {
    try {
      const userRef = doc(db, "users", currentUser.uid);
      await updateDoc(userRef, {
        [fieldName]: value,
      });
    } catch (error) {
      console.error(`Помилка збереження налаштування ${fieldName}:`, error);
    }
  }
};

export const handleGoTest = (navigate) => {
  navigate("/test");
};

export const handleStatusChange = async (e, setIsLookingForRoom) => {
  const isLooking = e.target.checked;

  // 1. Оновлюємо локальний стейт (щоб текст на сайті змінився відразу)
  setIsLookingForRoom(isLooking);

  const currentUser = auth.currentUser;
  if (currentUser) {
    const newStatusString = isLooking ? "Шукаю кімнату" : "Не шукаю";
    try {
      const userRef = doc(db, "users", currentUser.uid);
      // 2. Оновлюємо саме в базі даних
      await updateDoc(userRef, {
        status: newStatusString,
      });
      console.log("Статус оновлено в БД на:", newStatusString);
    } catch (error) {
      console.error("Помилка збереження статусу в Firebase:", error);
      // Якщо в базі не збереглося — повертаємо стейт назад
      setIsLookingForRoom(!isLooking);
    }
  }
};

export const handleLogout = async (navigate) => {
  await signOut(auth);
  alert("Було виконано вихід з аккаунту!");
  navigate("/");
};


// src/utils/functions.jsx

export const handleGalleryUpload = async (e, currentUser, setGallery) => {
  const file = e.target.files[0];
  if (!file || !currentUser) return;

  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.src = reader.result;
    img.onload = async () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      // Оптимальний розмір для галереї (невеликий, щоб економити місце в БД)
      const MAX_WIDTH = 800; 
      const scaleSize = MAX_WIDTH / img.width;
      canvas.width = MAX_WIDTH;
      canvas.height = img.height * scaleSize;

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Сильне стиснення (якість 0.6), щоб файл займав ~50-100 КБ
      const compressedBase64 = canvas.toDataURL("image/jpeg", 0.6);

      try {
        const userRef = doc(db, "users", currentUser.uid);
        // Використовуємо arrayUnion, щоб додати фото в масив
        await updateDoc(userRef, {
          gallery: arrayUnion(compressedBase64)
        });
        
        // Оновлюємо стейт в UI
        setGallery((prev) => [...prev, compressedBase64]);
      } catch (error) {
        console.error("Помилка при збереженні фото в галерею:", error);
        alert("Не вдалося зберегти фото. Можливо, воно занадто велике.");
      }
    };
  };
  reader.readAsDataURL(file);
};

// src/utils/functions.jsx

export const deleteGalleryImage = async (imageUrl, currentUser, setGallery) => {
  if (!currentUser) return;

  try {
    const userRef = doc(db, "users", currentUser.uid);
    // Видаляємо конкретне посилання з масиву в базі
    await updateDoc(userRef, {
      gallery: arrayRemove(imageUrl)
    });

    // Оновлюємо стейт в UI
    setGallery((prev) => prev.filter((img) => img !== imageUrl));
  } catch (error) {
    console.error("Помилка при видаленні фото:", error);
  }
};

export const handleUsernameBlur = async (username, currentUser, setUsernameError) => {
  // 1. Базові перевірки
  if (!username || username.trim() === "") {
    setUsernameError("Логін є обов'язковим!");
    return;
  }
  if (username.length < 3) {
    setUsernameError("Логін має містити мінімум 5 символи.");
    return;
  }

  try {
    // 2. Шукаємо в базі, чи є вже такий логін
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("username", "==", username));
    const querySnapshot = await getDocs(q);

    let isTaken = false;
    querySnapshot.forEach((docSnap) => {
      // Якщо знайшли такий логін, але він належить ІНШІЙ людині
      if (docSnap.id !== currentUser.uid) {
        isTaken = true;
      }
    });

    // 3. Результат перевірки
    if (isTaken) {
      setUsernameError("Цей логін вже зайнятий! Виберіть інший.");
    } else {
      // Якщо вільний - зберігаємо
      const userRef = doc(db, "users", currentUser.uid);
      await updateDoc(userRef, { username: username });
      setUsernameError(""); // Очищаємо помилку, все супер
    }
  } catch (error) {
    console.error("Помилка перевірки логіну:", error);
    setUsernameError("Помилка перевірки. Спробуйте пізніше.");
  }
};
