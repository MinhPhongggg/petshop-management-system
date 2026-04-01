package com.petshop.config;

import com.petshop.entity.RewardTier;
import com.petshop.entity.User;
import com.petshop.repository.RewardTierRepository;
import com.petshop.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final RewardTierRepository rewardTierRepository;

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

        // Seed Reward Tiers nếu chưa có
        seedRewardTiers();
    }

    private void seedRewardTiers() {
        if (rewardTierRepository.count() > 0) return;

        RewardTier[] tiers = {
            RewardTier.builder()
                .name("BRONZE")
                .displayName("Đồng")
                .description("Chi tiêu từ 500.000đ - Giảm 5% cho đơn tiếp theo")
                .icon("🥉")
                .color("#CD7F32")
                .minSpending(BigDecimal.valueOf(500000))
                .discountPercent(5)
                .maxDiscount(BigDecimal.valueOf(50000))
                .tierOrder(1)
                .active(true)
                .build(),
            RewardTier.builder()
                .name("SILVER")
                .displayName("Bạc")
                .description("Chi tiêu từ 2.000.000đ - Giảm 10% cho đơn tiếp theo")
                .icon("🥈")
                .color("#C0C0C0")
                .minSpending(BigDecimal.valueOf(2000000))
                .discountPercent(10)
                .maxDiscount(BigDecimal.valueOf(100000))
                .tierOrder(2)
                .active(true)
                .build(),
            RewardTier.builder()
                .name("GOLD")
                .displayName("Vàng")
                .description("Chi tiêu từ 5.000.000đ - Giảm 15% cho đơn tiếp theo")
                .icon("🥇")
                .color("#FFD700")
                .minSpending(BigDecimal.valueOf(5000000))
                .discountPercent(15)
                .maxDiscount(BigDecimal.valueOf(200000))
                .tierOrder(3)
                .active(true)
                .build(),
            RewardTier.builder()
                .name("PLATINUM")
                .displayName("Bạch Kim")
                .description("Chi tiêu từ 10.000.000đ - Giảm 20% cho đơn tiếp theo")
                .icon("💎")
                .color("#E5E4E2")
                .minSpending(BigDecimal.valueOf(10000000))
                .discountPercent(20)
                .maxDiscount(BigDecimal.valueOf(500000))
                .tierOrder(4)
                .active(true)
                .build(),
            RewardTier.builder()
                .name("DIAMOND")
                .displayName("Kim Cương")
                .description("Chi tiêu từ 20.000.000đ - Giảm 25% cho đơn tiếp theo")
                .icon("👑")
                .color("#B9F2FF")
                .minSpending(BigDecimal.valueOf(20000000))
                .discountPercent(25)
                .maxDiscount(BigDecimal.valueOf(1000000))
                .tierOrder(5)
                .active(true)
                .build()
        };

        for (RewardTier tier : tiers) {
            rewardTierRepository.save(tier);
        }
        System.out.println(">>> Đã tạo 5 hạng thưởng: Đồng, Bạc, Vàng, Bạch Kim, Kim Cương");
    }
}