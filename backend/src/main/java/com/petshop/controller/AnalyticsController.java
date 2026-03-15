package com.petshop.controller;

import com.petshop.dto.response.AnalyticsDTO;
import com.petshop.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    /**
     * Lấy toàn bộ thống kê (30 ngày gần nhất)
     */
    @GetMapping
    public ResponseEntity<AnalyticsDTO> getFullAnalytics() {
        return ResponseEntity.ok(analyticsService.getFullAnalytics());
    }

    /**
     * Lấy toàn bộ thống kê theo khoảng thời gian
     */
    @GetMapping("/range")
    public ResponseEntity<AnalyticsDTO> getFullAnalyticsByRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(analyticsService.getFullAnalytics(startDate, endDate));
    }

    /**
     * 1. Thống kê theo loại hình dịch vụ
     */
    @GetMapping("/services")
    public ResponseEntity<AnalyticsDTO.ServiceAnalytics> getServiceAnalytics(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        if (startDate == null) startDate = LocalDate.now().minusDays(30);
        if (endDate == null) endDate = LocalDate.now();
        return ResponseEntity.ok(analyticsService.getServiceAnalytics(startDate, endDate));
    }

    /**
     * 2. Thống kê bán lẻ & kho hàng
     */
    @GetMapping("/inventory")
    public ResponseEntity<AnalyticsDTO.RetailInventoryAnalytics> getRetailInventoryAnalytics() {
        return ResponseEntity.ok(analyticsService.getRetailInventoryAnalytics());
    }

    /**
     * 3. Thống kê khách hàng đặc biệt (Pet Profiles)
     */
    @GetMapping("/pets")
    public ResponseEntity<AnalyticsDTO.PetProfileAnalytics> getPetProfileAnalytics() {
        return ResponseEntity.ok(analyticsService.getPetProfileAnalytics());
    }
}
