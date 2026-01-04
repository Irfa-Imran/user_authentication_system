import React, { useEffect, useState, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Display.css";
import Loader from "./Loader";
import { AppContext } from "../context/context";

const Display = () => {
  const location = useLocation();
  const { name } = location.state || {};
  const token = localStorage.getItem("access_token");
  const { setIsGoogleUser } = useContext(AppContext);

  const [user, setUser] = useState(null);

  const API_URL = import.meta.env.VITE_API_BASE_URL;

  const getUser = async () => {
    if (!token) return null;

    try {
      const res = await fetch(`${API_URL}/me`, {
        method: "GET",
        mode: "cors",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        return null;
      }

      const data = await res.json();

      return data;
    } catch (err) {
      return null;
    }
  };

  useEffect(() => {
    getUser().then((data) => {
      if (data) {
        setUser(data);

        if (data.auth_provider === "google") {
          setIsGoogleUser(true); // Google user
        } else {
          setIsGoogleUser(false); // Regular user
        }
      }
    });
  }, []);

  return (
    <div className="display-outerbox">
      {!user && !name ? (
        <Loader />
      ) : (
        <h3 className="display-headings">
          {" "}
          Welcome {name || user?.name || "Guest"}!
        </h3>
      )}
    </div>
  );
};

export default Display;
