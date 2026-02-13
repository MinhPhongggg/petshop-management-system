package com.petshop.service;

import com.petshop.dto.request.OrderRequest;
import com.petshop.dto.response.OrderDTO;
import com.petshop.entity.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface OrderService {
    
    // === Customer ===
    OrderDTO createOrder(OrderRequest request);
    OrderDTO getOrderById(Long id);
    OrderDTO getOrderByCode(String orderCode);
    Page<OrderDTO> getMyOrders(Pageable pageable);
    OrderDTO cancelOrder(Long id, String reason);
    
    // === Admin/Staff ===
    Page<OrderDTO> getAllOrders(Pageable pageable);
    Page<OrderDTO> getOrdersByStatus(Order.OrderStatus status, Pageable pageable);
    
    // Cập nhật trạng thái đơn hàng
    OrderDTO confirmOrder(Long id);
    OrderDTO processOrder(Long id);
    OrderDTO shipOrder(Long id, String trackingNumber);
    OrderDTO deliverOrder(Long id);
    OrderDTO completeOrder(Long id);
    OrderDTO adminCancelOrder(Long id, String reason);
    
    // Cập nhật thanh toán
    OrderDTO updatePaymentStatus(Long id, Order.PaymentStatus status, String transactionId);
}
