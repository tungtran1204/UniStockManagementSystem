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
    <div className="flex flex-col p-3 bg-gray-800 text-white h-screen w-[250px]">
      {user ? (
        <p className="">
          Roles: {user.roles ? user.roles.join(", ") : "No roles"}
        </p>
      ) : (
        <p className="text-red-500">User not found</p>
      )}

      <ul className="mt-4 space-y-2">
        {menuItems
          .filter((item) =>
            user && user.roles
              ? item.roles.some((role) => user.roles.includes(role)) // ✅ Kiểm tra nếu user có bất kỳ role nào phù hợp
              : false
          )
          .map((item, index) => (
            <li key={index}>
              <Link
                to={item.path}
                className="flex items-center text-white hover:text-gray-300"
              >
                {item.icon}
                <span className="ml-2">{item.label}</span>
              </Link>
            </li>
          ))}
      </ul>
    </div>
  );
};

export default Sidebar;
