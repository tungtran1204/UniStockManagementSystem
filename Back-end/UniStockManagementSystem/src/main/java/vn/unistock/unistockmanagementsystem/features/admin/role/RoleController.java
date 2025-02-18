package vn.unistock.unistockmanagementsystem.features.admin.role;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/unistock/admin/roles")
@RequiredArgsConstructor
public class RoleController {

    private final RoleService roleService;

    // 🟢 API: Lấy danh sách vai trò
    @GetMapping
    public ResponseEntity<List<RoleDTO>> getAllRoles() {
        return ResponseEntity.ok(roleService.getAllRoles());
    }

    // 🟢 API: Thêm mới vai trò
    @PostMapping
    public ResponseEntity<RoleDTO> createRole(@RequestBody RoleDTO dto) {
        RoleDTO newRole = roleService.createRole(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(newRole);
    }

    // 🟢 API: Cập nhật thông tin vai trò
    @PutMapping("/{id}")
    public ResponseEntity<RoleDTO> updateRole(@PathVariable Long id, @RequestBody RoleDTO dto) {
        RoleDTO updatedRole = roleService.updateRole(id, dto);
        return ResponseEntity.ok(updatedRole);
    }

    // 🔄 API: Cập nhật trạng thái active của vai trò
    @PatchMapping("/{id}/status")
    public ResponseEntity<RoleDTO> updateRoleStatus(@PathVariable Long id, @RequestBody Map<String, Boolean> status) {
        RoleDTO updatedRole = roleService.updateRoleStatus(id, status.get("active"));
        return ResponseEntity.ok(updatedRole);
    }

    // 🗑 API: Xóa vai trò
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRole(@PathVariable Long id) {
        roleService.deleteRole(id);
        return ResponseEntity.noContent().build();
    }
}
