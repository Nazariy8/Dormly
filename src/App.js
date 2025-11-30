import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Header from "./components/Header";
import Maincontent from "./components/Main.jsx";

import Homepage from "./pages/Main.jsx";
import UserInit from "./pages/UserInit.jsx";
import Test from "./pages/Test.jsx"
import ResultOfTest from "./pages/ResultOfTest.jsx"
import SearchRoommate from "./pages/SearchRoommate.jsx"
import Aboutus from "./pages/AboutUs.jsx"

import "./css/main.css";


function App() {
	return (
		<div className="App">
			{/* <Header /> */}
			<Routes>
				<Route path="/" element={<Homepage />} />
				<Route path="/login" element={<UserInit goal="log"/>} />
				<Route path="/regist" element={<UserInit goal="reg"/>} />
				<Route path="/test" element={<Test />} />
				<Route path="/resultoftest" element={<ResultOfTest />} />
				<Route path="/setprofile" element={<setProfile />} />
				<Route path="/search-roommate" element={<SearchRoommate />} />
				<Route path="/aboutus" element={<Aboutus />} />

			</Routes>
		</div>
	);
}

export default App;
