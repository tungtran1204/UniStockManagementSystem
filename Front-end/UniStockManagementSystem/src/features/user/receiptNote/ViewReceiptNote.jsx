import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Card,
  CardBody,
  Typography,
  Button,
  Input,
  Textarea
} from "@material-tailwind/react";
import PageHeader from '@/components/PageHeader';
import useReceiptNote from "./useReceiptNote";
import useUser from "../../admin/users/useUser";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import robotoFont from '@/assets/fonts/Roboto-Regular-normal.js';

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
        console.log("Phiếu nhập: ",receipt);
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

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const handleExportPDF = () => {
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    doc.addFileToVFS("Roboto-Regular.ttf", robotoFont);
    doc.addFont("Roboto-Regular.ttf", "Roboto", "normal");
    doc.setFont("Roboto");
    // doc.addImage(
    //   '/path/to/logo.png', // bạn sẽ cần convert ảnh thành base64 hoặc import bằng Vite
    //   'PNG',
    //   50, 90, // vị trí X, Y
    //   100, 100, // kích thước width, height
    //   undefined,
    //   'NONE',
    //   0.1 // opacity (0.0 – 1.0)
    // );

    doc.setFontSize(14);
    doc.text("CÔNG TY TNHH THIÊN NGỌC AN", 14, 20);
    doc.setFontSize(10);
    doc.text("Đ/C: TL 419 KCN Phùng Xá, Huyện Thạch Thất, TP. Hà Nội", 14, 26);
    doc.text("SĐT: 0909.009.990", 14, 32);

    doc.setFontSize(13);
    doc.text("PHIẾU NHẬP KHO", 90, 40);

    doc.setFontSize(10);
    doc.text(`Số phiếu: ${data.grnCode}`, 14, 48);
    doc.text(`Loại hàng hóa: ${data.category}`, 14, 60);
    doc.text(`Diễn giải: ${data.description || "Không có"}`, 14, 66);
    doc.text(`Ngày tạo: ${formatDate(data.receiptDate)}`, 140, 48);
    doc.text(`Người tạo: ${creator}`, 140, 54);
   

    autoTable(doc, {
      startY: 74,
      head: [[
        { content: "STT", styles: { halign: 'center' } },
        { content: "Mã hàng", styles: { halign: 'center' } },
        { content: "Tên hàng hóa", styles: { halign: 'center' } },
        { content: "Đơn vị", styles: { halign: 'center' } },
        { content: "Số lượng nhập", styles: { halign: 'center' } }
      ]],
      body: data.details.map((item, index) => [
        { content: index + 1, styles: { halign: 'center' } },
        { content: item.materialCode || item.productCode, styles: { halign: 'left' } },
        { content: item.materialName || item.productName, styles: { halign: 'left' } },
        { content: item.unitName || "-", styles: { halign: 'center' } },
        { content: item.quantity, styles: { halign: 'center' } },
      ]),
      styles: {
        font: "Roboto",
        fontSize: 10,
        cellPadding: { top: 2, right: 2, bottom: 2, left: 2 },
        valign: 'middle'
      },
      headStyles: {
        fillColor: [230, 230, 230],
        textColor: 20,
        fontStyle: 'bold',
        fontSize: 10
      },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      tableLineWidth: 0.2,
      tableLineColor: 200,
      margin: { top: 0, left: 14, right: 14 },
    });

    // doc.setTextColor(200, 0, 0); // đỏ đậm
    // doc.setFontSize(40);
    // doc.setFont("Roboto", "bold");
    // doc.text("ĐÃ NHẬP KHO", 105, 150, {
    //   align: "center",
    //   angle: -20
    // });

    const finalY = doc.lastAutoTable.finalY + 12;
    doc.text("Người giao hàng", 20, finalY);
    doc.text("Nhân viên kho nhận hàng", 150, finalY);
    doc.text("Thủ kho", 20, finalY + 30);

    doc.save(`PhieuNhap_${data.grnCode}.pdf`);
  };

  const handleExportExcel = () => {
    const sheetData = [
      ["Mã phiếu nhập", data.grnCode],
      ["Ngày tạo", formatDate(data.receiptDate)],
      ["Người tạo", creator],
      ["Loại hàng hóa", data.category],
      ["Diễn giải", data.description || "Không có"],
      [],
      ["STT", "Mã hàng", "Tên hàng", "Đơn vị", "Số lượng"],
      ...data.details.map((item, index) => [
        index + 1,
        item.materialCode || item.productCode,
        item.materialName || item.productName,
        item.unitName || "-",
        item.quantity,
      ]),
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "PhieuNhap");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([excelBuffer]), `PhieuNhap_${data.grnCode}.xlsx`);
  };

  if (loading) return <Typography>Đang tải dữ liệu...</Typography>;
  if (!data) return <Typography className="text-red-500">Không tìm thấy phiếu nhập</Typography>;

  return (
    <div className="mb-8 flex flex-col gap-12">
      <Card className="bg-gray-50 p-7 rounded-none shadow-none">
        <CardBody className="pb-2 bg-white rounded-xl">
          <PageHeader
            title={`Chi tiết phiếu nhập ${data.grnCode}`}
            showAdd={false}
            showImport={false}
            showExport={true}
            onExport={handleExportPDF} // export PDF mặc định
            extraActions={
              <Button size="sm" color="blue" variant="outlined" onClick={handleExportExcel}>
                Xuất Excel
              </Button>
            }
          />
          <Typography variant="h6" className="mb-2 text-gray-700 text-sm font-semibold">
            Thông tin chung
          </Typography>

          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <Typography variant="small">Mã phiếu nhập</Typography>
              <Input value={data.grnCode} disabled className="bg-gray-100" />
            </div>
            <div>
              <Typography variant="small">Loại hàng hóa</Typography>
              <Input value={data.category || ""} disabled className="bg-gray-100" />
            </div>
            <div>
              <Typography variant="small">Ngày tạo phiếu</Typography>
              <Input value={formatDate(data.receiptDate)} disabled className="bg-gray-100" />
            </div>
            <div>
              <Typography variant="small">Người tạo</Typography>
              <Input value={creator} disabled className="bg-gray-100" />
            </div>
            <div>
              <Typography variant="small">Tham chiếu chứng từ</Typography>
              {data.poId ? (
                <Link
                  to={`/user/purchaseOrder/${data.poId}`}
                  className="text-blue-600 hover:underline text-sm block mt-1"
                >
                  Xem đơn mua hàng ({data.poId})
                </Link>
              ) : (
                <Input value="Không có" disabled className="bg-gray-100" />
              )}
            </div>
          </div>

          {/* Diễn giải và file đính kèm */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <Typography variant="small">Diễn giải</Typography>
              <Textarea value={data.description || "Không có"} disabled className="bg-gray-100" />
            </div>
            <div>
              <Typography variant="small">File đính kèm</Typography>
              {data.paperEvidence && data.paperEvidence.length > 0 ? (
                <ul className="list-disc list-inside text-sm text-blue-700">
                  {data.paperEvidence.map((url, index) => (
                    <li key={index}>
                      <a href={url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                        {url.split("/").pop()}
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <Typography variant="small" className="text-gray-600">Không có</Typography>
              )}
            </div>
          </div>

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
