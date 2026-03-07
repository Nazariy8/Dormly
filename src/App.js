import React, { useState, useEffect } from "react"; // 1. Додано useState та useEffect
import { Routes, Route, Navigate } from "react-router-dom"; // 2. Додано Navigate
import { auth } from "./firebase"; // Перевір шлях до файлу firebase
import { onAuthStateChanged } from "firebase/auth";

import Header from "./components/Header";
import Homepage from "./pages/Main.jsx";
import UserInit from "./pages/UserInit.jsx";
import Test from "./pages/Test.jsx"
import ResultOfTest from "./pages/ResultOfTest.jsx"
import SearchRoommate from "./pages/SearchRoommate.jsx"
import Aboutus from "./pages/AboutUs.jsx"
import Chat from "./components/Chat.jsx";
import ResetPass from "./pages/ResetPass.jsx"

import "./css/main.css";

function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    if (loading) return null; // Або легкий спінер

    return (
        <div className="App">
            <Routes>
                <Route path="/" element={<Homepage user={user} />} />

                <Route path="/login" element={<UserInit goal="log" user={user} />} />
                <Route path="/regist" element={<UserInit goal="reg" user={user} />} />
                <Route path="/resetPass" element={<ResetPass />} />

                <Route path="/test" element={<Test user={user} />} />
                <Route path="/resultoftest" element={<ResultOfTest user={user} />} />
                <Route path="/search-roommate" element={<SearchRoommate user={user} />} />
                <Route path="/aboutus" element={<Aboutus user={user} />} />
                <Route path="/chat" element={<Chat user={user} />} />
            </Routes>
        </div>
    );
}

export default App;