import React from "react";
import Intro from "./Intro";
import Advan from "./Advan";
import Feedbacks from "./Feedbacks";
import Header from "./Header"

const Main = () => {
  return (
		<div>
			<Header />
			<Intro />
			<Advan />
			<Feedbacks />
		</div>
	);
}

export default Main;

