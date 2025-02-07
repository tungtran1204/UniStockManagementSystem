package vn.unistock.unistockmanagementsystem.features.au.AU_01;

import lombok.*;

@Getter
@Setter
@Builder
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class AU_01_DTO {
    private String email;
    private String password;
    private String role;
    private String token;

    public AU_01_DTO(String token, String role, String email) {
        this.token = token;
        this.role = role;
        this.email = email;
    }
}
