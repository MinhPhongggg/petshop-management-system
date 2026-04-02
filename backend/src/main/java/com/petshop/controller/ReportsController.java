package com.petshop.controller;

import com.petshop.dto.response.BusinessReportDTO;
import com.petshop.repository.OrderRepository;
import com.petshop.service.ReportingService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
public class ReportsController {

    private final ReportingService reportingService;
    private final OrderRepository orderRepository;

    @GetMapping("/business")
    public ResponseEntity<BusinessReportDTO> getBusinessReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false, defaultValue = "10") Integer topLimit
    ) {
        return ResponseEntity.ok(reportingService.getBusinessReport(startDate, endDate, topLimit));
    }

    @GetMapping("/business/export/excel")
    public ResponseEntity<byte[]> exportExcel(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false, defaultValue = "10") Integer topLimit
    ) {
        byte[] data = reportingService.exportBusinessReportExcel(startDate, endDate, topLimit);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=business_report.xlsx")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(data);
    }

    @GetMapping("/business/export/pdf")
    public ResponseEntity<byte[]> exportPdf(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false, defaultValue = "10") Integer topLimit
    ) {
        byte[] data = reportingService.exportBusinessReportPdf(startDate, endDate, topLimit);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=business_report.pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(data);
    }

    @GetMapping("/business/drilldown/orders")
    public ResponseEntity<List<Map<String, Object>>> drilldownOrders(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
    ) {
        var rows = orderRepository.getCompletedOrdersForDrilldown(startDate.atStartOfDay(), endDate.atTime(23, 59, 59));
        List<Map<String, Object>> payload = rows.stream().map(r -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", ((Number) r[0]).longValue());
            m.put("orderCode", r[1]);
            m.put("totalAmount", r[2]);
            m.put("discountAmount", r[3]);
            m.put("createdAt", r[4]);
            return m;
        }).toList();
        return ResponseEntity.ok(payload);
    }
}
