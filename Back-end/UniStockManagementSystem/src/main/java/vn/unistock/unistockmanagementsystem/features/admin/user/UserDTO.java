package vn.unistock.unistockmanagementsystem.features.admin.user;

import lombok.*;

import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDTO {
    private Long userId;
    private String username;
    private String fullname;
    private String email;
    private Boolean isActive;
    private String password;
    // 🟢 Nhiều Roles => chứa danh sách ID (hoặc Set<String> roleNames)
    private Set<Long> roleIds;
    private Set<String> roleNames;
}
