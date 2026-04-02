package com.petshop.controller;

import com.petshop.dto.request.StockAuditRequest;
import com.petshop.dto.response.StockAuditDTO;
import com.petshop.service.StockAuditService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/stock-audits")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
public class StockAuditController {

    private final StockAuditService service;

    @GetMapping
    public ResponseEntity<Page<StockAuditDTO>> getAll(
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(service.getAll(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<StockAuditDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @PostMapping
    public ResponseEntity<StockAuditDTO> create(@RequestBody StockAuditRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(request));
    }

    @PostMapping("/{id}/start")
    public ResponseEntity<StockAuditDTO> start(@PathVariable Long id) {
        return ResponseEntity.ok(service.startAudit(id));
    }

    @PutMapping("/{id}/counts")
    public ResponseEntity<StockAuditDTO> updateCounts(@PathVariable Long id, @RequestBody StockAuditRequest request) {
        return ResponseEntity.ok(service.updateCounts(id, request));
    }

    @PostMapping("/{id}/complete")
    public ResponseEntity<StockAuditDTO> complete(@PathVariable Long id) {
        return ResponseEntity.ok(service.complete(id));
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<StockAuditDTO> cancel(@PathVariable Long id) {
        return ResponseEntity.ok(service.cancel(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
