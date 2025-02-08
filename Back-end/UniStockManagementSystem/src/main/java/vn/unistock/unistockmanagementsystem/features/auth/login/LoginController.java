package vn.unistock.unistockmanagementsystem.features.auth.login;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import vn.unistock.unistockmanagementsystem.entities.User;
import vn.unistock.unistockmanagementsystem.security.Jwt;


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

            if (!request.getPassword().equals(user.getPassword())) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials");
            }

            String role = user.getRole().getRoleName();
            String email = user.getEmail();
            String token = jwtUtil.generateToken(user.getUserId(), email, role);

            return ResponseEntity.ok(new LoginDTO(token, role, email));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An error occurred");
        }
    }
}
