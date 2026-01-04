import React, { useState, useEffect, useContext } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import GoogleSvg from "../assets/icons8-google.svg";
import { Link, useNavigate } from "react-router-dom";
import "./SignUp.css";
import TodoImg from "../assets/side-img.png";
import { AppContext } from "../context/context";
import { useGoogleLogin } from "@react-oauth/google";

const SignUp = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const [email, setEmail] = useState("");
  const { firstName, setFirstName, lastName, setLastName } =
    useContext(AppContext);

  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_BASE_URL;

  const handleSignUp = async () => {
    if (
      !email.trim() ||
      !password.trim() ||
      !firstName.trim() ||
      !lastName.trim()
    ) {
      alert("All fields are required!");
      return;
    }

    const res = await fetch(`${API_URL}/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, firstName, lastName }),
    });

    if (!res.ok) {
      alert("Server error. Try again...");
      return;
    }

    const data = await res.json();

    if (data.msg === "ok") {
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("refresh_token", data.refresh_token);
      navigate("/display");
    } else {
      alert(data.msg);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSignUp();
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

  const handleGoogleSignup = useGoogleLogin({
    onSuccess: async (response) => {
      handleGoogleAuth(response.access_token, "signup");
    },
    onError: () => {
      alert("Google login failed");
    },
  });
  return (
    <div className="signup-outerbox">
      <div className="signup-img">
        <img src={TodoImg} alt="Todo illustration" />
      </div>
      <div className="signup-innerbox">
        <div className="signup-headings">
          <h4>Welcome</h4>
          <h5>Enter the following details to register</h5>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="username-box">
            <label htmlFor="fname">Enter First Name:</label>
            <input
              type="text"
              id="fname"
              name="firstName"
              value={firstName}
              onChange={(e) => {
                setFirstName(e.target.value);
              }}
              required
            />

            <label htmlFor="lname">Enter Last Name:</label>
            <input
              type="text"
              id="lname"
              name="lastName"
              value={lastName}
              onChange={(e) => {
                setLastName(e.target.value);
              }}
              required
            />
          </div>
          <div className="signup-input-box">
            <label htmlFor="signup-email-box">Enter your email here:</label>
            <input
              type="email"
              id="signup-email-box"
              name="signup_user_email"
              placeholder="i.e., abc@email.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
              }}
              required
            />
            <label htmlFor="signup-password-box">
              Enter your password here:
            </label>
            <div className="signup-password-field">
              <input
                type={showPassword ? "text" : "password"}
                id="signup-password-box"
                name="signup_password"
                placeholder="i.e., 123456"
                value={password}
                onChange={(e) => {
                  const pwd = e.target.value;
                  setPassword(pwd);
                  const isStrong =
                    pwd.length >= 8 &&
                    /[A-Z]/.test(pwd) &&
                    /[a-z]/.test(pwd) &&
                    /[0-9]/.test(pwd) &&
                    /[!@#$%^&*()]/.test(pwd);
                  setIsPasswordValid(!isStrong);
                }}
                required
              />
              <span
                className="signup-password-icon"
                onClick={() => setShowPassword(!showPassword)}
              >
                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
              </span>
            </div>
            {isPasswordValid && (
              <div
                style={{ fontSize: "12px", color: "red", paddingLeft: "1rem" }}
              >
                Please enter a strong password
              </div>
            )}
          </div>
          <div className="signup-btn">
            <button className="btn border" type="submit">
              Sign Up
            </button>
            <button
              className="btn border"
              type="button"
              onClick={() => handleGoogleSignup()}
            >
              <img src={GoogleSvg} alt="Google" />
              Continue with Google
            </button>
          </div>
        </form>
        <div className="login-box">
          Already have an account? <Link to="/login">Log In</Link>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
