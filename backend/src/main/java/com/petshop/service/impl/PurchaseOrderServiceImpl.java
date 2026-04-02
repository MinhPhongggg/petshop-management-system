package com.petshop.service.impl;

import com.petshop.dto.request.PurchaseOrderRequest;
import com.petshop.dto.response.PurchaseOrderDTO;
import com.petshop.entity.*;
import com.petshop.exception.BadRequestException;
import com.petshop.exception.ResourceNotFoundException;
import com.petshop.repository.*;
import com.petshop.security.UserPrincipal;
import com.petshop.service.PurchaseOrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PurchaseOrderServiceImpl implements PurchaseOrderService {

    private final PurchaseOrderRepository poRepository;
    private final SupplierRepository supplierRepository;
    private final ProductVariantRepository variantRepository;
    private final StockMovementRepository stockMovementRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public PurchaseOrderDTO create(PurchaseOrderRequest request) {
        Supplier supplier = supplierRepository.findById(request.getSupplierId())
                .orElseThrow(() -> new ResourceNotFoundException("Nhà cung cấp không tồn tại"));

        PurchaseOrder po = PurchaseOrder.builder()
                .code(generateCode())
                .supplier(supplier)
                .note(request.getNote())
                .createdBy(getCurrentUser())
                .items(new ArrayList<>())
                .build();

        po = poRepository.save(po);

        if (request.getItems() != null) {
            for (var itemReq : request.getItems()) {
                ProductVariant variant = variantRepository.findById(itemReq.getVariantId())
                        .orElseThrow(() -> new ResourceNotFoundException("Biến thể sản phẩm không tồn tại"));
                PurchaseOrderItem item = PurchaseOrderItem.builder()
                        .purchaseOrder(po)
                        .variant(variant)
                        .quantity(itemReq.getQuantity())
                        .unitPrice(itemReq.getUnitPrice())
                        .subtotal(itemReq.getUnitPrice().multiply(java.math.BigDecimal.valueOf(itemReq.getQuantity())))
                        .build();
                po.getItems().add(item);
            }
        }
        po.recalculateTotal();
        return mapToDTO(poRepository.save(po));
    }

    @Override
    @Transactional
    public PurchaseOrderDTO update(Long id, PurchaseOrderRequest request) {
        PurchaseOrder po = getEntity(id);
        if (po.getStatus() != PurchaseOrder.Status.DRAFT) {
            throw new BadRequestException("Chỉ có thể sửa phiếu ở trạng thái Nháp");
        }

        Supplier supplier = supplierRepository.findById(request.getSupplierId())
                .orElseThrow(() -> new ResourceNotFoundException("Nhà cung cấp không tồn tại"));
        po.setSupplier(supplier);
        po.setNote(request.getNote());
        po.getItems().clear();

        if (request.getItems() != null) {
            for (var itemReq : request.getItems()) {
                ProductVariant variant = variantRepository.findById(itemReq.getVariantId())
                        .orElseThrow(() -> new ResourceNotFoundException("Biến thể không tồn tại"));
                po.getItems().add(PurchaseOrderItem.builder()
                        .purchaseOrder(po)
                        .variant(variant)
                        .quantity(itemReq.getQuantity())
                        .unitPrice(itemReq.getUnitPrice())
                        .subtotal(itemReq.getUnitPrice().multiply(java.math.BigDecimal.valueOf(itemReq.getQuantity())))
                        .build());
            }
        }
        po.recalculateTotal();
        return mapToDTO(poRepository.save(po));
    }

    @Override
    public PurchaseOrderDTO getById(Long id) { return mapToDTO(getEntity(id)); }

    @Override
    public Page<PurchaseOrderDTO> getAll(Pageable pageable) {
        return poRepository.findAllByOrderByCreatedAtDesc(pageable).map(this::mapToDTO);
    }

    @Override
    public Page<PurchaseOrderDTO> getByStatus(PurchaseOrder.Status status, Pageable pageable) {
        return poRepository.findByStatusOrderByCreatedAtDesc(status, pageable).map(this::mapToDTO);
    }

    @Override
    @Transactional
    public PurchaseOrderDTO submit(Long id) {
        PurchaseOrder po = getEntity(id);
        if (po.getStatus() != PurchaseOrder.Status.DRAFT) throw new BadRequestException("Chỉ phiếu Nháp mới gửi duyệt được");
        if (po.getItems().isEmpty()) throw new BadRequestException("Phiếu nhập phải có ít nhất 1 sản phẩm");
        po.setStatus(PurchaseOrder.Status.PENDING);
        return mapToDTO(poRepository.save(po));
    }

    @Override
    @Transactional
    public PurchaseOrderDTO approve(Long id) {
        PurchaseOrder po = getEntity(id);
        if (po.getStatus() != PurchaseOrder.Status.PENDING) throw new BadRequestException("Chỉ phiếu Chờ duyệt mới duyệt được");
        po.setStatus(PurchaseOrder.Status.APPROVED);
        po.setApprovedBy(getCurrentUser());
        po.setApprovedAt(LocalDateTime.now());
        return mapToDTO(poRepository.save(po));
    }

    @Override
    @Transactional
    public PurchaseOrderDTO receive(Long id) {
        PurchaseOrder po = getEntity(id);
        if (po.getStatus() != PurchaseOrder.Status.APPROVED) throw new BadRequestException("Chỉ phiếu Đã duyệt mới nhận hàng được");

        User currentUser = getCurrentUser();
        po.setStatus(PurchaseOrder.Status.RECEIVED);
        po.setReceivedBy(currentUser);
        po.setReceivedAt(LocalDateTime.now());

        for (PurchaseOrderItem item : po.getItems()) {
            ProductVariant variant = item.getVariant();
            int prevStock = variant.getStock();
            int addedQty = item.getQuantity();
            int newStock = prevStock + addedQty;

            // Weighted-average cost update
            BigDecimal currentAvg = variant.getAverageCost() != null ? variant.getAverageCost() : BigDecimal.ZERO;
            BigDecimal previousTotalCost = currentAvg.multiply(BigDecimal.valueOf(Math.max(prevStock, 0)));
            BigDecimal importTotalCost = item.getUnitPrice().multiply(BigDecimal.valueOf(addedQty));
            BigDecimal newAvgCost = previousTotalCost.add(importTotalCost)
                    .divide(BigDecimal.valueOf(Math.max(newStock, 1)), 2, RoundingMode.HALF_UP);

            variant.setStock(newStock);
            variant.setLastImportPrice(item.getUnitPrice());
            variant.setAverageCost(newAvgCost);
            variantRepository.save(variant);
            item.setReceivedQuantity(addedQty);

            stockMovementRepository.save(StockMovement.builder()
                    .variant(variant)
                    .movementType(StockMovement.MovementType.IMPORT)
                    .quantity(addedQty)
                    .quantityBefore(prevStock)
                    .quantityAfter(newStock)
                    .unitCost(newAvgCost)
                    .referenceType("PURCHASE_ORDER")
                    .referenceCode(po.getCode())
                    .note("Nhập kho từ phiếu " + po.getCode() + " - NCC: " + po.getSupplier().getName())
                    .createdBy(currentUser)
                    .build());
        }
        return mapToDTO(poRepository.save(po));
    }

    @Override
    @Transactional
    public PurchaseOrderDTO cancel(Long id) {
        PurchaseOrder po = getEntity(id);
        if (po.getStatus() == PurchaseOrder.Status.RECEIVED || po.getStatus() == PurchaseOrder.Status.CANCELLED) {
            throw new BadRequestException("Không thể hủy phiếu này");
        }
        po.setStatus(PurchaseOrder.Status.CANCELLED);
        return mapToDTO(poRepository.save(po));
    }

    @Override
    @Transactional
    public void delete(Long id) {
        PurchaseOrder po = getEntity(id);
        if (po.getStatus() != PurchaseOrder.Status.DRAFT && po.getStatus() != PurchaseOrder.Status.CANCELLED) {
            throw new BadRequestException("Chỉ xóa phiếu Nháp hoặc Đã hủy");
        }
        poRepository.delete(po);
    }

    private PurchaseOrder getEntity(Long id) {
        return poRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Phiếu nhập kho không tồn tại"));
    }

    private String generateCode() {
        String date = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        return "PO-" + date + "-" + UUID.randomUUID().toString().substring(0, 4).toUpperCase();
    }

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        UserPrincipal principal = (UserPrincipal) auth.getPrincipal();
        return userRepository.findById(principal.getId()).orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private PurchaseOrderDTO mapToDTO(PurchaseOrder po) {
        return PurchaseOrderDTO.builder()
                .id(po.getId()).code(po.getCode())
                .supplierId(po.getSupplier().getId())
                .supplierName(po.getSupplier().getName())
                .status(po.getStatus())
                .items(po.getItems().stream().map(i -> PurchaseOrderDTO.ItemDTO.builder()
                        .id(i.getId())
                        .variantId(i.getVariant().getId())
                        .productName(i.getVariant().getProduct().getName())
                        .variantName(i.getVariant().getName())
                        .sku(i.getVariant().getSku())
                        .quantity(i.getQuantity())
                        .unitPrice(i.getUnitPrice())
                        .receivedQuantity(i.getReceivedQuantity())
                        .subtotal(i.getSubtotal())
                        .build()).collect(Collectors.toList()))
                .totalAmount(po.getTotalAmount())
                .note(po.getNote())
                .createdByName(po.getCreatedBy() != null ? po.getCreatedBy().getFullName() : null)
                .approvedByName(po.getApprovedBy() != null ? po.getApprovedBy().getFullName() : null)
                .approvedAt(po.getApprovedAt())
                .receivedByName(po.getReceivedBy() != null ? po.getReceivedBy().getFullName() : null)
                .receivedAt(po.getReceivedAt())
                .createdAt(po.getCreatedAt())
                .build();
    }
}
