import React, { useState, useEffect } from "react";
import "./ChangePassword.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

const ChangePassword = () => {
  const [showPassword1, setShowPassword1] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  const [password1, setPassword1] = useState("");
  const [password2, setPassword2] = useState("");
  const [validationMessage, setValidationMessage] = useState(false);

  const API_URL = import.meta.env.VITE_API_BASE_URL;

  const validationFunction = (pwd) => {
    if (pwd.length === 0) {
      setValidationMessage(false);
      return;
    }

    const isStrong =
      pwd.length >= 8 &&
      /[A-Z]/.test(pwd) &&
      /[a-z]/.test(pwd) &&
      /[0-9]/.test(pwd) &&
      /[!@#$%^&*()]/.test(pwd);

    setValidationMessage(!isStrong);
  };

  useEffect(() => {
    validationFunction(password2);
  }, [password2]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!password1 || !password2) {
      alert("Both fields are required");
      return;
    }

    if (validationMessage) {
      alert("Please enter a strong password");
      return;
    }

    try {
      const token = localStorage.getItem("access_token");

      if (!token) {
        alert("Session expired. Please login again.");
        return;
      }

      const res = await fetch(`${API_URL}/changepassword`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          old_password: password1,
          new_password: password2,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.msg || "Password change failed. Please try again later");
        return;
      }

      alert("Password changed successfully");
      setPassword1("");
      setPassword2("");
    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  };

  return (
    <div className="changepwd-outerbox">
      <h3 className="changepwd-headings">Change your Password: </h3>
      <form onSubmit={handleSubmit}>
        <label htmlFor="prevpwd-input">
          Enter your Previous Password here:
        </label>
        <div className="changepwd-field">
          <input
            type={showPassword1 ? "text" : "password"}
            id="prevpwd-input"
            name="prevpwd-field"
            value={password1}
            onChange={(e) => {
              setPassword1(e.target.value);
            }}
            required
          />
          <span
            className="changepwd-icon"
            onClick={() => setShowPassword1(!showPassword1)}
          >
            <FontAwesomeIcon icon={showPassword1 ? faEyeSlash : faEye} />
          </span>
        </div>
        <label htmlFor="newpwd-input">Enter your New Password here:</label>
        <div className="changepwd-field">
          <input
            type={showPassword2 ? "text" : "password"}
            id="newpwd-input"
            name="newpwd-field"
            value={password2}
            onChange={(e) => {
              setPassword2(e.target.value);
            }}
            required
          />
          <span
            className="changepwd-icon"
            onClick={() => setShowPassword2(!showPassword2)}
          >
            <FontAwesomeIcon icon={showPassword2 ? faEyeSlash : faEye} />
          </span>
        </div>
        {validationMessage && (
          <div style={{ fontSize: "12px", color: "red", paddingLeft: "1rem" }}>
            Please enter a strong password
          </div>
        )}
        <button type="submit" className="btn border changepwd-btn">
          Change Password
        </button>
      </form>
    </div>
  );
};

export default ChangePassword;
