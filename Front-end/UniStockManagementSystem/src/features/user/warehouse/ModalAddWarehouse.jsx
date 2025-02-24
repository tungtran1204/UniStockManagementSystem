import React, { useState } from "react";
import { createWarehouse } from "./warehouseService";
import { Modal, Button, Input, Typography } from "@material-tailwind/react";

const ModalAddWarehouse = ({ open, onClose, fetchWarehouses }) => {
  const [warehouse, setWarehouse] = useState({
    warehouseCode: "",
    warehouseName: "",
    description: "",
    status: "",
  });
  const [loading, setLoading] = useState(false);

  const handleCreateWarehouse = async () => {
    if (!warehouse.warehouseCode || !warehouse.warehouseName || !warehouse.status) {
      alert("Please fill in all required fields!");
      return;
    }

    setLoading(true);
    try {
      await createWarehouse(warehouse);
      alert("Warehouse created successfully!");
      fetchWarehouses();
      onClose();
    } catch (error) {
      console.error("Error creating warehouse:", error);
      alert("Error creating warehouse! Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <div className="p-6">
        <Typography variant="h6">Add Warehouse</Typography>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <Typography variant="small" className="mb-2">Warehouse Code *</Typography>
            <Input
              type="text"
              value={warehouse.warehouseCode}
              onChange={(e) => setWarehouse({ ...warehouse, warehouseCode: e.target.value })}
              className="w-full"
            />
          </div>
          <div>
            <Typography variant="small" className="mb-2">Warehouse Name *</Typography>
            <Input
              type="text"
              value={warehouse.warehouseName}
              onChange={(e) => setWarehouse({ ...warehouse, warehouseName: e.target.value })}
              className="w-full"
            />
          </div>
          <div className="col-span-2">
            <Typography variant="small" className="mb-2">Description</Typography>
            <Input
              type="text"
              value={warehouse.description}
              onChange={(e) => setWarehouse({ ...warehouse, description: e.target.value })}
              className="w-full"
            />
          </div>
          <div className="col-span-2">
            <Typography variant="small" className="mb-2">Status *</Typography>
            <Input
              type="text"
              value={warehouse.status}
              onChange={(e) => setWarehouse({ ...warehouse, status: e.target.value })}
              className="w-full"
            />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button color="gray" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button color="blue" onClick={handleCreateWarehouse} disabled={loading}>
            {loading ? "Processing..." : "Add Warehouse"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ModalAddWarehouse;