import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Button,
  Input,
  Textarea,
  Select,
  Option,
} from "@material-tailwind/react";
import { useNavigate } from "react-router-dom";

const AddReceiptNote = () => {
  const navigate = useNavigate();

  // State chung
  const [orderType, setOrderType] = useState("Mua hàng vật tư");
  const [supplierCode, setSupplierCode] = useState("NC001");
  const [supplierName, setSupplierName] = useState("Công ty A");
  const [address, setAddress] = useState("Hà Nội");
  const [contactPerson, setContactPerson] = useState("Nguyễn Văn A");
  const [phone, setPhone] = useState("0987654321");
  const [orderDate, setOrderDate] = useState("2024-10-13");
  const [description, setDescription] = useState("");
  const [referenceDocument, setReferenceDocument] = useState("");
  const [file, setFile] = useState(null);

  // Danh sách sản phẩm
  const [products, setProducts] = useState([
    { id: 1, code: "VT01", name: "Product name", unit: "Cái", ordered: 4, received: 4, defect: 0 },
  ]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSaveReceipt = () => {
    const receiptData = {
      orderType,
      supplierCode,
      supplierName,
      address,
      contactPerson,
      phone,
      orderDate,
      description,
      referenceDocument,
      products,
      file,
    };
    console.log("📝 Lưu phiếu nhập kho:", receiptData);
    navigate("/user/receiptNote/list");
  };

  return (
    <div className="mt-6 mb-8 flex flex-col gap-6">
      <Card>
        {/* Header */}
        <CardHeader variant="gradient" color="gray" className="mb-6 p-4 flex justify-between items-center">
          <Typography variant="h6" color="white">
            Phiếu nhập kho NK00009
          </Typography>
          <div className="w-56">
            <Select value={orderType} onChange={(value) => setOrderType(value)}>
              <Option value="Mua hàng vật tư">Mua hàng vật tư</Option>
              <Option value="Nhập kho nội bộ">Nhập kho nội bộ</Option>
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
              <Select value={referenceDocument} onChange={setReferenceDocument}>
                <Option value="Chứng từ A">Chứng từ A</Option>
                <Option value="Chứng từ B">Chứng từ B</Option>
                <Option value="Chứng từ C">Chứng từ C</Option>
              </Select>
            </div>
            <div>
              <Typography variant="small">Ngày nhập phiếu</Typography>
              <Input type="date" value={orderDate} onChange={(e) => setOrderDate(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
              <Typography variant="small">Mã nhà cung cấp</Typography>
              <Input value={contactPerson} disabled />
            </div>
            <div>
              <Typography variant="small">Tên nhà cung cấp</Typography>
              <Input value={phone} disabled />
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

          {/* Diễn giải & Kèm theo trên cùng một dòng */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <Typography variant="small">Diễn giải</Typography>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div>
              <Typography variant="small">Kèm theo</Typography>
              <div className="border border-dashed border-gray-400 p-4 rounded-md text-center">
                <p className="text-gray-500 text-xs">Kéo thả file của bạn vào đây</p>
                <p className="text-xs">Hoặc</p>
                <input type="file" onChange={handleFileChange} className="mt-2 text-xs" />
              </div>
            </div>
          </div>

          {/* Danh sách sản phẩm */}
          <Typography variant="h6" className="mb-2 text-gray-700 text-sm font-semibold">
            Danh sách sản phẩm
          </Typography>
          <div className="overflow-auto border rounded">
            <table className="w-full table-auto text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 border">Mã hàng</th>
                  <th className="p-2 border">Tên hàng</th>
                  <th className="p-2 border">Đơn vị</th>
                  <th className="p-2 border">Số lượng đặt</th>
                  <th className="p-2 border">Số lượng nhập</th>
                  <th className="p-2 border">Số lượng lỗi</th>
                </tr>
              </thead>
              <tbody>
                {products.map((item, idx) => (
                  <tr key={idx}>
                    <td className="p-2 border">{item.code}</td>
                    <td className="p-2 border">{item.name}</td>
                    <td className="p-2 border">{item.unit}</td>
                    <td className="p-2 border">{item.ordered}</td>
                    <td className="p-2 border">{item.received}</td>
                    <td className="p-2 border">{item.defect}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardBody>

        {/* Nút lưu */}
        <div className="flex justify-end p-4">
          <Button variant="text" color="red" onClick={() => navigate("/user/receiptNote/list")} className="mr-2">
            Quay lại danh sách
          </Button>
          <Button variant="gradient" color="green" onClick={handleSaveReceipt}>
            Lưu
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default AddReceiptNote;
