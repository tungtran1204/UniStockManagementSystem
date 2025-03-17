import React, { useEffect, useState } from "react";
import usePartner from "./usePartner";
import CreatePartnerModal from "./CreatePartnerModal";
import EditPartnerModal from "./EditPartnerModal";
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
import { BiExport, BiImport, BiSearch, BiSolidEdit } from "react-icons/bi";
import ReactPaginate from "react-paginate";
import PageHeader from '@/components/PageHeader';
import TableSearch from '@/components/TableSearch';
import Table from "@/components/Table";
import { Chip, Stack } from '@mui/material';

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
    const [showEditPopup, setShowEditPopup] = useState(false);
    const [file, setFile] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPartner, setSelectedPartner] = useState(null);
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

    const columnsConfig = [
        {
            field: 'partnerCode',
            headerName: 'Mã đối tác',
            minWidth: 90,
            flex: 1,
            editable: false,
            filterable: false,
            renderCell: (params) => {
                return (
                    <Stack direction="column">
                        {params.value.map((code, index) => (
                            <Typography key={index} className="block font-normal text-sm text-black">
                                {code}
                            </Typography>
                        ))}
                    </Stack>
                );
            },
        },
        { field: 'partnerName', headerName: 'Tên đối tác', flex: 2, minWidth: 200, editable: false, filterable: false },
        {
            field: 'partnerType',
            headerName: 'Nhóm đối tác',
            minWidth: 200,
            flex: 2,
            editable: false,
            filterable: false,
            renderCell: (params) => {
                return (
                    <Stack
                        direction="row"
                        useFlexGap
                        sx={{ flexWrap: 'wrap', gap: 0.5, marginTop: '5px', marginBottom: '5px' }}>
                        {params.value.map((type, index) => (
                            <Chip key={index} label={type} size="small" sx={{ backgroundColor: '#0ab067', color: 'white', fontFamily: 'Roboto, sans-serif' }} />
                        ))}
                    </Stack>
                );
            },
        },
        { field: 'address', headerName: 'Địa chỉ', flex: 2, minWidth: 200, editable: false, filterable: false },
        { field: 'email', headerName: 'Email', flex: 1.5, minWidth: 180, editable: false, filterable: false },
        { field: 'phone', headerName: 'Số điện thoại', flex: 1, minWidth: 120, editable: false, filterable: false },
        {
            field: 'actions',
            headerName: 'Hành động',
            minWidth: 30,
            flex: 0.5,
            renderCell: (params) => (
                <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                    <Tooltip content="Chỉnh sửa">
                        <button
                            onClick={() => {
                                setSelectedPartner(params.row); // ✅ Gán đối tác được chọn
                                setShowEditPopup(true);
                            }}
                            className="p-1.5 rounded-full bg-blue-500 hover:bg-blue-600 text-white"
                        >
                            <BiSolidEdit className="h-5 w-5" />
                        </button>
                    </Tooltip>
                </div>
            ),
        }
    ];

    const data = partners.map((partner) => {
        return {
            id: partner.partnerId,  // DataGrid cần trường 'id'
            partnerName: partner.partnerName,
            partnerType: Array.isArray(partner.partnerTypes) && partner.partnerTypes.length > 0
                ? partner.partnerTypes.map(item => item.partnerType?.typeName || 'Không xác định')
                : [], // Đảm bảo dữ liệu là mảng

            partnerCode: Array.isArray(partner.partnerTypes) && partner.partnerTypes.length > 0
                ? partner.partnerTypes.map(item => item.partnerCode || 'Không có mã')
                : [], // Đảm bảo dữ liệu là mảng
            address: partner.address,
            email: partner.email,
            phone: partner.phone,
        };
    });
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
                        <CreatePartnerModal
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
                    <Table data={data} columnsConfig={columnsConfig} enableSelection={false} />
                    {showEditPopup && selectedPartner && (
                        <EditPartnerModal
                            partner={selectedPartner} // ✅ Truyền đối tác vào modal
                            onClose={() => setShowEditPopup(false)}
                            onSuccess={fetchPaginatedPartners}
                        />
                    )}
                    {/* Phần phân trang mới sử dụng ReactPaginate */}
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