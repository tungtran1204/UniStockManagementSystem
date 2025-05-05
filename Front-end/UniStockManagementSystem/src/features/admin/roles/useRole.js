import { useState, useEffect, useCallback } from "react";
import {
  getAllRoles,
  getAllPermissions,
  getRolePermissions,
  updateRole,
  toggleRoleStatus,
  deleteRole,
  addRole,
} from "./roleService";

// Thêm ánh xạ từ PermissionHierarchy để kiểm tra quyền
const PERMISSION_HIERARCHY = {
  viewProduct: ["getAllProducts", "getProductById", "getMaterialsByProduct"],
  manageProduct: [
    "getAllProducts",
    "getProductById",
    "getMaterialsByProduct",
    "updateProduct",
    "checkProductCode",
    "toggleProductionStatus",
    "importProducts",
    "createProduct",
    "getAllProductTypes",
  ],
  viewProductType: ["getAllProductTypes"],
  manageProductType: ["createProductType", "updateProductType", "checkTypeName"],
  viewPartner: ["getAllPartners", "getPartnerCode", "getPartnersByType"],
  managePartner: [
    "getAllPartners",
    "getPartnerCode",
    "getPartnersByType",
    "createPartner",
    "createPartnerType",
    "updatePartnerType",
    "updatedPartnerTypeStatus",
  ],
  viewWarehouse: ["getWarehouses", "getWarehouseById"],
  manageWarehouse: [
    "getWarehouses",
    "getWarehouseById",
    "addWarehouse",
    "updateWarehouse",
    "updateWarehouseStatus",
    "getUsedWarehouseCategories",
    "checkWarehouseNameAndCode",
  ],
  viewMaterial: [
    "getAllMaterials",
    "getMaterialById",
    "downloadTemplate",
    "exportMaterials",
  ],
  manageMaterial: [
    "getAllMaterials",
    "getMaterialById",
    "exportMaterials",
    "downloadTemplate",
    "createMaterial",
    "checkMaterialCode",
    "updateMaterial",
    "previewImport",
    "toggleUsingStatusMaterial",
    "importMaterials",
    "getActiveUnits",
    "getPartnersByType",
    "getActiveMaterialTypes",
  ],
  viewMaterialType: ["getAllMaterialTypes", "getMaterialTypeById"],
  manageMaterialType: [
    "getAllMaterialTypes",
    "getMaterialTypeById",
    "createMaterialType",
    "updateMaterialType",
    "toggleStatusMaterialType",
    "checkName",
  ],
  viewSaleOrder: ["getFilteredOrders", "getOrderById"],
  manageSaleOrder: [
    "getFilteredOrders",
    "getOrderById",
    "getNextOrderCode",
    "createSaleOrder",
    "updateSaleOrder",
    "cancelSaleOrder",
    "setPreparingMaterial",
    "getAllPartners",
    "getInventoryDetailsByWarehouse",
    "getInventoryDetailsByWarehouseM",
  ],
  viewPurchaseRequest: ["getAllPurchaseRequests", "getPurchaseRequestById"],
  managePurchaseRequest: [
    "getAllPurchaseRequests",
    "getPurchaseRequestById",
    "getNextRequestCode",
    "createManualPurchaseRequest",
    "updatePurchaseRequestStatus",
    "canCreatePurchaseRequest",
  ],
  viewPurchaseOrder: ["getAllOrdersFiltered", "getOrderById"],
  managePurchaseOrder: [
    "getAllOrdersFiltered",
    "getOrderById",
    "createMultipleOrders",
    "getSaleOrderByPurchaseOrder",
  ],
  viewUnit: ["getAllUnits"],
  manageUnit: [
    "getAllUnits",
    "createUnit",
    "toggleStatusUnit",
    "updateUnit",
    "checkUnitName",
  ],
  viewReport: [
    "getInventoryReport",
    "getStockMovementReport",
    "getImportReportPaginated",
    "getExportReport",
  ],
  viewReceiptNote: ["getAllGoodReceipts", "getGoodReceiptById"],
  manageReceiptNote: [
    "getAllGoodReceipts",
    "getGoodReceiptById",
    "createGoodReceipt",
    "getNextNoteCode",
    "uploadPaperEvidence",
    "getAllProducts",
    "getActiveMaterials",
    "getAllActiveWarehouses",
    "getPendingOrInProgressOrders",
    "getPendingOrInProgressReceiveOutsource",
    "getPartnersByCodePrefix",
    "getOrderById",
  ],
  viewIssueNote: ["getAllIssueNotes", "getIssueNoteById"],
  manageIssueNote: [
    "getAllIssueNotes",
    "getIssueNoteById",
    "createIssueNote",
    "getNextIssueCode",
    "uploadPaperEvidence",
    "getAllProducts",
    "getAllMaterials",
    "getInventoryDetailsByWarehouse",
    "getInventoryDetailsByWarehouseM",
    "getFilteredOrders",
    "getPartnersByType",
    "getOrderById",
  ],
  acceptPurchaseRequest: ["updatePurchaseRequestStatus"],
};

// Ánh xạ API sang quyền frontend
const API_TO_FE_KEY = {
  // Sản phẩm
  checkProductCode: "manageProduct",
  getProductById: "manageProduct",
  importProducts: "manageProduct",
  // Loại sản phẩm
  getAllProductTypes: "viewProductType",
  createProductType: "manageProductType",
  updateProductType: "manageProductType",
  checkTypeName: "manageProductType",
  // Đơn hàng
  updateSaleOrder: "manageSaleOrder",
  createSaleOrder: "manageSaleOrder",
  getFilteredOrders: "viewSaleOrder",
  getOrderById: "viewSaleOrder",
  // Yêu cầu mua
  getAllPurchaseRequests: "viewPurchaseRequest",
  getPurchaseRequestById: "viewPurchaseRequest",
  getNextRequestCode: "managePurchaseRequest",
  createManualPurchaseRequest: "managePurchaseRequest",
  updatePurchaseRequestStatus: "managePurchaseRequest",
  canCreatePurchaseRequest: "managePurchaseRequest",
  // Đơn mua
  getAllOrdersFiltered: "viewPurchaseOrder",
  createMultipleOrders: "managePurchaseOrder",
  getSaleOrderByPurchaseOrder: "managePurchaseOrder",
  // Đơn vị
  getAllUnits: "viewUnit",
  createUnit: "manageUnit",
  toggleStatusUnit: "manageUnit",
  updateUnit: "manageUnit",
  checkUnitName: "manageUnit",
  // Báo cáo
  getInventoryReport: "viewReport",
  getStockMovementReport: "viewReport",
  getImportReportPaginated: "viewReport",
  getExportReport: "viewReport",
  // Phiếu nhập kho
  getAllGoodReceipts: "viewReceiptNote",
  getGoodReceiptById: "viewReceiptNote",
  createGoodReceipt: "manageReceiptNote",
  getNextNoteCode: "manageReceiptNote",
  uploadPaperEvidence: "manageReceiptNote",
  getAllProducts: "manageReceiptNote",
  getActiveMaterials: "manageReceiptNote",
  getAllActiveWarehouses: "manageReceiptNote",
  getPendingOrInProgressOrders: "manageReceiptNote",
  getPendingOrInProgressReceiveOutsource: "manageReceiptNote",
  getPartnersByCodePrefix: "manageReceiptNote",
  // Phiếu xuất kho
  getAllIssueNotes: "viewIssueNote",
  getIssueNoteById: "viewIssueNote",
  createIssueNote: "manageIssueNote",
  getNextIssueCode: "manageIssueNote",
  getAllMaterials: "manageIssueNote",
  getInventoryDetailsByWarehouse: "manageIssueNote",
  getInventoryDetailsByWarehouseM: "manageIssueNote",
  getFilteredOrders: "manageIssueNote",
  getPartnersByType: "manageIssueNote",
  // Duyệt yêu cầu mua
  updatePurchaseRequestStatus: "acceptPurchaseRequest",
};

const useRole = () => {
  const [roles, setRoles] = useState([]);
  const [allPermissions, setAllPermissions] = useState([]);
  const [rolePermissions, setRolePermissions] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [errorRole, setErrorRole] = useState(null);
  const [errorEditRole, setErrorEditRole] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const rolesData = await getAllRoles();
        setRoles(rolesData);

        const permsData = await getAllPermissions();
        setAllPermissions(permsData);

        console.log("✅ [useRole] roles + allPermissions:", rolesData, permsData);

        await Promise.all(
          rolesData.map(async (role) => {
            const rolePerms = await getRolePermissions(role.id);
            const permissionNames = rolePerms.permissions.map((p) => p.name);

            // Kiểm tra quyền dựa trên PermissionHierarchy
            const feKeys = new Set();
            Object.keys(PERMISSION_HIERARCHY).forEach((key) => {
              const permApis = PERMISSION_HIERARCHY[key];
              // Kiểm tra xem tất cả API của quyền này có trong permissionNames không
              const hasAllApis = permApis.every((api) =>
                permissionNames.includes(api)
              );
              // Nếu quyền là "view" và không có API độc quyền của "manage", ưu tiên "view"
              if (hasAllApis) {
                if (key.startsWith("view") || key === "acceptPurchaseRequest") {
                  const manageKey = key.replace("view", "manage");
                  const manageApis = PERMISSION_HIERARCHY[manageKey] || [];
                  const hasExclusiveManageApis = manageApis.some(
                    (api) => !permApis.includes(api) && permissionNames.includes(api)
                  );
                  if (!hasExclusiveManageApis) {
                    feKeys.add(key);
                  } else {
                    feKeys.add(manageKey);
                  }
                } else if (key.startsWith("manage")) {
                  feKeys.add(key);
                }
              }
            });

            setRoles((prev) =>
              prev.map((r) =>
                r.id === role.id ? { ...r, permissionKeys: Array.from(feKeys) } : r
              )
            );
          })
        );
      } catch (err) {
        console.error("🚨 [useRole] Lỗi khi tải:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const fetchRolePermissions = useCallback(async (roleId) => {
    try {
      const rolePerms = await getRolePermissions(roleId);
      const permissionNames = rolePerms.permissions.map((p) => p.name);

      // Kiểm tra quyền dựa trên PermissionHierarchy
      const feKeys = new Set();
      Object.keys(PERMISSION_HIERARCHY).forEach((key) => {
        const permApis = PERMISSION_HIERARCHY[key];
        const hasAllApis = permApis.every((api) =>
          permissionNames.includes(api)
        );
        if (hasAllApis) {
          if (key.startsWith("view") || key === "acceptPurchaseRequest") {
            const manageKey = key.replace("view", "manage");
            const manageApis = PERMISSION_HIERARCHY[manageKey] || [];
            const hasExclusiveManageApis = manageApis.some(
              (api) => !permApis.includes(api) && permissionNames.includes(api)
            );
            if (!hasExclusiveManageApis) {
              feKeys.add(key);
            } else {
              feKeys.add(manageKey);
            }
          } else if (key.startsWith("manage")) {
            feKeys.add(key);
          }
        }
      });

      const updatedKeys = Array.from(feKeys);
      setRoles((prev) =>
        prev.map((r) =>
          r.id === roleId ? { ...r, permissionKeys: updatedKeys } : r
        )
      );
      setRolePermissions(updatedKeys);
      console.log(`✅ [useRole] Permissions cho Role ID ${roleId}:`, updatedKeys);
    } catch (err) {
      console.error("❌ [useRole] Lỗi fetchRolePermissions:", err);
      setRolePermissions([]);
    }
  }, []);

  const handleSelectRole = useCallback(
    (role) => {
      setSelectedRole(role);
      fetchRolePermissions(role.id);
    },
    [fetchRolePermissions]
  );

  const handleAddRole = useCallback(async (role) => {
    if (!role.name.trim()) {
      setErrorRole('Tên vai trò không được để trống!');
      return false;
    }

    try {
      const cleanedRole = { ...role, name: role.name.trim() };
      const newRole = await addRole(cleanedRole);
      if (newRole) {
        setRoles((prev) => [...prev, { ...newRole, permissionKeys: role.permissionKeys }]);
      }
      setErrorRole(null); // clear lỗi cũ
      return true;
    } catch (err) {
      console.error("❌ [useRole] Lỗi khi add Role:", err);
      if (err.response?.status === 409) {
        const errorCode = err.response.data;
        if (errorCode === "DUPLICATE_ROLE") {
          setErrorRole("Vai trò đã tồn tại!");
        }
      }
      return false;
    }
  }, []);

  const handleUpdateRole = useCallback(async (id, updatedRole) => {
    if (!updatedRole.name.trim()) {
      setErrorEditRole('Tên vai trò không được để trống!');
      return false;
    }

    try {
      const cleanedRole = { ...updatedRole, name: updatedRole.name.trim() };
      const updated = await updateRole(id, cleanedRole);
      if (updated) {
        setRoles((prev) =>
          prev.map((r) =>
            r.id === id
              ? { ...r, ...updated, permissionKeys: updatedRole.permissionKeys }
              : r
          )
        );
        console.log("✅ [useRole] Role updated:", updated);
      }
      setErrorEditRole(null); // clear lỗi cũ
      return true; // ✅ báo thành công
    } catch (err) {
      console.error("❌ [useRole] Lỗi khi updateRole:", err);
      if (err.response?.status === 409) {
        const errorCode = err.response.data;
        if (errorCode === "DUPLICATE_ROLE") {
          setErrorEditRole("Vai trò đã tồn tại!");
        }
      }
      return false;
    }
  }, []);

  const updateRolePermissions = useCallback((roleId, permissionKeys) => {
    setRoles((prev) =>
      prev.map((r) =>
        r.id === roleId ? { ...r, permissionKeys } : r
      )
    );
  }, []);

  const handleToggleRoleStatus = useCallback(async (id, currentStatus) => {
    try {
      const updated = await toggleRoleStatus(id, !currentStatus);
      if (updated) {
        setRoles((prev) =>
          prev.map((r) =>
            r.id === id ? { ...r, active: !currentStatus } : r
          )
        );
      }
    } catch (err) {
      console.error("❌ [useRole] Lỗi toggle status:", err);
    }
  }, []);

  const handleDeleteRole = useCallback(async (id) => {
    try {
      const success = await deleteRole(id);
      if (success) {
        setRoles((prev) => prev.filter((r) => r.id !== id));
      }
    } catch (err) {
      console.error("❌ [useRole] Lỗi deleteRole:", err);
    }
  }, []);

  return {
    roles,
    allPermissions,
    rolePermissions,
    selectedRole,
    loading,
    error,
    errorRole,
    errorEditRole,
    setErrorEditRole,
    setErrorRole,
    handleSelectRole,
    handleAddRole,
    handleUpdateRole,
    handleToggleRoleStatus,
    handleDeleteRole,
    fetchRolePermissions,
    updateRolePermissions,
  };
};

export default useRole;