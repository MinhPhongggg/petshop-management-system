package com.petshop.service.impl;

import com.petshop.dto.response.AnalyticsDTO;
import com.petshop.repository.*;
import com.petshop.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalyticsServiceImpl implements AnalyticsService {

    private final BookingRepository bookingRepository;
    private final PetRepository petRepository;
    private final ProductRepository productRepository;
    private final ProductVariantRepository productVariantRepository;
    private final OrderRepository orderRepository;

    private static final int MAX_SLOTS_PER_HOUR = 3; // Tối đa 3 booking/giờ
    private static final int MAX_SLOTS_PER_DAY = 30;  // Tối đa 30 booking/ngày

    @Override
    public AnalyticsDTO getFullAnalytics() {
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusDays(30);
        return getFullAnalytics(startDate, endDate);
    }

    @Override
    public AnalyticsDTO getFullAnalytics(LocalDate startDate, LocalDate endDate) {
        return AnalyticsDTO.builder()
                .serviceAnalytics(getServiceAnalytics(startDate, endDate))
                .retailInventoryAnalytics(getRetailInventoryAnalytics())
                .petProfileAnalytics(getPetProfileAnalytics())
                .build();
    }

    // ============================================================
    // 1. THỐNG KÊ THEO LOẠI HÌNH DỊCH VỤ
    // ============================================================
    @Override
    public AnalyticsDTO.ServiceAnalytics getServiceAnalytics(LocalDate startDate, LocalDate endDate) {
        // Tỷ lệ lấp đầy theo giờ
        List<Object[]> hourlyData = bookingRepository.countBookingsByHour(startDate, endDate);
        long totalDays = ChronoUnit.DAYS.between(startDate, endDate) + 1;
        
        List<AnalyticsDTO.HourlyBookingRate> hourlyRates = new ArrayList<>();
        // Khởi tạo tất cả giờ từ 8h - 20h
        Map<Integer, Long> hourMap = new HashMap<>();
        for (Object[] row : hourlyData) {
            int hour = ((Number) row[0]).intValue();
            long count = ((Number) row[1]).longValue();
            hourMap.put(hour, count);
        }
        for (int h = 8; h <= 20; h++) {
            long count = hourMap.getOrDefault(h, 0L);
            double maxForPeriod = MAX_SLOTS_PER_HOUR * totalDays;
            double fillRate = maxForPeriod > 0 ? (count / maxForPeriod) * 100 : 0;
            hourlyRates.add(AnalyticsDTO.HourlyBookingRate.builder()
                    .hour(h)
                    .bookingCount(count)
                    .fillRate(Math.round(fillRate * 10.0) / 10.0)
                    .build());
        }

        // Tỷ lệ lấp đầy theo ngày (7 ngày gần nhất)
        LocalDate dailyStart = endDate.minusDays(6);
        List<Object[]> dailyData = bookingRepository.countBookingsByDay(dailyStart, endDate);
        Map<String, Long> dayMap = new HashMap<>();
        for (Object[] row : dailyData) {
            dayMap.put(row[0].toString(), ((Number) row[1]).longValue());
        }
        List<AnalyticsDTO.DailyBookingRate> dailyRates = new ArrayList<>();
        for (LocalDate d = dailyStart; !d.isAfter(endDate); d = d.plusDays(1)) {
            String dateStr = d.format(DateTimeFormatter.ISO_LOCAL_DATE);
            long count = dayMap.getOrDefault(dateStr, 0L);
            double fillRate = ((double) count / MAX_SLOTS_PER_DAY) * 100;
            dailyRates.add(AnalyticsDTO.DailyBookingRate.builder()
                    .date(dateStr)
                    .bookingCount(count)
                    .maxSlots((long) MAX_SLOTS_PER_DAY)
                    .fillRate(Math.round(fillRate * 10.0) / 10.0)
                    .build());
        }

        // Hiệu suất nhân viên (Groomer Performance)
        List<Object[]> groomerData = bookingRepository.getGroomerPerformance(startDate, endDate);
        // Lấy rating trung bình cho từng staff
        Map<Long, Double> staffRatings = new HashMap<>();
        try {
            List<Object[]> ratingData = bookingRepository.getStaffAverageRatings();
            for (Object[] row : ratingData) {
                if (row[0] != null) {
                    staffRatings.put(((Number) row[0]).longValue(), ((Number) row[1]).doubleValue());
                }
            }
        } catch (Exception ignored) {}

        List<AnalyticsDTO.GroomerPerformance> groomerPerformances = groomerData.stream()
                .map(row -> {
                    Long staffId = ((Number) row[0]).longValue();
                    return AnalyticsDTO.GroomerPerformance.builder()
                            .staffId(staffId)
                            .staffName((String) row[1])
                            .totalBookings(((Number) row[2]).longValue())
                            .completedBookings(((Number) row[3]).longValue())
                            .totalRevenue(new BigDecimal(row[4].toString()))
                            .averageRating(staffRatings.getOrDefault(staffId, 0.0))
                            .build();
                })
                .collect(Collectors.toList());

        // Dịch vụ phổ biến nhất
        List<Object[]> serviceData = bookingRepository.getPopularServices(startDate, endDate);
        BigDecimal totalServiceRevenue = serviceData.stream()
                .map(row -> new BigDecimal(row[3].toString()))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<AnalyticsDTO.PopularService> popularServices = serviceData.stream()
                .map(row -> {
                    BigDecimal revenue = new BigDecimal(row[3].toString());
                    double pct = totalServiceRevenue.compareTo(BigDecimal.ZERO) > 0
                            ? revenue.divide(totalServiceRevenue, 4, RoundingMode.HALF_UP)
                                    .multiply(BigDecimal.valueOf(100))
                                    .setScale(1, RoundingMode.HALF_UP).doubleValue()
                            : 0.0;
                    return AnalyticsDTO.PopularService.builder()
                            .serviceId(((Number) row[0]).longValue())
                            .serviceName((String) row[1])
                            .bookingCount(((Number) row[2]).longValue())
                            .totalRevenue(revenue)
                            .percentage(pct)
                            .build();
                })
                .collect(Collectors.toList());

        // Tổng quan
        Long totalBookings = bookingRepository.count();
        Long completedBookings = bookingRepository.countCompleted();
        Long cancelledBookings = bookingRepository.countCancelled();
        double completionRate = totalBookings > 0
                ? ((double) completedBookings / totalBookings) * 100 : 0;

        return AnalyticsDTO.ServiceAnalytics.builder()
                .hourlyBookingRates(hourlyRates)
                .dailyBookingRates(dailyRates)
                .groomerPerformances(groomerPerformances)
                .popularServices(popularServices)
                .totalBookings(totalBookings)
                .completedBookings(completedBookings)
                .cancelledBookings(cancelledBookings)
                .completionRate(Math.round(completionRate * 10.0) / 10.0)
                .build();
    }

    // ============================================================
    // 2. THỐNG KÊ BÁN LẺ & KHO HÀNG
    // ============================================================
    @Override
    public AnalyticsDTO.RetailInventoryAnalytics getRetailInventoryAnalytics() {
        // Cảnh báo hết hàng
        List<AnalyticsDTO.LowStockAlert> alerts = productVariantRepository.findLowStock(10)
                .stream()
                .map(v -> {
                    String urgency;
                    if (v.getStock() <= 2) urgency = "CRITICAL";
                    else if (v.getStock() <= 5) urgency = "WARNING";
                    else urgency = "LOW";

                    return AnalyticsDTO.LowStockAlert.builder()
                            .variantId(v.getId())
                            .productName(v.getProduct().getName())
                            .variantName(v.getName())
                            .sku(v.getSku())
                            .currentStock(v.getStock())
                            .threshold(10)
                            .urgency(urgency)
                            .build();
                })
                .collect(Collectors.toList());

        // Thêm sản phẩm hết hàng (stock = 0)
        List<AnalyticsDTO.LowStockAlert> outOfStockAlerts = productVariantRepository.findOutOfStock()
                .stream()
                .map(v -> AnalyticsDTO.LowStockAlert.builder()
                        .variantId(v.getId())
                        .productName(v.getProduct().getName())
                        .variantName(v.getName())
                        .sku(v.getSku())
                        .currentStock(0)
                        .threshold(10)
                        .urgency("CRITICAL")
                        .build())
                .collect(Collectors.toList());
        
        List<AnalyticsDTO.LowStockAlert> allAlerts = new ArrayList<>(outOfStockAlerts);
        allAlerts.addAll(alerts);

        long lowStockCount = productVariantRepository.countLowStock(10);
        long outOfStockCount = productVariantRepository.countOutOfStock();

        // Tốc độ bán hàng (Sales Velocity)
        List<Object[]> velocityData = productRepository.getSalesVelocity();
        List<AnalyticsDTO.SalesVelocity> salesVelocities = velocityData.stream()
                .map(row -> {
                    int soldCount = ((Number) row[4]).intValue();
                    double dailyAvg = soldCount / 30.0; // Trung bình 30 ngày
                    return AnalyticsDTO.SalesVelocity.builder()
                            .productId(((Number) row[0]).longValue())
                            .productName((String) row[1])
                            .productImage(row[2] != null ? (String) row[2] : null)
                            .categoryName(row[3] != null ? (String) row[3] : "Chưa phân loại")
                            .soldCount(soldCount)
                            .revenue(new BigDecimal(row[5].toString()))
                            .dailyAvgSales(Math.round(dailyAvg * 100.0) / 100.0)
                            .build();
                })
                .collect(Collectors.toList());

        // Tổng giá trị tồn kho
        BigDecimal totalInventoryValue = productRepository.getTotalInventoryValue();
        if (totalInventoryValue == null) totalInventoryValue = BigDecimal.ZERO;

        long totalVariants = productVariantRepository.count();

        return AnalyticsDTO.RetailInventoryAnalytics.builder()
                .lowStockAlerts(allAlerts)
                .lowStockCount(lowStockCount)
                .outOfStockCount(outOfStockCount)
                .salesVelocities(salesVelocities)
                .totalInventoryValue(totalInventoryValue)
                .totalVariants(totalVariants)
                .build();
    }

    // ============================================================
    // 3. THỐNG KÊ KHÁCH HÀNG ĐẶC BIỆT (PET PROFILES)
    // ============================================================
    @Override
    public AnalyticsDTO.PetProfileAnalytics getPetProfileAnalytics() {
        // Phân loại giống loài
        List<Object[]> typeData = petRepository.countByPetType();
        Long totalPets = petRepository.countAllPets();
        
        List<AnalyticsDTO.PetTypeDistribution> petTypeDistribution = typeData.stream()
                .map(row -> {
                    long count = ((Number) row[1]).longValue();
                    double pct = totalPets > 0 ? ((double) count / totalPets) * 100 : 0;
                    return AnalyticsDTO.PetTypeDistribution.builder()
                    .petType(row[0] != null ? row[0].toString() : "UNKNOWN")
                            .count(count)
                            .percentage(Math.round(pct * 10.0) / 10.0)
                            .build();
                })
                .collect(Collectors.toList());

        // Chu kỳ chăm sóc (Customer Retention)
        List<Object[]> retentionData = bookingRepository.getCustomerRetentionData();
        List<AnalyticsDTO.CustomerRetention> customerRetentions = new ArrayList<>();
        double totalAvgDays = 0;
        int retentionCount = 0;

        for (Object[] row : retentionData) {
            long totalVisits = ((Number) row[4]).longValue();
            String visitDatesStr = (String) row[5];
            
            // Tính khoảng cách trung bình giữa các lần ghé thăm
            double avgDays = calculateAverageDaysBetweenVisits(visitDatesStr);
            String lastVisit = getLastVisitDate(visitDatesStr);
            
            if (avgDays > 0) {
                totalAvgDays += avgDays;
                retentionCount++;
            }

            customerRetentions.add(AnalyticsDTO.CustomerRetention.builder()
                    .customerId(((Number) row[0]).longValue())
                    .customerName((String) row[1])
                    .petName((String) row[2])
                    .petType(row[3] != null ? row[3].toString() : "UNKNOWN")
                    .totalVisits(totalVisits)
                    .avgDaysBetweenVisits(Math.round(avgDays * 10.0) / 10.0)
                    .lastVisitDate(lastVisit)
                    .build());
        }

        double averageReturnDays = retentionCount > 0 ? totalAvgDays / retentionCount : 0;

        // Khách hàng VIP - tổng chi tiêu dịch vụ theo pet
        List<Object[]> vipData = bookingRepository.getVipPetServiceSpending();
        
        // Lấy tổng chi tiêu sản phẩm theo user
        Map<Long, BigDecimal> userProductSpending = new HashMap<>();
        try {
            List<Object[]> productSpendingData = orderRepository.getUserProductSpending();
            for (Object[] row : productSpendingData) {
                userProductSpending.put(
                        ((Number) row[0]).longValue(),
                        new BigDecimal(row[1].toString())
                );
            }
        } catch (Exception ignored) {}

        List<AnalyticsDTO.VipPet> vipPets = vipData.stream()
                .map(row -> {
                    BigDecimal serviceSpending = new BigDecimal(row[6].toString());
                    // Tìm product spending của owner (pet -> owner -> orders)
                    BigDecimal productSpending = BigDecimal.ZERO; // Sẽ được tính qua owner
                    BigDecimal totalSpending = serviceSpending.add(productSpending);

                    return AnalyticsDTO.VipPet.builder()
                            .petId(((Number) row[0]).longValue())
                            .petName((String) row[1])
                            .petType(row[2] != null ? row[2].toString() : "UNKNOWN")
                            .breed(row[3] != null ? (String) row[3] : "Không rõ")
                            .ownerName((String) row[4])
                            .totalBookings(((Number) row[5]).longValue())
                            .totalServiceSpending(serviceSpending)
                            .totalProductSpending(productSpending)
                            .totalSpending(totalSpending)
                            .build();
                })
                .collect(Collectors.toList());

        return AnalyticsDTO.PetProfileAnalytics.builder()
                .petTypeDistribution(petTypeDistribution)
                .totalPets(totalPets != null ? totalPets : 0L)
                .customerRetentions(customerRetentions)
                .averageReturnDays(Math.round(averageReturnDays * 10.0) / 10.0)
                .vipPets(vipPets)
                .build();
    }

    // ============================================================
    // HELPER METHODS
    // ============================================================

    private double calculateAverageDaysBetweenVisits(String visitDatesStr) {
        if (visitDatesStr == null || visitDatesStr.isEmpty()) return 0;
        String[] dates = visitDatesStr.split(",");
        if (dates.length < 2) return 0;

        long totalDaysBetween = 0;
        int gaps = 0;
        for (int i = 1; i < dates.length; i++) {
            try {
                LocalDate prev = LocalDate.parse(dates[i - 1].trim());
                LocalDate curr = LocalDate.parse(dates[i].trim());
                long days = ChronoUnit.DAYS.between(prev, curr);
                if (days > 0) {
                    totalDaysBetween += days;
                    gaps++;
                }
            } catch (Exception ignored) {}
        }
        return gaps > 0 ? (double) totalDaysBetween / gaps : 0;
    }

    private String getLastVisitDate(String visitDatesStr) {
        if (visitDatesStr == null || visitDatesStr.isEmpty()) return null;
        String[] dates = visitDatesStr.split(",");
        return dates[dates.length - 1].trim();
    }
}
