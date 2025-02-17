package vn.unistock.unistockmanagementsystem.features.admin.users;

import lombok.*;

import java.util.Set;

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
    private Boolean isActive;
    private String password;
    // 🟢 Nhiều Roles => chứa danh sách ID (hoặc Set<String> roleNames)
    private Set<Long> roleIds;
    private Set<String> roleNames;
}
