import React, { useState, useEffect } from "react";
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
import { useNavigate, useLocation } from "react-router-dom";
import { createSaleOrder, getNextOrderCode } from "./saleOrdersService";

const AddSaleOrderPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const nextCode = location.state?.nextCode || "";

  const [orderCode, setOrderCode] = useState(nextCode);
  const [orderDate, setOrderDate] = useState("");
  const [partnerName, setPartnerName] = useState("");
  const [status, setStatus] = useState("PENDING");
  const [note, setNote] = useState("");
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState({
    productCode: "",
    productName: "",
    unit: "",
    quantity: 0,
    price: 0,
  });

  useEffect(() => {
    if (!nextCode) {
      const fetchNextOrderCode = async () => {
        try {
          const code = await getNextOrderCode();
          setOrderCode(code);
        } catch (error) {
          console.error("❌ Lỗi khi lấy mã đơn hàng:", error);
        }
      };
      fetchNextOrderCode();
    }
  }, [nextCode]);

  const handleAddItem = () => {
    setItems([...items, newItem]);
    setNewItem({
      productCode: "",
      productName: "",
      unit: "",
      quantity: 0,
      price: 0,
    });
  };

  const handleRemoveItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSaveOrder = async () => {
    const payload = {
      orderCode,
      orderDate,
      partnerName,
      status,
      note,
      items,
    };
    try {
      await createSaleOrder(payload);
      navigate("/user/sale-orders");
    } catch (error) {
      console.error("❌ Lỗi khi tạo đơn hàng:", error);
    }
  };

  return (
    <div className="mt-12 mb-8 flex flex-col gap-12">
      <Card>
        <CardHeader variant="gradient" color="gray" className="mb-8 p-6">
          <Typography variant="h6" color="white">
            Tạo đơn hàng mới
          </Typography>
        </CardHeader>
        <CardBody className="overflow-x-scroll px-3 pt-5 pb-2">
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <Typography variant="small" className="mb-1 font-medium">
                Mã đơn hàng
              </Typography>
              <Input value={orderCode} disabled className="bg-gray-100" />
            </div>
            <div>
              <Typography variant="small" className="mb-1 font-medium">
                Ngày đặt hàng
              </Typography>
              <Input
                type="date"
                value={orderDate}
                onChange={(e) => setOrderDate(e.target.value)}
              />
            </div>
            <div>
              <Typography variant="small" className="mb-1 font-medium">
                Khách hàng
              </Typography>
              <Input
                placeholder="Nhập tên khách hàng"
                value={partnerName}
                onChange={(e) => setPartnerName(e.target.value)}
              />
            </div>
            <div>
              <Typography variant="small" className="mb-1 font-medium">
                Trạng thái đơn hàng
              </Typography>
              <Select
                value={status}
                onChange={(value) => setStatus(value)}
              >
                <Option value="PENDING">PENDING</Option>
                <Option value="CONFIRMED">CONFIRMED</Option>
                <Option value="SHIPPED">SHIPPED</Option>
                <Option value="DELIVERED">DELIVERED</Option>
                <Option value="CANCELED">CANCELED</Option>
              </Select>
            </div>
            <div className="col-span-2">
              <Typography variant="small" className="mb-1 font-medium">
                Ghi chú
              </Typography>
              <Textarea
                placeholder="Nhập ghi chú..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
          </div>

          <Typography variant="h6" color="blue-gray" className="mb-2 font-semibold">
            Hàng bán
          </Typography>
          <div className="overflow-auto border rounded">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-blue-gray-50">
                  <th className="p-2 border text-left">Mã hàng</th>
                  <th className="p-2 border text-left">Tên hàng</th>
                  <th className="p-2 border text-left">ĐVT</th>
                  <th className="p-2 border text-right">Số lượng</th>
                  <th className="p-2 border text-right">Đơn giá</th>
                  <th className="p-2 border text-right">Thành tiền</th>
                  <th className="p-2 border text-center">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="p-2 border">{item.productCode}</td>
                    <td className="p-2 border">{item.productName}</td>
                    <td className="p-2 border">{item.unit}</td>
                    <td className="p-2 border text-right">{item.quantity}</td>
                    <td className="p-2 border text-right">{item.price.toLocaleString()}</td>
                    <td className="p-2 border text-right">{(item.quantity * item.price).toLocaleString()}</td>
                    <td className="p-2 border text-center">
                      <Button color="red" size="sm" onClick={() => handleRemoveItem(idx)}>
                        Xóa
                      </Button>
                    </td>
                  </tr>
                ))}
                <tr>
                  <td className="p-2 border">
                    <Input
                      placeholder="Mã hàng"
                      value={newItem.productCode}
                      onChange={(e) => setNewItem({ ...newItem, productCode: e.target.value })}
                    />
                  </td>
                  <td className="p-2 border">
                    <Input
                      placeholder="Tên hàng"
                      value={newItem.productName}
                      onChange={(e) => setNewItem({ ...newItem, productName: e.target.value })}
                    />
                  </td>
                  <td className="p-2 border">
                    <Input
                      placeholder="ĐVT"
                      value={newItem.unit}
                      onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                    />
                  </td>
                  <td className="p-2 border text-right">
                    <Input
                      type="number"
                      placeholder="Số lượng"
                      value={newItem.quantity}
                      onChange={(e) => setNewItem({ ...newItem, quantity: Number(e.target.value) })}
                    />
                  </td>
                  <td className="p-2 border text-right">
                    <Input
                      type="number"
                      placeholder="Đơn giá"
                      value={newItem.price}
                      onChange={(e) => setNewItem({ ...newItem, price: Number(e.target.value) })}
                    />
                  </td>
                  <td className="p-2 border text-right">
                    {(newItem.quantity * newItem.price).toLocaleString()}
                  </td>
                  <td className="p-2 border text-center">
                    <Button color="green" size="sm" onClick={handleAddItem}>
                      Thêm
                    </Button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="flex justify-end mt-4">
            <div className="w-1/3">
              <div className="flex justify-between items-center mb-2">
                <Typography variant="small" className="font-medium">Tổng cộng:</Typography>
                <Typography variant="small" className="font-bold">
                  {items.reduce((sum, item) => sum + item.quantity * item.price, 0).toLocaleString()} đ
                </Typography>
              </div>
            </div>
          </div>
        </CardBody>
        <div className="flex justify-end p-4">
          <Button variant="text" color="red" onClick={() => navigate("/user/sale-orders")} className="mr-2">
            Hủy
          </Button>
          <Button variant="gradient" color="green" onClick={handleSaveOrder}>
            Lưu
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default AddSaleOrderPage;
