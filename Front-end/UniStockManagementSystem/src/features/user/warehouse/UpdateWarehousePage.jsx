import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchWarehouseById, updateWarehouse } from "./warehouseService";
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Button,
  Input,
} from "@material-tailwind/react";

const UpdateWarehousePage = () => {
  const { warehouseId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [warehouse, setWarehouse] = useState({
    warehouseCode: "",
    warehouseName: "",
    description: "",
    status: "",
  });

  useEffect(() => {
    const fetchWarehouse = async () => {
      try {
        const data = await fetchWarehouseById(warehouseId);
        setWarehouse(data);
      } catch (error) {
        console.error("Lỗi khi lấy thông tin kho:", error);
      }
    };

    fetchWarehouse();
  }, [warehouseId]);

  const handleUpdateWarehouse = async () => {
    if (!warehouse.warehouseCode || !warehouse.warehouseName || !warehouse.status) {
      alert("Vui lòng điền đầy đủ thông tin bắt buộc!");
      return;
    }

    setLoading(true);
    try {
      await updateWarehouse(warehouseId, warehouse);
      alert("Cập nhật kho thành công!");
      navigate("/warehouses");
    } catch (error) {
      console.error("Lỗi khi cập nhật kho:", error);
      alert("Lỗi khi cập nhật kho! Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-12 mb-8 flex flex-col gap-12">
      <Card>
        <CardHeader variant="gradient" color="gray" className="mb-8 p-6">
          <Typography variant="h6" color="white">
            Cập nhật kho
          </Typography>
        </CardHeader>
        <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <Typography variant="small" className="mb-2">Mã kho *</Typography>
              <Input
                type="text"
                value={warehouse.warehouseCode}
                onChange={(e) => setWarehouse({ ...warehouse, warehouseCode: e.target.value })}
                className="w-full"
              />
            </div>
            <div>
              <Typography variant="small" className="mb-2">Tên kho *</Typography>
              <Input
                type="text"
                value={warehouse.warehouseName}
                onChange={(e) => setWarehouse({ ...warehouse, warehouseName: e.target.value })}
                className="w-full"
              />
            </div>
            <div className="col-span-2">
              <Typography variant="small" className="mb-2">Mô tả</Typography>
              <Input
                type="text"
                value={warehouse.description}
                onChange={(e) => setWarehouse({ ...warehouse, description: e.target.value })}
                className="w-full"
              />
            </div>
            <div className="col-span-2">
              <Typography variant="small" className="mb-2">Trạng thái *</Typography>
              <Input
                type="text"
                value={warehouse.status}
                onChange={(e) => setWarehouse({ ...warehouse, status: e.target.value })}
                className="w-full"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              color="gray"
              onClick={() => navigate("/warehouses")}
              disabled={loading}
            >
              Hủy
            </Button>
            <Button
              color="blue"
              onClick={handleUpdateWarehouse}
              disabled={loading}
            >
              {loading ? "Đang xử lý..." : "Cập nhật kho"}
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default UpdateWarehousePage;