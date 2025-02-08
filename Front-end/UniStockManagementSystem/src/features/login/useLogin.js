import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext"; // ✅ Import AuthContext
import { login, getUser } from "../../services/authService";

const useLogin = () => {
  const { user, setUser, isAuth, setIsAuth } = useAuth(); // ✅ Lấy từ AuthContext
  const [loading, setLoading] = useState(true); // ✅ Thêm trạng thái loading

  // 🟢 Khi Component mount, lấy User từ localStorage
  useEffect(() => {
    const storedUser = getUser();
    if (storedUser) {
      setUser(storedUser);
      setIsAuth(true);
    }
    setLoading(false); // ✅ Đánh dấu load xong
  }, []);

  // 🟢 Hàm đăng nhập
  const handleLogin = async (email, password) => {
    try {
      const userData = await login({ email, password });
      console.log("📢 API Login Response:", userData); // ✅ Kiểm tra dữ liệu trả về

      // 🔥 Kiểm tra nếu userData có đầy đủ dữ liệu
      if (userData?.token && userData?.email && userData?.role) {
        localStorage.setItem("user", JSON.stringify(userData)); // ✅ Lưu vào localStorage
        setUser(userData); // ✅ Cập nhật state ngay lập tức
        setIsAuth(true);

        return { success: true, user: userData };
      }

      return { success: false, message: "Dữ liệu đăng nhập không hợp lệ" };
    } catch (error) {
      console.error("❌ Lỗi khi đăng nhập:", error);
      return { success: false, message: "Lỗi khi đăng nhập, vui lòng thử lại" };
    }
  };

  return { user, isAuth, handleLogin, loading };
};

export default useLogin;
