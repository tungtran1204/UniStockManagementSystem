package vn.unistock.unistockmanagementsystem.features.admin.users;

import lombok.*;
import vn.unistock.unistockmanagementsystem.entities.Role;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UsersDTO {
    private Long userId;
    private String username;
    private String fullname;
    private String email;
    private Long roleId;  // Chỉ lưu ID của Role
    private String roleName; // Trả về thông tin Role
    private Boolean isActive;
}
