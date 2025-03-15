package vn.unistock.unistockmanagementsystem.entities;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "material_request_details")
public class MaterialRequestDetail {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "request_detail_id")
    private Long requestDetailId;

    @ManyToOne
    @JoinColumn(name = "request_id")
    private MaterialRequest materialRequest;

    @ManyToOne
    @JoinColumn(name = "material_id")
    private Material material;

    private Double requestedQty;


}
