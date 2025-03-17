import React, { useEffect, useState } from "react";
import useProductType from "./useProductType";
import CreateProductTypeModal from "./CreateProductTypeModal";
import EditProductTypePopUp from "./EditProductTypeModal";
import {
    Card,
    CardHeader,
    CardBody,
    Typography,
    Button,
    Tooltip,
    Switch,
} from "@material-tailwind/react";
import { BiSolidEdit } from "react-icons/bi";
import { ArrowRightIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";
import ReactPaginate from "react-paginate";
import PageHeader from '@/components/PageHeader';
import Table from "@/components/Table";

const ProductTypePage = () => {
    const { productTypes, fetchProductTypes, toggleStatus, createProductType, totalPages, totalElements, loading } = useProductType();
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditPopup, setShowEditPopup] = useState(false);
    const [editProductType, setEditProductType] = useState(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);

    useEffect(() => {
        fetchProductTypes(currentPage, pageSize);
    }, [currentPage, pageSize, fetchProductTypes]);

    const handlePageChange = (selectedItem) => {
        setCurrentPage(selectedItem.selected);
    };

    const handlePageSizeChange = (e) => {
        setPageSize(Number(e.target.value));
        setCurrentPage(0); // Reset về trang đầu khi thay đổi kích thước trang
    };

    const handleCreateSuccess = async (formData) => {
        try {
            await createProductType(formData); // Sử dụng createProductType từ useProductType
            setShowCreateModal(false);
            fetchProductTypes(currentPage, pageSize); // Làm mới danh sách
        } catch (error) {
            alert(error.message || "Lỗi khi tạo dòng sản phẩm");
        }
    };

    const columnsConfig = [
        { field: 'index', headerName: 'STT', flex: 0.5, minWidth: 50, editable: false },
        { field: 'typeName', headerName: 'Tên dòng sản phẩm', flex: 2, minWidth: 300, editable: false },
        {
            field: 'description',
            headerName: 'Mô tả',
            flex: 2,
            minWidth: 400,
            editable: false,
            renderCell: (params) => params.value || "Chưa có mô tả",
        },
        {
            field: 'status',
            headerName: 'Trạng thái',
            flex: 1,
            minWidth: 200,
            renderCell: (params) => (
                <div className="flex items-center gap-2">
                    <Switch
                        color="green"
                        checked={params.value}
                        onChange={() => toggleStatus(params.row.id, params.value)}
                        disabled={loading}
                    />
                    <Typography className="text-xs font-semibold text-blue-gray-600">
                        {params.value ? "Hoạt động" : "Vô hiệu hóa"}
                    </Typography>
                </div>
            ),
        },
        {
            field: 'actions',
            headerName: 'Hành động',
            flex: 0.5,
            minWidth: 100,
            renderCell: (params) => (
                <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                    <Tooltip content="Chỉnh sửa">
                        <button
                            onClick={() => {
                                setEditProductType(params.row);
                                setShowEditPopup(true);
                            }}
                            className="p-1.5 rounded-full bg-blue-500 hover:bg-blue-600 text-white"
                            disabled={loading}
                        >
                            <BiSolidEdit className="h-5 w-5" />
                        </button>
                    </Tooltip>
                </div>
            ),
        },
    ];

    const data = productTypes.map((type, index) => ({
        id: type.typeId, // DataGrid cần `id`
        index: (currentPage * pageSize) + index + 1,
        typeName: type.typeName,
        description: type.description,
        status: type.status,
    }));

    return (
        <div className="mb-8 flex flex-col gap-12" style={{ height: 'calc(100vh-100px)' }}>
            <Card className="bg-gray-50 p-7 rounded-none shadow-none">
                <CardBody className="pb-2 bg-white rounded-xl">
                    <PageHeader
                        title="Danh sách dòng sản phẩm"
                        onAdd={() => setShowCreateModal(true)}
                        addButtonLabel="Thêm dòng sản phẩm"
                        showImport={false} // Ẩn nút import nếu không dùng
                        showExport={false} // Ẩn xuất file nếu không dùng
                    />
                    <div className="px-4 py-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Typography variant="small" color="blue-gray" className="font-normal whitespace-nowrap">
                                Hiển thị
                            </Typography>
                            <select
                                value={pageSize}
                                onChange={handlePageSizeChange}
                                className="border rounded px-2 py-1"
                            >
                                {[5, 10, 20, 50].map(size => (
                                    <option key={size} value={size}>{size}</option>
                                ))}
                            </select>
                            <Typography variant="small" color="blue-gray" className="font-normal whitespace-nowrap">
                                bản ghi mỗi trang
                            </Typography>
                        </div>
                    </div>

                    <Table
                        data={data}
                        columnsConfig={columnsConfig}
                        enableSelection={false}
                    />

                    <div className="flex items-center justify-between border-t border-blue-gray-50 py-4">
                        <Typography variant="small" color="blue-gray" className="font-normal">
                            Trang {currentPage + 1} / {totalPages} • {totalElements} bản ghi
                        </Typography>
                        <ReactPaginate
                            previousLabel={<ArrowLeftIcon strokeWidth={2} className="h-4 w-4" />}
                            nextLabel={<ArrowRightIcon strokeWidth={2} className="h-4 w-4" />}
                            breakLabel="..."
                            pageCount={totalPages}
                            marginPagesDisplayed={2}
                            pageRangeDisplayed={5}
                            onPageChange={handlePageChange}
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

            <CreateProductTypeModal
                show={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                loading={loading}
                onSuccess={handleCreateSuccess}
            />

            {showEditPopup && editProductType && (
                <EditProductTypePopUp
                    productType={editProductType}
                    onClose={() => setShowEditPopup(false)}
                    onSuccess={() => fetchProductTypes(currentPage, pageSize)}
                />
            )}
        </div>
    );
};

export default ProductTypePage;