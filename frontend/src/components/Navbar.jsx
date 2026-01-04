import React, { useState, useEffect, useContext } from "react";
import "./Navbar.css";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { getValidToken } from "../utills/getValidToken";
import { AppContext } from "../context/context";
import { googleLogout } from "@react-oauth/google";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoggedIn, setIsLoggedIn, isGoogleUser } = useContext(AppContext);
  const [checkingLogin, setCheckingLogin] = useState(true);

  useEffect(() => {
    const checkLogin = async () => {
      const token = await getValidToken();
      setIsLoggedIn(!!token);
      setCheckingLogin(false);
    };
    checkLogin();
  }, [location.pathname]);

  const handlelogout = () => {
    googleLogout();
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setIsLoggedIn(false);
    navigate("/login");
  };

  if (checkingLogin) {
    return null;
  }

  return (
    <div className="navbar-box">
      <ul>
        <li>
          <Link className="navbar-tools" to={isLoggedIn ? "/display" : "/"}>
            Home
          </Link>
        </li>
        <li>
          <Link className="navbar-tools" to="/about">
            About Us
          </Link>
        </li>
        <li>
          <Link className="navbar-tools" to="contact">
            Contact Us
          </Link>
        </li>
      </ul>
      <ul>
        {!isLoggedIn ? (
          <>
            <li>
              <button className="btn border" onClick={() => navigate("/login")}>
                Log In
              </button>
            </li>
            <li>
              <button
                className="btn border"
                onClick={() => navigate("/signup")}
              >
                Sign Up
              </button>
            </li>
          </>
        ) : (
          <div className="dropdown">
            <button
              className="btn border custom-drop"
              type="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              Account
            </button>
            <ul className="dropdown-menu">
              <li>
                <button
                  className="dropdown-item d-btn btn"
                  onClick={() => navigate("/changeusername")}
                >
                  Change Name
                </button>
              </li>
              {isLoggedIn && !isGoogleUser && (
                <li>
                  <button
                    className="dropdown-item d-btn btn"
                    onClick={() => navigate("/changepassword")}
                  >
                    Change Password
                  </button>
                </li>
              )}
              <li>
                <button
                  className="dropdown-item d-btn btn"
                  onClick={() => navigate("/deleteaccount")}
                >
                  Delete Account
                </button>
              </li>
              <li>
                <button
                  className="dropdown-item d-btn btn"
                  onClick={handlelogout}
                >
                  Logout
                </button>
              </li>
            </ul>
          </div>
        )}
      </ul>
    </div>
  );
};

export default Navbar;
