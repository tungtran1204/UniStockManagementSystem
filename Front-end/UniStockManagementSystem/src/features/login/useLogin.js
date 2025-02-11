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
      console.log("📢 API Login Response:", JSON.stringify(userData, null, 2)); // 🟢 In dữ liệu API trả về

      if (!userData || !userData.token || !userData.email || !userData.roles) {
        return { success: false, message: "Dữ liệu đăng nhập không hợp lệ" };
      }

      // ✅ Kiểm tra nếu `roles` là mảng, nếu không thì chuyển thành mảng
      const userRoles = Array.isArray(userData.roles)
        ? userData.roles
        : typeof userData.roles === "string"
        ? userData.roles.split(",").map((role) => role.trim()) // ✅ Chuyển từ chuỗi sang mảng nếu cần
        : [];

      if (userRoles.length === 0) {
        return { success: false, message: "User không có quyền hợp lệ" };
      }

      // ✅ Lưu vào localStorage
      const userObject = {
        email: userData.email,
        token: userData.token,
        roles: userRoles,
      };
      localStorage.setItem("user", JSON.stringify(userObject));

      setUser(userObject); // ✅ Cập nhật state ngay lập tức
      setIsAuth(true);

      console.log("✅ Đăng nhập thành công! User:", userObject);

      return { success: true, user: userObject };
    } catch (error) {
      console.error(
        "❌ Lỗi khi đăng nhập:",
        error.response ? error.response.data : error.message
      );
      return { success: false, message: "Lỗi khi đăng nhập, vui lòng thử lại" };
    }
  };

  return { user, isAuth, handleLogin, loading };
};

export default useLogin;
