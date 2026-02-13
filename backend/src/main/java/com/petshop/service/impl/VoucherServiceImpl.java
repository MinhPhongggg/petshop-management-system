package com.petshop.service.impl;

import com.petshop.dto.request.VoucherRequest;
import com.petshop.dto.response.VoucherDTO;
import com.petshop.entity.Voucher;
import com.petshop.exception.BadRequestException;
import com.petshop.exception.ResourceNotFoundException;
import com.petshop.repository.VoucherRepository;
import com.petshop.service.VoucherService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VoucherServiceImpl implements VoucherService {
    
    private final VoucherRepository voucherRepository;
    
    @Override
    @Transactional
    public VoucherDTO createVoucher(VoucherRequest request) {
        if (voucherRepository.existsByCode(request.getCode())) {
            throw new BadRequestException("Mã voucher đã tồn tại");
        }
        
        Voucher voucher = Voucher.builder()
            .code(request.getCode().toUpperCase())
            .description(request.getDescription())
            .discountType(request.getDiscountType())
            .discountValue(request.getDiscountValue())
            .maxDiscount(request.getMaxDiscount())
            .minOrderAmount(request.getMinOrderAmount() != null ? 
                request.getMinOrderAmount() : BigDecimal.ZERO)
            .usageLimit(request.getUsageLimit())
            .usageLimitPerUser(request.getUsageLimitPerUser())
            .startDate(request.getStartDate())
            .endDate(request.getEndDate())
            .applyTo(request.getApplyTo())
            .active(request.getActive() != null ? request.getActive() : true)
            .build();
        
        voucher = voucherRepository.save(voucher);
        return mapToDTO(voucher);
    }
    
    @Override
    @Transactional
    public VoucherDTO updateVoucher(Long id, VoucherRequest request) {
        Voucher voucher = voucherRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Voucher không tồn tại"));
        
        if (!voucher.getCode().equals(request.getCode().toUpperCase()) && 
            voucherRepository.existsByCode(request.getCode())) {
            throw new BadRequestException("Mã voucher đã tồn tại");
        }
        
        voucher.setCode(request.getCode().toUpperCase());
        voucher.setDescription(request.getDescription());
        voucher.setDiscountType(request.getDiscountType());
        voucher.setDiscountValue(request.getDiscountValue());
        voucher.setMaxDiscount(request.getMaxDiscount());
        voucher.setMinOrderAmount(request.getMinOrderAmount());
        voucher.setUsageLimit(request.getUsageLimit());
        voucher.setUsageLimitPerUser(request.getUsageLimitPerUser());
        voucher.setStartDate(request.getStartDate());
        voucher.setEndDate(request.getEndDate());
        voucher.setApplyTo(request.getApplyTo());
        if (request.getActive() != null) {
            voucher.setActive(request.getActive());
        }
        
        voucher = voucherRepository.save(voucher);
        return mapToDTO(voucher);
    }
    
    @Override
    @Transactional
    public void deleteVoucher(Long id) {
        Voucher voucher = voucherRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Voucher không tồn tại"));
        
        // Soft delete
        voucher.setActive(false);
        voucherRepository.save(voucher);
    }
    
    @Override
    public VoucherDTO getVoucherById(Long id) {
        Voucher voucher = voucherRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Voucher không tồn tại"));
        return mapToDTO(voucher);
    }
    
    @Override
    public VoucherDTO getVoucherByCode(String code) {
        Voucher voucher = voucherRepository.findByCode(code.toUpperCase())
            .orElseThrow(() -> new ResourceNotFoundException("Voucher không tồn tại"));
        return mapToDTO(voucher);
    }
    
    @Override
    public BigDecimal applyVoucher(String code, BigDecimal orderAmount) {
        Voucher voucher = voucherRepository.findByCode(code.toUpperCase())
            .orElseThrow(() -> new BadRequestException("Voucher không tồn tại"));
        
        // Validate using helper method
        if (!voucher.isValid()) {
            throw new BadRequestException("Voucher không hợp lệ hoặc đã hết hạn");
        }
        
        // Calculate and return discount using helper method
        return voucher.calculateDiscount(orderAmount);
    }
    
    @Override
    public List<VoucherDTO> getActiveVouchers() {
        LocalDateTime now = LocalDateTime.now();
        return voucherRepository.findActiveVouchers(now).stream()
            .map(this::mapToDTO)
            .collect(Collectors.toList());
    }
    
    @Override
    public Page<VoucherDTO> getAllVouchers(Pageable pageable) {
        return voucherRepository.findAll(pageable).map(this::mapToDTO);
    }
    
    private VoucherDTO mapToDTO(Voucher voucher) {
        Integer remainingUsage = null;
        if (voucher.getUsageLimit() != null) {
            remainingUsage = voucher.getUsageLimit() - voucher.getUsedCount();
        }
        
        return VoucherDTO.builder()
            .id(voucher.getId())
            .code(voucher.getCode())
            .description(voucher.getDescription())
            .discountType(voucher.getDiscountType())
            .discountValue(voucher.getDiscountValue())
            .maxDiscount(voucher.getMaxDiscount())
            .minOrderAmount(voucher.getMinOrderAmount())
            .usageLimit(voucher.getUsageLimit())
            .usedCount(voucher.getUsedCount())
            .usageLimitPerUser(voucher.getUsageLimitPerUser())
            .remainingUsage(remainingUsage)
            .startDate(voucher.getStartDate())
            .endDate(voucher.getEndDate())
            .applyTo(voucher.getApplyTo())
            .active(voucher.getActive())
            .isValid(voucher.isValid())
            .createdAt(voucher.getCreatedAt())
            .build();
    }
}
