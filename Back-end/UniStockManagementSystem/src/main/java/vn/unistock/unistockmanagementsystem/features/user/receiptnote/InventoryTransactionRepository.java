package vn.unistock.unistockmanagementsystem.features.user.receiptnote;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.unistock.unistockmanagementsystem.entities.InventoryTransaction;

@Repository
public interface InventoryTransactionRepository extends JpaRepository<InventoryTransaction, Long> {
}
