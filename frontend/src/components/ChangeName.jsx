import React, { useState } from "react";
import "./ChangeName.css";

const ChangeName = () => {
  const [userName, setUserName] = useState("");

  const API_URL = import.meta.env.VITE_API_BASE_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userName) {
      alert("Name is required.");
      return;
    }

    try {
      const token = localStorage.getItem("access_token");

      const res = await fetch(`${API_URL}/changeusername`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          user_name: userName,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.msg || "Cannot change name try again.");
        return;
      }
      alert("Name changed successfully");
      setUserName("");
    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  };

  return (
    <div className="changename-outerbox">
      <h3 className="changename-headings">Change your name</h3>
      <form onSubmit={handleSubmit}>
        <label htmlFor="changename-input">Update your name:</label>
        <input
          type="text"
          id="changename-input"
          value={userName}
          onChange={(e) => {
            setUserName(e.target.value);
          }}
        />
        <button type="submit" className="btn border changename-btn ">
          Update
        </button>
      </form>
    </div>
  );
};

export default ChangeName;
