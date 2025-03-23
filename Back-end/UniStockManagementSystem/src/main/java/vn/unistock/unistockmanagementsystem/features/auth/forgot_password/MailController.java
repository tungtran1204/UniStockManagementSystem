package vn.unistock.unistockmanagementsystem.features.auth.forgot_password;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import vn.unistock.unistockmanagementsystem.entities.User;
import vn.unistock.unistockmanagementsystem.features.admin.user.UserRepository;
import vn.unistock.unistockmanagementsystem.security.Jwt;

import java.util.Map;

@RestController
@RequestMapping("/api/unistock/auth")
@RequiredArgsConstructor
public class MailController {
    private final MailService mailService;
    private final Jwt jwt;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    //
//    @PostMapping("/mail/send")
//    public String sendMail(@RequestBody EmailDTO emailRequest) {
//        mailService.send(emailRequest.getToEmail(), emailRequest.getSubject(), emailRequest.getBody());
//        return "Email sent successfully!";
//    }
    @PostMapping("/mail/send")
    public String sendResetLink(@RequestBody EmailDTO emailRequest) {
    String email = emailRequest.getToEmail();

    // 1. Kiểm tra user tồn tại
    User user = userRepository.findByEmail(email);
    if (user == null) {
        return "User not found!";
    }

    // 2. Sinh token có hạn 10 phút
    long tenMinutes = 10 * 60_000L;
    String resetToken = jwt.generateResetToken(email, tenMinutes);

    // 3. Tạo link reset
    String link = "https://frontend.example.com/reset-password?token=" + resetToken;

    // 4. Soạn nội dung email
    String subject = "Reset Your Password";
    String htmlBody = "<html>" +
            "<body>" +
            "<h3>Click the link below to reset your password:</h3>" +
            "<a href=\"" + link + "\">Reset Password</a>" +
            "<p>This link will expire in 10 minutes.</p>" +
            "</body>" +
            "</html>";

    // 5. Gửi email
    mailService.send(email, subject, htmlBody);

    return "Reset link sent successfully!";
    }

    @PostMapping("/reset-password")
    public String resetPassword(@RequestBody Map<String, String> payload) {
        String token = payload.get("token");
        String newPassword = payload.get("newPassword");

        if (token == null || newPassword == null) {
            return "Token and newPassword are required";
        }

        // 1. Kiểm tra token hết hạn chưa
        if (jwt.isTokenExpired(token)) {
            return "Token has expired";
        }

        // 2. Lấy email từ token
        String email = jwt.extractEmail(token);
        if (email == null) {
            return "Invalid token";
        }

        // 3. Tìm user
        User user = userRepository.findByEmail(email);
        if (user == null) {
            return "User not found";
        }

        // 4. Cập nhật mật khẩu
        // (Giả sử bạn có passwordEncoder bean)
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        return "Password reset successfully!";
    }

}
