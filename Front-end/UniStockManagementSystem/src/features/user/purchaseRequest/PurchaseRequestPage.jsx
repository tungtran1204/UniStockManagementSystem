import React, { useState, useEffect } from "react";
import {
    Card,
    CardHeader,
    CardBody,
    Typography,
    Button,
    Tooltip,
    Input,
} from "@material-tailwind/react";
import { BiSolidEdit, BiCartAdd } from "react-icons/bi";
import ReactPaginate from "react-paginate";
import { ArrowRightIcon, ArrowLeftIcon, KeyIcon } from "@heroicons/react/24/outline";
import dayjs from "dayjs";
import usePurchaseRequest from "./usePurchaseRequest";
import usePurchaseOrder from "../purchaseOrder/usePurchaseOrder";
import { useNavigate } from "react-router-dom";
import PageHeader from '@/components/PageHeader';
import TableSearch from '@/components/TableSearch';
import Table from "@/components/Table";
import { getPurchaseRequestById } from "./PurchaseRequestService";

const PurchaseRequestPage = () => {
    const {
        purchaseRequests,
        totalPages,
        totalElements,
        fetchPurchaseRequests,
        getNextCode,
    } = usePurchaseRequest();

    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const { createOrdersFromRequest } = usePurchaseOrder();

    const navigate = useNavigate();

    useEffect(() => {
        fetchPurchaseRequests(currentPage, pageSize, searchTerm);
    }, [currentPage, pageSize, searchTerm]);

    const handlePageChange = (selectedItem) => {
        setCurrentPage(selectedItem.selected);
    };

    const handleAddRequest = async () => {
        try {
            const code = await getNextCode();
            navigate("/user/purchase-request/add", { state: { nextCode: code } });
        } catch (error) {
            console.error("Lỗi khi lấy mã tiếp theo:", error);
            alert("Có lỗi xảy ra khi tạo mã yêu cầu mới");
        }
    };

    const handleSearch = () => {
        fetchPurchaseRequests(0, pageSize, searchTerm);
        setCurrentPage(0);
    };

    const handleCreatePurchaseOrder = async (requestId) => {
        const confirm = window.confirm("Bạn có muốn tạo đơn mua hàng cho yêu cầu này không?");
        if (!confirm) return;

        try {
            const selectedRequest = await getPurchaseRequestById(requestId);
            console.log("📦 Chi tiết yêu cầu mua vật tư:", selectedRequest);
            if (!selectedRequest || !selectedRequest.purchaseRequestDetails) {
                throw new Error("Yêu cầu mua không có vật tư nào");
            }

            const payload = {
                items: selectedRequest.purchaseRequestDetails.map((item) => ({
                    materialId: item.materialId,
                    materialCode: item.materialCode,
                    materialName: item.materialName,
                    supplierId: item.partnerId,
                    supplierName: item.partnerName,
                    unit: item.unitName,
                    quantity: item.quantity,
                })),
            };


            const response = await createOrdersFromRequest(payload);
            alert(`Đã tạo ${response.orders.length} đơn hàng thành công.`);
            navigate("/user/purchaseOrder");
        } catch (error) {
            console.error("Lỗi tạo đơn hàng:", error);
            alert("Không thể tạo đơn mua hàng. Vui lòng thử lại.");
        }
    };

    const columnsConfig = [
        { field: 'index', headerName: 'STT', flex: 0.5, minWidth: 50, editable: false },
        { field: 'purchaseRequestCode', headerName: 'Mã yêu cầu', flex: 1.5, minWidth: 150, editable: false },
        { field: 'purchaseOrderCode', headerName: 'Mã đơn hàng', flex: 1.5, minWidth: 150, editable: false, renderCell: (params) => params.value || "Chưa có" },
        {
            field: 'createdDate',
            headerName: 'Ngày tạo yêu cầu',
            flex: 1.5,
            minWidth: 150,
            editable: false,
            renderCell: (params) => dayjs(params.value).format("DD/MM/YYYY"),
        },
        {
            field: 'status',
            headerName: 'Trạng thái',
            flex: 1.5,
            minWidth: 200,
            renderCell: (params) => (
                <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                    ${params.value === 'Đã duyệt'
                        ? 'bg-green-100 text-green-800'
                        : params.value === 'Từ chối'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                    }`
                }>
                    {params.value}
                </div>
            ),
        },
        {
            field: 'rejectionReason',
            headerName: 'Lý do hủy',
            flex: 2,
            minWidth: 220,
            renderCell: (params) => {
                if (params.row.status !== 'Từ chối') return '';
                if (!params.value) return 'Không có';
                return params.value.startsWith('Khác') ? 'Khác' : params.value;
            },
        },
        {
            field: 'actions',
            headerName: 'Hành động',
            flex: 0.5,
            minWidth: 50,
            renderCell: (params) => (
                <div className="flex gap-2 justify-center items-center w-full">
                    <Tooltip content="Chi tiết">
                        <button
                            className="p-1.5 rounded-full bg-blue-500 hover:bg-blue-600 text-white"
                            onClick={() => navigate(`/user/purchase-request/${params.id}`)}
                        >
                            <BiSolidEdit className="h-5 w-5" />
                        </button>
                    </Tooltip>

                    {/* Nút tạo đơn hàng nếu đã duyệt */}
                    {params.row.status === 'Đã duyệt' && (
                        <Tooltip content="Tạo đơn mua hàng">
                            <button
                                className="p-1.5 rounded-full bg-green-500 hover:bg-green-600 text-white"
                                onClick={() => handleCreatePurchaseOrder(params.row.id)}
                            >
                                <BiCartAdd className="h-5 w-5" />
                            </button>
                        </Tooltip>
                    )}
                </div>
            ),
        },
    ];


    const data = purchaseRequests.map((request, index) => ({
        id: request.id,
        index: (currentPage * pageSize) + index + 1,
        purchaseRequestCode: request.purchaseRequestCode,
        purchaseOrderCode: request.saleOrderCode || "Chưa có",
        createdDate: request.createdDate,
        status: request.status,
        rejectionReason: request.rejectionReason,
    }));

    return (
        <div className="mb-8 flex flex-col gap-12">
            <Card className="bg-gray-50 p-7 rounded-none shadow-none">
                <CardBody className="pb-2 bg-white rounded-xl">
                    <PageHeader
                        title="Danh sách yêu cầu mua vật tư"
                        onAdd={handleAddRequest}
                        addButtonLabel="Thêm yêu cầu"
                        showImport={false}
                        showExport={false}
                    />
                    <div className="py-2 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                            <Typography variant="small" color="blue-gray" className="font-normal whitespace-nowrap">
                                Hiển thị
                            </Typography>
                            <select
                                value={pageSize}
                                onChange={(e) => {
                                    setPageSize(Number(e.target.value));
                                    setCurrentPage(0);
                                }}
                                className="border rounded px-2 py-1"
                            >
                                {[10, 20, 50].map((size) => (
                                    <option key={size} value={size}>
                                        {size}
                                    </option>
                                ))}
                            </select>
                            <Typography variant="small" color="blue-gray" className="font-normal whitespace-nowrap">
                                bản ghi mỗi trang
                            </Typography>
                        </div>
                        <TableSearch
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onSearch={handleSearch}
                            placeholder="Tìm kiếm theo mã đơn hàng hoặc đối tác"
                        />
                    </div>

                    <Table
                        data={data}
                        columnsConfig={columnsConfig}
                        enableSelection={true}
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
        </div>
    );
};

export default PurchaseRequestPage;