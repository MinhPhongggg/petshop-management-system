package com.petshop.controller;

import com.petshop.service.MoMoService;
import com.petshop.service.impl.MoMoServiceImpl;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/payments/momo")
@RequiredArgsConstructor
public class BookingDepositController {

    private final MoMoService moMoService;
    private final MoMoServiceImpl moMoServiceImpl; // For mock method

    /**
     * Tạo yêu cầu thanh toán cọc MoMo cho booking.
     * POST /api/payments/momo/booking/{bookingId}/deposit
     */
    @PostMapping("/booking/{bookingId}/deposit")
    public ResponseEntity<Map<String, Object>> createDeposit(@PathVariable Long bookingId) {
        Map<String, Object> result = moMoService.createDepositPayment(bookingId);
        return ResponseEntity.ok(result);
    }

    /**
     * Mock: Xác nhận thanh toán cọc (giả lập).
     * POST /api/payments/momo/booking/{bookingId}/confirm-mock
     */
    @PostMapping("/booking/{bookingId}/confirm-mock")
    public ResponseEntity<Map<String, Object>> confirmMockDeposit(@PathVariable Long bookingId) {
        Map<String, Object> result = moMoServiceImpl.confirmMockPayment(bookingId);
        return ResponseEntity.ok(result);
    }

    /**
     * MoMo IPN callback (server-to-server, không cần auth).
     * POST /api/payments/momo/ipn
     */
    @PostMapping("/ipn")
    public ResponseEntity<Void> handleIPN(@RequestBody Map<String, Object> ipnData) {
        moMoService.handleIPN(ipnData);
        return ResponseEntity.noContent().build();
    }

    /**
     * Xử lý redirect return từ MoMo.
     * GET /api/payments/momo/redirect
     */
    @GetMapping("/redirect")
    public ResponseEntity<Map<String, Object>> handleRedirect(@RequestParam Map<String, String> params) {
        Map<String, Object> result = moMoService.handleRedirectResult(params);
        return ResponseEntity.ok(result);
    }

    /**
     * Admin: Hoàn cọc cho booking bị hủy.
     * POST /api/payments/momo/booking/{bookingId}/refund
     */
    @PostMapping("/booking/{bookingId}/refund")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<Map<String, Object>> refundDeposit(
            @PathVariable Long bookingId,
            @RequestParam(defaultValue = "Hủy lịch - hoàn cọc") String reason) {
        Map<String, Object> result = moMoService.refundDeposit(bookingId, reason);
        return ResponseEntity.ok(result);
    }
}
