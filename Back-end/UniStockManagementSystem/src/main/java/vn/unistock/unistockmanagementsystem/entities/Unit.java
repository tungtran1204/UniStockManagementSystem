package vn.unistock.unistockmanagementsystem.entities;

import jakarta.persistence.*;
import lombok.Data;
import java.util.List;

@Data
@Entity
@Table(name = "units")
public class Unit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long unitId;

    @Column(name = "unit_name", unique = true, nullable = false)
    private String unitName;

    @OneToMany(mappedBy = "unit")
    private List<Product> products;
}
