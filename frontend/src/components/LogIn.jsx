import React, { useState, useEffect } from "react";
import "./Login.css";
import { Link } from "react-router-dom";
import GoogleSvg from "../assets/icons8-google.svg";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import TodoImg from "../assets/side-img.png";
import { useNavigate } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";

const LogIn = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_BASE_URL;

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      alert("Email and Password required");
      return;
    }

    const res = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (data.msg === "ok") {
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("refresh_token", data.refresh_token);
      navigate("/display");
    } else {
      alert(data.msg || "Server error. Please try again.");
    }
  };

  const handleGoogleAuth = async (token, action = "login") => {
    try {
      const res = await fetch(`${API_URL}/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, action }),
      });

      const data = await res.json();

      if (!res.ok || !data.access_token) {
        console.error("Google auth failed", data);
        alert(data.msg || "Google authentication failed");
        return;
      }

      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("refresh_token", data.refresh_token);
      navigate("/display");
    } catch (err) {
      console.error("Google auth error", err);
      alert("Something went wrong. Please try again.");
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async (response) => {
      handleGoogleAuth(response.access_token, "login");
    },
    onError: () => {
      alert("Google login failed");
    },
  });

  return (
    <div className="login-outerbox">
      <div className="login-img">
        <img src={TodoImg} alt="Todo illustration" />
      </div>
      <div className="login-innerbox">
        <div className="login-headings">
          <h4>Welcome Back!</h4>
          <h5>Please Enter your details.</h5>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleLogin();
          }}
        >
          <div className="login-input-box">
            <label htmlFor="login-email-box">Enter your email here:</label>
            <input
              type="email"
              name="login_user_email"
              placeholder="i.e., abc@email.com"
              id="login-email-box"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
              }}
              required
            />
            <label htmlFor="login-password-box">
              Enter your password here:
            </label>
            <div className="password-input-field">
              <input
                type={showPassword ? "text" : "password"}
                name="login_password"
                placeholder="i.e., 12345678"
                id="login-password-box"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                }}
                required
              />
              <span
                className="password-icon"
                onClick={() => setShowPassword(!showPassword)}
              >
                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
              </span>
            </div>
          </div>
          <div className="login-btn">
            <button className="btn border" type="submit">
              Log In
            </button>
            <button
              className="btn border"
              type="button"
              onClick={() => googleLogin()}
            >
              <img src={GoogleSvg} alt="Google" />
              Signin with Google
            </button>
          </div>
        </form>
        <div className="signup-box">
          Don't have an account <Link to="/signup">Sign Up</Link>
        </div>
      </div>
    </div>
  );
};

export default LogIn;
