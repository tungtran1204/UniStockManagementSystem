import { createContext, useContext, useState, useEffect } from "react";
import { getUser, isAuthenticated, logout } from "../services/authService";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(true); // ✅ Thêm trạng thái loading

  useEffect(() => {
    const storedUser = getUser();
    console.log("🔍 Reload: User from localStorage", storedUser);

    if (storedUser && isAuthenticated()) {
      setUser(storedUser);
      setIsAuth(true);
    } else {
      setUser(null);
      setIsAuth(false);
    }

    setLoading(false); // ✅ Đánh dấu load xong
  }, []);

  const handleLogout = () => {
    logout();
    setUser(null);
    setIsAuth(false);
  };

  if (loading) {
    return <div>Loading...</div>; // ✅ Chặn render khi chưa xác định trạng thái đăng nhập
  }

  return (
    <AuthContext.Provider
      value={{ user, isAuth, setUser, setIsAuth, logout: handleLogout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
