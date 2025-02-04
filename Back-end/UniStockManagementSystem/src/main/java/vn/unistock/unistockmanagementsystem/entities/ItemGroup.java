package vn.unistock.unistockmanagementsystem.entities;

import jakarta.persistence.*;
import lombok.Data;
import lombok.ToString;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "item_groups")
public class ItemGroup {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "group_id")
    private Long groupId;

    @Column(name = "group_code")
    private String groupCode;

    @Column(name = "group_name")
    private String groupName;

    private Boolean status;
    private String description;

    // Audit
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Long createdBy;
    private Long updatedBy;

    // Gợi ý:
    // - 1 ItemGroup có nhiều ProductType
    // - 1 ItemGroup cũng có thể có nhiều Material (nếu group cho NVL, CCDC)
    // => Tuỳ bạn có muốn "bidirectional" hay không.
}

