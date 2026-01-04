import React from "react";
import escapingBall from "../assets/Escaping ball.gif";

const Loader = () => {
  return (
    <div className="text-center my-4">
      <img src={escapingBall} alt="loading" />
    </div>
  );
};

export default Loader;
