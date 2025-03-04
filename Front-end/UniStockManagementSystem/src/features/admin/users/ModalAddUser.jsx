import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Input,
  Button,
  Switch,
  Typography,
} from "@material-tailwind/react";
import { getAllRoles } from "../roles/roleService";
import { checkEmailExists, createUser } from "../users/userService";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const ModalAddUser = ({ open, onClose, fetchUsers }) => {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fullname, setFullname] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [roles, setRoles] = useState([]);
  const [selectedRoles, setSelectedRoles] = useState(new Set());
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

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

  const isValidPassword = (password) => {
    return password.length >= 8 && /[A-Za-z]/.test(password) && /\d/.test(password);
  };

  const handlePasswordChange = (newPassword) => {
    setPassword(newPassword);
    setPasswordError("");

    if (!isValidPassword(newPassword)) {
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
    setError("");

    if (!email.trim() || emailError) {
      setEmailError("Vui lòng nhập email hợp lệ!");
      return;
    }

    if (!password.trim() || passwordError) {
      setPasswordError("Mật khẩu không hợp lệ!");
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
        <div>
          <Typography variant="small" className="mb-2">Họ và Tên *</Typography>
          <Input
            type="text"
            value={fullname}
            onChange={(e) => setFullname(e.target.value)}
            required
            className="w-full"
          />
        </div>

        <div>
          <Typography variant="small" className="mb-2">Email *</Typography>
          <Input
            type="email"
            value={email}
            onChange={(e) => handleCheckEmail(e.target.value)}
            required
            className={`w-full ${emailError ? 'border-red-500' : ''}`}
          />
          {emailError && <Typography className="text-xs text-red-500 mt-1">{emailError}</Typography>}
        </div>

        <div className="relative">
          <Typography variant="small" className="mb-2">Mật khẩu *</Typography>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => handlePasswordChange(e.target.value)}
              required
              className={`w-full ${passwordError ? 'border-red-500' : ''}`}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-3 flex items-center text-gray-600"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
            </button>
          </div>
          {passwordError && <Typography className="text-xs text-red-500 mt-1">{passwordError}</Typography>}
        </div>

        <div>
          <Typography variant="small" className="mb-2">Số điện thoại *</Typography>
          <Input
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            required
            className="w-full"
          />
        </div>

        <div className="flex flex-col">
          <Typography variant="small" className="mb-2">Chọn Vai Trò:</Typography>
          <div className="flex flex-wrap gap-2">
            {roles
              .filter((r) => r.name !== "USER" && r.name !== "ADMIN").length > 0 ? (
              roles
                .filter((r) => r.name !== "USER" && r.name !== "ADMIN")
                .map((r) => (
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
              <p className="text-sm text-gray-500">Không có sẵn vai trò.</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Typography variant="small" className="mb-0 mr-2">Trạng thái:</Typography>
          <Switch color="green" checked={isActive} onChange={() => setIsActive(!isActive)} />
          <span>{isActive ? "Hoạt động" : "Vô hiệu hóa"}</span>
        </div>
        
        {error && <Typography className="text-sm text-red-500">{error}</Typography>}
      </DialogBody>

      <DialogFooter className="flex justify-end">
        <div className="flex gap-2">
          <Button variant="text" color="red" onClick={onClose}>
            Hủy
          </Button>
          <Button color="green" onClick={handleAddUser} disabled={loading}>
            {loading ? "Đang tạo..." : "Lưu"}
          </Button>
        </div>
      </DialogFooter>
    </Dialog>
  );
};

export default ModalAddUser;