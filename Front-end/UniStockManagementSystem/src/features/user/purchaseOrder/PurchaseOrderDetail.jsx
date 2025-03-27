import { FaSave, FaTimes, FaEdit, FaFileExport } from "react-icons/fa";
import { getPurchaseOrderById } from "./purchaseOrderService";
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Tab, Tabs } from '@mui/material';
import {
  Card,
  Button,
  Input,
  Textarea,
  Typography,
} from "@material-tailwind/react";
import Select from "react-select";
import PageHeader from '@/components/PageHeader';

const PurchaseOrderDetail = () => {
  const { orderId } = useParams();
  console.log("📢 orderId từ URL:", orderId); // Debug log

  const navigate = useNavigate();
  const [order, setOrder] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("orderInfo");
  // Add this line at the top with other state

  const getStatusLabel = (statusCode) => {
    const statusMap = {
      PENDING: "Chờ nhận",
      IN_PROGRESS: "Chưa hoàn thành",
      COMPLETED: "Hoàn thành",
      CANCELED: "Hủy",
    };
    return statusMap[statusCode] || "Không xác định";
  };

  useEffect(() => {
    if (!orderId || order) return; // Nếu đã có dữ liệu, không gọi API

    let isMounted = true;

    const fetchOrderDetail = async () => {
      try {
        console.log("📢 Gọi API lấy đơn hàng với ID:", orderId);
        const response = await getPurchaseOrderById(orderId);
        console.log("✅ Kết quả từ API:", response);

        if (isMounted) {
          setOrder({
            ...response,
            items: response.items || [],
          });
        }
      } catch (error) {
        if (isMounted) setError("Không thể tải dữ liệu đơn hàng.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchOrderDetail();
    return () => { isMounted = false; };
  }, [orderId]);

  if (loading) return <Typography>Đang tải dữ liệu...</Typography>;
  if (error) return <Typography className="text-red-500">{error}</Typography>;

  const items = order?.details || [];

  return (
    <div className="mb-8 flex flex-col gap-12">
      <Card className="bg-white p-8 shadow-md rounded-lg">
        <PageHeader
          title={`Đơn đặt hàng ${order?.poCode || ""}`}
          showAdd={false}
          onImport={() => {/* Xử lý import nếu có */ }}
          onExport={() => {/* Xử lý export file ở đây nếu có */ }}
          showImport={false} // Ẩn nút import nếu không dùng
          showExport={true} // Ẩn xuất file nếu không dùng
        />

        <div className="mb-4 flex border-b">
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
            textColor="primary"
            indicatorColor="primary"
          >
            <Tab label="Thông tin đơn hàng" value="orderInfo" />
            <Tab label="Danh sách sản phẩm" value="productList" />
          </Tabs>
        </div>
        {activeTab === "orderInfo" && (

          <div className="bg-gray-50 rounded-lg p-6 mb-8 shadow-sm">
            <div className="mb-6">
              <Typography variant="h6" className="flex items-center mb-4 text-gray-700">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                </svg>
                Thông tin chung
              </Typography>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
                <div>
                  <Typography variant="small" className="text-gray-600 mb-2">Mã đơn</Typography>
                  <Input value={order.poCode} disabled className="bg-gray-100 rounded-md" />
                </div>
                <div>
                  <Typography variant="small" className="text-gray-600 mb-2">Trạng thái đơn hàng</Typography>
                  <Input
                    value={getStatusLabel(order.status)}
                    disabled
                    className="bg-gray-100 rounded-md"
                  />
                </div>
                <div>
                  <Typography variant="small" className="text-gray-600 mb-2">Ngày tạo đơn</Typography>
                  <Input
                    value={new Date(order.orderDate).toLocaleDateString('vi-VN')}
                    disabled
                    className="bg-gray-100 rounded-md"
                    icon={<i className="fas fa-calendar" />}
                  />
                </div>

              </div>
            </div>

            <div>
              <Typography variant="h6" className="flex items-center mb-4 text-gray-700">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                </svg>
                Thông tin nhà cung cấp
              </Typography>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <Typography variant="small" className="text-gray-600 mb-2">Tên nhà cung cấp</Typography>
                  <Input value={order.supplierName || "không có thông tin"} disabled className="bg-gray-100 rounded-md" />
                </div>
                <div>
                  <Typography variant="small" className="text-gray-600 mb-2">Người liên hệ</Typography>
                  <Input value={order.supplierContactName || "không có thông tin"} disabled className="bg-gray-100 rounded-md" />
                </div>
                <div>
                  <Typography variant="small" className="text-gray-600 mb-2">Địa chỉ</Typography>
                  <Input value={order.supplierAddress || "không có thông tin"} disabled className="bg-gray-100 rounded-md" />
                </div>

                <div>
                  <Typography variant="small" className="text-gray-600 mb-2">Số điện thoại</Typography>
                  <Input value={order.supplierPhone || "không có thông tin"} disabled className="bg-gray-100 rounded-md" />
                </div>
              </div>
            </div>
          </div>
        )}
        {activeTab === "productList" && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-4">
              <Typography variant="h6" className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                </svg>
                Danh sách sản phẩm
              </Typography>
            </div>

            {items.length === 0 ? (
              <div className="bg-gray-50 p-6 rounded-lg text-center text-gray-600">
                Không có sản phẩm nào trong đơn hàng này.
              </div>
            ) : (
              <div className="border rounded-lg overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-gray-100 border-b">
                    <tr>
                      <th className="px-6 py-4 text-sm font-semibold text-gray-700 text-center">STT</th>
                      <th className="px-6 py-4 text-sm font-semibold text-gray-700">Mã hàng</th>
                      <th className="px-6 py-4 text-sm font-semibold text-gray-700">Tên hàng</th>
                      <th className="px-6 py-4 text-sm font-semibold text-gray-700 text-center">Số lượng</th>
                      <th className="px-6 py-4 text-sm font-semibold text-gray-700 text-center">Đơn vị</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-center">{index + 1}</td>
                        <td className="px-6 py-4 text-sm">{item.materialCode}</td>
                        <td className="px-6 py-4 text-sm">{item.materialName}</td>
                        <td className="px-6 py-4 text-sm text-center">{item.orderedQuantity}</td>
                        <td className="px-6 py-4 text-sm text-center">{item.unit}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
        <div className="mt-6 border-t pt-4 flex justify-between">
          <Button
            size="sm"
            color="red"
            variant="text"
            onClick={() => navigate("/user/purchaseOrder")}
            className="mr-4"
          >
            Quay lại danh sách
          </Button>
        </div>
      </Card>
    </div >
  );
};

export default PurchaseOrderDetail;