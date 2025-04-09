import { useState, useEffect } from "react";
import { createIssueNote, getIssueNote, getIssueNotes, getNextCode, getSaleOrders } from "./issueNoteService";


const useIssueNote = (page = 0, size = 10) => {
  const [saleOrders, setSaleOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Hàm lấy danh sách Sale Orders (API trả về đối tượng chứa key "content")
  const fetchSaleOrders = async () => {
    setLoading(true);
    try {
      const data = await getSaleOrders(page, size);

      console.log("Dữ liệu sale orders:", data);
      setSaleOrders(data.content || []);
    } catch (err) {
      console.error("Lỗi khi lấy Sale Orders:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchIssueNotes = async () => {
    setLoading(true);
    try {
      const data = await getIssueNotes(page, size);
      console.log("Dữ liệu issue notes:", data);
      setIssueNotes(data.content || []);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
    } catch (err) {
      console.error("Lỗi khi lấy Issue Notes:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchIssueNoteDetail = async (id) => {
    setLoading(true);
    try {
      const data = await getIssueNote(id);
      return data;
    } catch (err) {
      console.error("Lỗi khi lấy chi tiết Issue Note:", err);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Hàm thêm phiếu xuất kho
  const addIssueNote = async (noteData) => {
    try {
      const result = await createIssueNote(noteData);
      return result;
    } catch (err) {
      throw err;
    }
  };

  // Hàm lấy mã phiếu xuất kho kế tiếp
  const fetchNextCode = async () => {
    try {
      const result = await getNextCode();
      return result;
    } catch (err) {
      throw err;
    }
  };

  useEffect(() => {
    fetchSaleOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, size]);

  return { saleOrders, loading, error, fetchSaleOrders, addIssueNote, fetchNextCode, fetchIssueNotes, fetchIssueNoteDetail };
};

export default useIssueNote;
