import { useState } from "react";
import { getPartnerTypes, togglePartnerTypeStatus } from "./partnerTypeService";

const usePartnerType = () => {
  const [partnerTypes, setPartnerTypes] = useState([]);

  const fetchPartnerTypes = async () => {
    try {
      const data = await getPartnerTypes();
      setPartnerTypes(data);
    } catch (error) {
      console.error("Failed to fetch partner types", error);
    }
  };

  // 🔄 **Toggle trạng thái `isActive`**
    const toggleStatus = async (typeId, currentStatus) => {
      try {
        const newStatus = !currentStatus; // ✅ Đảo trạng thái hiện tại
        const updatedPartnerType = await togglePartnerTypeStatus(typeId, newStatus);
        setPartnerTypes((prevPartnerTypes) =>
            prevPartnerTypes.map((partnerType) =>
            partnerType.typeId === typeId
              ? { ...partnerType, status: updatedPartnerType.status }
              : partnerType
          )
        );
      } catch (error) {
        console.error("❌ Lỗi khi cập nhật trạng thái:", error);
      }
    };

    

  return {
    partnerTypes,
    fetchPartnerTypes,
    toggleStatus,
  };
};

export default usePartnerType;
