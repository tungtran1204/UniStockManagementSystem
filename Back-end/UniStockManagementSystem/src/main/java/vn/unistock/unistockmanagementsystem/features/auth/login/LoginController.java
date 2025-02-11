package vn.unistock.unistockmanagementsystem.features.auth.login;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import vn.unistock.unistockmanagementsystem.entities.Role;
import vn.unistock.unistockmanagementsystem.entities.User;
import vn.unistock.unistockmanagementsystem.security.Jwt;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;


@RestController
@RequestMapping("/api/unistock/auth")
public class LoginController {
    private final LoginService au01Service;
    private final Jwt jwtUtil;

    public LoginController(LoginService au01Service, Jwt jwtUtil) {
        this.au01Service = au01Service;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginDTO request) {
        try {
            User user = au01Service.loadUserByEmail(request.getEmail());

            // Kiểm tra password (ở đây đang so sánh plain-text!)
            if (!request.getPassword().equals(user.getPassword())) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials");
            }

            // Lấy danh sách roleName
            // (giả sử user.getRoles() trả về Set<Role>)
            List<String> roles = user.getRoles().stream()
                    .map(Role::getRoleName)
                    .collect(Collectors.toList());


            String email = user.getEmail();

            // Sinh token kèm nhiều roles (ở mức đơn giản: rolesStr)
            // Tùy bạn cấu hình jwtUtil để bỏ roles vào claim
            String token = jwtUtil.generateToken(
                    user.getUserId(),
                    email,
                    roles // thay vì "role"
            );

            return ResponseEntity.ok(new LoginDTO(token, roles, email));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An error occurred");
        }
    }
}
