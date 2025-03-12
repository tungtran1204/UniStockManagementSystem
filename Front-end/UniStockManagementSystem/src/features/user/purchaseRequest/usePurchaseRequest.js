import { useState, useEffect, useCallback } from "react";
import {
  getPurchaseRequests,
  getNextRequestCode,
  createPurchaseRequest,
  togglePurchaseRequestStatus,
} from "./PurchaseRequestService";

const usePurchaseRequest = () => {
  const [purchaseRequests, setPurchaseRequests] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  const fetchPurchaseRequests = async (page = 0, size = 10) => {
    try {
      const data = await getPurchaseRequests(page, size);
      setPurchaseRequests(data.content || []);
      setTotalPages(data.totalPages || 1);
      setTotalElements(data.totalElements || 0);
    } catch (error) {
      console.error("❌ Error fetching purchase requests:", error);
    }
  };

  const getNextCode = async () => {
    try {
      const code = await getNextRequestCode();
      return code;
    } catch (error) {
      console.error("❌ Error getting next code:", error);
      throw error;
    }
  };

  const addRequest = useCallback(async (requestData) => {
    try {
      const result = await createPurchaseRequest(requestData);
      await fetchPurchaseRequests(); // Đảm bảo cập nhật danh sách
      return result;
    } catch (error) {
      console.error("Error adding request:", error);
      throw error;
    }
  }, []);

  const toggleStatus = async (requestId, currentStatus) => {
    try {
      const newStatus = currentStatus === "PENDING" ? "APPROVED" : "PENDING";
      const updatedRequest = await togglePurchaseRequestStatus(requestId, newStatus);
      setPurchaseRequests((prevRequests) =>
        prevRequests.map((request) =>
          request.purchaseRequestId === requestId ? { ...request, status: updatedRequest.status } : request
        )
      );
      return updatedRequest;
    } catch (error) {
      console.error("❌ Error toggling status:", error);
      throw error;
    }
  };

  useEffect(() => {
    fetchPurchaseRequests();
  }, []);

  return {
    purchaseRequests,
    totalPages,
    totalElements,
    fetchPurchaseRequests,
    getNextCode,
    addRequest,
    toggleStatus,
  };
};

export default usePurchaseRequest;