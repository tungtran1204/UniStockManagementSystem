package vn.unistock.unistockmanagementsystem.features.auth.login;

import lombok.*;

@Getter
@Setter
@Builder
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class LoginDTO {
    private String email;
    private String password;
    private String role;
    private String token;

    public LoginDTO(String token, String role, String email) {
        this.token = token;
        this.role = role;
        this.email = email;
    }
}
