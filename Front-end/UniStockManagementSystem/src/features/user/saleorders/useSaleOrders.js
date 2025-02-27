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
      
      // Asegurarse de que data sea un array
      if (Array.isArray(data)) {
        setSaleOrders(data);
        console.log("📊 Đã tải xong danh sách đơn hàng:", data.length, "items");
      } else {
        console.warn("⚠️ API trả về dữ liệu không phải array:", data);
        // Si no es un array, intentar extraer los datos de alguna propiedad común
        if (data && typeof data === 'object') {
          if (data.data && Array.isArray(data.data)) {
            setSaleOrders(data.data);
            console.log("📊 Đã tải xong danh sách đơn hàng từ data.data:", data.data.length, "items");
          } else if (data.content && Array.isArray(data.content)) {
            setSaleOrders(data.content);
            console.log("📊 Đã tải xong danh sách đơn hàng từ data.content:", data.content.length, "items");
          } else if (data.items && Array.isArray(data.items)) {
            setSaleOrders(data.items);
            console.log("📊 Đã tải xong danh sách đơn hàng từ data.items:", data.items.length, "items");
          } else {
            setSaleOrders([]);
            console.error("❌ Không thể xác định dữ liệu trả về từ API:", data);
          }
        } else {
          setSaleOrders([]);
          console.error("❌ Dữ liệu trả về không hợp lệ:", data);
        }
      }
      
      return data;
    } catch (err) {
      console.error("❌ Failed to fetch sale orders", err);
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