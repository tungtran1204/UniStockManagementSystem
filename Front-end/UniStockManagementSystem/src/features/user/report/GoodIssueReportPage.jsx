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
} from '@mui/material';
import { FaAngleDown } from "react-icons/fa";
import { ArrowRightIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";
import PageHeader from '@/components/PageHeader';
import TableSearch from '@/components/TableSearch';
import Table from "@/components/Table";
import DateFilterButton from "@/components/DateFilterButton";
import dayjs from "dayjs";
import "dayjs/locale/vi"; // Import Tiếng Việt


const GoodIssueReportPage = () => {
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [searchTerm, setSearchTerm] = useState("");
    const navigate = useNavigate();
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [categoryAnchorEl, setCategoryAnchorEl] = useState(null);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [selectedWarehouses, setSelectedWarehouses] = useState([]);
    const [warehouseAnchorEl, setWarehouseAnchorEl] = useState(null);


    // // Fetch data on component mount and when page or size changes
    // useEffect(() => {
    //     fetchPaginatedReceiptNotes(currentPage, pageSize);
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

    const categoryList = [
        "Xuất kho sản xuất",
        "Xuất kho bán hàng",
        "Xuất kho gia công",
        "Xuất kho trả lại hàng mua",
    ];

    const warehouseList = [
        "Kho A",
        "Kho B",
        "Kho C",
    ];


    const columnsConfig = [
        { field: 'stt', headerName: 'STT', flex: 1, minWidth: 50, editable: false, filterable: false },
        { field: 'issueCode', headerName: 'Mã phiếu xuất', flex: 1, minWidth: 100, editable: false, filterable: false },
        {
            field: 'issueDate',
            headerName: 'Ngày xuất',
            flex: 1.5,
            minWidth: 150,
            editable: false,
            filterable: false,
            renderCell: (params) => params.value ? dayjs(params.value).format("DD/MM/YYYY") : "",
        },
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
            minWidth: 400,
            editable: false,
            filterable: false,
            //dùng renderCell để cấu hình data
        },
        {
            field: 'itemUnit',
            headerName: 'Đơn vị',
            flex: 1,
            minWidth: 100,
            editable: false,
            filterable: false,
            //dùng renderCell để cấu hình data
        },
        {
            field: 'itemQuantity',
            headerName: 'Số lượng',
            flex: 1,
            minWidth: 100,
            editable: false,
            filterable: false,
            //dùng renderCell để cấu hình data
        },
        {
            field: 'fromWarehouse',
            headerName: 'Kho xuất',
            flex: 1,
            minWidth: 100,
            editable: false,
            filterable: false,
            //dùng renderCell để cấu hình data
        },
        { field: 'category', headerName: 'Phân loại xuất', flex: 2, minWidth: 200, editable: false, filterable: false },
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
            issueCode: "PX001",
            issueDate: "2025-04-01T08:30:00Z",
            itemCode: "VT001",
            itemName: "Khung xe đạp điện",
            itemUnit: "Cái",
            itemQuantity: 10,
            fromWarehouse: "Kho A",
            category: "Xuất kho sản xuất",
        },
        {
            id: 2,
            stt: 2,
            issueCode: "PX002",
            issueDate: "2025-04-02T09:00:00Z",
            itemCode: "VT002",
            itemName: "Ắc quy 12V",
            itemUnit: "Bình",
            itemQuantity: 5,
            fromWarehouse: "Kho B",
            category: "Xuất kho bán hàng",
        },
        {
            id: 3,
            stt: 3,
            issueCode: "PX003",
            issueDate: "2025-04-05T14:45:00Z",
            itemCode: "VT003",
            itemName: "Lốp xe",
            itemUnit: "Chiếc",
            itemQuantity: 20,
            fromWarehouse: "Kho C",
            category: "Xuất kho gia công",
        },
        {
            id: 4,
            stt: 4,
            issueCode: "PX004",
            issueDate: "2025-03-28T10:00:00Z",
            itemCode: "VT004",
            itemName: "Đèn LED",
            itemUnit: "Bóng",
            itemQuantity: 15,
            fromWarehouse: "Kho A",
            category: "Xuất kho sản xuất",
        },
        {
            id: 5,
            stt: 5,
            issueCode: "PX005",
            issueDate: "2025-03-15T08:15:00Z",
            itemCode: "VT005",
            itemName: "Bộ điều khiển",
            itemUnit: "Cái",
            itemQuantity: 7,
            fromWarehouse: "Kho B",
            category: "Xuất kho trả lại hàng mua",
        },
        {
            id: 6,
            stt: 6,
            issueCode: "PX006",
            issueDate: "2025-04-10T13:20:00Z",
            itemCode: "VT006",
            itemName: "Yên xe",
            itemUnit: "Chiếc",
            itemQuantity: 12,
            fromWarehouse: "Kho C",
            category: "Xuất kho bán hàng",
        },
    ]

    const filteredData = data.filter((item) => {
        const matchesSearch =
            item.issueCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.itemCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.itemName.toLowerCase().includes(searchTerm.toLowerCase());

        const issueDate = dayjs(item.issueDate);
        const matchesStart = startDate ? issueDate.isAfter(dayjs(startDate).startOf("day")) || issueDate.isSame(dayjs(startDate).startOf("day")) : true;
        const matchesEnd = endDate ? issueDate.isBefore(dayjs(endDate).endOf("day")) || issueDate.isSame(dayjs(endDate).endOf("day")) : true;

        const matchesCategory =
            selectedCategories.length === 0 || selectedCategories.includes(item.category);

        const matchesWarehouse =
            selectedWarehouses.length === 0 || selectedWarehouses.includes(item.fromWarehouse);

        return matchesSearch && matchesStart && matchesEnd && matchesCategory && matchesWarehouse;
    });

    const pageCount = Math.ceil(filteredData.length / pageSize);
    const paginatedData = filteredData.slice(currentPage * pageSize, (currentPage + 1) * pageSize);

    return (
        <div className="mb-8 flex flex-col gap-12" style={{ height: 'calc(100vh-100px)' }}>
            <Card className="bg-gray-50 p-7 rounded-none shadow-none">
                <CardBody className="pb-2 bg-white rounded-xl">
                    <PageHeader
                        title="Báo cáo xuất kho"
                        showAdd={false}
                        showImport={false}
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
                        {/* Filter by category */}
                        <div>
                            <Button
                                onClick={(e) => setCategoryAnchorEl(e.currentTarget)}
                                size="sm"
                                variant={selectedCategories.length > 0 ? "outlined" : "contained"}
                                sx={{
                                    ...(selectedCategories.length > 0
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
                                {selectedCategories.length > 0 ? (
                                    <span className="flex items-center gap-[5px]">
                                        {selectedCategories[0]}
                                        {selectedCategories.length > 1 && (
                                            <span className="text-xs bg-[#089456] text-white p-1 rounded-xl font-thin">+{selectedCategories.length - 1}</span>
                                        )}
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-[5px]">
                                        Phân loại xuất
                                        <FaAngleDown className="h-4 w-4" />
                                    </span>
                                )}
                            </Button>
                            <Menu
                                anchorEl={categoryAnchorEl}
                                open={Boolean(categoryAnchorEl)}
                                onClose={() => setCategoryAnchorEl(null)}
                                anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                            >
                                {categoryList.map((category) => (
                                    <MenuItem
                                        key={category}
                                        onClick={() => {
                                            const isSelected = selectedCategories.includes(category);
                                            const updated = isSelected
                                                ? selectedCategories.filter(c => c !== category)
                                                : [...selectedCategories, category];
                                            setSelectedCategories(updated);
                                        }}
                                        sx={{ paddingLeft: "7px" }}
                                    >
                                        <Checkbox color="success" checked={selectedCategories.includes(category)} />
                                        <ListItemText primary={category} />
                                    </MenuItem>
                                ))}
                                {selectedCategories.length > 0 && (
                                    <div className="flex px-4 justify-end">
                                        <Button
                                            variant="text"
                                            size="medium"
                                            onClick={() => {
                                                setSelectedCategories([]);
                                                setCurrentPage(0);
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
                        {/* Filter by warehouse */}
                        <Button
                            onClick={(e) => setWarehouseAnchorEl(e.currentTarget)}
                            size="sm"
                            variant={selectedWarehouses.length > 0 ? "outlined" : "contained"}
                            sx={{
                                ...(selectedWarehouses.length > 0
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
                            {selectedWarehouses.length > 0 ? (
                                <span className="flex items-center gap-[5px]">
                                    {selectedWarehouses[0]}
                                    {selectedWarehouses.length > 1 && (
                                        <span className="text-xs bg-[#089456] text-white p-1 rounded-xl font-thin">+{selectedWarehouses.length - 1}</span>
                                    )}
                                </span>
                            ) : (
                                <span className="flex items-center gap-[5px]">
                                    Kho xuất
                                    <FaAngleDown className="h-4 w-4" />
                                </span>
                            )}
                        </Button>

                        <Menu
                            anchorEl={warehouseAnchorEl}
                            open={Boolean(warehouseAnchorEl)}
                            onClose={() => setWarehouseAnchorEl(null)}
                            anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                        >
                            {warehouseList.map((wh) => (
                                <MenuItem
                                    key={wh}
                                    onClick={() => {
                                        const updated = selectedWarehouses.includes(wh)
                                            ? selectedWarehouses.filter(w => w !== wh)
                                            : [...selectedWarehouses, wh];
                                        setSelectedWarehouses(updated);
                                    }}
                                    sx={{ paddingLeft: "7px", minWidth: "150px" }}
                                >
                                    <Checkbox color="success" size="small" checked={selectedWarehouses.includes(wh)} />
                                    <ListItemText primary={wh} />
                                </MenuItem>
                            ))}
                            {selectedWarehouses.length > 0 && (
                                <div className="flex justify-end">
                                    <Button
                                        variant="text"
                                        size="medium"
                                        onClick={() => {
                                            setSelectedWarehouses([]);
                                            setCurrentPage(0);
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
                        data={paginatedData}
                        columnsConfig={columnsConfig}
                        enableSelection={false}
                    />


                    {/* Pagination */}
                    <div className="flex items-center justify-between border-t border-blue-gray-50 py-4">
                        <div className="flex items-center gap-2">
                            <Typography variant="small" color="blue-gray" className="font-normal">
                                {/* Trang {currentPage + 1} / {totalPages || 1} • {totalElements || 0} bản ghi */}
                                Trang {currentPage + 1} / {1} • {0} bản ghi
                            </Typography>
                        </div>
                        <ReactPaginate
                            previousLabel={<ArrowLeftIcon strokeWidth={2} className="h-4 w-4" />}
                            nextLabel={<ArrowRightIcon strokeWidth={2} className="h-4 w-4" />}
                            breakLabel="..."
                            // pageCount={totalPages || 1}
                            pageCount={1}
                            marginPagesDisplayed={2}
                            pageRangeDisplayed={5}
                            onPageChange={handlePageChangeWrapper}
                            containerClassName="flex items-center gap-1"
                            pageClassName="h-8 min-w-[32px] flex items-center justify-center rounded-md text-xs text-gray-700 border border-gray-300 hover:bg-[#0ab067]"
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
        </div >
    );
};

export default GoodIssueReportPage;