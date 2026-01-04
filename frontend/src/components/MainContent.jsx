import React from "react";
import { useNavigate } from "react-router-dom";
import "./MainContent.css";

const MainContent = () => {
  const navigate = useNavigate();
  return (
    <div className="container-fluid main-outer-box">
      <div className="main-page">
        <h2>Welcome to User authentication system</h2>
        <div className="main-page-para">
          <p>
            This is a user authentication system where im creating an website
            where i can use different authentication methods use database
            connect backend to front end and keep my skills hands on.
          </p>
        </div>
      </div>
      <div className="main-page-btn">
        <button
          className="btn border"
          type="button"
          onClick={() => {
            navigate("/guest");
          }}
        >
          Try It
        </button>
        <button
          className="btn border"
          type="button"
          onClick={() => {
            navigate("/login");
          }}
        >
          Log In
        </button>
      </div>
    </div>
  );
};

export default MainContent;
