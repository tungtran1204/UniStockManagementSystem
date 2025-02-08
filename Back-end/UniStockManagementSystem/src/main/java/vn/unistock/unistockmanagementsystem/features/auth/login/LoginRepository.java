package vn.unistock.unistockmanagementsystem.features.auth.login;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.unistock.unistockmanagementsystem.entities.User;

import java.util.Optional;
@Repository
public interface LoginRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
}
