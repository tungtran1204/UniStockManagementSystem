import React, { createContext, useContext, useState, useEffect } from "react";
import {
  getUser,
  login as loginService,
  logout as logoutService,
} from "../services/authService";

// Tạo Context
const AuthContext = createContext();

// Provider để bọc toàn bộ app
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const storedUser = getUser();
    if (storedUser) {
      setUser(storedUser);
      setIsAuthenticated(true);
    }
  }, []);

  const login = async (credentials) => {
    const userData = await loginService(credentials);
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = () => {
    logoutService();
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
