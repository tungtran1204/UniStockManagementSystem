import { useState } from "react";
import { getSaleOrders, toggleSaleOrdersStatus } from "./saleOrdersService";

const useSaleOrders = () => {
  const [saleOrders, setSaleOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSaleOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSaleOrders();

      console.log("📊 Dữ liệu API trả về:", JSON.stringify(data, null, 2));

      if (Array.isArray(data)) {
        setSaleOrders(data);
      } else if (data && data.data && Array.isArray(data.data)) {
        setSaleOrders(data.data);
      } else {
        setSaleOrders([]);
        console.error("❌ API không trả về danh sách hợp lệ:", data);
      }

      return data;
    } catch (err) {
      console.error("❌ Lỗi khi lấy danh sách đơn hàng", err);
      setError("Không thể tải danh sách đơn hàng");
      setSaleOrders([]);
      return [];
    } finally {
      setLoading(false);
    }
  };


  // Cập nhật trạng thái
  const toggleStatus = async (typeId, currentStatus) => {
    try {
      setLoading(true);
      const newStatus = !currentStatus; // Đảo trạng thái hiện tại
      const updatedSaleOrder = await toggleSaleOrdersStatus(typeId, newStatus);

      // Cập nhật state để UI hiển thị ngay lập tức
      setSaleOrders((prevSaleOrders) =>
        prevSaleOrders.map((saleOrder) =>
          saleOrder.typeId === typeId
            ? { ...saleOrder, status: updatedSaleOrder.status }
            : saleOrder
        )
      );

      const updateOrder = async (orderData) => {
        try {
          setLoading(true);
          await updateSaleOrders(orderData);
          await fetchSaleOrders(); // Làm mới danh sách
        } catch (error) {
          console.error("Lỗi khi cập nhật đơn hàng:", error);
          setError("Không thể cập nhật đơn hàng");
        } finally {
          setLoading(false);
        }
      };


      console.log(`✅ Đã cập nhật trạng thái của đơn hàng ${typeId} thành ${newStatus ? "Hoạt động" : "Vô hiệu hóa"}`);
      return updatedSaleOrder;
    } catch (error) {
      console.error("❌ Lỗi khi cập nhật trạng thái:", error);
      setError("Không thể cập nhật trạng thái đơn hàng");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    saleOrders,
    loading,
    error,
    fetchSaleOrders,
    toggleStatus
  };
};

export default useSaleOrders;