import { useState, useCallback } from "react";
import { getAllPermissions, getRolePermissions } from "./roleService";

const usePermissions = () => {
  const [allPermissions, setAllPermissions] = useState([]);
  const [rolePermissions, setRolePermissions] = useState([]);

  const fetchAllPermissions = useCallback(async () => {
    try {
      const permissions = await getAllPermissions();
      setAllPermissions(permissions);
    } catch (error) {
      console.error("❌ Lỗi lấy danh sách permissions:", error);
    }
  }, []);

  const fetchRolePermissions = useCallback(async (roleId) => {
    try {
      const permissions = await getRolePermissions(roleId);
      setRolePermissions(permissions);
      return permissions;
    } catch (error) {
      console.error(`❌ Lỗi lấy danh sách permissions của role ID ${roleId}:`, error);
      throw error;
    }
  }, []);

  return {
    allPermissions,
    rolePermissions,
    fetchAllPermissions,
    fetchRolePermissions,
  };
};

export default usePermissions;
