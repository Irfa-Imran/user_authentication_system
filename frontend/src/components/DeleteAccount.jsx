import React, { useState, useContext, useEffect } from "react";
import "./DeleteAccount.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/context";
import { googleLogout } from "@react-oauth/google";

const DeleteAccount = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { setIsLoggedIn, isGoogleUser, setIsGoogleUser } =
    useContext(AppContext);

  const API_URL = import.meta.env.VITE_API_BASE_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !window.confirm(
        "Are you sure you want to delete your account? This cannot be undone."
      )
    ) {
      return;
    }

    if (!email || (!isGoogleUser && !password)) {
      alert("Both fields are required.");
      return;
    }

    try {
      const token = localStorage.getItem("access_token");

      if (!token) {
        alert("Session expired. Please login again.");
        return;
      }

      const res = await fetch(`${API_URL}/deleteaccount`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          user_email: email,
          user_password: isGoogleUser ? "" : password,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.msg || "Failed to delete account. Please try again later");
        return;
      }

      setEmail("");
      setPassword("");
      alert("Account deleted successfully");
      if (isGoogleUser) {
        googleLogout();
      }
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      setIsLoggedIn(false);
      navigate("/");
    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("access_token");
      if (!token) return;

      const res = await fetch(`${API_URL}/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setIsGoogleUser(data.auth_provider === "google");
      }
    };
    fetchUser();
  }, []);
  return (
    <div className="dlt-outerbox">
      <h3 className="dlt-headings">Delete your Account</h3>
      <form onSubmit={handleSubmit}>
        <label htmlFor="dlt-email-input">Enter your email address:</label>
        <input
          type="email"
          id="dlt-email-input"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
          }}
        />
        {!isGoogleUser && (
          <>
            <label htmlFor="dlt-pwd-input">Enter your password:</label>
            <div className="dlt-pwd-field">
              <input
                type={showPassword ? "text" : "password"}
                id="dlt-pwd-input"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                }}
              />
              <span
                className="dlt-pwd-icon"
                onClick={() => setShowPassword(!showPassword)}
              >
                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
              </span>
            </div>
          </>
        )}
        <button type="submit" className="btn border dlt-btn">
          Delete Account
        </button>
      </form>
    </div>
  );
};

export default DeleteAccount;
