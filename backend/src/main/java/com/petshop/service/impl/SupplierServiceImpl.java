package com.petshop.service.impl;

import com.petshop.dto.request.SupplierRequest;
import com.petshop.dto.response.SupplierDTO;
import com.petshop.entity.Supplier;
import com.petshop.exception.ResourceNotFoundException;
import com.petshop.repository.SupplierRepository;
import com.petshop.service.SupplierService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SupplierServiceImpl implements SupplierService {

    private final SupplierRepository supplierRepository;

    @Override
    @Transactional
    public SupplierDTO create(SupplierRequest request) {
        Supplier supplier = Supplier.builder()
                .code(generateCode())
                .name(request.getName())
                .contactPerson(request.getContactPerson())
                .phone(request.getPhone())
                .email(request.getEmail())
                .address(request.getAddress())
                .taxCode(request.getTaxCode())
                .notes(request.getNotes())
                .build();
        return mapToDTO(supplierRepository.save(supplier));
    }

    @Override
    @Transactional
    public SupplierDTO update(Long id, SupplierRequest request) {
        Supplier supplier = getEntity(id);
        supplier.setName(request.getName());
        supplier.setContactPerson(request.getContactPerson());
        supplier.setPhone(request.getPhone());
        supplier.setEmail(request.getEmail());
        supplier.setAddress(request.getAddress());
        supplier.setTaxCode(request.getTaxCode());
        supplier.setNotes(request.getNotes());
        return mapToDTO(supplierRepository.save(supplier));
    }

    @Override
    @Transactional
    public void delete(Long id) {
        supplierRepository.delete(getEntity(id));
    }

    @Override
    public SupplierDTO getById(Long id) {
        return mapToDTO(getEntity(id));
    }

    @Override
    public Page<SupplierDTO> getAll(String keyword, Pageable pageable) {
        return supplierRepository.search(keyword, pageable).map(this::mapToDTO);
    }

    @Override
    public List<SupplierDTO> getActive() {
        return supplierRepository.findByActiveIsTrue().stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public SupplierDTO toggleActive(Long id) {
        Supplier supplier = getEntity(id);
        supplier.setActive(!supplier.isActive());
        return mapToDTO(supplierRepository.save(supplier));
    }

    private Supplier getEntity(Long id) {
        return supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Nhà cung cấp không tồn tại"));
    }

    private String generateCode() {
        long count = supplierRepository.count() + 1;
        String code;
        do {
            code = String.format("SUP%04d", count++);
        } while (supplierRepository.existsByCode(code));
        return code;
    }

    private SupplierDTO mapToDTO(Supplier s) {
        return SupplierDTO.builder()
                .id(s.getId()).code(s.getCode()).name(s.getName())
                .contactPerson(s.getContactPerson()).phone(s.getPhone())
                .email(s.getEmail()).address(s.getAddress())
                .taxCode(s.getTaxCode()).notes(s.getNotes())
                .active(s.isActive())
                .createdAt(s.getCreatedAt()).updatedAt(s.getUpdatedAt())
                .build();
    }
}
