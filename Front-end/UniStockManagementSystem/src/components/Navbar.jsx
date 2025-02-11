import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { isAuth, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-gray-800 text-white p-3">
      <div className="container mx-auto flex items-center justify-between">
        <Link to="/" className="text-xl font-bold">
          UniStock
        </Link>

        <div className="flex items-center ml-auto">
          {isAuth ? (
            <>
              {/* Thay me-3 => mr-3 */}
              <span className="mr-3">👤 {user?.email || "User"}</span>

              {/* Bỏ .btn .btn-danger .btn-sm, thay bằng class Tailwind cho nút đỏ nhỏ */}
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
              >
                🚪 Đăng xuất
              </button>
            </>
          ) : (
            <Link to="/login" className="text-white">
              🔑 Trang chủ
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
