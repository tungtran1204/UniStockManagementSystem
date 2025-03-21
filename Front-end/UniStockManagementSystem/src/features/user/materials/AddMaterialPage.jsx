import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    Card,
    CardHeader,
    CardBody,
    Button,
    Input,
    Typography,
} from "@material-tailwind/react";
import { FaSave, FaTimes } from "react-icons/fa";
import Select from "react-select";
import MultiSelectDropdown from "@/components/MultiSelectDropdown";
import { checkMaterialCodeExists, fetchUnits, fetchMaterialCategories, createMaterial } from "./materialService";
import PageHeader from '@/components/PageHeader';
import { getPartnersByType } from "../partner/partnerService";

const customStyles = {
    control: (provided, state) => ({
        ...provided,
        minWidth: 200,
        borderColor: state.isFocused ? "black" : provided.borderColor,
        boxShadow: state.isFocused ? "0 0 0 1px black" : "none",
        "&:hover": {
            borderColor: "black",
        },
    }),
    menuList: (provided) => ({
        ...provided,
    }),
    option: (provided, state) => ({
        ...provided,
        backgroundColor: state.isFocused
            ? "#f3f4f6"
            : state.isSelected
                ? "#e5e7eb"
                : "transparent",
        color: "#000",
        cursor: "pointer",
        "&:active": {
            backgroundColor: "#e5e7eb",
        },
    }),
};

const SUPPLIER_TYPE_ID = 2; // Thêm constant này ở đầu file

const AddMaterialPage = () => {
    const navigate = useNavigate();
    const [newMaterial, setNewMaterial] = useState({
        materialCode: '',
        materialName: '',
        description: '',
        unitId: '',
        typeId: '',
        isActive: 'true',
        supplierIds: [],
        image: null,
        imageUrl: null
    });

    const [loading, setLoading] = useState(false);
    const [materialCodeError, setMaterialCodeError] = useState("");
    const [validationErrors, setValidationErrors] = useState({});
    const [supplierError, setSupplierError] = useState("");
    const [units, setUnits] = useState([]);
    const [materialCategories, setMaterialCategories] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [errors, setErrors] = useState({});
    const [previewImage, setPreviewImage] = useState(null);

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const [unitsData, categoriesData, suppliersData] = await Promise.all([
                    fetchUnits(),
                    fetchMaterialCategories(),
                    getPartnersByType(SUPPLIER_TYPE_ID)
                ]);

                setUnits(unitsData);
                setMaterialCategories(categoriesData);

                // Map lại dữ liệu suppliers theo định dạng mới
                const mappedSuppliers = suppliersData.partners.map((supplier) => ({
                    value: supplier.partnerId,
                    label: supplier.partnerName,
                    partnerCode: supplier.partnerCode,
                    phone: supplier.phone,
                    address: supplier.address
                }));
                setSuppliers(mappedSuppliers);

            } catch (error) {
                console.error("❌ Lỗi khi tải dữ liệu ban đầu:", error);
                setErrors({ message: "Lỗi khi tải dữ liệu ban đầu" });
            }
        };

        loadInitialData();
    }, []);

    const isEmptyOrWhitespace = (str) => !str || /^\s*$/.test(str);

    const handleCheckMaterialCode = async (newCode) => {
        setMaterialCodeError("");
        setValidationErrors(prev => ({
            ...prev,
            materialCode: ""
        }));

        setNewMaterial(prev => ({
            ...prev,
            materialCode: newCode || ''
        }));

        if (newCode.trim()) {
            try {
                const exists = await checkMaterialCodeExists(newCode);
                if (exists) {
                    setMaterialCodeError("Mã nguyên vật liệu này đã tồn tại!");
                }
            } catch (error) {
                console.error("❌ Lỗi kiểm tra mã nguyên vật liệu:", error);
                setMaterialCodeError("Lỗi khi kiểm tra mã nguyên vật liệu!");
            }
        }
    };

    const handleSupplierChange = (selectedOptions) => {
        setSupplierError("");
        const selectedIds = selectedOptions.map(option => option.value);
        setNewMaterial(prev => ({
            ...prev,
            supplierIds: selectedIds
        }));
    };

    const handleCreateMaterial = async () => {
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
        if (!newMaterial.supplierIds || newMaterial.supplierIds.length === 0) {
            newErrors.supplierIds = "Vui lòng chọn ít nhất một nhà cung cấp!";
        }

        setValidationErrors(newErrors);

        if (Object.keys(newErrors).length === 0 && !materialCodeError) {
            try {
                setLoading(true);
                // Gọi API createMaterial
                const formData = new FormData();
                formData.append("materialCode", newMaterial.materialCode.trim());
                formData.append("materialName", newMaterial.materialName.trim());
                formData.append("description", newMaterial.description?.trim() || "");
                formData.append("unitId", parseInt(newMaterial.unitId));
                formData.append("typeId", parseInt(newMaterial.typeId));
                formData.append("isActive", true);

                // Thay đổi cách gửi supplierIds
                newMaterial.supplierIds.forEach(id => {
                    formData.append("supplierIds", id);
                });


                if (newMaterial.image) {
                    formData.append("image", newMaterial.image);
                }

                // Gọi API tạo material
                await createMaterial(formData);

                alert("Tạo nguyên vật liệu thành công!");
                navigate("/user/materials");
            } catch (error) {
                console.error("Create material error:", error);
                setErrors({
                    message: `Có lỗi xảy ra: ${error.response?.data?.message || error.message}`,
                });
            } finally {
                setLoading(false);
            }
        }
    };

    const isCreateDisabled = () => {
        return loading || !!materialCodeError;
    };

    return (
        <div className="mb-8 flex flex-col gap-12">
            <Card className="bg-gray-50 p-7 rounded-none shadow-none">
                <CardBody className="pb-2 bg-white rounded-xl">
                    <PageHeader
                        title="Tạo nguyên vật liệu mới"
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
                                    Mã nguyên vật liệu *
                                </Typography>
                                <Input
                                    type="text"
                                    value={newMaterial.materialCode}
                                    onChange={(e) => handleCheckMaterialCode(e.target.value)}
                                    className={`w-full ${materialCodeError || validationErrors.materialCode ? "border-red-500" : ""}`}
                                />
                                {(materialCodeError || validationErrors.materialCode) && (
                                    <Typography className="text-xs text-red-500 mt-1">
                                        {materialCodeError || validationErrors.materialCode}
                                    </Typography>
                                )}
                            </div>

                            <div>
                                <Typography variant="small" className="mb-2 text-gray-900 font-bold">
                                    Đơn vị *
                                </Typography>
                                <Select
                                    placeholder="Chọn đơn vị"
                                    options={units.map((unit) => ({
                                        value: unit.unitId.toString(),
                                        label: unit.unitName,
                                    }))}
                                    styles={customStyles}
                                    value={units
                                        .map((unit) => ({
                                            value: unit.unitId.toString(),
                                            label: unit.unitName,
                                        }))
                                        .find((option) => option.value === newMaterial.unitId?.toString()) || null}
                                    onChange={(selected) => {
                                        setNewMaterial(prev => ({ ...prev, unitId: selected ? selected.value : "" }));
                                        setValidationErrors(prev => ({ ...prev, unitId: "" }));
                                    }}
                                />
                                {validationErrors.unitId && (
                                    <Typography className="text-xs text-red-500 mt-1">
                                        {validationErrors.unitId}
                                    </Typography>
                                )}
                            </div>

                            <div>
                                <Typography variant="small" className="mb-2 text-gray-900 font-bold">
                                    Mô tả
                                </Typography>
                                <Input
                                    type="text"
                                    value={newMaterial.description}
                                    onChange={(e) => setNewMaterial({ ...newMaterial, description: e.target.value })}
                                    className="w-full"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-4">
                            <div>
                                <Typography variant="small" className="mb-2 text-gray-900 font-bold">
                                    Tên nguyên vật liệu *
                                </Typography>
                                <Input
                                    type="text"
                                    value={newMaterial.materialName}
                                    onChange={(e) => {
                                        setNewMaterial({ ...newMaterial, materialName: e.target.value });
                                        setValidationErrors(prev => ({ ...prev, materialName: "" }));
                                    }}
                                    className={`w-full ${validationErrors.materialName ? "border-red-500" : ""}`}
                                />
                                {validationErrors.materialName && (
                                    <Typography className="text-xs text-red-500 mt-1">
                                        {validationErrors.materialName}
                                    </Typography>
                                )}
                            </div>

                            <div>
                                <Typography variant="small" className="mb-2 text-gray-900 font-bold">
                                    Danh mục *
                                </Typography>
                                <Select
                                    placeholder="Chọn danh mục"
                                    options={materialCategories.map((category) => ({
                                        value: category.materialTypeId.toString(),
                                        label: category.name,
                                    }))}
                                    styles={customStyles}
                                    value={materialCategories
                                        .map((category) => ({
                                            value: category.materialTypeId.toString(),
                                            label: category.name,
                                        }))
                                        .find((option) => option.value === newMaterial.typeId?.toString()) || null}
                                    onChange={(selected) => {
                                        setNewMaterial(prev => ({ ...prev, typeId: selected ? selected.value : "" }));
                                        setValidationErrors(prev => ({ ...prev, typeId: "" }));
                                    }}
                                />
                                {validationErrors.typeId && (
                                    <Typography className="text-xs text-red-500 mt-1">
                                        {validationErrors.typeId}
                                    </Typography>
                                )}
                            </div>

                            <div>
                                <Typography variant="small" className="mb-2 text-gray-900 font-bold">
                                    Nhà cung cấp *
                                </Typography>
                                <Select
                                    isMulti
                                    placeholder="Chọn nhà cung cấp"
                                    options={suppliers}
                                    value={suppliers.filter(s => newMaterial.supplierIds.includes(s.value))}
                                    onChange={handleSupplierChange}
                                    styles={customStyles}
                                    className="w-full"
                                />
                                {(validationErrors.supplierIds || supplierError) && (
                                    <Typography className="text-xs text-red-500 mt-1">
                                        {validationErrors.supplierIds || supplierError}
                                    </Typography>
                                )}
                            </div>

                            <div>
                                <Typography variant="small" className="mb-2 text-gray-900 font-bold">
                                    Hình ảnh nguyên vật liệu
                                </Typography>
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
                                            setNewMaterial((prev) => ({
                                                ...prev,
                                                image: file,
                                                imageUrl: imageUrl,
                                            }));
                                        }
                                    }}
                                />
                                {previewImage && (
                                    <div className="mt-2 relative">
                                        <img
                                            src={previewImage}
                                            alt="Preview"
                                            className="w-32 h-32 object-cover rounded-lg"
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = 'path_to_default_image.jpg';
                                            }}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 mt-8">
                        <Button
                            variant="text"
                            color="gray"
                            onClick={() => navigate("/user/materials")}
                            className="flex items-center gap-2"
                        >
                            <FaTimes /> Hủy
                        </Button>
                        <Button
                            variant="gradient"
                            color="green"
                            onClick={handleCreateMaterial}
                            disabled={isCreateDisabled()}
                            className="flex items-center gap-2"
                        >
                            <FaSave /> {loading ? "Đang xử lý..." : "Lưu"}
                        </Button>
                    </div>
                </CardBody>
            </Card>
        </div>
    );
};

export default AddMaterialPage;