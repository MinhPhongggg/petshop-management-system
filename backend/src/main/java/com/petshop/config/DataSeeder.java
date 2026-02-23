package com.petshop.config;

import com.petshop.entity.User;
import com.petshop.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Tạo tài khoản Admin mặc định nếu chưa tồn tại
        if (!userRepository.existsByEmail("admin@petshop.com")) {
            User admin = User.builder()
                    .email("admin@petshop.com")
                    .password(passwordEncoder.encode("admin123"))
                    .fullName("Administrator")
                    .phone("0900000000")
                    .role(User.Role.ADMIN)
                    .active(true)
                    .address("He thong PetShop")
                    .build();
            userRepository.save(admin);
            System.out.println(">>> Đã tạo tài khoản Admin mặc định: admin@petshop.com / admin123");
        }
    }
}
