import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ allowedRoles }) => {
  const { isAuth, user, loading } = useAuth();
  const location = useLocation(); // ✅ Lấy đường dẫn hiện tại

  if (loading) return <div>Loading...</div>; // ✅ Chờ AuthContext load xong trước khi kiểm tra quyền

  console.log("🔐 Checking access:", { user, allowedRoles, isAuth });

  // 🔴 Nếu user chưa đăng nhập hoặc không có trong AuthContext → Chuyển về trang login
  if (!isAuth || !user) {
    console.warn("🚨 User is not authenticated! Redirecting to login...");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // ✅ Kiểm tra nếu `user.roles` là mảng, nếu không thì chuyển thành []
  const userRoles = Array.isArray(user.roles)
    ? user.roles
    : typeof user.roles === "string"
    ? user.roles.split(",").map((role) => role.trim())
    : [];

  console.log("✅ User roles:", userRoles);

  // 🔴 Kiểm tra nếu user có ít nhất một role trong `allowedRoles`
  if (allowedRoles && !userRoles.some((role) => allowedRoles.includes(role))) {
    console.warn("🚫 User does not have permission! Redirecting...");
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
