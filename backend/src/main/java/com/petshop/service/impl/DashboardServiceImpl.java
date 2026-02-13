package com.petshop.service.impl;

import com.petshop.dto.response.DashboardDTO;
import com.petshop.entity.Booking;
import com.petshop.entity.Order;
import com.petshop.repository.*;
import com.petshop.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {
    
    private final OrderRepository orderRepository;
    private final BookingRepository bookingRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final ProductVariantRepository productVariantRepository;
    
    @Override
    public DashboardDTO getDashboard() {
        LocalDate today = LocalDate.now();
        LocalDate firstDayOfMonth = today.withDayOfMonth(1);
        return getDashboard(firstDayOfMonth, today);
    }
    
    @Override
    public DashboardDTO getDashboard(LocalDate startDate, LocalDate endDate) {
        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.atTime(23, 59, 59);
        
        // Calculate previous period for growth comparison
        long periodDays = java.time.temporal.ChronoUnit.DAYS.between(startDate, endDate) + 1;
        LocalDateTime prevStartDateTime = startDate.minusDays(periodDays).atStartOfDay();
        LocalDateTime prevEndDateTime = startDate.minusDays(1).atTime(23, 59, 59);
        
        // Revenue from orders
        BigDecimal totalOrderRevenue = orderRepository.getTotalRevenue(startDateTime, endDateTime);
        if (totalOrderRevenue == null) totalOrderRevenue = BigDecimal.ZERO;
        
        BigDecimal prevOrderRevenue = orderRepository.getTotalRevenue(prevStartDateTime, prevEndDateTime);
        if (prevOrderRevenue == null) prevOrderRevenue = BigDecimal.ZERO;
        
        // Revenue from bookings
        BigDecimal totalBookingRevenue = bookingRepository.getTotalRevenue(startDateTime, endDateTime);
        if (totalBookingRevenue == null) totalBookingRevenue = BigDecimal.ZERO;
        
        BigDecimal prevBookingRevenue = bookingRepository.getTotalRevenue(prevStartDateTime, prevEndDateTime);
        if (prevBookingRevenue == null) prevBookingRevenue = BigDecimal.ZERO;
        
        // Total revenue
        BigDecimal totalRevenue = totalOrderRevenue.add(totalBookingRevenue);
        BigDecimal prevTotalRevenue = prevOrderRevenue.add(prevBookingRevenue);
        
        // Order stats
        long totalOrders = orderRepository.countByCreatedAtBetween(startDateTime, endDateTime);
        long prevTotalOrders = orderRepository.countByCreatedAtBetween(prevStartDateTime, prevEndDateTime);
        long pendingOrders = orderRepository.countByStatusAndCreatedAtBetween(
            Order.OrderStatus.PENDING, startDateTime, endDateTime);
        long completedOrders = orderRepository.countByStatusAndCreatedAtBetween(
            Order.OrderStatus.COMPLETED, startDateTime, endDateTime);
        
        // Booking stats
        long totalBookings = bookingRepository.countByCreatedAtBetween(startDateTime, endDateTime);
        long prevTotalBookings = bookingRepository.countByCreatedAtBetween(prevStartDateTime, prevEndDateTime);
        long pendingBookings = bookingRepository.countByStatusAndCreatedAtBetween(
            Booking.BookingStatus.PENDING, startDateTime, endDateTime);
        
        // Product stats
        long totalProducts = productRepository.countByActiveIsTrue();
        
        // Customer stats
        long totalCustomers = userRepository.countCustomers();
        
        // Calculate growth percentages
        Double revenueGrowth = calculateGrowth(totalRevenue, prevTotalRevenue);
        Double orderGrowth = calculateGrowth(BigDecimal.valueOf(totalOrders), BigDecimal.valueOf(prevTotalOrders));
        Double bookingGrowth = calculateGrowth(BigDecimal.valueOf(totalBookings), BigDecimal.valueOf(prevTotalBookings));
        
        // Recent orders (last 5)
        List<DashboardDTO.RecentOrderDTO> recentOrders = orderRepository
            .findTop5ByOrderByCreatedAtDesc()
            .stream()
            .map(order -> DashboardDTO.RecentOrderDTO.builder()
                .id(order.getId())
                .orderNumber(order.getOrderCode())
                .customer(order.getUser().getFullName())
                .amount(order.getTotalAmount())
                .status(order.getStatus().name())
                .createdAt(order.getCreatedAt().format(DateTimeFormatter.ISO_LOCAL_DATE))
                .build())
            .collect(Collectors.toList());
        
        // Recent bookings (last 5)
        List<DashboardDTO.RecentBookingDTO> recentBookings = bookingRepository
            .findTop5ByOrderByCreatedAtDesc()
            .stream()
            .map(booking -> DashboardDTO.RecentBookingDTO.builder()
                .id(booking.getId())
                .bookingCode(booking.getBookingCode())
                .customer(booking.getUser().getFullName())
                .service(booking.getService().getName())
                .status(booking.getStatus().name())
                .bookingDate(booking.getBookingDate().format(DateTimeFormatter.ISO_LOCAL_DATE))
                .build())
            .collect(Collectors.toList());
        
        // Build response
        return DashboardDTO.builder()
            .totalRevenue(totalRevenue)
            .totalOrders(totalOrders)
            .totalProducts(totalProducts)
            .totalCustomers(totalCustomers)
            .totalUsers(totalCustomers)  // Alias for FE compatibility
            .totalBookings(totalBookings)
            .revenueGrowth(revenueGrowth)
            .orderGrowth(orderGrowth)
            .bookingGrowth(bookingGrowth)
            .pendingOrders(pendingOrders)
            .completedOrders(completedOrders)
            .pendingBookings(pendingBookings)
            .recentOrders(recentOrders)
            .recentBookings(recentBookings)
            .build();
    }
    
    private Double calculateGrowth(BigDecimal current, BigDecimal previous) {
        if (previous == null || previous.compareTo(BigDecimal.ZERO) == 0) {
            return current.compareTo(BigDecimal.ZERO) > 0 ? 100.0 : 0.0;
        }
        return current.subtract(previous)
            .divide(previous, 4, RoundingMode.HALF_UP)
            .multiply(BigDecimal.valueOf(100))
            .setScale(1, RoundingMode.HALF_UP)
            .doubleValue();
    }
}
