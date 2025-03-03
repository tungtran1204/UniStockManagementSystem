package vn.unistock.unistockmanagementsystem.features.admin.permission;

import java.util.*;

public class PermissionHierarchy {

    public static final Map<String, List<String>> PERMISSION_MAP = new HashMap<>();

    static {
        PERMISSION_MAP.put("viewProduct", List.of("getProductById", "checkProductCode"));

        PERMISSION_MAP.put("deleteRole", List.of("getAllRoles", "getRolePermissions"));

        PERMISSION_MAP.put("createProduct", List.of("getAllProductTypes","getAllUnits","checkProductCode"));

        PERMISSION_MAP.put("getAllProducts", List.of());

//test
        PERMISSION_MAP.put("updatePartnerType", List.of("createPartnerType","getAllPartnerTypes"));


        PERMISSION_MAP.put("checkProductCode", List.of());
        PERMISSION_MAP.put("updatePartnerType", List.of("createPartnerType"));
        PERMISSION_MAP.put("errorHtml", List.of());
        PERMISSION_MAP.put("updateUser", List.of());
        PERMISSION_MAP.put("deleteUser", List.of());
        PERMISSION_MAP.put("getCurrentUser", List.of());
        PERMISSION_MAP.put("getAllRoles", List.of());
        PERMISSION_MAP.put("deletePermission", List.of());
        PERMISSION_MAP.put("toggleProductionStatus", List.of());
        PERMISSION_MAP.put("createPartnerType", List.of());
        PERMISSION_MAP.put("getAllPartnerTypes", List.of());
        PERMISSION_MAP.put("getRolePermissions", List.of());
        PERMISSION_MAP.put("getUserById", List.of());
        PERMISSION_MAP.put("addUser", List.of());
        PERMISSION_MAP.put("login", List.of());
        PERMISSION_MAP.put("updatedPartnerTypeStatus", List.of());
        PERMISSION_MAP.put("getProductById", List.of());
        PERMISSION_MAP.put("updateStatus", List.of());
        PERMISSION_MAP.put("updateRole", List.of());
        PERMISSION_MAP.put("updateRoleStatus", List.of());
        PERMISSION_MAP.put("createRole", List.of());
        PERMISSION_MAP.put("updatePermission", List.of());
        PERMISSION_MAP.put("getAllUnits", List.of());
        PERMISSION_MAP.put("getAllProductTypes", List.of());
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
