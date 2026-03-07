import React from "react";
import Intro from "./Intro";
import Advan from "./Advan";
import Feedbacks from "./Feedbacks";
import Header from "./Header"
import { Link } from 'react-router-dom';

const Main = ({ user }) => {
  return (
		<div>
			<Header user={user}/>
			<Intro />
			<Advan />
			<Feedbacks />
		</div>
	);
}

export default Main;

