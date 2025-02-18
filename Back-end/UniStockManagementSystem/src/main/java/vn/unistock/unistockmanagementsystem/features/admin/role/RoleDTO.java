package vn.unistock.unistockmanagementsystem.features.admin.role;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RoleDTO {
    private Long id;
    private String name;
    private String description;
    private Boolean active;
}
