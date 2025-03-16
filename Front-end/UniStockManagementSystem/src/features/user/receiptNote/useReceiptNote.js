import { useState } from "react";
import {
  fetchReceiptNotes,
  createReceiptNote,
  updateReceiptNote,
  deleteReceiptNote,
  getNextCode
} from "./receiptNoteService";

const useReceiptNote = () => {
  const [receiptNotes, setReceiptNotes] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Fetch paginated receipt notes
  const fetchPaginatedReceiptNotes = async (page, size) => {
    try {
      const response = await fetchReceiptNotes(page, size);
      setReceiptNotes(response.data || []);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
    } catch (error) {
      console.error("Error fetching receipt notes:", error);
    }
  };

  const getNextCode = async () => {
      try {
        const code = await getNextCode();
        console.log(" Mã phiếu nhập:", code);
        return code; 
      } catch (error) {
        console.error("❌ Lỗi khi lấy mã đơn hàng tiếp theo:", error);
        throw error;
      }
    };
  

  // Add a new receipt note
  const addReceiptNote = async (receiptNote) => {
    try {
      const response = await createReceiptNote(receiptNote);
      fetchPaginatedReceiptNotes(0, 10); // Refresh the list after adding
      return response;
    } catch (error) {
      console.error("Error creating receipt note:", error);
      throw error;
    }
  };

  // Edit an existing receipt note
  const editReceiptNote = async (receiptNoteId, updatedReceiptNote) => {
    try {
      const response = await updateReceiptNote(receiptNoteId, updatedReceiptNote);
      fetchPaginatedReceiptNotes(0, 10); // Refresh the list after editing
      return response;
    } catch (error) {
      console.error("Error updating receipt note:", error);
      throw error;
    }
  };

  // Delete a receipt note
  const removeReceiptNote = async (receiptNoteId) => {
    try {
      await deleteReceiptNote(receiptNoteId);
      fetchPaginatedReceiptNotes(0, 10); // Refresh the list after deleting
    } catch (error) {
      console.error("Error deleting receipt note:", error);
      throw error;
    }
  };

  return {
    receiptNotes,
    totalPages,
    totalElements,
    fetchPaginatedReceiptNotes,
    addReceiptNote,
    editReceiptNote,
    removeReceiptNote,
    getNextCode
  };
};

export default useReceiptNote;