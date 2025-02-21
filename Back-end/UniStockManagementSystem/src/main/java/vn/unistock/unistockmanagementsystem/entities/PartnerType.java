package vn.unistock.unistockmanagementsystem.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "partner_types")
public class PartnerType {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "type_id")
    private Long typeId;

    @NotBlank(message = "Mã nhóm đối tác không được để trống.")
    @Column(name = "type_code")
    private String typeCode;

    @NotBlank(message = "Tên nhóm đối tác không được để trống.")
    @Column(name = "type_name")
    private String typeName;

//    @ManyToMany(mappedBy = "partnerTypes")
//    private Set<Partner> partners = new HashSet<>();

    private Boolean status;
    private String description;

    // Audit
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Long createdBy;
    private Long updatedBy;
}