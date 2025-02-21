import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Input,
  Button,
  Switch,
  Alert,
} from "@material-tailwind/react";
import { getAllRoles } from "../roles/roleService";
import { checkEmailExists, createUser } from "../users/userService"; 
import { InformationCircleIcon, CheckCircleIcon } from "@heroicons/react/24/outline"; // ✅ Import icon

const ModalAddUser = ({ open, onClose, fetchUsers }) => {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [fullname, setFullname] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [roles, setRoles] = useState([]);
  const [selectedRoles, setSelectedRoles] = useState(new Set());
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ open: false, type: "", message: "" }); // ✅ Toast State

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

  const showToast = (type, message) => {
    setToast({ open: true, type, message });
    setTimeout(() => setToast({ open: false }), 3000);
  };

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleCheckEmail = async (newEmail) => {
    setEmail(newEmail);
    setEmailError("");

    if (!newEmail.trim()) {
      setEmailError("Vui lòng nhập email!");
      return;
    }

    if (!isValidEmail(newEmail)) {
      setEmailError("Email không hợp lệ!");
      return;
    }

    try {
      const emailExists = await checkEmailExists(newEmail);
      if (emailExists) {
        setEmailError("Email này đã được sử dụng!");
      }
    } catch (error) {
      console.error("❌ Lỗi kiểm tra email:", error);
    }
  };

  const handlePasswordChange = (newPassword) => {
    setPassword(newPassword);
    setPasswordError("");

    if (newPassword.length < 8 || !/[A-Za-z]/.test(newPassword) || !/\d/.test(newPassword)) {
      setPasswordError("Mật khẩu phải có ít nhất 8 ký tự, gồm cả số và chữ!");
    }
  };

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
    setEmailError("");
    setPasswordError("");

    if (!email.trim() || emailError) {
      setEmailError("Vui lòng nhập email hợp lệ!");
      return;
    }

    if (!password.trim() || passwordError) {
      setPasswordError("Mật khẩu không hợp lệ!");
      return;
    }

    if (selectedRoles.size === 0) {
      showToast("red", "⚠️ Vui lòng chọn ít nhất một vai trò!");
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
      await createUser(userData);
      fetchUsers();
      showToast("green", "✅ Thêm người dùng thành công!");
      setTimeout(onClose, 2000); // ✅ Đóng modal sau 2 giây
    } catch (error) {
      console.error("❌ Lỗi khi tạo user:", error);
      showToast("red", "❌ Lỗi khi tạo user! Vui lòng kiểm tra lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} handler={onClose} size="md" className="rounded-lg shadow-lg">
      <DialogHeader className="text-lg font-bold text-gray-800">Thêm Người Dùng</DialogHeader>

      {/* ✅ Hiển thị thông báo Toast */}
      {toast.open && (
        <div className="p-4">
          <Alert color={toast.type} icon={toast.type === "green" ? <CheckCircleIcon className="h-6 w-6" /> : <InformationCircleIcon className="h-6 w-6" />}>
            {toast.message}
          </Alert>
        </div>
      )}

      <DialogBody className="space-y-4">
        <Input label="Họ và Tên" type="text" value={fullname} onChange={(e) => setFullname(e.target.value)} required />

        <div>
          <Input label="Email" type="email" value={email} onChange={(e) => handleCheckEmail(e.target.value)} required />
          {emailError && <p className="text-red-500 text-xs mt-1">{emailError}</p>}
        </div>

        <div>
          <Input label="Mật khẩu" type="password" value={password} onChange={(e) => handlePasswordChange(e.target.value)} required />
          {passwordError && <p className="text-red-500 text-xs mt-1">{passwordError}</p>}
        </div>

        <Input label="Số điện thoại" type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} required />

        <div className="flex flex-col">
          <p className="text-sm font-semibold text-gray-700">Chọn Vai Trò:</p>
          <div className="flex flex-wrap gap-2">
            {roles.length > 0 ? (
              roles.map((r) => (
                <button
                  key={r.id}
                  onClick={() => handleRoleChange(r.id)}
                  className={`px-4 py-2 text-sm rounded-lg transition-all ${
                    selectedRoles.has(r.id) ? "bg-blue-500 text-white shadow-md" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  {r.name}
                </button>
              ))
            ) : (
              <p className="text-sm text-gray-500">Không có vai trò nào.</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Switch color="green" checked={isActive} onChange={() => setIsActive(!isActive)} />
          <span>{isActive ? "Hoạt động" : "Vô hiệu hóa"}</span>
        </div>
      </DialogBody>

      <DialogFooter>
        <Button variant="text" color="gray" onClick={onClose}>Hủy</Button>
        <Button color="blue" onClick={handleAddUser} disabled={loading}>
          {loading ? "Đang tạo..." : "Thêm"}
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default ModalAddUser;
