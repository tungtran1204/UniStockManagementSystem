package vn.unistock.unistockmanagementsystem.entities;


import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import org.hibernate.annotations.ColumnDefault;
import vn.unistock.unistockmanagementsystem.validation.CommonStatus;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "warehouse")
public class Warehouse {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "warehouse_id")
    private Long warehouseId;

    @Column(name = "warehouse_code")
    //@NotBlank(message = "Mã kho không được để trống")
    private String warehouseCode;

    @Column(name = "warehouse_name")
    @NotBlank(message = "Tên kho không được để trống")
    private String warehouseName;

    @Column(name = "warehouse_description")
    @Size(max=255, message = "Trường mô tả quá dài")
    private String warehouseDescription;

    @Column(name = "is_active")
    private boolean isActive;
}
