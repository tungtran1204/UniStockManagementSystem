package vn.unistock.unistockmanagementsystem.features.auth.login;

import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import vn.unistock.unistockmanagementsystem.entities.User;

@Service
public class LoginService {
    private final LoginRepository loginRepository;

    public LoginService(LoginRepository loginRepository) {
        this.loginRepository = loginRepository;
    }

    @Cacheable("users")
    public User loadUserByEmail(String email) {
        return loginRepository.findByEmailFetchAll(email)
                .orElse(null);
    }
}
