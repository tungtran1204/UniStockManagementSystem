import React, { useState, useEffect } from "react";
import {
  Card,
  CardBody,
  Typography,
  Button,
  Input,
  Textarea,
} from "@material-tailwind/react";
import { useNavigate } from "react-router-dom";
import PageHeader from '@/components/PageHeader';
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { getWarehouseList } from "../warehouse/warehouseService";
import { getProducts } from "../saleorders/saleOrdersService";
import { createReceiptNote, uploadPaperEvidence as uploadPaperEvidenceService, getNextCode } from "./receiptNoteService";
import Select from "react-select";
import { FaPlus, FaTrash } from "react-icons/fa";
import ReactPaginate from "react-paginate";

const AddReceiptNoteManually = () => {
  const navigate = useNavigate();

  const [receiptCode, setReceiptCode] = useState("");
  const [receiptDate, setReceiptDate] = useState(new Date().toISOString().split("T")[0]);
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState([]);

  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);
  const [items, setItems] = useState([]);
  const [nextId, setNextId] = useState(1);
  const [category, setCategory] = useState("");

  const [pageSize, setPageSize] = useState(5);
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    const fetchInitData = async () => {
      const resWarehouses = await getWarehouseList();
      setWarehouses(resWarehouses?.data || resWarehouses || []);

      const resProducts = await getProducts();
      const options = resProducts.content.map(p => ({
        value: p.productId,
        label: `${p.productCode} - ${p.productName}`,
        unitId: p.unitId,
        unitName: p.unitName
      }));
      setProducts(options);

      const nextCode = await getNextCode();
      setReceiptCode(nextCode);
    };

    fetchInitData();
  }, []);

  const handleAddRow = () => {
    setItems(prev => [...prev, { id: nextId, product: null, quantity: 0, warehouse: "" }]);
    setNextId(id => id + 1);
  };

  const handleRemoveRow = (id) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const handleChange = (id, field, value) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  };
  useEffect(() => {
    const fetchWarehouses = async () => {
      try {
        const response = await getWarehouseList();

        console.log("Danh sách kho trả về từ API:", response);
        // Đảm bảo response có dữ liệu đúng định dạng
        if (response && Array.isArray(response.data)) {
          setWarehouses(response.data);
        } else if (Array.isArray(response)) {
          setWarehouses(response);
        } else {
          console.error("Dữ liệu kho không đúng định dạng:", response);
          setWarehouses([]);
        }
      } catch (error) {
        console.error("Lỗi khi lấy danh sách kho:", error);
        setWarehouses([]);
      }
    };

    fetchWarehouses();
  }, []);

  // Xác định kho mặc định dựa trên loại nhập kho
  const getDefaultWarehouse = (warehouseType) => {
    const warehouseTypeMap = {
      "Thành phẩm sản xuất": "KTP", // Mã cho Kho thành phẩm
      "Vật tư mua bán": "KVT", // Mã cho Kho vật tư
      "Hàng hóa gia công": "KVT", // Cũng sử dụng Kho vật tư
      "Hàng hóa trả lại": "KPL" // Mã cho Kho phế liệu
    };
    const warehouseCode = warehouseTypeMap[warehouseType] || "";
    const defaultWarehouse = warehouses.find(w => w.warehouseCode === warehouseCode);
    return defaultWarehouse ? defaultWarehouse.warehouseCode : "";
  };

   // Xử lý khi loại nhập kho thay đổi
   const handleReferenceDocumentChange = (value) => {
    setReferenceDocument(value);

    const defaultWarehouseCode = getDefaultWarehouse(value);

    setItemWarehouses(prev => {
      const updatedWarehouses = { ...prev };

      order.details.forEach(item => {
        if (!manuallySelectedWarehouses[item.id]) {
          updatedWarehouses[item.id] = defaultWarehouseCode;
        }
      });

      return updatedWarehouses;
    });

    // Cập nhật dữ liệu cho ProductRow
    setRowsData(prev => {
      const updatedRows = { ...prev };

      order.details.forEach(item => {
        if (!manuallySelectedWarehouses[item.id]) {
          updatedRows[item.id] = {
            ...updatedRows[item.id],
            warehouse: defaultWarehouseCode,
          };
        }
      });

      return updatedRows;
    });
  };

  // Xử lý thay đổi kho cho sản phẩm
  const handleWarehouseChange = (itemId, warehouseCode) => {
    setItemWarehouses(prev => ({
      ...prev,
      [itemId]: warehouseCode
    }));

    // Đánh dấu rằng kho này đã được chọn thủ công
    setManuallySelectedWarehouses(prev => ({
      ...prev,
      [itemId]: true
    }));
  };
  
  // Xử lý upload file
  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const validTypes = [
      "application/pdf", "image/png", "image/jpeg",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];

    const validFiles = selectedFiles.filter(file => {
      if (file.size > 5 * 1024 * 1024) {
        alert(`File "${file.name}" vượt quá 5MB`);
        return false;
      }
      if (!validTypes.includes(file.type)) {
        alert(`File "${file.name}" không đúng định dạng được hỗ trợ`);
        return false;
      }
      return true;
    });

    const total = files.length + validFiles.length;
    if (total > 3) {
      alert("Chỉ được tải tối đa 3 file");
      return;
    }

    setFiles(prev => [...prev, ...validFiles]);
  };


  const handleRemoveFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    const valid = items.every(item => item.product && item.quantity > 0 && item.warehouse);
    if (!valid) return alert("Vui lòng nhập đầy đủ thông tin cho tất cả các dòng.");

    const details = items.map(item => ({
      productId: item.product.value,
      warehouseId: warehouses.find(w => w.warehouseCode === item.warehouse)?.warehouseId,
      quantity: Number(item.quantity),
      unitId: item.product.unitId
    }));

    const payload = {
      grnCode: receiptCode,
      receiptDate: new Date().toISOString(),
      description,
      category: "Nhập kho thủ công",
      details
    };

    try {
      const res = await createReceiptNote(payload);
      if (files.length > 0) {
        await uploadPaperEvidenceService(res.grnId, "GOOD_RECEIPT_NOTE", files);
      }
      alert("Tạo phiếu nhập thành công!");
      navigate("/user/receiptNote");
    } catch (e) {
      console.error(e);
      alert("Đã xảy ra lỗi khi lưu phiếu nhập.");
    }
  };

  const displayedItems = items.slice(currentPage * pageSize, (currentPage + 1) * pageSize);
  const totalPages = Math.ceil(items.length / pageSize);

  return (
    <div className="mb-8 flex flex-col gap-12">
      <Card className="bg-gray-50 p-7">
        <CardBody className="pb-2 bg-white rounded-xl">
          <PageHeader title={`Phiếu nhập kho ${receiptCode}`} showAdd={false} showImport={false} showExport={false} />

          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <Typography variant="small">Phân loại nhập kho <span className="text-red-500">*</span></Typography>
              <Select
                className="!border-t-blue-gray-200 focus:!border-t-gray-900"
                labelProps={{
                  className: "before:content-none after:content-none",
                }}
                value={category}
                onChange={(value) => {
                  setCategory(value);
                  handleReferenceDocumentChange(value);
                }}
                required
              >
                <Option value="Thành phẩm sản xuất">Thành phẩm sản xuất</Option>
                <Option value="Vật tư mua bán">Vật tư mua bán</Option>
                <Option value="Hàng hóa gia công">Hàng hóa gia công</Option>
                <Option value="Hàng hóa trả lại">Hàng hóa trả lại</Option>
              </Select>
              {!category && (
                <Typography variant="small" className="text-red-500 mt-1">
                  Vui lòng chọn phân loại nhập kho
                </Typography>
              )}
            </div>
            <div>
              <Typography variant="small">Ngày tạo phiếu</Typography>
              <Input type="date" value={receiptDate} onChange={(e) => setReceiptDate(e.target.value)} />
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
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Nhập diễn giải cho phiếu nhập kho"
              />
            </div>
            <div>
              <Typography variant="small">Kèm theo</Typography>
              <div className="border border-dashed border-gray-400 p-4 rounded-md text-center">
                <p className="text-gray-500 text-xs">Kéo thả tối đa 3 file, mỗi file không quá 5MB</p>
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
                        <Button
                          size="sm"
                          color="red"
                          variant="text"
                          onClick={() => handleRemoveFile(index)}
                          className="p-1 min-w-[20px] h-5"
                        >
                          ✖
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bảng nhập hàng */}
          <div className="border rounded overflow-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 border">STT</th>
                  <th className="p-2 border">Sản phẩm</th>
                  <th className="p-2 border">Kho</th>
                  <th className="p-2 border">Số lượng</th>
                  <th className="p-2 border">Đơn vị</th>
                  <th className="p-2 border">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {displayedItems.map((item, index) => (
                  <tr key={item.id}>
                    <td className="p-2 border text-center">{currentPage * pageSize + index + 1}</td>
                    <td className="p-2 border">
                      <Select
                        options={products}
                        value={item.product}
                        onChange={(value) => handleChange(item.id, 'product', value)}
                        placeholder="Chọn sản phẩm"
                      />
                    </td>
                    <td className="p-2 border">
                      <select
                        className="w-full border px-2 py-1 rounded"
                        value={item.warehouse}
                        onChange={(e) => handleChange(item.id, 'warehouse', e.target.value)}
                      >
                        <option value="">-- Chọn kho --</option>
                        {warehouses.map(w => (
                          <option key={w.warehouseId} value={w.warehouseCode}>
                            {w.warehouseCode} - {w.warehouseName}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="p-2 border">
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleChange(item.id, 'quantity', e.target.value)}
                        min={1}
                      />
                    </td>
                    <td className="p-2 border text-center">{item.product?.unitName || ""}</td>
                    <td className="p-2 border text-center">
                      <Button variant="text" color="red" size="sm" onClick={() => handleRemoveRow(item.id)}>
                        <FaTrash />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Phân trang */}
          <div className="flex items-center justify-between py-4">
            <div className="flex gap-2 items-center">
              <Typography variant="small">Hiển thị</Typography>
              <select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))} className="border rounded px-2 py-1">
                {[5, 10, 20].map(size => <option key={size} value={size}>{size}</option>)}
              </select>
              <Typography variant="small">dòng mỗi trang</Typography>
            </div>
            <ReactPaginate
              previousLabel="<"
              nextLabel=">"
              breakLabel="..."
              pageCount={totalPages}
              onPageChange={({ selected }) => setCurrentPage(selected)}
              containerClassName="flex items-center gap-2"
              pageClassName="px-2 py-1 border rounded"
              activeClassName="bg-blue-500 text-white"
              previousClassName="px-2 py-1 border rounded"
              nextClassName="px-2 py-1 border rounded"
              disabledClassName="opacity-50"
              forcePage={currentPage}
            />
          </div>

          {/* Action buttons */}
          <div className="flex justify-between mt-4">
            <Button variant="outlined" color="blue" onClick={handleAddRow} className="flex items-center gap-2">
              <FaPlus /> Thêm dòng
            </Button>
            <div className="flex gap-2">
              <Button variant="outlined" color="gray" onClick={() => navigate("/user/receiptNote")}>Hủy</Button>
              <Button color="green" onClick={handleSave}>Lưu phiếu nhập</Button>
            </div>
          </div>

        </CardBody>
      </Card>
    </div>
  );
};

export default AddReceiptNoteManually;
