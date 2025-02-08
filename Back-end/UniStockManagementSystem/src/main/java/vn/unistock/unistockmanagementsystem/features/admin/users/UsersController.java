package vn.unistock.unistockmanagementsystem.features.admin.users;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/unistock/admin/users")
@RequiredArgsConstructor
public class UsersController {
    private final UsersService usersService;

    // 🟢 API: Lấy danh sách Users
    @GetMapping
    public ResponseEntity<List<UsersDTO>> getAllUsers() {
        return ResponseEntity.ok(usersService.getAllUsers());
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<UsersDTO> updateStatus(@PathVariable Long id, @RequestBody Map<String, Boolean> status) {
        UsersDTO updatedUser = usersService.updateUserStatus(id, status.get("isActive"));
        return ResponseEntity.ok(updatedUser);
    }
    // 🟢 API: Lấy User theo ID
    @GetMapping("/{id}")
    public ResponseEntity<UsersDTO> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(usersService.getUserByUserId(id));
    }

    // 🟢 API: Tạo User mới (Role ID phải được cung cấp)
    @PostMapping("/{roleId}")
    public ResponseEntity<UsersDTO> createUser(@RequestBody UsersDTO usersDTO, @PathVariable Long roleId) {
        return ResponseEntity.ok(usersService.createUser(usersDTO, roleId));
    }

    // 🟢 API: Cập nhật User (Role ID phải được cung cấp)
    @PutMapping("/{id}/{roleId}")
    public ResponseEntity<UsersDTO> updateUser(@PathVariable Long id, @RequestBody UsersDTO usersDTO, @PathVariable Long roleId) {
        return ResponseEntity.ok(usersService.updateUser(id, usersDTO, roleId));
    }

    // 🟢 API: Xóa User
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        usersService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
}
