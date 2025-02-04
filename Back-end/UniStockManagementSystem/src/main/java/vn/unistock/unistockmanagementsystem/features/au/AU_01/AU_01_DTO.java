package vn.unistock.unistockmanagementsystem.features.au.AU_01;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@Builder
@ToString
public class AU_01_DTO {
    private String email;
    private String password;
    private String token;
    public AU_01_DTO() {}
    public AU_01_DTO(String token) {
        this.token = token;
    }
    public AU_01_DTO(String email, String password, String token) {
        this.email = email;
        this.password = password;
        this.token = token;
    }
}
