import React, { useState } from "react";
import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Typography,
  Button,
  IconButton,
} from "@material-tailwind/react";
import { TextField, MenuItem, Divider, Select, FormControl, Button as MuiButton } from "@mui/material";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { checkMaterialCodeExists } from "../materials/materialService";

const CreateMaterialModal = ({
  show,
  onClose,
  loading,
  newMaterial = {  // Thêm giá trị mặc định
    materialCode: '',
    materialName: '',
    description: '',
    unitId: '',
    typeId: '',
    isActive: 'true'
  },
  setNewMaterial,
  handleCreateMaterial,
  errors = {},  // Thêm giá trị mặc định cho errors
  units = [],
  materialCategories = [],
}) => {
  const [materialCodeError, setMaterialCodeError] = useState(""); // State để lưu lỗi mã nguyên vật liệu tồn tại
  const [validationErrors, setValidationErrors] = useState({}); // State để lưu lỗi validation (khoảng trắng/trống)

  if (!show) return null;
  // Hàm kiểm tra chuỗi có chứa toàn khoảng trắng hoặc trống không
  const isEmptyOrWhitespace = (str) => !str || /^\s*$/.test(str);

  // Hàm kiểm tra mã nguyên vật liệu (kiểm tra ngay khi nhập)
  const handleCheckMaterialCode = async (newCode) => {
    setNewMaterial(prev => ({
      ...prev,
      materialCode: newCode || ''
    })); setMaterialCodeError(""); // Reset lỗi mỗi khi nhập
    if (newCode.trim()) {
      try {
        const exists = await checkMaterialCodeExists(newCode); // Gọi API kiểm tra
        if (exists) {
          setMaterialCodeError("Mã nguyên vật liệu này đã tồn tại!");
        }
      } catch (error) {
        console.error("❌ Lỗi kiểm tra mã nguyên vật liệu:", error);
        setMaterialCodeError("Lỗi khi kiểm tra mã nguyên vật liệu!");
      }
    }

    // Xóa lỗi validation nếu dữ liệu hợp lệ
    if (!isEmptyOrWhitespace(newCode)) {
      setValidationErrors((prev) => ({ ...prev, materialCode: "" }));
    }
  };

  // Hàm xử lý khi thay đổi tên nguyên vật liệu
  const handleMaterialNameChange = (newName) => {
    setNewMaterial({ ...newMaterial, materialName: newName });

    // Xóa lỗi validation nếu dữ liệu hợp lệ
    if (!isEmptyOrWhitespace(newName)) {
      setValidationErrors((prev) => ({ ...prev, materialName: "" }));
    }
  };

  // Hàm xử lý khi nhấn nút "Tạo nguyên vật liệu"
  const handleCreateMaterialWrapper = () => {
    const newErrors = {};

    if (isEmptyOrWhitespace(newMaterial.materialCode)) {
      newErrors.materialCode = "Mã nguyên vật liệu không được để trống hoặc chỉ chứa khoảng trắng!";
    }
    if (isEmptyOrWhitespace(newMaterial.materialName)) {
      newErrors.materialName = "Tên nguyên vật liệu không được để trống hoặc chỉ chứa khoảng trắng!";
    }
    if (!newMaterial.unitId) {
      newErrors.unitId = "Vui lòng chọn đơn vị!";
    }
    if (!newMaterial.typeId) {
      newErrors.typeId = "Vui lòng chọn danh mục!";
    }

    setValidationErrors(newErrors);

    console.log("📌 Dữ liệu newMaterial trước khi tạo:", newMaterial);

    // Chỉ gọi hàm gốc nếu không có lỗi validation và không có productCodeError
    if (Object.keys(newErrors).length === 0 && !materialCodeError) {
      handleCreateMaterial();
    }
  };

  // Kiểm tra điều kiện để vô hiệu hóa nút "Tạo nguyên vật liệu"
  const isCreateDisabled = () => {
    return loading || !!materialCodeError;
  };

  return (
    <Dialog open={true} handler={onClose} size="md" className="px-4 py-2">
      {/* Header của Dialog */}
      <DialogHeader className="flex justify-between items-center pb-2">
        <Typography variant="h4" color="blue-gray">
          Thêm nguyên vật liệu
        </Typography>
        <IconButton
          size="sm"
          variant="text"
          onClick={onClose}
        >
          <XMarkIcon className="h-5 w-5 stroke-2" />
        </IconButton>
      </DialogHeader>
      <Divider variant="middle" />

      {/* Body của Dialog */}
      <DialogBody className="space-y-4 pb-6 pt-6">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <Typography variant="medium" className="text-black">
              Mã nguyên vật liệu
              <span className="text-red-500"> *</span>
            </Typography>
            <TextField
              fullWidth
              size="small"
              hiddenLabel
              placeholder="Mã nguyên vật liệu"
              color="success"
              value={newMaterial.materialCode}
              onChange={(e) => handleCheckMaterialCode(e.target.value)}
            />
            {materialCodeError && (<Typography className="text-xs text-red-500 mt-1">{materialCodeError}</Typography>)}
            {validationErrors.materialCode && (<Typography className="text-xs text-red-500 mt-1">{validationErrors.materialCode}</Typography>)}
            {errors.materialCode &&
              !materialCodeError &&
              !validationErrors.materialCode && (
                <Typography className="text-xs text-red-500 mt-1">{errors.materialCode}</Typography>)}
          </div>

          <div>
            <Typography variant="medium" className="text-black">
              Tên nguyên vật liệu
              <span className="text-red-500"> *</span>
            </Typography>
            <TextField
              fullWidth
              id="outlined-select"
              size="small"
              hiddenLabel
              placeholder="Tên nguyên vật liệu"
              color="success"
              value={newMaterial.materialName}
              onChange={(e) => handleMaterialNameChange(e.target.value)}
            />
            {validationErrors.materialName && (
              <Typography className="text-xs text-red-500 mt-1">
                {validationErrors.materialName}
              </Typography>
            )}
            {errors.materialName && !validationErrors.materialName && (
              <Typography className="text-xs text-red-500 mt-1">
                {errors.materialName}
              </Typography>
            )}
          </div>

          <div>
            <Typography variant="medium" className="text-black">
              Đơn vị
              <span className="text-red-500"> *</span>
            </Typography>
            <FormControl fullWidth size="small" hiddenLabel>
              <Select
                value={newMaterial.unitId}
                onChange={(e) => setNewMaterial({ ...newMaterial, unitId: e.target.value })}
                color="success"
                MenuProps={{
                  disablePortal: true,
                }}
                displayEmpty
                renderValue={newMaterial.unitId !== "" ? undefined : () => <Typography className="text-[16px] text-gray-500">Đơn vị</Typography>}
              >
                {units.length > 0 ? (
                  units.map((unit) => (
                    <MenuItem
                      key={unit.unitId}
                      value={String(unit.unitId)}
                      sx={{
                        "&.Mui-selected": {
                          backgroundColor: "rgba(8, 148, 86, 0.1) !important",
                        },
                      }}>
                      {unit.unitName}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem disabled>Không có đơn vị nào</MenuItem>
                )}
              </Select>
            </FormControl>
            {validationErrors.unitId && (
              <Typography className="text-xs text-red-500 mt-1">
                {validationErrors.unitId}
              </Typography>
            )}
            {errors.unitId && !validationErrors.unitId && (
              <Typography className="text-xs text-red-500 mt-1">
                {errors.unitId}
              </Typography>
            )}
          </div>

          <div>
            <Typography variant="medium" className="text-black">
              Danh mục
              <span className="text-red-500"> *</span>
            </Typography>
            <FormControl fullWidth size="small" hiddenLabel>
              <Select
                value={newMaterial.typeId}
                onChange={(e) => setNewMaterial({ ...newMaterial, typeId: e.target.value })}
                color="success"
                MenuProps={{
                  disablePortal: true,
                  PaperProps: {
                    sx: {
                      maxHeight: 200, // Giới hạn chiều cao menu
                      overflowY: "auto",
                    },
                  },
                }}
                displayEmpty
                renderValue={newMaterial.typeId !== "" ? undefined : () => <Typography className="text-[16px] text-gray-500">Danh mục</Typography>}
              >
                {materialCategories.length > 0 ? (
                  materialCategories.map((category) => (
                    <MenuItem
                      key={category.materialTypeId}
                      value={String(category.materialTypeId)}
                      sx={{
                        "&.Mui-selected": {
                          backgroundColor: "rgba(8, 148, 86, 0.1) !important",
                        },
                      }}>
                      {category.name}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem disabled>Không có danh mục nào</MenuItem>
                )}
              </Select>
            </FormControl>
            {validationErrors.typeId && (
              <Typography className="text-xs text-red-500 mt-1">
                {validationErrors.typeId}
              </Typography>
            )}
            {errors.typeId && !validationErrors.typeId && (
              <Typography className="text-xs text-red-500 mt-1">
                {errors.typeId}
              </Typography>
            )}
          </div>

          <div className="col-span-2">
            <Typography variant="medium" className="text-black">
              Mô tả
              <span className="text-red-500"> *</span>
            </Typography>
            <TextField
              fullWidth
              size="small"
              hiddenLabel
              placeholder="Mô tả"
              color="success"
              multiline
              rows={4}
              value={newMaterial.description}
              onChange={(e) => setNewMaterial({ ...newMaterial, description: e.target.value })}
            />
            {errors.description && (
              <Typography className="text-xs text-red-500 mt-1">{errors.description}</Typography>
            )}
          </div>

          <div className="col-span-2">
            <Typography variant="medium" className="text-black">
              Hình ảnh nguyên vật liệu
              <span className="text-red-500"> *</span>
            </Typography>
            <TextField
              fullWidth
              type="file"
              accept="image/*"
              size="small"
              hiddenLabel
              color="success"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  if (file.size > 5 * 1024 * 1024) {
                    alert("Kích thước file không được vượt quá 5MB");
                    e.target.value = "";
                    return;
                  }
                  const imageUrl = URL.createObjectURL(file);
                  setNewMaterial((prev) => ({
                    ...prev,
                    image: file,
                    imageUrl: imageUrl,
                  }));
                }
              }}
            />
            {newMaterial.imageUrl && (
              <div className="mt-2 relative">
                <img
                  src={newMaterial.imageUrl}
                  alt="Preview"
                  className="w-32 h-32 object-cover rounded-lg border"
                />
              </div>
            )}
          </div>
        </div>
      </DialogBody>

      {/* Footer của Dialog */}
      <DialogFooter className="pt-0">
        <MuiButton
          size="medium"
          color="error"
          variant="outlined"
          onClick={onClose}
        >
          Hủy
        </MuiButton>
        <Button
          size="lg"
          color="white"
          variant="text"
          className="bg-[#0ab067] hover:bg-[#089456]/90 shadow-none text-white font-medium py-2 px-4 ml-3 rounded-[4px] transition-all duration-200 ease-in-out"
          ripple={true}
          onClick={handleCreateMaterialWrapper}
        >
          Lưu
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default CreateMaterialModal;