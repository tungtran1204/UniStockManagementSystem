import { useState } from "react";
import { getSaleOrders , toggleSaleOrdersStatus} from "./saleOrdersService";

const useSaleOrders = () => {
  const [saleOrders, setSaleOrders] = useState([]);

    const fetchSaleOrders = async () => {
        try {
            const data = await getSaleOrders();
            setSaleOrders(data);
        } catch (err) {
            console.error("Failed to fetch sale orders", err);
        }
    };

// 🔄 **Toggle trạng thái `isActive`**
    const toggleStatus = async (typeId, currentStatus) => {
      try {
        const newStatus = !currentStatus; // ✅ Đảo trạng thái hiện tại
        const updatedSaleOrder = await toggleSaleOrdersStatus(typeId, newStatus);
        setSaleOrders((prevSaleOrders) =>
            prevSaleOrders.map((saleOrders) =>
                saleOrders.typeId === typeId
              ? { ...saleOrders, status: updatedSaleOrder.status }
              : saleOrders
          )
        );
      } catch (error) {
        console.error("❌ Lỗi khi cập nhật trạng thái:", error);
      }
    };
return { 
    saleOrders, 
    fetchSaleOrders, 
    toggleStatus 
};
};

export default useSaleOrders;
