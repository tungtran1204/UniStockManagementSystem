import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
  useLocation,
} from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
};

const AppContent = () => {
  const location = useLocation(); // Lấy đường dẫn hiện tại
  const { isAuth, user, loading } = useAuth(); // Lấy trạng thái đăng nhập từ AuthContext

  // Chờ AuthContext load xong trước khi hiển thị UI
  if (loading) return <div>Loading...</div>;

  // ✅ Nếu chưa đăng nhập và không ở trang login -> Chuyển hướng về login
  if (!isAuth && location.pathname !== "/login") {
    return <Navigate to="/login" replace />;
  }

  // ✅ Nếu user đã đăng nhập mà cố vào trang login -> Điều hướng về trang phù hợp
  if (isAuth && location.pathname === "/login") {
    if (user.role === "ADMIN") return <Navigate to="/admin" replace />;
    if (user.role === "MANAGER") return <Navigate to="/dashboard" replace />;
    return <Navigate to="/home" replace />; // Mặc định nếu không có role cụ thể
  }

  // ✅ Ẩn Sidebar nếu đang ở trang login
  const hideSidebar = location.pathname === "/login";

  return (
    <div className="d-flex">
      {!hideSidebar && <Sidebar />}
      <div className="w-100">
        <Navbar />
        <main className="container mx-auto p-4">
          <Routes>
            <Route path="/*" element={<AppRoutes />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default App;
