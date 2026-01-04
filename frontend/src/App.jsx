import { useState, useEffect } from "react";
import { getValidToken } from "./utills/getValidToken";
import "./App.css";
import Navbar from "./components/Navbar";
import MainContent from "./components/MainContent";
import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";
import LogIn from "./components/LogIn";
import SignUp from "./components/SignUp";
import Guest from "./components/Guest";
import Display from "./components/Display";
import { AppContext } from "./context/context";
import ChangeName from "./components/ChangeName";
import ChangePassword from "./components/ChangePassword";
import DeleteAccount from "./components/DeleteAccount";

function App() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isGoogleUser, setIsGoogleUser] = useState(false);

  useEffect(() => {
    const init = async () => {
      const token = await getValidToken();
      if (!token) {
        setIsLoggedIn(false);
        setIsGoogleUser(false);
        return;
      }
      setIsLoggedIn(true);
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          setIsGoogleUser(false);
          return;
        }
        const data = await res.json();
        setIsGoogleUser(data.auth_provider === "google");
        setFirstName(data.first_name || data.name || "");
        setLastName(data.last_name || "");
      } catch (err) {
        console.warn("App init /me failed", err);
      }
    };
    init();
  }, []);

  const router = createBrowserRouter([
    {
      path: "/",
      element: (
        <>
          <Navbar />
          <Outlet />
        </>
      ),
      children: [
        { path: "/", element: <MainContent /> },
        { path: "/login", element: <LogIn /> },
        { path: "/signup", element: <SignUp /> },
        { path: "/guest", element: <Guest /> },
        { path: "/display", element: <Display /> },
        { path: "/changeusername", element: <ChangeName /> },
        { path: "/changepassword", element: <ChangePassword /> },
        { path: "/deleteaccount", element: <DeleteAccount /> },
      ],
    },
  ]);
  return (
    <>
      <AppContext.Provider
        value={{
          firstName,
          setFirstName,
          lastName,
          setLastName,
          isLoggedIn,
          setIsLoggedIn,
          isGoogleUser,
          setIsGoogleUser,
        }}
      >
        <RouterProvider router={router} />
      </AppContext.Provider>
    </>
  );
}

export default App;
