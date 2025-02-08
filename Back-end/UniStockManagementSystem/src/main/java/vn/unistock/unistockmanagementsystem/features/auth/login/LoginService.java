package vn.unistock.unistockmanagementsystem.features.auth.login;

import org.springframework.stereotype.Service;
import vn.unistock.unistockmanagementsystem.entities.User;

@Service
public class LoginService {
    private final LoginRepository au01Repository;

    public LoginService(LoginRepository au01Repository) {
        this.au01Repository = au01Repository;
    }


    public User loadUserByEmail(String email) {
        return au01Repository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found with email: " + email));
    }
}
