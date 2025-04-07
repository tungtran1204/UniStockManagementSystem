import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ReactPaginate from "react-paginate";
import { Card, CardBody, Typography } from "@material-tailwind/react";
import {
    Button,
    MenuItem,
    Menu,
    Popover,
    TextField,
    Checkbox,
    ListItemText,
    IconButton,
} from '@mui/material';
import { FaAngleDown } from "react-icons/fa";
import ClearIcon from '@mui/icons-material/Clear';
import { PiLessThanOrEqualBold, PiGreaterThanOrEqualBold } from "react-icons/pi";
import { ArrowRightIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";
import PageHeader from '@/components/PageHeader';
import TableSearch from '@/components/TableSearch';
import Table from "@/components/Table";
import DateFilterButton from "@/components/DateFilterButton";
import dayjs from "dayjs";
import "dayjs/locale/vi"; // Import Tiếng Việt

import { getInventoryReportPaginated } from "./reportService";
import { getWarehouseList } from "../warehouse/warehouseService";

const InventoryReportPage = () => {
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [searchTerm, setSearchTerm] = useState("");
    const navigate = useNavigate();
    const [quantityFilters, setQuantityFilters] = useState([
        { field: "itemRealQuantity", type: "range", min: null, max: null, id: Date.now() }
    ]);
    const [quantityAnchorEl, setQuantityAnchorEl] = useState(null);
    const [selectedWarehouses, setSelectedWarehouses] = useState([]);
    const [warehouseAnchorEl, setWarehouseAnchorEl] = useState(null);

    const [reportData, setReportData] = useState([]);
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);

    const [warehouseList, setWarehouses] = useState([]);

    useEffect(() => {
        fetchReport(currentPage, pageSize);
    }, [currentPage, pageSize]);

    const fetchReport = (page, size) => {
        getInventoryReportPaginated(page, size)
            .then(res => {
                const content = res.data.content.map((item, index) => ({
                    id: index + 1 + page * size,
                    stt: index + 1 + page * size,
                    itemCode: item.itemCode,
                    itemName: item.itemName,
                    itemStatus: item.isActive,
                    itemUnit: item.unitName,
                    itemRealQuantity: item.totalQuantity,
                    itemReservedQuantity: item.reservedQuantity,
                    itemAvailableQuantity: item.availableQuantity,
                    inWarehouse: item.warehouseName,
                    image: ""
                }));
                setReportData(content);
                setTotalPages(res.data.totalPages);
                setTotalElements(res.data.totalElements);
            })
            .catch(() => {
                setReportData([]);
                setTotalPages(1);
                setTotalElements(0);
            });
    };

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

    const handleAddQuantityFilter = () => {
        setQuantityFilters(prev => [
            ...prev,
            {
                id: Date.now() + Math.random(),
                field: "itemRealQuantity",
                type: "range",
                min: null,
                max: null,
            },
        ]);
    };

    useEffect(() => {
        const fetchInitData = async () => {
            try {
                const response = await getWarehouseList();
                const activeWarehouses = (response?.data || response || []).filter(wh => wh.isActive);
                setWarehouses(activeWarehouses);
            } catch (err) {
                console.error("Lỗi khi lấy dữ liệu kho:", err);
            }
        };

        fetchInitData();
    }, []);


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
            minWidth: 350,
            editable: false,
            filterable: false,
            //dùng renderCell để cấu hình data
        },
        {
            field: 'itemStatus',
            headerName: 'Trạng thái',
            flex: 1.5,
            minWidth: 150,
            editable: false,
            filterable: false,
            renderCell: (params) => {
                const isActive = params.value === true;
                const label = isActive ? 'Đang hoạt động' : 'Ngừng hoạt động';
                const className = isActive
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800';

                return (
                    <div
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}
                    >
                        {label}
                    </div>
                );
            },
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
            field: 'itemRealQuantity',
            headerName: 'Tồn kho thực tế',
            flex: 1,
            minWidth: 135,
            editable: false,
            filterable: false,
            //dùng renderCell để cấu hình data
        },
        {
            field: 'itemReservedQuantity',
            headerName: 'SL đang giữ chỗ',
            flex: 1,
            minWidth: 135,
            editable: false,
            filterable: false,
            //dùng renderCell để cấu hình data
        },
        {
            field: 'itemAvailableQuantity',
            headerName: 'SL có sẵn',
            flex: 1,
            minWidth: 135,
            editable: false,
            filterable: false,
            //dùng renderCell để cấu hình data
        },
        {
            field: 'inWarehouse',
            headerName: 'Lưu kho',
            flex: 1,
            minWidth: 150,
            editable: false,
            filterable: false,
            //dùng renderCell để cấu hình data
        },
    ];

    const data = reportData;


    const filteredData = data.filter((item) => {
        const matchesSearch =
            item.itemCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.itemName.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesAllQuantityFilters = quantityFilters.every(filter => {
            const value = item[filter.field];
            if (filter.type === "lt") return filter.max === null || value <= filter.max;
            if (filter.type === "gt") return filter.min === null || value >= filter.min;
            if (filter.type === "eq") return filter.min === null || value === filter.min;
            return (
                (filter.min === null || value >= filter.min) &&
                (filter.max === null || value <= filter.max)
            );
        });

        const matchesWarehouse =
            selectedWarehouses.length === 0 || selectedWarehouses.some(w => w.warehouseName === item.inWarehouse);

        return matchesSearch && matchesWarehouse && matchesAllQuantityFilters;
    });



    return (
        <div className="mb-8 flex flex-col gap-12" style={{ height: 'calc(100vh-100px)' }}>
            <Card className="bg-gray-50 p-7 rounded-none shadow-none">
                <CardBody className="pb-2 bg-white rounded-xl">
                    <PageHeader
                        title="Báo cáo tồn kho"
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

                        {/* Filter by quantity */}
                        <Button
                            onClick={(e) => setQuantityAnchorEl(e.currentTarget)}
                            variant={quantityFilters.length > 0 ? "outlined" : "contained"}
                            sx={{
                                ...(quantityFilters.length > 0
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
                            {quantityFilters.length > 0 ? (
                                <span className="flex items-center gap-[4px]">
                                    {
                                        (() => {
                                            const f = quantityFilters[0];
                                            const label = f.field === "itemRealQuantity"
                                                ? "Tồn kho"
                                                : f.field === "itemReservedQuantity"
                                                    ? "Đặt chỗ"
                                                    : "Đặt mua";

                                            let conditionContent = null;
                                            if (f.type === "lt") {
                                                conditionContent = (
                                                    <span className="font-medium flex items-center gap-1">
                                                        <PiLessThanOrEqualBold className="text-[16px]" /> {f.max}
                                                    </span>
                                                );
                                            } else if (f.type === "gt") {
                                                conditionContent = (
                                                    <span className="font-medium flex items-center gap-1">
                                                        <PiGreaterThanOrEqualBold className="text-[16px]" /> {f.min}
                                                    </span>
                                                );
                                            } else if (f.type === "eq") {
                                                conditionContent = (
                                                    <span className="font-medium flex items-center gap-1">
                                                        = {f.min}
                                                    </span>
                                                );
                                            } else {
                                                conditionContent = (
                                                    <span className="font-medium">
                                                        {f.min ?? "?"} - {f.max ?? "?"}
                                                    </span>
                                                );
                                            }

                                            return (
                                                <>
                                                    {label}: {conditionContent}
                                                    {quantityFilters.length > 1 && (
                                                        <span className="text-xs bg-[#089456] text-white p-1 rounded-xl font-thin">
                                                            +{quantityFilters.length - 1}
                                                        </span>
                                                    )}
                                                </>
                                            );
                                        })()
                                    }
                                </span>
                            ) : (
                                <span className="flex items-center gap-[5px]">
                                    Số lượng
                                    <FaAngleDown className="h-4 w-4" />
                                </span>
                            )}
                        </Button>

                        <Popover
                            open={Boolean(quantityAnchorEl)}
                            anchorEl={quantityAnchorEl}
                            onClose={() => setQuantityAnchorEl(null)}
                            anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                        >
                            <div className="p-4 flex flex-col gap-4 w-fit">
                                {quantityFilters.map((filter, index) => (
                                    <div key={filter.id} className="flex gap-4">
                                        {/* Chọn loại field */}
                                        <TextField
                                            select
                                            hiddenLabel
                                            color="success"
                                            value={filter.field}
                                            onChange={(e) => {
                                                const updated = [...quantityFilters];
                                                updated[index].field = e.target.value;
                                                setQuantityFilters(updated);
                                            }}
                                            size="small"
                                            sx={{ width: "fit-content", minWidth: 160 }}
                                        >
                                            <MenuItem value="itemRealQuantity">Tồn kho thực tế</MenuItem>
                                            <MenuItem value="itemReservedQuantity">Đang đặt chỗ</MenuItem>
                                            <MenuItem value="itemAvailableQuantity">Đang có sẵn</MenuItem>
                                        </TextField>

                                        {/* Loại lọc */}
                                        <TextField
                                            select
                                            color="success"
                                            hiddenLabel
                                            value={filter.type}
                                            onChange={(e) => {
                                                const updated = [...quantityFilters];
                                                updated[index].type = e.target.value;
                                                updated[index].min = null;
                                                updated[index].max = null;
                                                setQuantityFilters(updated);
                                            }}
                                            size="small"
                                            sx={{ width: "fit-content", minWidth: 100 }}
                                        >
                                            <MenuItem value="lt">
                                                <span className="flex items-center gap-2">
                                                    <PiLessThanOrEqualBold></PiLessThanOrEqualBold>
                                                    (dưới)
                                                </span>
                                            </MenuItem>
                                            <MenuItem value="gt">
                                                <span className="flex items-center gap-2">
                                                    <PiGreaterThanOrEqualBold></PiGreaterThanOrEqualBold>
                                                    (trên)
                                                </span>
                                            </MenuItem>
                                            <MenuItem value="eq">= (bằng)</MenuItem>
                                            <MenuItem value="range">khoảng</MenuItem>
                                        </TextField>

                                        {/* Input tương ứng */}
                                        {filter.type === "lt" && (
                                            <TextField
                                                hiddenLabel
                                                type="number"
                                                size="small"
                                                color="success"
                                                sx={{ width: "100px" }}
                                                value={filter.max ?? ""}
                                                onChange={(e) => {
                                                    const updated = [...quantityFilters];
                                                    updated[index].max = e.target.value === "" ? null : Number(e.target.value);
                                                    setQuantityFilters(updated);
                                                }}
                                            />
                                        )}

                                        {filter.type === "gt" && (
                                            <TextField
                                                hiddenLabel
                                                type="number"
                                                size="small"
                                                color="success"
                                                sx={{ width: "100px" }}
                                                value={filter.min ?? ""}
                                                onChange={(e) => {
                                                    const updated = [...quantityFilters];
                                                    updated[index].min = e.target.value === "" ? null : Number(e.target.value);
                                                    setQuantityFilters(updated);
                                                }}
                                            />
                                        )}

                                        {filter.type === "eq" && (
                                            <TextField
                                                hiddenLabel
                                                type="number"
                                                size="small"
                                                color="success"
                                                sx={{ width: "100px" }}
                                                value={filter.min ?? ""}
                                                onChange={(e) => {
                                                    const updated = [...quantityFilters];
                                                    updated[index].min = e.target.value === "" ? null : Number(e.target.value);
                                                    setQuantityFilters(updated);
                                                }}
                                            />
                                        )}

                                        {filter.type === "range" && (
                                            <div className="flex gap-3">
                                                <TextField
                                                    hiddenLabel
                                                    placeholder="Từ"
                                                    type="number"
                                                    size="small"
                                                    color="success"
                                                    sx={{ width: "100px" }}
                                                    value={filter.min ?? ""}
                                                    onChange={(e) => {
                                                        const updated = [...quantityFilters];
                                                        updated[index].min = e.target.value === "" ? null : Number(e.target.value);
                                                        setQuantityFilters(updated);
                                                    }}
                                                />
                                                <div className="flex items-center">-</div>
                                                <TextField
                                                    hiddenLabel
                                                    placeholder="Đến"
                                                    type="number"
                                                    size="small"
                                                    color="success"
                                                    sx={{ width: "100px" }}
                                                    value={filter.max ?? ""}
                                                    onChange={(e) => {
                                                        const updated = [...quantityFilters];
                                                        updated[index].max = e.target.value === "" ? null : Number(e.target.value);
                                                        setQuantityFilters(updated);
                                                    }}
                                                />
                                            </div>
                                        )}
                                        {/* Nút xoá điều kiện */}
                                        <IconButton
                                            onClick={() => {
                                                setQuantityFilters(filters => filters.filter(f => f.id !== filter.id));
                                            }}
                                        >
                                            <ClearIcon />
                                        </IconButton>
                                    </div>
                                ))}
                                <div className="flex justify-between">
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        className="w-fit"
                                        onClick={handleAddQuantityFilter}
                                    >
                                        + Thêm điều kiện
                                    </Button>
                                    {quantityFilters.length > 0 && (
                                        <Button
                                            variant="text"
                                            size="small"
                                            className="w-fit"
                                            onClick={() => {
                                                setQuantityFilters([]);
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
                                            Xoá lọc
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </Popover>

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
                                    {selectedWarehouses[0]?.warehouseName}
                                    {selectedWarehouses.length > 1 && (
                                        <span className="text-xs bg-[#089456] text-white p-1 rounded-xl font-thin">+{selectedWarehouses.length - 1}</span>
                                    )}
                                </span>
                            ) : (
                                <span className="flex items-center gap-[5px]">
                                    Lưu kho
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
                                <MenuItem key={wh.warehouseId}
                                    onClick={() => {
                                        const updated = selectedWarehouses.includes(wh)
                                            ? selectedWarehouses.filter(w => w !== wh)
                                            : [...selectedWarehouses, wh];
                                        setSelectedWarehouses(updated);
                                    }}
                                    sx={{ paddingLeft: "7px", minWidth: "150px" }}
                                >
                                    <Checkbox color="success" size="small" checked={selectedWarehouses.some(w => w.warehouseId === wh.warehouseId)} />
                                    <ListItemText primary={wh.warehouseName} />
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
                        data={filteredData}
                        columnsConfig={columnsConfig}
                        enableSelection={false}
                        headerHeight={60}
                    />


                    {/* Pagination */}
                    <div className="flex items-center justify-between border-t border-blue-gray-50 py-4">
                        <div className="flex items-center gap-2">
                            <Typography variant="small" color="blue-gray" className="font-normal">
                                Trang {currentPage + 1} / {totalPages || 1} • {totalElements || 0} bản ghi
                            </Typography>
                        </div>
                        <ReactPaginate
                            previousLabel={<ArrowLeftIcon strokeWidth={2} className="h-4 w-4" />}
                            nextLabel={<ArrowRightIcon strokeWidth={2} className="h-4 w-4" />}
                            breakLabel="..."
                            pageCount={totalPages || 1}
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

export default InventoryReportPage;