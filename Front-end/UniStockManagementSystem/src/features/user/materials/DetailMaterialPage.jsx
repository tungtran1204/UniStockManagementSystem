import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  CardBody,
  Button,
  Input,
  Typography,
} from "@material-tailwind/react";
import { FaEdit, FaArrowLeft, FaSave, FaTimes, FaTimesCircle } from "react-icons/fa";
import Select from "react-select";
import { fetchUnits, fetchMaterialCategories, getMaterialById, updateMaterial } from "./materialService";
import { getPartnersByType } from "../partner/partnerService";
import PageHeader from '@/components/PageHeader';

const customStyles = {
  // ...existing code...
};

const SUPPLIER_TYPE_ID = 2;

const DetailMaterialPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [material, setMaterial] = useState(null);
  const [editedMaterial, setEditedMaterial] = useState(null);
  const [loading, setLoading] = useState(false);
  const [units, setUnits] = useState([]);
  const [materialCategories, setMaterialCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [errors, setErrors] = useState({});
  const [validationErrors, setValidationErrors] = useState({});
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [materialData, unitsData, categoriesData, suppliersData] = await Promise.all([
          getMaterialById(id),
          fetchUnits(),
          fetchMaterialCategories(),
          getPartnersByType(SUPPLIER_TYPE_ID)
        ]);

        // Map suppliers data
        const mappedSuppliers = suppliersData.partners.map((supplier) => ({
          value: supplier.partnerId,
          label: supplier.partnerName,
          partnerCode: supplier.partnerCode,
          phone: supplier.phone,
          address: supplier.address
        }));
        console.log("Mapped suppliers:", mappedSuppliers);
        setSuppliers(mappedSuppliers);

        // Sử dụng supplierIds trực tiếp từ materialData
        const mappedMaterial = {
          ...materialData,
          supplierIds: materialData.supplierIds || []
        };
        console.log("Mapped material:", mappedMaterial);

        setMaterial(mappedMaterial);
        setEditedMaterial(mappedMaterial);
        setUnits(unitsData);
        setMaterialCategories(categoriesData);

      } catch (error) {
        console.error("Error loading material details:", error);
        setErrors({ message: "Không thể tải thông tin nguyên vật liệu" });
      }
    };
    loadData();
  }, [id]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setEditedMaterial(material);
    setIsEditing(false);
    setValidationErrors({});
    setPreviewImage(null);
  };

  const handleSave = async () => {
    const newErrors = {};
    if (!editedMaterial.materialCode) {
      newErrors.materialCode = "Mã nguyên vật liệu không được để trống!";
    }
    if (!editedMaterial.materialName) {
      newErrors.materialName = "Tên nguyên vật liệu không được để trống!";
    }
    if (!editedMaterial.unitId) {
      newErrors.unitId = "Vui lòng chọn đơn vị!";
    }
    if (!editedMaterial.typeId) {
      newErrors.typeId = "Vui lòng chọn danh mục!";
    }

    setValidationErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      try {
        setLoading(true);
        const formData = new FormData();
        formData.append("materialCode", editedMaterial.materialCode);
        formData.append("materialName", editedMaterial.materialName);
        formData.append("description", editedMaterial.description || "");
        formData.append("unitId", editedMaterial.unitId || "");
        formData.append("typeId", editedMaterial.typeId || "");
        if (editedMaterial.supplierIds && editedMaterial.supplierIds.length > 0) {
          editedMaterial.supplierIds.forEach(id => formData.append("supplierIds", id));
        }
        if (editedMaterial.image) {
          formData.append("image", editedMaterial.image);
        }

        await updateMaterial(id, formData);

        alert("Cập nhật thành công!");
        setIsEditing(false);
        const updatedMaterial = await getMaterialById(id);
        setMaterial({
          ...updatedMaterial,
          supplierIds: updatedMaterial.supplierIds || []
        });
        setEditedMaterial({
          ...updatedMaterial,
          supplierIds: updatedMaterial.supplierIds || []
        });
      } catch (error) {
        setErrors({
          message: `Có lỗi xảy ra: ${error.response?.data?.message || error.message}`,
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleRemoveImage = () => {
    setPreviewImage(null);
    setEditedMaterial(prev => ({
      ...prev,
      image: null,
      imageUrl: null
    }));
  };

  const headerButtons = (
    <div className="flex gap-2">
      <Button
        variant="text"
        color="gray"
        size="sm"
        onClick={() => navigate("/user/materials")}
        className="flex items-center gap-2"
      >
        <FaArrowLeft className="h-3 w-3"/> Quay lại
      </Button>
      {!isEditing && (
        <Button
          variant="gradient"
          color="blue"
          size="sm"
          onClick={handleEdit}
          className="flex items-center gap-2"
        >
          <FaEdit className="h-3 w-3"/> Chỉnh sửa
        </Button>
      )}
    </div>
  );

  if (!material || !editedMaterial) return <div>Loading...</div>;

  return (
    <div className="mb-8 flex flex-col gap-12">
      <Card className="bg-gray-50 p-7 rounded-none shadow-none">
        <CardBody className="pb-2 bg-white rounded-xl">
          <PageHeader
            title="Chi tiết nguyên vật liệu"
            customButtons={headerButtons}
            showAdd={false}
            showImport={false}
            showExport={false}
          />

          {errors.message && (
            <Typography className="text-red-500 mb-4">{errors.message}</Typography>
          )}

          <div className="grid grid-cols-2 gap-x-12 gap-y-4">
            <div className="flex flex-col gap-4">
              <div>
                <Typography variant="small" className="mb-2 text-gray-900 font-bold">
                  Mã nguyên vật liệu
                </Typography>
                <Input
                  type="text"
                  value={editedMaterial?.materialCode || ""}
                  onChange={(e) => {
                    if (isEditing) {
                      setEditedMaterial(prev => ({
                        ...prev,
                        materialCode: e.target.value
                      }));
                    }
                  }}
                  disabled={!isEditing}
                  className="w-full"
                />
                {validationErrors.materialCode && (
                  <Typography className="text-xs text-red-500 mt-1">{validationErrors.materialCode}</Typography>
                )}
              </div>

              <div>
                <Typography variant="small" className="mb-2 text-gray-900 font-bold">
                  Đơn vị
                </Typography>
                <Select
                  isDisabled={!isEditing}
                  placeholder="Chọn đơn vị"
                  options={units.map((unit) => ({
                    value: unit.unitId.toString(),
                    label: unit.unitName,
                  }))}
                  value={units
                    .map((unit) => ({
                      value: unit.unitId.toString(),
                      label: unit.unitName,
                    }))
                    .find((option) => option.value === editedMaterial?.unitId?.toString())}
                  onChange={(selected) => {
                    if (isEditing) {
                      setEditedMaterial(prev => ({
                        ...prev,
                        unitId: selected ? selected.value : ""
                      }));
                    }
                  }}
                  styles={customStyles}
                />
                {validationErrors.unitId && (
                  <Typography className="text-xs text-red-500 mt-1">{validationErrors.unitId}</Typography>
                )}
              </div>

              <div>
                <Typography variant="small" className="mb-2 text-gray-900 font-bold">
                  Mô tả
                </Typography>
                <Input
                  type="text"
                  value={editedMaterial?.description || ""}
                  onChange={(e) => {
                    if (isEditing) {
                      setEditedMaterial(prev => ({
                        ...prev,
                        description: e.target.value
                      }));
                    }
                  }}
                  disabled={!isEditing}
                  className="w-full"
                />
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div>
                <Typography variant="small" className="mb-2 text-gray-900 font-bold">
                  Tên nguyên vật liệu
                </Typography>
                <Input
                  type="text"
                  value={editedMaterial?.materialName || ""}
                  onChange={(e) => {
                    if (isEditing) {
                      setEditedMaterial(prev => ({
                        ...prev,
                        materialName: e.target.value
                      }));
                    }
                  }}
                  disabled={!isEditing}
                  className="w-full"
                />
                {validationErrors.materialName && (
                  <Typography className="text-xs text-red-500 mt-1">{validationErrors.materialName}</Typography>
                )}
              </div>

              <div>
                <Typography variant="small" className="mb-2 text-gray-900 font-bold">
                  Danh mục
                </Typography>
                <Select
                  isDisabled={!isEditing}
                  placeholder="Chọn danh mục"
                  options={materialCategories.map((category) => ({
                    value: category.materialTypeId.toString(),
                    label: category.name,
                  }))}
                  value={materialCategories
                    .map((category) => ({
                      value: category.materialTypeId.toString(),
                      label: category.name,
                    }))
                    .find((option) => option.value === editedMaterial?.typeId?.toString())}
                  onChange={(selected) => {
                    if (isEditing) {
                      setEditedMaterial(prev => ({
                        ...prev,
                        typeId: selected ? selected.value : ""
                      }));
                    }
                  }}
                  styles={customStyles}
                />
                {validationErrors.typeId && (
                  <Typography className="text-xs text-red-500 mt-1">{validationErrors.typeId}</Typography>
                )}
              </div>

              <div>
                <Typography variant="small" className="mb-2 text-gray-900 font-bold">
                  Nhà cung cấp
                </Typography>
                <Select
                  isMulti
                  isDisabled={!isEditing}
                  placeholder="Chọn nhà cung cấp"
                  options={suppliers}
                  value={suppliers.filter(s => editedMaterial.supplierIds?.includes(s.value))}
                  onChange={(selectedOptions) => {
                    if (isEditing) {
                      const selectedIds = selectedOptions ? selectedOptions.map(option => option.value) : [];
                      setEditedMaterial(prev => ({
                        ...prev,
                        supplierIds: selectedIds
                      }));
                    }
                  }}
                  styles={customStyles}
                  className="w-full"
                />
              </div>

              <div>
                <Typography variant="small" className="mb-2 text-gray-900 font-bold">
                  Hình ảnh nguyên vật liệu
                </Typography>
                {isEditing && (
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        if (file.size > 5 * 1024 * 1024) {
                          alert("Kích thước file không được vượt quá 5MB");
                          e.target.value = "";
                          return;
                        }
                        const imageUrl = URL.createObjectURL(file);
                        setPreviewImage(imageUrl);
                        setEditedMaterial((prev) => ({
                          ...prev,
                          image: file,
                        }));
                      }
                    }}
                  />
                )}
                {(previewImage || editedMaterial?.imageUrl) && (
                  <div className="mt-2 relative">
                    <div className="relative inline-block">
                      <img
                        src={previewImage || editedMaterial.imageUrl}
                        alt="Preview"
                        className="w-32 h-32 object-cover rounded-lg border-2 border-gray-200"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'path_to_default_image.jpg';
                        }}
                      />
                      {isEditing && (
                        <button
                          onClick={handleRemoveImage}
                          className="absolute -top-2 -right-2 bg-white rounded-full shadow-lg p-1 hover:bg-red-50 transition-colors duration-200 ease-in-out border-2 border-gray-200 group"
                          title="Xóa ảnh"
                        >
                          <FaTimesCircle className="h-4 w-4 text-gray-400 group-hover:text-red-500 transition-colors duration-200 ease-in-out" />
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {isEditing && (
            <div className="flex justify-end gap-2 mt-4">
              <Button
                variant="text"
                color="gray"
                onClick={handleCancel}
                className="flex items-center gap-2"
              >
                <FaTimes /> Hủy
              </Button>
              <Button
                variant="gradient"
                color="green"
                onClick={handleSave}
                disabled={loading}
                className="flex items-center gap-2"
              >
                <FaSave /> {loading ? "Đang xử lý..." : "Lưu"}
              </Button>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export default DetailMaterialPage;