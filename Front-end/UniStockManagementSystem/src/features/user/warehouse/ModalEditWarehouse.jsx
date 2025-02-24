import React, { useState, useEffect } from "react";
import { updateWarehouse } from "./warehouseService";
import { Modal, Button, Input, Typography } from "@material-tailwind/react";

const ModalEditWarehouse = ({ open, onClose, warehouse, fetchWarehouses }) => {
  const [updatedWarehouse, setUpdatedWarehouse] = useState(warehouse);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setUpdatedWarehouse(warehouse);
  }, [warehouse]);

  const handleUpdateWarehouse = async () => {
    if (!updatedWarehouse.warehouseCode || !updatedWarehouse.warehouseName || !updatedWarehouse.status) {
      alert("Please fill in all required fields!");
      return;
    }

    setLoading(true);
    try {
      await updateWarehouse(updatedWarehouse.warehouseId, updatedWarehouse);
      alert("Warehouse updated successfully!");
      fetchWarehouses();
      onClose();
    } catch (error) {
      console.error("Error updating warehouse:", error);
      alert("Error updating warehouse! Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <div className="p-6">
        <Typography variant="h6">Edit Warehouse</Typography>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <Typography variant="small" className="mb-2">Warehouse Code *</Typography>
            <Input
              type="text"
              value={updatedWarehouse.warehouseCode}
              onChange={(e) => setUpdatedWarehouse({ ...updatedWarehouse, warehouseCode: e.target.value })}
              className="w-full"
            />
          </div>
          <div>
            <Typography variant="small" className="mb-2">Warehouse Name *</Typography>
            <Input
              type="text"
              value={updatedWarehouse.warehouseName}
              onChange={(e) => setUpdatedWarehouse({ ...updatedWarehouse, warehouseName: e.target.value })}
              className="w-full"
            />
          </div>
          <div className="col-span-2">
            <Typography variant="small" className="mb-2">Description</Typography>
            <Input
              type="text"
              value={updatedWarehouse.description}
              onChange={(e) => setUpdatedWarehouse({ ...updatedWarehouse, description: e.target.value })}
              className="w-full"
            />
          </div>
          <div className="col-span-2">
            <Typography variant="small" className="mb-2">Status *</Typography>
            <Input
              type="text"
              value={updatedWarehouse.status}
              onChange={(e) => setUpdatedWarehouse({ ...updatedWarehouse, status: e.target.value })}
              className="w-full"
            />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button color="gray" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button color="blue" onClick={handleUpdateWarehouse} disabled={loading}>
            {loading ? "Processing..." : "Update Warehouse"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ModalEditWarehouse;