package vn.unistock.unistockmanagementsystem.features.admin.users;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/unistock/admin/users")
@RequiredArgsConstructor
public class UsersController {
    private final UsersService usersService;

    @PostMapping
    public ResponseEntity<UsersDTO> addUser(@RequestBody UsersDTO userDTO) {
        UsersDTO newUser = usersService.createUser(userDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(newUser);
    }


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


    // 🟢 API: Xóa User
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        usersService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
}
