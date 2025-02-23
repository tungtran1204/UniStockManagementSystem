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
import { updateUser, checkEmailExists } from "./userService"; 
import { getAllRoles } from "../roles/roleService"; 
import { FaEye, FaEyeSlash } from "react-icons/fa"; 

const ModalEditUser = ({ open, onClose, user, fetchUsers }) => {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [fullname, setFullname] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [roles, setRoles] = useState([]); 
  const [selectedRoles, setSelectedRoles] = useState(new Set()); 
  const [error, setError] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (user) {
      setEmail(user.email || "");
      setIsActive(user.isActive || false);
      setIsAdmin(user.roleNames?.includes("ADMIN"));
      setFullname(user.userDetail?.fullname || "");
      setPhoneNumber(user.userDetail?.phoneNumber || "");
      setAddress(user.userDetail?.address || "");
      setDateOfBirth(user.userDetail?.dateOfBirth || "");
      setSelectedRoles(new Set(user.roleIds || [])); 
    }
  }, [user]);

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

  // Kiểm tra định dạng email hợp lệ
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Kiểm tra email đã tồn tại
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

    if (newEmail !== user.email) {
      try {
        const emailExists = await checkEmailExists(newEmail);
        if (emailExists) {
          setEmailError("Email này đã được sử dụng!");
        }
      } catch (error) {
        console.error("❌ Lỗi kiểm tra email:", error);
      }
    }
  };

  // Kiểm tra mật khẩu có đủ mạnh không
  const isValidPassword = (password) => {
    return password.length >= 8 && /[A-Za-z]/.test(password) && /\d/.test(password);
  };

  const handlePasswordChange = (newPassword) => {
    setPassword(newPassword);
    setPasswordError("");

    if (newPassword.trim() && !isValidPassword(newPassword)) {
      setPasswordError("Mật khẩu phải có ít nhất 8 ký tự, gồm cả số và chữ!");
    }
  };

  // Xử lý chọn/bỏ chọn role
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

  // Cập nhật user
  const handleUpdateUser = async () => {
    setError("");

    if (!email.trim() || emailError) {
      setEmailError("Vui lòng nhập email hợp lệ!");
      return;
    }

    if (password.trim() && passwordError) {
      setPasswordError("Mật khẩu không hợp lệ!");
      return;
    }

    if (selectedRoles.size === 0) {
      setError("Vui lòng chọn ít nhất một vai trò!");
      return;
    }

    const updatedUser = {
      userId: user.userId,
      email,
      isActive: isAdmin ? user.isActive : isActive,
      password: password.trim() !== "" ? password : undefined,
      roleIds: Array.from(selectedRoles), 
      userDetail: {
        fullname,
        phoneNumber,
        address,
        dateOfBirth,
      },
    };

    try {
      await updateUser(user.userId, updatedUser);
      fetchUsers();
      onClose();
    } catch (error) {
      console.error("❌ Lỗi khi cập nhật người dùng:", error);
    }
  };

  return (
    <Dialog open={open} handler={onClose} size="lg">
      <DialogHeader>Chỉnh Sửa Người Dùng</DialogHeader>
      <DialogBody divider className="space-y-4">
        <Input label="Họ và tên" value={fullname} onChange={(e) => setFullname(e.target.value)} />
        <Input label="Số điện thoại" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
        <Input label="Địa chỉ" value={address} onChange={(e) => setAddress(e.target.value)} />
        <Input label="Ngày sinh" type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} />

        {/* Email */}
        <div>
          <Input label="Email" type="email" value={email} onChange={(e) => handleCheckEmail(e.target.value)} required />
          {emailError && <p className="text-red-500 text-xs mt-1">{emailError}</p>}
        </div>

        {/* Mật khẩu */}
        <div className="relative">
          <Input label="Mật khẩu (Để trống nếu không muốn thay đổi)" type={showPassword ? "text" : "password"} value={password} onChange={(e) => handlePasswordChange(e.target.value)} />
          <button type="button" className="absolute inset-y-0 right-3 flex items-center text-gray-600" onClick={() => setShowPassword(!showPassword)}>
            {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
          </button>
          {passwordError && <p className="text-red-500 text-xs mt-1">{passwordError}</p>}
        </div>

        {/* Vai trò */}
        <div>
          <p className="text-sm font-semibold text-gray-700">Chọn Vai Trò:</p>
          <div className="flex flex-wrap gap-2">
            {roles
              .filter((r) => r.name !== "USER" && (isAdmin || r.name !== "ADMIN")) // Exclude "USER" role and "ADMIN" role if not admin
              .map((r) => (
                <button
                  key={r.id}
                  onClick={() => handleRoleChange(r.id)}
                  className={`px-4 py-2 text-sm rounded-lg transition-all ${selectedRoles.has(r.id) ? "bg-blue-500 text-white shadow-md" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
                  disabled={isAdmin} // Disable role selection if current role is "ADMIN"
                >
                  {r.name}
                </button>
              ))}
            {roles.filter((r) => r.name !== "USER" && (isAdmin || r.name !== "ADMIN")).length === 0 && (
              <p className="text-sm text-gray-500">Không có sẵn vai trò.</p>
            )}
          </div>
        </div>
      </DialogBody>
      <DialogFooter>
        <Button variant="text" color="gray" onClick={onClose}>Hủy</Button>
        <Button color="blue" onClick={handleUpdateUser}>Lưu</Button>
      </DialogFooter>
    </Dialog>
  );
};

export default ModalEditUser;
