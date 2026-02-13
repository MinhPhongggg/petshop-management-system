package com.petshop.controller;

import com.petshop.dto.request.OrderRequest;
import com.petshop.dto.response.OrderDTO;
import com.petshop.entity.Order;
import com.petshop.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {
    
    private final OrderService orderService;
    
    // === Customer endpoints ===
    
    @PostMapping
    public ResponseEntity<OrderDTO> createOrder(@Valid @RequestBody OrderRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(orderService.createOrder(request));
    }
    
    @GetMapping("/my-orders")
    public ResponseEntity<Page<OrderDTO>> getMyOrders(
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(orderService.getMyOrders(pageable));
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<OrderDTO> getOrderById(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.getOrderById(id));
    }
    
    @GetMapping("/code/{orderCode}")
    public ResponseEntity<OrderDTO> getOrderByCode(@PathVariable String orderCode) {
        return ResponseEntity.ok(orderService.getOrderByCode(orderCode));
    }
    
    @PostMapping("/{id}/cancel")
    public ResponseEntity<OrderDTO> cancelOrder(@PathVariable Long id, 
                                                 @RequestParam(required = false) String reason) {
        return ResponseEntity.ok(orderService.cancelOrder(id, reason));
    }
    
    // === Admin/Staff endpoints ===
    
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<Page<OrderDTO>> getAllOrders(
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(orderService.getAllOrders(pageable));
    }
    
    @GetMapping("/status/{status}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<Page<OrderDTO>> getOrdersByStatus(
            @PathVariable String status,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(orderService.getOrdersByStatus(
            Order.OrderStatus.valueOf(status.toUpperCase()), pageable));
    }
    
    @PostMapping("/{id}/confirm")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<OrderDTO> confirmOrder(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.confirmOrder(id));
    }
    
    @PostMapping("/{id}/process")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<OrderDTO> processOrder(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.processOrder(id));
    }
    
    @PostMapping("/{id}/ship")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<OrderDTO> shipOrder(@PathVariable Long id, 
                                               @RequestParam(required = false) String trackingNumber) {
        return ResponseEntity.ok(orderService.shipOrder(id, trackingNumber));
    }
    
    @PostMapping("/{id}/deliver")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<OrderDTO> deliverOrder(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.deliverOrder(id));
    }
    
    @PostMapping("/{id}/complete")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<OrderDTO> completeOrder(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.completeOrder(id));
    }
    
    @PostMapping("/{id}/admin-cancel")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<OrderDTO> adminCancelOrder(@PathVariable Long id, 
                                                      @RequestParam String reason) {
        return ResponseEntity.ok(orderService.adminCancelOrder(id, reason));
    }
    
    @PostMapping("/{id}/payment-status")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<OrderDTO> updatePaymentStatus(@PathVariable Long id, 
                                                         @RequestParam String status,
                                                         @RequestParam(required = false) String transactionId) {
        return ResponseEntity.ok(orderService.updatePaymentStatus(id, 
            Order.PaymentStatus.valueOf(status.toUpperCase()), transactionId));
    }
}
