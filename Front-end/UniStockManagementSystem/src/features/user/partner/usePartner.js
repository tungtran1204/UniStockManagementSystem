import { useState, useEffect } from "react";
import { getAllPartners } from "./partnerService";

const usePartner = () => {
  const [partners, setPartners] = useState([]);

  useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    try {
      const data = await getAllPartners();
      setPartners(data);
    } catch (error) {
      console.error("Lỗi khi tải đối tác:", error);
    }
  };

  return { partners, fetchPartners };
};

export default usePartner; // ✅ Đảm bảo export default
