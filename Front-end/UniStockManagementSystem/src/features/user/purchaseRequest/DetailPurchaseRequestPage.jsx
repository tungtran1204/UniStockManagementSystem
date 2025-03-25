import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Card,
    CardHeader,
    CardBody,
    Button,
    Input,
    Textarea,
    Typography,
} from "@material-tailwind/react";
import { FaTimes } from "react-icons/fa";
import { ArrowRightIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";
import ReactPaginate from "react-paginate";
import { getPurchaseRequestById } from "./PurchaseRequestService";

const DetailPurchaseRequestPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [purchaseRequest, setPurchaseRequest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize] = useState(5);

    const statusLabels = {
        PENDING: "Chờ xác nhận",
        CONFIRMED: "Xác nhận",
        CANCELLED: "Hủy",
        FINISHED: "Đã hoàn thành",
    };

    useEffect(() => {
        const fetchPurchaseRequest = async () => {
            setLoading(true);
            try {
                const data = await getPurchaseRequestById(id);
                setPurchaseRequest(data);
            } catch (error) {
                const errorMessage = error.response?.data?.message || "Không thể tải thông tin yêu cầu mua vật tư. Vui lòng thử lại!";
                setError(errorMessage);
            } finally {
                setLoading(false);
            }
        };
        fetchPurchaseRequest();
    }, [id]);

    const handleCancel = () => {
        navigate("/user/purchase-request");
    };

    const getPaginatedData = () => {
        if (!purchaseRequest || !purchaseRequest.purchaseRequestDetails) return [];
        const startIndex = currentPage * pageSize;
        const endIndex = startIndex + pageSize;
        return purchaseRequest.purchaseRequestDetails.slice(startIndex, endIndex);
    };

    const handlePageChange = (selectedItem) => {
        setCurrentPage(selectedItem.selected);
    };

    if (loading) {
        return <Typography>Đang tải...</Typography>;
    }

    if (error) {
        return <Typography className="text-red-500">{error}</Typography>;
    }

    if (!purchaseRequest) {
        return <Typography>Không tìm thấy yêu cầu mua vật tư.</Typography>;
    }

    return (
        <div className="mt-12 mb-8 flex flex-col gap-12">
            <Card>
                <CardHeader variant="gradient" color="gray" className="mb-4 p-4">
                    <Typography variant="h6" color="white">
                        Chi tiết yêu cầu mua vật tư {purchaseRequest.purchaseRequestCode}{" "}
                        {purchaseRequest.saleOrderCode ? `cho đơn hàng ${purchaseRequest.saleOrderCode}` : ""}
                    </Typography>
                </CardHeader>
                <CardBody className="px-4 py-4">
                    <div className="grid grid-cols-2 gap-x-12 gap-y-4 mb-6">
                        <div className="flex flex-col gap-4">
                            <div>
                                <Typography variant="small" className="mb-2 font-bold text-gray-900">
                                    Mã phiếu
                                </Typography>
                                <Input
                                    label="Mã phiếu"
                                    value={purchaseRequest.purchaseRequestCode || ""}
                                    disabled
                                    className="text-sm disabled:opacity-100 disabled:font-normal disabled:text-black"
                                />
                            </div>
                            <div>
                                <Typography variant="small" className="mb-2 font-bold text-gray-900">
                                    Diễn giải
                                </Typography>
                                <Textarea
                                    label="Diễn giải"
                                    value={purchaseRequest.notes || "Không có diễn giải"}
                                    disabled
                                    className="text-sm disabled:opacity-100 disabled:font-normal disabled:text-black"
                                />
                            </div>
                        </div>
                        <div className="flex flex-col gap-4">
                            <div>
                                <Typography variant="small" className="mb-2 font-bold text-gray-900">
                                    Ngày lập phiếu
                                </Typography>
                                <Input
                                    type="text"
                                    value={purchaseRequest.createdDate ? new Date(purchaseRequest.createdDate).toLocaleString("vi-VN") : ""}
                                    disabled
                                    className="text-sm disabled:opacity-100 disabled:font-normal disabled:text-black"
                                />
                            </div>
                            <div>
                                <Typography variant="small" className="mb-2 font-bold text-gray-900">
                                    Trạng thái
                                </Typography>
                                <Input
                                    value={statusLabels[purchaseRequest.status] || purchaseRequest.status}
                                    disabled
                                    className="text-sm disabled:opacity-100 disabled:font-normal disabled:text-black"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="border border-gray-200 rounded mb-4">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    {["STT", "Mã vật tư", "Tên vật tư", "Nhà cung cấp", "Đơn vị", "Số lượng"].map((head) => (
                                        <th
                                            key={head}
                                            className={`px-2 py-2 text-sm font-semibold text-gray-600 border-r last:border-r-0 ${head === "STT" ? "w-10" :
                                                    head === "Mã vật tư" ? "w-56" :
                                                        head === "Tên vật tư" ? "w-48" :
                                                            head === "Nhà cung cấp" ? "w-56" :
                                                                head === "Đơn vị" ? "w-10" :
                                                                    head === "Số lượng" ? "w-10" : ""
                                                }`}
                                        >
                                            {head}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {getPaginatedData().length > 0 ? (
                                    getPaginatedData().map((item, index) => (
                                        <tr key={item.purchaseRequestDetailId} className="border-b last:border-b-0 hover:bg-gray-50">
                                            <td className="px-2 py-2 text-sm text-gray-700 w-10 border-r">
                                                {currentPage * pageSize + index + 1}
                                            </td>
                                            <td className="px-2 py-2 text-sm w-56 border-r">
                                                <Input
                                                    variant="standard"
                                                    value={item.materialCode || ""}
                                                    disabled
                                                    className="w-56 text-sm disabled:opacity-100 disabled:font-normal disabled:text-black"
                                                />
                                            </td>
                                            <td className="px-2 py-2 text-sm w-48 border-r">
                                                <Input
                                                    variant="standard"
                                                    value={item.materialName || ""}
                                                    disabled
                                                    className="w-48 text-sm disabled:opacity-100 disabled:font-normal disabled:text-black"
                                                />
                                            </td>
                                            <td className="px-2 py-2 text-sm w-56 border-r">
                                                <Input
                                                    variant="standard"
                                                    value={item.partnerName || ""}
                                                    disabled
                                                    className="w-56 text-sm disabled:opacity-100 disabled:font-normal disabled:text-black"
                                                />
                                            </td>
                                            <td className="px-2 py-2 text-sm w-10 border-r">
                                                <Input
                                                    variant="standard"
                                                    value={item.unitName || ""}
                                                    disabled
                                                    className="w-10 text-sm disabled:opacity-100 disabled:font-normal disabled:text-black"
                                                />
                                            </td>
                                            <td className="px-2 py-2 text-sm w-10 border-r">
                                                <Input
                                                    variant="standard"
                                                    value={item.quantity || ""}
                                                    disabled
                                                    className="w-10 text-sm disabled:opacity-100 disabled:font-normal disabled:text-black"
                                                />
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="px-2 py-2 text-center text-gray-500">
                                            Không có vật tư nào trong yêu cầu này
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>

                        {purchaseRequest.purchaseRequestDetails && purchaseRequest.purchaseRequestDetails.length > 0 && (
                            <div className="flex items-center justify-between border-t border-blue-gray-50 p-4">
                                <div className="flex items-center gap-2">
                                    <Typography variant="small" color="blue-gray" className="font-normal">
                                        Trang {currentPage + 1} / {Math.ceil(purchaseRequest.purchaseRequestDetails.length / pageSize)} • {purchaseRequest.purchaseRequestDetails.length} dòng
                                    </Typography>
                                </div>
                                <ReactPaginate
                                    previousLabel={<ArrowLeftIcon strokeWidth={2} className="h-4 w-4" />}
                                    nextLabel={<ArrowRightIcon strokeWidth={2} className="h-4 w-4" />}
                                    breakLabel="..."
                                    pageCount={Math.ceil(purchaseRequest.purchaseRequestDetails.length / pageSize)}
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
                        )}
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button variant="text" color="gray" onClick={handleCancel} className="flex items-center gap-2">
                            <FaTimes /> Quay lại
                        </Button>
                    </div>
                </CardBody>
            </Card>
        </div>
    );
};

export default DetailPurchaseRequestPage; 