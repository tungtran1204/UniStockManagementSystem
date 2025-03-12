import React, { useEffect, useState } from "react";
import usePartner from "./usePartner";
import CreatePartnerPopup from "./CreatePartnerPopUp";
import {
    fetchPartnerTypes
} from "./partnerService";
import { ArrowRightIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import {
    Card,
    CardHeader,
    CardBody,
    Typography,
    Tooltip,
    Button,
} from "@material-tailwind/react";
import { FaEdit, FaPlus, FaTimes, FaSearch } from "react-icons/fa";
import { BiExport, BiImport, BiSearch } from "react-icons/bi";
import ReactPaginate from "react-paginate";
import PageHeader from '@/components/PageHeader';
import TableSearch from '@/components/TableSearch';

const PartnerPage = () => {
    const {
        partners,
        currentPage,
        pageSize,
        totalPages,
        totalElements,
        selectedType,
        fetchPaginatedPartners,
        handleSelectType,
        handlePageSizeChange,
        handlePageChange } = usePartner();

    const navigate = useNavigate();
    const [showImportPopup, setShowImportPopup] = useState(false);
    const [showCreatePopup, setShowCreatePopup] = useState(false);
    const [file, setFile] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [partnerTypes, setPartnerTypes] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [typesData] = await Promise.all([
                    fetchPartnerTypes()
                ]);
                console.log("Partner Type Data:", typesData); // Log dữ liệu nhóm đối tác
                setPartnerTypes(typesData);
            } catch (error) {
                console.error("Lỗi khi lấy danh sách nhóm đối tác:", error);
            }
        };

        fetchData();
    }, []);

    const handlePageChangeWrapper = (selectedItem) => {
        handlePageChange(selectedItem.selected);
    };

    // const handleImport = async () => {
    //     if (!file) {
    //         alert("Vui lòng chọn file Excel!");
    //         return;
    //     }

    //     setLoading(true);
    //     try {
    //         await importExcel(file);
    //         alert("Import thành công!");
    //         fetchProducts();
    //         setShowImportPopup(false);
    //         setFile(null);
    //     } catch (error) {
    //         console.error("Lỗi khi import file:", error);
    //         alert("Lỗi import file! Kiểm tra lại dữ liệu.");
    //     } finally {
    //         setLoading(false);
    //     }
    // };
    // style={{ color: '#0ab067' }}

    return (
        <div className="mb-8 flex flex-col gap-12" style={{ height: 'calc(100vh-100px)' }}>
            <Card className="bg-gray-50 p-7 rounded-none shadow-none">
                <CardBody className="pb-2 bg-white rounded-xl">
                    <PageHeader
                        title="Danh sách đối tác"
                        onAdd={() => setShowCreatePopup(true)}
                        onImport={() => setShowImportPopup(true)}
                        // onExport={exportExcel}
                        addButtonLabel="Thêm đối tác"
                    />
                    {showCreatePopup && (
                        <CreatePartnerPopup
                            onClose={() => setShowCreatePopup(false)}
                            onSuccess={fetchPaginatedPartners} // Có thể gọi API fetch lại danh sách nếu cần
                        />
                    )}
                    {/* Phần chọn số items/trang */}
                    <div className="py-2 flex items-center justify-between gap-2">
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
                        <TableSearch
                            value={searchTerm}
                            onChange={setSearchTerm}
                            onSearch={() => {
                                // Thực hiện tìm kiếm hoặc gọi API ở đây
                            }}
                            placeholder="Tìm kiếm đối tác"
                        />
                        {selectedType && (
                            <div className="flex items-center gap-0 bg-indigo-100 text-indigo-500 px-3 py-1 rounded-full text-xs font-semibold ml-4">
                                <span>
                                    {partnerTypes.find(type => type.typeId === selectedType)?.typeName}
                                </span>
                                <button
                                    className="ml-1 bg-indigo-100 text-indigo-500"
                                    onClick={() => handleSelectType(null)}
                                >
                                    <FaTimes className="w-4 h-4" /> {/* Icon X */}
                                </button>
                            </div>
                        )}
                    </div>
                    <table className="w-full min-w-[640px] table-auto border border-gray-200">
                        <thead>
                            <tr>
                                {[
                                    "Mã đối tác",
                                    "Tên đối tác",
                                    "Nhóm đối tác",
                                    "Địa chỉ",
                                    "Email",
                                    "Số điện thoại",
                                    "Hành động",
                                ].map((el) => (
                                    <th
                                        key={el}
                                        className="border-b border-blue-gray-50 py-3 px-5 text-left"
                                    >
                                        <Typography
                                            variant="small"
                                            className="text-[11px] font-bold uppercase text-blue-gray-400"
                                        >
                                            {el}
                                        </Typography>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {partners.length > 0 ? (
                                partners.map((partner, index) => {
                                    const className = `py-3 px-5 ${index === partners.length - 1
                                        ? ""
                                        : "border-b border-blue-gray-50"
                                        }`;
                                    return (
                                        <tr key={partner.partnerId}>
                                            <td className={className}>
                                                {partner.partnerTypes && partner.partnerTypes.length > 0 ? (
                                                    <div>
                                                        {partner.partnerTypes.map((type) => (
                                                            <Typography key={type.partnerCode} className="text-xs font-semibold text-blue-gray-600 block">
                                                                {type.partnerCode}
                                                            </Typography>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <Typography className="text-xs text-gray-500">Không có mã</Typography>
                                                )}
                                            </td>
                                            <td className={className}>
                                                <Typography className="text-xs font-semibold text-blue-gray-600">
                                                    {partner.partnerName}
                                                </Typography>
                                            </td>
                                            <td className={className}>
                                                {partner.partnerTypes && partner.partnerTypes.length > 0 ? (
                                                    <div className="flex flex-col gap-1">
                                                        {partner.partnerTypes.map((type) => (
                                                            <button
                                                                key={type.partnerType.typeId}
                                                                className={`px-2 py-1 w-fit text-xs hover:text-white hover:bg-indigo-500 transition-all duration-200 font-semibold rounded-full bg-indigo-100 text-indigo-500
                                                                        ${selectedType === type.partnerType.typeId}`}
                                                                onClick={() => handleSelectType(type.partnerType.typeId)}
                                                            >
                                                                {type.partnerType.typeName}
                                                            </button>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <Typography className="text-xs text-gray-500">Không có nhóm</Typography>
                                                )}
                                            </td>
                                            <td className={className}>
                                                <Typography className="text-xs font-normal text-blue-gray-600">
                                                    {partner.address}
                                                </Typography>
                                            </td>
                                            <td className={className}>
                                                <Typography className="text-xs font-normal text-blue-gray-600">
                                                    {partner.email}
                                                </Typography>
                                            </td>
                                            <td className={className}>
                                                <Typography className="text-xs font-normal text-blue-gray-600">
                                                    {partner.phone}
                                                </Typography>
                                            </td>
                                            <td className={className}>
                                                <div className="flex items-center gap-2 pl-4">
                                                    <Tooltip content="Chỉnh sửa">
                                                        <button
                                                            // onClick={() =>
                                                            //     navigate(`/products/edit/${product.productId}`)
                                                            // }
                                                            className="p-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white"
                                                            style={{ paddingLeft: "10px" }}
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
                                    <td
                                        colSpan="8"
                                        className="border-b border-gray-200 px-3 py-4 text-center text-gray-500"
                                    >
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
                            activeClassName="bg-blue-500 text-white border-blue-500 hover:bg-blue-600"
                            forcePage={currentPage}
                            disabledClassName="opacity-50 cursor-not-allowed"
                        />
                    </div>
                </CardBody>
            </Card>

            {/* Popup import Excel */}
            {/* {showImportPopup && (
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
                                disabled={loading}
                            >
                                Hủy
                            </Button>
                            <Button
                                color="blue"
                                onClick={handleImport}
                                disabled={loading}
                            >
                                {loading ? "Đang xử lý..." : "Import"}
                            </Button>
                        </div>
                    </div>
                </div>
            )} */}
        </div>
    );
};

export default PartnerPage;