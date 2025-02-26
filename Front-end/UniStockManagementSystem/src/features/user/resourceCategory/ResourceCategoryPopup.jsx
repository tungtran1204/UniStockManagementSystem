import React from "react";
import { FaTimes } from "react-icons/fa";

const ResourceCategoryPopup = ({
  isOpen,
  content,
  categoryName,
  categoryDescription,
  onClose,
  onSave,
  onCategoryNameChange,
  onCategoryDescriptionChange,
}) => {
  if (!isOpen) return null; // Do not render if the popup is not open

return (
    <div className="fixed inset-0 flex items-center justify-center bg- bg-opacity-30 z-50">
        <div className="bg-white p-4 rounded shadow-lg relative w-1/3">
            <button
                className="absolute top-2 right-2 text-gray-700 hover:text-gray-900"
                onClick={onClose}
            >
                <FaTimes />
            </button>
            <h2 className="text-xl mb-4">{content}</h2>
            <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="categoryName">
                    Name
                </label>
                <input
                    id="categoryName"
                    type="text"
                    value={categoryName}
                    onChange={onCategoryNameChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
            </div>
            <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="categoryDescription">
                    Description
                </label>
                <input
                    id="categoryDescription"
                    type="text"
                    value={categoryDescription}
                    onChange={onCategoryDescriptionChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
            </div>
            <div className="flex justify-end space-x-2">
                <button className="bg-gray-500 text-white px-4 py-2 rounded" onClick={onClose}>
                    Cancel
                </button>
                <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={onSave}>
                    Save
                </button>
            </div>
        </div>
    </div>
);
};

export default ResourceCategoryPopup;