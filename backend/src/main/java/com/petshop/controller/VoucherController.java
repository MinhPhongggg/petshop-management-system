package com.petshop.controller;

import com.petshop.dto.request.VoucherRequest;
import com.petshop.dto.response.VoucherDTO;
import com.petshop.service.VoucherService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/vouchers")
@RequiredArgsConstructor
public class VoucherController {
    
    private final VoucherService voucherService;
    
    // Public/Customer endpoints
    @GetMapping("/active")
    public ResponseEntity<List<VoucherDTO>> getActiveVouchers() {
        return ResponseEntity.ok(voucherService.getActiveVouchers());
    }
    
    @GetMapping("/code/{code}")
    public ResponseEntity<VoucherDTO> getVoucherByCode(@PathVariable String code) {
        return ResponseEntity.ok(voucherService.getVoucherByCode(code));
    }
    
    @PostMapping("/apply")
    public ResponseEntity<Map<String, BigDecimal>> applyVoucher(
            @RequestParam String code,
            @RequestParam BigDecimal orderAmount) {
        BigDecimal discount = voucherService.applyVoucher(code, orderAmount);
        return ResponseEntity.ok(Map.of("discount", discount));
    }
    
    // Admin endpoints
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<VoucherDTO>> getAllVouchers(
            @PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(voucherService.getAllVouchers(pageable));
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<VoucherDTO> getVoucherById(@PathVariable Long id) {
        return ResponseEntity.ok(voucherService.getVoucherById(id));
    }
    
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<VoucherDTO> createVoucher(@Valid @RequestBody VoucherRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(voucherService.createVoucher(request));
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<VoucherDTO> updateVoucher(@PathVariable Long id, 
                                                     @Valid @RequestBody VoucherRequest request) {
        return ResponseEntity.ok(voucherService.updateVoucher(id, request));
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteVoucher(@PathVariable Long id) {
        voucherService.deleteVoucher(id);
        return ResponseEntity.noContent().build();
    }
}
