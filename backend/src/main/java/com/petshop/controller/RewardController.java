package com.petshop.controller;

import com.petshop.dto.request.PointsRedeemConfirmRequest;
import com.petshop.dto.request.PointsRedeemRequest;
import com.petshop.dto.request.VerificationCodeRequest;
import com.petshop.dto.request.WatchVoucherRequest;
import com.petshop.dto.response.RedeemCodeResponse;
import com.petshop.dto.response.RewardProgressDTO;
import com.petshop.dto.response.VoucherDTO;
import com.petshop.service.RewardService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/rewards")
@RequiredArgsConstructor
public class RewardController {

    private final RewardService rewardService;

    @Value("${petshop.verification.mock-authenticator:false}")
    private boolean mockAuthenticatorEnabled;

    /**
     * Lấy tiến trình tích điểm của user đang đăng nhập
     */
    @GetMapping("/my-progress")
    public ResponseEntity<RewardProgressDTO> getMyRewardProgress() {
        return ResponseEntity.ok(rewardService.getMyRewardProgress());
    }

    @GetMapping("/my-points")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<Map<String, Long>> getMyPoints() {
        return ResponseEntity.ok(Map.of("availablePoints", rewardService.getMyAvailablePoints()));
    }

    @PostMapping("/my-points/request-code")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<RedeemCodeResponse> requestViewPointsCode() {
        String code = rewardService.requestPointsViewVerificationCode();
        return ResponseEntity.ok(buildCodeResponse("Mã OTP xem điểm đã được gửi qua Microsoft", code));
    }

    @PostMapping("/my-points/verify")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<Map<String, Long>> verifyAndGetMyPoints(@Valid @RequestBody VerificationCodeRequest request) {
        return ResponseEntity.ok(
                Map.of("availablePoints", rewardService.getMyAvailablePointsWithVerificationCode(request.getVerificationCode()))
        );
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

    /**
     * USER: Nhận voucher bằng cách xem sản phẩm đủ 30 giây.
     * ADMIN/STAFF gọi endpoint này sẽ bị 403.
     */
    @PostMapping("/vouchers/watch-product")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<VoucherDTO> claimWatchVoucher(@Valid @RequestBody WatchVoucherRequest request) {
        return ResponseEntity.ok(
                rewardService.claimWatchProductVoucher(request.getProductId(), request.getWatchedSeconds())
        );
    }

    /**
     * USER: Yêu cầu mã xác thực đổi điểm (qua Microsoft email).
     */
    @PostMapping("/vouchers/redeem/request-code")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<RedeemCodeResponse> requestRedeemCode(@Valid @RequestBody PointsRedeemRequest request) {
        String code = rewardService.requestRedeemVerificationCode(request.getPointsToRedeem());
        return ResponseEntity.ok(buildCodeResponse("Mã xác thực đã được gửi qua Microsoft", code));
    }

    /**
     * USER: Xác thực mã và đổi điểm lấy voucher.
     */
    @PostMapping("/vouchers/redeem/confirm")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<VoucherDTO> redeemPoints(@Valid @RequestBody PointsRedeemConfirmRequest request) {
        return ResponseEntity.ok(
                rewardService.redeemPointsWithVerificationCode(
                        request.getPointsToRedeem(),
                        request.getVerificationCode()
                )
        );
    }

    private RedeemCodeResponse buildCodeResponse(String message, String code) {
        return RedeemCodeResponse.builder()
                .provider("MICROSOFT")
                .expiresInSeconds(300)
                .message(message)
                .debugCode(mockAuthenticatorEnabled ? code : null)
                .build();
    }
}
