import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Card, CardBody, Typography, Button } from "@material-tailwind/react";
import { TextField, Button as MuiButton } from "@mui/material";
import PageHeader from "@/components/PageHeader";
import FilePreviewDialog from "@/components/FilePreviewDialog";
import useIssueNote from "./useIssueNote"; // Sử dụng hook chứa fetchIssueNoteDetail
import useUser from "../../admin/users/useUser";
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
import { XMarkIcon } from "@heroicons/react/24/solid";
import { Dialog, DialogTitle, DialogContent, IconButton } from "@mui/material";

// Hàm định dạng ngày sử dụng dayjs
const formatDate = (dateStr) => dayjs(dateStr).format("DD/MM/YYYY");

const ViewIssueNote = () => {
  const { id } = useParams(); // id của Issue Note
  const navigate = useNavigate();
  // Lấy hàm fetchIssueNoteDetail từ hook useIssueNote
  const { fetchIssueNoteDetail } = useIssueNote();
  const { getUserById } = useUser();

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

  // Các hàm xử lý preview file
  const getPreviewURL = (file) => {
    if (!file) return "";
    if (file instanceof File) return URL.createObjectURL(file);
    if (typeof file === "string") return file;
    return "";
  };

  const getPreviewType = (file) => {
    if (!file) return "other";
    let filename = "";
    if (file instanceof File) {
      filename = file.name;
    } else if (typeof file === "string") {
      const parts = file.split("/");
      filename = parts[parts.length - 1].split("?")[0];
    } else {
      return "other";
    }
    const extension = filename.split(".").pop().toLowerCase();
    if (["jpg", "jpeg", "png", "gif"].includes(extension)) return "image";
    if (extension === "pdf") return "pdf";
    if (["doc", "docx", "xls", "xlsx", "ppt", "pptx"].includes(extension))
      return "office";
    return "other";
  };

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
          const user = await getUserById(issueNote.createdBy);
          setCreator(user.username || user.email || "Không xác định");
        }
        // Nếu có tham chiếu (soId), cập nhật giá trị tham chiếu
        if (issueNote.soId) {
          setSoReference(`SO${issueNote.soId}`);
        }
      } catch (err) {
        console.error("Lỗi khi tải phiếu xuất:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id, getUserById, fetchIssueNoteDetail]);

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
      renderCell: (params) => <div className="text-center">{params.row.index + 1}</div>,
    },
    {
      field: "code",
      headerName: "Mã hàng",
      minWidth: 100,
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
      renderCell: (params) => (
        <div className="text-center">{params.row.unitName || "-"}</div>
      ),
    },
    {
      field: "quantity",
      headerName: "Số lượng",
      minWidth: 80,
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
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    doc.setFontSize(14);
    doc.text("CÔNG TY TNHH THIÊN NGỌC AN", 14, 20);
    doc.setFontSize(10);
    doc.text("Đ/C: TL 419 KCN Phùng Xá, Huyện Thạch Thất, TP. Hà Nội", 14, 26);
    doc.text("SĐT: 0909.009.990", 14, 32);
    doc.setFontSize(13);
    doc.text("PHIẾU XUẤT KHO", 90, 40);
    doc.setFontSize(10);
    doc.text(`Số phiếu: ${data.ginCode}`, 14, 48);
    doc.text(`Loại hàng hóa: ${data.category}`, 14, 60);
    doc.text(`Diễn giải: ${data.description || "Không có"}`, 14, 66);
    doc.text(`Ngày tạo: ${formatDate(data.issueDate)}`, 140, 48);
    doc.text(`Người tạo: ${creator}`, 140, 54);

    autoTable(doc, {
      startY: 74,
      head: [
        [
          { content: "STT", styles: { halign: "center" } },
          { content: "Mã hàng", styles: { halign: "center" } },
          { content: "Tên hàng", styles: { halign: "center" } },
          { content: "Đơn vị", styles: { halign: "center" } },
          { content: "Số lượng xuất", styles: { halign: "center" } },
          { content: "Xuất kho", styles: { halign: "center" } },
        ],
      ],
      body: data.details.map((item, index) => [
        { content: index + 1, styles: { halign: "center" } },
        { content: item.materialCode || item.productCode, styles: { halign: "left" } },
        { content: item.materialName || item.productName, styles: { halign: "left" } },
        { content: item.unitName || "-", styles: { halign: "center" } },
        { content: item.quantity, styles: { halign: "center" } },
        { content: item.warehouseName, styles: { halign: "center" } },
      ]),
      styles: { fontSize: 10, cellPadding: 2, valign: "middle" },
      headStyles: { fillColor: [230, 230, 230], fontStyle: "bold", fontSize: 10 },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      margin: { top: 0, left: 14, right: 14 },
    });

    const finalY = doc.lastAutoTable.finalY + 12;
    doc.text("Người giao hàng", 20, finalY);
    doc.text("Nhân viên kho nhận hàng", 150, finalY);
    doc.text("Thủ kho", 20, finalY + 30);

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
                  {soReference || `SO${data.soId}`}
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
              {/* <Dialog open={!!previewFile} onClose={handleClosePreview} maxWidth="md" fullWidth>
                <div className="flex justify-between items-center mr-6">
                  <DialogTitle>{previewFile?.name}</DialogTitle>
                  <IconButton size="sm" variant="text" onClick={handleClosePreview}>
                    <XMarkIcon className="h-6 w-6 stroke-2" />
                  </IconButton>
                </div>
                <DialogContent dividers>
                  {previewFile &&
                    (() => {
                      const type = getPreviewType(previewFile);
                      const url = getPreviewURL(previewFile);
                      const renderActions = (
                        <div className="mt-4 flex justify-center gap-4">
                          <MuiButton
                            color="info"
                            size="medium"
                            variant="outlined"
                            onClick={() => window.open(url, "_blank")}
                            className="flex items-center gap-2"
                          >
                            Tải về
                          </MuiButton>
                        </div>
                      );
                      switch (type) {
                        case "image":
                          return (
                            <>
                              <img
                                src={url}
                                alt="Image Preview"
                                style={{
                                  display: "block",
                                  maxWidth: "100%",
                                  maxHeight: "80vh",
                                  margin: "0 auto",
                                }}
                              />
                              {renderActions}
                            </>
                          );
                        case "pdf":
                          return (
                            <>
                              <iframe
                                src={url}
                                title="PDF Preview"
                                style={{
                                  width: "100%",
                                  height: "80vh",
                                  border: "none",
                                }}
                              />
                              {renderActions}
                            </>
                          );
                        default:
                          return (
                            <div className="text-center">
                              <Typography>Không thể xem trước file.</Typography>
                              <MuiButton
                                color="info"
                                size="medium"
                                variant="outlined"
                                onClick={() => window.open(url, "_blank")}
                                className="flex items-center gap-2"
                              >
                                Tải về
                              </MuiButton>
                            </div>
                          );
                      }
                    })()}
                </DialogContent>
              </Dialog> */}
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
            <div className="flex items-center justify-between pt-4">
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
                pageClassName="h-8 min-w-[32px] flex items-center justify-center rounded-md text-xs text-gray-700 border border-gray-300 hover:bg-gray-100"
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

          <div className="mt-6 border-t pt-4 flex justify-end">
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
