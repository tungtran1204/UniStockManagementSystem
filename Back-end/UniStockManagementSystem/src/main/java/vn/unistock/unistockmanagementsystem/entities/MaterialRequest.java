package vn.unistock.unistockmanagementsystem.entities;

import jakarta.persistence.*;
import lombok.Data;
import lombok.ToString;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Entity
@Table(name = "material_requests")
public class MaterialRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "request_id")
    private Long requestId;

    private LocalDateTime requestDate;

    @ManyToOne
    @JoinColumn(name = "requested_by")
    private User requestedBy;

    @ManyToOne
    @JoinColumn(name = "approved_by")
    private User approvedBy;

    private String status;
    private String note;

    // Audit
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Long updatedBy;

    // 1 MaterialRequest -> nhiều MaterialRequestDetail
    @OneToMany(mappedBy = "materialRequest", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    private List<MaterialRequestDetail> details;
}

