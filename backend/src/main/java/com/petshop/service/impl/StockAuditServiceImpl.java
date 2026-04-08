package com.petshop.service.impl;

import com.petshop.dto.request.StockAuditRequest;
import com.petshop.dto.response.StockAuditDTO;
import com.petshop.entity.*;
import com.petshop.exception.BadRequestException;
import com.petshop.exception.ResourceNotFoundException;
import com.petshop.repository.*;
import com.petshop.security.UserPrincipal;
import com.petshop.service.StockAuditService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StockAuditServiceImpl implements StockAuditService {

    private final StockAuditRepository auditRepository;
    private final ProductVariantRepository variantRepository;
    private final StockMovementRepository stockMovementRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public StockAuditDTO create(StockAuditRequest request) {
        StockAudit audit = StockAudit.builder()
                .code(generateCode())
                .note(request.getNote())
                .createdBy(getCurrentUser())
                .items(new ArrayList<>())
                .build();
        audit = auditRepository.save(audit);

        if (request.getItems() != null) {
            for (var itemReq : request.getItems()) {
                ProductVariant variant = variantRepository.findById(itemReq.getVariantId())
                        .orElseThrow(() -> new ResourceNotFoundException("Biến thể không tồn tại"));
                audit.getItems().add(StockAuditItem.builder()
                        .stockAudit(audit)
                        .variant(variant)
                        .systemQuantity(variant.getStock())
                        .note(itemReq.getNote())
                        .build());
            }
        }
        return mapToDTO(auditRepository.save(audit));
    }

    @Override
    public StockAuditDTO getById(Long id) { return mapToDTO(getEntity(id)); }

    @Override
    public Page<StockAuditDTO> getAll(Pageable pageable) {
        return auditRepository.findAllByOrderByCreatedAtDesc(pageable).map(this::mapToDTO);
    }

    @Override
    @Transactional
    public StockAuditDTO startAudit(Long id) {
        StockAudit audit = getEntity(id);
        if (audit.getStatus() != StockAudit.Status.DRAFT) throw new BadRequestException("Chỉ phiếu Nháp mới bắt đầu kiểm kê được");
        audit.setStatus(StockAudit.Status.IN_PROGRESS);
        // Refresh system quantities
        for (StockAuditItem item : audit.getItems()) {
            item.setSystemQuantity(item.getVariant().getStock());
        }
        return mapToDTO(auditRepository.save(audit));
    }

    @Override
    @Transactional
    public StockAuditDTO updateCounts(Long id, StockAuditRequest request) {
        StockAudit audit = getEntity(id);
        if (audit.getStatus() != StockAudit.Status.IN_PROGRESS) throw new BadRequestException("Phiếu phải đang kiểm kê");

        Map<Long, StockAuditItem> itemMap = audit.getItems().stream()
                .collect(Collectors.toMap(i -> i.getVariant().getId(), i -> i));

        if (request.getItems() != null) {
            for (var itemReq : request.getItems()) {
                StockAuditItem item = itemMap.get(itemReq.getVariantId());
                if (item != null && itemReq.getActualQuantity() != null) {
                    item.setActualQuantity(itemReq.getActualQuantity());
                    item.setDifference(itemReq.getActualQuantity() - item.getSystemQuantity());
                    if (itemReq.getNote() != null) item.setNote(itemReq.getNote());
                }
            }
        }
        return mapToDTO(auditRepository.save(audit));
    }

    @Override
    @Transactional
    public StockAuditDTO complete(Long id) {
        StockAudit audit = getEntity(id);
        if (audit.getStatus() != StockAudit.Status.IN_PROGRESS) throw new BadRequestException("Phiếu phải đang kiểm kê");

        User user = getCurrentUser();
        audit.setStatus(StockAudit.Status.COMPLETED);
        audit.setCompletedBy(user);
        audit.setCompletedAt(LocalDateTime.now());

        for (StockAuditItem item : audit.getItems()) {
            if (item.getActualQuantity() != null && item.getDifference() != 0) {
                ProductVariant variant = item.getVariant();
                int prevStock = variant.getStock();
                int newStock = item.getActualQuantity();
                variant.setStock(newStock);
                variantRepository.save(variant);

                stockMovementRepository.save(StockMovement.builder()
                        .variant(variant)
                        .movementType(item.getDifference() > 0 ? StockMovement.MovementType.ADJUST_IN : StockMovement.MovementType.ADJUST_OUT)
                        .quantity(item.getDifference())
                        .quantityBefore(prevStock)
                        .quantityAfter(newStock)
                        .unitCost(variant.getAverageCost())
                        .referenceType("STOCK_AUDIT")
                        .referenceCode(audit.getCode())
                        .note("Kiểm kê " + audit.getCode() + (item.getNote() != null ? " - " + item.getNote() : ""))
                        .createdBy(user)
                        .build());
            }
        }
        return mapToDTO(auditRepository.save(audit));
    }

    @Override
    @Transactional
    public StockAuditDTO cancel(Long id) {
        StockAudit audit = getEntity(id);
        if (audit.getStatus() == StockAudit.Status.COMPLETED) throw new BadRequestException("Không thể hủy phiếu đã hoàn tất");
        audit.setStatus(StockAudit.Status.CANCELLED);
        return mapToDTO(auditRepository.save(audit));
    }

    @Override
    @Transactional
    public void delete(Long id) {
        StockAudit audit = getEntity(id);
        if (audit.getStatus() != StockAudit.Status.DRAFT && audit.getStatus() != StockAudit.Status.CANCELLED) {
            throw new BadRequestException("Chỉ xóa phiếu Nháp hoặc Đã hủy");
        }
        auditRepository.delete(audit);
    }

    private StockAudit getEntity(Long id) {
        return auditRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Phiếu kiểm kê không tồn tại"));
    }

    private String generateCode() {
        String date = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        return "SA-" + date + "-" + UUID.randomUUID().toString().substring(0, 4).toUpperCase();
    }

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        UserPrincipal principal = (UserPrincipal) auth.getPrincipal();
        return userRepository.findById(principal.getId()).orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private StockAuditDTO mapToDTO(StockAudit a) {
        var items = a.getItems().stream().map(i -> StockAuditDTO.ItemDTO.builder()
                .id(i.getId())
                .variantId(i.getVariant().getId())
                .productName(i.getVariant().getProduct().getName())
                .variantName(i.getVariant().getName())
                .sku(i.getVariant().getSku())
                .systemQuantity(i.getSystemQuantity())
                .actualQuantity(i.getActualQuantity())
                .difference(i.getDifference())
                .note(i.getNote())
                .build()).collect(Collectors.toList());
        return StockAuditDTO.builder()
                .id(a.getId()).code(a.getCode()).status(a.getStatus())
                .note(a.getNote())
                .createdByName(a.getCreatedBy() != null ? a.getCreatedBy().getFullName() : null)
                .completedByName(a.getCompletedBy() != null ? a.getCompletedBy().getFullName() : null)
                .completedAt(a.getCompletedAt()).createdAt(a.getCreatedAt())
                .totalItems(items.size())
                .diffItems((int) items.stream().filter(i -> i.getDifference() != 0).count())
                .items(items)
                .build();
    }
}
