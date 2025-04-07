import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ReactPaginate from "react-paginate";
import { Card, CardBody, Typography } from "@material-tailwind/react";
import {
    Button,
    MenuItem,
    Menu,
    Checkbox,
    ListItemText,
    Stack,
    Chip,
} from '@mui/material';
import { FaAngleDown } from "react-icons/fa";
import { ArrowRightIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";
import PageHeader from '@/components/PageHeader';
import TableSearch from '@/components/TableSearch';
import Table from "@/components/Table";
import QuantityFilterButton from "@/components/QuantityFilterButton";
import dayjs from "dayjs";
import "dayjs/locale/vi"; // Import Tiếng Việt

const PartnerReportPage = () => {
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(5);
    const [searchTerm, setSearchTerm] = useState("");
    const navigate = useNavigate();
    const [quantityAnchorEl, setQuantityAnchorEl] = useState(null);
    const [quantityFilters, setQuantityFilters] = useState({
        totalOrder: { label: "Tổng số đơn hàng", type: "range", min: null, max: null },
    });
    const [partnerTypeAnchorEl, setPartnerTypeAnchorEl] = useState(null);
    const [selectedPartnerTypes, setSelectedPartnerTypes] = useState([]);

    // // Fetch data on component mount and when page or size changes
    // useEffect(() => {
    //   fetchPaginatedReceiptNotes(currentPage, pageSize);
    // }, [currentPage, pageSize]);

    // Handle page change
    const handlePageChange = (selectedPage) => {
        setCurrentPage(selectedPage);
    };

    // Handle page change from ReactPaginate
    const handlePageChangeWrapper = (selectedItem) => {
        handlePageChange(selectedItem.selected);
    };

    // Handle search
    const handleSearch = () => {
        // Reset to first page when searching
        setCurrentPage(0);
        fetchPaginatedReceiptNotes(0, pageSize, searchTerm);
    };

    const allPartnerTypes = [
        "Khách hàng",
        "Nhà cung cấp",
        "Gia công"
    ];

    const columnsConfig = [
        { field: 'stt', headerName: 'STT', flex: 1, minWidth: 50, editable: false, filterable: false },
        {
            field: 'partnerCode',
            headerName: 'Mã đối tác',
            flex: 1.5,
            minWidth: 200,
            editable: false,
            filterable: false,
            renderCell: (params) => {
                const partnerTypes = params.row.partnerTypes;

                if (!partnerTypes || partnerTypes.length === 0) return "";

                return (
                    <Stack direction="column">
                        {partnerTypes.map((pt, index) => (
                            <Typography key={index} className="block font-normal text-sm text-black">
                                {pt.partnerCode}
                            </Typography>
                        ))}
                    </Stack>
                );
            },
        },
        {
            field: 'partnerType',
            headerName: 'Nhóm đối tác',
            flex: 1.5,
            minWidth: 200,
            editable: false,
            filterable: false,
            renderCell: (params) => {
                const partnerTypes = params.row.partnerTypes;
                if (!partnerTypes || partnerTypes.length === 0) return null;

                return (
                    <Stack
                        direction="row"
                        useFlexGap
                        sx={{ flexWrap: 'wrap', gap: 0.5, marginTop: '5px', marginBottom: '5px' }}
                    >
                        {partnerTypes.map((pt, index) => {
                            const typeName = pt.partnerType?.typeName;
                            return (
                                <Chip key={index} label={typeName} variant="outlined" color="success" size="small" sx={{ fontFamily: 'Roboto, sans-serif' }} />
                            );
                        })}
                    </Stack>
                );
            },
        },
        {
            field: 'partnerName',
            headerName: 'Tên đối tác',
            flex: 2,
            minWidth: 850,
            editable: false,
            filterable: false,
            //dùng renderCell để cấu hình data
        },
        {
            field: 'totalOrder',
            headerName: 'Tổng số đơn hàng',
            flex: 1,
            minWidth: 200,
            editable: false,
            filterable: false,
            //dùng renderCell để cấu hình data
        },
    ];

    //   const data = receiptNotes.map((receipt) => ({
    //     grnId: receipt.grnId,
    //     receiptCode: receipt.grnCode,
    //     category: receipt.category || 'không có dữ liệu',
    //     createdDate: receipt.receiptDate,
    //     createBy: receipt.createdBy,
    //     reference: {
    //       id: receipt.poId || "N/A",
    //       type: "PURCHASE_ORDER"
    //     }
    //   }));

    const data = [
        {
            id: 1,
            stt: 1,
            partnerName: "Công ty TNHH Linh Kiện An Phát",
            totalOrder: 12,
            partnerTypes: [
                {
                    partnerType: { typeId: 1, typeCode: "KH", typeName: "Khách hàng" },
                    partnerCode: "KH01",
                },
            ],
        },
        {
            id: 2,
            stt: 2,
            partnerName: "Công ty Cổ phần Phụ Tùng Việt Nhật",
            totalOrder: 20,
            partnerTypes: [
                {
                    partnerType: { typeId: 2, typeCode: "NCC", typeName: "Nhà cung cấp" },
                    partnerCode: "NCC01",
                },
            ],
        },
        {
            id: 3,
            stt: 3,
            partnerName: "Xưởng Gia Công Việt Hưng",
            totalOrder: 8,
            partnerTypes: [
                {
                    partnerType: { typeId: 3, typeCode: "GC", typeName: "Gia công" },
                    partnerCode: "GC01",
                },
            ],
        },
        {
            id: 4,
            stt: 4,
            partnerName: "Công ty TNHH Kim Cương Xanh",
            totalOrder: 15,
            partnerTypes: [
                {
                    partnerType: { typeId: 2, typeCode: "NCC", typeName: "Nhà cung cấp" },
                    partnerCode: "NCC02",
                },
                {
                    partnerType: { typeId: 1, typeCode: "KH", typeName: "Khách hàng" },
                    partnerCode: "KH02",
                },
            ],
        },
        {
            id: 5,
            stt: 5,
            partnerName: "Đại lý Xe điện Thành Đạt",
            totalOrder: 6,
            partnerTypes: [
                {
                    partnerType: { typeId: 1, typeCode: "KH", typeName: "Khách hàng" },
                    partnerCode: "KH03",
                },
            ],
        },
        {
            id: 6,
            stt: 6,
            partnerName: "Cửa hàng Xe đạp điện Minh Tâm",
            totalOrder: 10,
            partnerTypes: [
                {
                    partnerType: { typeId: 1, typeCode: "KH", typeName: "Khách hàng" },
                    partnerCode: "KH04",
                },
                {
                    partnerType: { typeId: 3, typeCode: "GC", typeName: "Gia công" },
                    partnerCode: "GC02",
                },
            ],
        },
        {
            id: 7,
            stt: 7,
            partnerName: "Công ty TNHH Ngọc Bảo An",
            totalOrder: 18,
            partnerTypes: [
                {
                    partnerType: { typeId: 2, typeCode: "NCC", typeName: "Nhà cung cấp" },
                    partnerCode: "NCC03",
                },
            ],
        },
        {
            id: 8,
            stt: 8,
            partnerName: "Công ty TNHH Thương mại Hòa Bình",
            totalOrder: 4,
            partnerTypes: [
                {
                    partnerType: { typeId: 1, typeCode: "KH", typeName: "Khách hàng" },
                    partnerCode: "KH05",
                },
            ],
        },
        {
            id: 9,
            stt: 9,
            partnerName: "Công ty TNHH Thiết bị Toàn Cầu",
            totalOrder: 14,
            partnerTypes: [
                {
                    partnerType: { typeId: 2, typeCode: "NCC", typeName: "Nhà cung cấp" },
                    partnerCode: "NCC04",
                },
            ],
        },
        {
            id: 10,
            stt: 10,
            partnerName: "Cửa hàng Xe điện Nova",
            totalOrder: 7,
            partnerTypes: [
                {
                    partnerType: { typeId: 1, typeCode: "KH", typeName: "Khách hàng" },
                    partnerCode: "KH06",
                },
            ],
        },
    ]

    const filteredData = data.filter((item) => {
        const matchesSearch =
            item.partnerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.partnerTypes?.some((pt) =>
                pt.partnerCode.toLowerCase().includes(searchTerm.toLowerCase())
            );

        const matchesPartnerType = (item) => {
            if (selectedPartnerTypes.length === 0) return true;
            return item.partnerTypes?.some((pt) =>
                selectedPartnerTypes.includes(pt.partnerType.typeName)
            );
        };


        const matchesAllQuantities = Object.entries(quantityFilters).every(([key, f]) => {
            const value = item[key];
            if (f.type === "lt") return f.max == null || value <= f.max;
            if (f.type === "gt") return f.min == null || value >= f.min;
            if (f.type === "eq") return f.min == null || value === f.min;
            return (f.min == null || value >= f.min) && (f.max == null || value <= f.max);
        });

        return matchesSearch && matchesAllQuantities && matchesPartnerType(item);
    });

    const pageCount = Math.ceil(filteredData.length / pageSize);
    const paginatedData = filteredData.slice(currentPage * pageSize, (currentPage + 1) * pageSize);

    return (
        <div className="mb-8 flex flex-col gap-12" style={{ height: 'calc(100vh-100px)' }}>
            <Card className="bg-gray-50 p-7 rounded-none shadow-none">
                <CardBody className="pb-2 bg-white rounded-xl">
                    <PageHeader
                        title="Báo cáo theo đơn đặt hàng"
                        showAdd={false}
                    />

                    <div className="mb-3 flex flex-wrap items-center gap-4">
                        {/* Search input */}
                        <div className="w-[250px]">
                            <TableSearch
                                value={searchTerm}
                                onChange={setSearchTerm}
                                onSearch={handleSearch}
                                placeholder="Tìm kiếm"
                            />
                        </div>

                        {/* Filter by partner type */}
                        <Button
                            onClick={(e) => setPartnerTypeAnchorEl(e.currentTarget)}
                            size="sm"
                            variant={selectedPartnerTypes.length > 0 ? "outlined" : "contained"}
                            sx={{
                                ...(selectedPartnerTypes.length > 0
                                    ? {
                                        backgroundColor: "#ffffff",
                                        boxShadow: "none",
                                        borderColor: "#089456",
                                        textTransform: "none",
                                        color: "#089456",
                                        px: 1.5,
                                        "&:hover": {
                                            backgroundColor: "#0894561A",
                                            borderColor: "#089456",
                                            boxShadow: "none",
                                        },
                                    }
                                    : {
                                        backgroundColor: "#0ab067",
                                        boxShadow: "none",
                                        textTransform: "none",
                                        color: "#ffffff",
                                        px: 1.5,
                                        "&:hover": {
                                            backgroundColor: "#089456",
                                            borderColor: "#089456",
                                            boxShadow: "none",
                                        },
                                    }),
                            }}
                        >
                            {selectedPartnerTypes.length > 0 ? (
                                <span className="flex items-center gap-[5px]">
                                    {selectedPartnerTypes[0]}
                                    {selectedPartnerTypes.length > 1 && (
                                        <span className="text-xs bg-[#089456] text-white p-1 rounded-xl font-thin">
                                            +{selectedPartnerTypes.length - 1}
                                        </span>
                                    )}
                                </span>
                            ) : (
                                <span className="flex items-center gap-[5px]">
                                    Nhóm đối tác <FaAngleDown className="h-4 w-4" />
                                </span>
                            )}
                        </Button>

                        <Menu
                            anchorEl={partnerTypeAnchorEl}
                            open={Boolean(partnerTypeAnchorEl)}
                            onClose={() => setPartnerTypeAnchorEl(null)}
                            anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                        >
                            {allPartnerTypes.map((type) => (
                                <MenuItem
                                    key={type}
                                    onClick={() => {
                                        const updated = selectedPartnerTypes.includes(type)
                                            ? selectedPartnerTypes.filter((t) => t !== type)
                                            : [...selectedPartnerTypes, type];
                                        setSelectedPartnerTypes(updated);
                                    }}
                                    sx={{ paddingLeft: "7px", minWidth: "150px" }}
                                >
                                    <Checkbox
                                        color="success"
                                        size="small"
                                        checked={selectedPartnerTypes.includes(type)}
                                    />
                                    <ListItemText primary={type} />
                                </MenuItem>
                            ))}
                            {selectedPartnerTypes.length > 0 && (
                                <div className="flex justify-end">
                                    <Button
                                        variant="text"
                                        size="medium"
                                        onClick={() => setSelectedPartnerTypes([])}
                                        sx={{
                                            color: "#000000DE",
                                            "&:hover": {
                                                backgroundColor: "transparent",
                                                textDecoration: "underline",
                                            },
                                        }}
                                    >
                                        Xóa
                                    </Button>
                                </div>
                            )}
                        </Menu>

                        {/* Filter by quantity */}
                        <QuantityFilterButton
                            anchorEl={quantityAnchorEl}
                            setAnchorEl={setQuantityAnchorEl}
                            filters={quantityFilters}
                            setFilters={setQuantityFilters}
                            buttonLabel="Số lượng"
                        />
                    </div>

                    <div className="py-2 flex items-center justify-between gap-2">
                        {/* Items per page */}
                        <div className="flex items-center gap-2">
                            <Typography variant="small" color="blue-gray" className="font-light">
                                Hiển thị
                            </Typography>
                            <select
                                value={pageSize}
                                onChange={(e) => {
                                    setPageSize(Number(e.target.value));
                                    setCurrentPage(0);
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
                    </div>

                    <Table
                        data={paginatedData}
                        columnsConfig={columnsConfig}
                        enableSelection={false}
                    />


                    {/* Pagination */}
                    <div className="flex items-center justify-between border-t border-blue-gray-50 py-4">
                        <div className="flex items-center gap-2">
                            <Typography variant="small" color="blue-gray" className="font-normal">
                                {/* Trang {currentPage + 1} / {totalPages || 1} • {totalElements || 0} bản ghi */}
                                Trang {currentPage + 1} / {pageCount || 1} • {filteredData.length} bản ghi
                            </Typography>
                        </div>
                        <ReactPaginate
                            previousLabel={<ArrowLeftIcon strokeWidth={2} className="h-4 w-4" />}
                            nextLabel={<ArrowRightIcon strokeWidth={2} className="h-4 w-4" />}
                            breakLabel="..."
                            pageCount={pageCount || 1}
                            marginPagesDisplayed={2}
                            pageRangeDisplayed={5}
                            onPageChange={handlePageChangeWrapper}
                            containerClassName="flex items-center gap-1"
                            pageClassName="h-8 min-w-[32px] flex items-center justify-center rounded-md text-xs text-gray-700 border border-gray-300 hover:bg-[#0ab067] hover:text-white"
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
        </div>
    );
};

export default PartnerReportPage;