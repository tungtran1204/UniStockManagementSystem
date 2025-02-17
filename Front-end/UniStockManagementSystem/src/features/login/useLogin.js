import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext"; // ✅ Import AuthContext
import { login, getUser } from "../../services/authService";

const useLogin = () => {
  const { user, setUser, isAuth, setIsAuth } = useAuth(); // ✅ Lấy từ AuthContext
  const [loading, setLoading] = useState(true); // ✅ Thêm trạng thái loading

  useEffect(() => {
    const storedUser = getUser();
    if (storedUser) {
      setUser(storedUser);
      setIsAuth(true);
    }
    setLoading(false);
  }, []);

  // 🟢 Hàm đăng nhập
  const handleLogin = async (email, password) => {
    try {
      const result = await login({ email, password });
      console.log("📢 API Login Response:", JSON.stringify(result, null, 2));

      if (result.success === false) {
        return { success: false, message: result.message };
      }

      setUser(result);
      setIsAuth(true);

      return { success: true, user: result };
    } catch (error) {
      console.error("❌ Lỗi khi đăng nhập:", error);
      return {
        success: false,
        message: error.message || "Lỗi khi đăng nhập, vui lòng thử lại",
      };
    }
  };

  return { user, isAuth, handleLogin, loading };
};

export default useLogin;
