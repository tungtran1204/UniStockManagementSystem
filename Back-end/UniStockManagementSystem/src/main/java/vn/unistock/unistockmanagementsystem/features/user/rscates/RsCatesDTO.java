package vn.unistock.unistockmanagementsystem.features.user.rscates;

import jakarta.persistence.Column;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RsCatesDTO {
    private Long id;
    @Size(max = 255, message = "This field has maximum 255 characters")
    @NotBlank(message = "This field must not be blank")
    private String name;
    @Size(max = 255, message = "This field has maximum 255 characters")
    private String description;
    private LocalDateTime createAt;
    private LocalDateTime updateAt;
    private Boolean isActive;
}
