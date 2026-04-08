package com.petshop.service;

import java.math.BigDecimal;
import java.util.Map;

public interface MoMoService {

    /**
     * Tạo yêu cầu thanh toán cọc MoMo cho booking.
     * Trả về payUrl để redirect khách hoặc QR URL (mock mode).
     */
    Map<String, Object> createDepositPayment(Long bookingId);

    /**
     * Xử lý IPN callback từ MoMo (server-to-server).
     */
    void handleIPN(Map<String, Object> ipnData);

    /**
     * Xử lý redirect return từ MoMo (client-side).
     * Trả về thông tin booking sau khi xử lý.
     */
    Map<String, Object> handleRedirectResult(Map<String, String> params);

    /**
     * Hoàn tiền cọc cho booking bị hủy.
     */
    Map<String, Object> refundDeposit(Long bookingId, String reason);

    /**
     * Tính số tiền cọc dựa trên giá dịch vụ.
     */
    BigDecimal calculateDepositAmount(BigDecimal servicePrice);
}
