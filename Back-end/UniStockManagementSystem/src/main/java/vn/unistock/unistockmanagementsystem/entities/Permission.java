package vn.unistock.unistockmanagementsystem.entities;

import jakarta.persistence.*;
import lombok.Data;
import lombok.ToString;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Entity
@Table(name = "permissions")
public class Permission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "permission_id")
    private Long permissionId;

    @Column(name = "permission_name")
    private String permissionName;

    private String description;

    // Audit
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Long createdBy;
    private Long updatedBy;

    // Liên kết qua bảng nối role_permissions
    @OneToMany(mappedBy = "permission", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    private List<RolePermission> rolePermissions;
}
