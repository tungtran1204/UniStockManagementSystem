import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { isAuth, user, logout } = useAuth();
  const navigate = useNavigate(); // Dùng để chuyển hướng

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-dark text-white p-3">
      <div className="container d-flex justify-content-between align-items-center">
        {/* Phần đăng nhập/đăng xuất nằm bên phải */}
        <div className="d-flex align-items-center ms-auto">
          {isAuth ? (
            <>
              <span className="me-3">👤 {user?.email || "User"}</span>
              <button onClick={handleLogout} className="btn btn-danger btn-sm">
                🚪 Đăng xuất
              </button>
            </>
          ) : (
            <Link to="/login" className="text-white">
              🔑 Đăng nhập
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
