import React, { useEffect, useState } from "react";
import useSaleOrders from "./useSaleOrders";
import {
    createSaleOrders,
    updateSaleOrders, 
} from "./saleOrdersService"; 
import {
        Card,
        CardHeader,
        CardBody,
        Typography,
        Input,
        Textarea,
        Button,
        Tooltip,
        Select,
        Option,
        Switch,
    } from "@material-tailwind/react";
import { FaEdit, FaPlus } from "react-icons/fa";

const SaleOrdersPage = () => {
    const {saleOrders, fetchSaleOrders, toggleStatus} = useSaleOrders();
    const [showCreatePopup, setShowCreatePopup] = useState(false);
    const [showEditPopup, setShowEditPopup] = useState(false);
    const [editSaleOrders, setEditSaleOrders] = useState(null);
    const [errorMessage, setErrorMessage] = useState("");
    const [errororderId, setErrorOrderId] = useState("");
    const [errorcustomerName, setErrorCustomerName] = useState("");

    // State cho form tạo order mới
        const [newSaleOrders, setNewSaleOrders] = useState({
            orderId: "",
            custName: "",
            status: true,
            totalAmount: "",
        });
    
        useEffect(() => {
            fetchSaleOrders().then((data) => {
                console.log("📢 API trả về danh sách SaleOrder:", data);
            });
        }, []);
    
        const resetErrorMessages = () => {
            setErrorMessage("");
            setErrorOrderId("");
            setErrorCustomerName("");
        };
    
        const validateSaleOrders = (SaleOrders) => {
            let isValid = true;
            setErrorOrderId("");
            setErrorCustomerName("");
            setErrorMessage("");
    
            if (!SaleOrders.orderId.trim()) {
                setErrorOrderId("Mã order không được để trống.");
                isValid = false;
            }
    
            if (!SaleOrders.custName.trim()) {
                setErrorCustomerName("Tên order không được để trống.");
                isValid = false;
            }
    
            return isValid;
        };
    
    
        const handleCreateSaleOrders = async () => {
            resetErrorMessages();
    
            if (!validateSaleOrders(newSaleOrders)) {
                return; // Nếu có lỗi, dừng không gọi API
            }
    
            try {
                await createSaleOrders(newSaleOrders);
                fetchSaleOrders();
                setShowCreatePopup(false);
                setNewSaleOrders({
                    orderId: "",
                    custName: "",
                    status: true,
                    totalAmount: "",
                });
                setErrorMessage("");
            } catch (error) {
                console.error("Lỗi khi tạo order:", error);
                if (error.response && error.response.status === 409) {
                    const errorCode = error.response.data;
    
                    if (errorCode === "DUPLICATE_CODE_AND_NAME") {
                        setErrorMessage("Mã order và tên order đã tồn tại.");
                    } else if (errorCode === "DUPLICATE_CODE") {
                        setErrorOrderId("Mã order đã tồn tại.");
                    } else if (errorCode === "DUPLICATE_NAME") {
                        setErrorCustomerName("Tên order đã tồn tại.");
                    }
    
                } else {
                    alert("Lỗi khi tạo order! Vui lòng thử lại.");
                }
            }
        };
    
        const handleEditSaleOrders = async () => {
            resetErrorMessages(); // Xóa lỗi trước khi kiểm tra
    
            if (!validateSaleOrders(editSaleOrders)) {
                return; // Nếu có lỗi, dừng không gọi API
            }
    
            try {
                await updateSaleOrders(editSaleOrders);
                fetchSaleOrders();
                setShowEditPopup(false);
                setEditSaleOrders(null);
                setErrorMessage("");
            } catch (error) {
                console.error("Lỗi khi cập nhật order:", error);
                if (error.response && error.response.status === 409) {
                    const errorCode = error.response.data;
    
                    if (errorCode === "DUPLICATE_CODE_AND_NAME") {
                        setErrorMessage("Mã order và tên order đã tồn tại.");
                    } else if (errorCode === "DUPLICATE_CODE") {
                        setErrorOrderId("Mã order đã tồn tại.");
                    } else if (errorCode === "DUPLICATE_NAME") {
                        setErrorCustomerName("Tên order đã tồn tại.");
                    }
                } else {
                    alert("Lỗi khi cập nhật order! Vui lòng thử lại.");
                }
            }
        };
    
        return (
            <div className="mt-12 mb-8 flex flex-col gap-12">
                <Card>
                    <CardHeader variant="gradient" color="gray" className="mb-8 p-6">
                        <div className="flex justify-between items-center">
                            <Typography variant="h6" color="white">
                                Danh sách order
                            </Typography>
                            <div className="flex gap-2">
                                <Button
                                    size="sm"
                                    color="white"
                                    variant="text"
                                    className="flex items-center gap-2"
                                    onClick={() => {
                                        resetErrorMessages();  // Xóa lỗi cũ trước khi mở popup
                                        setShowCreatePopup(true);
                                    }}
                                >
                                    <FaPlus className="h-4 w-4" /> Thêm order
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
                        <table className="w-full min-w-[640px] table-auto">
                            <thead>
                                <tr>
                                    {["Mã order", "Tên khách hàng", "Tổng giá", "Trạng thái", "Ngày đặt hàng", "Ghi chú", "Hành động"].map((el) => (
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
                                {saleOrders && saleOrders.length > 0 ? (
                                    saleOrders.map(({ typeId, orderId, custName, totalAmount, status, orderDate, note }, key) => {
                                        const className = `py-3 px-5 ${key === saleOrders.length - 1 ? "" : "border-b border-blue-gray-50"
                                            }`;
    
                                        return (
                                            <tr key={typeId}>
                                                <td className={className}>
                                                    <Typography
                                                        variant="small"
                                                        color="blue-gray"
                                                        className="font-semibold"
                                                    >
                                                        {orderId}
                                                    </Typography>
                                                </td>
                                                <td className={className}>
                                                    <Typography
                                                        variant="small"
                                                        color="blue-gray"
                                                        className="font-semibold"
                                                    >
                                                        {custName}
                                                    </Typography>
                                                </td>
                                                <td className={className}>
                                                    <Typography className="text-xs font-semibold text-blue-gray-600">
                                                        {totalAmount}
                                                    </Typography>
                                                </td>
                                                <td className={className}>
                                                    <Typography className="text-xs font-semibold text-blue-gray-600">
                                                        {status ? "Hoạt động" : "Vô hiệu hóa"}
                                                    </Typography>
                                                </td>
                                                <td className={className}>
                                                    <Typography className="text-xs font-semibold text-blue-gray-600">
                                                        {orderDate}
                                                    </Typography>
                                                </td>
                                                <td className={className}>
                                                    <Typography className="text-xs font-semibold text-blue-gray-600">
                                                        {note}
                                                    </Typography>
                                                </td>
                                                <td className={className}>
                                                    <div className="flex items-center gap-2 pl-4">
                                                        <Tooltip content="Chỉnh sửa">
                                                            <button
                                                                onClick={() => {
                                                                    resetErrorMessages();  // Xóa lỗi cũ trước khi mở popup
                                                                    setEditSaleOrders({ typeId, orderId, custName, totalAmount, status });
                                                                    setShowEditPopup(true);
                                                                }}
                                                                className="p-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white"
                                                                style={{ paddingLeft: "10px" }}
                                                            >
                                                                <FaEdit />
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
                                            colSpan="4"
                                            className="border-b border-gray-200 px-3 py-4 text-center text-gray-500"
                                        >
                                            Không có dữ liệu
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </CardBody>
                </Card>
    
                {/* Popup tạo order mới */}
                {showCreatePopup && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 w-[500px]">
                            <div className="flex justify-between items-center mb-4">
                                <Typography variant="h6">Tạo order mới</Typography>
                                <button
                                    className="text-gray-500 hover:text-gray-700"
                                    onClick={() => {
                                        resetErrorMessages();
                                        setShowCreatePopup(false);
                                    }}
                                >
                                    ✕
                                </button>
                            </div>
                            {errorMessage && (
                                <Typography variant="small" color="red" className="mb-4">
                                    {errorMessage}
                                </Typography>
                            )}
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div className="col-span-2">
                                    <Typography variant="small" className="mb-2">Mã order *</Typography>
                                    <Input
                                        type="text"
                                        value={newSaleOrders.orderId}
                                        onChange={(e) => {
                                            setNewSaleOrders({ ...newSaleOrders, orderId: e.target.value });
                                            setErrorOrderId(""); // Reset lỗi khi user nhập lại
                                        }}
                                        className="w-full"
                                    />
                                    {errororderId && <Typography variant="small" color="red">{errororderId}</Typography>}
                                </div>
                                <div className="col-span-2">
                                    <Typography variant="small" className="mb-2">Tên order *</Typography>
                                    <Input
                                        type="text"
                                        value={newSaleOrders.custName}
                                        onChange={(e) => {
                                            setNewSaleOrders({ ...newSaleOrders, custName: e.target.value });
                                            setErrorCustomerName(""); // Reset lỗi khi user nhập lại
                                        }}
                                        className="w-full"
                                    />
                                    {errorcustomerName && <Typography variant="small" color="red">{errorcustomerName}</Typography>}
                                </div>
                                <div className="col-span-2">
                                    <Typography variant="small" className="mb-2">Mô tả</Typography>
                                    <Textarea
                                        type="text"
                                        value={newSaleOrders.totalAmount}
                                        onChange={(e) => setNewSaleOrders({ ...newSaleOrders, totalAmount: e.target.value })}
                                        className="w-full"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button
                                    color="gray"
                                    onClick={() => setShowCreatePopup(false)}
                                >
                                    Hủy
                                </Button>
                                <Button
                                    color="blue"
                                    onClick={handleCreateSaleOrders}
                                >
                                    Lưu
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
    
                {/* Popup chỉnh sửa order */}
                {showEditPopup && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 w-[500px]">
                            <div className="flex justify-between items-center mb-4">
                                <Typography variant="h6">Chỉnh sửa order</Typography>
                                <button
                                    className="text-gray-500 hover:text-gray-700"
                                    onClick={() => {
                                        resetErrorMessages();
                                        setShowEditPopup(false);
                                    }}
                                >
                                    ✕
                                </button>
                            </div>
                            {errorMessage && (
                                <Typography variant="small" color="red" className="mb-4">
                                    {errorMessage}
                                </Typography>
                            )}
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div className="col-span-2">
                                    <Typography variant="small" className="mb-2">Mã order *</Typography>
                                    <Input
                                        type="text"
                                        value={editSaleOrders.orderId}
                                        onChange={(e) => {
                                            setEditSaleOrders({ ...editSaleOrders, orderId: e.target.value });
                                            setErrorOrderId(""); // Reset lỗi khi user nhập lại
                                        }}
                                        className="w-full"
                                    />
                                    {errororderId && <Typography variant="small" color="red">{errororderId}</Typography>}
                                </div>
                                <div className="col-span-2">
                                    <Typography variant="small" className="mb-2">Tên order *</Typography>
                                    <Input
                                        type="text"
                                        value={editSaleOrders.custName}
                                        onChange={(e) => {
                                            setEditSaleOrders({ ...editSaleOrders, custName: e.target.value });
                                            setErrorCustomerName(""); // Reset lỗi khi user nhập lại
                                        }}
                                        className="w-full"
                                    />
                                    {errorcustomerName && <Typography variant="small" color="red">{errorcustomerName}</Typography>}
                                </div>
                                <div className="col-span-2">
                                    <Typography variant="small" className="mb-2">Trạng thái</Typography>
                                    <Select
                                        value={editSaleOrders.status ? "active" : "inactive"}
                                        onChange={(value) => setEditSaleOrders({ ...editSaleOrders, status: value === "active" })}
                                        className="w-full"
                                    >
                                        <Option value="active">Đang hoạt động</Option>
                                        <Option value="inactive">Ngừng hoạt động</Option>
                                    </Select>
                                </div>
                                <div className="col-span-2">
                                    <Typography variant="small" className="mb-2">Mô tả</Typography>
                                    <Textarea
                                        type="text"
                                        value={editSaleOrders.totalAmount}
                                        onChange={(e) => setEditSaleOrders({ ...editSaleOrders, totalAmount: e.target.value })}
                                        className="w-full"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button
                                    color="gray"
                                    onClick={() => setShowEditPopup(false)}
                                >
                                    Hủy
                                </Button>
                                <Button
                                    color="blue"
                                    onClick={handleEditSaleOrders}
                                >
                                    Lưu
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };
export default SaleOrdersPage;
