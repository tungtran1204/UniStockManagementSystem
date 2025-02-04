import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <nav className="bg-dark text-white p-3">
      <div className="container">
        <Link to="/">🏠 Home</Link>
        <Link to="/inventory">📦 Kho hàng</Link>
        <Link to="/orders">📜 Đơn hàng</Link>
        {isAuthenticated ? (
          <div>
            <span>👤 {user.name}</span>
            <button onClick={logout}>🚪 Đăng xuất</button>
          </div>
        ) : (
          <Link to="/login">🔑 Đăng nhập</Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
