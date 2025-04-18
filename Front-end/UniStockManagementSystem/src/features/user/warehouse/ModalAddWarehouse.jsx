import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  TextField,
  Divider,
  Button,
  IconButton,
  Box,
  Autocomplete,
  Chip
} from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import useWarehouse from "./useWarehouse";

const ModalAddWarehouse = ({ show, onClose, onAdd }) => {
  const [warehouseCode, setWarehouseCode] = useState("");
  const [warehouseName, setWarehouseName] = useState("");
  const [warehouseDescription, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState({});

  // Danh sách phân loại kho có sẵn
  const categoryOptions = [
    { value: "TP", label: "Thành phẩm sản xuất" },
    { value: "VT", label: "Vật tư mua bán" },
    { value: "GC", label: "Hàng hóa gia công" },
    { value: "TL", label: "Hàng hóa trả lại" },
    { value: "NT", label: "Vật tư thừa sau sản xuất" }
  ];
  const [warehouseCategories, setWarehouseCategories] = useState([]);
  const [availableCategories, setAvailableCategories] = useState(categoryOptions);
  const { addWarehouse, getUsedCategories, isWarehouseCodeTaken } = useWarehouse();
  const [isAllCategoriesUsed, setIsAllCategoriesUsed] = useState(false);
  const [isActive, setIsActive] = useState(true);

  const validateFields = (field, value) => {
    let errors = { ...error };

    if (field === "warehouseCode") {
      if (!value.trim()) {
        errors.warehouseCode = "Mã kho không được để trống.";
      } else if (!/^[A-Za-z0-9_-]{1,50}$/.test(value)) {
        errors.warehouseCode = "Mã kho chỉ chứa chữ, số, dấu '-' hoặc '_', không vượt quá 50 ký tự.";
      } else {
        delete errors.warehouseCode;
      }
    }

    if (field === "warehouseName") {
      if (!value.trim()) {
        errors.warehouseName = "Tên kho không được để trống.";
      } else if (value.length > 100) {
        errors.warehouseName = "Tên kho không vượt quá 100 ký tự.";
      } else {
        delete errors.warehouseName;
      }
    }

    if (field === "warehouseDescription") {
      if (value.length > 255) {
        errors.warehouseDescription = "Mô tả quá dài.";
      } else {
        delete errors.warehouseDescription;
      }
    }

    setError(errors);
  };

  const validateCategories = () => {
    let errors = { ...error };
    if (warehouseCategories.length === 0) {
      errors.warehouseCategories = "Vui lòng chọn ít nhất một phân loại kho.";
      setError(errors);
      return false;
    } else {
      delete errors.warehouseCategories;
      setError(errors);
      return true;
    }
  };

  const handleSave = async () => {
    if (Object.keys(error).length > 0) return;
  
    if (!warehouseCode.trim()) {
      setError({ ...error, warehouseCode: "Mã kho không được để trống." });
      return;
    }
  
    if (!warehouseName.trim()) {
      setError({ ...error, warehouseName: "Tên kho không được để trống." });
      return;
    }
  
    if (!validateCategories()) return;
  
    setLoading(true);
    try {
      const categoryLabels = warehouseCategories.map(cat =>
        categoryOptions.find(opt => opt.value === cat)?.label
      );
      const goodCategory = categoryLabels.length > 0 ? categoryLabels.join(", ") : null;
  
      const data = {
        warehouseCode,
        warehouseName,
        warehouseDescription,
        goodCategory,
        isActive,
      };
  
      console.log("📤 Dữ liệu gửi về backend:", data); // ✅ LOG kiểm tra
  
      await addWarehouse(data);
  
      alert("Thêm kho thành công!");
      onAdd?.();
      onClose();
    } catch (error) {
      if (error.response?.status === 409) {
        const errorCode = error.response.data;
        let errors = { ...error };
        if (errorCode === "DUPLICATE_CODE_AND_NAME") {
          errors.warehouseCode = "Mã kho đã tồn tại.";
          errors.warehouseName = "Tên kho đã tồn tại.";
        } else if (errorCode === "DUPLICATE_CODE") {
          errors.warehouseCode = "Mã kho đã tồn tại.";
        } else if (errorCode === "DUPLICATE_NAME") {
          errors.warehouseName = "Tên kho đã tồn tại.";
        }
        setError(errors);
      }
    } finally {
      setLoading(false);
    }
  };  

  useEffect(() => {
    const fetchAndFilterCategories = async () => {
      const usedLabels = await getUsedCategories();
      const filtered = categoryOptions.filter(opt => !usedLabels.includes(opt.label));
      setAvailableCategories(filtered);
      setIsAllCategoriesUsed(filtered.length === 0);
    };

    if (show) {
      fetchAndFilterCategories();
    }
  }, [show]);


  return (
    <Dialog
      open={show}
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      {/* Header của Dialog */}
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
        <Typography variant="h5" component="div">
          Thêm kho
        </Typography>
        <IconButton
          edge="end"
          color="inherit"
          onClick={onClose}
          aria-label="close"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <Divider />

      {/* Body của Dialog */}
      <DialogContent sx={{ py: 3 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
          <Box>
            <Typography variant="body1" sx={{ mb: 1 }}>
              Mã kho
              <span style={{ color: '#f44336' }}> *</span>
            </Typography>
            <TextField
              fullWidth
              size="small"
              placeholder="Mã kho"
              color="success"
              value={warehouseCode}
              onChange={async (e) => {
                const uppercased = e.target.value.toUpperCase();
                setWarehouseCode(uppercased);
                validateFields("warehouseCode", uppercased);

                if (uppercased && /^[A-Za-z0-9_-]{1,50}$/.test(uppercased)) {
                  const exists = await isWarehouseCodeTaken(uppercased);
                  if (exists) {
                    setError(prev => ({
                      ...prev,
                      warehouseCode: "Mã kho đã tồn tại."
                    }));
                  } else {
                    setError(prev => {
                      const { warehouseCode, ...rest } = prev;
                      return rest;
                    });
                  }
                }
              }}

              error={!!error.warehouseCode}
              helperText={error.warehouseCode}
            />
          </Box>
          <Box>
            <Typography variant="body1" sx={{ mb: 1 }}>
              Tên kho
              <span style={{ color: '#f44336' }}> *</span>
            </Typography>
            <TextField
              fullWidth
              size="small"
              placeholder="Tên kho"
              color="success"
              value={warehouseName}
              onChange={(e) => {
                setWarehouseName(e.target.value);
                validateFields("warehouseName", e.target.value);
              }}
              error={!!error.warehouseName}
              helperText={error.warehouseName}
            />
          </Box>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="body1" sx={{ mb: 1 }}>
            Phân loại kho
            <span style={{ color: '#f44336' }}> *</span>
          </Typography>
          {isAllCategoriesUsed ? (
            <Typography sx={{ fontStyle: "italic", color: "gray", mt: 1 }}>
              Tất cả phân loại hàng hóa mặc định cho kho đã được gán. Không còn phân loại nào để chọn.
            </Typography>
          ) : (
            <Autocomplete
              multiple
              options={availableCategories}
              getOptionLabel={(option) => option.label}
              value={categoryOptions.filter(option => warehouseCategories.includes(option.value))}
              onChange={(event, selectedOptions) => {
                const values = selectedOptions.map(option => option.value);
                setWarehouseCategories(values);
                if (values.length > 0) {
                  const newErrors = { ...error };
                  delete newErrors.warehouseCategories;
                  setError(newErrors);
                }
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  fullWidth
                  size="small"
                  color="success"
                  placeholder="Chọn phân loại kho hàng hóa "
                  error={!!error.warehouseCategories}
                  helperText={error.warehouseCategories}
                />
              )}
              renderTags={(selected, getTagProps) =>
                selected.map((option, index) => (
                  <Chip
                    {...getTagProps({ index })}
                    key={option.value}
                    label={option.label}
                    color="success"
                    variant="outlined"
                    size="small"
                  />
                ))
              }
              slotProps={{
                popper: {
                  sx: { zIndex: 9999 }, // Cố định z-index trong Popper
                },
              }}
            />
          )}
        </Box>

        <Box>
          <Typography variant="body1" sx={{ mb: 1 }}>
            Mô tả
          </Typography>
          <TextField
            fullWidth
            size="small"
            placeholder="Mô tả"
            multiline
            rows={3}
            color="success"
            value={warehouseDescription}
            onChange={(e) => {
              setDescription(e.target.value);
              validateFields("warehouseDescription", e.target.value);
            }}
            error={!!error.warehouseDescription}
            helperText={error.warehouseDescription}
          />
        </Box>
        <Box sx={{ mt: 2 }}>
          <Typography variant="body1" sx={{ mb: 1 }}>
            Trạng thái kho
            <span style={{ color: '#f44336' }}> *</span>
          </Typography>
          <TextField
            select
            fullWidth
            size="small"
            color="success"
            value={isActive ? "active" : "inactive"}
            onChange={(e) => {
              setIsActive(e.target.value === "active");
            }}
            SelectProps={{
              native: true,
            }}
          >
            <option value="active">Hoạt động</option>
            <option value="inactive">Không hoạt động</option>
          </TextField>
        </Box>

      </DialogContent>

      {/* Footer của Dialog */}
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          variant="outlined"
          color="error"
          onClick={onClose}
        >
          Hủy
        </Button>
        <Button
          variant="contained"
          sx={{
            bgcolor: '#0ab067',
            '&:hover': { bgcolor: '#089456' },
            ml: 1
          }}
          onClick={handleSave}
          disabled={loading}
        >
          Lưu
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ModalAddWarehouse;