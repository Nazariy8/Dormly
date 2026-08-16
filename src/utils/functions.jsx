import { auth, db } from "../firebase"; // Перевір, щоб шлях був правильним
import { doc, getDoc, updateDoc } from "firebase/firestore";
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
