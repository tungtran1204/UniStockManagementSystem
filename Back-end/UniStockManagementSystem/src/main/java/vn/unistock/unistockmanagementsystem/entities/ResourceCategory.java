package vn.unistock.unistockmanagementsystem.entities;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Entity
@Builder
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Table(name = "resource_category")
public class ResourceCategory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "rc_id")
    Long id;
    @Column(name = "rc_name")
    String name;
    @Column(name = "rc_description")
    String description;
    @Column(name = "created_at")
    LocalDateTime createAt;
    @Column(name = "updated_at")
    LocalDateTime updateAt;
    @Column(name = "is_active")
    Boolean isActive;
}
