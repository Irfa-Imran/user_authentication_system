import React, { useState } from "react";
import "./Guest.css";
import { useNavigate } from "react-router-dom";

const Guest = () => {
  const [name, setName] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim() === "") return;
    navigate("/display", { state: { name } });
  };

  return (
    <div className="container-fluid guest-outer-box">
      <div className="guest-headings">
        <h4>Add Your Name to Preview It.</h4>
      </div>
      <form className="guest-form" onSubmit={handleSubmit}>
        <label htmlFor="guest-user">Enter your name here:</label>
        <input
          type="text"
          name="guest_username"
          id="guest-user"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
          }}
          required
        />
        <button className="btn border" type="submit">
          Enter
        </button>
      </form>
    </div>
  );
};

export default Guest;
