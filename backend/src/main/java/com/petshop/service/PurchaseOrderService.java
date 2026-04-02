package com.petshop.service;

import com.petshop.dto.request.PurchaseOrderRequest;
import com.petshop.dto.response.PurchaseOrderDTO;
import com.petshop.entity.PurchaseOrder;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface PurchaseOrderService {
    PurchaseOrderDTO create(PurchaseOrderRequest request);
    PurchaseOrderDTO update(Long id, PurchaseOrderRequest request);
    PurchaseOrderDTO getById(Long id);
    Page<PurchaseOrderDTO> getAll(Pageable pageable);
    Page<PurchaseOrderDTO> getByStatus(PurchaseOrder.Status status, Pageable pageable);
    PurchaseOrderDTO submit(Long id);
    PurchaseOrderDTO approve(Long id);
    PurchaseOrderDTO receive(Long id);
    PurchaseOrderDTO cancel(Long id);
    void delete(Long id);
}
