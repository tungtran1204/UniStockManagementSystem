package vn.unistock.unistockmanagementsystem.features.user.units;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.unistock.unistockmanagementsystem.entities.Unit;

public interface UnitRepository extends JpaRepository<Unit, Long> {
}
