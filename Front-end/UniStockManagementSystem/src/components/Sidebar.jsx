import React from "react";
import { Link } from "react-router-dom";
import { FaHome, FaUser, FaUsers, FaCog } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";

const Sidebar = () => {
  const { user } = useAuth();

  // Cấu hình menu theo từng role
  const menuItems = [
    {
      path: "/dashboard",
      label: "Dashboard",
      icon: <FaHome />,
      roles: ["ADMIN", "MANAGER", "USER"],
    },
    {
      path: "/admin/users",
      label: "Manage Users",
      icon: <FaUsers />,
      roles: ["ADMIN"],
    },
    {
      path: "/admin/roles",
      label: "Manage Roles",
      icon: <FaUser />,
      roles: ["ADMIN"],
    },
    {
      path: "/settings",
      label: "Settings",
      icon: <FaCog />,
      roles: ["ADMIN", "MANAGER"],
    },
  ];

  return (
    <div
      className="d-flex flex-column p-3 bg-dark text-white"
      style={{ height: "100vh", width: "250px" }}
    >
      <h4 className="text-center">Sidebar</h4>
      {user ? (
        <p className="text-center">Role: {user.role}</p>
      ) : (
        <p className="text-center text-danger">User not found</p>
      )}
      <ul className="nav flex-column">
        {menuItems
          .filter((item) => user && item.roles.includes(user.role))
          .map((item, index) => (
            <li className="nav-item" key={index}>
              <Link to={item.path} className="nav-link text-white">
                {item.icon} <span className="ms-2">{item.label}</span>
              </Link>
            </li>
          ))}
      </ul>
    </div>
  );
};

export default Sidebar;
