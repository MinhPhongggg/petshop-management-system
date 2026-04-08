package com.petshop.service;

import com.petshop.dto.request.SupplierRequest;
import com.petshop.dto.response.SupplierDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface SupplierService {
    SupplierDTO create(SupplierRequest request);
    SupplierDTO update(Long id, SupplierRequest request);
    void delete(Long id);
    SupplierDTO getById(Long id);
    Page<SupplierDTO> getAll(String keyword, Pageable pageable);
    List<SupplierDTO> getActive();
    SupplierDTO toggleActive(Long id);
}
