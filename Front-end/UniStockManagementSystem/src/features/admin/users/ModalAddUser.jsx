import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Input,
  Button,
  Switch,
} from "@material-tailwind/react";
import { getAllRoles } from "../roles/roleService";
import { checkEmailExists, createUser } from "../users/userService"; // ✅ Import API kiểm tra email

const ModalAddUser = ({ open, onClose, fetchUsers }) => {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState(""); // ✅ Lưu lỗi email
  const [password, setPassword] = useState("");
  const [fullname, setFullname] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [roles, setRoles] = useState([]);
  const [selectedRoles, setSelectedRoles] = useState(new Set());
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // ✅ Thêm state loading

  // 🟢 Fetch danh sách role từ API
  useEffect(() => {
    if (open) {
      getAllRoles()
        .then((data) => {
          setRoles(data);
        })
        .catch((error) => {
          console.error("❌ Lỗi khi lấy danh sách Role:", error);
        });
    }
  }, [open]);

  // 🟢 **Kiểm tra email có tồn tại không**
  const handleCheckEmail = async (newEmail) => {
    setEmail(newEmail);
    setEmailError(""); // ✅ Reset lỗi

    if (newEmail.trim()) {
      try {
        const emailExists = await checkEmailExists(newEmail);
        if (emailExists) {
          setEmailError("Email này đã được sử dụng!"); // ✅ Hiển thị lỗi
        }
      } catch (error) {
        console.error("❌ Lỗi kiểm tra email:", error);
      }
    }
  };

  // 🟢 Xử lý chọn/bỏ chọn role
  const handleRoleChange = (roleId) => {
    setSelectedRoles((prevRoles) => {
      const updatedRoles = new Set(prevRoles);
      if (updatedRoles.has(roleId)) {
        updatedRoles.delete(roleId);
      } else {
        updatedRoles.add(roleId);
      }
      return updatedRoles;
    });
  };

  const handleAddUser = async () => {
    setError("");
    if (!email.trim()) {
      setEmailError("Vui lòng nhập email!");
      return;
    }
    if (emailError) return; // ✅ Nếu email lỗi, không cho submit

    if (!password.trim()) {
      setError("Vui lòng nhập mật khẩu!");
      return;
    }
    if (selectedRoles.size === 0) {
      setError("Vui lòng chọn ít nhất một vai trò!");
      return;
    }

    const userData = {
      username: email.split("@")[0],
      email,
      password,
      isActive,
      roleIds: Array.from(selectedRoles),
      userDetail: {
        fullname,
        phoneNumber,
        address: "Địa chỉ chưa cập nhật",
        dateOfBirth: "",
        profilePicture: "",
      },
    };

    console.log("🚀 Đang gửi request API:", userData);

    try {
      setLoading(true);
      const response = await createUser(userData);
      fetchUsers();
      console.log("✅ User đã tạo:", response);
      onClose();
    } catch (error) {
      console.error("❌ Lỗi khi tạo user:", error);
      setError("Lỗi khi tạo user, vui lòng kiểm tra lại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} handler={onClose} size="md" className="rounded-lg shadow-lg">
      <DialogHeader className="text-lg font-bold text-gray-800">Thêm Người Dùng</DialogHeader>
      <DialogBody className="space-y-4">
        <Input label="Họ và Tên" type="text" value={fullname} onChange={(e) => setFullname(e.target.value)} required />

        {/* 🔥 Kiểm tra Email */}
        <div>
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => handleCheckEmail(e.target.value)}
            required
          />
          {emailError && <p className="text-red-500 text-xs mt-1">{emailError}</p>}
        </div>

        {/* Mật khẩu */}
        <div>
          <Input label="Mật khẩu" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          {error.includes("mật khẩu") && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>

        {/* Số điện thoại */}
        <Input label="Số điện thoại" type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} required />

        {/* Vai trò (Role) */}
        <div className="flex flex-col">
          <p className="text-sm font-semibold text-gray-700">Chọn Vai Trò:</p>
          <div className="flex flex-wrap gap-2">
            {roles.length > 0 ? (
              roles.map((r) => (
                <button
                  key={r.id}
                  onClick={() => handleRoleChange(r.id)}
                  className={`px-4 py-2 text-sm rounded-lg transition-all ${
                    selectedRoles.has(r.id)
                      ? "bg-blue-500 text-white shadow-md"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  {r.name}
                </button>
              ))
            ) : (
              <p className="text-sm text-gray-500">Không có vai trò nào.</p>
            )}
          </div>
          {error.includes("vai trò") && <p className="text-red-500 text-xs mt-2">{error}</p>}
        </div>

        {/* Trạng thái */}
        <div className="flex items-center gap-2">
          <Switch color="green" checked={isActive} onChange={() => setIsActive(!isActive)} />
          <span>{isActive ? "Hoạt động" : "Vô hiệu hóa"}</span>
        </div>
      </DialogBody>

      <DialogFooter className="flex justify-between">
        <Button variant="text" color="gray" onClick={onClose}>
          Hủy
        </Button>
        <Button color="blue" onClick={handleAddUser} disabled={loading}>
          {loading ? "Đang tạo..." : "Thêm"}
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default ModalAddUser;
