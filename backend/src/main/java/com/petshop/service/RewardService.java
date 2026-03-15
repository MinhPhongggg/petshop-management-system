package com.petshop.service;

import com.petshop.dto.response.RewardProgressDTO;

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
}
