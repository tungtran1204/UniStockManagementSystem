import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Tooltip,
  Button,
  Switch,
} from "@material-tailwind/react";
import { FaPlus, FaEdit } from "react-icons/fa";
import ModalAddRole from "./ModalAddRole";
import ModalEditRole from "./ModalEditRole";
import useRole from "./useRole";
import { useAuth } from "@/context/AuthContext";
import usePermissions from "./usePermissions";

const RolePage = () => {
  const { user } = useAuth();
  const { roles, loading, handleAddRole, handleUpdateRole, handleToggleRoleStatus } = useRole();
  const { allPermissions, fetchAllPermissions, fetchRolePermissions } = usePermissions();
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [rolePermissions, setRolePermissions] = useState([]); // 🔹 Permissions của role đang chọn

  // 🔹 Lấy danh sách tất cả permissions khi trang được tải
  useEffect(() => {
    fetchAllPermissions();
  }, [fetchAllPermissions]);

  // 🔹 Khi chọn role để chỉnh sửa, lấy permissions của role đó
  const handleEditRole = async (role) => {
    setSelectedRole(role);
    setOpenEditModal(true);

    // Check if the user has the necessary permissions
    if (!user?.permissions?.includes("getRolePermissions")) {
      console.error("❌ [RolePage] User does not have permission to view role permissions");
      return;
    }

    try {
      const permissions = await fetchRolePermissions(role.id);
      setRolePermissions(permissions);
    } catch (error) {
      console.error("❌ [RolePage] Lỗi lấy danh sách permissions của role:", error);
    }
  };

  // ✅ Kiểm tra quyền của user
  const canCreateRole = user?.permissions?.includes("createRole");
  const canUpdateRole = user?.permissions?.includes("updateRole");
  const canUpdateRoleStatus = user?.permissions?.includes("updateRoleStatus");

  return (
    <div className="mt-12 mb-8 flex flex-col gap-12">
      <Card>
        <CardHeader variant="gradient" color="gray" className="mb-8 p-6 flex justify-between items-center">
          <Typography variant="h6" color="white">Danh sách Vai Trò</Typography>
          {canCreateRole && (
            <Button
              size="sm"
              color="white"
              variant="text"
              className="flex items-center gap-2"
              onClick={() => setOpenAddModal(true)}
            >
              <FaPlus className="h-4 w-4" /> Thêm Vai Trò
            </Button>
          )}
        </CardHeader>

        <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
          {loading ? (
            <Typography className="text-center">Đang tải...</Typography>
          ) : (
            <table className="w-full min-w-[640px] table-auto">
              <thead>
                <tr>
                  {["Tên Vai Trò", "Mô Tả", "Trạng Thái", "Hành Động"].map((el) => (
                    <th key={el} className="border-b border-blue-gray-50 py-3 px-5 text-left">
                      <Typography variant="small" className="text-[11px] font-bold uppercase text-blue-gray-400">
                        {el}
                      </Typography>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {roles.length > 0 ? (
                  roles.map((role) => {
                    const isAdminRole = role.name === "ADMIN";

                    return (
                      <tr key={role.id}>
                        <td className="py-3 px-5">{role.name}</td>
                        <td className="py-3 px-5">{role.description}</td>
                        <td className="py-3 px-5">
                          <div className="flex items-center gap-2">
                            <Switch
                              color="green"
                              checked={role.active}
                              disabled={!canUpdateRoleStatus || isAdminRole}
                              onChange={() => handleToggleRoleStatus(role.id, role.active)}
                            />
                            <Typography className="text-xs font-semibold text-blue-gray-600">
                              {role.active ? "Hoạt động" : "Vô hiệu hóa"}
                            </Typography>
                          </div>
                        </td>
                        <td className="py-3 px-5 flex gap-2">
                          {canUpdateRole && (
                            <Tooltip content="Chỉnh sửa">
                              <button onClick={() => handleEditRole(role)} className="p-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white">
                                <FaEdit />
                              </button>
                            </Tooltip>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="4" className="border-b border-gray-200 px-3 py-4 text-center text-gray-500">Không có dữ liệu</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </CardBody>
      </Card>

      {canCreateRole && (
        <ModalAddRole open={openAddModal} onClose={() => setOpenAddModal(false)} onAddRole={handleAddRole} />
      )}

      {selectedRole && canUpdateRole && (
        <ModalEditRole
          open={openEditModal}
          onClose={() => setOpenEditModal(false)}
          role={selectedRole}
          allPermissions={allPermissions}
          rolePermissions={rolePermissions} // ✅ Truyền danh sách permission thực tế của role
          onUpdateRole={handleUpdateRole}
        />
      )}
    </div>
  );
};

export default RolePage;
