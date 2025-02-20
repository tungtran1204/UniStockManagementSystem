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
import { updateUser, checkEmailExists } from "./userService"; // ✅ Thêm checkEmailExists
import { FaEye, FaEyeSlash } from "react-icons/fa"; // ✅ Import icon con mắt

const ModalEditUser = ({ open, onClose, user, fetchUsers }) => {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState(""); // ✅ Lưu lỗi email
  const [password, setPassword] = useState(""); // ✅ Thêm mật khẩu
  const [showPassword, setShowPassword] = useState(false); // ✅ Hiển thị mật khẩu
  const [isActive, setIsActive] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [fullname, setFullname] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [isAdmin, setIsAdmin] = useState(false); // ✅ Kiểm tra user có phải ADMIN không

  // 🟢 **Cập nhật dữ liệu khi `user` thay đổi**
  useEffect(() => {
    if (user) {
      setEmail(user.email || "");
      setIsActive(user.isActive || false);
      setIsAdmin(user.roleNames?.includes("ADMIN"));
      setFullname(user.userDetail?.fullname || "");
      setPhoneNumber(user.userDetail?.phoneNumber || "");
      setAddress(user.userDetail?.address || "");
      setDateOfBirth(user.userDetail?.dateOfBirth || "");
    }
  }, [user]);

  // 🟢 **Kiểm tra email có tồn tại không**
  const handleCheckEmail = async (newEmail) => {
    setEmail(newEmail);
    setEmailError(""); // ✅ Reset lỗi

    if (newEmail !== user.email) {
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

  // 🟢 **Cập nhật user**
  const handleUpdateUser = async () => {
    if (!email.trim()) {
      setEmailError("Vui lòng nhập email!");
      return;
    }
    if (emailError) return; // ✅ Nếu email lỗi, không cho submit

    const updatedUser = {
      userId: user.userId,
      email,
      isActive: isAdmin ? user.isActive : isActive,
      password: password.trim() !== "" ? password : undefined, // ✅ Nếu để trống, giữ nguyên mật khẩu cũ
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

        {/* 🔥 Mật khẩu + Nút hiển thị mật khẩu */}
        <div className="relative">
          <Input
            label="Mật khẩu (Để trống nếu không muốn thay đổi)"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="button"
            className="absolute inset-y-0 right-3 flex items-center text-gray-600"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
          </button>
        </div>

        <Input label="Họ và tên" value={fullname} onChange={(e) => setFullname(e.target.value)} />
        <Input label="Số điện thoại" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
        <Input label="Địa chỉ" value={address} onChange={(e) => setAddress(e.target.value)} />
        <Input label="Ngày sinh" type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} />

        {/* 🔥 Ẩn phần chỉnh trạng thái nếu là ADMIN */}
        {!isAdmin && (
          <div className="flex items-center gap-2">
            <Switch color="green" checked={isActive} onChange={() => setIsActive(!isActive)} />
            <span>{isActive ? "Hoạt động" : "Vô hiệu hóa"}</span>
          </div>
        )}
      </DialogBody>

      <DialogFooter>
        <Button variant="text" color="gray" onClick={onClose}>
          Hủy
        </Button>
        <Button color="blue" onClick={handleUpdateUser}>
          Lưu
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default ModalEditUser;
