package com.petshop.service.impl;

import com.petshop.entity.Booking;
import com.petshop.entity.BookingTransaction;
import com.petshop.exception.BadRequestException;
import com.petshop.exception.ResourceNotFoundException;
import com.petshop.repository.BookingRepository;
import com.petshop.repository.BookingTransactionRepository;
import com.petshop.security.UserPrincipal;
import com.petshop.service.MoMoService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class MoMoServiceImpl implements MoMoService {

    private final BookingRepository bookingRepository;
    private final BookingTransactionRepository transactionRepository;

    @Value("${momo.partner-code}")
    private String partnerCode;

    @Value("${momo.access-key}")
    private String accessKey;

    @Value("${momo.secret-key}")
    private String secretKey;

    @Value("${momo.api-url}")
    private String apiUrl;

    @Value("${momo.redirect-url}")
    private String redirectUrl;

    @Value("${momo.ipn-url}")
    private String ipnUrl;

    @Value("${momo.mock-enabled:true}")
    private boolean mockEnabled;

    @Value("${petshop.deposit.percentage:30}")
    private int depositPercentage;

    @Value("${petshop.deposit.min-amount:50000}")
    private long minDepositAmount;

    @Value("${petshop.deposit.timeout-minutes:15}")
    private int timeoutMinutes;

    @Override
    public BigDecimal calculateDepositAmount(BigDecimal servicePrice) {
        BigDecimal deposit = servicePrice.multiply(BigDecimal.valueOf(depositPercentage))
                .divide(BigDecimal.valueOf(100), 0, RoundingMode.CEILING);
        BigDecimal minimum = BigDecimal.valueOf(minDepositAmount);
        return deposit.max(minimum);
    }

    @Override
    @Transactional
    public Map<String, Object> createDepositPayment(Long bookingId) {
        // Validate user
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        UserPrincipal principal = (UserPrincipal) auth.getPrincipal();

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Lịch hẹn không tồn tại"));

        if (!booking.getUser().getId().equals(principal.getId())) {
            throw new BadRequestException("Lịch hẹn không thuộc về bạn");
        }

        // Chỉ tạo thanh toán cho booking PENDING hoặc DEPOSIT_PENDING
        if (booking.getStatus() != Booking.BookingStatus.PENDING
                && booking.getStatus() != Booking.BookingStatus.DEPOSIT_PENDING) {
            throw new BadRequestException("Lịch hẹn không ở trạng thái có thể thanh toán cọc");
        }

        // Kiểm tra có giao dịch pending cũ không (idempotency)
        if (booking.getDepositStatus() == Booking.DepositStatus.PAID) {
            throw new BadRequestException("Lịch hẹn đã được đặt cọc");
        }

        // Tính tiền cọc
        BigDecimal depositAmount = calculateDepositAmount(booking.getPrice());
        BigDecimal remainingAmount = booking.getPrice().subtract(depositAmount);

        // Tạo orderId duy nhất
        String orderId = "BK" + booking.getId() + "_" + System.currentTimeMillis();
        String requestId = UUID.randomUUID().toString();

        // Cập nhật booking
        booking.setDepositStatus(Booking.DepositStatus.PENDING);
        booking.setDepositAmount(depositAmount);
        booking.setRemainingAmount(remainingAmount);
        booking.setMomoOrderId(orderId);
        booking.setStatus(Booking.BookingStatus.DEPOSIT_PENDING);
        booking.setDepositExpiresAt(LocalDateTime.now().plusMinutes(timeoutMinutes));
        bookingRepository.save(booking);

        // Tạo transaction record
        BookingTransaction transaction = BookingTransaction.builder()
                .booking(booking)
                .orderId(orderId)
                .requestId(requestId)
                .amount(depositAmount)
                .paymentMethod("MOMO")
                .status(BookingTransaction.TransactionStatus.PENDING)
                .transactionType(BookingTransaction.TransactionType.DEPOSIT)
                .build();
        transactionRepository.save(transaction);

        if (mockEnabled) {
            return createMockPaymentResponse(booking, orderId, depositAmount, remainingAmount);
        }

        // === Real MoMo API call ===
        return createRealMoMoPayment(booking, orderId, requestId, depositAmount);
    }

    private Map<String, Object> createMockPaymentResponse(Booking booking, String orderId,
                                                           BigDecimal depositAmount, BigDecimal remainingAmount) {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("success", true);
        result.put("bookingId", booking.getId());
        result.put("bookingCode", booking.getBookingCode());
        result.put("orderId", orderId);
        result.put("depositAmount", depositAmount);
        result.put("remainingAmount", remainingAmount);
        result.put("totalPrice", booking.getPrice());
        result.put("payUrl", null); // Mock mode: frontend sẽ xử lý
        result.put("mockMode", true);
        result.put("expiresAt", booking.getDepositExpiresAt());
        result.put("timeoutMinutes", timeoutMinutes);
        return result;
    }

    private Map<String, Object> createRealMoMoPayment(Booking booking, String orderId,
                                                       String requestId, BigDecimal depositAmount) {
        long amount = depositAmount.longValue();
        String orderInfo = "Dat coc lich hen " + booking.getBookingCode()
                + " - " + booking.getService().getName();
        String extraData = "";

        // Build raw signature
        String rawSignature = "accessKey=" + accessKey
                + "&amount=" + amount
                + "&extraData=" + extraData
                + "&ipnUrl=" + ipnUrl
                + "&orderId=" + orderId
                + "&orderInfo=" + orderInfo
                + "&partnerCode=" + partnerCode
                + "&redirectUrl=" + redirectUrl
                + "&requestId=" + requestId
                + "&requestType=captureWallet";

        String signature = hmacSHA256(rawSignature, secretKey);

        // Build request body
        Map<String, Object> requestBody = new LinkedHashMap<>();
        requestBody.put("partnerCode", partnerCode);
        requestBody.put("accessKey", accessKey);
        requestBody.put("requestId", requestId);
        requestBody.put("amount", amount);
        requestBody.put("orderId", orderId);
        requestBody.put("orderInfo", orderInfo);
        requestBody.put("redirectUrl", redirectUrl);
        requestBody.put("ipnUrl", ipnUrl);
        requestBody.put("extraData", extraData);
        requestBody.put("requestType", "captureWallet");
        requestBody.put("signature", signature);
        requestBody.put("lang", "vi");

        try {
            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            ResponseEntity<Map> response = restTemplate.exchange(
                    apiUrl + "/create", HttpMethod.POST, entity, Map.class);

            Map<String, Object> body = response.getBody();
            log.info("MoMo create payment response: {}", body);

            if (body != null && Integer.valueOf(0).equals(body.get("resultCode"))) {
                Map<String, Object> result = new LinkedHashMap<>();
                result.put("success", true);
                result.put("bookingId", booking.getId());
                result.put("bookingCode", booking.getBookingCode());
                result.put("orderId", orderId);
                result.put("depositAmount", depositAmount);
                result.put("remainingAmount", booking.getPrice().subtract(depositAmount));
                result.put("totalPrice", booking.getPrice());
                result.put("payUrl", body.get("payUrl"));
                result.put("mockMode", false);
                result.put("expiresAt", booking.getDepositExpiresAt());
                return result;
            } else {
                String msg = body != null ? String.valueOf(body.get("message")) : "Unknown error";
                throw new BadRequestException("MoMo error: " + msg);
            }
        } catch (BadRequestException e) {
            throw e;
        } catch (Exception e) {
            log.error("MoMo API error", e);
            throw new BadRequestException("Không thể kết nối MoMo. Vui lòng thử lại sau.");
        }
    }

    @Override
    @Transactional
    public void handleIPN(Map<String, Object> ipnData) {
        log.info("MoMo IPN received: {}", ipnData);

        String orderId = String.valueOf(ipnData.get("orderId"));
        int resultCode = Integer.parseInt(String.valueOf(ipnData.get("resultCode")));
        String transId = String.valueOf(ipnData.get("transId"));
        long amount = Long.parseLong(String.valueOf(ipnData.get("amount")));

        // Verify signature
        if (!mockEnabled) {
            String receivedSignature = String.valueOf(ipnData.get("signature"));
            String rawSignature = "accessKey=" + accessKey
                    + "&amount=" + amount
                    + "&extraData=" + ipnData.getOrDefault("extraData", "")
                    + "&message=" + ipnData.getOrDefault("message", "")
                    + "&orderId=" + orderId
                    + "&orderInfo=" + ipnData.getOrDefault("orderInfo", "")
                    + "&orderType=" + ipnData.getOrDefault("orderType", "")
                    + "&partnerCode=" + partnerCode
                    + "&payType=" + ipnData.getOrDefault("payType", "")
                    + "&requestId=" + ipnData.getOrDefault("requestId", "")
                    + "&responseTime=" + ipnData.getOrDefault("responseTime", "")
                    + "&resultCode=" + resultCode
                    + "&transId=" + transId;

            String expectedSignature = hmacSHA256(rawSignature, secretKey);
            if (!expectedSignature.equals(receivedSignature)) {
                log.warn("MoMo IPN signature mismatch! orderId={}", orderId);
                throw new BadRequestException("Invalid signature");
            }
        }

        BookingTransaction transaction = transactionRepository.findByOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found: " + orderId));

        // Idempotency: skip if already processed
        if (transaction.getStatus() != BookingTransaction.TransactionStatus.PENDING) {
            log.info("Transaction {} already processed, status={}", orderId, transaction.getStatus());
            return;
        }

        Booking booking = transaction.getBooking();

        // Amount validation
        if (amount != transaction.getAmount().longValue()) {
            log.error("Amount mismatch! Expected={}, got={}, orderId={}",
                    transaction.getAmount().longValue(), amount, orderId);
            transaction.setStatus(BookingTransaction.TransactionStatus.FAILED);
            transaction.setMessage("Amount mismatch");
            transaction.setUpdatedAt(LocalDateTime.now());
            transactionRepository.save(transaction);
            return;
        }

        if (resultCode == 0) {
            // Thanh toán thành công
            transaction.setStatus(BookingTransaction.TransactionStatus.SUCCESS);
            transaction.setTransId(transId);
            transaction.setResultCode(resultCode);
            transaction.setMessage("Success");
            transaction.setUpdatedAt(LocalDateTime.now());
            transactionRepository.save(transaction);

            booking.setDepositStatus(Booking.DepositStatus.PAID);
            booking.setMomoTransactionId(transId);
            booking.setDepositPaidAt(LocalDateTime.now());
            booking.setStatus(Booking.BookingStatus.CONFIRMED);
            booking.setConfirmedAt(LocalDateTime.now());
            bookingRepository.save(booking);

            log.info("Booking {} deposit paid successfully. transId={}", booking.getBookingCode(), transId);
        } else {
            // Thanh toán thất bại
            transaction.setStatus(BookingTransaction.TransactionStatus.FAILED);
            transaction.setResultCode(resultCode);
            transaction.setMessage(String.valueOf(ipnData.getOrDefault("message", "Failed")));
            transaction.setUpdatedAt(LocalDateTime.now());
            transactionRepository.save(transaction);

            log.warn("Booking {} deposit failed. resultCode={}", booking.getBookingCode(), resultCode);
        }
    }

    @Override
    @Transactional
    public Map<String, Object> handleRedirectResult(Map<String, String> params) {
        String orderId = params.get("orderId");
        String resultCodeStr = params.get("resultCode");
        String transId = params.getOrDefault("transId", "");

        BookingTransaction transaction = transactionRepository.findByOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found"));

        Booking booking = transaction.getBooking();

        // Fallback: Nếu IPN chưa đến (localhost), xử lý trực tiếp từ redirect params
        if ("0".equals(resultCodeStr)
                && transaction.getStatus() == BookingTransaction.TransactionStatus.PENDING) {
            log.info("Processing payment via redirect fallback for orderId={}", orderId);
            transaction.setStatus(BookingTransaction.TransactionStatus.SUCCESS);
            transaction.setTransId(transId);
            transaction.setResultCode(0);
            transaction.setMessage("Success (via redirect)");
            transaction.setUpdatedAt(LocalDateTime.now());
            transactionRepository.save(transaction);

            booking.setDepositStatus(Booking.DepositStatus.PAID);
            booking.setMomoTransactionId(transId);
            booking.setDepositPaidAt(LocalDateTime.now());
            booking.setStatus(Booking.BookingStatus.CONFIRMED);
            booking.setConfirmedAt(LocalDateTime.now());
            bookingRepository.save(booking);
        } else if (!"0".equals(resultCodeStr)
                && transaction.getStatus() == BookingTransaction.TransactionStatus.PENDING) {
            // Thanh toán thất bại
            transaction.setStatus(BookingTransaction.TransactionStatus.FAILED);
            transaction.setResultCode(Integer.parseInt(resultCodeStr != null ? resultCodeStr : "-1"));
            transaction.setMessage("Failed (via redirect)");
            transaction.setUpdatedAt(LocalDateTime.now());
            transactionRepository.save(transaction);
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("bookingId", booking.getId());
        result.put("bookingCode", booking.getBookingCode());
        result.put("depositAmount", booking.getDepositAmount());
        result.put("remainingAmount", booking.getRemainingAmount());
        result.put("totalPrice", booking.getPrice());
        result.put("serviceName", booking.getService().getName());
        result.put("bookingDate", booking.getBookingDate());
        result.put("startTime", booking.getStartTime());
        result.put("depositStatus", booking.getDepositStatus().name());

        if ("0".equals(resultCodeStr) || transaction.getStatus() == BookingTransaction.TransactionStatus.SUCCESS) {
            result.put("success", true);
            result.put("message", "Đặt cọc thành công! Lịch hẹn đã được xác nhận.");
            result.put("transactionId", transaction.getTransId());
        } else {
            result.put("success", false);
            result.put("message", "Thanh toán không thành công. Vui lòng thử lại.");
        }

        return result;
    }

    @Override
    @Transactional
    public Map<String, Object> refundDeposit(Long bookingId, String reason) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Lịch hẹn không tồn tại"));

        if (booking.getDepositStatus() != Booking.DepositStatus.PAID) {
            throw new BadRequestException("Lịch hẹn chưa được đặt cọc");
        }

        if (mockEnabled) {
            return mockRefund(booking, reason);
        }

        // Real MoMo refund API
        return realRefund(booking, reason);
    }

    private Map<String, Object> mockRefund(Booking booking, String reason) {
        String refundTransId = "REFUND_" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        BookingTransaction refundTx = BookingTransaction.builder()
                .booking(booking)
                .orderId("RF" + booking.getId() + "_" + System.currentTimeMillis())
                .transId(refundTransId)
                .amount(booking.getDepositAmount())
                .paymentMethod("MOMO")
                .status(BookingTransaction.TransactionStatus.SUCCESS)
                .transactionType(BookingTransaction.TransactionType.REFUND)
                .message("Mock refund: " + reason)
                .build();
        transactionRepository.save(refundTx);

        booking.setDepositStatus(Booking.DepositStatus.REFUNDED);
        bookingRepository.save(booking);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("success", true);
        result.put("message", "Hoàn cọc thành công");
        result.put("refundAmount", booking.getDepositAmount());
        result.put("refundTransId", refundTransId);
        return result;
    }

    private Map<String, Object> realRefund(Booking booking, String reason) {
        String requestId = UUID.randomUUID().toString();
        String orderId = "RF" + booking.getId() + "_" + System.currentTimeMillis();
        long amount = booking.getDepositAmount().longValue();

        String rawSignature = "accessKey=" + accessKey
                + "&amount=" + amount
                + "&description=" + reason
                + "&orderId=" + orderId
                + "&partnerCode=" + partnerCode
                + "&requestId=" + requestId
                + "&transId=" + booking.getMomoTransactionId();

        String signature = hmacSHA256(rawSignature, secretKey);

        Map<String, Object> requestBody = new LinkedHashMap<>();
        requestBody.put("partnerCode", partnerCode);
        requestBody.put("orderId", orderId);
        requestBody.put("requestId", requestId);
        requestBody.put("amount", amount);
        requestBody.put("transId", booking.getMomoTransactionId());
        requestBody.put("lang", "vi");
        requestBody.put("description", reason);
        requestBody.put("signature", signature);

        try {
            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            ResponseEntity<Map> response = restTemplate.exchange(
                    apiUrl + "/refund", HttpMethod.POST, entity, Map.class);

            Map<String, Object> body = response.getBody();
            log.info("MoMo refund response: {}", body);

            BookingTransaction refundTx = BookingTransaction.builder()
                    .booking(booking)
                    .orderId(orderId)
                    .requestId(requestId)
                    .amount(booking.getDepositAmount())
                    .paymentMethod("MOMO")
                    .transactionType(BookingTransaction.TransactionType.REFUND)
                    .build();

            if (body != null && Integer.valueOf(0).equals(body.get("resultCode"))) {
                refundTx.setStatus(BookingTransaction.TransactionStatus.SUCCESS);
                refundTx.setTransId(String.valueOf(body.get("transId")));
                booking.setDepositStatus(Booking.DepositStatus.REFUNDED);
            } else {
                refundTx.setStatus(BookingTransaction.TransactionStatus.FAILED);
                refundTx.setMessage(body != null ? String.valueOf(body.get("message")) : "Refund failed");
            }

            transactionRepository.save(refundTx);
            bookingRepository.save(booking);

            Map<String, Object> result = new LinkedHashMap<>();
            result.put("success", refundTx.getStatus() == BookingTransaction.TransactionStatus.SUCCESS);
            result.put("message", refundTx.getStatus() == BookingTransaction.TransactionStatus.SUCCESS
                    ? "Hoàn cọc thành công" : "Hoàn cọc thất bại: " + refundTx.getMessage());
            result.put("refundAmount", booking.getDepositAmount());
            return result;
        } catch (Exception e) {
            log.error("MoMo refund error", e);
            throw new BadRequestException("Không thể hoàn cọc. Vui lòng thử lại sau.");
        }
    }

    /**
     * Mock: Xác nhận thanh toán không cần MoMo thực.
     * Gọi từ controller khi mock mode.
     */
    @Transactional
    public Map<String, Object> confirmMockPayment(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Lịch hẹn không tồn tại"));

        if (booking.getDepositStatus() == Booking.DepositStatus.PAID) {
            throw new BadRequestException("Đã thanh toán cọc rồi");
        }

        if (booking.getDepositStatus() != Booking.DepositStatus.PENDING) {
            throw new BadRequestException("Lịch hẹn không ở trạng thái chờ thanh toán cọc");
        }

        // Check expired
        if (booking.getDepositExpiresAt() != null
                && LocalDateTime.now().isAfter(booking.getDepositExpiresAt())) {
            throw new BadRequestException("Đã hết thời hạn thanh toán cọc");
        }

        // Simulate delay
        try {
            Thread.sleep(2000);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        String transId = "MOMO_" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        // Update transaction
        BookingTransaction transaction = transactionRepository
                .findFirstByBookingIdAndStatusOrderByCreatedAtDesc(bookingId, BookingTransaction.TransactionStatus.PENDING)
                .orElse(null);

        if (transaction != null) {
            transaction.setStatus(BookingTransaction.TransactionStatus.SUCCESS);
            transaction.setTransId(transId);
            transaction.setResultCode(0);
            transaction.setMessage("Mock payment success");
            transaction.setUpdatedAt(LocalDateTime.now());
            transactionRepository.save(transaction);
        }

        // Update booking
        booking.setDepositStatus(Booking.DepositStatus.PAID);
        booking.setMomoTransactionId(transId);
        booking.setDepositPaidAt(LocalDateTime.now());
        booking.setStatus(Booking.BookingStatus.CONFIRMED);
        booking.setConfirmedAt(LocalDateTime.now());
        bookingRepository.save(booking);

        log.info("Mock deposit payment confirmed for booking {}. transId={}",
                booking.getBookingCode(), transId);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("success", true);
        result.put("message", "Đặt cọc thành công! Lịch hẹn đã được xác nhận.");
        result.put("transactionId", transId);
        result.put("bookingId", booking.getId());
        result.put("bookingCode", booking.getBookingCode());
        result.put("depositAmount", booking.getDepositAmount());
        result.put("remainingAmount", booking.getRemainingAmount());
        result.put("totalPrice", booking.getPrice());
        result.put("depositStatus", booking.getDepositStatus().name());
        result.put("bookingStatus", booking.getStatus().name());
        return result;
    }

    // ======== Utility ========

    /**
     * Tạo yêu cầu thanh toán MoMo cho bất kỳ mục đích nào (order, deposit, ...).
     * Trả về payUrl để redirect/popup.
     */
    public Map<String, Object> createMoMoPaymentRequest(long amount, String momoOrderId, String orderInfo) {
        String requestId = UUID.randomUUID().toString();
        String extraData = "";

        String rawSignature = "accessKey=" + accessKey
                + "&amount=" + amount
                + "&extraData=" + extraData
                + "&ipnUrl=" + ipnUrl
                + "&orderId=" + momoOrderId
                + "&orderInfo=" + orderInfo
                + "&partnerCode=" + partnerCode
                + "&redirectUrl=" + redirectUrl
                + "&requestId=" + requestId
                + "&requestType=captureWallet";

        String signature = hmacSHA256(rawSignature, secretKey);

        Map<String, Object> requestBody = new LinkedHashMap<>();
        requestBody.put("partnerCode", partnerCode);
        requestBody.put("accessKey", accessKey);
        requestBody.put("requestId", requestId);
        requestBody.put("amount", amount);
        requestBody.put("orderId", momoOrderId);
        requestBody.put("orderInfo", orderInfo);
        requestBody.put("redirectUrl", redirectUrl);
        requestBody.put("ipnUrl", ipnUrl);
        requestBody.put("extraData", extraData);
        requestBody.put("requestType", "captureWallet");
        requestBody.put("signature", signature);
        requestBody.put("lang", "vi");

        try {
            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            ResponseEntity<Map> response = restTemplate.exchange(
                    apiUrl + "/create", HttpMethod.POST, entity, Map.class);

            Map<String, Object> body = response.getBody();
            log.info("MoMo create payment response: {}", body);

            if (body != null && Integer.valueOf(0).equals(body.get("resultCode"))) {
                Map<String, Object> result = new LinkedHashMap<>();
                result.put("success", true);
                result.put("payUrl", body.get("payUrl"));
                return result;
            } else {
                String msg = body != null ? String.valueOf(body.get("message")) : "Unknown error";
                throw new BadRequestException("MoMo error: " + msg);
            }
        } catch (BadRequestException e) {
            throw e;
        } catch (Exception e) {
            log.error("MoMo API error", e);
            throw new BadRequestException("Không thể kết nối MoMo. Vui lòng thử lại sau.");
        }
    }

    private String hmacSHA256(String data, String key) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKeySpec = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            mac.init(secretKeySpec);
            byte[] hash = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : hash) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (Exception e) {
            throw new RuntimeException("Error generating HMAC-SHA256", e);
        }
    }
}
