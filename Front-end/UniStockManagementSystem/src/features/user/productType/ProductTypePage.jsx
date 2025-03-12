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
import { FaEdit, FaPlus } from "react-icons/fa";
import { ArrowRightIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";
import ReactPaginate from "react-paginate";

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

    return (
        <div className="mt-12 mb-8 flex flex-col gap-12">
            <Card>
                <CardHeader variant="gradient" color="gray" className="mb-8 p-6">
                    <div className="flex justify-between items-center">
                        <Typography variant="h6" color="white">
                            Danh sách dòng sản phẩm
                        </Typography>
                        <div className="flex gap-2">
                            <Button
                                size="sm"
                                color="white"
                                variant="text"
                                className="flex items-center gap-2"
                                onClick={() => setShowCreateModal(true)}
                                disabled={loading}
                            >
                                <FaPlus className="h-4 w-4" /> Thêm dòng sản phẩm
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
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
                                dòng sản phẩm mỗi trang
                            </Typography>
                        </div>
                    </div>

                    <table className="w-full min-w-[640px] table-auto">
                        <thead>
                            <tr>
                                {["STT", "Tên dòng sản phẩm", "Mô tả", "Trạng thái", "Hành động"].map((el) => (
                                    <th key={el} className="border-b border-blue-gray-50 py-3 px-5 text-left">
                                        <Typography variant="small" className="text-[11px] font-bold uppercase text-blue-gray-400">
                                            {el}
                                        </Typography>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="py-3 px-5 border-b border-blue-gray-50">
                                        <Typography className="text-xs font-semibold text-blue-gray-600 text-center">
                                            Đang tải...
                                        </Typography>
                                    </td>
                                </tr>
                            ) : productTypes && productTypes.length > 0 ? (
                                productTypes.map(({ typeId, typeName, description, status }, key) => {
                                    const className = `py-3 px-5 ${key === productTypes.length - 1 ? "" : "border-b border-blue-gray-50"}`;

                                    return (
                                        <tr key={typeId}>
                                            <td className={className}>
                                                <Typography className="text-xs font-semibold text-blue-gray-600">
                                                    {(currentPage * pageSize) + key + 1}
                                                </Typography>
                                            </td>
                                            <td className={className}>
                                                <Typography className="text-xs font-semibold text-blue-gray-600">
                                                    {typeName}
                                                </Typography>
                                            </td>
                                            <td className={className}>
                                                <Typography className="text-xs font-semibold text-blue-gray-600">
                                                    {description || "Chưa có mô tả"}
                                                </Typography>
                                            </td>
                                            <td className={className}>
                                                <div className="flex items-center gap-2">
                                                    <Switch
                                                        color="green"
                                                        checked={status}
                                                        onChange={() => toggleStatus(typeId, status)}
                                                        disabled={loading}
                                                    />
                                                    <Typography className="text-xs font-semibold text-blue-gray-600">
                                                        {status ? "Hoạt động" : "Vô hiệu hóa"}
                                                    </Typography>
                                                </div>
                                            </td>
                                            <td className={className}>
                                                <div className="flex items-center gap-2">
                                                    <Tooltip content="Chỉnh sửa">
                                                        <button
                                                            onClick={() => {
                                                                setEditProductType({ typeId, typeName, description, status });
                                                                setShowEditPopup(true);
                                                            }}
                                                            className="p-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white"
                                                            disabled={loading}
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
                                    <td colSpan="5" className="py-3 px-5 border-b border-blue-gray-50">
                                        <Typography className="text-xs font-semibold text-blue-gray-600 text-center">
                                            Không có dữ liệu
                                        </Typography>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    <div className="flex items-center justify-between border-t border-blue-gray-50 p-4">
                        <Typography variant="small" color="blue-gray" className="font-normal">
                            Trang {currentPage + 1} / {totalPages} • {totalElements} dòng sản phẩm
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
                            activeClassName="bg-blue-500 text-white border-blue-500 hover:bg-blue-600"
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