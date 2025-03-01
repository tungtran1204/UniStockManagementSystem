import React, { useCallback, useState } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Checkbox,
  Input,
  Switch,
  Button,
} from "@material-tailwind/react";
import { FaPlus, FaEdit } from "react-icons/fa";
import useRole from "./useRole"; // Hook của bạn

// 1) Danh mục quyền
const PERMISSION_CATEGORIES = {
  "Quản lý sản phẩm": ["viewProduct", "createProduct", "updateProduct"],
  "Quản lý đối tác": ["viewPartner", "createPartner", "updatePartner"],
  "Quản lý kho": ["viewWarehouse", "createWarehouse", "updateWarehouse"],
  "Quản lý báo cáo": ["viewReport", "createReport", "updateReport"],
};

// 2) Tên hiển thị
const PERMISSION_LABELS = {
  viewProduct: "Xem",
  createProduct: "Thêm",
  updateProduct: "Sửa",

  viewPartner: "Xem",
  createPartner: "Thêm",
  updatePartner: "Sửa",

  viewWarehouse: "Xem",
  createWarehouse: "Thêm",
  updateWarehouse: "Sửa",

  viewReport: "Xem",
  createReport: "Thêm",
  updateReport: "Sửa",
};

// Hàm tạo className cho <td>
function getTdClassName(isLast) {
  return `py-3 px-5 ${isLast ? "" : "border-b border-blue-gray-50"}`;
}

export default function RolePage() {
  const {
    roles,
    loading,
    error,
    handleAddRole,
    handleUpdateRole,
    handleToggleRoleStatus, // Nếu bạn cần Switch toggle trạng thái
  } = useRole();

  // State thêm role
  const [addingNewRole, setAddingNewRole] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");
  const [newRolePermissions, setNewRolePermissions] = useState([]);

  // State edit tên role
  const [editingRole, setEditingRole] = useState(null);
  const [editingRoleName, setEditingRoleName] = useState("");

  // Thêm role
  const onAddRole = async () => {
    const newRole = {
      name: newRoleName,
      permissionKeys: newRolePermissions,
      active: true, // nếu có trạng thái
    };
    try {
      await handleAddRole(newRole);
      setAddingNewRole(false);
      setNewRoleName("");
      setNewRolePermissions([]);
    } catch (err) {
      console.error("Lỗi khi thêm vai trò:", err);
    }
  };

  // Toggle 1 permission
  const handleTogglePermission = useCallback(
    (role, permissionKey) => {
      const { permissionKeys = [] } = role;
      const hasPerm = permissionKeys.includes(permissionKey);
      const updatedKeys = hasPerm
        ? permissionKeys.filter((k) => k !== permissionKey)
        : [...permissionKeys, permissionKey];

      handleUpdateRole(role.id, {
        ...role,
        permissionKeys: updatedKeys,
      });
    },
    [handleUpdateRole]
  );

  // Blur => update tên role
  const handleBlurEditRole = (role) => {
    handleUpdateRole(role.id, {
      ...role,
      name: editingRoleName,
    });
    setEditingRole(null);
  };

  if (loading) return <div>Loading ...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  // Lọc bỏ ADMIN & USER
  const filteredRoles = roles.filter(
    (r) => r.name !== "ADMIN" && r.name !== "USER"
  );

  return (
    <div className="mt-12 mb-8 flex flex-col gap-12">
      <Card>
        <CardHeader
          variant="gradient"
          color="gray"
          className="mb-8 p-6 flex justify-between items-center"
        >
          <Typography variant="h6" color="white">
            Danh sách Vai Trò
          </Typography>
          <Button
            size="sm"
            color="white"
            variant="text"
            className="flex items-center gap-2"
            onClick={() => setAddingNewRole(true)}
          >
            <FaPlus className="h-4 w-4" /> Thêm Vai Trò
          </Button>
        </CardHeader>

        <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
          <table className="w-full min-w-[640px] table-auto">
          <thead>
  {/* Dòng 1: chỉ hiển thị danh mục */}
  <tr>
    {/* Ô đầu tiên để trống */}
    <th className="border-b border-blue-gray-50 py-3 px-5 text-left" />
    {Object.keys(PERMISSION_CATEGORIES).map((cat) => {
      const colSpan = PERMISSION_CATEGORIES[cat].length;
      return (
        <th
          key={cat}
          colSpan={colSpan}
          className="border-b border-blue-gray-50 py-3 px-5 text-center"
        >
          <Typography
            variant="small"
            className="text-[11px] font-bold uppercase text-blue-gray-400"
          >
            {cat}
          </Typography>
        </th>
      );
    })}
  </tr>

  {/* Dòng 2: cột đầu là “Roles”, các cột tiếp theo là tên quyền */}
  <tr>
    <th className="border-b border-blue-gray-50 py-3 px-5 text-center">
      <Typography
        variant="small"
        className="text-[11px] font-bold uppercase text-blue-gray-400"
      >
        Roles
      </Typography>
    </th>
    {Object.values(PERMISSION_CATEGORIES)
      .flat()
      .map((perm) => (
        <th
          key={perm}
          className="border-b border-blue-gray-50 py-3 px-2 text-center w-5" // Adjusted px-5 to px-2
        >
          <Typography
            variant="small"
            className="text-[11px] font-bold uppercase text-blue-gray-400"
          >
            {PERMISSION_LABELS[perm] || perm}
          </Typography>
        </th>
      ))}
  </tr>
</thead>

            <tbody>
              {filteredRoles.length > 0 ? (
                filteredRoles.map((role, idx) => {
                  const isLast = idx === filteredRoles.length - 1;
                  return (
                    <tr key={role.id}>
                      {/* Cột Roles */}
                      <td className={getTdClassName(isLast)}>
  <div className="flex items-center justify-between">
    {/* Khối (Tên Role + Switch) bên trái */}
    <div className="flex flex-col gap-2 min-w-[200px]">
      {/* Dòng trên: Tên Role (hoặc Input nếu đang edit) */}
      {editingRole === role.id ? (
        <Input
          value={editingRoleName}
          onChange={(e) => setEditingRoleName(e.target.value)}
          onBlur={() => handleBlurEditRole(role)}
          className="  "
        />
      ) : (
        <Typography
          variant="small"
          color="blue-gray"
          className="font-semibold"
        >
          {role.name}
        </Typography>
      )}

      {/* Dòng dưới: Switch + Trạng thái */}
      {role.active !== undefined && (
        <div className="flex items-center gap-2">
          <Switch
            color="green"
            checked={!!role.active}
            onChange={() =>
              handleToggleRoleStatus &&
              handleToggleRoleStatus(role.id, role.active)
            }
          />
          <Typography className="text-xs font-semibold text-blue-gray-600">
            {role.active ? "Hoạt động" : "Vô hiệu hóa"}
          </Typography>
        </div>
      )}
    </div>

    {/* Icon Edit bên phải */}
    <Button
      size="sm"
      className="p-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white"
      onClick={() => {
        setEditingRole(role.id);
        setEditingRoleName(role.name);
      }}
    >
      <FaEdit />
    </Button>
  </div>
</td>


                      {/* Cột checkbox quyền */}
                      {Object.values(PERMISSION_CATEGORIES)
                        .flat()
                        .map((perm) => {
                          const checked = role.permissionKeys?.includes(perm);
                          return (
                            <td key={perm} className={getTdClassName(isLast)}>
                              <div className="flex items-center justify-center">
                                <Checkbox
                                  checked={checked}
                                  onChange={() =>
                                    handleTogglePermission(role, perm)
                                  }
                                  className="w-4 h-4" // Adjusted width and height
                                />
                              </div>
                            </td>
                          );
                        })}
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={
                      1 + Object.values(PERMISSION_CATEGORIES).flat().length
                    }
                    className="border-b border-gray-200 px-3 py-4 text-center text-gray-500"
                  >
                    Không có dữ liệu
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardBody>
      </Card>

      {/* Form thêm role */}
      {addingNewRole && (
        <Card className="p-4">
          <Typography variant="h6">Thêm vai trò mới</Typography>
          <div className="flex items-center gap-4 mt-2">
            <Input
              label="Tên vai trò"
              value={newRoleName}
              onChange={(e) => setNewRoleName(e.target.value)}
            />
            <Button onClick={onAddRole}>Lưu</Button>
            <Button color="red" onClick={() => setAddingNewRole(false)}>
              Huỷ
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
            {Object.entries(PERMISSION_CATEGORIES).map(([catName, perms]) => (
              <div key={catName}>
                <Typography variant="small" className="font-bold">
                  {catName}
                </Typography>
                {perms.map((perm) => (
                  <label key={perm} className="flex items-center gap-2">
                    <Checkbox
                      checked={newRolePermissions.includes(perm)}
                      onChange={() => {
                        setNewRolePermissions((prev) => {
                          const has = prev.includes(perm);
                          return has
                            ? prev.filter((p) => p !== perm)
                            : [...prev, perm];
                        });
                      }}
                    />
                    <span>{PERMISSION_LABELS[perm]}</span>
                  </label>
                ))}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
