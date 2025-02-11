import React, { useEffect } from "react";
import useUser from "./useUser";
// Import icon “mắt” và icon thùng rác
import { FaEye, FaTrashAlt } from "react-icons/fa";

const UserPage = () => {
  const { users, fetchUsers, deleteUser, toggleStatus } = useUser();

  // Ví dụ hàm edit (bạn có thể sửa tùy ý)
  const handleEditUser = (userId) => {
    console.log("Chỉnh sửa user:", userId);
  };

  useEffect(() => {
    fetchUsers().then((data) => {
      console.log("📢 API trả về danh sách Users:", data);
    });
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 mt-6">
      <h2 className="text-2xl font-bold mb-4">Quản lý Users</h2>

      <table className="w-full border border-gray-300 text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="border-b border-gray-300 px-3 py-2 text-left">ID</th>
            <th className="border-b border-gray-300 px-3 py-2 text-left">
              Email
            </th>
            <th className="border-b border-gray-300 px-3 py-2 text-left">
              Roles
            </th>
            <th className="border-b border-gray-300 px-3 py-2 text-left">
              Trạng thái
            </th>
            <th className="border-b border-gray-300 px-3 py-2 text-left">
              Hành động
            </th>
          </tr>
        </thead>
        <tbody>
          {users.length > 0 ? (
            users.map((user) => (
              <tr key={user.userId || user.id} className="hover:bg-gray-50">
                <td className="border-b border-gray-200 px-3 py-2">
                  {user.userId || user.id}
                </td>
                <td className="border-b border-gray-200 px-3 py-2">
                  {user.email}
                </td>

                {/* Hiển thị danh sách roles */}
                <td className="border-b border-gray-200 px-3 py-2">
                  {Array.isArray(user.roleNames)
                    ? user.roleNames.join(", ") // ✅ Nếu là mảng, hiển thị dạng danh sách
                    : typeof user.roleNames === "string"
                    ? user.roleNames // Nếu là chuỗi, giữ nguyên
                    : "Không có vai trò"}
                </td>

                {/* Switch toggle cho Trạng thái */}
                <td className="border-b border-gray-200 px-3 py-2">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={user.isActive}
                      onChange={() => toggleStatus(user.userId, user.isActive)}
                      className="sr-only peer"
                    />
                    <div
                      className="
                        w-10 h-5 bg-gray-200 rounded-full
                        peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300
                        peer dark:bg-gray-300 dark:peer-focus:ring-green-800
                        peer-checked:bg-green-500
                        relative transition-colors
                        after:content-[''] after:absolute after:top-[2px] after:left-[2px]
                        after:bg-white after:border-gray-300 after:border 
                        after:rounded-full after:h-4 after:w-4 
                        after:transition-all after:duration-300
                        peer-checked:after:translate-x-full
                        peer-checked:after:border-white
                      "
                    />
                  </label>
                  <span className="ml-2 text-sm">
                    {user.isActive ? "Hoạt động" : "Vô hiệu hóa"}
                  </span>
                </td>

                {/* Thêm nút “mắt” và nút “Xóa” */}
                <td className="border-b border-gray-200 px-3 py-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEditUser(user.userId)}
                      className="flex items-center bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 text-sm rounded"
                    >
                      <FaEye className="mr-1" />
                      Chỉnh sửa
                    </button>

                    <button
                      onClick={() => deleteUser(user.userId)}
                      className="flex items-center bg-red-600 hover:bg-red-700 text-white px-3 py-1 text-sm rounded"
                    >
                      <FaTrashAlt className="mr-1" />
                      Xóa
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan="5"
                className="border-b border-gray-200 px-3 py-4 text-center text-gray-500"
              >
                Không có dữ liệu
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default UserPage;
