import React from "react";
import { BrowserRouter as Router, useLocation } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import { AuthProvider } from "./context/AuthContext";
import useLogin from "./features/login/useLogin";
import Sidebar from "./components/Sidebar";
import Footer from "./components/Footer";
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
  const location = useLocation(); // Lấy thông tin trang hiện tại
  const { isAuthenticated } = useLogin();

  // Ẩn Sidebar trên trang Login
  const hideSidebar = location.pathname === "/login";

  return (
    <div className="d-flex">
      {!hideSidebar && <Sidebar />}
      <div className="w-100">
        <Navbar />
        <main className="container mx-auto p-4">
          <AppRoutes />
        </main>
        {/* <Footer /> */}
      </div>
    </div>
  );
};

export default App;
