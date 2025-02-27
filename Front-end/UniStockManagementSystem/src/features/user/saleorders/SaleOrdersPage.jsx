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
} from "@material-tailwind/react";
import { FaEdit, FaPlus, FaEye } from "react-icons/fa";

const SaleOrdersPage = () => {
  const { saleOrders, fetchSaleOrders, toggleStatus } = useSaleOrders();
  const [showCreatePopup, setShowCreatePopup] = useState(false);
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [showDetailPopup, setShowDetailPopup] = useState(false);
  const [editSaleOrder, setEditSaleOrder] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [errorOrderId, setErrorOrderId] = useState("");
  const [errorCustomerName, setErrorCustomerName] = useState("");

  // State cho form tạo order mới
  const [newSaleOrder, setNewSaleOrder] = useState({
    orderId: "",
    custName: "",
    totalAmount: "",
    status: "PENDING",
    orderDate: new Date().toISOString().split("T")[0],
    note: "",
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

  const validateSaleOrder = (saleOrder) => {
    let isValid = true;
    setErrorOrderId("");
    setErrorCustomerName("");
    setErrorMessage("");

    // Chỉ kiểm tra trim() trên các trường text
    if (typeof saleOrder.orderId === 'string' && !saleOrder.orderId.trim()) {
      setErrorOrderId("Mã order không được để trống.");
      isValid = false;
    } else if (!saleOrder.orderId) {
      setErrorOrderId("Mã order không được để trống.");
      isValid = false;
    }

    if (typeof saleOrder.custName === 'string' && !saleOrder.custName.trim()) {
      setErrorCustomerName("Tên khách hàng không được để trống.");
      isValid = false;
    } else if (!saleOrder.custName) {
      setErrorCustomerName("Tên khách hàng không được để trống.");
      isValid = false;
    }

    return isValid;
  };

  const handleCreateSaleOrder = async () => {
    resetErrorMessages();

    if (!validateSaleOrder(newSaleOrder)) {
      return; // Nếu có lỗi, dừng không gọi API
    }

    try {
      await createSaleOrders(newSaleOrder);
      const updatedOrders = await fetchSaleOrders(); // Tải lại danh sách sau khi tạo mới
      console.log("✅ Đã tạo mới và tải lại danh sách:", updatedOrders);
      setShowCreatePopup(false);
      setNewSaleOrder({
        orderId: "",
        custName: "",
        totalAmount: "",
        status: "PENDING",
        orderDate: new Date().toISOString().split("T")[0],
        note: "",
      });
      setErrorMessage("");
    } catch (error) {
      console.error("Lỗi khi tạo order:", error);
      if (error.response && error.response.status === 409) {
        const errorCode = error.response.data;

        if (errorCode === "DUPLICATE_CODE_AND_NAME") {
          setErrorMessage("Mã order và tên khách hàng đã tồn tại.");
        } else if (errorCode === "DUPLICATE_CODE") {
          setErrorOrderId("Mã order đã tồn tại.");
        } else if (errorCode === "DUPLICATE_NAME") {
          setErrorCustomerName("Tên khách hàng đã tồn tại.");
        }
      } else {
        setErrorMessage("Lỗi khi tạo order! Vui lòng thử lại.");
      }
    }
  };

  const handleEditSaleOrder = async () => {
    resetErrorMessages();

    if (!validateSaleOrder(editSaleOrder)) {
      return; // Nếu có lỗi, dừng không gọi API
    }

    try {
      await updateSaleOrders(editSaleOrder);
      const updatedOrders = await fetchSaleOrders(); // Tải lại danh sách sau khi cập nhật
      console.log("✅ Đã cập nhật và tải lại danh sách:", updatedOrders);
      setShowEditPopup(false);
      setEditSaleOrder(null);
      setErrorMessage("");
    } catch (error) {
      console.error("Lỗi khi cập nhật order:", error);
      if (error.response && error.response.status === 409) {
        const errorCode = error.response.data;

        if (errorCode === "DUPLICATE_CODE_AND_NAME") {
          setErrorMessage("Mã order và tên khách hàng đã tồn tại.");
        } else if (errorCode === "DUPLICATE_CODE") {
          setErrorOrderId("Mã order đã tồn tại.");
        } else if (errorCode === "DUPLICATE_NAME") {
          setErrorCustomerName("Tên khách hàng đã tồn tại.");
        }
      } else {
        setErrorMessage("Lỗi khi cập nhật order! Vui lòng thử lại.");
      }
    }
  };

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setShowDetailPopup(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Inline styles
  const styles = {
    table: {
      width: "100%",
      minWidth: "640px",
      tableLayout: "auto",
    },
    noData: {
      borderBottom: "1px solid #e5e7eb",
      padding: "12px",
      textAlign: "center",
      color: "#6b7280",
    },
    actionBtns: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      paddingLeft: "16px",
    },
    editBtn: {
      padding: "8px 10px",
      borderRadius: "50%",
      backgroundColor: "#3b82f6",
      color: "white",
      cursor: "pointer",
    },
    viewBtn: {
      padding: "8px 10px",
      borderRadius: "50%",
      backgroundColor: "#10b981",
      color: "white",
      cursor: "pointer",
    },
    modal: {
      position: "fixed",
      inset: 0,
      backgroundColor: "rgba(0,0,0,0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 50,
    },
    modalContent: {
      backgroundColor: "white",
      borderRadius: "8px",
      padding: "24px",
      width: "500px",
      maxWidth: "90vw",
      maxHeight: "90vh",
      overflowY: "auto",
    },
    modalHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "16px",
    },
    closeBtn: {
      backgroundColor: "transparent",
      border: "none",
      fontSize: "20px",
      cursor: "pointer",
      color: "#6b7280",
    },
    formGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(2, 1fr)",
      gap: "16px",
      marginBottom: "16px",
    },
    fullWidth: {
      gridColumn: "span 2",
    },
    errorText: {
      color: "#ef4444",
      fontSize: "12px",
      marginTop: "4px",
    },
    actionButtons: {
      display: "flex",
      justifyContent: "flex-end",
      gap: "8px",
    },
    detailsTable: {
      width: "100%",
      borderCollapse: "collapse",
      marginTop: "16px",
    },
    detailsTableHeader: {
      backgroundColor: "#f9fafb",
      padding: "8px 16px",
      textAlign: "left",
      borderBottom: "1px solid #e5e7eb",
    },
    detailsTableCell: {
      padding: "8px 16px",
      borderBottom: "1px solid #e5e7eb",
    },
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
                  resetErrorMessages();
                  setShowCreatePopup(true);
                }}
              >
                <FaPlus className="h-4 w-4" /> Thêm order
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
          <table style={styles.table}>
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
                  const className = `py-3 px-5 ${
                    key === saleOrders.length - 1 ? "" : "border-b border-blue-gray-50"
                  }`;

                  return (
                    <tr key={typeId || key}>
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
                          {custName || "Không có tên"}
                        </Typography>
                      </td>
                      <td className={className}>
                        <Typography className="text-xs font-semibold text-blue-gray-600">
                          {totalAmount}
                        </Typography>
                      </td>
                      <td className={className}>
                        <div className={`px-2 py-1 rounded-full text-xs font-semibold inline-block ${
                          status === "DELIVERED" ? "bg-green-100 text-green-800" :
                          status === "PENDING" ? "bg-yellow-100 text-yellow-800" :
                          status === "CONFIRMED" ? "bg-blue-100 text-blue-800" :
                          status === "SHIPPED" ? "bg-indigo-100 text-indigo-800" :
                          status === "CANCELED" ? "bg-red-100 text-red-800" :
                          status === "RETURNED" ? "bg-purple-100 text-purple-800" :
                          status === true || status === "true" ? "bg-green-100 text-green-800" :
                          status === false || status === "false" ? "bg-red-100 text-red-800" :
                          "bg-gray-100 text-gray-800"
                        }`}>
                          {status === true || status === "true" ? "ACTIVE" : 
                           status === false || status === "false" ? "INACTIVE" : 
                           status || "UNKNOWN"}
                        </div>
                      </td>
                      <td className={className}>
                        <Typography className="text-xs font-semibold text-blue-gray-600">
                          {formatDate(orderDate)}
                        </Typography>
                      </td>
                      <td className={className}>
                        <Typography className="text-xs font-semibold text-blue-gray-600">
                          {note}
                        </Typography>
                      </td>
                      <td className={className}>
                        <div style={styles.actionBtns}>
                          <Tooltip content="Xem chi tiết">
                            <button
                              onClick={() => handleViewDetails({ typeId, orderId, custName, totalAmount, status, orderDate, note })}
                              style={styles.viewBtn}
                            >
                              <FaEye />
                            </button>
                          </Tooltip>
                          <Tooltip content="Chỉnh sửa">
                            <button
                              onClick={() => {
                                resetErrorMessages();
                                console.log("Dados do pedido para edição:", { typeId, orderId, custName, totalAmount, status, orderDate, note });
                                setEditSaleOrder({ 
                                  typeId, 
                                  orderId, 
                                  custName: custName || "", 
                                  totalAmount, 
                                  status, 
                                  orderDate, 
                                  note 
                                });
                                setShowEditPopup(true);
                              }}
                              style={styles.editBtn}
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
                    colSpan="7"
                    style={styles.noData}
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
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <Typography variant="h6">Tạo order mới</Typography>
              <button
                style={styles.closeBtn}
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
            <div style={styles.formGrid}>
              <div style={styles.fullWidth}>
                <Typography variant="small" className="mb-2">Mã order *</Typography>
                <Input
                  type="text"
                  value={newSaleOrder.orderId}
                  onChange={(e) => {
                    setNewSaleOrder({ ...newSaleOrder, orderId: e.target.value });
                    setErrorOrderId("");
                  }}
                  className="w-full"
                />
                {errorOrderId && <Typography variant="small" color="red">{errorOrderId}</Typography>}
              </div>
              <div style={styles.fullWidth}>
                <Typography variant="small" className="mb-2">Tên khách hàng *</Typography>
                <Input
                  type="text"
                  value={newSaleOrder.custName}
                  onChange={(e) => {
                    setNewSaleOrder({ ...newSaleOrder, custName: e.target.value });
                    setErrorCustomerName("");
                  }}
                  className="w-full"
                />
                {errorCustomerName && <Typography variant="small" color="red">{errorCustomerName}</Typography>}
              </div>
              <div style={styles.fullWidth}>
                <Typography variant="small" className="mb-2">Tổng giá *</Typography>
                <Input
                  type="number"
                  value={newSaleOrder.totalAmount}
                  onChange={(e) => {
                    setNewSaleOrder({ ...newSaleOrder, totalAmount: e.target.value });
                  }}
                  className="w-full"
                />
              </div>
              <div style={styles.fullWidth}>
                <Typography variant="small" className="mb-2">Trạng thái</Typography>
                <Select
                  value={newSaleOrder.status}
                  onChange={(value) => setNewSaleOrder({ ...newSaleOrder, status: value })}
                  className="w-full"
                >
                  <Option value="PENDING">PENDING</Option>
                  <Option value="CONFIRMED">CONFIRMED</Option>
                  <Option value="SHIPPED">SHIPPED</Option>
                  <Option value="DELIVERED">DELIVERED</Option>
                  <Option value="CANCELED">CANCELED</Option>
                  <Option value="RETURNED">RETURNED</Option>
                </Select>
              </div>
              <div style={styles.fullWidth}>
                <Typography variant="small" className="mb-2">Ngày đặt hàng *</Typography>
                <Input
                  type="date"
                  value={newSaleOrder.orderDate}
                  onChange={(e) => {
                    setNewSaleOrder({ ...newSaleOrder, orderDate: e.target.value });
                  }}
                  className="w-full"
                />
              </div>
              <div style={styles.fullWidth}>
                <Typography variant="small" className="mb-2">Ghi chú</Typography>
                <Textarea
                  value={newSaleOrder.note}
                  onChange={(e) => setNewSaleOrder({ ...newSaleOrder, note: e.target.value })}
                  className="w-full"
                />
              </div>
            </div>
            <div style={styles.actionButtons}>
              <Button
                color="gray"
                onClick={() => setShowCreatePopup(false)}
              >
                Hủy
              </Button>
              <Button
                color="blue"
                onClick={handleCreateSaleOrder}
              >
                Lưu
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Popup chỉnh sửa order */}
      {showEditPopup && editSaleOrder && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <Typography variant="h6">Chỉnh sửa order</Typography>
              <button
                style={styles.closeBtn}
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
            <div style={styles.formGrid}>
              <div style={styles.fullWidth}>
                <Typography variant="small" className="mb-2">Mã order *</Typography>
                <Input
                  type="text"
                  value={editSaleOrder.orderId}
                  onChange={(e) => {
                    setEditSaleOrder({ ...editSaleOrder, orderId: e.target.value });
                    setErrorOrderId("");
                  }}
                  className="w-full"
                />
                {errorOrderId && <Typography variant="small" color="red">{errorOrderId}</Typography>}
              </div>
              <div style={styles.fullWidth}>
                <Typography variant="small" className="mb-2">Tên khách hàng *</Typography>
                <Input
                  type="text"
                  value={editSaleOrder.custName || ""}
                  onChange={(e) => {
                    setEditSaleOrder({ ...editSaleOrder, custName: e.target.value });
                    setErrorCustomerName("");
                  }}
                  className="w-full"
                />
                {errorCustomerName && <Typography variant="small" color="red">{errorCustomerName}</Typography>}
              </div>
              <div style={styles.fullWidth}>
                <Typography variant="small" className="mb-2">Tổng giá *</Typography>
                <Input
                  type="number"
                  value={editSaleOrder.totalAmount}
                  onChange={(e) => {
                    setEditSaleOrder({ ...editSaleOrder, totalAmount: e.target.value });
                  }}
                  className="w-full"
                />
              </div>
              <div style={styles.fullWidth}>
                <Typography variant="small" className="mb-2">Trạng thái</Typography>
                <Select
                  value={
                    typeof editSaleOrder.status === 'string' && 
                    ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELED", "RETURNED"].includes(editSaleOrder.status) 
                      ? editSaleOrder.status 
                      : editSaleOrder.status === true || editSaleOrder.status === "true"
                        ? "ACTIVE"
                        : "PENDING"
                  }
                  onChange={(value) => setEditSaleOrder({ ...editSaleOrder, status: value })}
                  className="w-full"
                >
                  <Option value="PENDING">PENDING</Option>
                  <Option value="CONFIRMED">CONFIRMED</Option>
                  <Option value="SHIPPED">SHIPPED</Option>
                  <Option value="DELIVERED">DELIVERED</Option>
                  <Option value="CANCELED">CANCELED</Option>
                  <Option value="RETURNED">RETURNED</Option>
                </Select>
              </div>
              <div style={styles.fullWidth}>
                <Typography variant="small" className="mb-2">Ngày đặt hàng *</Typography>
                <Input
                  type="date"
                  value={editSaleOrder.orderDate ? new Date(editSaleOrder.orderDate).toISOString().split("T")[0] : ""}
                  onChange={(e) => {
                    setEditSaleOrder({ ...editSaleOrder, orderDate: e.target.value });
                  }}
                  className="w-full"
                />
              </div>
              <div style={styles.fullWidth}>
                <Typography variant="small" className="mb-2">Ghi chú</Typography>
                <Textarea
                  value={editSaleOrder.note}
                  onChange={(e) => setEditSaleOrder({ ...editSaleOrder, note: e.target.value })}
                  className="w-full"
                />
              </div>
            </div>
            <div style={styles.actionButtons}>
              <Button
                color="gray"
                onClick={() => setShowEditPopup(false)}
              >
                Hủy
              </Button>
              <Button
                color="blue"
                onClick={handleEditSaleOrder}
              >
                Lưu
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Popup xem chi tiết */}
      {showDetailPopup && selectedOrder && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <Typography variant="h6">Chi tiết đơn hàng #{selectedOrder.orderId}</Typography>
              <button
                style={styles.closeBtn}
                onClick={() => setShowDetailPopup(false)}
              >
                ✕
              </button>
            </div>
            
            <div style={styles.formGrid}>
              <div>
                <Typography variant="small" className="font-bold">Mã đơn hàng:</Typography>
                <Typography variant="small">{selectedOrder.orderId}</Typography>
              </div>
              <div>
                <Typography variant="small" className="font-bold">Khách hàng:</Typography>
                <Typography variant="small">{selectedOrder.custName}</Typography>
              </div>
              <div>
                <Typography variant="small" className="font-bold">Tổng giá:</Typography>
                <Typography variant="small">{selectedOrder.totalAmount}</Typography>
              </div>
              <div>
                <Typography variant="small" className="font-bold">Trạng thái:</Typography>
                <div className={`px-2 py-1 mt-1 rounded-full text-xs font-semibold inline-block ${
                  selectedOrder.status === "DELIVERED" ? "bg-green-100 text-green-800" :
                  selectedOrder.status === "PENDING" ? "bg-yellow-100 text-yellow-800" :
                  selectedOrder.status === "CONFIRMED" ? "bg-blue-100 text-blue-800" :
                  selectedOrder.status === "SHIPPED" ? "bg-indigo-100 text-indigo-800" :
                  selectedOrder.status === "CANCELED" ? "bg-red-100 text-red-800" :
                  selectedOrder.status === "RETURNED" ? "bg-purple-100 text-purple-800" :
                  "bg-gray-100 text-gray-800"
                }`}>
                  {selectedOrder.status}
                </div>
              </div>
              <div>
                <Typography variant="small" className="font-bold">Ngày đặt hàng:</Typography>
                <Typography variant="small">{formatDate(selectedOrder.orderDate)}</Typography>
              </div>
              <div style={styles.fullWidth}>
                <Typography variant="small" className="font-bold">Ghi chú:</Typography>
                <Typography variant="small">{selectedOrder.note || "Không có ghi chú"}</Typography>
              </div>
            </div>

            <div className="mt-6">
              <Typography variant="h6" className="mb-3">Chi tiết sản phẩm</Typography>
              {selectedOrder.orderDetails && selectedOrder.orderDetails.length > 0 ? (
                <table style={styles.detailsTable}>
                  <thead>
                    <tr>
                      <th style={styles.detailsTableHeader}>Sản phẩm</th>
                      <th style={styles.detailsTableHeader}>Đơn giá</th>
                      <th style={styles.detailsTableHeader}>Số lượng</th>
                      <th style={styles.detailsTableHeader}>Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.orderDetails.map((detail, index) => (
                      <tr key={index}>
                        <td style={styles.detailsTableCell}>{detail.productName}</td>
                        <td style={styles.detailsTableCell}>{detail.unitPrice}</td>
                        <td style={styles.detailsTableCell}>{detail.quantity}</td>
                        <td style={styles.detailsTableCell}>{detail.lineTotal}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <Typography variant="small" className="text-gray-500">
                  Không có dữ liệu chi tiết sản phẩm
                </Typography>
              )}
            </div>
            
            <div style={styles.actionButtons} className="mt-4">
              <Button color="gray" onClick={() => setShowDetailPopup(false)}>
                Đóng
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SaleOrdersPage;