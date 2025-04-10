import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ReactPaginate from "react-paginate";
import { Card, CardBody, Typography } from "@material-tailwind/react";
import { ArrowRightIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";
import PageHeader from '@/components/PageHeader';
import TableSearch from '@/components/TableSearch';
import Table from "@/components/Table";
import QuantityFilterButton from "@/components/QuantityFilterButton";
import DateFilterButton from "@/components/DateFilterButton";
import dayjs from "dayjs";
import "dayjs/locale/vi"; // Import Tiếng Việt

const StockMovementReportPage = () => {
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(5);
    const [searchTerm, setSearchTerm] = useState("");
    const navigate = useNavigate();
    const [quantityAnchorEl, setQuantityAnchorEl] = useState(null);
    const [quantityFilters, setQuantityFilters] = useState({
        beginQuantity: { label: "Tồn đầu kỳ", type: "range", min: null, max: null },
        inQuantity: { label: "Nhập trong kỳ", type: "range", min: null, max: null },
        outQuantity: { label: "Xuất trong kỳ", type: "range", min: null, max: null },
        endQuantity: { label: "Tồn cuối kỳ", type: "range", min: null, max: null },
    });
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);

    // // Fetch data on component mount and when page or size changes
    // useEffect(() => {
    //   fetchPaginatedReceiptNotes(currentPage, pageSize);
    // }, [currentPage, pageSize]);

    useEffect(() => {
        const now = dayjs();
        setStartDate(now.startOf("month").format("YYYY-MM-DD"));
        setEndDate(now.endOf("month").format("YYYY-MM-DD"));
    }, []);

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

    const columnsConfig = [
        { field: 'stt', headerName: 'STT', flex: 1, minWidth: 50, editable: false, filterable: false },
        {
            field: 'itemCode',
            headerName: 'Mã hàng',
            flex: 1.5,
            minWidth: 150,
            editable: false,
            filterable: false,
            //dùng renderCell để cấu hình data
        },
        {
            field: 'itemName',
            headerName: 'Tên hàng',
            flex: 2,
            minWidth: 500,
            editable: false,
            filterable: false,
            //dùng renderCell để cấu hình data
        },
        {
            field: 'beginQuantity',
            headerName: 'Số lượng tồn đầu kỳ',
            flex: 1,
            minWidth: 135,
            editable: false,
            filterable: false,
            //dùng renderCell để cấu hình data
        },
        {
            field: 'inQuantity',
            headerName: 'Số lượng nhập trong kỳ',
            flex: 1,
            minWidth: 135,
            editable: false,
            filterable: false,
            //dùng renderCell để cấu hình data
        },
        {
            field: 'outQuantity',
            headerName: 'Số lượng xuất trong kỳ',
            flex: 1,
            minWidth: 135,
            editable: false,
            filterable: false,
            //dùng renderCell để cấu hình data
        },
        {
            field: 'endQuantity',
            headerName: 'Số lượng tồn cuối kỳ',
            flex: 1,
            minWidth: 135,
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
            itemCode: "VT001",
            itemName: "Khung xe điện",
            beginQuantity: 100,
            inQuantity: 50,
            outQuantity: 40,
            endQuantity: 110,
        },
        {
            id: 2,
            stt: 2,
            itemCode: "VT002",
            itemName: "Bánh xe trước",
            beginQuantity: 80,
            inQuantity: 30,
            outQuantity: 25,
            endQuantity: 85,
        },
        {
            id: 3,
            stt: 3,
            itemCode: "VT003",
            itemName: "Bộ điều tốc",
            beginQuantity: 60,
            inQuantity: 40,
            outQuantity: 50,
            endQuantity: 50,
        },
        {
            id: 4,
            stt: 4,
            itemCode: "VT004",
            itemName: "Bình ắc quy",
            beginQuantity: 120,
            inQuantity: 70,
            outQuantity: 90,
            endQuantity: 100,
        },
        {
            id: 5,
            stt: 5,
            itemCode: "VT005",
            itemName: "Tay lái",
            beginQuantity: 55,
            inQuantity: 25,
            outQuantity: 30,
            endQuantity: 50,
        },
        {
            id: 6,
            stt: 6,
            itemCode: "VT006",
            itemName: "Đèn pha LED",
            beginQuantity: 70,
            inQuantity: 20,
            outQuantity: 15,
            endQuantity: 75,
        },
        {
            id: 7,
            stt: 7,
            itemCode: "VT007",
            itemName: "Yên xe",
            beginQuantity: 40,
            inQuantity: 10,
            outQuantity: 20,
            endQuantity: 30,
        },
        {
            id: 8,
            stt: 8,
            itemCode: "VT008",
            itemName: "Đồng hồ tốc độ",
            beginQuantity: 90,
            inQuantity: 35,
            outQuantity: 30,
            endQuantity: 95,
        },
        {
            id: 9,
            stt: 9,
            itemCode: "VT009",
            itemName: "Còi điện",
            beginQuantity: 45,
            inQuantity: 15,
            outQuantity: 10,
            endQuantity: 50,
        },
        {
            id: 10,
            stt: 10,
            itemCode: "VT010",
            itemName: "Chân chống",
            beginQuantity: 60,
            inQuantity: 20,
            outQuantity: 10,
            endQuantity: 70,
        },
    ]

    const filteredData = data.filter((item) => {
        const matchesSearch =
            item.itemCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.itemName.toLowerCase().includes(searchTerm.toLowerCase());

        const issueDate = dayjs(item.issueDate);
        const matchesStart = startDate ? issueDate.isAfter(dayjs(startDate).startOf("day")) || issueDate.isSame(dayjs(startDate).startOf("day")) : true;
        const matchesEnd = endDate ? issueDate.isBefore(dayjs(endDate).endOf("day")) || issueDate.isSame(dayjs(endDate).endOf("day")) : true;

        const matchesAllQuantities = Object.entries(quantityFilters).every(([key, f]) => {
            const value = item[key];
            if (f.type === "lt") return f.max == null || value <= f.max;
            if (f.type === "gt") return f.min == null || value >= f.min;
            if (f.type === "eq") return f.min == null || value === f.min;
            return (f.min == null || value >= f.min) && (f.max == null || value <= f.max);
        });

        return matchesSearch && matchesStart && matchesEnd && matchesAllQuantities;
    });

    const pageCount = Math.ceil(filteredData.length / pageSize);
    const paginatedData = filteredData.slice(currentPage * pageSize, (currentPage + 1) * pageSize);

    return (
        <div className="mb-8 flex flex-col gap-12" style={{ height: 'calc(100vh-100px)' }}>
            <Card className="bg-gray-50 p-7 rounded-none shadow-none">
                <CardBody className="pb-2 bg-white rounded-xl">
                    <PageHeader
                        title="Báo cáo xuất nhập tồn"
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

                        {/* Filter by date */}
                        <DateFilterButton
                            startDate={startDate}
                            endDate={endDate}
                            setStartDate={setStartDate}
                            setEndDate={setEndDate}
                            setCurrentPage={setCurrentPage}
                        />

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

export default StockMovementReportPage;