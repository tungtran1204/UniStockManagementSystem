import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { isAuth, user, logout } = useAuth();

  return (
    <nav className="bg-dark text-white p-3">
      <div className="container d-flex justify-content-between align-items-center">
        <div>
          <Link to="/" className="text-white me-3">
            🏠 Home
          </Link>
          <Link to="/inventory" className="text-white me-3">
            📦 Kho hàng
          </Link>
          <Link to="/orders" className="text-white">
            📜 Đơn hàng
          </Link>
        </div>

        <div>
          {isAuth ? (
            <>
              <span className="me-3">👤 {user?.email || "User"}</span>
              <button onClick={logout} className="btn btn-danger btn-sm">
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
