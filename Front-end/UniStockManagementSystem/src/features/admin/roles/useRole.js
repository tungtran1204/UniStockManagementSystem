import { useState, useEffect } from "react";
import {
  getAllRoles,
  addRole,
  updateRole,
  toggleRoleStatus,
  deleteRole,
} from "./roleService";

const useRole = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 🟢 Tải danh sách Vai Trò từ backend
  useEffect(() => {
    setLoading(true);
    getAllRoles()
      .then((data) => setRoles(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // 🟢 Thêm Vai Trò mới
  const handleAddRole = async (role) => {
    const newRole = await addRole(role);
    if (newRole) setRoles([...roles, newRole]);
  };

  // 🟢 Cập nhật Vai Trò
  const handleUpdateRole = async (id, updatedRole) => {
    const updated = await updateRole(id, updatedRole);
    if (updated) {
      setRoles(roles.map((role) => (role.id === id ? updated : role)));
    }
  };

  // 🔄 **Toggle trạng thái `isActive` của Vai Trò**
  const handleToggleRoleStatus = async (id, currentStatus) => {
    const updated = await toggleRoleStatus(id, !currentStatus);
    if (updated) {
      setRoles(roles.map((role) => (role.id === id ? { ...role, active: !currentStatus } : role)));
    }
  };

  // 🔴 Xóa Vai Trò
  const handleDeleteRole = async (id) => {
    const success = await deleteRole(id);
    if (success) setRoles(roles.filter((role) => role.id !== id));
  };

  return {
    roles,
    loading,
    error,
    handleAddRole,
    handleUpdateRole,
    handleToggleRoleStatus,
    handleDeleteRole,
  };
};

export default useRole;
