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
  const location = useLocation();
  const { isAuth, user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  if (!isAuth && location.pathname !== "/login") {
    return <Navigate to="/login" replace />;
  }

  if (isAuth && location.pathname === "/login") {
    if (user.role === "ADMIN") return <Navigate to="/admin" replace />;
    if (user.role === "MANAGER") return <Navigate to="/dashboard" replace />;
    return <Navigate to="/home" replace />;
  }

  // Nếu trang login => ẩn Sidebar
  const hideSidebar = location.pathname === "/login";

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <div className="flex flex-1">
        {!hideSidebar && (
          <aside className="bg-gray-800 w-[250px] text-white">
            <Sidebar />
          </aside>
        )}

        <main className="flex-1 container mx-auto">
          <Routes>
            <Route path="/*" element={<AppRoutes />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default App;
