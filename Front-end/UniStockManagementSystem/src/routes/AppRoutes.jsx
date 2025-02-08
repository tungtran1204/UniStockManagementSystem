import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import paths from "./paths";

// Import các trang
import LoginPage from "../features/login/LoginPage";
import DashboardPage from "../features/dashboard/DashboardPage";
import NotFoundPage from "../features/misc/NotFoundPage";
import HomePage from "../features/home/HomePage";

// Import các trang dành riêng cho từng Role
import UserPage from "../features/admin/users/UserPage";
import RolePage from "../features/admin/roles/RolePage";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path={paths.home} element={<HomePage />} />
      <Route path={paths.login} element={<LoginPage />} />

      {/* Protected Routes - Tất cả user đã đăng nhập */}
      <Route
        element={<ProtectedRoute allowedRoles={["ADMIN", "MANAGER", "USER"]} />}
      >
        <Route path={paths.dashboard} element={<DashboardPage />} />
      </Route>

      {/* Admin Routes */}
      <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
        <Route path={paths.admin.users} element={<UserPage />} />
        <Route path={paths.admin.roles} element={<RolePage />} />
      </Route>

      {/* Catch-all 404 */}
      <Route path={paths.notFound} element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;
