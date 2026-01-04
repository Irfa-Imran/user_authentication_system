import { createContext } from "react";

export const AppContext = createContext({
  firstName: "",
  setFirstName: () => {},
  lastName: "",
  setLastName: () => {},
  isLoggedIn: false,
  setIsLoggedIn: () => {},
  isGoogleUser: false,
  setIsGoogleUser: () => {},
});
