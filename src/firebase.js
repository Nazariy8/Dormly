import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth"; // Обов'язково додай цей імпорт
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBm1OzJdbmJXqUzrByHIXMdCwRH0EYWfsw",
  authDomain: "dormly-chat.firebaseapp.com",
  projectId: "dormly-chat",
  storageBucket: "dormly-chat.firebasestorage.app",
  messagingSenderId: "258153381078",
  appId: "1:258153381078:web:b71db3483628a789469d77"
};

const app = initializeApp(firebaseConfig);

// Ці два рядки експортують базу і авторизацію для інших файлів
export const db = getFirestore(app);
export const auth = getAuth(app); // Перевір, щоб цей рядок точно був!
export const googleProvider = new GoogleAuthProvider();
export const storage = getStorage(app);
