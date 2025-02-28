import React, { useEffect, useState } from "react";
import useSaleOrders from "./useSaleOrders";
import {
  createSaleOrders,
  updateSaleOrders,
  getSaleOrderById,
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
  const [selectedOrder, setSelectedOrder] = useState({
    orderDetails: [],
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [errorOrderId, setErrorOrderId] = useState("");
  const [errorCustomerName, setErrorCustomerName] = useState("");

  const resetErrorMessages = () => {
    setErrorMessage("");
    setErrorOrderId("");
    setErrorCustomerName("");
  };
  // State cho form tạo order mới
  const [newSaleOrder, setNewSaleOrder] = useState({
    nextOrderId: "Đang tải...",
    partnerName: "",
    orderDate: new Date().toISOString().split("T")[0],
    note: "",
    productDetails: []
  });


  // State cho trường sản phẩm tạm thời
  const [tempProduct, setTempProduct] = useState({
    productId: "",
    quantity: ""
  });


  useEffect(() => {
    fetchSaleOrders().then((data) => {
      console.log("📢 API trả về danh sách SaleOrder:", data);
      // Giả lập việc lấy ID tiếp theo từ server
      const nextId = data && data.length > 0 ? Math.max(...data.map(order =>
        typeof order.orderId === 'number' ? order.orderId : parseInt(order.orderId) || 0)) + 1 : 1;
      setNewSaleOrder(prev => ({ ...prev, nextOrderId: nextId.toString() }));
    });
  }, []);


  // Thêm sản phẩm vào danh sách
  const addProductToOrder = () => {
    if (!tempProduct.productId || !tempProduct.quantity) {
      setErrorMessage("Vui lòng nhập đầy đủ mã sản phẩm và số lượng");
      return;
    }

    setNewSaleOrder({
      ...newSaleOrder,
      productDetails: [...newSaleOrder.productDetails, { ...tempProduct }]
    });

    // Reset form nhập sản phẩm
    setTempProduct({ productId: "", quantity: "" });
  };


  // Xóa sản phẩm khỏi danh sách
  const removeProductFromOrder = (index) => {
    const updatedProducts = [...newSaleOrder.productDetails];
    updatedProducts.splice(index, 1);
    setNewSaleOrder({
      ...newSaleOrder,
      productDetails: updatedProducts
    });
  };


  const validateSaleOrder = (saleOrder) => {
    let isValid = true;
    setErrorCustomerName("");
    setErrorMessage("");


    if (typeof saleOrder.partnerName === 'string' && !saleOrder.partnerName.trim()) {
      setErrorCustomerName("Tên khách hàng không được để trống.");
      isValid = false;
    } else if (!saleOrder.partnerName) {
      setErrorCustomerName("Tên khách hàng không được để trống.");
      isValid = false;
    }


    if (!saleOrder.productDetails || saleOrder.productDetails.length === 0) {
      setErrorMessage("Cần có ít nhất một sản phẩm trong đơn hàng.");
      isValid = false;
    }


    return isValid;
  };


  const handleCreateSaleOrder = async () => {



    if (!validateSaleOrder(newSaleOrder)) {
      return; // Nếu có lỗi, dừng không gọi API
    }


    try {
      // Chuẩn bị dữ liệu gửi đi

      const orderData = {
        orderId: newSaleOrder.nextOrderId,
        partnerName: newSaleOrder.partnerName,
        status: "PENDING", // Luôn là PENDING khi tạo mới
        orderDate: newSaleOrder.orderDate,
        note: newSaleOrder.note,
        orderDetails: newSaleOrder.productDetails.map(product => ({
          productId: product.productId,
          quantity: product.quantity
        }))
      };

      // Đặt console.log sau khi orderData đã được khởi tạo
      console.log("📝 Dữ liệu gửi lên Backend:", JSON.stringify(orderData, null, 2));

      console.log("Dữ liệu gửi lên API:", orderData);
      await createSaleOrders(orderData);

      const updatedOrders = await fetchSaleOrders(); // Tải lại danh sách sau khi tạo mới
      console.log("✅ Đã tạo mới và tải lại danh sách:", updatedOrders);
      setShowCreatePopup(false);

      // Reset form
      setNewSaleOrder({
        nextOrderId: (parseInt(newSaleOrder.nextOrderId) + 1).toString(),
        partnerName: "",
        orderDate: new Date().toISOString().split("T")[0],
        note: "",
        productDetails: []
      });

      setTempProduct({ productId: "", quantity: "" });
      setErrorMessage("");
    } catch (error) {
      console.error("Lỗi khi tạo order:", error);
      if (error.response && error.response.status === 409) {
        const errorCode = error.response.data;


        if (errorCode === "DUPLICATE_CODE_AND_NAME") {
          setErrorMessage("Mã order và tên khách hàng đã tồn tại.");
        } else if (errorCode === "DUPLICATE_CODE") {
          setErrorMessage("Mã order đã tồn tại.");
        } else if (errorCode === "DUPLICATE_NAME") {
          setErrorCustomerName("Tên khách hàng đã tồn tại.");
        }
      } else {
        setErrorMessage("Lỗi khi tạo order! Vui lòng thử lại.");
      }
    }
  };


  const handleEditSaleOrder = async () => {
    if (!editSaleOrder) return;

    try {
      console.log("📤 Gửi dữ liệu cập nhật:", editSaleOrder);

      await updateSaleOrders({
        orderId: editSaleOrder.orderId,
        status: editSaleOrder.status
      });

      // Cập nhật UI sau khi chỉnh sửa
      const updatedOrders = await fetchSaleOrders();
      console.log("✅ Đã cập nhật danh sách:", updatedOrders);

      setShowEditPopup(false);
      setEditSaleOrder(null);
    } catch (error) {
      console.error("❌ Lỗi khi cập nhật đơn hàng:", error);
    }
  };

  const handleViewDetails = async (order) => {
    console.log("🛠️ Kiểm tra order:", order);

    if (!order || !order.orderId) {
      console.warn("⚠ Lỗi: orderId không hợp lệ!", order);
      return;
    }

    const orderDetails = await getSaleOrderById(order.orderId); // Chắc chắn orderId là số
    console.log("✅ API trả về:", orderDetails);

    setSelectedOrder(orderDetails);
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
              Danh sách đơn đặt hàng
            </Typography>
            <div className="flex gap-2">
              <Button
                size="sm"
                color="white"
                variant="text"
                className="flex items-center gap-2"
                onClick={() => {
                  setShowCreatePopup(true);
                }}
              >
                <FaPlus className="h-4 w-4" /> Tạo đơn đặt hàng
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
          <table style={styles.table}>
            <thead>
              <tr>
                {["NGÀY TẠO ĐƠN", "MÃ ĐƠN HÀNG", "TÊN KHÁCH HÀNG", "TÌNH TRẠNG ĐƠN HÀNG", "HÀNH ĐỘNG"].map((el) => (
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
                saleOrders.map(({ typeId, orderId, partnerName, totalAmount, status, orderDate, note }, key) => {
                  const className = `py-3 px-5 ${key === saleOrders.length - 1 ? "" : "border-b border-blue-gray-50"
                    }`;


                  return (
                    <tr key={typeId || key}>
                      <td className={className}>
                        <Typography
                          variant="small"
                          color="blue-gray"
                          className="font-semibold"
                        >
                          {formatDate(orderDate)}
                        </Typography>
                      </td>
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
                          {partnerName || "Không có tên"}
                        </Typography>
                      </td>
                      <td className={className}>
                        <div className={`px-2 py-1 rounded-full text-xs font-semibold inline-block ${status === "DELIVERED" ? "bg-green-100 text-green-800" :
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
                        <div style={styles.actionBtns}>
                          <Tooltip content="Xem chi tiết">
                            <button
                              onClick={() => handleViewDetails({ typeId, orderId, partnerName, totalAmount, status, orderDate, note })}
                              style={styles.viewBtn}
                            >
                              <FaEye />
                            </button>
                          </Tooltip>
                          <Tooltip content="Chỉnh sửa">
                            <button
                              onClick={() => {
                                resetErrorMessages();

                                if (!orderId) {
                                  console.error("❌ Lỗi: orderId không tồn tại!", orderId);
                                  return;
                                }

                                // Tìm đơn hàng trong danh sách
                                const order = saleOrders.find(o => o.orderId === orderId);
                                if (!order) {
                                  console.error("❌ Không tìm thấy đơn hàng với ID:", orderId);
                                  return;
                                }

                                console.log("🛠️ Chỉnh sửa đơn hàng:", order);

                                setEditSaleOrder({
                                  orderId: order.orderId,
                                  partnerName: order.partnerName || "Không có tên",
                                  status: order.status || "PENDING",
                                  orderDate: order.orderDate || new Date().toISOString().split("T")[0],
                                  note: order.note || "",
                                  productDetails: Array.isArray(order.orderDetails)
                                    ? order.orderDetails.map(detail => ({
                                      productId: detail.productId || "",
                                      productName: detail.productName || "",
                                      unitName: detail.unitName || "",
                                      quantity: detail.quantity || 1
                                    }))
                                    : []
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
                    colSpan="5"
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
                  value={newSaleOrder.nextOrderId}
                  disabled
                  className="w-full bg-gray-100"
                />
              </div>

              <div style={styles.fullWidth}>
                <Typography variant="small" className="mb-2">Tên khách hàng *</Typography>
                <Input
                  type="text"
                  value={newSaleOrder.partnerName}
                  onChange={(e) => {
                    setNewSaleOrder({ ...newSaleOrder, partnerName: e.target.value });
                    setErrorCustomerName("");
                  }}
                  className="w-full"
                />
                {errorCustomerName && <Typography variant="small" color="red">{errorCustomerName}</Typography>}
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
                <Typography variant="small" className="mb-2">Danh sách sản phẩm *</Typography>

                <div className="mb-3 p-2 border rounded">
                  <div className="flex mb-2">
                    <div className="flex-1 mr-2">
                      <Input
                        type="text"
                        placeholder="Mã sản phẩm"
                        value={tempProduct.productId}
                        onChange={(e) => setTempProduct({ ...tempProduct, productId: e.target.value })}
                        className="w-full"
                      />
                    </div>
                    <div className="flex-1 mr-2">
                      <Input
                        type="number"
                        placeholder="Số lượng"
                        value={tempProduct.quantity}
                        onChange={(e) => setTempProduct({ ...tempProduct, quantity: e.target.value })}
                        className="w-full"
                      />
                    </div>
                    <Button
                      color="blue"
                      size="sm"
                      onClick={addProductToOrder}
                    >
                      Thêm
                    </Button>
                  </div>
                </div>

                {newSaleOrder.productDetails.length > 0 ? (
                  <table className="w-full border-collapse">
                    <thead>
                      <tr>
                        <th className="border p-2 text-left">Mã sản phẩm</th>
                        <th className="border p-2 text-left">Số lượng</th>
                        <th className="border p-2 text-center">Xóa</th>
                      </tr>
                    </thead>
                    <tbody>
                      {newSaleOrder.productDetails.map((product, index) => (
                        <tr key={index}>
                          <td className="border p-2">{product.productId}</td>
                          <td className="border p-2">{product.quantity}</td>
                          <td className="border p-2 text-center">
                            <button
                              onClick={() => removeProductFromOrder(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              ✕
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <Typography variant="small" className="text-gray-500">
                    Chưa có sản phẩm nào được thêm
                  </Typography>
                )}
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
                HỦY
              </Button>
              <Button
                color="blue"
                onClick={handleCreateSaleOrder}
              >
                LƯU
              </Button>
            </div>
          </div>
        </div>
      )}


      {/* Popup chỉnh sửa đơn hàng */}
      {showEditPopup && editSaleOrder && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <Typography variant="h6">Chỉnh sửa đơn hàng #{editSaleOrder.orderId}</Typography>
              <button style={styles.closeBtn} onClick={() => setShowEditPopup(false)}>✕</button>
            </div>

            <div style={styles.formGrid}>
              <div>
                <Typography variant="small" className="font-bold">Mã đơn hàng:</Typography>
                <Typography variant="small">{editSaleOrder.orderId}</Typography>
              </div>
              <div>
                <Typography variant="small" className="font-bold">Khách hàng:</Typography>
                <Typography variant="small">{editSaleOrder.partnerName}</Typography>
              </div>
              <div>
                <Typography variant="small" className="font-bold">Trạng thái:</Typography>
                <Select
                  value={editSaleOrder.status}
                  onChange={(value) => setEditSaleOrder({ ...editSaleOrder, status: value })}
                  className="w-full"
                >
                  <Option value="PENDING">Pending</Option>
                  <Option value="CONFIRMED">Confirmed</Option>
                  <Option value="SHIPPED">Shipped</Option>
                  <Option value="CANCELED">Canceled</Option>
                </Select>
              </div>
              <div>
                <Typography variant="small" className="font-bold">Ngày đặt hàng:</Typography>
                <Typography variant="small">{editSaleOrder.orderDate}</Typography>
              </div>
              <div style={styles.fullWidth}>
                <Typography variant="small" className="font-bold">Ghi chú:</Typography>
                <Typography variant="small">{editSaleOrder.note || "Không có ghi chú"}</Typography>
              </div>
            </div>

            <div className="mt-6">
              <Typography variant="h6" className="mb-3">Chi tiết sản phẩm</Typography>
              {editSaleOrder?.productDetails?.length > 0 ? (
                <table style={styles.detailsTable}>
                  <thead>
                    <tr>
                      <th style={styles.detailsTableHeader}>Mã sản phẩm</th>
                      <th style={styles.detailsTableHeader}>Tên sản phẩm</th>
                      <th style={styles.detailsTableHeader}>Đơn vị</th>
                      <th style={styles.detailsTableHeader}>Số lượng</th>
                    </tr>
                  </thead>
                  <tbody>
                    {editSaleOrder.productDetails.map((detail, index) => (
                      <tr key={index}>
                        <td style={styles.detailsTableCell}>{detail.productId || "N/A"}</td>
                        <td style={styles.detailsTableCell}>{detail.productName || "Không có tên"}</td>
                        <td style={styles.detailsTableCell}>{detail.unitName || "Không có đơn vị"}</td>
                        <td style={styles.detailsTableCell}>{detail.quantity || 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <Typography variant="small" className="text-red-500">
                  ❌ Không có dữ liệu chi tiết sản phẩm
                </Typography>
              )}
            </div>

            <div style={styles.actionButtons} className="mt-4">
              <Button color="gray" onClick={() => setShowEditPopup(false)}>
                HỦY
              </Button>
              <Button color="blue" onClick={handleEditSaleOrder}>
                LƯU
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
                <Typography variant="small">{selectedOrder.partnerName}</Typography>
              </div>
              <div>
                <Typography variant="small" className="font-bold">Trạng thái:</Typography>
                <div className={`px-2 py-1 mt-1 rounded-full text-xs font-semibold inline-block ${selectedOrder.status === "DELIVERED" ? "bg-green-100 text-green-800" :
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
              {selectedOrder?.orderDetails?.length > 0 ? (
                <table style={styles.detailsTable}>
                  <thead>
                    <tr>
                      <th style={styles.detailsTableHeader}>Mã sản phẩm</th>
                      <th style={styles.detailsTableHeader}>Tên sản phẩm</th>
                      <th style={styles.detailsTableHeader}>Đơn vị</th>
                      <th style={styles.detailsTableHeader}>Số lượng</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.orderDetails.map((detail, index) => (
                      <tr key={index}>
                        <td style={styles.detailsTableCell}>{detail.productId || "N/A"}</td>
                        <td style={styles.detailsTableCell}>{detail.productName || "Không có tên"}</td>
                        <td style={styles.detailsTableCell}>{detail.unitName || "Không có đơn vị"}</td>
                        <td style={styles.detailsTableCell}>{detail.quantity || 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <Typography variant="small" className="text-red-500">
                  ❌ Không có dữ liệu chi tiết sản phẩm
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

