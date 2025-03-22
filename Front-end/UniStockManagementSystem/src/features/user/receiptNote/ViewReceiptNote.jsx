import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Card,
  CardBody,
  Typography,
  Button,
} from "@material-tailwind/react";
import PageHeader from '@/components/PageHeader';
import useReceiptNote from "./useReceiptNote";
import useUser from "../../admin/users/useUser";

const ViewReceiptNote = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getReceiptNote } = useReceiptNote();
  const { getUserById } = useUser();
  const [data, setData] = useState(null);
  const [creator, setCreator] = useState("Đang tải...");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const receipt = await getReceiptNote(id);
        setData(receipt);

        if (receipt.createdBy) {
          const user = await getUserById(receipt.createdBy);
          setCreator(user.username || user.email || "Không xác định");
        }
      } catch (err) {
        console.error("Lỗi khi tải phiếu nhập kho:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  if (loading) return <Typography>Đang tải dữ liệu...</Typography>;
  if (!data) return <Typography className="text-red-500">Không tìm thấy phiếu nhập</Typography>;

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="mb-8 flex flex-col gap-12">
      <Card className="bg-gray-50 p-7 rounded-none shadow-none">
        <CardBody className="pb-2 bg-white rounded-xl">
          <PageHeader title={`Chi tiết phiếu nhập ${data.grnCode}`} showAdd={false} showImport={false} showExport={false} />

          {/* Thông tin chung */}
          <Typography variant="h6" className="mb-2 text-gray-700 text-sm font-semibold">
            Thông tin chung
          </Typography>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <Typography variant="small">Mã phiếu nhập</Typography>
              <div className="text-sm mt-1">{data.grnCode}</div>
            </div>
            <div>
              <Typography variant="small">Loại hàng hóa</Typography>
              <div className="text-sm mt-1">{data.category}</div>
            </div>
            <div>
              <Typography variant="small">Ngày tạo phiếu</Typography>
              <div className="text-sm mt-1">{formatDate(data.receiptDate)}</div>
            </div>
            <div>
              <Typography variant="small">Người tạo</Typography>
              <div className="text-sm mt-1">{creator}</div>
            </div>
            <div>
              <Typography variant="small">Tham chiếu chứng từ</Typography>
              {data.poId ? (
                <Link
                  to={`/user/purchaseOrder/${data.poId}`}
                  className="text-blue-600 hover:underline text-sm mt-1 block"
                >
                  Xem đơn mua hàng ({data.poId})
                </Link>
              ) : (
                <div className="text-sm mt-1">Không có</div>
              )}
            </div>
            <div>
              <Typography variant="small">Diễn giải</Typography>
              <div className="text-sm mt-1 whitespace-pre-wrap">{data.description || "Không có"}</div>
            </div>
          </div>

          {/* Bảng chi tiết hàng hóa */}
          <Typography variant="h6" className="mb-2 text-gray-700 text-sm font-semibold">
            Danh sách hàng hóa
          </Typography>
          <div className="overflow-auto border rounded">
            <table className="w-full table-auto text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 border">STT</th>
                  <th className="p-2 border">Mã hàng</th>
                  <th className="p-2 border">Tên hàng</th>
                  <th className="p-2 border">Đơn vị</th>
                  <th className="p-2 border">Số lượng</th>
                </tr>
              </thead>
              <tbody>
                {data.details && data.details.length > 0 ? (
                  data.details.map((item, index) => (
                    <tr key={index}>
                      <td className="p-2 border text-center">{index + 1}</td>
                      <td className="p-2 border">{item.materialCode || item.productCode}</td>
                      <td className="p-2 border">{item.materialName || item.productName}</td>
                      <td className="p-2 border text-center">{item.unitName || "-"}</td>
                      <td className="p-2 border text-center">{item.quantity}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="p-4 text-center text-gray-500">Không có dữ liệu hàng hóa</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Nút quay lại */}
          <div className="mt-6 border-t pt-4 flex justify-end">
            <Button
              size="sm"
              color="blue"
              onClick={() => navigate("/user/receiptNote")}
            >
              Quay lại danh sách
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default ViewReceiptNote;
