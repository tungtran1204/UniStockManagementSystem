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

  // 🔴 Nếu có `allowedRoles` và role của user không nằm trong danh sách → Chuyển về trang unauthorized
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    console.warn("🚫 User does not have permission! Redirecting...");
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
