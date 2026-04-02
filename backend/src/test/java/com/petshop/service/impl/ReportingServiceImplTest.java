package com.petshop.service.impl;

import com.petshop.dto.response.BusinessReportDTO;
import com.petshop.repository.OrderRepository;
import com.petshop.repository.ProductVariantRepository;
import com.petshop.repository.StockMovementRepository;
import com.petshop.repository.UserRewardRepository;
import com.petshop.repository.VoucherUsageLogRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageRequest;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ReportingServiceImplTest {

    @Mock
    private OrderRepository orderRepository;
    @Mock
    private StockMovementRepository stockMovementRepository;
    @Mock
    private ProductVariantRepository productVariantRepository;
    @Mock
    private VoucherUsageLogRepository voucherUsageLogRepository;
    @Mock
    private UserRewardRepository userRewardRepository;

    @InjectMocks
    private ReportingServiceImpl reportingService;

    @Test
    void shouldBuildRevenueProfitAndVoucherImpact() {
        when(orderRepository.getGrossRevenue(any(LocalDateTime.class), any(LocalDateTime.class)))
                .thenReturn(BigDecimal.valueOf(1_000_000));
        when(orderRepository.getTotalDiscount(any(LocalDateTime.class), any(LocalDateTime.class)))
                .thenReturn(BigDecimal.valueOf(100_000));
        when(orderRepository.getTotalRevenue(any(LocalDateTime.class), any(LocalDateTime.class)))
                .thenReturn(BigDecimal.valueOf(900_000));
        when(stockMovementRepository.getTotalCogs(any(LocalDateTime.class), any(LocalDateTime.class)))
                .thenReturn(BigDecimal.valueOf(600_000));
        when(productVariantRepository.findAll()).thenReturn(List.of());
        when(orderRepository.getTopSellingProductsByPeriod(any(LocalDateTime.class), any(LocalDateTime.class), anyInt()))
                .thenReturn(Collections.singletonList(new Object[]{1L, "Dog Food", 25L, BigDecimal.valueOf(500_000)}));
        when(orderRepository.getSlowMovingProducts(anyInt()))
                .thenReturn(Collections.singletonList(new Object[]{2L, "Cat Toy", null, 0L}));
        when(userRewardRepository.getTopUsersByRewardUnlockCount(any(PageRequest.class)))
                .thenReturn(Collections.singletonList(new Object[]{3L, "User A", 2L}));
        when(orderRepository.getTopCustomersBySpend(anyInt()))
                .thenReturn(Collections.singletonList(new Object[]{3L, "User A", BigDecimal.valueOf(2_000_000), 5L}));
        when(voucherUsageLogRepository.getVoucherImpact(any(LocalDateTime.class), any(LocalDateTime.class)))
                .thenReturn(new Object[]{10L, BigDecimal.valueOf(50_000), BigDecimal.valueOf(200_000)});

        BusinessReportDTO dto = reportingService.getBusinessReport(
                LocalDate.of(2026, 1, 1),
                LocalDate.of(2026, 1, 31),
                10
        );

        assertEquals(BigDecimal.valueOf(1_000_000), dto.getRevenueProfit().getGrossRevenue());
        assertEquals(BigDecimal.valueOf(300_000), dto.getRevenueProfit().getGrossProfit());
        assertEquals(33.3, dto.getRevenueProfit().getGrossMarginPercent());
        assertEquals(10L, dto.getVoucherImpact().getUsageCount());
        assertEquals("Dog Food", dto.getTopSellingProducts().get(0).getProductName());
    }
}
