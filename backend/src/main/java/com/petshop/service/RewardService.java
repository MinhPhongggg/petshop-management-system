package com.petshop.service;

import com.petshop.dto.response.RewardProgressDTO;
import com.petshop.dto.response.VoucherDTO;

public interface RewardService {

    /**
     * Lấy tiến trình tích điểm/hạng thưởng của user đang đăng nhập
     */
    RewardProgressDTO getMyRewardProgress();

    /**
     * Lấy tiến trình tích điểm của user bất kỳ (admin)
     */
    RewardProgressDTO getUserRewardProgress(Long userId);

    /**
     * Kiểm tra và mở khóa hạng mới sau khi đơn hàng hoàn thành
     * Trả về tên hạng mới đạt được (null nếu không có)
     */
    String checkAndUnlockRewards(Long userId);

    /**
     * Tổng điểm khả dụng của user hiện tại.
     */
    long getMyAvailablePoints();

    /**
     * Gửi mã xác thực OTP để xem điểm tích lũy.
     */
    String requestPointsViewVerificationCode();

    /**
     * Xác thực OTP và trả về điểm tích lũy khả dụng.
     */
    long getMyAvailablePointsWithVerificationCode(String verificationCode);

    /**
     * Nhận voucher sau khi xem sản phẩm đủ thời gian.
     */
    VoucherDTO claimWatchProductVoucher(Long productId, Integer watchedSeconds);

    /**
     * Gửi mã xác thực đổi điểm qua Microsoft account (email Microsoft).
     */
    String requestRedeemVerificationCode(Long pointsToRedeem);

    /**
     * Xác nhận mã và đổi điểm lấy voucher.
     */
    VoucherDTO redeemPointsWithVerificationCode(Long pointsToRedeem, String verificationCode);
}
