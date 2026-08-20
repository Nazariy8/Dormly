import React, { useState, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { auth, db } from "./firebase.js";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import "./i18n.js";

import Header from "./components/Header.jsx";

import Main from "./pages/Main.jsx";
import Auth from "./pages/Auth.jsx";
import ResultOfTest from "./pages/ResultOfTest.jsx";
import Roommates from "./pages/Roommates.jsx";
import Profile from "./pages/Profile.jsx";
import Test from "./pages/Test.jsx";
import FAQ from "./pages/FAQ.jsx";
import AboutUs from "./pages/AboutUs.jsx";
import Chat from "./pages/Chat.jsx";
import ResetPass from "./pages/ResetPass.jsx";

import "./css/main.scss";

function App() {
  const location = useLocation();

  const hideHeaderRoutes = ["/test", "/resultoftest", "/login", "/regist"];
  const shouldShowHeader = !hideHeaderRoutes.includes(
    location.pathname.toLowerCase(),
  );

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [userAnswers, setUserAnswers] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        try {
          const userDoc = await getDoc(doc(db, "users", currentUser.uid));
          if (userDoc.exists() && userDoc.data().answers) {
            setUserAnswers(userDoc.data().answers);
          }
        } catch (error) {
          console.error("Помилка завантаження відповідей:", error);
        }
      } else {
        setUserAnswers(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) return null;

  return (
    <div className="App">
      {shouldShowHeader && <Header user={user} />}

      <Routes>
        <Route path="/" element={<Main user={user} />} />

        <Route path="/login" element={<Auth goal="log" user={user} />} />
        <Route path="/regist" element={<Auth goal="reg" user={user} />} />
        <Route path="/resetPass" element={<ResetPass />} />
        <Route
          path="/profile"
          element={<Profile user={user} userAnswers={userAnswers} />}
        />

        <Route path="/test" element={<Test user={user} />} />
        <Route path="/resultoftest" element={<ResultOfTest user={user} />} />

        <Route
          path="/roommates"
          element={
            <Roommates userAnswers={userAnswers}  user={user} />
          }
        />

        <Route path="/faq" element={<FAQ user={user} />} />
        <Route path="/aboutus" element={<AboutUs user={user} />} />
        <Route path="/chat" element={<Chat user={user} />} />
      </Routes>
    </div>
  );
}

export default App;
