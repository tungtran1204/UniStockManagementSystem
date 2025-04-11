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
import {
    Button,
    MenuItem,
    Menu,
    Checkbox,
    ListItemText,
} from '@mui/material';
import { FaAngleDown } from "react-icons/fa";
import { getStockMovementReportPaginated } from "./reportService";

const StockMovementReportPage = () => {
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(20);
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
    const [itemTypeAnchorEl, setItemTypeAnchorEl] = useState(null);
    const [selectedItemType, setSelectedItemType] = useState(""); // "", "PRODUCT", "MATERIAL"
    const [movementAnchorEl, setMovementAnchorEl] = useState(null);
    const [hasMovementOnly, setHasMovementOnly] = useState(null);

    const [reportData, setReportData] = useState([]);
    const [totalElements, setTotalElements] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    const fetchStockMovementReport = async (page = currentPage, size = pageSize) => {
        try {
            const res = await getStockMovementReportPaginated({
                page,
                size,
                search: searchTerm,
                startDate,
                endDate,
                itemType: selectedItemType,
                hasMovementOnly,
                quantityFilters,
            });

            const rawData = res.data;

            const dataWithSTT = rawData.content.map((item, index) => ({
                ...item,
                stt: page * size + index + 1,
            }));

            setReportData(dataWithSTT);
            setTotalElements(rawData.totalElements); 
            setTotalPages(rawData.totalPages);  
        } catch (error) {
            console.error("Error fetching stock movement report:", error);
        }
    };

    useEffect(() => {
        fetchStockMovementReport(currentPage, pageSize);
    }, [currentPage, pageSize, selectedItemType, hasMovementOnly, startDate, endDate, quantityFilters]);

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
        setCurrentPage(0);
        fetchStockMovementReport(0, pageSize);
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
            field: 'itemUnit',
            headerName: 'Đơn vị',
            flex: 1,
            minWidth: 120,
            editable: false,
            filterable: false,
            //dùng renderCell để cấu hình data
        },
        {
            field: 'beginQuantity',
            headerName: 'SL tồn đầu kỳ',
            flex: 1,
            minWidth: 135,
            editable: false,
            filterable: false,
            //dùng renderCell để cấu hình data
        },
        {
            field: 'inQuantity',
            headerName: 'SL nhập trong kỳ',
            flex: 1,
            minWidth: 135,
            editable: false,
            filterable: false,
            //dùng renderCell để cấu hình data
        },
        {
            field: 'outQuantity',
            headerName: 'SL xuất trong kỳ',
            flex: 1,
            minWidth: 135,
            editable: false,
            filterable: false,
            //dùng renderCell để cấu hình data
        },
        {
            field: 'endQuantity',
            headerName: 'SL tồn cuối kỳ',
            flex: 1,
            minWidth: 135,
            editable: false,
            filterable: false,
            //dùng renderCell để cấu hình data
        },
    ];

    const filteredData = reportData.filter((item) => {
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

                        {/* Filter by good category */}
                        <Button
                            onClick={(e) => setItemTypeAnchorEl(e.currentTarget)}
                            size="sm"
                            variant={selectedItemType ? "outlined" : "contained"}
                            sx={{
                                ...(selectedItemType
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
                            <span className="flex items-center gap-[5px]">
                                {selectedItemType === "PRODUCT"
                                    ? "Sản phẩm"
                                    : selectedItemType === "MATERIAL"
                                        ? "Vật tư"
                                        : "Loại hàng hóa"}
                                <FaAngleDown className="h-4 w-4" />
                            </span>
                        </Button>

                        <Menu
                            anchorEl={itemTypeAnchorEl}
                            open={Boolean(itemTypeAnchorEl)}
                            onClose={() => setItemTypeAnchorEl(null)}
                            anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                        >
                            {[
                                { label: "Tất cả", value: "" },
                                { label: "Sản phẩm", value: "PRODUCT" },
                                { label: "Vật tư", value: "MATERIAL" },
                            ].map((option) => (
                                <MenuItem
                                    key={option.value}
                                    onClick={() => {
                                        setSelectedItemType(option.value);
                                        setItemTypeAnchorEl(null);
                                        setCurrentPage(0);
                                    }}
                                    sx={{ paddingLeft: "7px", minWidth: "150px" }}
                                >
                                    <Checkbox
                                        color="success"
                                        size="small"
                                        checked={selectedItemType === option.value}
                                    />
                                    <ListItemText primary={option.label} />
                                </MenuItem>
                            ))}

                            {selectedItemType && (
                                <div className="flex justify-end">
                                    <Button
                                        variant="text"
                                        size="medium"
                                        onClick={() => {
                                            setSelectedItemType("");
                                            setCurrentPage(0);
                                            setItemTypeAnchorEl(null);
                                        }}
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

                        {/* Filter by movement activity */}
                        <Button
                            onClick={(e) => setMovementAnchorEl(e.currentTarget)}
                            size="sm"
                            variant={hasMovementOnly !== null ? "outlined" : "contained"}
                            sx={{
                                ...(hasMovementOnly
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
                            <span className="flex items-center gap-[5px]">
                                {hasMovementOnly === true
                                    ? "Chỉ hàng có biến động"
                                    : hasMovementOnly === false
                                        ? "Tất cả hàng hóa"
                                        : "Lọc biến động"}
                                <FaAngleDown className="h-4 w-4" />
                            </span>
                        </Button>

                        <Menu
                            anchorEl={movementAnchorEl}
                            open={Boolean(movementAnchorEl)}
                            onClose={() => setMovementAnchorEl(null)}
                            anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                        >
                            {[
                                { label: "Tất cả hàng hóa", value: false },
                                { label: "Chỉ hàng có biến động", value: true },
                            ].map((option) => (
                                <MenuItem
                                    key={option.label}
                                    onClick={() => {
                                        setHasMovementOnly(option.value);
                                        setMovementAnchorEl(null);
                                        setCurrentPage(0);
                                    }}
                                    sx={{ paddingLeft: "7px", minWidth: "200px" }}
                                >
                                    <Checkbox
                                        color="success"
                                        size="small"
                                        checked={hasMovementOnly === option.value}
                                    />
                                    <ListItemText primary={option.label} />
                                </MenuItem>
                            ))}

                            {hasMovementOnly !== null && (
                                <div className="flex justify-end">
                                    <Button
                                        variant="text"
                                        size="medium"
                                        onClick={() => {
                                            setHasMovementOnly(null);
                                            setCurrentPage(0);
                                            setMovementAnchorEl(null);
                                        }}
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
                        data={reportData}
                        columnsConfig={columnsConfig}
                        enableSelection={false}
                    />

                    {/* Pagination */}
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