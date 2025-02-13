import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaHome, FaUser, FaUsers, FaCog, FaBox, FaCogs, FaCubes, FaEllipsisV, FaEdit, FaPlus } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import ResourceCategoryPopup from "../features/user/resourceCategory/ResourceCategoryPopup";
import useResourceCategory from "../features/user/resourceCategory/useResourceCategory";

const Sidebar = () => {
  const { user } = useAuth(); // Get the authenticated user
  const { categories, addCategory, editCategory } = useResourceCategory(); // Use custom hook to manage resource categories
  console.log(categories); // Check the value of categories
  const [isResourceOpen, setIsResourceOpen] = useState(false); // State to toggle resource submenu
  const [isMoreActionsOpen, setIsMoreActionsOpen] = useState(false); // State to toggle more actions menu
  const [isPopupOpen, setIsPopupOpen] = useState(false); // State to toggle popup
  const [popupContent, setPopupContent] = useState(""); // State to set popup content
  const [categoryName, setCategoryName] = useState(""); // State to manage category name input
  const [categoryDescription, setCategoryDescription] = useState(""); // State to manage category description input
  const [editingCategoryId, setEditingCategoryId] = useState(null); // State to manage the ID of the category being edited

  const menuItems = [
    // Define the main menu items
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
  ];

  const handlePopupOpen = (content, category = null) => {
    // Open the popup and set its content
    setPopupContent(content);
    setIsPopupOpen(true);
    if (category) {
      setCategoryName(category.name);
      setCategoryDescription(category.description);
      setEditingCategoryId(category.id);
    } else {
      setCategoryName("");
      setCategoryDescription("");
      setEditingCategoryId(null);
    }
  };

  const handlePopupClose = () => {
    // Close the popup and reset its state
    setIsPopupOpen(false);
    setPopupContent("");
    setCategoryName("");
    setCategoryDescription("");
    setEditingCategoryId(null);
  };

  const handleCategoryNameChange = (e) => {
    // Handle changes to the category name input
    setCategoryName(e.target.value);
  };

  const handleCategoryDescriptionChange = (e) => {
    // Handle changes to the category description input
    setCategoryDescription(e.target.value);
  };

  const handleSaveChanges = async () => {
    // Save changes to the category (add or edit)
    const category = {
      name: categoryName,
      description: categoryDescription,
    };

    if (editingCategoryId) {
      await editCategory(editingCategoryId, category);
    } else {
      await addCategory(category);
    }

    handlePopupClose();
  };

  return (
    <div className="flex flex-col p-3 bg-gray-800 text-white h-screen w-[250px]">
      {user ? (
        <p>Roles: {user.roles ? user.roles.join(", ") : "No roles"}</p>
      ) : (
        <p className="text-red-500">User not found</p>
      )}

      <ul className="mt-4 space-y-2">
        {menuItems
          .filter((item) =>
            user && user.roles ? item.roles.some((role) => user.roles.includes(role)) : false
          )
          .map((item, index) => (
            <li key={index}>
              <Link to={item.path} className="flex items-center text-white hover:text-gray-300">
                {item.icon}
                <span className="ml-2">{item.label}</span>
              </Link>
            </li>
          ))}

        {/* Resource Menu with Submenu */}
        {user?.roles.includes("USER") && (
          <li>
            <div className="flex justify-between items-center">
              <button
                className="flex items-center text-white hover:text-gray-300 w-full"
                onClick={() => setIsResourceOpen(!isResourceOpen)}
              >
                <FaCog />
                <span className="ml-2">Resources</span>
              </button>
              <button
                className="text-white hover:text-gray-300"
                onClick={() => setIsMoreActionsOpen(!isMoreActionsOpen)}
              >
                <FaEllipsisV />
              </button>
            </div>
            {isMoreActionsOpen && (
              <div className="ml-6 mt-2 p-2 bg-gray-700 rounded">
                <button
                  className="text-white flex items-center mt-2"
                  onClick={() => handlePopupOpen("Add Category")}
                >
                  <FaPlus className="mr-2" /> Add Category
                </button>
              </div>
            )}
            {isResourceOpen && (
              <ul className="ml-6 mt-2 space-y-1">
                {Array.isArray(categories) && categories.map((category, subIndex) => (
                  <li key={subIndex} className="flex justify-between items-center">
                    <Link
                      to={`/user/resources/${category.name.toLowerCase()}`}
                      className="flex items-center text-white hover:text-gray-300"
                    >
                      <FaBox />
                      <span className="ml-2">{category.name}</span>
                    </Link>
                    <button
                      className="text-white hover:text-gray-300"
                      onClick={() => handlePopupOpen(`Edit ${category.name}`, category)}
                    >
                      <FaEdit />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </li>
        )}
      </ul>

      <ResourceCategoryPopup
        isOpen={isPopupOpen}
        content={popupContent}
        categoryName={categoryName}
        categoryDescription={categoryDescription}
        onClose={handlePopupClose}
        onSave={handleSaveChanges}
        onCategoryNameChange={handleCategoryNameChange}
        onCategoryDescriptionChange={handleCategoryDescriptionChange}
      />
    </div>
  );
};

export default Sidebar;