import { useState } from "react";
import { getPartnerTypes } from "./PartnerTypeService";

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

  return {
    partnerTypes,
    fetchPartnerTypes,
  };
};

export default usePartnerType;
