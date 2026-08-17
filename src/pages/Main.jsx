import React from "react";
import Header from "../components/Header";
import Intro from "../components/Intro";
import Advan from "../components/Advan";
import Feedbacks from "../components/Feedbacks";

const Main = ({ user }) => {
  return (
    <div>
      <Header user={user} />
      <Intro />
      <Advan />
      <Feedbacks />
    </div>
  );
};

export default Main;
