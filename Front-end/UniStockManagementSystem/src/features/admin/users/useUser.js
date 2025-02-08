import { useState, useEffect } from "react";
import { getUsers, deleteUserById, toggleUserStatus } from "./userService";

const useUser = () => {
  const [users, setUsers] = useState([]);

  // 🟢 **Lấy danh sách Users từ API**
  const fetchUsers = async () => {
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (error) {
      console.error("❌ Không thể tải danh sách Users:", error);
    }
  };

  // 🔴 **Xóa user theo ID**
  const deleteUser = async (userId) => {
    try {
      await deleteUserById(userId);
      setUsers((prevUsers) =>
        prevUsers.filter((user) => user.userId !== userId)
      ); // ✅ Cập nhật state
    } catch (error) {
      console.error("❌ Lỗi khi xóa User:", error);
    }
  };

  // 🔄 **Toggle trạng thái `isActive`**
  const toggleStatus = async (userId, currentStatus) => {
    try {
      const newStatus = !currentStatus; // ✅ Đảo trạng thái hiện tại
      const updatedUser = await toggleUserStatus(userId, newStatus);
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.userId === userId
            ? { ...user, isActive: updatedUser.isActive }
            : user
        )
      );
    } catch (error) {
      console.error("❌ Lỗi khi cập nhật trạng thái:", error);
    }
  };

  // ✅ Gọi `fetchUsers` khi Component được mount
  useEffect(() => {
    fetchUsers();
  }, []);

  return { users, fetchUsers, deleteUser, toggleStatus };
};

export default useUser;
