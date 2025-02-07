import { createContext, useContext, useState, useEffect } from "react";
import {
  getUser,
  isAuthenticated,
  login,
  logout,
} from "../services/authService";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    // Khi load lại trang, lấy user từ localStorage nếu đã đăng nhập
    if (isAuthenticated()) {
      setUser(getUser());
      setIsAuth(true);
    }
  }, []);

  const handleLogin = async (credentials) => {
    try {
      const loggedInUser = await login(credentials);
      setUser(loggedInUser);
      setIsAuth(true);
      return { success: true };
    } catch (error) {
      return { success: false, message: error };
    }
  };

  const handleLogout = () => {
    logout();
    setUser(null);
    setIsAuth(false);
  };

  return (
    <AuthContext.Provider
      value={{ user, isAuth, login: handleLogin, logout: handleLogout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
