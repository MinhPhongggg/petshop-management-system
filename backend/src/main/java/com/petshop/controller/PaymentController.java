package com.petshop.controller;

import com.petshop.dto.response.OrderDTO;
import com.petshop.entity.Order;
import com.petshop.exception.BadRequestException;
import com.petshop.exception.ResourceNotFoundException;
import com.petshop.repository.OrderRepository;
import com.petshop.security.UserPrincipal;
import com.petshop.service.OrderService;
import com.petshop.service.impl.MoMoServiceImpl;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final OrderRepository orderRepository;
    private final OrderService orderService;
    private final MoMoServiceImpl moMoServiceImpl;

    /**
     * Tạo thanh toán MoMo thật cho đơn hàng → trả về payUrl.
     * POST /api/payments/momo/order/{orderId}/create
     */
    @PostMapping("/momo/order/{orderId}/create")
    public ResponseEntity<Map<String, Object>> createMomoOrderPayment(@PathVariable Long orderId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        UserPrincipal principal = (UserPrincipal) auth.getPrincipal();

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn hàng"));

        if (!order.getUser().getId().equals(principal.getId())) {
            throw new BadRequestException("Đơn hàng không thuộc về bạn");
        }
        if (order.getPaymentMethod() != Order.PaymentMethod.MOMO) {
            throw new BadRequestException("Đơn hàng không sử dụng phương thức thanh toán MoMo");
        }
        if (order.getPaymentStatus() != Order.PaymentStatus.PENDING) {
            throw new BadRequestException("Đơn hàng đã được thanh toán");
        }

        long amount = order.getTotalAmount().longValue();
        String momoOrderId = "ORD" + order.getId() + "_" + System.currentTimeMillis();
        String orderInfo = "Thanh toan don hang " + order.getOrderCode();

        Map<String, Object> momoResult = moMoServiceImpl.createMoMoPaymentRequest(amount, momoOrderId, orderInfo);
        momoResult.put("orderId", order.getId());
        momoResult.put("orderCode", order.getOrderCode());
        momoResult.put("amount", order.getTotalAmount());

        return ResponseEntity.ok(momoResult);
    }

    /**
     * Mock MoMo Payment - Giả lập thanh toán MoMo
     * Flow:
     * 1. Frontend gửi orderId lên
     * 2. Backend validate đơn hàng
     * 3. Giả lập độ trễ mạng (~2s)
     * 4. Tự động cập nhật trạng thái thanh toán -> PAID
     * 5. Trả về kết quả thành công
     */
    @PostMapping("/momo/{orderId}")
    public ResponseEntity<Map<String, Object>> mockMomoPayment(@PathVariable Long orderId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        UserPrincipal principal = (UserPrincipal) auth.getPrincipal();

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn hàng"));

        // Validate order belongs to current user
        if (!order.getUser().getId().equals(principal.getId())) {
            throw new BadRequestException("Đơn hàng không thuộc về bạn");
        }

        // Validate order payment method is MOMO
        if (order.getPaymentMethod() != Order.PaymentMethod.MOMO) {
            throw new BadRequestException("Đơn hàng không sử dụng phương thức thanh toán MoMo");
        }

        // Validate payment status is PENDING
        if (order.getPaymentStatus() != Order.PaymentStatus.PENDING) {
            throw new BadRequestException("Đơn hàng đã được thanh toán hoặc đã bị hủy");
        }

        // Giả lập độ trễ mạng (2 giây)
        try {
            Thread.sleep(2000);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        // Tạo mã giao dịch giả
        String transactionId = "MOMO_" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        // Cập nhật trạng thái thanh toán -> PAID
        orderService.updatePaymentStatus(orderId, Order.PaymentStatus.PAID, transactionId);

        // Mock: Tự động hoàn thành đơn hàng để cộng điểm tích lũy
        // (Giả lập luồng: PENDING -> CONFIRMED -> PROCESSING -> SHIPPING -> DELIVERED -> COMPLETED)
        try {
            orderService.confirmOrder(orderId);
            orderService.processOrder(orderId);
            orderService.shipOrder(orderId, "MOMO_SHIP_" + transactionId);
            orderService.deliverOrder(orderId);
            orderService.completeOrder(orderId);
            log.info("Mock MoMo: Auto-completed order {} for reward points", order.getOrderCode());
        } catch (Exception e) {
            log.warn("Mock MoMo: Could not auto-complete order {}: {}", order.getOrderCode(), e.getMessage());
        }

        // Reload order after completion
        OrderDTO updatedOrder = orderService.getOrderById(orderId);

        log.info("Mock MoMo payment successful for order {} - transactionId: {}", order.getOrderCode(), transactionId);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Thanh toán MoMo thành công!",
                "transactionId", transactionId,
                "orderCode", order.getOrderCode(),
                "order", updatedOrder
        ));
    }
}
