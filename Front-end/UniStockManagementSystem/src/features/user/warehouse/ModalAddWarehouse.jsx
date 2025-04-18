import React, { useState } from 'react';
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
  const [warehouseCategories, setWarehouseCategories] = useState([]);

  // Danh sách phân loại kho có sẵn
  const categoryOptions = [
    { value: "TP", label: "Thành phẩm sản xuất" },
    { value: "VT", label: "Vật tư mua bán" },
    { value: "GC", label: "Hàng hóa gia công" },
    { value: "TL", label: "Hàng hóa trả lại" },
    { value: "NT", label: "Nhập kho vật tư thừa" }
  ];

  const { addWarehouse } = useWarehouse();

  const validateFields = (field, value) => {
    let errors = { ...error };

    if (field === "warehouseCode") {
      if (!value.trim()) {
        errors.warehouseCode = "Mã kho không được để trống.";
      } else if (!/^[A-Za-z0-9_-]{1,10}$/.test(value)) {
        errors.warehouseCode = "Mã kho chỉ được chứa chữ, số, dấu '-' hoặc '_', từ 1 đến 10 ký tự.";
      } else {
        delete errors.warehouseCode;
      }
    }

    if (field === "warehouseName") {
      if (!value.trim()) {
        errors.warehouseName = "Tên kho không được để trống.";
      } else if (value.length > 100) {
        errors.warehouseName = "Tên kho không được vượt quá 100 ký tự.";
      } else {
        delete errors.warehouseName;
      }
    }

    if (field === "warehouseDescription") {
      if (value.length > 200) {
        errors.warehouseDescription = "Mô tả không được vượt quá 200 ký tự.";
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

    // Validate tất cả các trường trước khi lưu
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
      // Lấy danh sách label thay vì value để lưu
      const categoryLabels = warehouseCategories.map(cat => 
        categoryOptions.find(opt => opt.value === cat)?.label
      );
      
      await addWarehouse({ 
        warehouseCode, 
        warehouseName, 
        warehouseDescription, 
        warehouseCategories: categoryLabels 
      });
      alert("Thêm kho thành công!");
      onAdd?.();
      onClose();
    } catch (error) {
      console.error("Lỗi khi thêm kho:", error);
      alert("Lỗi khi thêm kho!");
    } finally {
      setLoading(false);
    }
  };

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
              onChange={(e) => {
                setWarehouseCode(e.target.value);
                validateFields("warehouseCode", e.target.value);
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
          <Autocomplete
            multiple
            options={categoryOptions}
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
                placeholder="Chọn phân loại kho"
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