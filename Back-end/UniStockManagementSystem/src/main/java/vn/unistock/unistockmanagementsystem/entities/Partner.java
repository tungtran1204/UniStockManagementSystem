package vn.unistock.unistockmanagementsystem.entities;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "partners")
public class Partner {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "partner_id")
    private Long partnerId;

    @Column(name = "partner_name")
    private String partnerName;

//    @ManyToMany
//    @JoinTable(
//            name = "partner_with_type",
//            joinColumns = @JoinColumn(name = "partner_id"),
//            inverseJoinColumns = @JoinColumn(name = "partner_type_id")
//    )
//    private Set<PartnerType> partnerTypes = new HashSet<>();

    private String address;
    private String phone;
    private String email;

    // Audit
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Long createdBy;
    private Long updatedBy;
}