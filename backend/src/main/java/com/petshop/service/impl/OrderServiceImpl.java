package com.petshop.service.impl;

import com.petshop.dto.request.OrderRequest;
import com.petshop.dto.response.OrderDTO;
import com.petshop.dto.response.OrderItemDTO;
import com.petshop.entity.*;
import com.petshop.exception.BadRequestException;
import com.petshop.exception.ResourceNotFoundException;
import com.petshop.repository.*;
import com.petshop.security.UserPrincipal;
import com.petshop.service.CartService;
import com.petshop.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductVariantRepository productVariantRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final VoucherRepository voucherRepository;
    private final CartService cartService;

    private static final BigDecimal DEFAULT_SHIPPING_FEE = BigDecimal.valueOf(30000);

    @Override
    @Transactional
    public OrderDTO createOrder(OrderRequest request) {
        User user = getCurrentUser();
        
        // Xử lý items: ưu tiên items từ request, nếu không có thì lấy từ cart
        List<OrderItemData> orderItemsData = new ArrayList<>();
        
        if (request.getItems() != null && !request.getItems().isEmpty()) {
            // Sử dụng items từ request (local cart / guest checkout)
            for (OrderRequest.OrderItemInput item : request.getItems()) {
                ProductVariant variant;
                if (item.getVariantId() != null) {
                    variant = productVariantRepository.findById(item.getVariantId())
                        .orElseThrow(() -> new ResourceNotFoundException("Variant not found"));
                } else {
                    // Lấy variant mặc định của product
                    Product product = productRepository.findById(item.getProductId())
                        .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
                    variant = product.getVariants().stream()
                        .filter(ProductVariant::isActive)
                        .findFirst()
                        .orElseThrow(() -> new BadRequestException("Sản phẩm không có phiên bản khả dụng"));
                }
                orderItemsData.add(new OrderItemData(variant, item.getQuantity()));
            }
        } else {
            // Sử dụng cart items từ database
            List<CartItem> cartItems = cartItemRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
            if (cartItems.isEmpty()) {
                throw new BadRequestException("Giỏ hàng trống");
            }
            for (CartItem item : cartItems) {
                orderItemsData.add(new OrderItemData(item.getVariant(), item.getQuantity()));
            }
        }

        // Validate stock
        for (OrderItemData item : orderItemsData) {
            if (item.variant.getStock() < item.quantity) {
                throw new BadRequestException("Sản phẩm " + item.variant.getProduct().getName() +
                    " không đủ hàng");
            }
        }

        // Calculate amounts
        BigDecimal subtotal = orderItemsData.stream()
            .map(item -> item.variant.getPrice().multiply(BigDecimal.valueOf(item.quantity)))
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal shippingFee = DEFAULT_SHIPPING_FEE;
        BigDecimal discountAmount = BigDecimal.ZERO;
        Voucher voucher = null;

        if (request.getVoucherCode() != null && !request.getVoucherCode().isEmpty()) {
            voucher = voucherRepository.findByCode(request.getVoucherCode())
                .orElseThrow(() -> new BadRequestException("Voucher không tồn tại"));

            if (!voucher.isValid()) {
                throw new BadRequestException("Voucher không hợp lệ hoặc đã hết hạn");
            }

            if (subtotal.compareTo(voucher.getMinOrderAmount()) < 0) {
                throw new BadRequestException("Chưa đạt giá trị đơn hàng tối thiểu");
            }

            discountAmount = voucher.calculateDiscount(subtotal);
        }

        BigDecimal totalAmount = subtotal.add(shippingFee).subtract(discountAmount);

        // Create order
        Order order = Order.builder()
            .user(user)
            .orderCode(generateOrderCode())
            .status(Order.OrderStatus.PENDING)
            .paymentMethod(request.getPaymentMethod())
            .paymentStatus(Order.PaymentStatus.PENDING)
            .subtotal(subtotal)
            .shippingFee(shippingFee)
            .discountAmount(discountAmount)
            .totalAmount(totalAmount)
            .voucher(voucher)
            .receiverName(request.getReceiverName())
            .receiverPhone(request.getReceiverPhone())
            .shippingAddress(request.getShippingAddress())
            .note(request.getNote())
            .items(new ArrayList<>())
            .build();

        order = orderRepository.save(order);

        // Create order items and update stock
        for (OrderItemData itemData : orderItemsData) {
            ProductVariant variant = itemData.variant;

            OrderItem orderItem = OrderItem.builder()
                .order(order)
                .variant(variant)
                .productName(variant.getProduct().getName())
                .variantName(variant.getName())
                .productImage(variant.getProduct().getImages() != null && !variant.getProduct().getImages().isEmpty() ?
                    variant.getProduct().getImages().get(0).getImageUrl() : null)
                .unitPrice(variant.getPrice())
                .quantity(itemData.quantity)
                .subtotal(variant.getPrice().multiply(BigDecimal.valueOf(itemData.quantity)))
                .build();

            orderItemRepository.save(orderItem);
            order.getItems().add(orderItem);

            // Reduce stock
            variant.setStock(variant.getStock() - itemData.quantity);
            productVariantRepository.save(variant);

            // Update sold count
            Product product = variant.getProduct();
            product.setSoldCount(product.getSoldCount() + itemData.quantity);
            productRepository.save(product);
        }

        // Update voucher usage
        if (voucher != null) {
            voucher.setUsedCount(voucher.getUsedCount() + 1);
            voucherRepository.save(voucher);
        }

        // Clear cart only if using cart items (not items from request)
        if (request.getItems() == null || request.getItems().isEmpty()) {
            cartService.clearCart();
        }

        return mapToDTO(order);
    }
    
    // Helper class for order item data
    private static class OrderItemData {
        ProductVariant variant;
        int quantity;
        
        OrderItemData(ProductVariant variant, int quantity) {
            this.variant = variant;
            this.quantity = quantity;
        }
    }

    @Override
    public Page<OrderDTO> getMyOrders(Pageable pageable) {
        User user = getCurrentUser();
        return orderRepository.findByUserIdOrderByCreatedAtDesc(user.getId(), pageable)
            .map(this::mapToDTO);
    }

    @Override
    public OrderDTO getOrderById(Long id) {
        User user = getCurrentUser();
        Order order = orderRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Đơn hàng không tồn tại"));

        // Check permission
        if (!order.getUser().getId().equals(user.getId()) &&
            user.getRole() == User.Role.CUSTOMER) {
            throw new BadRequestException("Không có quyền truy cập");
        }

        return mapToDTO(order);
    }

    @Override
    public OrderDTO getOrderByCode(String orderCode) {
        Order order = orderRepository.findByOrderCode(orderCode)
            .orElseThrow(() -> new ResourceNotFoundException("Đơn hàng không tồn tại"));
        return mapToDTO(order);
    }

    @Override
    @Transactional
    public OrderDTO cancelOrder(Long id, String reason) {
        User user = getCurrentUser();
        Order order = orderRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Đơn hàng không tồn tại"));

        if (!order.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("Không có quyền truy cập");
        }

        if (order.getStatus() != Order.OrderStatus.PENDING) {
            throw new BadRequestException("Chỉ có thể hủy đơn hàng đang chờ xử lý");
        }

        order.setStatus(Order.OrderStatus.CANCELLED);
        order.setCancelReason(reason);
        order.setCancelledAt(LocalDateTime.now());

        // Restore stock
        restoreStock(order);

        order = orderRepository.save(order);
        return mapToDTO(order);
    }

    // === Admin/Staff Methods ===

    @Override
    public Page<OrderDTO> getAllOrders(Pageable pageable) {
        return orderRepository.findAll(pageable).map(this::mapToDTO);
    }

    @Override
    public Page<OrderDTO> getOrdersByStatus(Order.OrderStatus status, Pageable pageable) {
        return orderRepository.findByStatusOrderByCreatedAtDesc(status, pageable)
            .map(this::mapToDTO);
    }

    @Override
    @Transactional
    public OrderDTO confirmOrder(Long id) {
        Order order = getOrderEntity(id);
        validateStatusTransition(order.getStatus(), Order.OrderStatus.CONFIRMED);
        order.setStatus(Order.OrderStatus.CONFIRMED);
        order.setConfirmedAt(LocalDateTime.now());
        order = orderRepository.save(order);
        return mapToDTO(order);
    }

    @Override
    @Transactional
    public OrderDTO processOrder(Long id) {
        Order order = getOrderEntity(id);
        validateStatusTransition(order.getStatus(), Order.OrderStatus.PROCESSING);
        order.setStatus(Order.OrderStatus.PROCESSING);
        order.setProcessingAt(LocalDateTime.now());
        order = orderRepository.save(order);
        return mapToDTO(order);
    }

    @Override
    @Transactional
    public OrderDTO shipOrder(Long id, String trackingNumber) {
        Order order = getOrderEntity(id);
        validateStatusTransition(order.getStatus(), Order.OrderStatus.SHIPPING);
        order.setStatus(Order.OrderStatus.SHIPPING);
        order.setTrackingNumber(trackingNumber);
        order.setShippedAt(LocalDateTime.now());
        order = orderRepository.save(order);
        return mapToDTO(order);
    }

    @Override
    @Transactional
    public OrderDTO deliverOrder(Long id) {
        Order order = getOrderEntity(id);
        validateStatusTransition(order.getStatus(), Order.OrderStatus.DELIVERED);
        order.setStatus(Order.OrderStatus.DELIVERED);
        order.setDeliveredAt(LocalDateTime.now());
        order = orderRepository.save(order);
        return mapToDTO(order);
    }

    @Override
    @Transactional
    public OrderDTO completeOrder(Long id) {
        Order order = getOrderEntity(id);
        validateStatusTransition(order.getStatus(), Order.OrderStatus.COMPLETED);
        order.setStatus(Order.OrderStatus.COMPLETED);
        order.setCompletedAt(LocalDateTime.now());
        
        // Auto mark as paid if COD
        if (order.getPaymentMethod() == Order.PaymentMethod.COD && 
            order.getPaymentStatus() != Order.PaymentStatus.PAID) {
            order.setPaymentStatus(Order.PaymentStatus.PAID);
            order.setPaidAt(LocalDateTime.now());
        }
        
        order = orderRepository.save(order);
        return mapToDTO(order);
    }

    @Override
    @Transactional
    public OrderDTO adminCancelOrder(Long id, String reason) {
        Order order = getOrderEntity(id);

        if (order.getStatus() == Order.OrderStatus.DELIVERED ||
            order.getStatus() == Order.OrderStatus.COMPLETED ||
            order.getStatus() == Order.OrderStatus.CANCELLED) {
            throw new BadRequestException("Không thể hủy đơn hàng này");
        }

        order.setStatus(Order.OrderStatus.CANCELLED);
        order.setCancelReason(reason);
        order.setCancelledAt(LocalDateTime.now());

        // Restore stock
        restoreStock(order);

        order = orderRepository.save(order);
        return mapToDTO(order);
    }

    @Override
    @Transactional
    public OrderDTO updatePaymentStatus(Long id, Order.PaymentStatus paymentStatus, String transactionId) {
        Order order = getOrderEntity(id);
        order.setPaymentStatus(paymentStatus);
        
        if (transactionId != null && !transactionId.isEmpty()) {
            order.setTransactionId(transactionId);
        }
        
        if (paymentStatus == Order.PaymentStatus.PAID) {
            order.setPaidAt(LocalDateTime.now());
        }
        
        order = orderRepository.save(order);
        return mapToDTO(order);
    }

    private Order getOrderEntity(Long id) {
        return orderRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Đơn hàng không tồn tại"));
    }

    private void validateStatusTransition(Order.OrderStatus current, Order.OrderStatus next) {
        boolean valid = switch (current) {
            case PENDING -> next == Order.OrderStatus.CONFIRMED || next == Order.OrderStatus.CANCELLED;
            case CONFIRMED -> next == Order.OrderStatus.PROCESSING || next == Order.OrderStatus.CANCELLED;
            case PROCESSING -> next == Order.OrderStatus.SHIPPING || next == Order.OrderStatus.CANCELLED;
            case SHIPPING -> next == Order.OrderStatus.DELIVERED;
            case DELIVERED -> next == Order.OrderStatus.COMPLETED;
            default -> false;
        };

        if (!valid) {
            throw new BadRequestException("Không thể chuyển trạng thái từ " + current + " sang " + next);
        }
    }

    private void restoreStock(Order order) {
        for (OrderItem item : order.getItems()) {
            ProductVariant variant = item.getVariant();
            variant.setStock(variant.getStock() + item.getQuantity());
            productVariantRepository.save(variant);
            
            // Reduce sold count
            Product product = variant.getProduct();
            product.setSoldCount(Math.max(0, product.getSoldCount() - item.getQuantity()));
            productRepository.save(product);
        }
    }

    private String generateOrderCode() {
        return "ORD" + System.currentTimeMillis() +
            UUID.randomUUID().toString().substring(0, 4).toUpperCase();
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new BadRequestException("Chưa đăng nhập");
        }

        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        return userRepository.findById(userPrincipal.getId())
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private OrderDTO mapToDTO(Order order) {
        List<OrderItemDTO> itemDTOs = order.getItems().stream()
            .map(item -> OrderItemDTO.builder()
                .id(item.getId())
                .variantId(item.getVariant() != null ? item.getVariant().getId() : null)
                .productName(item.getProductName())
                .variantName(item.getVariantName())
                .productImage(item.getProductImage())
                .unitPrice(item.getUnitPrice())
                .quantity(item.getQuantity())
                .subtotal(item.getSubtotal())
                .reviewed(item.getReviewed())
                .build())
            .collect(Collectors.toList());

        return OrderDTO.builder()
            .id(order.getId())
            .orderCode(order.getOrderCode())
            .userId(order.getUser().getId())
            .userName(order.getUser().getFullName())
            .userEmail(order.getUser().getEmail())
            .userPhone(order.getUser().getPhone())
            .receiverName(order.getReceiverName())
            .receiverPhone(order.getReceiverPhone())
            .shippingAddress(order.getShippingAddress())
            .note(order.getNote())
            .trackingNumber(order.getTrackingNumber())
            .items(itemDTOs)
            .totalItems(order.getTotalItems())
            .subtotal(order.getSubtotal())
            .shippingFee(order.getShippingFee())
            .discountAmount(order.getDiscountAmount())
            .voucherCode(order.getVoucher() != null ? order.getVoucher().getCode() : null)
            .totalAmount(order.getTotalAmount())
            .paymentMethod(order.getPaymentMethod())
            .paymentStatus(order.getPaymentStatus())
            .transactionId(order.getTransactionId())
            .paidAt(order.getPaidAt())
            .status(order.getStatus())
            .cancelReason(order.getCancelReason())
            .confirmedAt(order.getConfirmedAt())
            .processingAt(order.getProcessingAt())
            .shippedAt(order.getShippedAt())
            .deliveredAt(order.getDeliveredAt())
            .completedAt(order.getCompletedAt())
            .cancelledAt(order.getCancelledAt())
            .createdAt(order.getCreatedAt())
            .build();
    }
}
