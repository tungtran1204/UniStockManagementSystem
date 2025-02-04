import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import paths from "./paths";

// Import các trang
import LoginPage from "../features/auth/LoginPage";
import DashboardPage from "../features/dashboard/DashboardPage";

import NotFoundPage from "../features/misc/NotFoundPage";
import HomePage from "../features/home/HomePage";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path={paths.home} element={<HomePage />} />
      <Route path={paths.login} element={<LoginPage />} />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path={paths.dashboard} element={<DashboardPage />} />
      </Route>

      {/* Catch-all 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;
