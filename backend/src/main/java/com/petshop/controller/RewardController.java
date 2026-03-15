package com.petshop.controller;

import com.petshop.dto.response.RewardProgressDTO;
import com.petshop.service.RewardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/rewards")
@RequiredArgsConstructor
public class RewardController {

    private final RewardService rewardService;

    /**
     * Lấy tiến trình tích điểm của user đang đăng nhập
     */
    @GetMapping("/my-progress")
    public ResponseEntity<RewardProgressDTO> getMyRewardProgress() {
        return ResponseEntity.ok(rewardService.getMyRewardProgress());
    }

    /**
     * Lấy danh sách tiers (công khai)
     */
    @GetMapping("/tiers")
    public ResponseEntity<RewardProgressDTO> getTiers() {
        // Trả về progress mặc định nếu chưa đăng nhập 
        // (sẽ handle ở frontend nếu 401)
        return ResponseEntity.ok(rewardService.getMyRewardProgress());
    }

    /**
     * Admin: xem tiến trình tích điểm của user bất kỳ
     */
    @GetMapping("/user/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<RewardProgressDTO> getUserRewardProgress(@PathVariable Long userId) {
        return ResponseEntity.ok(rewardService.getUserRewardProgress(userId));
    }
}
