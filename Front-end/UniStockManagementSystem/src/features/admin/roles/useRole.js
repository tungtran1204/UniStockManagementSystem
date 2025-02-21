import { useState, useEffect } from "react";
import {
  getAllRoles,
  getAllPermissions,
  getRolePermissions,
  updateRole,
  toggleRoleStatus,
  deleteRole,
} from "./roleService";

const useRole = () => {
  const [roles, setRoles] = useState([]);
  const [allPermissions, setAllPermissions] = useState([]); // 🟢 Lưu danh sách permissions
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);
  const [rolePermissions, setRolePermissions] = useState([]); // 🟢 Permissions của role

  // 🟢 Tải danh sách Vai Trò từ backend
  useEffect(() => {
    setLoading(true);
    const fetchData = async () => {
      try {
        const rolesData = await getAllRoles();
        setRoles(rolesData);
        console.log("✅ [useRole] Danh sách roles:", rolesData);

        const permissionsData = await getAllPermissions();
        setAllPermissions(permissionsData);
        console.log("✅ [useRole] Danh sách permissions:", permissionsData);
      } catch (err) {
        console.error("🚨 [useRole] Lỗi khi tải dữ liệu:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 🟢 Lấy danh sách permissions của một role cụ thể
  const fetchRolePermissions = async (roleId) => {
    try {
      setLoading(true);
      const rolePerms = await getRolePermissions(roleId);
      setRolePermissions(rolePerms);
      console.log(`✅ [useRole] Danh sách permissions cho Role ID ${roleId}:`, rolePerms);
    } catch (err) {
      console.error(`🚨 [useRole] Lỗi khi lấy danh sách permissions của role ${roleId}:`, err);
      setRolePermissions([]);
    } finally {
      setLoading(false);
    }
  };

  // 🟢 Chọn role để chỉnh sửa (hiển thị trong modal)
  const handleSelectRole = (role) => {
    setSelectedRole(role);
    fetchRolePermissions(role.id);
  };

  // 🟢 Thêm Vai Trò mới
  const handleAddRole = async (role) => {
    try {
      const newRole = await addRole(role);
      if (newRole) {
        setRoles([...roles, newRole]);
        console.log("✅ [useRole] Vai trò mới đã được thêm:", newRole);
      }
    } catch (error) {
      console.error("❌ [useRole] Lỗi khi thêm Vai Trò:", error);
    }
  };

  // 🟢 Cập nhật Vai Trò
  const handleUpdateRole = async (id, updatedRole) => {
    try {
      const updated = await updateRole(id, updatedRole);
      if (updated) {
        setRoles(roles.map((role) => (role.id === id ? updated : role)));
        console.log("✅ [useRole] Vai trò đã được cập nhật:", updated);
      }
    } catch (error) {
      console.error("❌ [useRole] Lỗi khi cập nhật Vai Trò:", error);
    }
  };

  // 🔄 **Toggle trạng thái `isActive` của Vai Trò**
  const handleToggleRoleStatus = async (id, currentStatus) => {
    try {
      const updated = await toggleRoleStatus(id, !currentStatus);
      if (updated) {
        setRoles(roles.map((role) => (role.id === id ? { ...role, active: !currentStatus } : role)));
        console.log("✅ [useRole] Trạng thái Vai Trò đã được cập nhật:", updated);
      }
    } catch (error) {
      console.error("❌ [useRole] Lỗi khi cập nhật trạng thái Vai Trò:", error);
    }
  };

  // 🔴 Xóa Vai Trò
  const handleDeleteRole = async (id) => {
    try {
      const success = await deleteRole(id);
      if (success) {
        setRoles(roles.filter((role) => role.id !== id));
        console.log(`✅ [useRole] Vai trò ID ${id} đã bị xóa.`);
      }
    } catch (error) {
      console.error("❌ [useRole] Lỗi khi xóa Vai Trò:", error);
    }
  };

  return {
    roles,
    allPermissions,
    rolePermissions,
    selectedRole,
    loading,
    error,
    handleSelectRole,
    handleAddRole,
    handleUpdateRole,
    handleToggleRoleStatus,
    handleDeleteRole,
  };
};

export default useRole;
