package vn.unistock.unistockmanagementsystem.features.au.AU_02;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.time.LocalDate;

@Getter
@Setter
@Builder
@ToString
public class AU_02_DTO {
    private Long id;
    private String fullName;
    private String password;
    private String phone;
    private String email;
    private String description;
    private LocalDate createdDate;
    private LocalDate updatedTime;
}
