import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Button,
  Input,
  Select,
  Option,
  Textarea,
} from "@material-tailwind/react";
import { useNavigate } from "react-router-dom";
import ReactPaginate from "react-paginate";
import { ArrowLeftIcon, ArrowRightIcon } from "@heroicons/react/24/outline";

const AddReceiptNote = () => {
  const navigate = useNavigate();

  const [orderType, setOrderType] = useState("Mua hàng vật tư");
  const [supplierCode, setSupplierCode] = useState("NC001");
  const [supplierName, setSupplierName] = useState("Công ty A");
  const [address, setAddress] = useState("Hà Nội");
  const [contactPerson, setContactPerson] = useState("Nguyễn Văn A");
  const [phone, setPhone] = useState("0987654321");
  const [orderDate, setOrderDate] = useState("2024-10-13");
  const [description, setDescription] = useState("");
  const [referenceDocument, setReferenceDocument] = useState("");
  const [files, setFiles] = useState([]); // Cập nhật để hỗ trợ nhiều file;

  // Danh sách sản phẩm
  const [products, setProducts] = useState([
    { id: 1, code: "UNI01_27", name: "Product name", unit: "Cái", warehouse: "KTP", quantity: 4 },
    { id: 2, code: "UNI02_44", name: "Product name", unit: "Cái", warehouse: "KTP", quantity: 4 },
    { id: 3, code: "UNI01_98", name: "Product name", unit: "Cái", warehouse: "KTP", quantity: 4 },
  ]);

  // Xử lý upload file
  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);

    if (selectedFiles.length + files.length > 3) {
      alert("Tải lên tối đa 3 file!");
      return;
    }

    setFiles([...files, ...selectedFiles]);
  };

  const handleRemoveFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  // Phân trang
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const totalPages = Math.ceil(products.length / pageSize);
  const totalElements = products.length;

  // Kiểm tra nếu currentPage > totalPages khi dữ liệu thay đổi
  useEffect(() => {
    if (currentPage >= totalPages) {
      setCurrentPage(totalPages > 0 ? totalPages - 1 : 0);
    }
  }, [products, totalPages]);

  const handlePageChange = ({ selected }) => {
    setCurrentPage(selected);
  };

  const handleAddRow = () => {
    setProducts([
      ...products,
      { id: products.length + 1, code: "", name: "Product name", unit: "Cái", warehouse: "KTP", quantity: 0 },
    ]);
  };

  const handleRemoveRow = (id) => {
    const updatedProducts = products.filter((product) => product.id !== id);
    setProducts(updatedProducts);

    if (updatedProducts.length === 0) {
      setCurrentPage(0);
    }
  };

  const handleRemoveAllRows = () => {
    setProducts([]);
    setCurrentPage(0);
  };

  // Lấy danh sách sản phẩm hiển thị theo trang hiện tại
  const displayedProducts = products.slice(currentPage * pageSize, (currentPage + 1) * pageSize);

  return (
    <div className="mt-6 mb-8 flex flex-col gap-6">
      <Card>
        {/* Header */}
        <CardHeader variant="gradient" color="gray" className="mb-6 p-4 flex justify-between items-center">
          <Typography variant="h6" color="white">
            Phiếu xuất kho NK00009
          </Typography>
          <div className="w-56">
            <Select value={orderType} onChange={(value) => setOrderType(value)}>
              <Option value="Xuất kho thành phẩm">Xuất kho thành phẩm</Option>
              <Option value="Nhập kho nội bộ">Xuất kho nội bộ</Option>
            </Select>
          </div>
        </CardHeader>

        <CardBody className="px-6 text-sm">
          {/* Thông tin chung */}
          <Typography variant="h6" className="mb-2 text-gray-700 text-sm font-semibold">
            Thông tin chung
          </Typography>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <Typography variant="small">Tham chiếu chứng từ gốc</Typography>
              <Select
                className="!border-t-blue-gray-200 focus:!border-t-gray-900"
                labelProps={{
                  className: "before:content-none after:content-none",
                }}
                value={referenceDocument} onChange={setReferenceDocument}>
                <Option value="Chứng từ A">Chứng từ A</Option>
                <Option value="Chứng từ B">Chứng từ B</Option>
              </Select>
            </div>
            <div>
              <Typography variant="small">Ngày tạo phiếu</Typography>
              <Input
                type="date"
                value={orderDate}
                className="!border-t-blue-gray-200 focus:!border-t-gray-900"
                labelProps={{
                  className: "before:content-none after:content-none",
                }}
                onChange={(e) => setOrderDate(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <Typography variant="small">Mã đối tác</Typography>
              <Input value={supplierCode} disabled className="bg-gray-100" />
            </div>
            <div>
              <Typography variant="small">Tên đối tác</Typography>
              <Input value={supplierName} disabled />
            </div>
            <div className="col-span-2">
              <Typography variant="small">Địa chỉ</Typography>
              <Input value={address} disabled />
            </div>
            <div>
              <Typography variant="small">Người liên hệ</Typography>
              <Input value={contactPerson} disabled />
            </div>
            <div>
              <Typography variant="small">Số điện thoại</Typography>
              <Input value={phone} disabled />
            </div>
          </div>

          {/* Diễn giải & Kèm theo */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <Typography variant="small">Diễn giải</Typography>
              <Textarea
                className="!border-t-blue-gray-200 focus:!border-t-gray-900"
                labelProps={{
                  className: "before:content-none after:content-none",
                }}
                value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div>
              <Typography variant="small">Kèm theo</Typography>
              <div className="border border-dashed border-gray-400 p-4 rounded-md text-center">
                <p className="text-gray-500 text-xs">Kéo thả file vào đây</p>
                <p className="text-xs">Hoặc</p>
                <input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  accept=".pdf,.jpg,.png,.docx,.xlsx"
                  className="mt-2 text-xs"
                />
              </div>

              {/* Hiển thị danh sách file đã chọn */}
              {files.length > 0 && (
                <div className="mt-2">
                  <Typography variant="small" className="font-semibold">
                    File đã chọn ({files.length}/3):
                  </Typography>
                  <div className="grid grid-cols-3 gap-2 mt-1 text-sm text-gray-700">
                    {files.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between border p-1 rounded-md text-xs bg-gray-100"
                      >
                        <span className="truncate max-w-[80px]">{file.name}</span>
                        <Button size="sm" color="red" variant="text" onClick={() => handleRemoveFile(index)}>
                          ✖
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Danh sách sản phẩm */}
          <Typography variant="h6" className="mb-2 text-gray-700 text-sm font-semibold">
            Danh sách sản phẩm
          </Typography>

          {/* Thanh điều khiển phân trang */}
          <div className="px-4 py-2 flex items-center gap-4 mb-4">
            <Typography variant="small" color="blue-gray" className="font-normal whitespace-nowrap">
              Hiển thị
            </Typography>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(0);
              }}
              className="border rounded px-2 py-1"
            >
              {[5, 10, 20, 50].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
            <Typography variant="small" color="blue-gray" className="font-normal whitespace-nowrap">
              kết quả mỗi trang
            </Typography>
          </div>

          {/* Bảng sản phẩm */}
          <div className="overflow-auto border rounded">
            <table className="w-full table-auto text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 border">STT</th>
                  <th className="p-2 border">Mã hàng</th>
                  <th className="p-2 border">Tên hàng</th>
                  <th className="p-2 border">Đơn vị</th>
                  <th className="p-2 border">Kho nhập</th>
                  <th className="p-2 border">Số lượng</th>
                  <th className="p-2 border">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {displayedProducts.map((item, index) => (
                  <tr key={item.id}>
                    <td className="p-2 border text-center">{currentPage * pageSize + index + 1}</td>
                    <td className="p-2 border">{item.code}</td>
                    <td className="p-2 border">{item.name}</td>
                    <td className="p-2 border text-center">{item.unit}</td>
                    <td className="p-2 border">{item.warehouse}</td>
                    <td className="p-2 border">{item.quantity}</td>
                    <td className="p-2 border text-center">
                      <Button size="sm" color="red" variant="text" onClick={() => handleRemoveRow(item.id)}>
                        ✖
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Tổng số lượng */}
          <div className="flex justify-end mt-2 pr-4 text-gray-800 text-sm font-semibold">
            <span>TỔNG</span>
            <span className="ml-6">{products.reduce((sum, item) => sum + item.quantity, 0)}</span>
          </div>

          {/* Phân trang */}
          <div className="flex justify-between items-center mt-4">
            <div className="flex gap-2">
              <Button size="sm" variant="outlined" onClick={handleAddRow}>
                + Thêm dòng
              </Button>
              <Button size="sm" variant="outlined" color="red" onClick={handleRemoveAllRows}>
                ✖ Xóa hết dòng
              </Button>
            </div>
          </div>
          {totalElements > 0 && (
            <div className="flex items-center justify-between border-t border-blue-gray-50 p-4">
              <div className="flex items-center gap-2">
                <Typography variant="small" color="blue-gray" className="font-normal">
                  Trang {currentPage + 1} / {totalPages} • {totalElements} bản ghi
                </Typography>
              </div>
              <ReactPaginate
                previousLabel={<ArrowLeftIcon className="h-4 w-4" />}
                nextLabel={<ArrowRightIcon className="h-4 w-4" />}
                pageCount={totalPages}
                marginPagesDisplayed={2}
                pageRangeDisplayed={5}
                onPageChange={handlePageChange}
                containerClassName="flex items-center gap-2"
                pageClassName="h-8 min-w-[32px] flex items-center justify-center rounded-md text-xs text-gray-700 border border-gray-300 hover:bg-gray-100"
                activeClassName="bg-blue-500 text-white"
                disabledClassName="opacity-50 cursor-not-allowed"
              />
            </div>
          )}
          <div className="mt-6 border-t pt-4 flex justify-between">
            <Button
              size="sm"
              color="red"
              variant="text"
              onClick={() => navigate("/user/issueNote")}
              className="mr-4"
            >
              Quay lại danh sách
            </Button>
            <Button
              size="sm"
              color="green"
            >
              Lưu
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default AddReceiptNote;
