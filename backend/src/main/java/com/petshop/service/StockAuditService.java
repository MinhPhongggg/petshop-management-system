package com.petshop.service;

import com.petshop.dto.request.StockAuditRequest;
import com.petshop.dto.response.StockAuditDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface StockAuditService {
    StockAuditDTO create(StockAuditRequest request);
    StockAuditDTO getById(Long id);
    Page<StockAuditDTO> getAll(Pageable pageable);
    StockAuditDTO startAudit(Long id);
    StockAuditDTO updateCounts(Long id, StockAuditRequest request);
    StockAuditDTO complete(Long id);
    StockAuditDTO cancel(Long id);
    void delete(Long id);
}
