import React, { useEffect, useState } from "react";
import useMaterial from "./useMaterial";
import { Button, Card, CardHeader, Typography } from "@material-tailwind/react";
import { ArrowRightIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";
import { FaEdit, FaFileExcel, FaPlus } from "react-icons/fa";
import ReactPaginate from "react-paginate";
import CreateMaterialModal from './CreateMaterialModal';
import EditMaterialModal from './EditMaterialModal';
import PageHeader from '@/components/PageHeader';
import TableSearch from '@/components/TableSearch';

import {
    importExcel,
    exportExcel,
    createMaterial,
    fetchMaterialCategories,
    fetchUnits,
} from "./materialService";
import {
    CardBody,
    Tooltip,
    Switch,
    Input
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
    const [searchTerm, setSearchTerm] = useState(""); // State for search term


    // Danh sách đơn vị và danh mục
    const [units, setUnits] = useState([]);
    const [materialCategories, setMaterialCategories] = useState([]);

    // Dữ liệu cho nguyên vật liệu mới
    const [newMaterial, setNewMaterial] = useState({
        materialCode: "",
        materialName: "",
        description: "",
        unitId: "",
        typeId: "",
        isActive: "true"
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

    // Xử lý tạo nguyên vật liệu mới
    const handleCreateMaterial = async () => {
        try {
            setLocalLoading(true);

            await createMaterial(newMaterial);

            alert("Tạo nguyên vật liệu thành công!");

            fetchPaginatedMaterials();
            setShowCreatePopup(false);
            setNewMaterial({
                materialCode: "",
                materialName: "",
                description: "",
                unitId: "",
                typeId: "",
                isActive: "true"
            });
        } catch (error) {
            console.error("🚨 Chi tiết lỗi:", error);

            if (error.response) {
                const errorMessage = error.response.data.message || "Lỗi khi tạo nguyên vật liệu!";
                alert(errorMessage);
            } else if (error.request) {
                alert("Không thể kết nối tới máy chủ. Vui lòng kiểm tra kết nối.");
            } else {
                alert("Lỗi không xác định! Vui lòng thử lại.");
            }
        } finally {
            setLocalLoading(false);
        }
    };

    // Xử lý thay đổi trang
    const handlePageChangeWrapper = (selectedItem) => {
        handlePageChange(selectedItem.selected);
    };

    const filteredMaterials = Array.isArray(materials) 
        ? materials.filter(material => 
            material.materialCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            material.materialName?.toLowerCase().includes(searchTerm.toLowerCase())
        )
        : [];

    return (
        <div className="mb-8 flex flex-col gap-12">
            <Card className="bg-gray-100 p-7">
                <PageHeader
                    title="Danh sách nguyên vật liệu"
                    addButtonLabel="Thêm nguyên vật liệu"
                    onAdd={() => setShowCreatePopup(true)}
                    onImport={() => setShowImportPopup(true)}
                    onExport={exportExcel}
                />
                <CardBody className="pb-2 bg-white rounded-xl">
                    {/* Items per page and search */}
                    <div className="px-4 py-2 flex items-center justify-between gap-2">
                        {/* Items per page */}
                        <div className="flex items-center gap-2">
                            <Typography variant="small" color="blue-gray" className="font-light">
                                Hiển thị
                            </Typography>
                            <select
                                value={pageSize}
                                onChange={(e) => {
                                    handlePageSizeChange(Number(e.target.value));
                                }}
                                className="border text-sm rounded px-2 py-1"
                            >
                                {[5, 10, 20, 50].map(size => (
                                    <option key={size} value={size}>{size}</option>
                                ))}
                            </select>
                            <Typography variant="small" color="blue-gray" className="font-normal">
                                bản ghi mỗi trang
                            </Typography>
                        </div>

                        {/* Search input */}
                        <TableSearch
                            value={searchTerm}
                            onChange={setSearchTerm}
                            onSearch={() => {
                                // Thêm hàm xử lý tìm kiếm vào đây nếu có
                                console.log("Tìm kiếm nguyên vật liệu:", searchTerm);
                            }}
                            placeholder="Tìm kiếm nguyên vật liệu"
                        />

                    </div>

                    <table className="w-full min-w-[640px] table-auto border border-gray-200">
                        <thead>
                            <tr>
                                {[
                                    "STT",
                                    "Mã NVL",
                                    "Tên nguyên vật liệu",
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
                            {filteredMaterials.length > 0 ? (
                                filteredMaterials.map((material, index) => {
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
                                                    {material.unitName || "N/A"}
                                                </Typography>
                                            </td>
                                            <td className={className}>
                                                <Typography className="text-xs font-normal text-blue-gray-600">
                                                    {(() => {
                                                        console.log('material.typeId:', material.typeId);
                                                        console.log('materialCategories:', materialCategories);
                                                        const category = materialCategories.find(cat => cat.materialTypeId === material.typeId);
                                                        console.log('Found category:', category);
                                                        return category ? category.name : material.typeName || "Không có danh mục";
                                                    })()}
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

            <CreateMaterialModal
                show={showCreatePopup}
                onClose={() => {
                    setShowCreatePopup(false);
                }}
                loading={localLoading}
                newMaterial={newMaterial}
                setNewMaterial={setNewMaterial}
                handleCreateMaterial={handleCreateMaterial}
                units={units}
                materialCategories={materialCategories}
            />

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