import React, { useEffect, useState } from "react";
import useMaterial from "./useMaterial";
import { Button, Card, CardHeader, Typography } from "@material-tailwind/react";
import { ArrowRightIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";
import { FaEdit, FaFileExcel, FaPlus } from "react-icons/fa";
import ReactPaginate from "react-paginate";
import CreateMaterialModal from './CreateMaterialModal';
import EditMaterialModal from './EditMaterialModal';

import axios from "axios";

import {
    importExcel,
    exportExcel,
    createMaterial,
    fetchMaterialCategories,
    fetchUnits,
    checkMaterialCodeExists
} from "./materialService";
import {
    CardBody,
    Tooltip,
    Switch
} from "@material-tailwind/react";

const MaterialPage = () => {
    // Sử dụng hook quản lý nguyên vật liệu
    const {
        materials,
        loading,
        currentPage,
        pageSize,
        totalPages,
        totalElements,
        fetchPaginatedMaterials,
        handleToggleStatus,
        handlePageChange,
        handlePageSizeChange
    } = useMaterial();

    // Quản lý trạng thái các modal và form
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedMaterial, setSelectedMaterial] = useState(null);
    const [showImportPopup, setShowImportPopup] = useState(false);
    const [showCreatePopup, setShowCreatePopup] = useState(false);
    const [file, setFile] = useState(null);
    const [localLoading, setLocalLoading] = useState(false);

    // Danh sách đơn vị và danh mục
    const [units, setUnits] = useState([]);
    const [materialCategories, setMaterialCategories] = useState([]);

    // Quản lý lỗi validation
    const [errors, setErrors] = useState({
        materialCode: "",
        materialName: "",
        unitId: "",
        categoryId: "",
        description: ""
    });

    // Dữ liệu cho nguyên vật liệu mới
    const [newMaterial, setNewMaterial] = useState({
        materialCode: "",
        materialName: "",
        description: "",
        unitId: "",
        categoryId: "",
        isActive: true,
        image: null,
        imageUrl: null
    });

    // Tải danh sách đơn vị và danh mục
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [unitsData, categoriesData] = await Promise.all([
                    fetchUnits(),
                    fetchMaterialCategories()
                ]);

                setUnits(Array.isArray(unitsData) ? unitsData : []);
                setMaterialCategories(Array.isArray(categoriesData) ? categoriesData : []);
            } catch (error) {
                console.error("Lỗi khi tải danh sách:", error);
                setUnits([]);
                setMaterialCategories([]);
            }
        };
        fetchData();
    }, []);

    // Xử lý mở modal chỉnh sửa
    const handleEdit = (material) => {
        setSelectedMaterial(material);
        setShowEditModal(true);
    };

    // Validate nguyên vật liệu - Sửa lại để giống với EditMaterialModal
    const validateMaterial = async (material) => {
        const newErrors = {
            materialCode: "",
            materialName: "",
            unitId: "",
            categoryId: "",
            description: ""
        };
        let isValid = true;

        if (!material.materialCode?.trim()) {
            newErrors.materialCode = "Mã nguyên vật liệu không được để trống";
            isValid = false;
        }

        if (!material.materialName?.trim()) {
            newErrors.materialName = "Tên nguyên vật liệu không được để trống";
            isValid = false;
        }

        if (!material.unitId) {
            newErrors.unitId = "Vui lòng chọn đơn vị";
            isValid = false;
        }

        if (!material.categoryId) {
            newErrors.categoryId = "Vui lòng chọn danh mục";
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    // Xử lý import Excel
    const handleImport = async () => {
        if (!file) {
            alert("Vui lòng chọn file Excel!");
            return;
        }

        setLocalLoading(true);
        try {
            await importExcel(file);
            alert("Import thành công!");
            fetchPaginatedMaterials();
            setShowImportPopup(false);
            setFile(null);
        } catch (error) {
            console.error("Lỗi khi import file:", error);
            alert("Lỗi import file! Kiểm tra lại dữ liệu.");
        } finally {
            setLocalLoading(false);
        }
    };

    // Xử lý tạo nguyên vật liệu mới - Sửa lại để giống với EditMaterialModal
    const handleCreateMaterial = async () => {
        try {
            setErrors({});
            const isValid = await validateMaterial(newMaterial);
            if (!isValid) return;

            setLocalLoading(true);

            const formData = new FormData();
            formData.append('materialCode', newMaterial.materialCode);
            formData.append('materialName', newMaterial.materialName);
            formData.append('description', newMaterial.description || '');
            formData.append('unitId', newMaterial.unitId || '');
            formData.append('categoryId', newMaterial.categoryId || '');
            formData.append('isUsingActive', newMaterial.isActive);

            if (newMaterial.image) {
                formData.append('image', newMaterial.image);
            }

            await axios.post(
                'http://localhost:8080/api/unistock/user/materials',
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                }
            );

            alert("Tạo nguyên vật liệu thành công!");
            fetchPaginatedMaterials();
            setShowCreatePopup(false);
            setNewMaterial({
                materialCode: "",
                materialName: "",
                description: "",
                unitId: "",
                categoryId: "",
                isActive: true,
                image: null,
                imageUrl: null
            });
        } catch (error) {
            console.error("Lỗi khi tạo nguyên vật liệu:", error);
            alert(error.response?.data?.message || "Lỗi khi tạo nguyên vật liệu!");
        } finally {
            setLocalLoading(false);
        }
    };

    // Xử lý thay đổi trang
    const handlePageChangeWrapper = (selectedItem) => {
        handlePageChange(selectedItem.selected);
    };

    return (
        <div className="mt-12 mb-8 flex flex-col gap-12">
            <Card>
                <CardHeader variant="gradient" color="gray" className="mb-8 p-6">
                    <div className="flex justify-between items-center">
                        <Typography variant="h6" color="white">
                            Danh sách nguyên vật liệu
                        </Typography>
                        <div className="flex gap-2">
                            <Button
                                size="sm"
                                color="white"
                                variant="text"
                                className="flex items-center gap-2"
                                onClick={() => setShowCreatePopup(true)}
                            >
                                <FaPlus className="h-4 w-4" /> Thêm nguyên vật liệu
                            </Button>
                            <Button
                                size="sm"
                                color="white"
                                variant="text"
                                className="flex items-center gap-2"
                                onClick={() => setShowImportPopup(true)}
                            >
                                <FaFileExcel className="h-4 w-4" /> Import Excel
                            </Button>
                            <Button
                                size="sm"
                                color="white"
                                variant="text"
                                className="flex items-center gap-2"
                                onClick={exportExcel}
                            >
                                <FaFileExcel className="h-4 w-4" /> Export Excel
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
                    {/* Phần chọn số items/trang */}
                    <div className="px-4 py-2 flex items-center gap-2">
                        <Typography variant="small" color="blue-gray" className="font-normal">
                            Hiển thị
                        </Typography>
                        <select
                            value={pageSize}
                            onChange={(e) => {
                                handlePageSizeChange(Number(e.target.value));
                            }}
                            className="border rounded px-2 py-1"
                        >
                            {[5, 10, 20, 50].map(size => (
                                <option key={size} value={size}>{size}</option>
                            ))}
                        </select>
                        <Typography variant="small" color="blue-gray" className="font-normal">
                            nguyên vật liệu mỗi trang
                        </Typography>
                    </div>

                    <table className="w-full min-w-[640px] table-auto">
                        <thead>
                            <tr>
                                {[
                                    "STT",
                                    "Mã NVL",
                                    "Tên nguyên vật liệu",
                                    "Mô tả",
                                    "Đơn vị",
                                    "Danh mục",
                                    "Hình ảnh",
                                    "Trạng thái",
                                    "Thao tác",
                                ].map((el) => (
                                    <th key={el} className="border-b border-blue-gray-50 py-3 px-5 text-left">
                                        <Typography variant="small" className="text-[11px] font-bold uppercase text-blue-gray-400">
                                            {el}
                                        </Typography>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {Array.isArray(materials) && materials.length > 0 ? (
                                materials.map((material, index) => {
                                    const className = `py-3 px-5 ${index === materials.length - 1 ? "" : "border-b border-blue-gray-50"}`;
                                    const actualIndex = currentPage * pageSize + index + 1;

                                    return (
                                        <tr key={material.materialId}>
                                            <td className={className}>
                                                <Typography variant="small" color="blue-gray" className="font-semibold">
                                                    {actualIndex}
                                                </Typography>
                                            </td>
                                            <td className={className}>
                                                <Typography className="text-xs font-semibold text-blue-gray-600">
                                                    {material.materialCode || "N/A"}
                                                </Typography>
                                            </td>
                                            <td className={className}>
                                                <Typography className="text-xs font-semibold text-blue-gray-600">
                                                    {material.materialName}
                                                </Typography>
                                            </td>
                                            <td className={className}>
                                                <Typography className="text-xs font-normal text-blue-gray-600">
                                                    {material.description || "N/A"}
                                                </Typography>
                                            </td>
                                            <td className={className}>
                                                <Typography className="text-xs font-normal text-blue-gray-600">
                                                    {material.unitName || "N/A"}
                                                </Typography>
                                            </td>
                                            <td className={className}>
                                                <Typography className="text-xs font-normal text-blue-gray-600">
                                                    {material.typeName || "N/A"}
                                                </Typography>
                                            </td>
                                            <td className={className}>
                                                {material.imageUrl ? (
                                                    <img
                                                        src={material.imageUrl}
                                                        alt={material.materialName}
                                                        className="w-16 h-16 object-cover rounded-lg"
                                                        onError={(e) => {
                                                            const imgElement = e.target;
                                                            imgElement.style.display = 'none';
                                                            imgElement.parentElement.innerHTML = 'Không có ảnh';
                                                        }}
                                                    />
                                                ) : (
                                                    <Typography className="text-xs font-normal text-gray-600">
                                                        Không có ảnh
                                                    </Typography>
                                                )}
                                            </td>
                                            <td className={className}>
                                                <div className="flex items-center gap-2">
                                                    <Switch
                                                        color="green"
                                                        checked={material.isUsing}
                                                        onChange={() => {
                                                            if (!material.materialId) {
                                                                console.error("❌ Lỗi: Nguyên vật liệu không có ID!", material);
                                                                alert("Lỗi: Nguyên vật liệu không có ID!");
                                                                return;
                                                            }
                                                            handleToggleStatus(material.materialId);
                                                        }}
                                                    />
                                                    <Typography className="text-xs font-semibold text-blue-gray-600">
                                                        {material.isUsing ? "Đang sử dụng" : "Ngừng sử dụng"}
                                                    </Typography>
                                                </div>
                                            </td>

                                            <td className={className}>
                                                <div className="flex items-center gap-2">
                                                    <Tooltip content="Chỉnh sửa">
                                                        <button
                                                            onClick={() => handleEdit(material)}
                                                            className="p-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white"
                                                        >
                                                            <FaEdit className="h-4 w-4" />
                                                        </button>
                                                    </Tooltip>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="10" className="border-b border-gray-200 px-3 py-4 text-center text-gray-500">
                                        Không có dữ liệu
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    {/* Phần phân trang mới sử dụng ReactPaginate */}
                    <div className="flex items-center justify-between border-t border-blue-gray-50 p-4">
                        <div className="flex items-center gap-2">
                            <Typography variant="small" color="blue-gray" className="font-normal">
                                Trang {currentPage + 1} / {totalPages} • {totalElements} nguyên vật liệu
                            </Typography>
                        </div>
                        <ReactPaginate
                            previousLabel={<ArrowLeftIcon strokeWidth={2} className="h-4 w-4" />}
                            nextLabel={<ArrowRightIcon strokeWidth={2} className="h-4 w-4" />}
                            breakLabel="..."
                            pageCount={totalPages}
                            marginPagesDisplayed={2}
                            pageRangeDisplayed={5}
                            onPageChange={handlePageChangeWrapper}
                            containerClassName="flex items-center gap-1"
                            pageClassName="h-8 min-w-[32px] flex items-center justify-center rounded-md text-xs text-gray-700 border border-gray-300 hover:bg-gray-100"
                            pageLinkClassName="flex items-center justify-center w-full h-full"
                            previousClassName="h-8 min-w-[32px] flex items-center justify-center rounded-md text-xs text-gray-700 border border-gray-300 hover:bg-gray-100"
                            nextClassName="h-8 min-w-[32px] flex items-center justify-center rounded-md text-xs text-gray-700 border border-gray-300 hover:bg-gray-100"
                            breakClassName="h-8 min-w-[32px] flex items-center justify-center rounded-md text-xs text-gray-700"
                            activeClassName="bg-blue-500 text-white border-blue-500 hover:bg-blue-600"
                            forcePage={currentPage}
                            disabledClassName="opacity-50 cursor-not-allowed"
                        />
                    </div>
                </CardBody>
            </Card>

            {/* Các Modal */}
            <CreateMaterialModal
                show={showCreatePopup}
                onClose={() => {
                    setShowCreatePopup(false);
                    setErrors({});
                }}
                loading={localLoading}
                newMaterial={newMaterial}
                setNewMaterial={setNewMaterial}
                handleCreateMaterial={handleCreateMaterial}
                errors={errors}
                units={units}
                materialCategories={materialCategories}
            />

            {/* Popup import Excel */}
            {showImportPopup && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-96">
                        <div className="flex justify-between items-center mb-4">
                            <Typography variant="h6">Import Excel</Typography>
                            <button
                                className="text-gray-500 hover:text-gray-700"
                                onClick={() => setShowImportPopup(false)}
                            >
                                ✕
                            </button>
                        </div>
                        <div className="mb-4">
                            <input
                                type="file"
                                accept=".xlsx, .xls"
                                onChange={(e) => setFile(e.target.files[0])}
                                className="w-full p-2 border rounded"
                            />
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button
                                color="gray"
                                onClick={() => setShowImportPopup(false)}
                                disabled={localLoading}
                            >
                                Hủy
                            </Button>
                            <Button
                                color="blue"
                                onClick={handleImport}
                                disabled={localLoading}
                            >
                                {localLoading ? "Đang xử lý..." : "Import"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            <EditMaterialModal
                show={showEditModal}
                onClose={() => setShowEditModal(false)}
                material={selectedMaterial}
                onUpdate={fetchPaginatedMaterials}
                units={units}
                materialCategories={materialCategories}
            />
        </div>
    );
};

export default MaterialPage;