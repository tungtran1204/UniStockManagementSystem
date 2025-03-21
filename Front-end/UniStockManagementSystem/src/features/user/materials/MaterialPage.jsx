import React, { useEffect, useState } from "react";
import useMaterial from "./useMaterial";
import { Button, Card, Typography } from "@material-tailwind/react";
import { ArrowRightIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";
import { BiSolidEdit } from "react-icons/bi";
import ReactPaginate from "react-paginate";
import PageHeader from '@/components/PageHeader';
import TableSearch from '@/components/TableSearch';
import Table from "@/components/Table";
import { useNavigate } from "react-router-dom"; // Thêm import này

import {
    importExcel,
    exportExcel,
    createMaterial,
    fetchMaterialCategories,
    fetchUnits,
} from "./materialService";
import { getPartnersByType } from "../partner/partnerService"; // Thêm import này
import {
    CardBody,
    Tooltip,
    Switch,
    Input
} from "@material-tailwind/react";

const MaterialPage = () => {
    const navigate = useNavigate(); // Thêm hook useNavigate

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
    const [selectedMaterial, setSelectedMaterial] = useState(null);
    const [showImportPopup, setShowImportPopup] = useState(false);
    const [file, setFile] = useState(null);
    const [localLoading, setLocalLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState(""); // State for search term


    // Danh sách đơn vị và danh mục
    const [units, setUnits] = useState([]);
    const [materialCategories, setMaterialCategories] = useState([]);
    const [suppliers, setSuppliers] = useState([]); // Thêm state cho suppliers

    // Dữ liệu cho nguyên vật liệu mới
    const [newMaterial, setNewMaterial] = useState({
        materialCode: "",
        materialName: "",
        description: "",
        unitId: "",
        typeId: "",
        isActive: "true",
        supplierIds: [] // Thêm trường này
    });

    // Tải danh sách đơn vị và danh mục
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [unitsData, categoriesData, suppliersData] = await Promise.all([
                    fetchUnits(),
                    fetchMaterialCategories(),
                    getPartnersByType(1) // Lấy danh sách nhà cung cấp (type = 1)
                ]);

                setUnits(Array.isArray(unitsData) ? unitsData : []);
                setMaterialCategories(Array.isArray(categoriesData) ? categoriesData : []);
                setSuppliers(Array.isArray(suppliersData.partners) ? suppliersData.partners : []); // Lấy partners từ response
            } catch (error) {
                console.error("Lỗi khi tải danh sách:", error);
                setUnits([]);
                setMaterialCategories([]);
                setSuppliers([]);
            }
        };
        fetchData();
    }, []);

    // Xử lý mở modal chỉnh sửa
    const handleEdit = (material) => {
        setSelectedMaterial(material);
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
            setNewMaterial({
                materialCode: "",
                materialName: "",
                description: "",
                unitId: "",
                typeId: "",
                isActive: "true",
                supplierIds: [] // Thêm trường này
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

    const columnsConfig = [
        { field: 'materialCode', headerName: 'Mã NVL', flex: 1, minWidth: 50, editable: false, filterable: false },
        { field: 'materialName', headerName: 'Tên nguyên vật liệu', flex: 2, minWidth: 250, editable: false, filterable: false },
        {
            field: 'unitName',
            headerName: 'Đơn vị',
            flex: 1,
            minWidth: 50,
            editable: false,
            filterable: false,
        },
        {
            field: 'materialTypeName',
            headerName: 'Danh mục',
            flex: 1.5,
            minWidth: 150,
            editable: false,
            filterable: false,
        },
        {
            field: 'imageUrl',
            headerName: 'Hình ảnh',
            flex: 1,
            minWidth: 150,
            editable: false,
            filterable: false,
            renderCell: (params) => {
                return params.value ? (
                    <img
                        src={params.value}
                        alt="Hình ảnh NVL"
                        className="w-12 h-12 object-cover rounded-lg"
                        onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.parentElement.innerHTML = 'Không có ảnh';
                        }}
                    />
                ) : (
                    <Typography className="text-xs text-gray-600">Không có ảnh</Typography>
                );
            },
        },
        {
            field: 'isUsing',
            headerName: 'Trạng thái',
            flex: 1,
            minWidth: 200,
            editable: false,
            filterable: false,
            renderCell: (params) => {
                return (
                    <div className="flex items-center gap-2">
                        <Switch
                            color="green"
                            checked={params.value}
                            onChange={() => handleToggleStatus(params.row.id)}
                        />
                        <Typography className="text-xs font-semibold text-blue-gray-600">
                            {params.value ? "Đang sử dụng" : "Ngừng sử dụng"}
                        </Typography>
                    </div>
                );
            },
        },
        {
            field: 'actions',
            headerName: 'Hành động',
            flex: 0.5,
            minWidth: 50,
            renderCell: (params) => (
                <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                    <Tooltip content="Chi tiết">
                        <button
                            onClick={() => navigate(`/user/materials/${params.row.id}`)}
                            className="p-1.5 rounded-full bg-blue-500 hover:bg-blue-600 text-white"
                        >
                            <BiSolidEdit className="h-5 w-5" />
                        </button>
                    </Tooltip>
                </div>
            ),
        },
    ];

    const data = materials.map((material) => ({
        id: material.materialId,  // DataGrid cần trường 'id'
        materialCode: material.materialCode || "N/A",
        materialName: material.materialName,
        unitName: material.unitName || "N/A",
        materialTypeName: materialCategories.find(cat => cat.materialTypeId === material.typeId)?.name || material.typeName || "Không có danh mục",
        imageUrl: material.imageUrl,
        isUsing: material.isUsing,
    }));

    const filteredMaterials = Array.isArray(materials)
        ? materials.filter(material =>
            material.materialCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            material.materialName?.toLowerCase().includes(searchTerm.toLowerCase())
        )
        : [];

    return (
        <div className="mb-8 flex flex-col gap-12" style={{ height: 'calc(100vh-100px)' }}>
            <Card className="bg-gray-50 p-7 rounded-none shadow-none">

                <CardBody className="pb-2 bg-white rounded-xl">
                    <PageHeader
                        title="Danh sách nguyên vật liệu"
                        addButtonLabel="Thêm nguyên vật liệu"
                        onAdd={() => navigate("/user/materials/add")} // Thay đổi này
                        onImport={() => setShowImportPopup(true)}
                        onExport={exportExcel}
                    />
                    {/* Items per page and search */}
                    <div className="py-2 flex items-center justify-between gap-2">
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

                    <Table
                        data={data}
                        columnsConfig={columnsConfig}
                        enableSelection={false}
                    />

                    <div className="flex items-center justify-between border-t border-blue-gray-50 py-4">
                        <div className="flex items-center gap-2">
                            <Typography variant="small" color="blue-gray" className="font-normal">
                                Trang {currentPage + 1} / {totalPages} • {totalElements} bản ghi
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
                            activeClassName="bg-[#0ab067] text-white border-[#0ab067] hover:bg-[#0ab067]"
                            forcePage={currentPage}
                            disabledClassName="opacity-50 cursor-not-allowed"
                        />
                    </div>
                </CardBody>
            </Card>

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

        </div>
    );
};

export default MaterialPage;