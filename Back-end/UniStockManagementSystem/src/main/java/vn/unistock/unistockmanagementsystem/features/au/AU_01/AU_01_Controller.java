package vn.unistock.unistockmanagementsystem.features.au.AU_01;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import vn.unistock.unistockmanagementsystem.entities.User;
import vn.unistock.unistockmanagementsystem.security.Jwt;


@RestController
@RequestMapping("/api/unistock/au_01")
public class AU_01_Controller {
    private final AU_01_Service au01Service;
    private final Jwt jwtUtil;

    public AU_01_Controller(AU_01_Service au01Service, Jwt jwtUtil) {
        this.au01Service = au01Service;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AU_01_DTO request) {
        try {
            User user = au01Service.loadUserByEmail(request.getEmail());

            if (!request.getPassword().equals(user.getPassword())) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials");
            }

            String role = user.getRole().getRoleName();
            String email = user.getEmail();
            String token = jwtUtil.generateToken(user.getId(), role, email);

            return ResponseEntity.ok(new AU_01_DTO(token, role, email));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An error occurred");
        }
    }
}
