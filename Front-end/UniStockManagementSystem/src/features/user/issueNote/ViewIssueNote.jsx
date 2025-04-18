import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Card, CardBody, Typography, Button } from "@material-tailwind/react";
import { TextField, Button as MuiButton, Divider } from "@mui/material";
import PageHeader from "@/components/PageHeader";
import FilePreviewDialog from "@/components/FilePreviewDialog";
import useIssueNote from "./useIssueNote"; // Sử dụng hook chứa fetchIssueNoteDetail
import robotoFont from '@/assets/fonts/Roboto-Regular-normal.js';
import robotoBoldFont from '@/assets/fonts/Roboto-Regular-bold.js';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import "dayjs/locale/vi"; // Import Tiếng Việt
import Table from "@/components/Table";
import ReactPaginate from "react-paginate";
import { ArrowLeftIcon, ArrowRightIcon, ListBulletIcon, InformationCircleIcon } from "@heroicons/react/24/outline";
import { FaArrowLeft } from "react-icons/fa";

// Hàm định dạng ngày sử dụng dayjs
const formatDate = (dateStr) => dayjs(dateStr).format("DD/MM/YYYY");

const ViewIssueNote = () => {
  const { id } = useParams(); // id của Issue Note
  const navigate = useNavigate();
  // Lấy hàm fetchIssueNoteDetail từ hook useIssueNote
  const { fetchIssueNoteDetail } = useIssueNote();

  const [data, setData] = useState(null);
  const [creator, setCreator] = useState("Đang tải...");
  const [loading, setLoading] = useState(true);

  // Nếu Issue Note có tham chiếu đến đơn hàng (Sales Order) thì hiển thị link
  const [soReference, setSoReference] = useState("");

  // State phân trang cho bảng chi tiết hàng hóa
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  // State preview file đính kèm
  const [previewFile, setPreviewFile] = useState(null);

  const handlePreview = (file) => {
    setPreviewFile(file);
  };

  const handleClosePreview = () => {
    setPreviewFile(null);
  };

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        // Sử dụng fetchIssueNoteDetail từ hook để lấy chi tiết phiếu xuất theo id
        const issueNote = await fetchIssueNoteDetail(id);
        setData(issueNote);
        if (issueNote.createdBy) {
          setCreator(issueNote.createdByUserName);
        }
        // Nếu có tham chiếu (soId), cập nhật giá trị tham chiếu
        if (issueNote.soId) {
          setSoReference(`SO${issueNote.soCode}`);
        }
      } catch (err) {
        console.error("Lỗi khi tải phiếu xuất:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id, fetchIssueNoteDetail]);

  if (loading) return <Typography>Đang tải dữ liệu...</Typography>;
  if (!data) return <Typography className="text-red-500">Không tìm thấy phiếu xuất</Typography>;

  // Phân trang cho bảng chi tiết hàng hóa
  const totalItems = data.details ? data.details.length : 0;
  const totalPagesDetails = Math.ceil(totalItems / pageSize);
  const displayedItems = data.details ? data.details.slice(currentPage * pageSize, (currentPage + 1) * pageSize) : [];
  const displayedItemsWithIndex = displayedItems.map((item, idx) => ({
    ...item,
    index: currentPage * pageSize + idx,
    id: item.ginDetailsId ? item.ginDetailsId : currentPage * pageSize + idx,
  }));

  // Cấu hình các cột cho bảng chi tiết hàng hóa
  const viewColumnsConfig = [
    {
      field: "index",
      headerName: "STT",
      minWidth: 50,
      flex: 0.5,
      filterable: false,
      editable: false,
      renderCell: (params) => <div className="text-center">{params.row.index + 1}</div>,
    },
    {
      field: "code",
      headerName: "Mã hàng",
      minWidth: 100,
      flex: 1,
      filterable: false,
      editable: false,
      renderCell: (params) => (
        <div className="text-center">
          {params.row.materialCode || params.row.productCode || ""}
        </div>
      ),
    },
    {
      field: "name",
      headerName: "Tên hàng",
      minWidth: 150,
      flex: 2,
      filterable: false,
      editable: false,
      renderCell: (params) => (
        <div className="text-center">
          {params.row.materialName || params.row.productName || ""}
        </div>
      ),
    },
    {
      field: "unitName",
      headerName: "Đơn vị",
      minWidth: 80,
      flex: 1,
      filterable: false,
      editable: false,
      renderCell: (params) => (
        <div className="text-center">{params.row.unitName || "-"}</div>
      ),
    },
    {
      field: "quantity",
      headerName: "Số lượng",
      minWidth: 80,
      flex: 1,
      filterable: false,
      editable: false,
      renderCell: (params) => (
        <div className="text-center">
          {!isNaN(params.row.quantity) ? params.row.quantity : ""}
        </div>
      ),
    },
    {
      field: "warehouse",
      headerName: "Xuất kho",
      minWidth: 150,
      flex: 2,
      filterable: false,
      editable: false,
      renderCell: (params) => {
        const row = params.row;
        return (
          <div className="text-center">
            {row.warehouseCode && row.warehouseName
              ? `${row.warehouseCode} - ${row.warehouseName}`
              : ""}
          </div>
        );
      },
    },
  ];

  // Export PDF: tương tự ReceiptNote nhưng cập nhật tiêu đề và trường Issue Note
  const handleExportPDF = () => {
    const formatVietnameseDate = (dateString) => {
      const date = new Date(dateString);
      const day = date.getDate();
      const month = String(date.getMonth() + 1).padStart(2, '0'); // ✅ thêm 0 nếu cần
      const year = date.getFullYear();
      return `Ngày ${day} tháng ${month} năm ${year}`;
    };
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    doc.addFileToVFS("Roboto-Bold.ttf", robotoBoldFont);
    doc.addFont("Roboto-Bold.ttf", "Roboto", "bold");
    doc.addFileToVFS("Roboto-Regular.ttf", robotoFont);
    doc.addFont("Roboto-Regular.ttf", "Roboto", "normal");

    doc.setFont("Roboto", "bold");
    doc.setFontSize(14);
    doc.text("CÔNG TY TNHH THIÊN NGỌC AN", 14, 20);
    doc.setFont("Roboto", "normal");
    doc.setFontSize(10);
    doc.text("Đ/C: TL 419 KCN Phùng Xá, Huyện Thạch Thất, TP. Hà Nội", 14, 26);
    doc.text("SĐT: 0909.009.990", 14, 32);
    doc.setFont("Roboto", "bold");
    doc.text("Số phiếu: ", 160, 26);
    doc.setFont("Roboto", "normal");
    doc.text(`${data.ginCode}`, 176, 26);

    doc.setFont("Roboto", "bold");
    doc.setFontSize(20);
    doc.text("PHIẾU XUẤT KHO", 80, 40);
    doc.setFont("Roboto", "normal");
    doc.setFontSize(9);
    doc.text(formatVietnameseDate(data.issueDate), 110, 45, { align: "center" });

    doc.setFont("Roboto", "normal");
    doc.setFontSize(10);
    doc.text(`Người lập phiếu: ${creator}`, 14, 54);
    if (data.soCode) {
      doc.text(`Căn cứ theo đơn hàng: ${data.soCode}`, 140, 54);
    }
    doc.text(`Phân loại xuất kho: ${data.category}`, 14, 60);
    const descriptionText = `Diễn giải: ${data.description || "Không có"}`;
    const splitDescription = doc.splitTextToSize(descriptionText, 180); // 180mm là chiều rộng tối đa mong muốn
    doc.text(splitDescription, 14, 66);

    const descriptionLineCount = splitDescription.length;
    const descriptionHeight = descriptionLineCount * 5; // khoảng cách dòng

    const baseY = 66 + descriptionHeight;

    const totalQuantity = data.details.reduce((sum, item) => sum + (item.quantity || 0), 0);

    autoTable(doc, {
      startY: baseY,
      head: [[
        { content: "STT", styles: { halign: 'center', cellWidth: 12 } },
        { content: "Mã hàng", styles: { halign: 'center', cellWidth: 35 } },
        { content: "Tên hàng hóa", styles: { halign: 'center', cellWidth: 60 } },
        { content: "Đơn vị", styles: { halign: 'center' }, cellWidth: 20 },
        { content: "Số lượng xuất", styles: { halign: 'center' }, cellWidth: 20 },
        { content: "Kho xuất", styles: { halign: 'center' }, cellWidth: 40 }
      ]],
      body: [
        ...data.details.map((item, index) => [
          { content: index + 1, styles: { halign: 'center' } },
          { content: item.materialCode || item.productCode, styles: { halign: 'left' } },
          { content: item.materialName || item.productName, styles: { halign: 'left' } },
          { content: item.unitName || "-", styles: { halign: 'center' } },
          { content: item.quantity, styles: { halign: 'center' } },
          { content: item.warehouseName, styles: { halign: 'center' } }
        ]),
        [
          { content: "TỔNG CỘNG :", colSpan: 4, styles: { halign: 'right', fontStyle: 'bold' } },
          { content: totalQuantity, styles: { halign: 'center', fontStyle: 'bold' } },
          { content: "", styles: { halign: 'center' } },
        ]
      ],
      styles: {
        font: "Roboto",
        fontSize: 10,
        cellPadding: { top: 2, right: 2, bottom: 2, left: 2 },
        valign: 'middle',
        lineWidth: 0.2,
      },
      headStyles: {
        fillColor: [240, 240, 240],
        textColor: 20,
        fontSize: 10,
        lineWidth: 0.2,
        cellPadding: { top: 3, bottom: 3 },
      },
      bodyStyles: {
        textColor: 20,
        lineWidth: 0.2,
      },
      alternateRowStyles: { fillColor: [255, 255, 255] },
      tableLineWidth: 0.2,
      tableLineColor: 200,
      margin: { top: 0, left: 14, right: 14 },
    });

    const finalY = doc.lastAutoTable.finalY + 12;
    // Căn đều 3 cột trên cùng 1 hàng
    doc.setFont("Roboto", "bold");
    doc.setFontSize(10);
    doc.text("Người giao hàng", 20, finalY);
    doc.text("Nhân viên kho xuất hàng", 90, finalY);
    doc.text("Thủ kho", 175, finalY);
    doc.setFont("Roboto", "normal");
    doc.setFontSize(8);
    doc.text("(Ký, họ tên)", 32, finalY + 5, { align: "center" });
    doc.text("(Ký, họ tên)", 110, finalY + 5, { align: "center" });
    doc.text("(Ký, họ tên)", 182, finalY + 5, { align: "center" });

    doc.save(`PhieuXuat_${data.ginCode}.pdf`);
  };

  const handleExportExcel = () => {
    const sheetData = [
      ["Mã phiếu xuất", data.ginCode],
      ["Ngày tạo", formatDate(data.issueDate)],
      ["Người tạo", creator],
      ["Loại hàng hóa", data.category],
      ["Diễn giải", data.description || "Không có"],
      [],
      ["STT", "Mã hàng", "Tên hàng", "Đơn vị", "Số lượng", "Xuất kho"],
      ...data.details.map((item, index) => [
        index + 1,
        item.materialCode || item.productCode,
        item.materialName || item.productName,
        item.unitName || "-",
        item.quantity,
        item.warehouseName,
      ]),
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "PhieuXuat");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([excelBuffer]), `PhieuXuat_${data.ginCode}.xlsx`);
  };

  // Phân trang cho bảng chi tiết hàng hóa
  const handleDetailPageChange = ({ selected }) => {
    setCurrentPage(selected);
  };

  return (
    <div className="mb-8 flex flex-col gap-12">
      <Card className="bg-gray-50 p-7 rounded-none shadow-none">
        <CardBody className="pb-2 bg-white rounded-xl">
          <PageHeader
            title={`Chi tiết phiếu xuất ${data.ginCode}`}
            showAdd={false}
            showImport={false}
            showExport={true}
            onExport={handleExportPDF}
            extraActions={
              <Button
                size="sm"
                color="blue"
                variant="outlined"
                onClick={handleExportExcel}
              >
                Xuất Excel
              </Button>
            }
          />
          <Typography variant="h6" className="flex items-center mb-4 text-black">
            <InformationCircleIcon className="h-5 w-5 mr-2" />
            Thông tin chung
          </Typography>

          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <Typography variant="medium" className="mb-1 text-black">
                Mã phiếu xuất
              </Typography>
              <TextField
                fullWidth
                size="small"
                color="success"
                variant="outlined"
                disabled
                value={data.ginCode}
                sx={{
                  "& .MuiInputBase-root.Mui-disabled": {
                    bgcolor: "#eeeeee",
                    "& .MuiOutlinedInput-notchedOutline": {
                      border: "none",
                    },
                  },
                }}
              />
            </div>
            <div>
              <Typography variant="medium" className="mb-1 text-black">
                Phân loại hàng xuất
              </Typography>
              <TextField
                fullWidth
                size="small"
                color="success"
                variant="outlined"
                disabled
                value={data.category}
                sx={{
                  "& .MuiInputBase-root.Mui-disabled": {
                    bgcolor: "#eeeeee",
                    "& .MuiOutlinedInput-notchedOutline": {
                      border: "none",
                    },
                  },
                }}
              />
            </div>
            <div>
              <Typography variant="medium" className="mb-1 text-black">
                Ngày tạo phiếu
              </Typography>
              <style>
                {`.MuiPickersCalendarHeader-label { text-transform: capitalize !important; }`}
              </style>
              <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="vi">
                <DatePicker
                  value={data.issueDate ? dayjs(data.issueDate) : null}
                  disabled
                  format="DD/MM/YYYY"
                  dayOfWeekFormatter={(weekday) => `${weekday.format("dd")}`}
                  slotProps={{
                    textField: {
                      hiddenLabel: true,
                      fullWidth: true,
                      size: "small",
                    },
                  }}
                  sx={{
                    '& .MuiInputBase-root.Mui-disabled': {
                      bgcolor: '#eeeeee',
                      '& .MuiOutlinedInput-notchedOutline': {
                        border: 'none',
                      },
                    },
                  }}
                />
              </LocalizationProvider>
            </div>
            <div>
              <Typography variant="medium" className="mb-1 text-black">
                Người tạo phiếu
              </Typography>
              <TextField
                fullWidth
                size="small"
                color="success"
                variant="outlined"
                disabled
                value={creator}
                sx={{
                  '& .MuiInputBase-root.Mui-disabled': {
                    bgcolor: '#eeeeee',
                    '& .MuiOutlinedInput-notchedOutline': {
                      border: 'none',
                    },
                  },
                }}
              />
            </div>
            <div>
              <Typography variant="medium" className="mb-1 text-black">
                Tham chiếu chứng từ
              </Typography>
              {data.soId ? (
                <Link
                  to={`/user/sale-orders/${data.soId}`}
                  className="text-blue-600 hover:underline text-sm block mt-1"
                >
                  {`${data.soCode}`}
                </Link>
              ) : (
                <TextField
                  fullWidth
                  size="small"
                  color="success"
                  variant="outlined"
                  disabled
                  value="Không có"
                  sx={{
                    '& .MuiInputBase-root.Mui-disabled': {
                      bgcolor: '#eeeeee',
                      '& .MuiOutlinedInput-notchedOutline': {
                        border: 'none',
                      },
                    },
                  }}
                />
              )}
            </div>
            <div>
              <Typography variant="medium" className="mb-1 text-black">
                File đính kèm
              </Typography>
              {data.paperEvidence && data.paperEvidence.length > 0 ? (
                <div className="grid grid-cols-3 gap-2 mt-1">
                  {data.paperEvidence.map((url, index) => (
                    <MuiButton
                      key={index}
                      variant="outlined"
                      color="primary"
                      disableElevation
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'start',
                        padding: 0,
                      }}
                      className="text-xs w-full gap-2"
                    >
                      <span
                        className="truncate max-w-[100%] px-2 py-1"
                        onClick={() => handlePreview(url)}
                      >
                        {url.split("/").pop()}
                      </span>
                    </MuiButton>
                  ))}
                </div>
              ) : (
                <Typography variant="small" className="text-gray-600">
                  Không có
                </Typography>
              )}
              <FilePreviewDialog
                file={previewFile}
                open={!!previewFile}
                onClose={handleClosePreview}
                showDownload={true}
              />
            </div>
          </div>

          {/* Diễn giải */}
          <div className="grid grid-cols-1 gap-4 mb-6">
            <div>
              <Typography variant="medium" className="mb-1 text-black">
                Diễn giải xuất kho
              </Typography>
              <TextField
                fullWidth
                size="small"
                hiddenLabel
                multiline
                rows={4}
                color="success"
                value={data.description || "Không có"}
                disabled
                sx={{
                  '& .MuiInputBase-root.Mui-disabled': {
                    bgcolor: '#eeeeee',
                    '& .MuiOutlinedInput-notchedOutline': {
                      border: 'none',
                    },
                  },
                }}
              />
            </div>
          </div>

          <Typography variant="h6" className="flex items-center mb-4 text-black">
            <ListBulletIcon className="h-5 w-5 mr-2" />
            Danh sách hàng hóa
          </Typography>
          <div className="overflow-auto border rounded">
            <Table
              data={displayedItemsWithIndex}
              columnsConfig={viewColumnsConfig}
              enableSelection={false}
            />
          </div>

          {/* Phân trang cho bảng hàng hóa */}
          {totalItems > 0 && (
            <div className="flex items-center justify-between py-4">
              <div className="flex items-center gap-2">
                <Typography variant="small" color="blue-gray" className="font-normal">
                  Trang {currentPage + 1} / {totalPagesDetails} • {totalItems} bản ghi
                </Typography>
              </div>
              <ReactPaginate
                previousLabel={<ArrowLeftIcon strokeWidth={2} className="h-4 w-4" />}
                nextLabel={<ArrowRightIcon strokeWidth={2} className="h-4 w-4" />}
                breakLabel="..."
                pageCount={totalPagesDetails}
                marginPagesDisplayed={2}
                pageRangeDisplayed={5}
                onPageChange={({ selected }) => setCurrentPage(selected)}
                containerClassName="flex items-center gap-1"
                pageClassName="h-8 min-w-[32px] flex items-center justify-center rounded-md text-xs text-gray-700 border border-gray-300 hover:bg-[#0ab067] hover:text-white"
                pageLinkClassName="flex items-center justify-center w-full h-full"
                previousClassName="h-8 min-w-[32px] flex items-center justify-center rounded-md text-xs text-gray-700 border border-gray-300 hover:bg-gray-100"
                nextClassName="h-8 min-w-[32px] flex items-center justify-center rounded-md text-xs text-gray-700 border border-gray-300 hover:bg-gray-100"
                breakClassName="h-8 min-w-[32px] flex items-center justify-center rounded-md text-xs text-gray-700"
                activeClassName="bg-[#0ab067] text-white border-[#0ab067] hover:bg-[#0ab067]"
                forcePage={currentPage}
                disabledClassName="opacity-50 cursor-not-allowed"
              />
            </div>
          )}
          <Divider />
          <div className="pt-4 pb-3 flex justify-start">
            <MuiButton
              color="info"
              size="medium"
              variant="outlined"
              sx={{
                height: "36px",
                color: "#616161",
                borderColor: "#9e9e9e",
                "&:hover": {
                  backgroundColor: "#f5f5f5",
                  borderColor: "#757575",
                },
              }}
              onClick={() => navigate("/user/issueNote")}
              className="flex items-center gap-2"
            >
              <FaArrowLeft className="h-3 w-3" /> Quay lại
            </MuiButton>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default ViewIssueNote;
