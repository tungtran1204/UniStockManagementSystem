package vn.unistock.unistockmanagementsystem.features.admin.permission;

import java.util.*;

public class PermissionHierarchy {

    public static final Map<String, List<String>> PERMISSION_MAP = new HashMap<>();

    static {
        PERMISSION_MAP.put("viewProduct", List.of(
                "getAllProducts",
                "getProductById",
                "getMaterialsByProduct",
                "getAllProductTypes",
                "getActiveMaterials",
                "getAllMaterials",
                "getAllMaterialTypes"
        ));
        // manageProduct = bao gồm mọi API của "Sản phẩm" (kể cả xem)
        PERMISSION_MAP.put("manageProduct", List.of(
                "getAllProducts",
                "getProductById",
                "getMaterialsByProduct",
                "getAllProductTypes",
                "getActiveMaterials",
                "getAllMaterials",
                "getAllMaterialTypes",
                "updateProduct",
                "checkProductCode",
                "toggleProductionStatus",
                "importProducts",
                "createProduct",
                "getAllProductTypes",
                "getActiveUnits",
                "checkMaterialCode"
        ));

        PERMISSION_MAP.put("viewProductType", List.of(
                "getAllProductTypes"
        ));
        PERMISSION_MAP.put("manageProductType", List.of(
                "getAllProductTypes",
                "createProductType",
                "updateProductType",
                "checkTypeName"
        ));
        // ======================
        // 2) ĐỐI TÁC
        // ======================
        PERMISSION_MAP.put("viewPartner", List.of(
                "getAllPartners",
                "getPartnerCode",
                "getPartnersByType",
                "getAllPartnerTypes"
        ));
        PERMISSION_MAP.put("managePartner", List.of(
                // Gồm quyền xem:
                "getAllPartners",
                "getPartnerCode",
                "getPartnersByType",
                "getAllPartnerTypes",
                // Thêm quyền quản lý (tạo, sửa, ...):
                "getAllPartnerTypes",
                    "createPartner",
                "createPartnerType",
                "updatePartnerType",
                "updatedPartnerTypeStatus",
                "updatePartner"
        ));

        // ======================
        // 3) KHO
        // ======================
        PERMISSION_MAP.put("viewWarehouse", List.of(
                "getWarehouses",
                "getWarehouseById"
        ));
        PERMISSION_MAP.put("manageWarehouse", List.of(
                // Gồm quyền xem:
                "getWarehouses",
                "getWarehouseById",
                // Thêm quyền quản lý:
                "addWarehouse",
                "updateWarehouse",
                "updateWarehouseStatus",
                "getUsedWarehouseCategories",
                "checkWarehouseNameAndCode"
        ));

        // ======================
        // 4) NGUYÊN VẬT LIỆU
        // ======================
        PERMISSION_MAP.put("viewMaterial", List.of(
                "getAllMaterials",
                "getMaterialById",
                "downloadTemplate",
                "exportMaterials",
                "getAllMaterialTypes",
                "getActiveUnits"
        ));
        PERMISSION_MAP.put("manageMaterial", List.of(
                // Gồm quyền xem:
                "getAllMaterials",
                "getMaterialById",
                "exportMaterials",
                "downloadTemplate",
                "getAllMaterialTypes",
                "getActiveUnits",
//                "getMaterialTypeById",
                // Thêm quyền quản lý:
                "createMaterial",
                "checkMaterialCode",
                "updateMaterial",
                "previewImport",
                "toggleUsingStatusMaterial",
                "importMaterials",
                "getActiveUnits",
                "getPartnersByType",
                "getActiveMaterialTypes"
        ));
        PERMISSION_MAP.put("viewMaterialType", List.of(
                // Nếu muốn “xem” luôn cả loại vật liệu:
                "getAllMaterialTypes",
                "getMaterialTypeById"
        ));
        PERMISSION_MAP.put("manageMaterialType", List.of(
                "getAllMaterialTypes",
                "getMaterialTypeById",

                "createMaterialType",
                "updateMaterialType",
                "toggleStatusMaterialType",
                "checkName"
        ));
        // ======================
        // 5) ĐƠN HÀNG
        // ======================
        PERMISSION_MAP.put("viewSaleOrder", List.of(
                "getFilteredOrders",
                "getOrderById",
                "getMaterialsByProduct"
        ));
        PERMISSION_MAP.put("manageSaleOrder", List.of(
                "getFilteredOrders",
                "getOrderById",
                "getMaterialsByProduct",

                "getNextOrderCode",
                "createSaleOrder",
                "updateSaleOrder",
                "cancelSaleOrder",
                "setPreparingMaterial",
                "getAllPartners",
                "getInventoryDetailsByWarehouse",
                "getInventoryDetailsByWarehouseM",
                "getActiveProducts"
        ));

        // ======================
        // 6) YÊU CẦU MUA
        // ======================
        PERMISSION_MAP.put("viewPurchaseRequest", List.of(
                "getAllPurchaseRequests",
                "getPurchaseRequestById"
        ));
        PERMISSION_MAP.put("managePurchaseRequest", List.of(
                "getAllPurchaseRequests",
                "getPurchaseRequestById",

                "getPartnersByMaterial",
                "getNextRequestCode",
                "createManualPurchaseRequest",
                "canCreatePurchaseRequest",
                "getAllMaterials",
                "getAllMaterialTypes"

        ));

        // ======================
        // 7) ĐƠN MUA
        // ======================
        PERMISSION_MAP.put("viewPurchaseOrder", List.of(
                "getAllOrdersFiltered",
                "getOrderById"
        ));

        PERMISSION_MAP.put("managePurchaseOrder", List.of(
                "getAllOrdersFiltered",
                "getOrderById",

                "createMultipleOrders",
                "getSaleOrderByPurchaseOrder"
        ));

        // ======================
        // 8) ĐƠN VỊ
        // ======================
        PERMISSION_MAP.put("viewUnit", List.of(
                "getAllUnits"
        ));

        PERMISSION_MAP.put("manageUnit", List.of(
                "getAllUnits",

                "createUnit",
                "toggleStatusUnit",
                "updateUnit",
                "checkUnitName"
        ));

        // ======================
        // 9) BÁO CÁO
        // ======================
        PERMISSION_MAP.put("viewReport", List.of(
                //Tồn kho
                "getInventoryReport",

                //Xuất nhập tồn
                "getStockMovementReport",

                //Nhập kho
                "getImportReportPaginated",

                //Xuất kho
                "getExportReport"
        ));

        // ======================
        // 10) PHIẾU NHẬP KHO
        // ======================
        PERMISSION_MAP.put("viewReceiptNote", List.of(
                "getAllGoodReceipts",
                "getGoodReceiptById",
                "getIssueNoteById"
        ));
        PERMISSION_MAP.put("manageReceiptNote", List.of(
                "getAllGoodReceipts",
                "getGoodReceiptById",
                "getIssueNoteById",

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
                "getActiveProducts"
        ));

        // ======================
        // 11) PHIẾU XUẤT KHO
        // ======================
        PERMISSION_MAP.put("viewIssueNote", List.of(
                "getAllIssueNotes",
                "getIssueNoteById",
                "getOrderById",
                "getMaterialsByProduct"
        ));
        PERMISSION_MAP.put("manageIssueNote", List.of(
                "getAllIssueNotes",
                "getIssueNoteById",
                "getOrderById",
                "getMaterialsByProduct",

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
                "getActiveProducts"
        ));

        // ======================
        // 12) DUYỆT YÊU CẦU MUA
        // ======================
        PERMISSION_MAP.put("acceptPurchaseRequest", List.of(
                "updatePurchaseRequestStatus"
        ));
    }

    public static Set<String> expandPermissions(List<String> clientKeys) {
        Set<String> finalKeys = new HashSet<>(clientKeys);
        for (String mainKey : clientKeys) {
            List<String> subKeys = PERMISSION_MAP.get(mainKey);
            if (subKeys != null && !subKeys.isEmpty()) {
                finalKeys.addAll(subKeys);
            }
        }
        return finalKeys;
    }
}
