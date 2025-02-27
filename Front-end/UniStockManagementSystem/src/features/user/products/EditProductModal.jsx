import React, { useState, useEffect } from 'react';
import {
    Typography,
    Button,
    Input,
    Select,
    Option,
} from "@material-tailwind/react";
import axios from 'axios';

const EditProductModal = ({ show, onClose, product, onUpdate, units, productTypes }) => {
    const [editedProduct, setEditedProduct] = useState({
        productCode: "",
        productName: "",
        description: "",
        unitId: "",
        typeId: "",
        isProductionActive: false,
        image: null,
        imageUrl: null
    });

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({
        productCode: "",
        productName: "",
        unitId: "",
        typeId: "",
        description: ""
    });

    // Lấy token từ localStorage
    const getAuthToken = () => {
        return localStorage.getItem("token") || "";
    };

    useEffect(() => {
        if (product) {
            setEditedProduct({
                productId: product.productId,
                productCode: product.productCode || "",
                productName: product.productName || "",
                description: product.description || "",
                unitId: product.unitId?.toString() || "",
                typeId: product.typeId?.toString() || "",
                isProductionActive: product.isProductionActive || false,
                imageUrl: product.imageUrl || null
            });
        }
    }, [product]);

    // Validation helpers
    const isEmptyOrWhitespace = (str) => {
        return !str || /^\s*$/.test(str);
    };

    const validateProduct = async (product) => {
        const newErrors = {
            productCode: "",
            productName: "",
            unitId: "",
            typeId: "",
            description: ""
        };
        let isValid = true;

        if (isEmptyOrWhitespace(product.productCode)) {
            newErrors.productCode = "Mã sản phẩm không được để trống";
            isValid = false;
        }

        if (isEmptyOrWhitespace(product.productName)) {
            newErrors.productName = "Tên sản phẩm không được để trống";
            isValid = false;
        }

        // Check if product code exists but exclude current product
        if (!isEmptyOrWhitespace(product.productCode)) {
            try {
                const token = getAuthToken();
                const response = await axios.get(
                    `http://localhost:8080/api/unistock/user/products/check-product-code/${product.productCode}?excludeId=${product.productId}`,
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );
                if (response.data.exists) {
                    newErrors.productCode = "Mã sản phẩm đã tồn tại trong hệ thống";
                    isValid = false;
                }
            } catch (error) {
                console.error("Lỗi kiểm tra mã sản phẩm:", error);
                if (error.response?.data?.message) {
                    newErrors.productCode = error.response.data.message;
                    isValid = false;
                }
            }
        }

        // Validate unit and product type if selected
        if (product.unitId) {
            const unitExists = units.some(unit => unit.unitId.toString() === product.unitId.toString());
            if (!unitExists) {
                newErrors.unitId = "Vui lòng tạo Đơn vị trước khi cập nhật sản phẩm";
                isValid = false;
            }
        }

        if (product.typeId) {
            const typeExists = productTypes.some(type => type.typeId.toString() === product.typeId.toString());
            if (!typeExists) {
                newErrors.typeId = "Vui lòng tạo Dòng sản phẩm trước khi cập nhật sản phẩm";
                isValid = false;
            }
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleUpdateProduct = async () => {
        try {
            setErrors({});

            // Validate the product data
            const isValid = await validateProduct(editedProduct);
            if (!isValid) {
                return;
            }

            setLoading(true);

            // Create FormData if there's an image
            const formData = new FormData();
            formData.append('productId', editedProduct.productId);
            formData.append('productCode', editedProduct.productCode);
            formData.append('productName', editedProduct.productName);
            formData.append('description', editedProduct.description || '');
            formData.append('unitId', editedProduct.unitId || '');
            formData.append('typeId', editedProduct.typeId || '');
            formData.append('isProductionActive', editedProduct.isProductionActive);

            if (editedProduct.image) {
                formData.append('image', editedProduct.image);
            }

            // Get token
            const token = getAuthToken();

            // Call API to update product
            await axios.put(
                `http://localhost:8080/api/unistock/user/products/${editedProduct.productId}`,
                formData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    },
                }
            );

            alert("Cập nhật sản phẩm thành công!");
            onUpdate(); // Refresh product list
            onClose(); // Close modal
        } catch (error) {
            console.error("Lỗi khi cập nhật sản phẩm:", error);
            alert(error.response?.data?.message || "Lỗi khi cập nhật sản phẩm!");
        } finally {
            setLoading(false);
        }
    };

    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-[500px]">
                <div className="flex justify-between items-center mb-4">
                    <Typography variant="h6">Chỉnh sửa sản phẩm</Typography>
                    <button
                        className="text-gray-500 hover:text-gray-700"
                        onClick={() => {
                            onClose();
                            setErrors({});
                        }}
                    >
                        ✕
                    </button>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <Typography variant="small" className="mb-2">Mã sản phẩm *</Typography>
                        <Input
                            type="text"
                            value={editedProduct.productCode}
                            onChange={(e) => setEditedProduct({ ...editedProduct, productCode: e.target.value })}
                            className={`w-full ${errors.productCode ? 'border-red-500' : ''}`}
                        />
                        {errors.productCode && (
                            <Typography className="text-xs text-red-500 mt-1">
                                {errors.productCode}
                            </Typography>
                        )}
                    </div>
                    <div>
                        <Typography variant="small" className="mb-2">Tên sản phẩm *</Typography>
                        <Input
                            type="text"
                            value={editedProduct.productName}
                            onChange={(e) => setEditedProduct({ ...editedProduct, productName: e.target.value })}
                            className={`w-full ${errors.productName ? 'border-red-500' : ''}`}
                        />
                        {errors.productName && (
                            <Typography className="text-xs text-red-500 mt-1">
                                {errors.productName}
                            </Typography>
                        )}
                    </div>
                    <div>
                        <Typography variant="small" className="mb-2">Đơn vị</Typography>
                        <Select
                            value={editedProduct.unitId}
                            onChange={(value) => setEditedProduct({ ...editedProduct, unitId: value })}
                            className={`w-full ${errors.unitId ? 'border-red-500' : ''}`}
                            label="Chọn đơn vị"
                        >
                            {units.map((unit) => (
                                <Option key={unit.unitId} value={unit.unitId.toString()}>
                                    {unit.unitName}
                                </Option>
                            ))}
                        </Select>
                        {errors.unitId && (
                            <Typography className="text-xs text-red-500 mt-1">
                                {errors.unitId}
                            </Typography>
                        )}
                    </div>
                    <div>
                        <Typography variant="small" className="mb-2">Dòng sản phẩm</Typography>
                        <Select
                            value={editedProduct.typeId}
                            onChange={(value) => setEditedProduct({ ...editedProduct, typeId: value })}
                            className={`w-full ${errors.typeId ? 'border-red-500' : ''}`}
                            label="Chọn dòng sản phẩm"
                        >
                            {productTypes.map((type) => (
                                <Option key={type.typeId} value={type.typeId.toString()}>
                                    {type.typeName}
                                </Option>
                            ))}
                        </Select>
                        {errors.typeId && (
                            <Typography className="text-xs text-red-500 mt-1">
                                {errors.typeId}
                            </Typography>
                        )}
                    </div>     
                    <div className="col-span-2">
                        <Typography variant="small" className="mb-2">Mô tả</Typography>
                        <Input
                            type="text"
                            value={editedProduct.description}
                            onChange={(e) => setEditedProduct({ ...editedProduct, description: e.target.value })}
                            className={`w-full ${errors.description ? 'border-red-500' : ''}`}
                        />
                        {errors.description && (
                            <Typography className="text-xs text-red-500 mt-1">
                                {errors.description}
                            </Typography>
                        )}
                    </div>
                    <div className="col-span-2">
                        <Typography variant="small" className="mb-2">Hình ảnh sản phẩm</Typography>
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
                                    setEditedProduct(prev => ({
                                        ...prev,
                                        image: file,
                                    }));
                                }
                            }}
                            className="w-full"
                        />
                        {(editedProduct.imageUrl || editedProduct.image) && (
                            <div className="mt-2 relative">
                                <img
                                    src={editedProduct.image ? URL.createObjectURL(editedProduct.image) : editedProduct.imageUrl}
                                    alt="Preview"
                                    className="w-32 h-32 object-cover rounded-lg"
                                />
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex justify-end gap-2">
                    <Button
                        color="gray"
                        onClick={() => {
                            onClose();
                            setErrors({});
                        }}
                        disabled={loading}
                    >
                        Hủy
                    </Button>
                    <Button
                        color="blue"
                        onClick={handleUpdateProduct}
                        disabled={loading}
                    >
                        {loading ? "Đang xử lý..." : "Cập nhật"}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default EditProductModal;