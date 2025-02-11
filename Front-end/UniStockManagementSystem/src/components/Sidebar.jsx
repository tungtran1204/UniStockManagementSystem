import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaHome, FaUser, FaUsers, FaCog, FaBox, FaCogs, FaCubes } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";

const Sidebar = () => {
  const { user } = useAuth();
  const [isResourceOpen, setIsResourceOpen] = useState(false);

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
    {
      path: "/user/partners",
      label: "Partner",
      icon: <FaCog />,
      roles: ["USER"],
    },
    {
      path: "/user/resource",
      label: "Resource",
      icon: <FaCog />,
      roles: ["USER"],
    },
  ];

  const resourceSubMenu = [
    { path: "/user/resources/products", label: "Product", icon: <FaBox /> },
    { path: "/user/resources/materials", label: "Material", icon: <FaCubes /> },
    { path: "/user/resources/fixed-assets", label: "Fixed Asset", icon: <FaCogs /> },
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

        {/* Resource Menu with Submenu */}
        {user?.roles.includes("USER") && (
          <li>
            <button
              className="flex items-center text-white hover:text-gray-300 w-full"
              onClick={() => setIsResourceOpen(!isResourceOpen)}
            >
              <FaCog />
              <span className="ml-2">Resources</span>
            </button>
            {isResourceOpen && (
              <ul className="ml-6 mt-2 space-y-1">
                {resourceSubMenu.map((subItem, subIndex) => (
                  <li key={subIndex}>
                    <Link
                      to={subItem.path}
                      className="flex items-center text-white hover:text-gray-300"
                    >
                      {subItem.icon}
                      <span className="ml-2">{subItem.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </li>
        )}
      </ul>
    </div>
  );
};

export default Sidebar;
